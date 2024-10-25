import Image from 'next/image';

const Hero = () => {
    return (
        <div className="relative w-full h-[400px] flex items-center justify-center">
            <Image
                src="/hero.png"
                alt="VALORANT プレイヤー レビューサイト"
                layout="fill"
                objectFit="cover"
                objectPosition="left"
            />
            <div className="absolute text-white text-center p-4">
            </div>
        </div>
    );
};

export default Hero;
