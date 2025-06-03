const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../controllers/mediaController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // lưu file tạm

router.post('/', upload.single('image'), uploadImage);

module.exports = router;
