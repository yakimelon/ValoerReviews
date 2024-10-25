import Link from 'next/link';

const Footer = () => {
    const currentYear = new Date().getFullYear(); // 現在の年を取得

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-gray-500 p-1 flex justify-between items-center">
            <div>
                <Link href="https://twitter.com/valoer_reviews" target="_blank" className="hover:underline">
                    Twitter
                </Link>
            </div>
            <div>
                <p className="text-sm">© {currentYear} Reviewant. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
