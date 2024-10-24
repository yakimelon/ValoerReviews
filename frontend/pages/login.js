import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { returnUrl, playerName } = router.query; // playerNameを取得

    const handleLogin = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            console.error('Login error:', error);
            alert('ログインに失敗しました。');
        } else {
            // ログイン成功後、returnUrl に遷移
            const url = playerName
                ? `${returnUrl}?playerName=${encodeURIComponent(playerName)}`
                : returnUrl || '/';
            router.push(url);
        }
    };

    const handleNavigateToSignup = () => {
        // サインアップ画面に遷移、playerNameも保持
        router.push(
            `/signup?returnUrl=${encodeURIComponent(returnUrl || '/')}&playerName=${encodeURIComponent(playerName || '')}`
        );
    };

    // Googleログイン処理
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth_complete` // リダイレクト先を指定
            }
        });

        if (error) {
            console.error('Google login error:', error.message);
            alert('Googleログインに失敗しました。');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">ログイン</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />
                <input
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    ログイン
                </button>
            </form>
            <hr className="my-4"/>

            <div className="mt-4">
                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    Googleでログイン
                </button>
            </div>
            <p className="mt-4 text-center">
                アカウントがありませんか？{' '}
                <button onClick={handleNavigateToSignup} className="text-blue-500 underline">
                    サインアップ
                </button>
            </p>
        </div>
    );
}
