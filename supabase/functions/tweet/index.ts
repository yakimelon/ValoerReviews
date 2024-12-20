import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import * as oauth from "https://raw.githubusercontent.com/snsinfu/deno-oauth-1.0a/main/extra/mod.ts";
import * as openai from "https://deno.land/x/openai/mod.ts";

// 環境変数からAPIキーとトークンを取得
const apiKey = Deno.env.get("X_API_KEY")!;
const apiSecretKey = Deno.env.get("X_API_SECRET_KEY")!;
const accessToken = Deno.env.get("X_ACCESS_TOKEN")!;
const accessTokenSecret = Deno.env.get("X_ACCESS_TOKEN_SECRET")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
}

const initPrompt = 'あなたはバズを連続でヒットさせる有名SNSマーケターです。VALORANTプレイヤーをレビューするサイト、Reviewant の運営を任されており、以下のレビューの感想をツイート用に適切な短いメッセージを作成してください。投稿の目的は「Reviewantへのアクセスを伸ばす」ことです。作成した感想文章は以下の文章の先頭に加えて、レビューと共にツイートされますので、出力は「感想文章のみ」としてかぎ括弧などの装飾も不要、言葉だけをそのまま出力してください。また、言い回しとしては一般的ツイッター民のぼやきみたいな雰囲気が出るとベストです、作り物っぽくなくより一般人っぽいツイートを心がけてください。'

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { text } = await req.json();
  const message = await getOpenAIMessage(text);
  const res = await postTweet(`${message}\n\n${text}`);
  console.log(res);
  return new Response(JSON.stringify(res), { headers: { "Access-Control-Allow-Origin": "*" } });
});

async function postTweet(text: string) {
  const api = new oauth.Api({
    prefix: "https://api.twitter.com/2",
    consumer: { key: apiKey, secret: apiSecretKey },
    signature: oauth.HMAC_SHA1,
  });

  return await api.request("POST", "/tweets", {
    token: { key: accessToken, secret: accessTokenSecret },
    json: { book: "c3c24bab", score: 5 },
    json: { text: text },
    hashBody: true,
  });
}

// OpenAI APIからメッセージを取得する関数
async function getOpenAIMessage(text: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          "role": "system",
          "content": initPrompt,
        },
        {
          "role": "user",
          "content": `${text}`,
        }
      ],
      max_tokens: 50
    })
  });
  const data = await response.json();
  console.log(data)
  return data.choices[0].message.content.trim();
}