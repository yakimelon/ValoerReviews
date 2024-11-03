import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import * as oauth from "https://raw.githubusercontent.com/snsinfu/deno-oauth-1.0a/main/extra/mod.ts";

// 環境変数からAPIキーとトークンを取得
const apiKey = Deno.env.get("X_API_KEY")!;
const apiSecretKey = Deno.env.get("X_API_SECRET_KEY")!;
const accessToken = Deno.env.get("X_ACCESS_TOKEN")!;
const accessTokenSecret = Deno.env.get("X_ACCESS_TOKEN_SECRET")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const res = await postTweet("Hello, Twitter API!");
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


