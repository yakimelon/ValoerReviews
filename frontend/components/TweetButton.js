import React from 'react';

const TweetButton = ({ text, url }) => {
    const handleClick = () => {
        const tweetUrl = `https://twitter.com/share?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(tweetUrl, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center justify-center bg-blue-500 text-white font-bold py-1 px-3 rounded transition duration-200 hover:bg-blue-600" // パディングを小さく
            style={{ fontSize: '14px' }} // フォントサイズを小さく
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-4 h-4 mr-1" // アイコンも少し小さく
            >
                <path d="M23.643 4.937c-.835.372-1.732.623-2.675.736.96-.576 1.698-1.486 2.044-2.573-.898.532-1.89.918-2.948 1.125-.845-.896-2.046-1.459-3.385-1.459-2.795 0-5.057 2.262-5.057 5.057 0 .397.045.783.128 1.156-4.198-.21-7.926-2.222-10.414-5.282-.435.746-.685 1.605-.685 2.529 0 1.747.888 3.285 2.238 4.191-.825-.025-1.6-.253-2.283-.632v.063c0 2.43 1.726 4.45 4.017 4.908-.421.115-.863.177-1.317.177-.323 0-.637-.031-.947-.086.638 1.988 2.487 3.426 4.673 3.466-1.719 1.348-3.89 2.156-6.24 2.156-.408 0-.814-.024-1.21-.071 2.251 1.446 4.924 2.286 7.8 2.286 9.356 0 14.474-7.757 14.474-14.474 0-.221-.005-.441-.014-.659.993-.719 1.853-1.616 2.54-2.635z" />
            </svg>
            ツイートする
        </button>
    );
};

export default TweetButton;
