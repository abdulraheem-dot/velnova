const Product   = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

exports.getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.cat) filter.category = req.query.cat;
    const limit = parseInt(req.query.limit) || 100;
    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json({ success: true, products });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Could not fetch products.' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Could not fetch product.' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, oldPrice, description, sizes, badge } = req.body;
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;

    // Cloudinary gives file.path (https://...), local disk gives file.filename
    // Never use file.path for local disk — it returns a full OS path on Windows
    const images = (req.files || []).map(f => {
      if (f.path && f.path.startsWith('http')) return f.path;   // Cloudinary URL
      return `/uploads/${f.filename}`;                           // local disk
    });

    const product = await Product.create({
      name,
      category,
      price:    Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      description,
      sizes:    parsedSizes,
      badge:    badge || null,
      images,
    });

    res.status(201).json({ success: true, product });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Could not create product.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Delete images from Cloudinary
    for (const imageUrl of product.images) {
      try {
        // Extract public_id from URL: .../velnova-products/filename
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1].split('.')[0];
        const publicId = `velnova-products/${filename}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn('Could not delete image from Cloudinary:', err.message);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Could not delete product.' });
  }
};
