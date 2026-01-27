'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useSosStore } from '@/store/useSosStore';
import { getPharmacyStatus } from '@/lib/businessHours';
import { getDistance, getCurrentLocation } from '@/lib/distance';
import { MapPin, Navigation } from 'lucide-react';

interface RawSosMapProps {
    searchQuery: string;
    filterOpenNow: boolean;
    viewMode: 'map' | 'list';
}

declare global {
    interface Window {
        naver: any;
        MarkerClustering: any;
    }
}

export default function RawSosMap({ searchQuery, filterOpenNow, viewMode }: RawSosMapProps) {
    const mapElement = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markers = useRef<any[]>([]);
    const clusterer = useRef<any>(null);
    const userMarker = useRef<any>(null);
    const userAccuracyCircle = useRef<any>(null);
    const hasAutoCentered = useRef(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const {
        selectedCategory, setSelectedItem, setBottomSheetOpen,
        items, userLocation, setUserLocation, locationMode
    } = useSosStore();

    const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Initialize Map
    useEffect(() => {
        if (!isScriptLoaded || !mapElement.current || mapInstance.current) return;

        const naver = window.naver;
        const mapOptions = {
            center: new naver.maps.LatLng(37.5665, 126.9780),
            zoom: 15,
            minZoom: 7,
            zoomControl: true,
            zoomControlOptions: {
                position: naver.maps.Position.TOP_RIGHT
            },
            mapTypeControl: true
        };

        mapInstance.current = new naver.maps.Map(mapElement.current, mapOptions);
        setIsMapLoaded(true);

        // Handle manual location setting by moving map
        if (locationMode === 'manual') {
            naver.maps.Event.addListener(mapInstance.current, 'dragend', () => {
                const center = mapInstance.current.getCenter();
                setUserLocation({
                    lat: center.lat(),
                    lng: center.lng(),
                    accuracy: 0,
                    isManual: true
                });
            });
        }

        return () => {
            if (mapInstance.current) {
                naver.maps.Event.clearInstanceListeners(mapInstance.current);
            }
        };
    }, [isScriptLoaded]);

    const handleCenterToUser = () => {
        if (!mapInstance.current || !userLocation) return;
        const naver = window.naver;
        mapInstance.current.setCenter(new naver.maps.LatLng(userLocation.lat, userLocation.lng));
        mapInstance.current.setZoom(16);
    };

    // Listen for custom event to center map
    useEffect(() => {
        const handleCenterEvent = () => handleCenterToUser();
        window.addEventListener('centerToUser', handleCenterEvent);
        return () => window.removeEventListener('centerToUser', handleCenterEvent);
    }, [isMapLoaded, userLocation]);

    // Update Markers when items or filters change
    useEffect(() => {
        if (isMapLoaded && items) {
            const naver = window.naver;

            const updateMarkers = (filteredItems: any[]) => {
                // Clear existing markers
                markers.current.forEach(m => m.setMap(null));
                markers.current = [];

                if (clusterer.current) {
                    clusterer.current.setMap(null);
                }

                const newMarkers = filteredItems.map(item => {
                    const status = (selectedCategory === 'PHARMACY' || selectedCategory === 'ANIMAL_HOSPITAL')
                        ? getPharmacyStatus(item)
                        : null;

                    const marker = new naver.maps.Marker({
                        position: new naver.maps.LatLng(item.lat, item.lng),
                        map: mapInstance.current,
                        title: item.name || item.place_name,
                        icon: {
                            content: `
                                <div class="marker-container" style="cursor: pointer; position: relative;">
                                    <div class="marker-outer" style="
                                        background: ${selectedCategory === 'EMERGENCY' ? '#EF4444' :
                                    selectedCategory === 'PHARMACY' ? '#10B981' :
                                        selectedCategory === 'ANIMAL_HOSPITAL' ? '#3B82F6' : '#F59E0B'};
                                        width: 32px; height: 32px; border-radius: 12px 12px 12px 0;
                                        transform: rotate(-45deg);
                                        display: flex; align-items: center; justify-content: center;
                                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                                        border: 2px solid white;
                                        transition: all 0.2s ease;
                                    ">
                                        <div style="transform: rotate(45deg); color: white; display: flex; align-items: center; justify-content: center;">
                                            ${selectedCategory === 'EMERGENCY' ? `
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>
                                            ` : selectedCategory === 'PHARMACY' ? `
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                                            ` : selectedCategory === 'ANIMAL_HOSPITAL' ? `
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9C6 9 4 10 4 13C4 16 6 17 6 17L11 13V5Z"/><path d="M13 5L18 9C18 9 20 10 20 13C20 16 18 17 18 17L13 13V5Z"/><path d="M12 14C12 14 11 16 11 18C11 20 12 21 12 21C12 21 13 20 13 18C13 16 12 14 12 14Z"/></svg>
                                            ` : `
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                            `}
                                        </div>
                                    </div>
                                    ${status ? `
                                        <div style="position: absolute; top: -24px; left: 50%; transform: translateX(-50%);
                                            background: white; padding: 2px 10px; border-radius: 12px; font-size: 10px; font-weight: 900;
                                            box-shadow: 0 4px 10px rgba(0,0,0,0.15); white-space: nowrap; color: ${status.textColor};
                                            border: 1px solid ${status.color};">
                                            ${status.icon} ${status.message}
                                        </div>
                                    ` : ''}
                                </div>
                            `,
                            anchor: new naver.maps.Point(16, 32)
                        }
                    });

                    naver.maps.Event.addListener(marker, 'click', () => {
                        setSelectedItem(item);
                        setBottomSheetOpen(true);
                        mapInstance.current.panTo(marker.getPosition());
                    });

                    return marker;
                });

                markers.current = newMarkers;

                // Initialize Clustering
                if (window.MarkerClustering) {
                    const clusterColor = selectedCategory === 'EMERGENCY' ? 'rgba(239,68,68,0.95)' :
                        selectedCategory === 'PHARMACY' ? 'rgba(16,185,129,0.95)' :
                            selectedCategory === 'ANIMAL_HOSPITAL' ? 'rgba(59,130,246,0.95)' : 'rgba(245,158,11,0.95)';

                    clusterer.current = new window.MarkerClustering({
                        minClusterSize: 2,
                        maxZoom: 16,
                        map: mapInstance.current,
                        markers: newMarkers,
                        disableClickZoom: false,
                        gridSize: 120,
                        icons: [
                            {
                                content: `<div style="cursor:pointer;width:44px;height:44px;background:${clusterColor};border-radius:50%;border:3px solid white;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:900;"></div>`,
                                size: new naver.maps.Size(44, 44),
                                anchor: new naver.maps.Point(22, 22)
                            }
                        ],
                        indexGenerator: [10, 100, 200, 500, 1000],
                        stylingFunction: (clusterHtml: any, count: number) => {
                            const element = clusterHtml.jquery ? clusterHtml[0] : clusterHtml;
                            if (element && typeof element === 'object') {
                                if ('innerHTML' in element) element.innerHTML = count.toString();
                                if (element.style) {
                                    element.style.display = 'flex';
                                    element.style.alignItems = 'center';
                                    element.style.justifyContent = 'center';
                                    element.style.color = 'white';
                                    element.style.fontWeight = '900';
                                }
                            }
                        }
                    });
                }
            };

            const searchAddressToCoordinate = (address: string) => {
                naver.maps.Service.geocode({ query: address }, (status: any, response: any) => {
                    if (status === naver.maps.Service.Status.OK) {
                        const item = response.v2.addresses[0];
                        const point = new naver.maps.Point(item.x, item.y);
                        mapInstance.current.setCenter(point);
                        mapInstance.current.setZoom(15);
                    }
                });
            };

            const filtered = items.filter(item => {
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

            const limitedItems = filtered.slice(0, 1000);
            const timer = setTimeout(() => {
                updateMarkers(limitedItems);
            }, 100);

            if (searchQuery.length > 1) {
                if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
                searchDebounceTimer.current = setTimeout(() => {
                    searchAddressToCoordinate(searchQuery);
                }, 800);
            }

            return () => clearTimeout(timer);
        }
    }, [searchQuery, filterOpenNow, items, isMapLoaded, selectedCategory]);

    // Update User Location Marker
    useEffect(() => {
        if (!isMapLoaded || !userLocation || !window.naver || !window.naver.maps || !mapInstance.current) return;

        const naver = window.naver;
        const position = new naver.maps.LatLng(userLocation.lat, userLocation.lng);

        if (!userMarker.current) {
            userMarker.current = new naver.maps.Marker({
                position,
                map: mapInstance.current,
                icon: {
                    content: `
                        <div style="position: relative; width: 24px; height: 24px;">
                            <div class="user-pulse" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #3B82F6; border-radius: 50%; opacity: 0.4;"></div>
                            <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background: #3B82F6; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
                        </div>
                        <style>
                            @keyframes user-pulse-anim {
                                0% { transform: scale(1); opacity: 0.4; }
                                70% { transform: scale(3); opacity: 0; }
                                100% { transform: scale(1); opacity: 0; }
                            }
                            .user-pulse {
                                animation: user-pulse-anim 2s infinite;
                            }
                        </style>
                    `,
                    anchor: new naver.maps.Point(12, 12)
                },
                zIndex: 1000
            });

            userAccuracyCircle.current = new naver.maps.Circle({
                map: mapInstance.current,
                center: position,
                radius: userLocation.accuracy,
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                strokeColor: '#3B82F6',
                strokeOpacity: 0.2,
                strokeWeight: 1,
                clickable: false
            });
        } else {
            userMarker.current.setPosition(position);
            if (userAccuracyCircle.current) {
                userAccuracyCircle.current.setCenter(position);
                userAccuracyCircle.current.setRadius(userLocation.accuracy);
            }
        }
    }, [userLocation, isMapLoaded]);

    // Auto-center on user location when first loaded
    useEffect(() => {
        if (isMapLoaded && userLocation && !hasAutoCentered.current) {
            handleCenterToUser();
            hasAutoCentered.current = true;
        }
    }, [isMapLoaded, userLocation]);

    return (
        <>
            <Script
                src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`}
                strategy="afterInteractive"
                onLoad={() => {
                    const clusterScript = document.createElement('script');
                    clusterScript.src = 'https://navermaps.github.io/maps.js.ncp/docs/js/MarkerClustering.js';
                    clusterScript.onload = () => {
                        setIsScriptLoaded(true);
                    };
                    document.head.appendChild(clusterScript);
                }}
            />
            <div className="relative h-full w-full bg-slate-100">
                <div ref={mapElement} className="h-full w-full" />

                {!isMapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Map...</p>
                        </div>
                    </div>
                )}

                {locationMode === 'manual' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div className="relative flex flex-col items-center -translate-y-1/2">
                            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black mb-2 shadow-2xl animate-bounce">
                                이 위치로 설정
                            </div>
                            <div className="relative">
                                <MapPin size={40} className="text-red-500 drop-shadow-2xl" fill="currentColor" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-black/20 rounded-full blur-[1px]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
