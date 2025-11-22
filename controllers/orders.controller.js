import Order from "../models/order.model.js";
import User from "../models/users.model.js";

//Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, method, info, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm trong đơn hàng" });
    }

    const order = new Order({
      userId,
      items,
      method,
      info,
      total,
    });

    await order.save();

    // Xóa giỏ hàng sau khi đặt hàng
    const user = await User.findById(userId);
    user.cart = [];
    await user.save();
    res.status(201).json({ message: "Đặt hàng thành công", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error: error.message });
  }
};

//Lấy danh sách đơn hàng của người dùng
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng", error: error.message });
  }
};


//lấy ra tất cả đơn hàng
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "username email")
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error: error.message });
  }
};

// duyệt đơn hàng
export const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Đơn hàng không ở trạng thái chờ duyệt" });
    }

    order.status = "confirmed";
    await order.save();

    res.json({ message: "Đã duyệt đơn hàng", order });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Hủy đặt hàng
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId, status: "pending" }, // ✅ kiểm tra đúng người dùng
      { status: "cancelled" },
      { new: true }
    );

    if (!order)
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng hoặc không thể hủy" });

    res.json({ success: true, message: "Đã hủy đơn hàng", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi hủy đơn hàng", error: error.message });
  }
};