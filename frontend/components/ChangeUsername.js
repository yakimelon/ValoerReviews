import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCommentDots, faHistory} from "@fortawesome/free-solid-svg-icons";

const ChangeUsername = () => {
    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [error, setError] = useState(null);

    const router = useRouter();

    useEffect(() => {
        // ユーザーの現在のユーザー名を取得
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    const [defaultName, defaultTag] = data.username.split('#');
                    setName(defaultName || '');
                    setTag(defaultTag || '');
                }
            }
        };

        fetchUserData();
    }, []);

    const handleChangeUsername = async (e) => {
        e.preventDefault();

        // 名前とタグを結合してユーザー名を作成
        const username = `${name}#${tag}`;

        const { data: { user }} = await supabase.auth.getUser();
        const { error } = await supabase
            .from('users')
            .update({ username })
            .eq('id', user.id);

        if (error) {
            setError(error.message);
        } else {
            alert('RIOT IDが更新されました')
            location.reload();
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">RIOT IDの変更</h1>
            <form onSubmit={handleChangeUsername} className="space-y-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="名前入力"
                        className="border rounded p-2 flex-grow"
                        required
                    />
                    <span>#</span>
                    <input
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="タグ名入力"
                        className="border rounded p-2 flex-grow"
                        required
                    />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    ユーザー名を変更する
                </button>
            </form>

            <hr className="mt-10" />

            <div className="text-center mb-8 mt-5">
                <p className="mb-4 text-3xl font-semibold">
                    ▼
                </p>

                <p className="mb-4 text-lg font-semibold">
                    RIOT ID が更新出来た？早速プレイヤーをレビューしよう！
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center">
                    <button
                        onClick={() => router.push('/review')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 sm:mr-5"
                    >
                        <FontAwesomeIcon icon={faCommentDots} className="mr-2"/>
                        RIOT ID 入力でレビュー
                    </button>
                    <button
                        onClick={() => router.push('/match_list')}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <FontAwesomeIcon icon={faHistory} className="mr-2"/>
                        マッチ履歴からレビュー (β)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeUsername;
