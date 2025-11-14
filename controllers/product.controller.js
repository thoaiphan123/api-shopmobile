import Product from '../models/products.model.js';

// [GET] /api/products Lấy tất cả sản phẩm

export const index = async (req, res) => {
  const find = {
    deleted: false,
    status: "active"
  }
  try {
    const products = await Product.find(find);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm", error });
  }
 
};

// [GET] /api/products?category=category&brand=brand Lấy sản phẩm theo bộ lọc
export const getFilteredProducts = async (req, res) => {
  try {
    const { category, brand, status } = req.query;

    const filter = { 
      deleted: false,
      status: "active" 
    };

    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, "i");
    if (status) filter.status = status;

    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    console.error("Lỗi lọc sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

//[GET] // GET /api/search?name=name lấy sản phẩm theo tên

export const searchByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tên sản phẩm để tìm kiếm",
      });
    }

    const products = await Product.find({
      name: { $regex: name, $options: "i" },
      deleted: false,
      status: "active"
    });

    res.status(200).json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tìm kiếm sản phẩm",
    });
  }
};

// [GET] /api/products/category/:category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category, status : "active" })
      .limit(20); //lấy 20 sản phẩm

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Không có sản phẩm nào thuộc danh mục này" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo category:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/products/discount/:percentage
export const getProductsByDiscount = async (req, res) => {
  try {
    const percentage = Number(req.params.percentage) || 10;

    const products = await Product.find({
      discount: { $gt: percentage}, status : "active"
    })
      .limit(10); 
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sản phẩm giảm giá",
      error: error.message,
    });
  }
};
