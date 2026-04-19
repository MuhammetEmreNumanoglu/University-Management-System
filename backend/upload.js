const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Eğer 'uploads' klasörü yoksa oluştur
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Add more detailed logging for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Multer receiving file:", file.originalname);
    console.log("Destination directory:", uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    console.log("Generating filename:", uniqueName);
    cb(null, uniqueName); // Dosya ismini eşsiz yap
  },
});

// Filter to validate file types
const fileFilter = (req, file, cb) => {
  console.log("Checking file type:", file.originalname, file.mimetype);

  // Accept excel files
  const validMimeTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ];

  if (validMimeTypes.includes(file.mimetype)) {
    console.log("File type accepted");
    cb(null, true);
  } else {
    console.log("File type rejected");
    cb(
      new Error(`Invalid file type. Only Excel/CSV files are allowed.`),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB size limit
  },
});

module.exports = upload;
