![CI Status](https://github.com/JINO25/Project-1/actions/workflows/main.yml/badge.svg)

# 🌍 Tour Booking Website (Node.js)

Một ứng dụng web đặt tour du lịch được xây dựng với Node.js, cung cấp các chức năng xác thực, thanh toán

---

## 🚀 Tính năng chính

### 🔐 Xác thực người dùng
- Đăng ký / Đăng nhập với email & mật khẩu
- Xác thực bằng Google OAuth 2.0
- Tạo JWT và lưu phiên bằng Cookie
- Reset mật khẩu qua email
- Gửi email xác nhận khi tạo tài khoản

### 🧳 Đặt tour du lịch
- Xem danh sách tour
- Đặt tour với 2 hình thức:
  - **COD** (Thanh toán khi sử dụng)
  - **Stripe** (Thanh toán online)
- Gửi email:
  - Khi đặt tour thành công
  - Khi hủy tour

### 🛠️ Quản lý tour & đánh giá
- Người dùng có thể để lại **review** sau khi đặt tour
- Phân quyền:
  - **User**
  - **Admin**
  - **Tour guide**
- Admin có thể tạo/sửa/xoá tour và quản lý người dùng
> **ℹ️ Lưu ý**: Hiện tại chưa có trang Admin UI, chỉ thao tác được qua Postman.

---

## 🧰 Công nghệ sử dụng

- **Backend**: Node.js, Express.js  
- **Database**: MongoDB (Mongoose)  
- **Authentication**: JWT, Google OAuth2  
- **Thanh toán**: Stripe API  
- **Email**: Nodemailer (SMTP) hoặc GMAIL  
- **Môi trường**: dotenv  

---

## 📁 Cấu trúc thư mục
project-root/
│
├── controllers/ # Logic xử lý các route
├── models/ # Mongoose schemas
├── views/ # Giao diện UI (nếu có)
├── routes/ # Định nghĩa API routes
├── utils/ # Tiện ích (email, token, v.v.)
├── middlewares/ # Middleware như auth, validate
├── public/ # Tài nguyên tĩnh (ảnh, css)
├── app.js # Khởi tạo ứng dụng Express
└── server.js # File chạy server

---

## ⚙️ Cài đặt & Khởi chạy

### 1. Clone repository
git clone https://github.com/JINO25/Project-1.git
cd Project-1

### 2. Cài đặt dependencies
npm install

### 3. Thiết lập biến môi trường
Dựa vào file mẫu .env.example
Tạo file config.env và điền thông tin phù hợp

### 4. Khởi chạy server
npm run start
📜 License