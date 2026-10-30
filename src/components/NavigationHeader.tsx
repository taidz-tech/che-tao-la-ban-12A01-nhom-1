/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, Globe, Wrench, ListOrdered, FileText, Maximize2, Minimize2, Sparkles } from 'lucide-react';

export type SectionTab = 'hero' | 'compass3d' | 'tools' | 'craftSteps' | 'earthSim' | 'report';

interface NavigationHeaderProps {
  currentTab: SectionTab;
  onSelectTab: (tab: SectionTab) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentTab,
  onSelectTab,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const navItems: { id: SectionTab; label: string; icon: React.ReactNode }[] = [
    { id: 'hero', label: '1. Mở Đầu', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'compass3d', label: '2. Cấu Tạo 3D', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'tools', label: '3. Dụng Cụ', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'craftSteps', label: '4. 5 Bước Chế Tạo', icon: <ListOrdered className="w-3.5 h-3.5" /> },
    { id: 'earthSim', label: '5. Mô Phỏng Từ Trường', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'report', label: '6. Tư Liệu & Báo Cáo', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/85 border-b border-slate-800/90 px-4 py-2.5 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Project Badge */}
        <div 
          onClick={() => onSelectTab('hero')} 
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="hidden lg:block">
            <div className="text-[10px] font-semibold tracking-wider text-sky-400 uppercase">
              GDQP-AN • Khoa Học Quân Sự
            </div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Chế Tạo La Bàn Thủ Công</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono">
                Cuộn Trang
              </span>
            </div>
          </div>
        </div>

        {/* Section Tabs (Click to smooth scroll) */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-full">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right actions: Fullscreen */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Chế độ trình chiếu toàn màn hình (F11)'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-slate-700 text-xs font-medium transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Trình Chiếu'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
