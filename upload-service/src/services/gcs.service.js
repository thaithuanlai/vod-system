import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';



const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;






export const uploadBufferToGCS = async (fileObject) => {
    if (!bucketName) {
        throw new Error("Cấu hình thiếu GCS_BUCKET_NAME trong biến môi trường.");
    }

    const bucket = storage.bucket(bucketName);


    const fileExtension = fileObject.originalname.split('.').pop();
    const uniqueFileName = `raw-videos/${uuidv4()}.${fileExtension}`;

    const blob = bucket.file(uniqueFileName);


    const metadata = {
        contentType: fileObject.mimetype,
        metadata: {
            originalName: fileObject.originalname,
            size: fileObject.size.toString(),
            mimeType: fileObject.mimetype
        }
    };


    return new Promise((resolve, reject) => {
        const blobStream = blob.createWriteStream({
            metadata: metadata,
            resumable: false 
        });

        blobStream.on('error', (err) => {
            reject(new Error(`GCS Upload Fail: ${err.message}`));
        });

        blobStream.on('finish', () => {

            const gcsPath = `gs://${bucketName}/${uniqueFileName}`;
            resolve({
                gcsPath,
                fileName: uniqueFileName,
                originalName: fileObject.originalname
            });
        });


        blobStream.end(fileObject.buffer);
    });
};