'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onFinish, 500); // Wait for fade out animation
        }, 2000); // Show splash for 2 seconds

        return () => clearTimeout(timer);
    }, [onFinish]);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-24 w-24">
                    <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-20"></div>
                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-red-500 text-4xl font-black text-white shadow-xl">
                        SOS
                    </div>
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900">
                    SOS NOW
                </h1>
                <p className="text-sm font-bold text-slate-400">
                    응급 상황을 위한 가장 빠른 지도
                </p>
            </div>
        </div>
    );
}
