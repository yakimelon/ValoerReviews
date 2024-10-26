import React, {useEffect} from 'react';
import { useRouter } from 'next/router';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLightbulb} from "@fortawesome/free-solid-svg-icons";
import {supabase} from "@/lib/supabaseClient"; // ここを追加

const MatchList = ({ matches }) => {
    const router = useRouter();

    return (
        <div className="container mx-auto p-6">
            <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:underline mb-4"
            >
                &lt; TOPに戻る
            </button>

            <p>
                <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                マッチが表示されませんか？RIOT IDを
                <button
                    onClick={() => router.push('/change_username')}
                    className="text-blue-400 hover:underline mb-4"
                >
                    編集
                </button>
                してください。
            </p>

            <br/>

            <h1 className="text-2xl font-bold mb-4">直近のマッチ一覧</h1>
            <table className="min-w-full">
                <thead>
                <tr className="bg-gray-800 text-white text-left">
                    <th className="px-4 py-1 text-sm">エージェント</th>
                    <th className="px-4 py-1 text-sm">マップ</th>
                    <th className="px-4 py-1 text-sm">ラウンド</th>
                    <th className="px-4 py-1 text-sm">K / D / A</th>
                </tr>
                </thead>
                <tbody>
                {matches.map((match, index) => {
                    const {match_id, my_agent_image, mode, timestamp, map, my_team_round, enemy_team_round, kill, death, assist} = match.metadata;

                    // 背景色の交互設定
                    const rowClass = index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800';

                    return (
                        <tr
                            key={match_id}
                            className={`${rowClass} hover:bg-gray-700 cursor-pointer`}
                            onClick={() => router.push(`/matches/${match_id}`)}
                        >
                            <td className="px-4 py-2 flex items-center text-lg">
                                <td className="" style={{width: '50px'}}>
                                    <img src={my_agent_image} alt=""/>
                                </td>
                            </td>
                            <td className="px-4 py-2 text-white">
                                <div className="text-sm">{mode}・{new Date(timestamp).toLocaleString()}</div>
                                <div className="text-lg">{map}</div>
                            </td>
                            <td className="px-4 py-2 text-lg">
                                <span className="text-green-500">{my_team_round}</span> ：
                                <span className="text-red-500">{enemy_team_round}</span>
                            </td>
                            <td className="px-4 py-2 text-white text-lg">
                                {kill} / {death} / {assist}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>


        </div>
    );
};

export default MatchList;
