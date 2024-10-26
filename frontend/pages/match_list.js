import MatchList from '../components/MatchList';
import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabaseClient";
import {useRouter} from "next/router";

const MatchListPage = () => {
    const [matches, setMatches] = useState(null);
    const router = useRouter();

    // ユーザーセッションとユーザー名を取得
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push(`/login?returnUrl=${encodeURIComponent(router.asPath)}`);
            } else {
                // localStorageにキャッシュがあればそれを使用
                const CACHE_KEY = "MATCH_CACHE";
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    setMatches(JSON.parse(cachedData));
                    return;
                }

                // ユーザーの現在のユーザー名を取得
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username')
                        .eq('id', user.id)
                        .single();

                    if (!error && data) {
                        const [name, tag] = data.username.split('#');
                        try {
                            // GETリクエストを送信
                            const response = await fetch(`http://127.0.0.1:54321/functions/v1/valorant?name=${name}&tag=${tag}`);
                            const data = await response.json();

                            // 取得したデータをlocalStorageに保存
                            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                            setMatches(data);
                        } catch (error) {
                            console.error('Fetch error:', error);
                            setMatches([]);
                        }
                    }
                }
            }
        };
        checkSession();
    }, [router]);

    if (!matches){
        return <p>Loading...</p>;
    }

    return <MatchList matches={matches} />;
};

export default MatchListPage;
