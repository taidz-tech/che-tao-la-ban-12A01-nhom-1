/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationHeader, SectionTab } from './components/NavigationHeader.tsx';
import { HeroLanding } from './components/HeroLanding.tsx';
import { CompassExplorer } from './components/CompassExplorer.tsx';
import { ToolsShowcase } from './components/ToolsShowcase.tsx';
import { CraftingStepsView } from './components/CraftingStepsView.tsx';
import { EarthCompassSimulation } from './components/EarthCompassSimulation.tsx';
import { LabReportModal } from './components/LabReportModal.tsx';
import { ArrowUp, ChevronDown } from 'lucide-react';

const SECTIONS: SectionTab[] = [
  'hero',
  'compass3d',
  'tools',
  'craftSteps',
  'earthSim',
  'report',
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<SectionTab>('hero');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Smooth scroll to target section
  const scrollToSection = (id: SectionTab) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentTab(id);
    }
  };

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // ScrollSpy: Automatically detect which section is currently active
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 220; // offset for sticky header

      setShowScrollTop(window.scrollY > 400);

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sectionId = SECTIONS[i];
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setCurrentTab(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation:
  // - 1-6 keys: Jump directly to section
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '1' && e.key <= '6') {
        const index = parseInt(e.key, 10) - 1;
        if (index >= 0 && index < SECTIONS.length) {
          scrollToSection(SECTIONS[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-sky-500 selection:text-slate-950">
      {/* Sticky Top Navigation */}
      <NavigationHeader
        currentTab={currentTab}
        onSelectTab={scrollToSection}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Continuous Long-Scroll Sections */}
      <main className="w-full flex flex-col">
        {/* Section 1: Hero */}
        <section id="hero" className="relative w-full">
          <HeroLanding
            onStartExploring={() => scrollToSection('compass3d')}
            onGoToSim={() => scrollToSection('earthSim')}
          />
        </section>

        {/* Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

        {/* Section 2: Compass 3D Explorer */}
        <section id="compass3d" className="relative w-full">
          <CompassExplorer onGoToSteps={() => scrollToSection('craftSteps')} />
        </section>

        {/* Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* Section 3: Tools Showcase */}
        <section id="tools" className="relative w-full">
          <ToolsShowcase onGoToSteps={() => scrollToSection('craftSteps')} />
        </section>

        {/* Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

        {/* Section 4: Crafting Steps */}
        <section id="craftSteps" className="relative w-full">
          <CraftingStepsView onGoToSimulation={() => scrollToSection('earthSim')} />
        </section>

        {/* Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* Section 5: Earth Magnetic Field & Compass Simulation */}
        <section id="earthSim" className="relative w-full">
          <EarthCompassSimulation />
        </section>

        {/* Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

        {/* Section 6: Lab Report & Photographic Evidence */}
        <section id="report" className="relative w-full">
          <LabReportModal onGoToCompass={() => scrollToSection('compass3d')} />
        </section>
      </main>

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={() => scrollToSection('hero')}
          title="Cuộn về đầu trang"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-xl shadow-sky-500/30 transition-all hover:scale-110 cursor-pointer animate-in fade-in"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/95 py-8 px-6 text-center text-xs text-slate-500 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-400">
              CHUYÊN ĐỀ GDQP-AN: CHẾ TẠO LA BÀN THỦ CÔNG &amp; TỪ TRƯỜNG TRÁI ĐẤT
            </span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Định luật tương tác từ trường: τ = m × B • Đĩa tọa độ 360° chống thấm nước
          </div>
        </div>
      </footer>
    </div>
  );
}
