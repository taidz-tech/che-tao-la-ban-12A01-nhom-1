# Chuyển Đổi Sang Bố Cục Cuộn Trang Liên Tục (Continuous Long-Scroll)

Kế hoạch tái cấu trúc giao diện ứng dụng thành trang cuộn liên tục dài từ trên xuống dưới, cho phép người dùng cuộn chuột tự nhiên qua tất cả các phần nội dung trong khi vẫn giữ nguyên vẹn các tính năng tương tác 3D, mô phỏng vật lý và bài thuyết trình.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Quyết định đã xác nhận với người dùng**:
> - Chuyển đổi toàn bộ website từ dạng chuyển tab độc lập từng trang sang **bố cục cuộn trang liên tục dài (Single-Page Continuous Long Scroll)**.
> - Người dùng có thể lăn chuột (`mouse wheel`) hoặc kéo thanh cuộn để đọc liền mạch từ phần Giới thiệu, Cấu tạo La bàn 3D, Dụng cụ chuẩn bị, 5 Bước chế tạo, Mô phỏng Từ trường Trái Đất đến Báo cáo tư liệu thực nghiệm.
> - Thanh điều hướng trên cùng (`NavigationHeader`) sẽ tự động highlight theo vị trí cuộn thực tế (ScrollSpy) và khi bấm vào bất kỳ mục nào trên menu sẽ cuộn mượt (`smooth scroll`) trực tiếp tới vị trí tương ứng.

---

## 1. Overview & Core Concept

- **Mục tiêu**: Loại bỏ rào cản cuộn trang (`overflow-hidden`), cho phép người đọc trải nghiệm bài thuyết trình theo dòng chảy tự nhiên từ đầu đến cuối như một chuyên trang khoa học cao cấp.
- **Đối tượng sử dụng**: Học sinh, giáo viên bộ môn Giáo dục Quốc phòng & An ninh (GDQP-AN), người nghe thuyết trình và người tự học thực hành chế tạo.
- **Giá trị mang lại**: Trực quan, liền mạch, không bị gián đoạn, cho phép người dùng dừng lại ở bất kỳ đoạn nội dung nào để quan sát và tương tác với các khối 3D.

---

## 2. User Experience & Visual Design

### Trình tự cuộn trang từ trên xuống dưới

1. **Section 1: Mở đầu & Khám phá tổng quan (`#hero`)**
   - Không gian vũ trụ sâu với Quả cầu Trái Đất 3D và mô hình la bàn nổi.
   - Thẻ thông tin khoa học GDQP-AN và nút *"Bắt đầu khám phá"* (khi bấm sẽ tự động cuộn xuống Section 2).

2. **Section 2: Cấu tạo chi tiết La bàn thủ công 3D (`#compass3d`)**
   - Khung tương tác 3D nổi bật: Khung nhìn WebGL độc lập cao 85vh, cho phép xoay 360°, soi cận cảnh các bộ phận (Bát thủy tinh, Nước, Nút chai/miếng xốp, Kim từ tính đầu đỏ, Đĩa 360°).
   - Thanh điều khiển góc nhìn (Tổng quan, Nhìn từ trên, Nhìn từ bên, Reset) và các chip bộ phận để xem thuyết minh chi tiết.

3. **Section 3: Dụng cụ & Vật liệu chuẩn bị (`#tools`)**
   - Lưới hiển thị 7 dụng cụ chính xác theo tài liệu PDF (Kim khâu, Nam châm, Nút chai mỏng, Bát nước phi từ tính, Đĩa nhựa 360°, Bút lông dầu sơn, Vật liệu bảo vệ mực).
   - Thẻ kiểm tra chi tiết thông số kích thước, vai trò và lưu ý tránh sai số từ trường 1–2 mét.

4. **Section 4: Quy trình 5 bước chế tạo (`#craftSteps`)**
   - Thanh điều hướng tiến độ 5 bước với khung 3D mô phỏng động tác:
     - *Bước 1*: Vẽ đĩa tọa độ 360° chống thấm nước.
     - *Bước 2*: Vuốt nam châm một chiều 30–40 lần (kèm bộ đếm vuốt và cảnh báo).
     - *Bước 3*: Xiên kim qua nút chai thăng bằng phương ngang.
     - *Bước 4*: Lắp ráp bát nước, thả kim nổi tự do dao động tắt dần.
     - *Bước 5*: Căn chỉnh đĩa tọa độ đáy bát trùng hướng Bắc (thanh trượt xoay đĩa và nút căn chuẩn).

5. **Section 5: Mô phỏng liên kết Từ trường Trái Đất & La bàn (`#earthSim`)**
   - Bố cục song hành kép (Split-screen 3D): Bên trái là Địa cầu với trục từ nghiêng và các đường sức từ cong; bên phải là La bàn thủ công xoay theo thành phần ngang $B_h = B - (B \cdot n)n$.
   - Các nút *"Chạy kiểm tra"*, *"Tạm dừng"*, *"Đặt lại"*, chọn vị trí địa lý mẫu và bảng dữ liệu đo góc từ thiên, từ khuynh.

6. **Section 6: Tư liệu ảnh thực nghiệm & Báo cáo PDF (`#report`)**
   - Hình ảnh chụp thực tế 4 góc nhìn của sản phẩm tự làm.
   - Toàn văn tóm tắt báo cáo lý thuyết và 3 giải pháp kháng nước cho mực in.

---

## 3. Key Product Decisions & Trade-Offs

- **Quyết định 1: Xử lý cuộn trang song song với tương tác Three.js OrbitControls**:
  - *Giải pháp*: Cho phép người dùng cuộn trang thoải mái bên ngoài khung 3D hoặc giữ phím / di chuột trên nền trang để cuộn; trên khung canvas 3D, tính năng xoay và phóng to vẫn hoạt động mượt mà.
  - *Lợi ích*: Tránh tình trạng bị "kẹt con trỏ" khi lướt qua các khung 3D.
- **Quyết định 2: Thanh điều hướng ghim đầu trang (Sticky Header with ScrollSpy)**:
  - *Giải pháp*: Giữ thanh menu cố định phía trên (`fixed top-0`), sử dụng `IntersectionObserver` để tự động highlight phân mục mà người dùng đang cuộn tới. Bấm vào mục nào sẽ cuộn êm (`behavior: 'smooth'`) đến đúng vị trí mục đó.

---

## 4. Technical Architecture & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NAVIGATION HEADER (Sticky Top, Z-50)                   │
│   [Logo GDQP-AN]  [Tổng Quan] [Cấu Tạo 3D] [Dụng Cụ] [5 Bước] [Từ Trường]   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      Continuous Scroll Body (Y-Axis)
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│  Section 1: #hero (100vh)                                                   │
│  - Earth + Compass Hero Canvas (WebGL)                                      │
│  - Presentation Title & Intro Callout                                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│  Section 2: #compass3d (Min 90vh)                                           │
│  - Interactive 360° Compass Viewer (Part inspection, Camera presets)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│  Section 3: #tools                                                          │
│  - 7 Tools Grid & Detailed Specification Card                               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│  Section 4: #craftSteps (Min 90vh)                                          │
│  - 5 Steps 3D Animation Stage (Magnet stroke counter, 0° Alignment tool)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│  Section 5: #earthSim (Min 90vh)                                            │
│  - Dual Linked Viewport: Earth 3D (Dipole) & Handcrafted Compass ($B_h$)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│  Section 6: #report                                                         │
│  - 4-View Real Photographs & Technical PDF Documentation                    │
│  - Footer with Quick Navigation                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Các bước triển khai kỹ thuật:
1. Cập nhật `index.html` và `index.css`: Loại bỏ `overflow-hidden` trên `<body>`, thiết lập `scroll-behavior: smooth` và custom scrollbar.
2. Cập nhật `src/App.tsx`: Thay đổi từ render rẽ nhánh điều kiện (`currentTab === ...`) sang render liên tục tất cả các Section theo chiều dọc với các ID định danh (`#hero`, `#compass3d`, `#tools`, `#craftSteps`, `#earthSim`, `#report`).
3. Cập nhật `src/components/NavigationHeader.tsx`: Thêm cơ chế ScrollSpy (`IntersectionObserver` hoặc scroll listener) để tự động phát hiện Section đang hiển thị và kích hoạt hiệu ứng cuộn mượt khi click.
4. Điều chỉnh kích thước chiều cao và layout của các component con để hiển thị thoáng đãng, sắc nét trên màn hình cuộn dọc mà không gây xung đột rendering Three.js.
5. Kiểm thử biên dịch, linting và chạy kiểm tra cuộn trang thực tế trên trình duyệt bằng Playwright.
