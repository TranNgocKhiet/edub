# Fix: EduB — Test case UI/Sidebar + Đồng bộ border-radius header (Admin & User view)

Áp dụng cho cả **Admin view** và **User view** (nếu component dùng chung thì sửa 1 chỗ,
nếu tách riêng 2 bộ code thì sửa đồng thời cả 2 nơi).

---

## 1. [UI - TC01] Đổi màu chủ đạo (theme color) không áp dụng đúng phạm vi

**Vấn đề:** Khi người dùng đổi màu chủ đạo (primary color) của hệ thống, việc áp màu đang
không đúng phạm vi.

**Yêu cầu:**
- Màu chủ đạo PHẢI áp dụng cho: icon, emoji, sidebar, navbar, header.
- Màu chủ đạo KHÔNG được áp dụng cho các nút chức năng: Thêm, Xóa, Sửa, Xem (giữ màu cố
  định/semantic riêng, không ăn theo theme color).

**Việc cần làm:**
- Rà soát nút Thêm/Xóa/Sửa/Xem ở cả admin view và user view, đảm bảo dùng token màu cố
  định (ví dụ `--btn-add`, `--btn-delete`, `--btn-edit`, `--btn-view`) thay vì biến
  `--primary-color`.
- Rà soát icon, emoji, sidebar, navbar, header (cả 2 view) để đảm bảo tham chiếu đúng biến
  `--primary-color`; nơi nào đang hardcode màu thì sửa lại theo biến này.

---

## 2. [UI - TC02] Dark mode: màu chữ và hover chưa tối ưu

**Vấn đề:**
- Một số text đang dùng màu chữ tối (dark text color), không đổi sang màu sáng khi bật
  dark mode → khó đọc trên nền tối.
- Trạng thái hover đang quá sáng, gây chói mắt (flashbang effect).

**Yêu cầu:**
- Khi bật dark mode: text có màu tối (đen, xám đậm...) phải tự động chuyển sang màu sáng
  (trắng/xám nhạt) để đảm bảo tương phản, dễ đọc.
- Giảm độ sáng của hover trong dark mode (không dùng nền hover trắng/sáng chói; dùng
  overlay tối hơn hoặc opacity thấp).

**Việc cần làm:**
- Kiểm tra cả admin view và user view: nơi hardcode màu chữ (ví dụ `color: #000` hoặc
  `text-gray-900`) không có biến theo theme (`dark:text-...`), bổ sung style dark mode.
- Kiểm tra CSS/class hover hiện tại (background hover) ở cả 2 view, giảm brightness hoặc
  đổi sang token hover riêng cho dark mode.

---

## 3. [Sidebar - TC01] Sidebar hiển thị sai mục cho gói Free

**Vấn đề:** Sidebar đang hiển thị mục "Chưa xác định thời hạn" cho user dùng gói Free —
mục này chỉ nên hiển thị cho gói không giới hạn thời hạn (không phải Free).

**Yêu cầu:** Nếu user đang dùng gói Free → sidebar KHÔNG được hiển thị mục "Chưa xác định
thời hạn". (Áp dụng cho sidebar user view; kiểm tra thêm nếu admin view cũng có menu
tương tự thì áp dụng cùng logic.)

**Việc cần làm:**
- Tìm component render sidebar/menu item "Chưa xác định thời hạn".
- Thêm điều kiện kiểm tra plan hiện tại của user (`user.plan !== 'free'`) trước khi render
  mục này.

---

## 4. Đồng bộ border-radius giữa 2 header component ("Nâng cấp tài khoản" & "Mua ECoin")

**Vấn đề:** Component header "Nâng cấp tài khoản" (trang gói đăng ký) và header "Mua
ECoin" (trang ví ECoin) đang có border-radius khác nhau:
- "Nâng cấp tài khoản": bo góc rất lớn, dạng pill (gần full-rounded).
- "Mua ECoin": bo góc nhỏ, gần vuông.

**Yêu cầu (Option B — giữ style pill của "Nâng cấp tài khoản"):**
- Áp dụng border-radius dạng pill (hoặc token tương đương, ví dụ `rounded-[32px]` hay
  `rounded-full` tùy chiều cao component thực tế) cho CẢ HAI header, ở CẢ admin view lẫn
  user view (nếu 2 view có style riêng cho các trang này).
- Tạo 1 token/class dùng chung (ví dụ `--banner-radius` hoặc `.page-header-banner`) để cả
  2 component tham chiếu cùng 1 nguồn, tránh lệch lại về sau khi sửa 1 trong 2 chỗ.

**Việc cần làm:**
- Tìm file/component render header "Nâng cấp tài khoản" và "Mua ECoin" (kiểm tra cả bản
  admin và bản user nếu có tách riêng).
- Lấy giá trị border-radius hiện tại của "Nâng cấp tài khoản" làm chuẩn.
- Áp giá trị đó cho "Mua ECoin", đồng thời gộp về 1 token/class dùng chung cho cả 2, ở cả
  2 view.

---

## Ghi chú
- Test case "Quên mật khẩu" (Login - TC01) chưa có đủ thông tin (chưa có
  Pre-condition/Procedure/Expected Output) nên chưa đưa vào đợt sửa này.
