const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const { getProducts, getProduct, createProduct, deleteProduct } = require('../controllers/productController');
const { requireAdmin } = require('../middleware/auth');

// Use Cloudinary in production, local disk in development
let upload;
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
) {
  const { upload: cloudUpload } = require('../config/cloudinary');
  upload = cloudUpload;
} else {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_')),
  });
  upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
}

router.get('/',       getProducts);
router.get('/:id',    getProduct);
router.post('/',      requireAdmin, upload.array('images', 6), createProduct);
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;
