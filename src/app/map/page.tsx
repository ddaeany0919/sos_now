'use client';

import { useState, useEffect } from 'react';
import RawSosMap from '@/components/RawSosMap';
import SosBottomSheet from '@/components/SosBottomSheet';
import { useSosStore, CategoryType } from '@/store/useSosStore';
import { getPharmacyStatus } from '@/lib/businessHours';
import { sortByDistance, formatDistance } from '@/lib/distance';
import {
    HeartPulse, Pill, Dog, ShieldAlert, Search,
    List, Map as MapIcon, AlertCircle, Star,
    MapPin, ChevronRight, Phone, Navigation,
    X, Settings, Bell, ArrowUpDown
} from 'lucide-react';

export default function MapPage() {
    const {
        selectedCategory, setSelectedCategory,
        items, searchQuery, setSearchQuery,
        setSelectedItem, setBottomSheetOpen,
        favorites, filterOpenNow, setFilterOpenNow
    } = useSosStore();

    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [isScrolled, setIsScrolled] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.log('Location error:', error)
            );
        }
    }, []);

    const categories: { id: CategoryType; label: string; icon: any; color: string; activeColor: string }[] = [
        { id: 'EMERGENCY', label: '응급실', icon: HeartPulse, color: 'text-red-500', activeColor: 'bg-red-500' },
        { id: 'PHARMACY', label: '약국', icon: Pill, color: 'text-emerald-500', activeColor: 'bg-emerald-500' },
        { id: 'ANIMAL_HOSPITAL', label: '동물병원', icon: Dog, color: 'text-blue-500', activeColor: 'bg-blue-500' },
        { id: 'AED', label: 'AED', icon: ShieldAlert, color: 'text-amber-500', activeColor: 'bg-amber-500' },
        { id: 'FAVORITES', label: '즐겨찾기', icon: Star, color: 'text-yellow-500', activeColor: 'bg-yellow-500' },
    ];

    const filteredItems = (selectedCategory === 'FAVORITES' ? favorites : items).filter(item => {
        const name = item.name || item.place_name || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filterOpenNow) {
            // Emergency hospitals are usually 24/7
            if (selectedCategory === 'EMERGENCY') return true;

            // For others, check business_hours
            if (item.is_24h) return true;

            if (selectedCategory === 'PHARMACY' || selectedCategory === 'ANIMAL_HOSPITAL') {
                const status = getPharmacyStatus(item);
                return status.status === 'open' || status.status === 'closing-soon';
            }

            if (item.business_hours) {
                try {
                    const now = new Date();
                    const currentTime = now.getHours() * 60 + now.getMinutes();

                    const [start, end] = item.business_hours.split(' - ');
                    const [startH, startM] = start.split(':').map(Number);
                    const [endH, endM] = end.split(':').map(Number);

                    const startTime = startH * 60 + startM;
                    const endTime = endH * 60 + endM;

                    return currentTime >= startTime && currentTime <= endTime;
                } catch (e) {
                    return true; // If parsing fails, show it
                }
            }
        }

        return true;
    });

    // Sort items
    const sortedItems = (() => {
        let sorted = [...filteredItems];

        if (sortBy === 'distance' && userLocation) {
            sorted = sortByDistance(sorted, userLocation.lat, userLocation.lng);
        } else if (sortBy === 'name') {
            sorted.sort((a, b) => {
                const nameA = (a.name || a.place_name || '').toLowerCase();
                const nameB = (b.name || b.place_name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
        }

        return sorted;
    })();

    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-50 font-sans selection:bg-red-100 selection:text-red-600">
            {/* Floating Header */}
            <div className="absolute left-0 right-0 top-0 z-40 p-4 md:p-6 pointer-events-none">
                <div className="mx-auto max-w-2xl space-y-4 pointer-events-auto">
                    {/* Search Bar Area */}
                    <div className="flex items-center gap-3">
                        <div className="group flex flex-1 items-center gap-3 rounded-[24px] glass px-5 py-4 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-red-500/20">
                            <Search className="text-slate-400 group-focus-within:text-red-500 transition-colors" size={22} />
                            <input
                                type="text"
                                placeholder="병원, 약국, 지역 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                            className="flex h-[60px] w-[60px] items-center justify-center rounded-[24px] glass text-slate-600 hover:text-red-500 transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            {viewMode === 'map' ? <List size={24} /> : <MapIcon size={24} />}
                        </button>
                    </div>

                    {/* Category Pills & Filters */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-sm font-black transition-all shadow-lg ${selectedCategory === cat.id
                                        ? `${cat.activeColor} text-white scale-105 ring-4 ring-white/30`
                                        : 'glass text-slate-600 hover:bg-white'
                                        }`}
                                >
                                    <cat.icon size={18} className={selectedCategory === cat.id ? 'text-white' : cat.color} />
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Quick Filters */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterOpenNow(!filterOpenNow)}
                                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-all shadow-md ${filterOpenNow ? 'bg-slate-900 text-white' : 'glass text-slate-600'}`}
                            >
                                <div className={`h-2 w-2 rounded-full ${filterOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`} />
                                영업중
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="h-full w-full">
                {viewMode === 'map' ? (
                    <div className="h-full w-full">
                        <RawSosMap />

                        {/* Map Overlay Warning */}
                        <div className="absolute bottom-32 left-0 right-0 z-10 px-4 pointer-events-none">
                            <div className="mx-auto max-w-md rounded-2xl glass-dark p-4 text-center shadow-2xl border-white/5">
                                <div className="flex items-center justify-center gap-2 text-white font-bold text-sm">
                                    <AlertCircle size={18} className="text-red-400" />
                                    방문 전 반드시 전화로 확인하세요
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full w-full overflow-y-auto bg-slate-50 px-4 pt-40 pb-32 no-scrollbar">
                        <div className="mx-auto max-w-2xl space-y-6">
                            {/* List Header */}
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-2xl font-black text-slate-900">
                                    {categories.find(c => c.id === selectedCategory)?.label} 목록
                                    <span className="ml-2 text-sm font-bold text-slate-400">{sortedItems.length}개</span>
                                </h2>
                                <button
                                    onClick={() => setSortBy(sortBy === 'distance' ? 'name' : 'distance')}
                                    className="flex items-center gap-1 px-3 py-2 rounded-full glass text-xs font-bold text-slate-600 hover:bg-white transition-colors"
                                >
                                    <ArrowUpDown size={14} />
                                    {sortBy === 'distance' ? '거리순' : '이름순'}
                                </button>
                            </div>

                            {/* List Items */}
                            {sortedItems.length > 0 ? (
                                <div className="grid gap-4">
                                    {sortedItems.map((item) => {
                                        const status = (selectedCategory === 'PHARMACY' || selectedCategory === 'ANIMAL_HOSPITAL')
                                            ? getPharmacyStatus(item)
                                            : null;

                                        return (
                                            <div
                                                key={item.hp_id || item.id}
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setBottomSheetOpen(true);
                                                }}
                                                className="group relative overflow-hidden rounded-[32px] bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{item.name || item.place_name}</h3>
                                                            {item.beds_available !== undefined && (
                                                                <span className={`px-3 py-1 rounded-full text-xs font-black ${item.beds_available > 5 ? 'bg-emerald-100 text-emerald-700' :
                                                                    item.beds_available > 0 ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    병상 {item.beds_available}
                                                                </span>
                                                            )}
                                                            {status && (
                                                                <span className="px-3 py-1 rounded-full text-xs font-black" style={{
                                                                    backgroundColor: `${status.color}20`,
                                                                    color: status.textColor
                                                                }}>
                                                                    {status.icon} {status.message}
                                                                </span>
                                                            )}
                                                            {userLocation && item.distance !== undefined && (
                                                                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700">
                                                                    📍 {formatDistance(item.distance)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                                <MapPin size={16} className="shrink-0 text-slate-300" />
                                                                <span className="truncate">{item.address}</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {item.phone && (
                                                                    <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                                                                        <Phone size={12} />
                                                                        {item.phone}
                                                                    </div>
                                                                )}
                                                                {item.is_24h && (
                                                                    <div className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-600">
                                                                        24시간
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-red-500 group-hover:text-white transition-all shadow-inner">
                                                        <ChevronRight size={24} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-32 text-center">
                                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[40px] bg-slate-100 text-slate-300 animate-pulse">
                                        <Search size={48} />
                                    </div>
                                    <p className="text-xl font-black text-slate-900">검색 결과가 없습니다</p>
                                    <p className="text-slate-400 font-medium mt-2">다른 검색어나 카테고리를 선택해보세요</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Sheet */}
            <SosBottomSheet />

            {/* Floating Action Buttons */}
            <div className="absolute bottom-10 right-6 z-40 flex flex-col gap-4">
                <button className="flex h-14 w-14 items-center justify-center rounded-2xl glass text-slate-600 shadow-2xl hover:text-red-500 transition-all hover:scale-110 active:scale-95">
                    <Bell size={24} />
                </button>
                <a
                    href="tel:119"
                    className="group relative flex h-20 w-20 items-center justify-center rounded-[32px] bg-red-600 text-white shadow-[0_20px_50px_rgba(239,68,68,0.4)] transition-all hover:scale-110 active:scale-95"
                >
                    <div className="absolute inset-0 rounded-[32px] bg-red-600 animate-ping opacity-20 group-hover:opacity-40"></div>
                    <span className="relative text-2xl font-black tracking-tighter">119</span>
                </a>
            </div>
        </div>
    );
}
