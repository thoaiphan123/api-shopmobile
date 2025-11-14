import User from "../models/users.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Đăng ký
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (err) {
    console.error("❌ Lỗi khi đăng ký:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


//Đăng nhập
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
