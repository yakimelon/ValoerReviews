![Reviewant](https://i.gyazo.com/07258026dd555df91524629538086396.png)

## Reviewant

野良の VALORANT プレイヤーのレビューをするサイト。  
良いとこも悪いとこも伝え合って、日本人の VALORANT プレイヤーのレベルアップを目指す。

https://reviewant.games/  
https://twitter.com/valoer_reviews

## 開発

```bash
$ npx supabase start
$ npx supabase functions serve --env-file ./supabase/.env.local
```

## デプロイ

```bash
$ npx supabase functions deploy valorant --no-verify-jwt
$ npx supabase secrets set --env-file ./supabase/.env
```

## ライセンス

[MIT](http://TomoakiTANAKA.mit-license.org)