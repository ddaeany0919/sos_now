'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminUploadPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState(0);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            setFile(droppedFile);
            setMessage('');
            setStatus('idle');
        } else {
            setMessage('CSV 파일만 업로드 가능합니다.');
            setStatus('error');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMessage('');
            setStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('parsing');
        setMessage('파일을 분석 중입니다...');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            encoding: 'EUC-KR', // 공공데이터 CSV는 보통 EUC-KR 인코딩임
            complete: async (results) => {
                if (results.errors.length > 0) {
                    console.error('CSV Parse Errors:', results.errors);
                    // 일부 에러가 있어도 진행할지 여부는 선택. 일단 진행.
                }

                setStatus('uploading');
                setMessage(`데이터 ${results.data.length}건을 서버로 전송 중입니다...`);

                try {
                    const response = await fetch('/api/admin/upload-csv', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: 'ANIMAL_HOSPITAL',
                            data: results.data
                        }),
                    });

                    const result = await response.json();

                    if (result.success) {
                        setStatus('success');
                        setMessage(`성공! 총 ${result.count}개의 동물병원 데이터가 업데이트되었습니다.`);
                    } else {
                        throw new Error(result.error || '업로드 실패');
                    }
                } catch (error: any) {
                    setStatus('error');
                    setMessage(`오류 발생: ${error.message}`);
                }
            },
            error: (error) => {
                setStatus('error');
                setMessage(`CSV 파싱 오류: ${error.message}`);
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">데이터 업로드 (관리자)</h1>
                    <p className="text-slate-500">
                        '지방행정인허가데이터'에서 다운로드 받은<br />
                        <span className="font-semibold text-blue-600">동물병원 CSV 파일</span>을 업로드해주세요.
                    </p>
                </div>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        border-3 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
                        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}
                        ${status === 'success' ? 'border-green-500 bg-green-50' : ''}
                        ${status === 'error' ? 'border-red-500 bg-red-50' : ''}
                    `}
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    <input
                        type="file"
                        id="fileInput"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {status === 'idle' && !file && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <Upload size={32} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 text-lg">파일을 여기로 드래그하세요</p>
                                <p className="text-slate-400 text-sm mt-1">또는 클릭하여 선택 (.csv)</p>
                            </div>
                        </div>
                    )}

                    {file && status !== 'success' && status !== 'uploading' && status !== 'parsing' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
                                <FileUp size={32} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 text-lg">{file.name}</p>
                                <p className="text-slate-400 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                    )}

                    {(status === 'parsing' || status === 'uploading') && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center animate-spin">
                                <Loader2 size={32} />
                            </div>
                            <div>
                                <p className="font-bold text-blue-600 text-lg">{status === 'parsing' ? '분석 중...' : '업로드 중...'}</p>
                                <p className="text-slate-400 text-sm mt-1">{message}</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle size={32} />
                            </div>
                            <div>
                                <p className="font-bold text-green-600 text-lg">업로드 완료!</p>
                                <p className="text-slate-500 text-sm mt-1">{message}</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                <AlertCircle size={32} />
                            </div>
                            <div>
                                <p className="font-bold text-red-600 text-lg">오류 발생</p>
                                <p className="text-slate-500 text-sm mt-1">{message}</p>
                            </div>
                        </div>
                    )}
                </div>

                {file && status === 'idle' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleUpload();
                        }}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-200"
                    >
                        데이터 업로드 시작
                    </button>
                )}

                {status === 'success' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setStatus('idle');
                            setMessage('');
                        }}
                        className="w-full mt-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 rounded-xl transition-colors"
                    >
                        다른 파일 올리기
                    </button>
                )}
            </div>
        </div>
    );
}
