import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // ユーザー名の状態
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();

        // サインアップ処理
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.error('Signup error:', error.message);
            alert('サインアップに失敗しました。');
            return;
        }

        const user = data.user;
        if (user) {
            // users テーブルにユーザー名とメールを登録
            const { error: insertError } = await supabase.from('users').insert([
                { id: user.id, username, email }
            ]);

            if (insertError) {
                console.error('Error inserting user into users table:', insertError.message);
                alert('ユーザー情報の登録に失敗しました。');
                return;
            }
            router.push('/');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">サインアップ</h1>
            <form onSubmit={handleSignup} className="space-y-4">
                <input
                    type="text"
                    placeholder="ユーザー名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />
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
                    className="w-full bg-green-500 text-white p-2 rounded"
                >
                    サインアップ
                </button>
            </form>
        </div>
    );
}
