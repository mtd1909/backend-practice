const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const fs = require("fs");
const { sendSuccess, sendError } = require("../helper/response");

dotenv.config();

// Cấu hình cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Cấu hình multer lưu file tạm
const upload = multer({ dest: "uploads/" });

// Route upload ảnh

const uploadImage = async (req, res) => {
  try {
    const path = req.file.path;
    const result = await cloudinary.uploader.upload(path, {
      folder: "my_uploads", // Tùy chọn: lưu ảnh vào folder
    });
    fs.unlinkSync(path); // Xoá file tạm sau khi upload
    return sendSuccess(res, {
      url: result.secure_url,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Upload failed.");
  }
}

module.exports = { uploadImage };
