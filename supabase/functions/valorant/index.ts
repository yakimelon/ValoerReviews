import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const url = new URL(req.url);
  const params = url.searchParams;

  const region = 'ap'
  const name = params.get("name");
  const tag = params.get("tag");

  const endpoint = `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}`;
  const token = Deno.env.get("API_KEY");

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Authorization": `${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  // TODO: redかblueかは固定されていない
  const metadata = data.data.map((item: any) => {
    return {
      metadata: {
        match_id: item.metadata.matchid,
        my_agent: getAgentByTeam(item.players.all_players, name, tag),
        my_agent_image: item.players.all_players.find((player: any) => player.name === name && player.tag === tag).assets.agent.small,
        mode: item.metadata.mode,
        timestamp: item.metadata.game_start,
        map: item.metadata.map,
        my_team_round: getRoundScore(item.players.all_players, item.teams, 'my', name, tag),
        enemy_team_round: getRoundScore(item.players.all_players, item.teams, 'enemy', name, tag),
        kill: getMyStat(item.players.all_players, "kills", name, tag),
        death: getMyStat(item.players.all_players, "deaths", name, tag),
        assist: getMyStat(item.players.all_players, "assists", name, tag),
      },
      players: item.players.all_players.map((player: any) => {
        return {
          name: player.name,
          tag: player.tag,
          playerName: `${player.name}#${player.tag}`,
          agent: player.character,
          agent_image: player.assets.agent.small,
          rank: player.currenttier,
          team: player.team,
          kills: player.stats.kills,
          deaths: player.stats.deaths,
          assists: player.stats.assists,
        }
      }),
    }
  });

  return new Response(
    JSON.stringify(metadata),
    { headers: { "Content-Type": "application/json", ...corsHeaders, } },
  )
})

function getRoundScore(players: any, teams: any, target: string, name: string, tag: string) {
  const myTeam = players.find(player => player.name === name && player.tag === tag).team;
  if (target === 'my') {
    return myTeam === 'Red' ? teams.red.rounds_won : teams.blue.rounds_won;
  } else {
    return myTeam === 'Red' ? teams.blue.rounds_won : teams.red.rounds_won;
  }
}

function getAgentByTeam(players: any, name: string, tag: string) {
  const myPlayer = players.find(player => player.name === name && player.tag === tag);
  return myPlayer ? myPlayer.character : 'Unknown';
}

const getMyStat = (players: any, stat: string, name: string, tag: string) => {
  const myPlayer = players.find(player => player.name === name && player.tag === tag);
  return myPlayer ? myPlayer.stats[stat] : 0;
}
