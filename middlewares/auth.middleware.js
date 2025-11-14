import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Không có token' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ' });
    req.user = decoded;
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Chỉ admin mới được phép truy cập' });
    }
  });
};
