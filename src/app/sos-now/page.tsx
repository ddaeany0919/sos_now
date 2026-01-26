'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type TabType = 'HOSPITAL' | 'PHARMACY' | 'AED' | 'ANIMAL_HOSPITAL';

export default function SosNowAdmin() {
    const [items, setItems] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('HOSPITAL');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const fetchData = async (tab: TabType) => {
        setLoading(true);
        let query;
        if (tab === 'HOSPITAL') {
            query = supabase.from('emergency_hospitals').select('*').order('beds_available', { ascending: false });
        } else if (tab === 'PHARMACY') {
            query = supabase.from('emergency_stores').select('*').eq('type', 'PHARMACY').order('name');
        } else if (tab === 'ANIMAL_HOSPITAL') {
            query = supabase.from('emergency_stores').select('*').eq('type', 'ANIMAL_HOSPITAL').order('name');
        } else {
            query = supabase.from('aeds').select('*').order('place_name');
        }

        const { data, error } = await query;
        if (data) setItems(data);
        setLoading(false);
    };

    const handleSync = async (type: string, options: { clear?: boolean } = {}) => {
        setSyncing(true);
        try {
            let endpoint = '';
            if (type === 'HOSPITAL') endpoint = 'hospitals';
            else if (type === 'PHARMACY') endpoint = 'pharmacies';
            else if (type === 'ANIMAL_HOSPITAL') endpoint = 'animal-hospitals';
            else if (type === 'ALL') endpoint = 'all';
            else endpoint = 'aeds';

            const url = `/api/sync/${endpoint}${options.clear ? '?clear=true' : ''}`;
            const res = await fetch(url);
            const result = await res.json();
            if (result.success) {
                alert(`${result.count}개의 데이터가 동기화되었습니다.`);
                fetchData(activeTab);
            } else {
                alert(`동기화 실패: ${result.error || result.message}`);
            }
        } catch (err) {
            alert('동기화 중 오류가 발생했습니다.');
        }
        setSyncing(false);
    };

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#E53935', textAlign: 'center', marginBottom: '30px' }}>🚑 SOS-NOW 데이터 관리</h1>

            {/* 전역 동기화 섹션 */}
            <div style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#FFF5F5', borderRadius: '15px', border: '2px dashed #E53935', textAlign: 'center' }}>
                <h2 style={{ marginTop: 0, color: '#C62828', fontSize: '1.2rem' }}>⚠️ 위험 구역: 전체 데이터 초기화</h2>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                    응급실, 약국, AED, 동물병원 데이터를 모두 삭제하고 서버에서 처음부다 다시 긁어옵니다.<br />
                    데이터 양이 많아 시간이 다소 소요될 수 있습니다.
                </p>
                <button
                    onClick={() => handleSync('ALL')}
                    disabled={syncing}
                    style={{
                        padding: '16px 32px',
                        background: syncing ? '#ccc' : 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        fontWeight: '900',
                        boxShadow: '0 4px 15px rgba(229, 57, 53, 0.3)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => !syncing && (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseOut={(e) => !syncing && (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {syncing ? '⌛ 전체 동기화 중...' : '🚀 전체 데이터 초기화 후 재동기화'}
                </button>
            </div>

            {/* 개별 동기화 버튼 섹션 */}
            <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button
                        onClick={() => handleSync('HOSPITAL')}
                        disabled={syncing}
                        style={{ padding: '12px 20px', backgroundColor: syncing ? '#ccc' : '#E53935', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        🔄 응급실 동기화 (업데이트)
                    </button>
                    <button
                        onClick={() => handleSync('HOSPITAL', { clear: true })}
                        disabled={syncing}
                        style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        🗑️ 삭제 후 재동기화
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button
                        onClick={() => handleSync('PHARMACY')}
                        disabled={syncing}
                        style={{ padding: '12px 20px', backgroundColor: syncing ? '#ccc' : '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        💊 약국 동기화
                    </button>
                    <button
                        onClick={() => handleSync('PHARMACY', { clear: true })}
                        disabled={syncing}
                        style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        🗑️ 삭제 후 재동기화
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button
                        onClick={() => handleSync('AED')}
                        disabled={syncing}
                        style={{ padding: '12px 20px', backgroundColor: syncing ? '#ccc' : '#FF9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ⚡ AED 동기화
                    </button>
                    <button
                        onClick={() => handleSync('AED', { clear: true })}
                        disabled={syncing}
                        style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        🗑️ 삭제 후 재동기화
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button
                        onClick={() => handleSync('ANIMAL_HOSPITAL')}
                        disabled={syncing}
                        style={{ padding: '12px 20px', backgroundColor: syncing ? '#ccc' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        🐶 동물병원 동기화
                    </button>
                    <button
                        onClick={() => handleSync('ANIMAL_HOSPITAL', { clear: true })}
                        disabled={syncing}
                        style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        🗑️ 삭제 후 재동기화
                    </button>
                </div>
            </div>

            {/* 탭 메뉴 */}
            <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
                {(['HOSPITAL', 'PHARMACY', 'AED', 'ANIMAL_HOSPITAL'] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            background: 'none',
                            borderBottom: activeTab === tab ? '3px solid #E53935' : 'none',
                            color: activeTab === tab ? '#E53935' : '#666',
                            fontWeight: activeTab === tab ? 'bold' : 'normal',
                            cursor: 'pointer',
                            fontSize: '15px'
                        }}
                    >
                        {tab === 'HOSPITAL' ? '병원' : tab === 'PHARMACY' ? '약국' : tab === 'AED' ? 'AED' : '동물병원'}
                    </button>
                ))}
            </div>

            {/* 데이터 테이블 */}
            <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '15px', textAlign: 'left' }}>이름/장소</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>주소</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>연락처</th>
                            {activeTab === 'HOSPITAL' && <th style={{ padding: '15px', textAlign: 'center' }}>가용 병상</th>}
                            {activeTab === 'AED' && <th style={{ padding: '15px', textAlign: 'center' }}>모델</th>}
                            <th style={{ padding: '15px', textAlign: 'center' }}>최종 업데이트</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{item.name || item.place_name}</td>
                                <td style={{ padding: '15px', color: '#666', fontSize: '0.9em' }}>{item.address}</td>
                                <td style={{ padding: '15px', color: '#666' }}>{item.phone || item.emergency_phone || item.manager_phone || '-'}</td>
                                {activeTab === 'HOSPITAL' && (
                                    <td style={{
                                        padding: '15px',
                                        textAlign: 'center',
                                        color: item.beds_available > 5 ? '#4CAF50' : item.beds_available > 0 ? '#FF9800' : '#F44336',
                                        fontWeight: 'bold'
                                    }}>
                                        {item.beds_available}개
                                    </td>
                                )}
                                {activeTab === 'AED' && <td style={{ padding: '15px', textAlign: 'center' }}>{item.model || '-'}</td>}
                                <td style={{ padding: '15px', textAlign: 'center', fontSize: '0.8em', color: '#999' }}>
                                    {new Date(item.last_updated || item.last_verified || item.last_check_date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>데이터 로딩 중...</div>}
            {!loading && items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    데이터가 없습니다. 상단의 동기화 버튼을 눌러주세요.
                </div>
            )}
        </div>
    );
}
