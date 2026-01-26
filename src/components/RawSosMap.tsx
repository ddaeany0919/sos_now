'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useSosStore } from '@/store/useSosStore';
import { supabase } from '@/lib/supabase';
import { getPharmacyStatus } from '@/lib/businessHours';

declare global {
    interface Window {
        naver: any;
        MarkerClustering: any;
    }
}

interface RawSosMapProps {
    searchQuery?: string;
    filterOpenNow?: boolean;
    viewMode?: 'map' | 'list';
}

export default function RawSosMap({ searchQuery = '', filterOpenNow = false, viewMode = 'map' }: RawSosMapProps) {
    const mapElement = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markers = useRef<any[]>([]);
    const clusterInstance = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const { selectedCategory, setSelectedItem, setBottomSheetOpen, items, setItems, favorites, setIsLoading } = useSosStore();

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    const initMap = () => {
        console.log("RawSosMap: initMap called");
        if (!mapElement.current || !window.naver || !window.naver.maps) {
            console.log("RawSosMap: Dependencies not ready for initMap");
            return;
        }

        if (mapInstance.current) {
            console.log("RawSosMap: Map already initialized");
            return;
        }

        const naver = window.naver;
        const location = new naver.maps.LatLng(37.5665, 126.9780);
        const mapOptions = {
            center: location,
            zoom: 14,
            minZoom: 7,
            maxZoom: 19,
            zoomControl: true,
            zoomControlOptions: {
                position: naver.maps.Position.RIGHT_CENTER,
                style: naver.maps.ZoomControlStyle.SMALL
            },
            mapTypeControl: false,
        };

        try {
            mapInstance.current = new naver.maps.Map(mapElement.current, mapOptions);
            console.log("RawSosMap: Map instance created");
            setIsMapLoaded(true);

            // Add click listener to close bottom sheet when clicking on the map
            naver.maps.Event.addListener(mapInstance.current, 'click', () => {
                setBottomSheetOpen(false);
            });

            // Add idle listener for bounds-based fetching
            naver.maps.Event.addListener(mapInstance.current, 'idle', () => {
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
                debounceTimer.current = setTimeout(() => {
                    fetchData();
                }, 300);
            });

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    if (!window.naver || !window.naver.maps || !mapInstance.current) return;
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const currentPos = new window.naver.maps.LatLng(lat, lng);
                    mapInstance.current.setCenter(currentPos);
                });
            }

            // Initial fetch
            fetchData();
        } catch (error) {
            console.error("RawSosMap: Initialization error", error);
        }
    };

    const fetchData = async () => {
        if (!window.naver || !window.naver.maps || !mapInstance.current) return;

        setIsLoading(true);
        let data: any[] = [];
        const bounds = mapInstance.current.getBounds();
        const minLat = bounds._min.y;
        const maxLat = bounds._max.y;
        const minLng = bounds._min.x;
        const maxLng = bounds._max.x;

        try {
            let query: any;

            if (selectedCategory === 'EMERGENCY') {
                query = supabase.from('emergency_hospitals').select('*');
            } else if (selectedCategory === 'PHARMACY' || selectedCategory === 'ANIMAL_HOSPITAL') {
                query = supabase.from('emergency_stores').select('*').eq('type', selectedCategory);
            } else if (selectedCategory === 'AED') {
                query = supabase.from('aeds').select('*');
            } else if (selectedCategory === 'FAVORITES') {
                data = useSosStore.getState().favorites;
                setItems(data);
                updateMarkers(data);
                setIsLoading(false);
                return;
            }

            // Apply bounds filter
            if (query) {
                query = query.gte('lat', minLat).lte('lat', maxLat)
                    .gte('lng', minLng).lte('lng', maxLng);

                const { data: result, error } = await query;
                if (error) throw error;
                data = result || [];
            }

            // Always update global state regardless of viewMode
            setItems(data);

            // 초기 마커 업데이트 (필터링 없이)
            updateMarkers(data);
        } catch (error) {
            console.error("RawSosMap: Fetch error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const searchAddressToCoordinate = (address: string) => {
        if (!window.naver || !window.naver.maps || !window.naver.maps.Service) return;

        window.naver.maps.Service.geocode({
            query: address
        }, function (status: any, response: any) {
            if (status !== window.naver.maps.Service.Status.OK) {
                return console.log('Geocode Error');
            }

            const result = response.v2.addresses[0];
            if (result) {
                const point = new window.naver.maps.Point(result.x, result.y);
                mapInstance.current.setCenter(point);
                mapInstance.current.setZoom(15);
            }
        });
    };

    const getMarkerIcon = (item: any) => {
        let label = '';
        let borderColor = '#EF4444'; // Default Red
        let symbol = '';
        let symbolColor = '#EF4444';

        if (selectedCategory === 'EMERGENCY') {
            borderColor = '#EF4444'; // Red
            symbolColor = '#EF4444';
            symbol = '✚';
        } else if (selectedCategory === 'PHARMACY') {
            borderColor = '#10B981'; // Green
            symbolColor = '#10B981';
            symbol = '💊';
        } else if (selectedCategory === 'ANIMAL_HOSPITAL') {
            borderColor = '#3B82F6'; // Blue
            symbolColor = '#3B82F6';
            symbol = '🐶';
        } else if (selectedCategory === 'AED') {
            borderColor = '#F59E0B'; // Orange
            symbolColor = '#F59E0B';
            // Custom SVG for Heart with Lightning Bolt
            symbol = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${symbolColor}"/>
                    <path d="M11.5 16l1-5h-2.5l1.5-5-4 5h2.5l-1.5 5h3z" fill="white" stroke="white" stroke-width="1.5"/>
                </svg>
            `;
        }

        const content = label || symbol;

        return `
            <div class="custom-marker" style="
                width: 44px;
                height: 44px;
                background: white;
                border: 4px solid ${borderColor};
                border-radius: 50%;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${label ? '16px' : '22px'};
                font-weight: 900;
                color: ${symbolColor};
                transition: all 0.2s ease-out;
            ">
                ${content}
            </div>
        `;
    };

    const updateMarkers = (data: any[]) => {
        if (!window.naver || !window.naver.maps || !mapInstance.current) return;

        const naver = window.naver;

        markers.current.forEach(m => m.setMap(null));
        markers.current = [];
        if (clusterInstance.current) {
            clusterInstance.current.setMap(null);
        }

        const newMarkers = data.map(item => {
            const marker = new naver.maps.Marker({
                position: new naver.maps.LatLng(item.lat, item.lng),
                title: item.name || item.place_name,
                icon: {
                    content: getMarkerIcon(item),
                    anchor: new naver.maps.Point(20, 20)
                }
            });

            naver.maps.Event.addListener(marker, 'click', () => {
                setSelectedItem(item);
                setBottomSheetOpen(true);
            });

            return marker;
        });

        markers.current = newMarkers;

        if (window.MarkerClustering) {
            clusterInstance.current = new window.MarkerClustering({
                minClusterSize: 2,
                maxZoom: 16,
                map: mapInstance.current,
                markers: newMarkers,
                disableClickZoom: false,
                gridSize: 120,
                icons: [
                    {
                        content: `<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:14px;color:white;text-align:center;font-weight:900;background:rgba(239,68,68,0.9);border:3px solid white;border-radius:50%;box-shadow:0 4px 15px rgba(239,68,68,0.4);"></div>`,
                        size: new naver.maps.Size(40, 40),
                        anchor: new naver.maps.Point(20, 20)
                    },
                    {
                        content: `<div style="cursor:pointer;width:50px;height:50px;line-height:52px;font-size:16px;color:white;text-align:center;font-weight:900;background:rgba(239,68,68,1);border:4px solid white;border-radius:50%;box-shadow:0 6px 20px rgba(239,68,68,0.5);"></div>`,
                        size: new naver.maps.Size(50, 50),
                        anchor: new naver.maps.Point(25, 25)
                    }
                ],
                indexGenerator: [10, 100],
                stylingFunction: (clusterMarker: any, count: number) => {
                    clusterMarker.getElement().querySelector('div').textContent = count;
                }
            });
        } else {
            newMarkers.forEach(m => m.setMap(mapInstance.current));
        }
    };

    useEffect(() => {
        if (isMapLoaded) {
            fetchData();
        }
    }, [selectedCategory, favorites, isMapLoaded]);

    // Initialize map when script is loaded
    useEffect(() => {
        if (isScriptLoaded && !isMapLoaded) {
            initMap();
        }
    }, [isScriptLoaded, isMapLoaded]);

    // 검색/필터 변경 시 마커만 업데이트 (데이터 재로딩 없이)
    useEffect(() => {
        if (isMapLoaded) {
            // Local filtering first
            if (items.length > 0) {
                const filtered = items.filter(item => {
                    const name = item.name || item.place_name || '';
                    const address = item.address || '';
                    const roadAddress = item.road_address || '';
                    const query = searchQuery.toLowerCase();

                    const matchesSearch =
                        name.toLowerCase().includes(query) ||
                        address.toLowerCase().includes(query) ||
                        roadAddress.toLowerCase().includes(query);

                    if (!matchesSearch) return false;

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

                updateMarkers(filtered);
            }

            // If search query exists and is long enough, try geocoding
            if (searchQuery.length > 1) {
                if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
                searchDebounceTimer.current = setTimeout(() => {
                    // Only geocode if we suspect it's a location (simple heuristic or just always try if user pauses)
                    // For now, let's try geocoding if local results are few or user explicitly types a region name
                    searchAddressToCoordinate(searchQuery);
                }, 800);
            }
        }
    }, [searchQuery, filterOpenNow, items, isMapLoaded]);

    return (
        <>
            <Script
                src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`}
                strategy="afterInteractive"
                onLoad={() => {
                    console.log("RawSosMap: Naver Maps script loaded");
                    const clusterScript = document.createElement('script');
                    clusterScript.src = 'https://navermaps.github.io/maps.js.ncp/docs/js/MarkerClustering.js';
                    clusterScript.onload = () => {
                        console.log("RawSosMap: MarkerClustering script loaded");
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
            </div>
        </>
    );
}
