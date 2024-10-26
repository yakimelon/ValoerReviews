import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faSync } from "@fortawesome/free-solid-svg-icons";

const MatchList = ({ matches }) => {
    const router = useRouter();
    const [canRefresh, setCanRefresh] = useState(true);
    const [countdown, setCountdown] = useState(0);

    // 更新ボタンの処理
    const handleRefresh = () => {
        localStorage.removeItem("MATCH_CACHE"); // localStorageのクリア
        localStorage.setItem("LAST_REFRESH", Date.now()); // 現在の時刻を保存
        router.reload(); // ページのリロード
    };

    // 5分ごとの更新制御
    useEffect(() => {
        const lastRefresh = localStorage.getItem("LAST_REFRESH");

        // 最後の更新時刻が存在する場合
        if (lastRefresh) {
            const lastRefreshTime = Number(lastRefresh);
            const timeSinceLastRefresh = Math.floor((Date.now() - lastRefreshTime) / 1000); // 秒単位で経過時間を計算

            if (timeSinceLastRefresh < 300) {
                setCountdown(300 - timeSinceLastRefresh); // 残り時間を計算
                setCanRefresh(false);
            }
        }

        let timer;
        if (!canRefresh) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 0) {
                        setCanRefresh(true);
                        localStorage.removeItem("LAST_REFRESH"); // リセット
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000); // 1秒ごとにカウントダウン
        }

        return () => clearInterval(timer);
    }, [canRefresh]);

    // ボタンを押したときの処理
    const handleButtonClick = () => {
        if (canRefresh) {
            handleRefresh();
            setCanRefresh(false);
            setCountdown(300); // 5分のカウントダウンを設定
        }
    };

    const buildTimestamp = (timestamp) => {
        const inputDate = new Date(timestamp);

        // 日本時間に変換
        const options = {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // 24時間制
        };

        const formattedDate = new Intl.DateTimeFormat('ja-JP', options).format(inputDate);

        return formattedDate.replace(/(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/, '$1/$2/$3 $4:$5');
    };

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

            <br />

            <h1 className="text-2xl font-bold mb-4 flex items-center justify-between">
                直近のコンペティティブ一覧
                <button
                    onClick={handleButtonClick}
                    className={`ml-4 ${canRefresh ? 'bg-green-500' : 'text-gray-400'} flex items-center text-white py-1 px-4 rounded ${canRefresh ? 'hover:bg-green-700' : ''} font-bold`}
                    disabled={!canRefresh}
                >
                    <FontAwesomeIcon icon={faSync} className="mr-1" />
                    {canRefresh ? '更新' : `残り ${countdown}秒`}
                </button>
            </h1>


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
                    const { match_id, my_agent_image, mode, timestamp, map, my_team_round, enemy_team_round, kill, death, assist } = match.metadata;

                    // 背景色の交互設定
                    const rowClass = index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800';

                    return (
                        <tr
                            key={match_id}
                            className={`${rowClass} hover:bg-gray-700 cursor-pointer`}
                            onClick={() => router.push(`/matches/${match_id}`)}
                        >
                            <td className="px-4 py-2 flex items-center text-lg">
                                <td className="" style={{ width: '50px' }}>
                                    <img src={my_agent_image} alt="" />
                                </td>
                            </td>
                            <td className="px-4 py-2 text-white">
                                <div className="text-sm">{mode}・{buildTimestamp(timestamp)}</div>
                                <div className="text-lg">{map}</div>
                            </td>
                            <td className="px-4 py-2 text-lg">
                                <span className="text-green-500">{my_team_round}</span>：
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
