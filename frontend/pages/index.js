import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Home() {
    const [playersWithReviews, setPlayersWithReviews] = useState([]);
    const [session, setSession] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) console.error('Error getting session:', error);
            setSession(data.session);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => setSession(session)
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        fetchPlayersWithReviews();
    }, []);

    const fetchPlayersWithReviews = async () => {
        const { data, error } = await supabase
            .from('players')
            .select(`
        id,
        name,
        reviews (
          id,
          rank,
          rating,
          comment,
          created_at,
          users (
            username
          )
        )
      `)
            .order('created_at', { foreignTable: 'reviews', ascending: false });

        if (error) {
            console.error('Error fetching players and reviews:', error);
        } else {
            console.log('Fetched players with reviews:', data);
            setPlayersWithReviews(data);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-bold mb-8 text-center">野良はどんな人？</h1>

            <div className="text-center mb-8">
                <p className="mb-4 text-lg font-semibold">
                    プレイヤー名を入力してレビューを投稿する
                </p>
                <button
                    onClick={() => router.push('/review')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    レビューを投稿する
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {playersWithReviews.map((player) => (
                    <div
                        key={player.id}
                        className="relative p-4 border rounded shadow overflow-hidden"
                        style={{height: '300px'}}
                    >
                        <h2 className="text-xl font-bold mb-2">{player.name}</h2>

                        <div className="reviews-content">
                            {player.reviews?.slice(0, 3).map((review) => (
                                <div key={review.id} className="mb-4">
                                    <p className="text-sm font-semibold">
                                        レビュアー: {review.users?.username || '匿名'}
                                    </p>

                                    {/* 星評価の表示 */}
                                    <p className="text-sm">
                                        {Array(5)
                                            .fill('☆')
                                            .map((star, index) => (
                                                <span key={index}
                                                      className={index < review.rating ? 'text-yellow-500' : ''}>
                            {index < review.rating ? '★' : '☆'}
                        </span>
                                            ))}
                                    </p>

                                    <p className="text-sm">ランク: {review.rank}</p>
                                    <p className="whitespace-pre-wrap">{review.comment}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(review.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div
                            className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white/40 to-transparent pointer-events-none"></div>
                        <button
                            onClick={() => router.push(`/player/${encodeURIComponent(player.name)}`)}
                            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white py-1 px-4 rounded"
                        >
                            すべてのレビューを見る
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
