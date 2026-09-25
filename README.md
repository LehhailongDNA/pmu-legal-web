# PMU LEGAL 2026 — BẢN PHÁT HÀNH WEB TĨNH (STATIC WEB)

Thư mục `dist/` chứa toàn bộ mã nguồn và dữ liệu đã được **biên dịch tĩnh 100% (Client-Side)**.
Bạn có thể triển khai lên **Vercel**, **GitHub Pages**, **Cloudflare Pages** hoặc bất kỳ hosting miễn phí nào mà không cần máy chủ Node.js hay cơ sở dữ liệu backend.

---

## 🚀 CÁCH 1: Triển Khai Lên Vercel (Khuyên dùng - Nhanh nhất & Tốc độ cao)

### Bước 1: Đẩy mã nguồn lên GitHub
1. Mở cửa sổ dòng lệnh (Terminal/PowerShell) tại thư mục `dist`:
   ```bash
   cd dist
   git init
   git add .
   git commit -m "Phát hành bản Web tĩnh PMU Legal 2026"
   ```
2. Tạo một repository mới trên GitHub (ví dụ đặt tên: `pmu-legal-web`).
3. Đẩy code lên GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/pmu-legal-web.git
   git push -u origin main
   ```

### Bước 2: Kết nối với Vercel
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Nhấn nút **Add New...** -> chọn **Project**.
3. Chọn repository `pmu-legal-web` vừa đẩy lên.
4. Nhấn **Deploy** (giữ nguyên mọi cài đặt mặc định).
5. Sau 30 giây, Vercel sẽ cung cấp đường link truy cập công khai miễn phí (Ví dụ: `https://pmu-legal-web.vercel.app`).

---

## 🌐 CÁCH 2: Triển Khai Lên GitHub Pages (Miễn phí trên GitHub)

1. Sau khi đã đẩy thư mục `dist` lên repository GitHub (như Bước 1 ở trên).
2. Vào mục **Settings** của repository trên GitHub.
3. Ở menu bên trái, chọn **Pages**.
4. Tại mục **Build and deployment** -> **Branch**, chọn nhánh `main` (thư mục `/ (root)`) và nhấn **Save**.
5. Sau 1 - 2 phút, trang web sẽ hoạt động tại địa chỉ: `https://<tai-khoan-cua-ban>.github.io/pmu-legal-web/`.

---

## 💻 CÁCH 3: Chạy Thử Cục Bộ Trên Máy Tính (Local Preview)

Từ thư mục gốc dự án, bạn có thể chạy thử bản tĩnh bằng lệnh:
```bash
npm run serve:static --prefix app
```
Hoặc mở bất kỳ tiện ích máy chủ tĩnh nào (như extension **Live Server** trong VS Code, `npx serve dist`, hoặc Python `python -m http.server 5000` trong thư mục `dist`).
Truy cập: `http://localhost:5000`.

---

## ⚙️ HƯỚNG DẪN CẬP NHẬT KHO DỮ LIỆU KHI CÓ VĂN BẢN MỚI

Bất kỳ khi nào bạn bổ sung thêm Luật, Nghị định, Thông tư hoặc Tiêu chuẩn TCVN vào thư mục `app/Data/`, bạn chỉ cần chạy một lệnh duy nhất:
```bash
npm run build:static --prefix app
```
Hệ thống sẽ tự động quét, bọc liên kết đối chiếu chéo và tạo lại toàn bộ file JSON tĩnh trong thư mục `dist/` để bạn sẵn sàng đẩy lên web!
