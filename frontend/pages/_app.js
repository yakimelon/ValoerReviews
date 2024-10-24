import '../styles/globals.css';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
    const [session, setSession] = useState(null);
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
            } else {
                setSession(data.session);
                if (data?.session) fetchUsername(data.session.user.id);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                if (session) fetchUsername(session.user.id);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchUsername = async (userId) => {
        const { data, error } = await supabase
            .from('users')
            .select('username')
            .eq('id', userId)
            .single();
        if (!error) setUsername(data.username);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        router.push('/');
    };

    useEffect(() => {
        // Google Analyticsのページビューをトラッキング
        const handleRouteChange = (url) => {
            window.gtag('config', 'G-8F17EBZB35', {
                page_path: url,
            });
        };

        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    return (
        <div>
            <Head>
                {/* Google Analytics スクリプト */}
                <script async src={`https://www.googletagmanager.com/gtag/js?id=G-8F17EBZB35`}></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', 'G-8F17EBZB35', {
                                page_path: window.location.pathname,
                            });
                        `,
                    }}
                />
                <title>Valoer Reviews｜プレイヤーレビューサイト</title>
                <meta property="og:title" content="Valoer Reviews｜プレイヤーレビューサイト"/>
                <meta property="og:description" content="Valoer Reviews で日々の VALORANT をもっと楽しく、ストレスフリーにしませんか？"/>
                <meta property="og:image" content="https://i.gyazo.com/407fcbebfc844122710093a7ea83b4c9.jpg"/>
                <meta property="og:url" content="https://valoer-reviews.vercel.app"/>
                <meta property="og:type" content="website"/>
            </Head>
            <Header session={session} username={username} onLogout={handleLogout}/>
            <Component {...pageProps} />
        </div>
    );
}

// ヘッダーコンポーネント
function Header({session, username, onLogout}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const router = useRouter();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = async (term) => {
        setSearchTerm(term);
        if (term.length > 0) {
            const { data, error } = await supabase
                .from('players')
                .select('id, name')
                .ilike('name', `%${term}%`); // 部分一致検索

            if (!error) {
                setSearchResults(data);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectPlayer = (playerName) => {
        router.push(`/player/${encodeURIComponent(playerName)}`);
        setSearchTerm(''); // 検索バーをクリア
        setSearchResults([]); // 検索結果をクリア
    };

    return (
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center space-x-4">
            <h1
                className="text-xl font-bold cursor-pointer"
                onClick={() => router.push('/')}
            >
                Valoer Reviews
            </h1>

            <div className="relative flex-grow max-w-xl">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="プレイヤー名で検索"
                    className="p-2 rounded border border-gray-300 text-black w-full"
                />
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white text-black rounded shadow-md mt-1">
                        {searchResults.map((player) => (
                            <div
                                key={player.id}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => handleSelectPlayer(player.name)}
                            >
                                {player.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {session ? (
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-white font-semibold"
                    >
                        {username}
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 bg-white text-black rounded shadow p-2">
                            <button
                                onClick={onLogout}
                                className="block px-4 py-2 text-sm hover:bg-gray-200"
                            >
                                ログアウト
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <button
                        onClick={() => router.push('/login')}
                        className="mr-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        サインイン
                    </button>
                    <button
                        onClick={() => router.push('/signup')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        サインアップ
                    </button>
                </div>
            )}
        </header>
    );
}
