# Golang Sample

# GIỚI THIỆU
## Dự án 01:
Một ứng dụng web sử dụng Golang với Iris framework để tạo giao diện người dùng đơn giản, cho phép người dùng nhập prompt và gọi vào Groq API. API này cung cấp các mô hình AI tiên tiến như Llama 3.1, GPT-4o, Claude 3.5 Sonnet, và Gemini 1.5 Pro. Sau khi người dùng nhập prompt và gửi yêu cầu, ứng dụng sẽ gọi API, nhận kết quả trả về dưới dạng Markdown, sau đó parse và hiển thị kết quả theo định dạng Markdown để người dùng có thể dễ dàng đọc hiểu.

### Tính Năng Chính
- Giao diện người dùng đơn giản: Một ô text area cho phép người dùng nhập prompt và một nút gửi để gửi yêu cầu.
- Kết nối với Groq API: Ứng dụng gọi vào Groq API để sử dụng các mô hình AI tiên tiến và trả về kết quả.
- Xử lý và hiển thị Markdown: Kết quả trả về từ Groq API sẽ được xử lý (parse) từ định dạng Markdown và hiển thị đẹp mắt trên giao diện người dùng.
- Miễn phí API: Hiện tại, Groq cung cấp dịch vụ API miễn phí, giúp người dùng dễ dàng thử nghiệm và trải nghiệm các mô hình AI mạnh mẽ.

### Các Bước Thực Hiện
1. Cài Đặt Iris và Thư Viện HTTP (file main.go)
2. Tạo Giao Diện HTML nhập prompt và hiện thị kết quả

## Dự án 02
Dự án này là một ứng dụng web đơn giản giúp người dùng chuyển đổi một đoạn hội thoại thành một file SSML (Speech Synthesis Markup Language). SSML là một ngôn ngữ đánh dấu được sử dụng để tạo ra âm thanh thông qua các hệ thống chuyển văn bản thành giọng nói (TTS - Text-to-Speech). Ứng dụng này cho phép người dùng nhập hội thoại giữa hai người, chọn giọng nói cho mỗi người, và sinh ra file SSML cho hội thoại đó.

### Tính Năng Chính
- Chọn Giọng Nói: Ứng dụng cho phép người dùng chọn giọng nói cho từng người trong hội thoại.
- Chuyển đổi Hội Thoại thành SSML: Dựa trên hội thoại gốc giữa hai người, ứng dụng sẽ tạo ra file SSML cho từng đoạn hội thoại, phân biệt giọng nói của người nói thông qua các thẻ <voice> trong SSML.
- Giao Diện Đơn Giản, Dễ Dùng, Validate Thao Tác Người Dùng: Người dùng nhập đoạn hội thoại giữa hai người và chỉ cần nhấn nút để sinh ra file SSML từ hội thoại, sau đó có thể sao chép kết quả.

### Các bước thực hiện
1. HTML: Tạo giao diện web đơn giản với các phần tử để người dùng chọn voice 2 người đối thoại, nhập đoạn hội và xem kết quả có syntax highlight.
2. JavaScript: Xử lý hội thoại, sinh file SSML và hiển thị kết quả ở box có thể copy.
3. SSML: Cấu trúc file SSML được sinh ra dựa trên hội thoại đã cho, với các giọng nói được gắn vào từng người nói.

## Dự án 03
Dự án này xây dựng một ứng dụng web tự động tạo hội thoại và xử lý ngôn ngữ bằng cách sử dụng Groq API với model deepseek-r1-distill-llama-70b. Ứng dụng này thực hiện các tác vụ từ việc tạo ra hội thoại, lọc các từ quan trọng, dịch các từ sang tiếng Anh, cho đến việc lưu trữ dữ liệu vào cơ sở dữ liệu PostgreSQL.

### Tính Năng Chính
Tạo Hội Thoại: Tự động tạo ra một hội thoại giữa hai người nói tiếng Việt, dựa trên một prompt.
Trích Xuất Từ Quan Trọng: Phân tích hội thoại để trích xuất các từ quan trọng cần học, bỏ qua các danh từ tên riêng.
Dịch Từ: Dịch các từ quan trọng từ tiếng Việt sang tiếng Anh.
Lưu Dữ Liệu: Lưu trữ hội thoại và danh sách từ vào cơ sở dữ liệu PostgreSQL để sử dụng cho các mục đích khác.

### Các Bước Thực Hiện Dự Án:
1. Giao Diện Web
- Hiện thị prompt để tạo hội thoại.
- Xem kết quả hội thoại.
- Thực hiện trích xuất từ và dịch từ tiếng Việt sang tiếng Anh.

2. Sử Dụng Groq API
- Groq API: Dự án sẽ gọi vào Groq API, sử dụng model deepseek-r1-distill-llama-70b để tự động tạo hội thoại dựa trên prompt và xử lý ngôn ngữ.
API Flow:
- Tạo hội thoại: Gửi prompt yêu cầu tạo hội thoại giữa hai người với nội dung cụ thể, như hỏi đường đi đến hồ Hoàn Kiếm ở Hà Nội.
- Trích xuất từ: Sau khi có hội thoại, gọi API tiếp theo để trích xuất các từ quan trọng từ hội thoại, bỏ qua danh từ riêng như tên người.
- Dịch từ: Dịch các từ đã trích xuất sang tiếng Anh.
3. Cơ Sở Dữ Liệu PostgreSQL
Ứng dụng sẽ sử dụng cơ sở dữ liệu PostgreSQL để lưu trữ các thông tin sau:

- Bảng dialog: Lưu trữ hội thoại, với các cột như speaker (người nói), text (nội dung hội thoại).
- Bảng word: Lưu trữ các từ quan trọng và bản dịch của chúng. Các cột bao gồm word_vi (từ tiếng Việt) và word_en (từ tiếng Anh).
- Bảng word_dialog: Bảng trung gian quan hệ nhiều nhiều giữa word và dialog

# HƯỚNG DẪN CÀI ĐẶT
``` RUN CMD
docker-compose up --build
```

- CÂU 1: [http://localhost:8080/](http://localhost:8080/)
- CÂU 2: [http://localhost:8081/](http://localhost:8081/)
- CÂU 3: [http://localhost:8082/](http://localhost:8082/)

# DEMO

[![Alt text](https://img.youtube.com/vi/bzJEh8tyYik/0.jpg)](https://www.youtube.com/watch?v=bzJEh8tyYik)
