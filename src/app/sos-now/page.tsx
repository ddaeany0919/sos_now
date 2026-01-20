'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SosNowAdmin() {
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const fetchHospitals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('emergency_hospitals')
            .select('*')
            .order('beds_available', { ascending: false });

        if (data) setHospitals(data);
        setLoading(false);
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/sync/hospitals');
            const result = await res.json();
            if (result.success) {
                alert(`${result.count}개의 병원 데이터가 동기화되었습니다.`);
                fetchHospitals();
            } else {
                alert(`동기화 실패: ${result.error}`);
            }
        } catch (err) {
            alert('동기화 중 오류가 발생했습니다.');
        }
        setSyncing(false);
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#E53935' }}>🚑 SOS-NOW 데이터 관리</h1>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: syncing ? '#ccc' : '#E53935',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {syncing ? '동기화 중...' : '🔄 응급실 데이터 동기화'}
                </button>

                <button
                    onClick={async () => {
                        setSyncing(true);
                        try {
                            const res = await fetch('/api/sync/mock');
                            const result = await res.json();
                            if (result.success) {
                                alert(`Phase 1 데이터(${result.counts.stores + result.counts.aeds}개)가 동기화되었습니다.`);
                            } else {
                                alert(`동기화 실패: ${result.error}`);
                            }
                        } catch (err) {
                            alert('동기화 중 오류가 발생했습니다.');
                        }
                        setSyncing(false);
                    }}
                    disabled={syncing}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: syncing ? '#ccc' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {syncing ? '동기화 중...' : '🧪 Phase 1 샘플 데이터 동기화'}
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ border: '1px solid #ddd', padding: '12px' }}>병원명</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px' }}>가용 병상</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px' }}>실시간 메시지</th>
                        <th style={{ border: '1px solid #ddd', padding: '12px' }}>최종 업데이트</th>
                    </tr>
                </thead>
                <tbody>
                    {hospitals.map((hp) => (
                        <tr key={hp.hp_id}>
                            <td style={{ border: '1px solid #ddd', padding: '12px' }}>{hp.name}</td>
                            <td style={{
                                border: '1px solid #ddd',
                                padding: '12px',
                                textAlign: 'center',
                                color: hp.beds_available > 5 ? 'green' : hp.beds_available > 0 ? 'orange' : 'red',
                                fontWeight: 'bold'
                            }}>
                                {hp.beds_available}개
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '12px', fontSize: '0.9em' }}>
                                {hp.recent_msg || '-'}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '12px', fontSize: '0.8em', color: '#666' }}>
                                {new Date(hp.last_updated).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {loading && <p>데이터 로딩 중...</p>}
            {!loading && hospitals.length === 0 && <p>데이터가 없습니다. 동기화를 먼저 진행해주세요.</p>}
        </div>
    );
}
