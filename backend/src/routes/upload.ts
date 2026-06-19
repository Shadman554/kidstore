import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    res.json({ available: false, error: "R2 not configured" });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const ext = file.originalname.includes(".") ? file.originalname.split(".").pop() : "jpg";
  const key = `products/${randomUUID()}.${ext}`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const fileUrl = `${publicUrl.replace(/\/$/, "")}/${key}`;
    res.json({ available: true, fileUrl });
  } catch (err) {
    console.error("R2 upload error:", err);
    res.status(500).json({ available: false, error: "Upload to R2 failed" });
  }
});

export default router;
