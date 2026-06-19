import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import multer from "multer";
import { Readable } from "stream";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function getS3Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET;
  if (!auth?.startsWith("Bearer ") || !jwtSecret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    jwt.verify(auth.slice(7), jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

router.post("/admin/upload", requireAdmin, upload.single("file"), async (req: Request, res: Response) => {
  const bucketName = process.env.R2_BUCKET_NAME;
  const s3 = getS3Client();

  if (!s3 || !bucketName) {
    res.json({ available: false, error: "R2 not configured" });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const ext = file.originalname.includes(".") ? file.originalname.split(".").pop() : "jpg";
  const key = `products/${randomUUID()}.${ext}`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const fileUrl = `/api/images/${encodeURIComponent(key)}`;
    res.json({ available: true, fileUrl });
  } catch (err) {
    console.error("R2 upload error:", err);
    res.status(500).json({ available: false, error: "Upload to R2 failed" });
  }
});

router.get("/images/:key", async (req: Request, res: Response) => {
  const bucketName = process.env.R2_BUCKET_NAME;
  const s3 = getS3Client();

  if (!s3 || !bucketName) {
    res.status(503).send("Image storage not configured");
    return;
  }

  const key = decodeURIComponent(req.params.key);

  try {
    const result = await s3.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));

    if (result.ContentType) res.setHeader("Content-Type", result.ContentType);
    if (result.ContentLength) res.setHeader("Content-Length", result.ContentLength);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    (result.Body as Readable).pipe(res);
  } catch (err) {
    console.error("R2 fetch error:", err);
    res.status(404).send("Image not found");
  }
});

export default router;
