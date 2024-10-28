import MatchList from '../components/MatchList';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

const MatchListPage = () => {
    const CACHE_KEY = "MATCH_CACHE";
    const [matches, setMatches] = useState(null);
    const [isPopupVisible, setPopupVisible] = useState(false); // ポップアップの表示状態
    const [isLoading, setLoading] = useState(true); // ローディング状態
    const [nameInput, setNameInput] = useState(''); // nameの入力状態
    const [tagInput, setTagInput] = useState(''); // tagの入力状態
    const router = useRouter();

    // ユーザーセッションとキャッシュをチェック
    useEffect(() => {
        const checkSessionAndCache = async () => {
            const cachedData = localStorage.getItem(CACHE_KEY);
            setNameInput(localStorage.getItem("NAME"));
            setTagInput(localStorage.getItem("TAG"));

            if (cachedData) {
                // キャッシュが存在する場合、ポップアップなしでマッチをセット
                setMatches(JSON.parse(cachedData));
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // ログインしていない場合、空の配列をセットしてポップアップを表示
                setMatches([]);
                setPopupVisible(true);
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    const [name, tag] = data.username.split('#');
                    await fetchMatchData(name, tag); // マッチデータ取得
                }
            }
        };

        checkSessionAndCache();
    }, [router]);

    // APIからマッチデータを取得する関数
    const fetchMatchData = async (name, tag) => {
        try {
            setLoading(true); // ローディング開始
            const response = await fetch(`https://uzxopruksnmxmjltkzzf.supabase.co/functions/v1/valorant?name=${name}&tag=${tag}`);
            const data = await response.json();

            localStorage.setItem(CACHE_KEY, JSON.stringify(data)); // キャッシュに保存
            setMatches(data);
        } catch (error) {
            console.error('Fetch error:', error);
            setMatches([]);
        } finally {
            setLoading(false); // ローディング終了
        }
    };

    // ポップアップの送信ハンドラ
    const handlePopupSubmit = async () => {
        if (nameInput && tagInput) {
            await fetchMatchData(nameInput, tagInput); // APIリクエストを送信
            setPopupVisible(false); // ポップアップを閉じる
            localStorage.setItem("NAME", nameInput);
            localStorage.setItem("TAG", tagInput);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            {isPopupVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center text-gray-950">
                        <h2 className="text-xl font-bold mb-4">RIOT IDを入力してください</h2>
                        <div className="flex items-center justify-center mb-4">
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="名前"
                                className="border rounded p-2 w-1/2"
                            />
                            <span className="mx-2 text-xl">#</span>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="タグ"
                                className="border rounded p-2 w-1/2"
                            />
                        </div>
                        <button
                            onClick={handlePopupSubmit}
                            className="bg-blue-500 text-white py-2 px-4 rounded"
                        >
                            取得
                        </button>
                    </div>
                </div>
            )}
            {matches && <MatchList matches={matches} />}
        </div>
    );
};

export default MatchListPage;
