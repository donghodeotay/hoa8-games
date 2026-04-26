# Hóa học 8 — Trò chơi học tập

5 trò chơi tương tác + 3 thí nghiệm minh họa cho chương Acid – Base – Oxide – Muối – pH (Hóa lớp 8 HK2). Tooltip Việt → Anh khi di chuột / chạm vào từ.

## Files

```
.
├── index.html      Landing page với 5 ô trò chơi + 3 ô thí nghiệm
├── styles.css
├── glossary.js     342 thuật ngữ Việt–Anh
├── content.js      Dữ liệu cho 5 trò chơi (30 câu trắc nghiệm, 20 chất phân loại, 10 cặp ghép, 8 phương trình, 12 dung dịch pH)
├── app.js          Shell + router + tooltip
├── games.js        Logic 5 trò chơi
├── experiments.js  3 thí nghiệm SVG/CSS
└── README.md
```

## 5 trò chơi

1. **Trắc nghiệm** — 30 câu MCQ về acid/base/oxide/muối/pH/phương trình, phản hồi tức thì.
2. **Phân loại kéo–thả** — 20 chất, kéo vào 4 nhóm (Acid / Base / Oxide / Muối). Hỗ trợ chuột (drag-drop) và cảm ứng (tap-pick).
3. **Ghép cặp trí nhớ** — 10 cặp (formula ↔ tên gọi) = 20 thẻ lật.
4. **Cân bằng phương trình** — 8 phương trình, nhập hệ số để cân bằng.
5. **Thang pH** — 12 dung dịch quen thuộc, kéo vào ô pH 1–14.

## 3 thí nghiệm

1. **Acid–Base–Chỉ thị**: NaOH (pH 13, không màu) → thêm phenolphtalein (hồng) → thêm HCl từng giọt → mất màu (trung hòa). Có pH meter động.
2. **Bảng tính tan**: bấm các muối (NaCl, BaSO₄, AgCl, PbI₂, Fe(OH)₃…) thả vào nước, xem muối nào tan và muối nào tạo kết tủa (kèm màu sắc).
3. **Acid + Kim loại**: thả Zn vào HCl, xem bọt khí H₂ động bốc lên.

## Run locally

Mở `index.html` trong trình duyệt, hoặc `python -m http.server 8080`.

## Deploy lên GitHub Pages

1. Tạo repo mới: `donghodeotay/hoa8-games` (Public, Add README).
2. Upload **7 file** (`index.html`, `styles.css`, `glossary.js`, `content.js`, `app.js`, `games.js`, `experiments.js`).
3. Settings → Pages → Branch `main` / `(root)` → Save.
4. URL: `https://donghodeotay.github.io/hoa8-games/`

## Tooltip glossary

- 342 entries (chemistry-specific terms + common Vietnamese)
- Coverage on quiz text: **~59%** (vượt mục tiêu 50%)
- Hover (PC) hoặc chạm (mobile) lên từ tiếng Việt để xem nghĩa tiếng Anh.

## Customize

- Sửa câu hỏi/đề/thuật ngữ: chỉnh `content.js` và `glossary.js`.
- Đổi màu giao diện: chỉnh CSS variables ở đầu `styles.css`.

## Disclaimer

Tài liệu ôn tập tham khảo. Không thay thế đề thi chính thức của trường.
