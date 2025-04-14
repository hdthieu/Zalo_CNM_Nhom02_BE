require("dotenv").config();
const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const { v4: uuidv4 } = require("uuid");

const BUCKET_NAME = process.env.BUCKET_NAME;

async function uploadFile(file) {
  if (!file) {
    throw new Error("No file provided");
  }

  // Tạo tên tệp duy nhất
  const fileName = `${uuidv4()}-${file.originalname}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName, 
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  // Tải tệp lên S3 và trả về URL của tệp
  const uploadResult = await S3.upload(params).promise();
  return uploadResult.Location;
}

module.exports = {
  uploadFile,
};
