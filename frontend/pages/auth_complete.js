import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const AuthComplete = () => {
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                console.error('User not found:', error);
                router.push('/'); // ユーザーが見つからない場合はホームにリダイレクト
            }
        };

        fetchUser();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { data: { user }, error } = await supabase.auth.getUser();

        if (user) {
            // users テーブルにユーザー名を登録
            const { error: insertError } = await supabase.from('users').insert([
                { id: user.id, username, email: user.email }
            ]);

            if (insertError) {
                console.error('Error inserting user into users table:', insertError.message);
                alert('ユーザー情報の登録に失敗しました。');
                return;
            }

            router.push('/'); // 登録成功後にリダイレクト
        } else {
            alert('ユーザー情報を取得できませんでした。');
        }
    };

    useEffect(() => {
        const init = async () => {
            // メールアドレスがすでに存在する場合はトップページへリダイレクト
            const { data } = await supabase.auth.getSession();
            const existUser = await fetchUser(data.session);
            if (existUser) router.push('/');
        }

        init();
    }, [])

    const fetchUser = async (session) => {
        const { data } = await supabase
            .from('users')
            .select('username')
            .eq('id', session.user.id)
            .single();
        return data;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">ユーザー名の登録</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="ユーザー名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-green-500 text-white p-2 rounded"
                >
                    登録
                </button>
            </form>
        </div>
    );
};

export default AuthComplete;
