import React from 'react';
import { AnalysisResult } from '../../app/actions/analyzeProduct';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ResultPanelProps {
    result: AnalysisResult;
}

export default function ResultPanel({ result }: ResultPanelProps) {
    const { productName, sugarContent, healthVerdict, notes } = result;

    const cubeCount = Math.round(sugarContent / 4);

    let verdictColor = 'text-gray-400';
    let verdictBg = 'bg-gray-800';
    let Icon = Info;

    if (healthVerdict === 'Healthy') {
        verdictColor = 'text-green-400';
        verdictBg = 'bg-green-400/10';
        Icon = CheckCircle;
    } else if (healthVerdict === 'Moderate') {
        verdictColor = 'text-yellow-400';
        verdictBg = 'bg-yellow-400/10';
        Icon = AlertTriangle;
    } else if (healthVerdict === 'Unhealthy') {
        verdictColor = 'text-red-500';
        verdictBg = 'bg-red-500/10';
        Icon = AlertTriangle;
    }

    const getVerdictLabel = (verdict: string) => {
        switch (verdict) {
            case 'Healthy': return 'Pilihan Sehat';
            case 'Moderate': return 'Pilihan Sedang';
            case 'Unhealthy': return 'Pilihan Tidak Sehat';
            default: return verdict;
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{productName === 'Unknown' ? 'Produk Tidak Dikenal' : productName}</h2>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${verdictBg} ${verdictColor.replace('text-gray-400', 'text-gray-600')}`}>
                    <Icon size={16} />
                    <span>{getVerdictLabel(healthVerdict)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <p className="text-gray-500 text-sm mb-1">Total Gula</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">{sugarContent}</span>
                        <span className="text-sm font-medium text-gray-500">g</span>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <p className="text-gray-500 text-sm mb-1">Bongkah Gula</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">~{cubeCount}</span>
                        <span className="text-sm font-medium text-gray-500">kubus</span>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info size={18} className="text-blue-500" /> Analisis AI
                </h3>
                <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                    {notes}
                </div>
            </div>

            <div className="text-center p-4">
                <p className="text-xs text-gray-500">
                    *1 bongkah gula ≈ 4 gram gula.
                    <br />Representasi visual adalah estimasi.
                </p>
            </div>
        </div>
    );
}
