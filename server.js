const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const connectMongoose = require("./database");
require("dotenv").config();
const { User, Profile } = require("./mongoose-model");

connectMongoose();
const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

// multer 설정 (파일 저장 위치 및 파일명 지정)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname) + ".jpg");
  },
});

const upload = multer({ storage });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 이미지 업로드 엔드포인트
app.post("/image", upload.single("image"), async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    // JWT 검증
    let decoded;
    try {
      decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
    const userEmail = decoded.email;
    console.log(`image upload from : ${userEmail}`);
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ message: "사용자가 존재하지 않습니다" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    // Profile 업데이트 (이미지 경로 저장)
    await Profile.findOneAndUpdate(
      { userId: user._id },
      { profileImage: imagePath },
      { new: true, upsert: true }
    );

    res.json({ message: "이미지가 업로드 되었습니다" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
