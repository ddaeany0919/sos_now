'use client';

import { useState, useEffect } from 'react';

import { useSosStore } from '@/store/useSosStore';
import { getPharmacyStatus } from '@/lib/businessHours';
import {
    X, Phone, Navigation, Clock, AlertCircle,
    Star, Heart, MapPin, ExternalLink,
    ShieldCheck, Share2, Copy, Check
} from 'lucide-react';

export default function SosBottomSheet() {
    const {
        selectedItem, isBottomSheetOpen, setBottomSheetOpen,
        selectedCategory, favorites, toggleFavorite
    } = useSosStore();

    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    if (!selectedItem) return null;

    console.log('SosBottomSheet selectedItem:', selectedItem);

    const isFav = favorites.some(f =>
        (selectedItem.hp_id && f.hp_id === selectedItem.hp_id) ||
        (selectedItem.id && f.id === selectedItem.id)
    );

    const getStatusColor = (beds: number) => {
        if (beds > 5) return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
        if (beds > 0) return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
        return 'text-red-600 bg-red-500/10 border-red-500/20';
    };

    const isAed = selectedCategory === 'AED' || (selectedCategory === 'FAVORITES' && !selectedItem.hp_id && selectedItem.type !== 'PHARMACY' && selectedItem.type !== 'ANIMAL_HOSPITAL');

    const name = isAed ? selectedItem.address : (selectedItem.name || selectedItem.place_name);
    const address = isAed ? selectedItem.place_name : selectedItem.address;
    const actualAddress = selectedItem.address; // For copying
    const phone = selectedItem.emergency_phone || selectedItem.phone || selectedItem.manager_phone;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${isBottomSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
        >
            {/* Backdrop - Transparent to keep map visible, but still clickable to close */}
            <div
                className="absolute inset-0 bg-black/5 backdrop-blur-[2px] transition-opacity duration-500"
                onClick={() => setBottomSheetOpen(false)}
            />

            {/* Main Popup Card - More transparent background */}
            <div className={`relative w-full max-w-xl overflow-hidden rounded-[40px] bg-white/60 backdrop-blur-3xl p-8 md:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/80 transition-all duration-500 transform ${isBottomSheetOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>

                {/* Header Section */}
                <div className="mb-8 flex items-start justify-between">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                {name}
                                {isAed && (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(actualAddress);
                                            setShowToast(true);
                                        }}
                                        className="inline-flex ml-2 rounded-full p-1.5 hover:bg-slate-100 text-slate-400 transition-colors align-middle"
                                    >
                                        <Copy size={16} />
                                    </button>
                                )}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-bold">
                            <MapPin size={16} className="shrink-0 text-red-500" />
                            <p className="text-xs md:text-sm">{address}</p>
                            {!isAed && (
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(actualAddress);
                                        setShowToast(true);
                                    }}
                                    className="ml-1 rounded-full p-1 hover:bg-slate-100 text-slate-400 transition-colors"
                                >
                                    <Copy size={12} />
                                </button>
                            )}
                            {showToast && (
                                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-bold text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300 whitespace-nowrap">
                                    <Check size={16} className="text-emerald-400" />
                                    주소가 복사되었습니다
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setBottomSheetOpen(false)}
                            className="rounded-2xl bg-white/50 backdrop-blur-md p-3 text-slate-400 hover:bg-white transition-colors border border-white/20"
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={() => toggleFavorite(selectedItem)}
                            className={`rounded-2xl p-3 transition-all border border-white/20 ${isFav ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : 'bg-white/50 text-slate-300 hover:text-slate-400'}`}
                        >
                            <Star size={20} className={isFav ? 'fill-current' : ''} />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-6 mb-8">
                    {/* Category Specific Status Card */}
                    {selectedCategory === 'EMERGENCY' && selectedItem.beds_available !== undefined && (
                        <div className={`rounded-[32px] border p-6 transition-all ${getStatusColor(selectedItem.beds_available)}`}>
                            <div className="mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2 font-black text-lg">
                                    <AlertCircle size={20} />
                                    실시간 응급실 현황
                                </span>
                                <div className="flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1 text-[10px] font-black tracking-widest">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                    LIVE
                                </div>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-6xl font-black tracking-tighter">{selectedItem.beds_available}</span>
                                <span className="text-xl font-black opacity-80">개 병상 가용</span>
                            </div>
                            {selectedItem.recent_msg && (
                                <div className="mt-6 rounded-2xl bg-white/40 p-4 backdrop-blur-sm border border-white/20">
                                    <p className="text-sm font-bold leading-relaxed text-slate-800">{selectedItem.recent_msg}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedCategory === 'PHARMACY' && (() => {
                        const status = getPharmacyStatus(selectedItem);
                        return (
                            <div className="rounded-[32px] border p-6" style={{
                                backgroundColor: `${status.color}10`,
                                borderColor: `${status.color}30`
                            }}>
                                <div className="flex items-center gap-2 font-black text-lg mb-4" style={{ color: status.textColor }}>
                                    <Clock size={20} />
                                    운영 정보
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/40 p-4 rounded-2xl border border-white/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: `${status.textColor}80` }}>영업 상태</p>
                                        <p className="text-lg font-black" style={{ color: status.textColor }}>
                                            {status.icon} {status.message}
                                        </p>
                                    </div>
                                    <div className="bg-white/40 p-4 rounded-2xl border border-white/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: `${status.textColor}80` }}>24시간 여부</p>
                                        <p className="text-lg font-black" style={{ color: status.textColor }}>{selectedItem.is_24h ? 'YES' : 'NO'}</p>
                                    </div>
                                </div>
                                {status.closesAt && (
                                    <div className="mt-4 rounded-2xl bg-white/60 p-3 border border-white/20">
                                        <p className="text-sm font-bold text-center" style={{ color: status.textColor }}>
                                            ⏰ {status.closesAt}까지 영업
                                        </p>
                                    </div>
                                )}
                                {status.opensAt && status.status === 'closed' && (
                                    <div className="mt-4 rounded-2xl bg-white/60 p-3 border border-white/20">
                                        <p className="text-sm font-bold text-center" style={{ color: status.textColor }}>
                                            🕐 {status.opensAt}에 오픈
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {selectedCategory === 'AED' && (
                        <div className="rounded-[32px] bg-amber-500/10 border border-amber-500/20 p-6">
                            <div className="flex items-center gap-2 text-amber-700 font-black text-lg mb-4">
                                <Heart size={20} />
                                기기 상태
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/20">
                                    <span className="font-black text-amber-900/40 uppercase tracking-widest text-[10px]">모델명</span>
                                    <span className="font-black text-amber-800 text-sm">{selectedItem.model || '정보 없음'}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/20">
                                    <span className="font-black text-amber-900/40 uppercase tracking-widest text-[10px]">최종 점검일</span>
                                    <span className="font-black text-amber-800 text-sm">{selectedItem.last_check_date || '정보 없음'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-emerald-50/50 p-3 text-emerald-600 border border-emerald-100/50">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest">인증됨</span>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    if (navigator.share) {
                                        await navigator.share({
                                            title: name,
                                            text: `${name} - ${address}`,
                                            url: `${window.location.origin}/map?lat=${selectedItem.lat}&lng=${selectedItem.lng}`
                                        });
                                    } else {
                                        // Fallback: Copy to clipboard
                                        await navigator.clipboard.writeText(`${name}\n${address}\n${window.location.origin}/map?lat=${selectedItem.lat}&lng=${selectedItem.lng}`);
                                        alert('링크가 클립보드에 복사되었습니다!');
                                    }
                                } catch (err) {
                                    console.log('Share failed:', err);
                                }
                            }}
                            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-blue-50/50 p-3 text-blue-600 border border-blue-100/50 hover:bg-blue-100/50 transition-colors cursor-pointer"
                        >
                            <Share2 size={18} className="text-blue-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest">공유</span>
                        </button>
                        <a
                            href={`https://map.naver.com/v5/search/${encodeURIComponent(name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-violet-50/50 p-3 text-violet-600 border border-violet-100/50 hover:bg-violet-100/50 transition-colors"
                        >
                            <ExternalLink size={18} className="text-violet-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest">정보</span>
                        </a>
                    </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <a
                        href={`tel:${phone}`}
                        className="flex items-center justify-center gap-2 rounded-[24px] bg-red-500 py-4 text-lg font-black text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95"
                    >
                        <Phone size={20} />
                        전화하기
                    </a>
                    <button
                        onClick={() => {
                            const lat = selectedItem.lat;
                            const lng = selectedItem.lng;
                            const name = selectedItem.name || selectedItem.place_name;

                            // 더 확실한 네이버 지도 URL 포맷 (도착지 설정)
                            // 모바일: nmap 스키마
                            // 웹: map.naver.com 링크

                            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

                            if (isMobile) {
                                // 네이버 지도 앱 스키마 (공식 문서 기준)
                                // dlat, dlng: 도착지 좌표
                                // dname: 도착지 명
                                location.href = `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name)}&appname=com.sosnow.app`;
                            } else {
                                // PC/Mobile Web Fallback
                                // 도착지 좌표와 이름을 명시적으로 지정
                                // format: https://map.naver.com/v5/directions/[start]/[goal]/[transit]?c=[center]
                                // start is usually '-' (current location)
                                // goal: lat,lng,name
                                const webUrl = `https://map.naver.com/v5/directions/-/${lng},${lat},${encodeURIComponent(name)},,/-/transit?c=${lng},${lat},15,0,0,0,dh`;
                                window.open(webUrl, '_blank');
                            }
                        }}
                        className="flex items-center justify-center gap-2 rounded-[24px] bg-slate-900 py-4 text-lg font-black text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-95"
                    >
                        <Navigation size={20} />
                        길찾기
                    </button>
                </div>
            </div>
        </div>
    );
}
