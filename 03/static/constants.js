export const promptList = [
  [
    "Tạo một hội thoại bằng tiếng Việt, gồm 6 câu, ngắn gọn, đơn giản, hỏi đường đi đến hồ Hoàn Kiếm ở Hà nội giữa một Mỹ tên James và người Việt nam tên Lan. Chỉ xuất ra hội thoại đặt trong thẻ code, không cần giải thích.",
  ],
  [
    "Cho đoạn hội thoại sau",
    "<replyMessage>",
    "Từ hội thoại trên hãy lọc ra danh sách các từ quan trọng, bỏ qua danh từ tên riêng cần học. Không cần giải thích xuất kết quả ra dạng JSON trong thẻ `words`.",
    `ví dụ: { "words": [ "chào", "bạn", ...]}`,
  ],
  [
    "Cho đoạn json sau:",
    "<replyMessage>",
    "Hãy dịch từng từ trong danh sách dưới sang tiếng Anh rồi trả JSON gồm mảng trong đó mỗi phần tử sẽ gồm từ tiếng Việt và từ tiếng Anh tương đương, ",
    `ví dụ: { "translated_words": [ { "vi": "chào", "en": "hello" }, ... ]}.`,
    `Không cần giải thích`,
  ],
];
