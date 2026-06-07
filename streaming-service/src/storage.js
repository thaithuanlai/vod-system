// Khởi tạo Google Cloud Storage client
const { Storage } = require('@google-cloud/storage');

let storage;
let bucket;

function initStorage() {
  // Nếu có credentials file thì dùng, không thì dùng ADC (trên Cloud Run)
  const options = {};
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    options.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  storage = new Storage(options);
  bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
  return bucket;
}

function getBucket() {
  if (!bucket) throw new Error('GCS chưa được khởi tạo');
  return bucket;
}

module.exports = { initStorage, getBucket };
