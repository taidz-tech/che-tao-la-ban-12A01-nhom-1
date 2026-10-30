/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wrench, 
  Magnet, 
  Droplets, 
  Layers, 
  PenTool, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ToolItem {
  id: number;
  name: string;
  category: string;
  specs: string;
  role: string;
  notes: string;
  tag: string;
  imageHint: string;
}

const TOOLS_LIST: ToolItem[] = [
  {
    id: 1,
    name: 'Kim Khâu / Dây Thép Nhỏ',
    category: 'Vật liệu tạo kim',
    specs: 'Thép carbon / sắt mềm, chiều dài khoảng 3–5 cm.',
    role: 'Làm kim từ tính (vật có mômen từ) để phản ứng với từ trường Trái Đất.',
    notes: 'Chọn kim thẳng, nhẹ, không bị gỉ sét để dễ nhiễm từ và giữ thăng bằng tốt trên vật nổi.',
    tag: 'Bắt buộc',
    imageHint: 'Kim khâu mũi nhọn mảnh, đuôi có lỗ xỏ chỉ.',
  },
  {
    id: 2,
    name: 'Nam Châm Vĩnh Cửu',
    category: 'Nguồn từ hóa',
    specs: 'Nam châm thanh (Bar magnet) hoặc nam châm tròn (nam châm tủ lạnh / Neodymium).',
    role: 'Nhiễm từ cho kim sắt bằng cách vuốt dọc thân kim theo một chiều duy nhất.',
    notes: 'Quy tắc vàng: Chỉ vuốt theo một chiều từ gốc đến mũi kim (30–40 lần). Tuyệt đối không vuốt qua lại hai chiều.',
    tag: 'Quan trọng',
    imageHint: 'Nam châm thanh chia hai cực N (đỏ) và S (xanh).',
  },
  {
    id: 3,
    name: 'Miếng Xốp / Nút Chai Cắt Mỏng',
    category: 'Vật liệu nổi',
    specs: 'Nút bần chai rượu vang hoặc mút xốp nhẹ, đường kính 1.5–2.5 cm, dày 3–5 mm.',
    role: 'Nâng đỡ kim thép nằm ngang trên mặt nước nhờ lực đẩy Ác-si-mét, giảm ma sát quay gần bằng 0.',
    notes: 'Cắt lát mỏng và phẳng để hệ kim có trọng tâm thấp, không bị lật úp khi thả vào nước.',
    tag: 'Bắt buộc',
    imageHint: 'Lát cắt nút bần tròn phẳng hoặc khoanh xốp trắng tròn.',
  },
  {
    id: 4,
    name: 'Bát Đựng Nước (Phi Từ Tính)',
    category: 'Vật chứa',
    specs: 'Chất liệu thủy tinh trong suốt, nhựa trong hoặc đồ sứ. Đường kính 12–20 cm.',
    role: 'Chứa nước làm môi trường nổi cho kim và quan sát đĩa tọa độ bên dưới đáy.',
    notes: 'Nghiêm cấm dùng bát bằng sắt, thép hoặc inox nhiễm từ vì sẽ làm lệch và méo mó đường sức từ cục bộ.',
    tag: 'Yêu cầu vật lý',
    imageHint: 'Bát thủy tinh trong suốt hình cầu tròn miệng rộng.',
  },
  {
    id: 5,
    name: 'Đĩa Tọa Độ Nhựa 360°',
    category: 'Thang đo góc phương vị',
    specs: 'Tấm nhựa PVC mỏng, bìa nhựa trong (bìa hồ sơ), hoặc cắt từ vỏ chai nhựa phẳng.',
    role: 'Hiển thị 8 hướng chính (N, NE, E, SE, S, SW, W, NW) và chia độ 0°–360°.',
    notes: 'Cắt thành hình tròn vừa vặn với lòng đáy bát nước. Chống thấm nước tuyệt đối.',
    tag: 'Kỹ thuật',
    imageHint: 'Đĩa tròn nhựa có in/vẽ ngôi sao la bàn 8 cánh và vạch độ.',
  },
  {
    id: 6,
    name: 'Bút Đánh Dấu Chống Nước',
    category: 'Mực vẽ kỹ thuật',
    specs: 'Bút lông dầu sơn (Paint Marker gốc dầu) hoặc bút dạ vĩnh cửu (Permanent Marker).',
    role: 'Vẽ vạch chia độ, các góc phương vị và ký hiệu chữ lên mặt đĩa nhựa.',
    notes: 'Mực thông thường sẽ bị nhòe và tan ra ngay khi ngâm nước. Phải sử dụng mực gốc dầu hoặc sơn.',
    tag: 'Chống nhòe',
    imageHint: 'Bút lông dầu Paint Marker ngòi mảnh nét sắc.',
  },
  {
    id: 7,
    name: 'Vật Liệu Bảo Vệ Chống Bay Mực',
    category: 'Bảo quản đĩa',
    specs: 'Ép nhiệt Plastify, dán băng keo trong bản rộng, hoặc phủ sơn bóng trong suốt.',
    role: 'Tạo lớp màng ngăn cách nước tiếp xúc trực tiếp với nét vẽ nếu làm đĩa bằng giấy.',
    notes: 'Nếu in đĩa ra giấy, dán băng keo kín 2 mặt hoặc ép nhựa dẻo nhiệt kín 4 mép trước khi thả vào nước.',
    tag: 'Giải pháp bảo vệ',
    imageHint: 'Băng dính trong bản rộng / màng ép nhựa dẻo.',
  },
];

interface ToolsShowcaseProps {
  onGoToSteps: () => void;
}

export const ToolsShowcase: React.FC<ToolsShowcaseProps> = ({ onGoToSteps }) => {
  const [activeTool, setActiveTool] = useState<ToolItem>(TOOLS_LIST[0]);

  return (
    <div className="w-full min-h-[100vh] bg-slate-950 pt-20 pb-16 px-4 md:px-8 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>MỤC 3.1 &amp; 5.2 • TÀI LIỆU KỸ THUẬT</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Dụng Cụ &amp; Vật Liệu Chuẩn Bị
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-1 max-w-3xl">
            Toàn bộ vật liệu đều đơn giản, dễ tìm kiếm trong đời sống nhưng đáp ứng chính xác các yêu cầu vật lý về từ học và khả năng kháng nước.
          </p>
        </div>

        {/* Warning Banner: Tránh sai số từ trường */}
        <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-slate-300">
            <span className="font-bold text-amber-300">Lưu ý quan trọng về môi trường thực nghiệm (Mục 4.2): </span>
            Bát nước phải đặt cách xa các vật dụng phát ra từ trường hoặc chứa kim loại ít nhất 1–2 mét (như điện thoại di động, máy tính, loa đài, đinh ốc, khung bàn thép) để tránh làm kim la bàn chỉ sai lệch.
          </div>
        </div>

        {/* Main Grid: Left List + Right Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of 7 Tools */}
          <div className="lg:col-span-7 space-y-2.5">
            {TOOLS_LIST.map((tool) => {
              const isSelected = activeTool.id === tool.id;
              return (
                <div
                  key={tool.id}
                  onClick={() => setActiveTool(tool)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tool.id}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{tool.name}</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700">
                          {tool.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {tool.specs}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap">
                    {tool.tag}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detailed Inspector Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 bg-slate-900 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider">
                    DỤNG CỤ SỐ #{activeTool.id}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{activeTool.name}</h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
                  {activeTool.category}
                </div>
              </div>

              <div className="space-y-4 text-xs md:text-sm">
                <div>
                  <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    <span>Quy cách &amp; Kích thước chuẩn:</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 leading-relaxed">
                    {activeTool.specs}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Vai trò trong hoạt động của La Bàn:</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 leading-relaxed">
                    {activeTool.role}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Kỹ thuật thực hành &amp; Lưu ý:</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 leading-relaxed">
                    {activeTool.notes}
                  </div>
                </div>
              </div>

              {/* Advance to crafting steps */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={onGoToSteps}
                  className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                >
                  <span>Chuyển Sang 5 Bước Chế Tạo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
