'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, Map as MapIcon, List, Bell, Navigation, MapPin, ChevronRight, AlertCircle, ArrowUpDown, X, Settings } from 'lucide-react';
import RawSosMap from '@/components/RawSosMap';
import SosBottomSheet from '@/components/SosBottomSheet';
import LocationSettingModal from '@/components/LocationSettingModal';
import SplashScreen from '@/components/SplashScreen';
import { useSosStore } from '@/store/useSosStore';
import { getPharmacyStatus } from '@/lib/businessHours';
import { getDistance, sortByDistance, formatDistance, getCurrentLocation } from '@/lib/distance';
import { fetchHospitalList, fetchRealtimeBeds, fetchPharmacyList, fetchAEDList, fetchAnimalHospitalList } from '@/lib/nemcApi';

const categories = [
    { id: 'EMERGENCY', label: '응급실', icon: AlertCircle, activeColor: 'bg-red-500' },
    { id: 'PHARMACY', label: '약국', icon: MapPin, activeColor: 'bg-emerald-500' },
    { id: 'ANIMAL_HOSPITAL', label: '동물병원', icon: MapPin, activeColor: 'bg-blue-500' },
    { id: 'AED', label: 'AED', icon: MapPin, activeColor: 'bg-amber-500' },
    { id: 'FAVORITES', label: '즐겨찾기', icon: Bell, activeColor: 'bg-rose-500' },
];

export default function MapPage() {
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpenNow, setFilterOpenNow] = useState(false);
    const [distanceFilter, setDistanceFilter] = useState<number | 'all'>(3);
    const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
    const [showSplash, setShowSplash] = useState(true);
    const [visibleCount, setVisibleCount] = useState(10);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    const {
        selectedCategory, setSelectedCategory,
        items, setSelectedItem, setBottomSheetOpen,
        userLocation, setUserLocation, isLoading, setIsLoading, locationMode
    } = useSosStore();

    const [isHoveringLocation, setIsHoveringLocation] = useState(false);
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastFetchedCategory = useRef<string | null>(null);

    // Listen for custom event to open location settings
    useEffect(() => {
        const handleOpenSettings = () => setIsLocationModalOpen(true);
        window.addEventListener('openLocationSettings', handleOpenSettings);
        return () => window.removeEventListener('openLocationSettings', handleOpenSettings);
    }, []);

    // Get user location
    useEffect(() => {
        getCurrentLocation()
            .then(loc => setUserLocation(loc))
            .catch(err => console.error("Location error:", err));
    }, []);

    // Fetch data based on category
    useEffect(() => {
        setVisibleCount(10);
        if (selectedCategory !== 'FAVORITES') {
            useSosStore.getState().setItems([]);
        }

        const fetchData = async () => {
            const currentCat = selectedCategory;
            if (lastFetchedCategory.current === currentCat && items.length > 0) return;

            setIsLoading(true);
            try {
                let data: any[] = [];
                if (currentCat === 'EMERGENCY') {
                    const [hospitals, realtime] = await Promise.all([
                        fetchHospitalList(),
                        fetchRealtimeBeds()
                    ]);

                    data = hospitals.map((h: any) => {
                        const status = realtime.find((r: any) => r.hpid === h.hpid);
                        return {
                            ...h,
                            lat: h.wgs84Lat,
                            lng: h.wgs84Lon,
                            name: h.dutyName,
                            address: h.dutyAddr,
                            beds_available: status ? status.hvec : 0,
                            type: 'EMERGENCY'
                        };
                    });
                } else if (currentCat === 'PHARMACY') {
                    const pharmacies = await fetchPharmacyList();
                    data = pharmacies.map((p: any) => ({
                        ...p,
                        lat: p.wgs84Lat,
                        lng: p.wgs84Lon,
                        name: p.dutyName,
                        address: p.dutyAddr,
                        type: 'PHARMACY'
                    }));
                } else if (currentCat === 'AED') {
                    const aeds = await fetchAEDList();
                    data = aeds.map((a: any) => ({
                        ...a,
                        lat: a.wgs84Lat,
                        lng: a.wgs84Lon,
                        name: a.buildPlace,
                        address: a.buildAddr,
                        type: 'AED'
                    }));
                } else if (currentCat === 'ANIMAL_HOSPITAL') {
                    const animals = await fetchAnimalHospitalList();
                    data = animals.map((a: any) => ({
                        ...a,
                        lat: parseFloat(a.lat),
                        lng: parseFloat(a.lon),
                        name: a.bplcNm,
                        address: a.rdnWhlAddr || a.siteWhlAddr,
                        type: 'ANIMAL_HOSPITAL'
                    }));
                } else if (currentCat === 'FAVORITES') {
                    // Favorites are handled by the store
                    return;
                }

                // Only update if the category is still the same
                if (useSosStore.getState().selectedCategory === currentCat) {
                    const validData = data.filter(item => item.lat && item.lng);
                    useSosStore.getState().setItems(validData);
                    lastFetchedCategory.current = currentCat;
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                if (useSosStore.getState().selectedCategory === currentCat) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
    }, [selectedCategory]);

    // Infinite scroll for list view
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev + 10);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [viewMode]);

    const handleMouseEnter = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setIsHoveringLocation(true);
    };

    const handleMouseLeave = () => {
        hoverTimeout.current = setTimeout(() => {
            setIsHoveringLocation(false);
        }, 5000);
    };

    const handleCenterToUser = () => {
        window.dispatchEvent(new CustomEvent('centerToUser'));
    };

    const filteredItems = items.filter(item => {
        // Ensure item matches selected category (except for Favorites)
        if (selectedCategory !== 'FAVORITES' && item.type !== selectedCategory) return false;

        const matchesSearch = (item.name || item.place_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.address || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (distanceFilter !== 'all' && userLocation) {
            const dist = getDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);
            if (dist > (distanceFilter as number)) return false;
        }

        if (filterOpenNow) {
            if (selectedCategory === 'EMERGENCY') return true;
            if (item.is_24h) return true;
            if (selectedCategory === 'PHARMACY' || selectedCategory === 'ANIMAL_HOSPITAL') {
                const status = getPharmacyStatus(item);
                return status.status === 'open' || status.status === 'closing-soon';
            }
        }
        return true;
    });

    const sortedItems = (() => {
        let sorted = [...filteredItems];
        if (sortBy === 'distance' && userLocation) {
            sorted = sortByDistance(sorted, userLocation.lat, userLocation.lng);
        } else if (sortBy === 'name') {
            sorted.sort((a, b) => (a.name || a.place_name || '').localeCompare(b.name || b.place_name || ''));
        }
        return sorted;
    })();

    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-50 font-sans selection:bg-red-100 selection:text-red-600">
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

            {/* Floating Header */}
            <div className="absolute left-0 right-0 top-0 z-50 pointer-events-none">
                <div className={`absolute inset-0 bg-slate-50/90 backdrop-blur-xl transition-opacity duration-300 ${viewMode === 'list' ? 'opacity-100' : 'opacity-0'}`} />

                <div className="relative mx-auto max-w-2xl p-4 space-y-3 pointer-events-auto">
                    {/* Search & Mode Toggle */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-3 rounded-2xl glass px-4 py-3 shadow-xl focus-within:ring-2 focus-within:ring-red-500/20">
                            <Search className="text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="병원, 약국, 지역 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-base font-bold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                            className="h-[52px] w-[52px] flex items-center justify-center rounded-2xl glass text-slate-600 shadow-xl hover:text-red-500 transition-all"
                        >
                            {viewMode === 'map' ? <List size={22} /> : <MapIcon size={22} />}
                        </button>
                    </div>

                    {/* Filters Row */}
                    <div className="space-y-2">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-black transition-all shadow-md ${selectedCategory === cat.id ? `${cat.activeColor} text-white` : 'glass text-slate-600'}`}
                                >
                                    <cat.icon size={12} /> {cat.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setFilterOpenNow(!filterOpenNow)}
                                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-black transition-all shadow-sm ${filterOpenNow ? 'bg-slate-900 text-white' : 'glass text-slate-600'}`}
                            >
                                <div className={`h-1 w-1 rounded-full ${filterOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`} /> 영업중
                            </button>
                            <div className="h-3 w-[1px] bg-slate-200 shrink-0" />
                            {[1, 3, 5, 10, 'all'].map((dist) => (
                                <button
                                    key={dist}
                                    onClick={() => setDistanceFilter(dist as any)}
                                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-black transition-all shadow-sm ${distanceFilter === dist ? 'bg-slate-900 text-white' : 'glass text-slate-600'}`}
                                >
                                    {dist === 'all' ? '전체' : `${dist}km`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="h-full w-full">
                {/* Map View */}
                <div className={`h-full w-full ${viewMode === 'map' ? 'block' : 'hidden'}`}>
                    <RawSosMap searchQuery={searchQuery} filterOpenNow={filterOpenNow} viewMode={viewMode} />
                    <div className="absolute bottom-28 left-0 right-0 z-10 px-4 pointer-events-none">
                        <div className="mx-auto max-w-[240px] rounded-xl bg-slate-900/80 backdrop-blur-md p-2 text-center shadow-2xl border border-white/10">
                            <div className="flex items-center justify-center gap-1.5 text-white font-bold text-[10px]">
                                <AlertCircle size={12} className="text-red-400" /> 방문 전 반드시 전화로 확인하세요
                            </div>
                        </div>
                    </div>
                </div>

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="h-full w-full overflow-y-auto bg-slate-50 px-4 pt-[200px] pb-32 no-scrollbar scroll-smooth">
                        <div className="mx-auto max-w-2xl space-y-4">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-28 w-full rounded-3xl bg-white animate-pulse shadow-sm border border-slate-100" />
                                    ))}
                                </div>
                            ) : sortedItems.length > 0 ? (
                                <>
                                    <div className="flex items-center justify-between px-2 mb-2">
                                        <h2 className="text-lg font-black text-slate-900">{categories.find(c => c.id === selectedCategory)?.label} {sortedItems.length}개</h2>
                                        <button onClick={() => setSortBy(sortBy === 'distance' ? 'name' : 'distance')} className="flex items-center gap-1 text-[10px] font-black text-slate-500 glass px-2 py-1 rounded-lg">
                                            <ArrowUpDown size={10} /> {sortBy === 'distance' ? '거리순' : '이름순'}
                                        </button>
                                    </div>
                                    <div className="grid gap-3">
                                        {sortedItems.slice(0, visibleCount).map((item, index) => {
                                            const status = (selectedCategory === 'PHARMACY' || selectedCategory === 'ANIMAL_HOSPITAL' || (selectedCategory === 'FAVORITES' && (item.type === 'PHARMACY' || item.type === 'ANIMAL_HOSPITAL'))) ? getPharmacyStatus(item) : null;
                                            let itemCat = categories.find(c => c.id === selectedCategory);
                                            if (selectedCategory === 'FAVORITES') {
                                                if (item.hp_id) itemCat = categories.find(c => c.id === 'EMERGENCY');
                                                else if (item.type === 'PHARMACY') itemCat = categories.find(c => c.id === 'PHARMACY');
                                                else if (item.type === 'ANIMAL_HOSPITAL') itemCat = categories.find(c => c.id === 'ANIMAL_HOSPITAL');
                                                else itemCat = categories.find(c => c.id === 'AED');
                                            }
                                            const isAed = itemCat?.id === 'AED';
                                            return (
                                                <div key={item.hp_id || item.id || index} onClick={() => { setSelectedItem(item); setBottomSheetOpen(true); }} className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                <h3 className="text-base font-black text-slate-900 truncate">{isAed ? item.address : (item.name || item.place_name)}</h3>
                                                                {selectedCategory === 'FAVORITES' && itemCat && <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black ${itemCat.activeColor} text-white`}>{itemCat.label}</span>}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
                                                                <MapPin size={12} className="shrink-0" /> <span className="truncate">{isAed ? item.place_name : item.address}</span>
                                                            </div>
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {userLocation && item.distance !== undefined && <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-600">📍 {formatDistance(item.distance)}</span>}
                                                                {status && <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ backgroundColor: `${status.color}15`, color: status.textColor }}>{status.icon} {status.message}</span>}
                                                                {item.beds_available !== undefined && <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${item.beds_available > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>병상 {item.beds_available}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-300 group-hover:bg-red-500 group-hover:text-white transition-all">
                                                            <ChevronRight size={20} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {visibleCount < sortedItems.length && <div ref={observerTarget} className="h-10 flex items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-400"><Search size={24} /></div>
                                    <h3 className="text-base font-bold text-slate-900">검색 결과가 없습니다</h3>
                                    <button onClick={() => { setSearchQuery(''); setDistanceFilter('all'); setFilterOpenNow(false); }} className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-lg">필터 초기화</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <LocationSettingModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
            <SosBottomSheet />

            {/* Floating Buttons Stack */}
            <div className="absolute bottom-8 right-6 z-40 flex flex-col items-center gap-4">
                {/* Location Button with Tooltip */}
                <div className="relative flex flex-col items-center">
                    <div
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className={`absolute bottom-full right-0 mb-3 transition-all duration-300 ${isHoveringLocation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                    >
                        <div className="bg-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-2 min-w-[100px]">
                            <span className="text-[11px] font-bold text-slate-900 text-center leading-tight">위치가<br />다른가요?</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLocationModalOpen(true);
                                    setIsHoveringLocation(false);
                                }}
                                className="text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                            >
                                위치 설정
                            </button>
                        </div>
                        <div className="absolute -bottom-1 right-5 w-2.5 h-2.5 bg-white border-r border-b border-slate-100 rotate-45"></div>
                    </div>

                    <button
                        onClick={handleCenterToUser}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white shadow-xl border border-slate-100 text-slate-600 hover:text-blue-600 transition-all active:scale-95"
                    >
                        <Navigation size={22} className={locationMode === 'auto' ? 'fill-blue-600 text-blue-600' : ''} />
                    </button>
                </div>

                <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl border border-slate-100 text-slate-600 hover:text-red-500 transition-all">
                    <Bell size={22} />
                </button>

                <a href="tel:119" className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-[0_10px_30px_rgba(239,68,68,0.4)] transition-all active:scale-95">
                    <div className="absolute inset-0 rounded-2xl bg-red-600 animate-ping opacity-20"></div>
                    <span className="relative text-xl font-black">119</span>
                </a>
            </div>
        </div>
    );
}
