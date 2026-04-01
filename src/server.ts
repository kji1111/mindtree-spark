import type { IncomingMessage, ServerResponse } from "http";

function getApiKey() {
  return process.env.ZAI_API_KEY || "";
}

function getApiBaseUrl() {
  return process.env.ZAI_API_BASE_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions";
}

const SYSTEM_PROMPT = `당신은 마인드맵 구조 분석 전문가입니다.
주어진 마인드맵의 카테고리 구조와 게시물 정보를 바탕으로, 새 게시물의 최적 위치를 분석합니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
{
  "suggestedParentId": "추천할 카테고리 ID (없으면 null)",
  "suggestedNewCategories": ["새로 생성을 추천하는 카테고리 이름 목록"],
  "suggestedSiblings": ["함께 볼 만한 기존 게시물 ID 목록"],
  "reasoning": "추천 이유를 한국어로 설명",
  "confidence": 0.8
}`;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function extractJson(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];
  return text;
}

export async function analysisMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== "POST") {
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "ZAI_API_KEY가 설정되지 않았습니다." }));
    return;
  }

  try {
    const body = await readBody(req);
    const { postTitle, postContent, mindmapContext } = JSON.parse(body);

    const userMessage = `## 마인드맵 현재 구조
카테고리: ${JSON.stringify(mindmapContext.categories, null, 2)}
기존 게시물: ${JSON.stringify(mindmapContext.existingPosts, null, 2)}

## 분석할 새 게시물
제목: ${postTitle}
내용: ${postContent}

이 게시물을 어느 카테고리에 배치하는 것이 가장 적절한지 분석해주세요.`;

    const apiResponse = await fetch(getApiBaseUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: "glm-4.5-air",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("ZAI API error:", apiResponse.status, errorText);
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ error: `ZAI API 오류: ${apiResponse.status}` }),
      );
      return;
    }

    const apiData = await apiResponse.json();
    const content = apiData.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(extractJson(content));

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(parsed));
  } catch (error) {
    console.error("Analysis middleware error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : "분석 중 오류 발생",
      }),
    );
  }
}

export function serverPlugin() {
  return {
    name: "analysis-server-plugin",
    configureServer(server: {
      middlewares: {
        use: (
          path: string,
          handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void,
        ) => void;
      };
    }) {
      server.middlewares.use("/api/analyze", (req, res, next) => {
        analysisMiddleware(req, res).then(() => {
          if (!res.writableEnded) next();
        });
      });
    },
  };
}
