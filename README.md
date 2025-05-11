# Movies Information Application

## Công Nghệ
- **Express.js**: Framework web cho Node.js.
- **pg-promise**: Thư viện giúp kết nối với PostgreSQL.
- **PostgreSQL**: Cơ sở dữ liệu quan hệ dùng để lưu trữ thông tin phim và người dùng.
- **AJAX**: Giao tiếp với server mà không cần tải lại trang.
- **MVC Pattern**: Mô hình thiết kế ứng dụng theo kiểu Model-View-Controller.
- **Git**: Quản lý mã nguồn và lịch sử thay đổi.

## Mô Tả
Ứng dụng "Movies Information" cho phép người dùng tìm kiếm, quản lý danh sách yêu thích và viết đánh giá phim. Dự án sử dụng **Express.js** cho server, **PostgreSQL** cho cơ sở dữ liệu và **AJAX** cho giao tiếp mượt mà mà không cần tải lại trang. Ứng dụng hỗ trợ các tính năng như tìm kiếm phim, quản lý danh sách yêu thích, và phân trang.

## Các Tính Năng Chính
- **Tìm kiếm phim theo tên hoặc thể loại**.
- **Quản lý danh sách phim yêu thích** (thêm, bớt phim).
- **Xem chi tiết thông tin diễn viên và phim**.
- **Viết và quản lý đánh giá phim**.
- **Phân trang hợp lý** sử dụng **AJAX** để tối ưu trải nghiệm người dùng.
- **Giao diện đẹp** với tính năng **Dark Mode**.
- **Chức năng quản lý phim yêu thích**: Người dùng có thể thêm và xóa phim khỏi danh sách yêu thích.

## Cài Đặt và Chạy Dự Án

1. **Cài Đặt Các Phụ Thuộc**:
   - Cài đặt tất cả các thư viện phụ thuộc bằng lệnh:
     ```bash
     npm install
     ```

2. **Cấu Hình Môi Trường**:
   - Tạo file `.env` trong thư mục gốc của dự án và thêm dòng cấu hình sau:
     ```
     PORT=22393
     ```
   - `PORT` là cổng mà server sẽ chạy trên máy của bạn (có thể thay đổi tùy theo **Individual Mark**).

3. **Chạy Dự Án**:
   - Chạy ứng dụng với lệnh:
     ```bash
     npm start
     ```
   - Truy cập ứng dụng tại `http://localhost:22393`.

## Cấu Trúc Dự Án

├── node_modules/ # Các thư viện phụ thuộc

├── public/ # Thư mục chứa tài nguyên tĩnh (CSS, JS, hình ảnh)

├── views/ # Template của ứng dụng (MVC View)

├── controllers/ # Các controller xử lý logic của ứng dụng

├── models/ # Các mô hình (Model) tương tác với cơ sở dữ liệu

├── .env # Cấu hình môi trường

├── .gitignore # Các tệp không theo dõi trong Git

├── package.json # Quản lý dependencies và script của ứng dụng

└── README.md # Tài liệu mô tả dự án


## Liên Hệ
- **GitHub**: https://github.com/blue182


