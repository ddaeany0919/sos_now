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
    filteredItems?: any[];
}

export default function RawSosMap({ filteredItems }: RawSosMapProps) {
    const mapElement = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markers = useRef<any[]>([]);
    const clusterInstance = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const { selectedCategory, setSelectedItem, setBottomSheetOpen, items, setItems, favorites } = useSosStore();

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

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    if (!window.naver || !window.naver.maps || !mapInstance.current) return;
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const currentPos = new window.naver.maps.LatLng(lat, lng);
                    mapInstance.current.setCenter(currentPos);
                });
            }

            fetchData();
        } catch (error) {
            console.error("RawSosMap: Initialization error", error);
        }
    };

    const fetchData = async () => {
        if (!window.naver || !window.naver.maps) return;

        let data: any[] = [];

        try {
            if (selectedCategory === 'EMERGENCY') {
                const { data: hospitals } = await supabase.from('emergency_hospitals').select('*');
                data = hospitals || [];
            } else if (selectedCategory === 'PHARMACY' || selectedCategory === 'ANIMAL_HOSPITAL') {
                const { data: stores } = await supabase.from('emergency_stores').select('*').eq('type', selectedCategory);
                data = stores || [];
            } else if (selectedCategory === 'AED') {
                const { data: aeds } = await supabase.from('aeds').select('*');
                data = aeds || [];
            } else if (selectedCategory === 'FAVORITES') {
                data = useSosStore.getState().favorites;
            }

            setItems(data);
            updateMarkers(data);
        } catch (error) {
            console.error("RawSosMap: Fetch error", error);
        }
    };

    const getMarkerIcon = (item: any) => {
        let color = '#EF4444';
        let icon = '🚨';
        let label = '';

        if (selectedCategory === 'EMERGENCY') {
            color = item.beds_available > 5 ? '#10B981' : item.beds_available > 0 ? '#F59E0B' : '#EF4444';
            icon = '🏥';
            label = item.beds_available.toString();
        } else if (selectedCategory === 'PHARMACY') {
            const status = getPharmacyStatus(item);
            color = status.color;
            icon = status.icon;
            if (status.status === 'open') {
                label = '';
            }
        } else if (selectedCategory === 'ANIMAL_HOSPITAL') {
            const status = getPharmacyStatus(item);
            color = status.color;
            icon = status.status === 'open' ? '🐶' : '😴';
        } else if (selectedCategory === 'AED') {
            color = '#F59E0B';
            icon = '⚡';
        }

        return `
            <div class="custom-marker" style="
                background: white; 
                padding: 6px 12px; 
                border-radius: 24px; 
                border: 2.5px solid ${color};
                box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: 900;
                white-space: nowrap;
                transition: all 0.2s ease-out;
            ">
                <span style="font-size: 16px;">${icon}</span>
                ${label ? `<span style="color: ${color}; font-size: 14px; letter-spacing: -0.5px;">${label}</span>` : ''}
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

    // filteredItems가 변경될 때만 마커 업데이트
    useEffect(() => {
        if (isMapLoaded && filteredItems && filteredItems.length >= 0) {
            updateMarkers(filteredItems);
        }
    }, [filteredItems]);

    return (
        <>
            <Script
                src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
                strategy="afterInteractive"
                onLoad={() => {
                    console.log("RawSosMap: Naver Maps script loaded");
                    const clusterScript = document.createElement('script');
                    clusterScript.src = 'https://navermaps.github.io/maps.js.ncp/docs/js/MarkerClustering.js';
                    clusterScript.onload = () => {
                        console.log("RawSosMap: MarkerClustering script loaded");
                        initMap();
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
