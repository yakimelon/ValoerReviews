import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TweetButton from "@/components/TweetButton";
import Head from "next/head";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCommentDots} from "@fortawesome/free-solid-svg-icons";

export default function PlayerReviews() {
    const [player, setPlayer] = useState(null);
    const [averageRating, setAverageRating] = useState(null); // 平均評価の状態
    const router = useRouter();
    const { name } = router.query; // URLのプレイヤー名を取得

    useEffect(() => {
        if (name) fetchPlayerWithReviews();
    }, [name]);

    const fetchPlayerWithReviews = async () => {
        const { data, error } = await supabase
            .from('players')
            .select(`
                id,
                name,
                reviews (
                    id,
                    user_id,
                    rank,
                    rating,
                    comment,
                    created_at,
                    users (username)
                )
            `)
            .eq('name', name)
            .single();

        if (error) {
            console.error('Error fetching player reviews:', error);
            setPlayer(null);
        } else {
            setPlayer(data);
            calculateAverageRating(data.reviews); // 平均評価を計算
        }
    };

    // 平均評価を計算する関数
    const calculateAverageRating = (reviews) => {
        if (reviews.length === 0) {
            setAverageRating('N/A');
            return;
        }
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const average = (totalRating / reviews.length).toFixed(1); // 小数点1桁に丸める
        setAverageRating(average);
    };

    const buildPlayerTweetText = () => {
        return `${player.name} のプレイヤーレビューページ（平均評価: ${averageRating}）\n\n#Reviewant は #VALORANT プレイヤーの評価を投稿・閲覧できるサイトです！\n\n`;
    }

    if (!player) return <p>Loading...</p>;

    const ogImageUrl = 'https://i.gyazo.com/07258026dd555df91524629538086396.png'; // OGP画像のURL
    const ogUrl = `https://reviewant/player/${encodeURIComponent(player.name)}`; // OGP URL

    return (
        <div className="container mx-auto p-6">
            <Head>
                <title>{player.name} のレビュー｜Reviewant</title>
                <meta property="og:title" content={`${player.name} のレビュー｜Reviewant`} />
                <meta property="og:description" content={`${player.name}のレビュー平均は${averageRating}です。`} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:url" content={ogUrl} />
                <meta property="og:type" content="website" />
            </Head>

            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                <h1 className="text-3xl font-bold mb-4 sm:mb-0">
                    {player.name} のレビュー（平均評価: {averageRating}）
                </h1>
                <div className="flex flex-col sm:flex-row">
                    <div className="mb-2 sm:mb-0 sm:mr-2">
                        <TweetButton text={buildPlayerTweetText()} url={`https://reviewant.games/player/${encodeURIComponent(player.name)}`} />
                    </div>
                    <button
                        onClick={() => router.push(`/review?playerName=${encodeURIComponent(player.name)}`)}
                        className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-700 font-bold"
                        style={{ fontSize: '14px' }}
                    >
                        <FontAwesomeIcon icon={faCommentDots} className="mr-2" />
                        レビューを投稿する
                    </button>
                </div>
            </div>

            {player.reviews.length > 0 ? (
                player.reviews
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // 新着順にソート
                    .map((review) => (
                        <div key={review.id} className="mb-6 border-b pb-4">
                            <p className="text-sm font-semibold">
                                レビュアー: {review.users?.username || '匿名'}
                            </p>
                            <p className="text-sm">対象者のランク: {review.rank}</p>

                            {/* 星評価の表示 */}
                            <p className="text-sm">
                                {Array(5)
                                    .fill('☆')
                                    .map((star, index) => (
                                        <span key={index} className={index < review.rating ? 'text-yellow-500' : ''}>
                                            {index < review.rating ? '★' : '☆'}
                                        </span>
                                    ))}
                            </p>

                            <p className="whitespace-pre-wrap">{review.comment}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleString()}
                            </p>
                        </div>
                    ))
            ) : (
                <p>このプレイヤーにはまだレビューがありません。</p>
            )}
        </div>
    );
}
