import Link from 'next/link';
import {
  HeartPulse, Pill, Dog, ShieldAlert, MapPin,
  PhoneCall, ArrowRight, Activity, ShieldCheck,
  Clock, Smartphone
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-red-100 selection:text-red-600">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-slate-950 py-32 md:py-48 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-red-600/20 blur-[120px] animate-pulse"></div>
          <div className="absolute -right-1/4 -bottom-1/4 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        </div>

        <div className="container relative mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10 backdrop-blur-md">
              <Activity size={16} className="text-red-500" />
              <span className="text-sm font-black uppercase tracking-widest text-slate-400">Real-time Emergency Network</span>
            </div>

            <h1 className="mb-8 text-6xl font-black tracking-tighter sm:text-8xl md:text-9xl leading-[0.9]">
              SOS<span className="text-red-600">.</span>NOW
            </h1>

            <p className="mx-auto mb-12 max-w-3xl text-xl font-medium text-slate-400 sm:text-2xl leading-relaxed">
              1분 1초가 급한 순간, 당신 주변의 가장 가까운 <br className="hidden sm:block" />
              <span className="font-black text-white underline decoration-red-600 decoration-4 underline-offset-8">응급실, 약국, 동물병원</span>을 실시간으로 확인하세요.
            </p>

            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link
                href="/map"
                className="group flex items-center justify-center gap-3 rounded-[32px] bg-red-600 px-10 py-6 text-xl font-black transition-all hover:bg-red-700 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(239,68,68,0.4)]"
              >
                <MapPin size={24} />
                실시간 지도 시작하기
                <ArrowRight size={24} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/sos-now"
                className="flex items-center justify-center gap-3 rounded-[32px] bg-white/5 px-10 py-6 text-xl font-black border border-white/10 backdrop-blur-md transition-all hover:bg-white/10"
              >
                데이터 관리
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mission Section */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-red-600">
                <ShieldCheck size={18} />
                <span className="text-sm font-black uppercase tracking-widest">Our Mission</span>
              </div>
              <h2 className="mb-8 text-4xl font-black text-slate-900 sm:text-6xl tracking-tight leading-[1.1]">
                가장 급한 순간,<br />
                <span className="text-red-600">정확한 정보</span>가 생명을 구합니다.
              </h2>
              <p className="text-xl font-medium text-slate-500 leading-relaxed mb-8">
                SOS-NOW는 흩어져 있는 응급 의료 정보를 하나로 모아 실시간으로 제공합니다.
                단순한 위치 정보가 아닌, 지금 당장 진료가 가능한지를 판단할 수 있는 핵심 데이터를 연결합니다.
              </p>
              <div className="space-y-4">
                {[
                  '국립중앙의료원(NEMC) 실시간 데이터 연동',
                  '24시간 운영 시설 우선 필터링',
                  '내 위치 기반 최단 거리 안내',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-lg font-bold text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square rounded-[64px] bg-gradient-to-br from-red-500 to-blue-600 p-1 shadow-2xl">
                <div className="h-full w-full rounded-[60px] bg-slate-950 flex items-center justify-center overflow-hidden">
                  <div className="p-12 text-center">
                    <Activity size={80} className="text-red-500 mx-auto mb-6 animate-pulse" />
                    <div className="text-4xl font-black text-white tracking-tighter mb-2">REAL-TIME</div>
                    <div className="text-slate-500 font-bold uppercase tracking-[0.2em]">Data Network</div>
                  </div>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 glass p-6 rounded-3xl shadow-2xl animate-float">
                <div className="text-3xl font-black text-red-600">100%</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Public Data Sync</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="mb-24 text-center">
            <h2 className="mb-6 text-4xl font-black text-slate-900 sm:text-6xl tracking-tight">생존을 위한 핵심 서비스</h2>
            <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto">공공 데이터와 실시간 제보를 결합한 가장 정확한 의료 정보를 제공합니다.</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                title: '실시간 응급실',
                desc: '전국 응급의료기관의 가용 병상 수와 실시간 특이사항 메시지를 즉시 확인합니다.',
                icon: ShieldAlert,
                color: 'bg-red-50 text-red-600',
                hoverColor: 'group-hover:bg-red-600'
              },
              {
                title: '심야 약국',
                desc: '밤늦게까지 운영하는 우리 동네 약국 위치와 실제 영업 여부를 실시간으로 파악합니다.',
                icon: Pill,
                color: 'bg-emerald-50 text-emerald-600',
                hoverColor: 'group-hover:bg-emerald-600'
              },
              {
                title: '24시 동물병원',
                desc: '반려동물의 응급 상황에 대비한 24시간 진료 가능 병원 정보를 제공합니다.',
                icon: Dog,
                color: 'bg-blue-50 text-blue-600',
                hoverColor: 'group-hover:bg-blue-600'
              }
            ].map((feature, i) => (
              <div key={i} className="group rounded-[48px] border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-[32px] transition-all duration-500 ${feature.color} ${feature.hoverColor} group-hover:text-white group-hover:rotate-6`}>
                  <feature.icon size={40} />
                </div>
                <h3 className="mb-4 text-2xl font-black text-slate-900">{feature.title}</h3>
                <p className="text-lg font-medium text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Call Banner */}
      <section className="container mx-auto px-6 mb-32">
        <div className="relative overflow-hidden rounded-[56px] bg-red-600 p-12 md:p-24 text-white shadow-2xl shadow-red-200">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="mb-4 text-4xl font-black sm:text-6xl tracking-tight">긴급 상황인가요?</h2>
              <p className="text-red-100 text-xl font-medium">망설이지 말고 즉시 119에 도움을 요청하세요.</p>
            </div>
            <a
              href="tel:119"
              className="flex items-center gap-4 rounded-[32px] bg-white px-12 py-8 text-4xl font-black text-red-600 shadow-2xl transition-all hover:scale-110 active:scale-95"
            >
              <PhoneCall size={48} />
              119 전화하기
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-24 text-slate-500 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-12 md:flex-row">
            <div className="text-center md:text-left">
              <div className="mb-4 text-2xl font-black text-white tracking-tighter">SOS<span className="text-red-600">.</span>NOW</div>
              <p className="max-w-sm font-medium">전국 실시간 응급 의료 정보 플랫폼. <br />당신의 소중한 생명을 지킵니다.</p>
            </div>
            <div className="flex gap-8">
              <ShieldCheck size={32} className="opacity-20" />
              <Clock size={32} className="opacity-20" />
              <Smartphone size={32} className="opacity-20" />
            </div>
          </div>
          <div className="mt-24 pt-12 border-t border-white/5 text-center text-sm font-bold uppercase tracking-widest">
            <p className="mb-4">© 2026 SOS-NOW. All rights reserved.</p>
            <p className="opacity-30">본 서비스는 국립중앙의료원(NEMC)의 공공 데이터를 활용하여 제공됩니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
