import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import ReactStars from 'react-rating-stars-component';

export default function Review() {
    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [rank, setRank] = useState('ブロンズ');
    const [rating, setRating] = useState(1);
    const [comment, setComment] = useState('');
    const [userSelection, setUserSelection] = useState(''); // 投稿者選択用の状態
    const [username, setUsername] = useState(''); // 現在のユーザー名を保存
    const [scheduledPostTime, setScheduledPostTime] = useState('now'); // 投稿時間の状態
    const router = useRouter();
    const { playerName: defaultPlayerName } = router.query;

    // プレイヤー名を分割してセット
    useEffect(() => {
        if (defaultPlayerName) {
            const [defaultName, defaultTag] = defaultPlayerName.split('#');
            setName(defaultName || '');
            setTag(defaultTag || '');
        }
    }, [defaultPlayerName]);

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

    // ユーザー名を users テーブルから取得
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

    const handleRatingChange = (newRating) => {
        setRating(newRating);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            alert('ユーザー情報の取得に失敗しました。');
            return;
        }

        const playerNameWithTag = `${name}#${tag}`;

        let { data: player } = await supabase
            .from('players')
            .select('id')
            .eq('name', playerNameWithTag)
            .single();

        if (!player) {
            const { data: newPlayer, error: insertError } = await supabase
                .from('players')
                .insert([{ name: playerNameWithTag }])
                .select()
                .single();

            if (insertError) {
                console.error('Error inserting player:', insertError);
                alert('プレイヤーの登録に失敗しました。');
                return;
            }
            player = newPlayer;
        }

        const userId = userSelection === 'anonymous' ? null : user.id;

        // 現在の時刻または指定された時間を計算
        let postTime;
        if (scheduledPostTime === 'now') {
            postTime = null;
        } else {
            const hoursToAdd = parseInt(scheduledPostTime, 10);
            postTime = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000).toISOString();
        }

        const { error: reviewError } = await supabase.from('reviews').insert([
            {
                player_id: player.id,
                user_id: userId,
                rank,
                rating,
                comment,
                scheduled_post_time: postTime,
                created_at: new Date().toISOString(),
            },
        ]);

        if (reviewError) {
            console.error('Error inserting review:', reviewError);
            alert('レビューの投稿に失敗しました。');
        } else {
            alert('レビューが投稿されました！');
            router.push(`/player/${encodeURIComponent(playerNameWithTag)}`);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">レビューを投稿</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <label htmlFor="name" className="block mb-1 font-medium">
                    RIOT IDとタグは？
                </label>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="名前入力"
                        className="border rounded p-2 flex-grow"
                        required
                    />
                    <span>#</span>
                    <input
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="タグ名入力"
                        className="border rounded p-2 flex-grow"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="rank" className="block mb-1 font-medium">
                        この人のランクは？
                    </label>
                    <select
                        id="rank"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        {['ランクなし', 'プラスチック', 'アイアン', 'ブロンズ', 'シルバー', 'ゴールド', 'プラチナ', 'ダイヤモンド', 'アセンダント', 'イモータル', 'レディアント'].map((rank) => (
                            <option key={rank} value={rank}>
                                {rank}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="comment" className="block mb-1 font-medium">
                        コメント
                    </label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="コメント"
                        className="w-full border rounded p-2 min-h-[150px] resize-none"
                        required
                    ></textarea>
                </div>

                <div>
                    <label htmlFor="scheduledPostTime" className="block mb-1 font-medium">
                        いつ投稿されるようにする？
                    </label>
                    <select
                        id="scheduledPostTime"
                        value={scheduledPostTime}
                        onChange={(e) => setScheduledPostTime(e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        <option value="now">今すぐ</option>
                        <option value="1">1時間後</option>
                        <option value="3">3時間後</option>
                        <option value="5">5時間後</option>
                        <option value="24">24時間後</option>
                    </select>
                </div>

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

                <div>
                    <label className="block mb-1 font-medium">評価</label>
                    <div className="flex justify-center">
                        <ReactStars
                            count={5}
                            value={rating}
                            onChange={handleRatingChange}
                            size={40}
                            activeColor="#ffd700"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    レビューを投稿する
                </button>
            </form>
        </div>
    );
}
