import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const router = Router();

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

router.post("/admin/upload-url", requireAdmin, async (req: Request, res: Response) => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    res.json({ available: false });
    return;
  }

  const { contentType = "image/jpeg", filename = "image" } = req.body as {
    contentType?: string;
    filename?: string;
  };

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const ext = filename.includes(".") ? filename.split(".").pop() : "jpg";
  const key = `products/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const fileUrl = `${publicUrl.replace(/\/$/, "")}/${key}`;
    res.json({ available: true, uploadUrl, fileUrl });
  } catch (err) {
    console.error("R2 presign error:", err);
    res.status(500).json({ available: false, error: "Failed to generate upload URL" });
  }
});

export default router;
