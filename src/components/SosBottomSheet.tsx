'use client';

import { useSosStore } from '@/store/useSosStore';
import {
    X, Phone, Navigation, Clock, AlertCircle,
    Star, Heart, MapPin, ExternalLink,
    ShieldCheck, Share2
} from 'lucide-react';

export default function SosBottomSheet() {
    const {
        selectedItem, isBottomSheetOpen, setBottomSheetOpen,
        selectedCategory, favorites, toggleFavorite
    } = useSosStore();

    if (!selectedItem) return null;

    const isFav = favorites.some(f => f.hp_id === selectedItem.hp_id || f.id === selectedItem.id);

    const getStatusColor = (beds: number) => {
        if (beds > 5) return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
        if (beds > 0) return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
        return 'text-red-600 bg-red-500/10 border-red-500/20';
    };

    const name = selectedItem.name || selectedItem.place_name;
    const address = selectedItem.address;
    const phone = selectedItem.emergency_phone || selectedItem.phone;

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
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">{name}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-bold">
                            <MapPin size={16} className="shrink-0 text-red-500" />
                            <p className="text-xs md:text-sm">{address}</p>
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

                    {selectedCategory === 'PHARMACY' && (
                        <div className="rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 p-6">
                            <div className="flex items-center gap-2 text-emerald-700 font-black text-lg mb-4">
                                <Clock size={20} />
                                운영 정보
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/40 p-4 rounded-2xl border border-white/20">
                                    <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">영업 상태</p>
                                    <p className="text-lg font-black text-emerald-700">영업 중</p>
                                </div>
                                <div className="bg-white/40 p-4 rounded-2xl border border-white/20">
                                    <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">24시간 여부</p>
                                    <p className="text-lg font-black text-emerald-700">{selectedItem.is_24h ? 'YES' : 'NO'}</p>
                                </div>
                            </div>
                        </div>
                    )}

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
                        <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/40 p-3 text-slate-400 border border-white/20">
                            <ShieldCheck size={18} />
                            <span className="text-[8px] font-black uppercase tracking-widest">인증됨</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/40 p-3 text-slate-400 border border-white/20">
                            <Share2 size={18} />
                            <span className="text-[8px] font-black uppercase tracking-widest">공유</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/40 p-3 text-slate-400 border border-white/20">
                            <ExternalLink size={18} />
                            <span className="text-[8px] font-black uppercase tracking-widest">정보</span>
                        </div>
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
                            const name = encodeURIComponent(selectedItem.name || selectedItem.place_name);
                            const naverUrl = `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${name}&appname=sos-now`;
                            const webUrl = `https://map.naver.com/v5/directions/-/-/${lat},${lng},${name}/-`;
                            window.location.href = naverUrl;
                            setTimeout(() => {
                                window.open(webUrl, '_blank');
                            }, 500);
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
