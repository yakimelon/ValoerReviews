import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserPlus} from "@fortawesome/free-solid-svg-icons";

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
            <h1 className="text-2xl font-bold mb-4">サインアップ</h1>
            <div className="mt-4">
                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    Googleでサインアップ
                </button>
            </div>
        </div>
    );
}
