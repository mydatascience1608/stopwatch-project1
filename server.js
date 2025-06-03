const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'Public')));
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // phục vụ frontend

// Kết nối MongoDB Atlas
mongoose.connect("mongodb+srv://mydatascience1608:taideptrai123@cluster0.gvefted.mongodb.net/timerDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Kết nối MongoDB Atlas thành công!");
}).catch((err) => {
  console.error("❌ Lỗi kết nối MongoDB:", err);
});

// Tạo Schema & Model
const historySchema = new mongoose.Schema({
  note: String,
  timePoint: String,
  duration: String
});

const History = mongoose.model("History", historySchema);

// API: lấy toàn bộ lịch sử
app.get("/api/history", async (req, res) => {
  const data = await History.find();
  res.json(data);
});

// API: thêm mới 1 dòng
app.post("/api/history", async (req, res) => {
  const { note, timePoint, duration } = req.body;
  const newItem = new History({ note, timePoint, duration });
  await newItem.save();
  res.status(201).json(newItem);
});

// API: cập nhật ghi chú
app.put("/api/history/:id", async (req, res) => {
  const { note } = req.body;
  await History.findByIdAndUpdate(req.params.id, { note });
  res.json({ message: "Đã cập nhật ghi chú" });
});

// API: xoá 1 dòng
app.delete("/api/history/:id", async (req, res) => {
  await History.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xoá" });
});

// Chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
