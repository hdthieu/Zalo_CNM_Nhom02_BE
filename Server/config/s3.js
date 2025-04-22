const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3Client = new S3Client({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// const upload = multer({
//   storage: multerS3({
//     s3: s3Client,
//     bucket: process.env.AWS_BUCKET_NAME,
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       cb(null, `${Date.now()}-${file.originalname}`);
//     },
//   }),
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB
//   },
// });

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      cb(null, `${Date.now()}-${sanitizedName}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "video/mp4",
      "video/quicktime",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-powerpoint", // .ppt
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      "audio/mpeg",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Chỉ hỗ trợ các định dạng JPG, PNG, PDF, MP4, DOC, DOCX, XLS, XLSX, PPT, PPTX"
        ),
        false
      );
    }
  },
});

module.exports = {
  s3Client,
  Upload,
  upload,
};
