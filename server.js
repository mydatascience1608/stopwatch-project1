const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const dataFile = path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json());

// Helper: đọc file JSON
function readData() {
  try {
    const data = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: ghi file JSON
function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf-8");
}

// API: lấy toàn bộ lịch sử
app.get("/api/history", (req, res) => {
  const data = readData();
  res.json(data);
});

// API: thêm mới 1 dòng
app.post("/api/history", (req, res) => {
  const data = readData();
  const { note, timePoint, duration } = req.body;

  const newItem = {
    id: data.length > 0 ? data[data.length - 1].id + 1 : 1,
    note,
    timePoint,
    duration,
  };

  data.push(newItem);
  writeData(data);

  res.status(201).json(newItem);
});

// API: xoá 1 dòng theo ID
app.delete("/api/history/:id", (req, res) => {
  const data = readData();
  const idToDelete = parseInt(req.params.id);

  const updatedData = data.filter((item) => item.id !== idToDelete);

  if (data.length === updatedData.length) {
    return res.status(404).json({ message: "Không tìm thấy ID" });
  }

  // Gán lại ID từ 1,2,3,...
  const reIndexed = updatedData.map((item, index) => ({
    ...item,
    id: index + 1,
  }));

  writeData(reIndexed);
  res.json({ message: "Đã xoá và cập nhật lại ID" });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 📝 PUT cập nhật ghi chú
app.put("/api/history/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const { note } = req.body;

  const updated = data.map((item) => {
    if (item.id === id) {
      return { ...item, note };
    }
    return item;
  });

  writeData(updated);
  res.json({ message: "Đã cập nhật ghi chú" });
});
