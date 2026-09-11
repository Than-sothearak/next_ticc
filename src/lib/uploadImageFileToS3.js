import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3Client = new S3Client({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToS3(file) {
  try {
    const fileType = file.type || "application/octet-stream";
    const isPng = fileType === "image/png";
    const isWebp = fileType === "image/webp";
    const outputType = isPng ? "png" : isWebp ? "webp" : "jpeg";
    const outputContentType = `image/${outputType}`;
    const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, `.${outputType}`)}`;

    // Convert file to Buffer
    const fileBuffer = Buffer.isBuffer(file)
      ? file
      : Buffer.from(await file.arrayBuffer());

    let uploadBuffer = fileBuffer;
    let contentType = fileType;

    // Only compress/resize if it's an image
    if (fileType.startsWith("image/")) {
      const image = sharp(fileBuffer).resize({ width: 1920 });
      uploadBuffer = await (isPng
        ? image.png({ compressionLevel: 9 }).toBuffer()
        : isWebp
          ? image.webp({ quality: 100 }).toBuffer()
          : image.jpeg({ quality: 100 }).toBuffer());

      // Ensure under 1MB
      const MAX_SIZE = 1 * 1024 * 1024; // 1MB

      while (uploadBuffer.length > MAX_SIZE && !isPng) {
        const quality = Math.max(
          10,
          Math.floor((MAX_SIZE / uploadBuffer.length) * 90),
        );
        const image = sharp(uploadBuffer);
        uploadBuffer = await (isPng
          ? image.png({ compressionLevel: 9 }).toBuffer()
          : isWebp
            ? image.webp({ quality }).toBuffer()
            : image.jpeg({ quality }).toBuffer());
      }

      contentType = outputContentType;
      console.log(`Image has been converted to ${outputType} under 1MB`);
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      ACL: "public-read",
      Key: fileName,
      Body: uploadBuffer,
      ContentType: contentType,
    };

    await s3Client.send(new PutObjectCommand(params));
    console.log(`File uploaded successfully to S3: uploads/${fileName}`);
    return `https://${process.env.S3_BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload file to S3");
  }
}

// Helper function to delete file from S3
export async function deleteFileFromS3(file) {
  try {
    if (!file) {
      throw new Error("File key is required for deletion");
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${file}`,
      }),
    );

    console.log(`File deleted successfully from S3: uploads/${file}`);
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw new Error("Failed to delete file from S3");
  }
}
