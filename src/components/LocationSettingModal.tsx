'use client';

import { useState } from 'react';
import { X, Navigation, MapPin, Check, Info, RefreshCw } from 'lucide-react';
import { useSosStore } from '@/store/useSosStore';
import { getCurrentLocation } from '@/lib/distance';

interface LocationSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LocationSettingModal({ isOpen, onClose }: LocationSettingModalProps) {
    const {
        locationMode, setLocationMode,
        manualLocation, setManualLocation,
        setUserLocation
    } = useSosStore();

    const [tempMode, setTempMode] = useState<'auto' | 'manual'>(locationMode);

    if (!isOpen) return null;

    const handleSave = () => {
        setLocationMode(tempMode);
        if (tempMode === 'auto') {
            getCurrentLocation().then(loc => setUserLocation(loc));
        }
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[90] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Side Panel */}
            <div className={`fixed left-0 top-0 bottom-0 z-[100] w-full max-w-[360px] bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="mr-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-black text-slate-900">접속 위치 설정</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="h-[calc(100%-160px)] overflow-y-auto p-6 space-y-8 no-scrollbar">
                    <div className="space-y-4">
                        {/* Auto Option */}
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                id="mode-auto"
                                checked={tempMode === 'auto'}
                                onChange={() => setTempMode('auto')}
                                className="h-5 w-5 accent-blue-600"
                            />
                            <label htmlFor="mode-auto" className="text-base font-bold text-slate-900 cursor-pointer">자동</label>
                        </div>

                        {/* Manual Option */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    id="mode-manual"
                                    checked={tempMode === 'manual'}
                                    onChange={() => setTempMode('manual')}
                                    className="h-5 w-5 accent-blue-600"
                                />
                                <label htmlFor="mode-manual" className="text-base font-bold text-slate-900 cursor-pointer">직접 설정</label>
                            </div>

                            <div className="ml-8 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                                <span className="text-xs text-slate-500 font-medium">
                                    {manualLocation ? `설정된 위치: 있음` : '설정한 위치 : 없음'}
                                </span>
                                <button
                                    onClick={() => setManualLocation(null)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-white px-2 py-1 rounded-full border border-slate-200 shadow-sm"
                                >
                                    <RefreshCw size={10} /> 초기화
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                            <p className="text-sm font-black text-slate-900">자동</p>
                            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                                네이버지도 PC버전은 기본적으로 이용자의 IP 주소로 예측한 접속 위치를 제공합니다. 따라서 정확한 접속 위치 제공에 어려움이 있을 수 있습니다.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-black text-slate-900">직접 설정</p>
                            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                                만약 [자동] 상태에서 실제 접속 위치와 다른 위치의 지도가 노출될 경우, [직접 설정]을 선택한 뒤 지도를 움직여서 원하는 위치로 옮긴 뒤 저장해 주세요.
                            </p>
                            <p className="text-[11px] leading-relaxed text-slate-500 font-medium mt-2">
                                네이버지도에 처음 접속하거나 화면 오른쪽 아래의 접속 위치 버튼을 누를 때, 직접 설정한 위치의 지도 화면을 보여드립니다.
                            </p>
                            <p className="text-[11px] leading-relaxed text-slate-400 font-medium mt-2">
                                직접 설정 시, 지도를 확대/축소한 정도는 저장되지 않는 점 참고 부탁드립니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        className="w-full h-12 rounded-lg bg-slate-200 text-slate-400 font-black hover:bg-blue-600 hover:text-white transition-all"
                    >
                        저장
                    </button>
                </div>
            </div>
        </>
    );
}
