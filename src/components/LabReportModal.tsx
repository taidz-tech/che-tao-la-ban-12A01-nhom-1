/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck, 
  Layers, 
  Compass, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface LabReportModalProps {
  onGoToCompass: () => void;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({ onGoToCompass }) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'reportText' | 'waterproof'>('photos');

  const photoEvidence = [
    {
      title: 'Bộ hình ảnh minh họa la bàn thủ công (theo 4 hướng chụp)',
      src: '/assets/aistudio/7538eef3-d443-4275-b09a-4a28f3041b86_7dd74ad5.png',
      desc: 'Hình 1: Nhìn từ trên xuống (Top-down) • Hình 2: Nhìn từ phía dưới (Bottom view) • Hình 3: Nhìn từ bên trái • Hình 4: Nhìn từ bên phải',
      details: 'Minh chứng bố cục thực tế: Kim la bàn xuyên ngang miếng xốp tròn, đầu Bắc sơn đỏ, nổi tự do thăng bằng trên mặt nước; đĩa tọa độ 360° nằm cố định dưới đáy bát thủy tinh trong suốt.',
    },
    {
      title: 'Quy trình thực tế & Đĩa tọa độ 360° chống thấm nước',
      src: '/assets/aistudio/9eb92492-bb34-443b-8cfa-ef896b1b88e7_442031c0.png',
      desc: '1. Dụng cụ chuẩn bị • 2. Nhiễm từ cho kim • 3. Gắn kim lên vật nổi • 4. Mặt đĩa tọa độ 360° (Compass Rose)',
      details: 'Mặt đĩa chia 8 hướng chính phụ, thang chia vạch 0°–360° (mỗi 5° hoặc 10°). Kỹ thuật vuốt nam châm một chiều 30–40 lần từ gốc đến mũi kim.',
    },
  ];

  return (
    <div className="w-full min-h-[100vh] bg-slate-950 pt-20 pb-16 px-4 md:px-8 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>TÀI LIỆU KHOA HỌC • GDQP-AN</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Báo Cáo Kỹ Thuật &amp; Tư Liệu Thực Nghiệm
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              Trích xuất toàn diện từ tài liệu hướng dẫn và hình ảnh chụp thực nghiệm thực tế của đề tài chế tạo la bàn thủ công.
            </p>
          </div>

          <button
            onClick={onGoToCompass}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
          >
            <Compass className="w-4 h-4" />
            <span>Mở Mô Hình 3D La Bàn</span>
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-sky-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Hình Ảnh Chụp Thực Nghiệm (4 Góc Chụp)</span>
          </button>

          <button
            onClick={() => setActiveTab('reportText')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'reportText'
                ? 'bg-sky-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Toàn Văn Báo Cáo Kỹ Thuật (PDF)</span>
          </button>

          <button
            onClick={() => setActiveTab('waterproof')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'waterproof'
                ? 'bg-sky-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3 Giải Pháp Chống Nhòe Mực Trong Nước</span>
          </button>
        </div>

        {/* TAB 1: Photos */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {photoEvidence.map((photo, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              >
                <div className="p-4 border-b border-slate-800 bg-slate-950/60">
                  <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                    TƯ LIỆU THỰC TẾ #{idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{photo.title}</h3>
                  <div className="text-xs text-slate-400 mt-1">{photo.desc}</div>
                </div>

                <div className="relative bg-slate-950 flex items-center justify-center p-3 border-b border-slate-800">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="max-h-[460px] w-auto object-contain rounded-xl border border-slate-800/80 shadow"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 bg-slate-950/40 text-xs text-slate-300 leading-relaxed flex-1">
                  <div className="font-semibold text-sky-300 mb-1">Ghi chú đối chiếu mô hình:</div>
                  {photo.details}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Full Technical Report Text */}
        {activeTab === 'reportText' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6 text-xs md:text-sm leading-relaxed text-slate-300">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-sky-400 uppercase">TÓM TẮT BÁO CÁO KỸ THUẬT</span>
              <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
                Nguyên Lý Hoạt Động &amp; Cơ Sở Lý Thuyết
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-sky-300 mb-2">1. Nguyên Lý Hoạt Động Của La Bàn (Mục 2)</h4>
                <p>
                  La bàn hoạt động dựa trên sự tương tác giữa <strong className="text-white">từ trường của Trái Đất</strong> và một <strong className="text-white">vật từ hóa (kim từ tính)</strong> có khả năng quay tự do.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-bold text-emerald-400">• Cực Nam từ học: </span>
                    Nằm gần Cực Bắc địa lý của Trái Đất.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-bold text-rose-400">• Cực Bắc từ học: </span>
                    Nằm gần Cực Nam địa lý của Trái Đất.
                  </div>
                </div>
                <p className="mt-2 text-slate-400">
                  Do các cực từ trái dấu thì hút nhau, đầu cực Bắc (N) của kim la bàn sẽ luôn bị thu hút và chỉ về hướng Cực Bắc địa lý của Trái Đất.
                </p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-emerald-300 mb-2">2. Điều Kiện Cân Bằng Của Kim La Bàn (Mục 2.2)</h4>
                <p>
                  Khi kim sắt hoặc thép được nhiễm từ, nó trở thành một thanh nam châm nhỏ có mômen từ <code className="text-sky-300">m</code>. Dưới tác dụng của từ trường Trái Đất <code className="text-sky-300">B</code>, kim chịu tác dụng của mômen ngẫu lực từ:
                </p>
                <div className="my-3 p-3 text-center font-mono font-bold text-base text-sky-400 bg-slate-900 rounded-lg border border-slate-800">
                  τ = m × B
                </div>
                <p className="text-slate-400">
                  Mômen lực này làm kim quay cho đến khi vectơ mômen từ <code className="text-sky-300">m</code> song song với đường sức từ của Trái Đất (<code className="text-sky-300">τ = 0</code>). Để kim quay chính xác, ma sát cản trở quay phải được giảm thiểu tối đa bằng cách cho nổi tự do trên bề mặt nước.
                </p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-amber-300 mb-2">3. Cấu Trúc Tọa Độ Góc Phương Vị 360° (Mục 5.1)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 px-3">Ký Hiệu</th>
                        <th className="py-2 px-3">Tên Hướng</th>
                        <th className="py-2 px-3">Góc Phương Vị</th>
                        <th className="py-2 px-3">Ký Hiệu</th>
                        <th className="py-2 px-3">Tên Hướng</th>
                        <th className="py-2 px-3">Góc Phương Vị</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-rose-400">N</td>
                        <td className="py-2 px-3 font-semibold text-white">Bắc</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">0° hoặc 360°</td>
                        <td className="py-2 px-3 font-mono font-bold text-sky-400">S</td>
                        <td className="py-2 px-3 font-semibold text-white">Nam</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">180°</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-sky-400">NE</td>
                        <td className="py-2 px-3 text-slate-300">Đông Bắc</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">45°</td>
                        <td className="py-2 px-3 font-mono font-bold text-sky-400">SW</td>
                        <td className="py-2 px-3 text-slate-300">Tây Nam</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">225°</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-sky-400">E</td>
                        <td className="py-2 px-3 font-semibold text-white">Đông</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">90°</td>
                        <td className="py-2 px-3 font-mono font-bold text-sky-400">W</td>
                        <td className="py-2 px-3 font-semibold text-white">Tây</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">270°</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-sky-400">SE</td>
                        <td className="py-2 px-3 text-slate-300">Đông Nam</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">135°</td>
                        <td className="py-2 px-3 font-mono font-bold text-sky-400">NW</td>
                        <td className="py-2 px-3 text-slate-300">Tây Bắc</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">315°</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Waterproof Solutions */}
        {activeTab === 'waterproof' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold mb-4 font-mono">
                  01
                </div>
                <h4 className="text-base font-bold text-white mb-2">Cách 1: Ép Nhựa Dẻo / Ép Nhiệt (Plastify)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In mặt đĩa tọa độ ra giấy trắng, sau đó mang đi ép nhiệt plastify kín cả 4 mép. Lớp nhựa ép nhiệt sẽ ngăn nước tiếp xúc tuyệt đối với mực in, đảm bảo ngâm trong nước nhiều ngày không phai hay bong mép.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
                ✓ Hiệu quả cao nhất cho bản in giấy
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold mb-4 font-mono">
                  02
                </div>
                <h4 className="text-base font-bold text-white mb-2">Cách 2: Dán Băng Keo Trong Bản Rộng</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dán kín cả mặt trước và mặt sau của đĩa giấy bằng băng keo trong suốt bản rộng. Dùng tay hoặc thẻ miết thật chặt các mép viền để loại bỏ bọt khí và ngăn nước mao dẫn thấm vào bên trong giấy.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-sky-400">
                ✓ Dụng cụ sẵn có tại chỗ
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold mb-4 font-mono">
                  03
                </div>
                <h4 className="text-base font-bold text-white mb-2">Cách 3: Phủ Sơn Bóng Trong Suốt (Clear Coat)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sau khi vẽ lên bề mặt nhựa PVC bằng bút lông dầu, quét một lớp sơn móng tay trong suốt hoặc xịt sơn bóng phủ kín bề mặt nét vẽ. Lớp màng polime này tạo liên kết kỵ nước vĩnh cửu.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-purple-400">
                ✓ Chống cọ sát &amp; xước bề mặt
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
