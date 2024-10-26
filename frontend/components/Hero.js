import Image from 'next/image';

const HeroPC = () => {
    return (
        <div
            className="flex flex-col lg:flex-row items-center justify-between px-24"
            style={{
                backgroundImage: 'url(/hero-back.png)', // 背景画像のパスを指定
                backgroundSize: 'cover', // 画像が親要素を覆うように
                backgroundPosition: 'center', // 画像の中心を表示
                height: '550px', // ヒーロービューの高さを指定
                width: '100%', // 幅を100%に
                position: 'relative', // 相対位置を指定
            }}
        >
            {/* オーバーレイ */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 薄いグレーのオーバーレイ
                    zIndex: 1,
                }}
            />

            <div className="flex flex-col lg:w-1/2 mb-4 lg:mb-0 mr-32 z-10">
                <img src="/logo.png" alt="Reviewant logo" className="w-full h-auto mb-4"/>
                <h1 className="text-5xl font-extrabold mb-4 text-white text-center leading-snug">VALORANTプレイヤー<br/>レビューサイト</h1>
                <p className="text-lg text-gray-100">
                    Reviewant は VALORANT プレイヤーのレビューサイトです。
                    RIOT ID を入力して個別にレビューすることも出来ますが、
                    自分の RIOT ID を登録することで直近のマッチ履歴から
                    プレイヤーを選択してレビューすることも出来ます！
                    Google アカウントで簡単登録、トキシックやトロールはレビューしちゃおう👍️
                </p>
            </div>

            <div className="lg:w-1/2 bg-gray-200 rounded shadow z-10 mb-4 lg:mb-0">
                <iframe
                    width="100%"
                    height="330"
                    src="https://www.youtube.com/embed/WWwyQvLjUIM?autoplay=1&mute=1"
                    title="Reviewant Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

const HeroSP = () => {
    return (
        <div
            className="flex flex-col items-center justify-center px-4"
            style={{
                backgroundImage: 'url(/hero-back.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '700px',
                width: '100%',
                position: 'relative',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 1,
                }}
            />
            <div className="flex flex-col w-full mb-4 z-10 text-center">
                <img src="/logo.png" alt="Reviewant logo" className="w-full h-auto mb-4" />
                <h1 className="text-4xl font-extrabold mb-4 text-white leading-snug">
                    VALORANT<br />プレイヤー<br />レビューサイト
                </h1>
                <p className="text-base text-gray-100">
                    Reviewant は VALORANT プレイヤーのレビューサイトです。
                    RIOT ID を入力して個別にレビューすることも出来ますが、
                    自分の RIOT ID を登録することで直近のマッチ履歴から
                    プレイヤーを選択してレビューすることも出来ます！
                    Google アカウントで簡単登録、トキシックやトロールはレビューしちゃおう👍️
                </p>
            </div>
            <div className="w-full bg-gray-200 rounded shadow z-10">
                <iframe
                    width="100%"
                    height="200"
                    src="https://www.youtube.com/embed/WWwyQvLjUIM?autoplay=1&mute=1"
                    title="Reviewant Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

const Hero = () => {
    return (
        <>
            {/* デバイスの幅に応じて表示するコンポーネントを切り替え */}
            <div className="hidden lg:block">
                <HeroPC />
            </div>
            <div className="block lg:hidden">
                <HeroSP />
            </div>
        </>
    );
};

export default Hero;
