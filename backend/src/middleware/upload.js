// src/middleware/upload.js
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

function makeStorage(destination) {
  return multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.join(__dirname, '../../uploads', destination);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

function imageFilter(req, file, cb) {
  const allowed = /\.(png|jpg|jpeg)$/i;
  if (!allowed.test(path.extname(file.originalname))) {
    return cb(new Error('อนุญาตเฉพาะไฟล์ PNG และ JPG เท่านั้น'), false);
  }
  cb(null, true);
}

const uploadArtwork = multer({
  storage:  makeStorage('artworks'),
  fileFilter: imageFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

const uploadSlip = multer({
  storage:  makeStorage('slips'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const uploadReference = multer({
  storage:  makeStorage('references'),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const uploadDraft = multer({
  storage:  makeStorage('drafts'),
  fileFilter: imageFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const uploadCommission = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const sub = file.fieldname === 'reference_image' ? 'references' : 'slips';
      const dir = path.join(__dirname, '../../uploads', sub);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
}).fields([
  { name: 'reference_image', maxCount: 1 },
  { name: 'slip_image', maxCount: 1 },
]);

module.exports = { uploadArtwork, uploadSlip, uploadReference, uploadDraft, uploadCommission };

