import { useRouter } from 'next/router';
import {useEffect, useState} from 'react';
import {supabase} from "@/lib/supabaseClient";
import ReactStars from "react-rating-stars-component";

export default function MatchDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [matchData, setMatchData] = useState(null);
    const [reviews, setReviews] = useState([]); // 各プレイヤーのレビュー情報を管理
    const [userSelection, setUserSelection] = useState(''); // 投稿者選択用の状態
    const [username, setUsername] = useState(''); // 現在のユーザー名を保存
    const [selectedPlayers, setSelectedPlayers] = useState([]); // 選択中のプレイヤーを管理

    const rankIdToString = (rankId) => {
        switch (rankId) {
            case 0:
                return "ランクなし";
            case 1:
            case 2:
                return "Unknown";
            case 3:
            case 4:
            case 5:
                return "アイアン";
            case 6:
            case 7:
            case 8:
                return "ブロンズ";
            case 9:
            case 10:
            case 11:
                return "シルバー";
            case 12:
            case 13:
            case 14:
                return "ゴールド";
            case 15:
            case 16:
            case 17:
                return "プラチナ";
            case 18:
            case 19:
            case 20:
                return "ダイヤ";
            case 21:
            case 22:
            case 23:
                return "アセンダント";
            case 24:
            case 25:
            case 26:
                return "イモータル";
            case 27:
                return "レディアント";
        }
    }

    useEffect(() => {
        const CACHE_KEY = "MATCH_CACHE";
        const matches = JSON.parse(localStorage.getItem(CACHE_KEY));
        const match = matches.find((m) => m.metadata.match_id === id);
        setMatchData(match.players.sort((a, b) => a.team.localeCompare(b.team)));
    }, [id]);

    // ユーザーセッションとユーザー名を取得
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push(`/login?returnUrl=${encodeURIComponent(router.asPath)}`);
            } else {
                const userId = session.user.id; // セッションからユーザーIDを取得
                fetchUsername(userId); // ユーザー名を取得
            }
        };
        checkSession();
    }, [router]);

    const fetchUsername = async (userId) => {
        const { data, error } = await supabase
            .from('users')
            .select('username')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching username:', error);
            setUsername('匿名'); // エラー時のフォールバック
        } else {
            setUsername(data.username); // ユーザー名を状態にセット
        }
    };

    const handlePlayerClick = (player) => {
        const existingReview = reviews.find((r) => r.playerName === player.playerName);
        const isSelected = selectedPlayers.includes(player.playerName);

        if (!existingReview) {
            // 新しいレビューを追加
            setReviews((prev) => [...prev, { ...player, rating: 1, comment: '' }]); // 初期評価を1、コメントを空に設定
        } else {
            // 既存のレビューを削除（選択解除）
            setReviews((prev) => prev.filter((r) => r.playerName !== player.playerName));
        }

        // 選択中のプレイヤーを管理
        setSelectedPlayers((prev) =>
            isSelected ? prev.filter((name) => name !== player.playerName) : [...prev, player.playerName]
        );
    };

    const handleRatingChange = (playerName, newRating) => {
        setReviews((prev) =>
            prev.map((r) => (r.playerName === playerName ? { ...r, rating: newRating } : r))
        );
    };

    const handleCommentChange = (playerName, newComment) => {
        setReviews((prev) =>
            prev.map((r) => (r.playerName === playerName ? { ...r, comment: newComment } : r))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            alert('ユーザー情報の取得に失敗しました。');
            return;
        }

        // プレイヤーを存在チェックし、存在しない場合は作成
        const reviewPromises = reviews.map(async (review) => {
            // プレイヤーが存在するかチェック
            let { data: player, error: playerError } = await supabase
                .from('players')
                .select('id')
                .eq('name', review.playerName)
                .single();

            if (!player) {
                // プレイヤーが存在しない場合、新規作成
                const { data: newPlayer, error: insertError } = await supabase
                    .from('players')
                    .insert([{ name: review.playerName }])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating player:', insertError);
                    alert('プレイヤーの登録に失敗しました。');
                    return; // エラーが発生した場合は処理を終了
                }
                player = newPlayer; // 新規作成したプレイヤーを使用
            }

            // レビューを投稿
            const userId = userSelection === 'anonymous' ? null : user.id;
            return supabase.from('reviews').insert([
                {
                    player_id: player.id, // プレイヤーID
                    user_id: userId, // 現在のユーザーID
                    rank: rankIdToString(review.rank),
                    rating: review.rating,
                    comment: review.comment,
                    created_at: new Date().toISOString(),
                },
            ]);
        });

        await Promise.all(reviewPromises); // すべてのレビューを一括投稿

        alert('レビューが投稿されました！');
        router.push(`/match_list`); // マッチ詳細画面にリダイレクト
    };

    if (!matchData) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-6 mb-20">
            <button
                onClick={() => router.push('/match_list')}
                className="text-gray-500 hover:underline mb-4"
            >
                &lt; マッチ一覧に戻る
            </button>

            <h1 className="text-3xl font-bold mb-6">マッチ詳細</h1>

            <table className="w-full">
                <thead>
                <tr className="bg-gray-800 text-white text-left">
                    <th className="px-4 py-2"></th>
                    <th className="px-4 py-2"></th>
                    <th className="px-4 py-2">プレイヤー名</th>
                    <th className="px-4 py-2">ランク</th>
                    <th className="text-center">K</th>
                    <th className="text-center">D</th>
                    <th className="text-center">A</th>
                </tr>
                </thead>
                <tbody>
                {matchData.map((player, index) => (
                    <tr
                        key={index}
                        className={`${
                            selectedPlayers.includes(player.playerName) ? 'bg-green-500' : index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'
                        } ${selectedPlayers.includes(player.playerName) ? '' : 'hover:bg-gray-700'}`}
                        onClick={() => handlePlayerClick(player)}
                    >
                        <td className={player.team === 'Red' ? 'bg-red-400' : player.team === 'Blue' ? 'bg-green-400' : ''}
                            style={{width: '50px'}}></td>
                        <td className="" style={{width: '50px'}}>
                            <img src={player.agent_image} alt=""/>
                        </td>
                        <td className="px-4 py-2 text-white">{player.playerName}</td>
                        <td className="px-4 py-2 text-white">{rankIdToString(player.rank)}</td>
                        <td className="text-center">{player.kills}</td>
                        <td className="text-center">{player.deaths}</td>
                        <td className="text-center">{player.assists}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 一括投稿のフォーム */}
            {reviews.length > 0 && (
                <div className="mt-6">
                    <hr/>
                    <h2 className="mt-4 text-xl font-bold mb-2">レビューを投稿</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.playerName} className="mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-white">{review.playerName}</span>
                                    <ReactStars
                                        count={5}
                                        value={review.rating}
                                        onChange={(newRating) => handleRatingChange(review.playerName, newRating)}
                                        size={24}
                                        activeColor="#ffd700"
                                    />
                                </div>
                                <textarea
                                    placeholder="コメントを入力..."
                                    value={review.comment}
                                    onChange={(e) => handleCommentChange(review.playerName, e.target.value)}
                                    className="border rounded p-2 w-full"
                                />
                            </div>
                        ))}
                        {/* 投稿者選択のプルダウン */}
                        <div>
                            <label htmlFor="userSelection" className="block mb-1 font-medium">
                                投稿者を選択
                            </label>
                            <select
                                id="userSelection"
                                value={userSelection}
                                onChange={(e) => setUserSelection(e.target.value)}
                                className="w-full border rounded p-2"
                            >
                                <option value="user">{username} で投稿する</option>
                                <option value="anonymous">匿名で投稿する</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded"
                        >
                            レビューを一括投稿する
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}