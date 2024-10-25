import '../styles/globals.css';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Footer from "@/components/Footer";
import { faBars, faSignInAlt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
                <title>Reviewant｜プレイヤーレビューサイト</title>
                <meta property="og:title" content="Reviewant｜プレイヤーレビューサイト"/>
                <meta property="og:description"
                      content="Reviewant で日々の VALORANT をもっと楽しく、ストレスフリーにしませんか？"/>
                <meta property="og:image" content="https://i.gyazo.com/407fcbebfc844122710093a7ea83b4c9.jpg"/>
                <meta property="og:url" content="https://valoer-reviews.vercel.app"/>
                <meta property="og:type" content="website"/>
            </Head>
            <Header session={session} username={username} onLogout={handleLogout}/>
            <div className="mt-[82px]">
                <Component {...pageProps} />
            </div>
            <Footer/>
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
        <header className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-50 flex justify-between items-center mb-6">
            <img
                src="/logo.png"
                alt="Valoer Reviews Logo"
                className="cursor-pointer h-12"
                style={{ marginTop: '-8px' }}
                onClick={() => router.push('/')}
            />

            {/* 検索バーはモバイルでは非表示 */}
            <div className="relative hidden sm:flex max-w-xl flex-grow">
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

            {/* ハンバーガーメニューアイコン */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden">
                <FontAwesomeIcon icon={faBars} />
            </button>

            {/* モバイルメニュー */}
            {menuOpen && (
                <div className="absolute top-14 right-0 w-48 bg-gray-800 text-white rounded shadow-lg z-20">
                    {session ? (
                        <>
                            <div className="p-2">{username}</div>
                            <button
                                onClick={onLogout}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                            >
                                ログアウト
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => router.push('/login')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                            >
                                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                                サインイン
                            </button>
                            <button
                                onClick={() => router.push('/signup')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                            >
                                <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                                サインアップ
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* PC画面用のサインインとサインアップボタン */}
            <div className="hidden sm:flex">
                {session ? (
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-white font-semibold"
                        >
                            {username}
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => router.push('/login')}
                            className="mr-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                            サインイン
                        </button>
                        <button
                            onClick={() => router.push('/signup')}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                            サインアップ
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
