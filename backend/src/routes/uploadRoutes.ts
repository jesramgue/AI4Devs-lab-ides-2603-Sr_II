import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { UploadController } from '../presentation/controllers/uploadController';

const router = Router();
const uploadController = new UploadController();

// Configure multer to keep file in memory for processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit at multer level
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    // Accept all files here, filtering happens in FileStorageService
    cb(null, true);
  },
});

/**
 * POST /upload
 * Upload a file
 * Accepts multipart/form-data with field name "file"
 */
router.post(
  '/upload',
  upload.single('file'),
  uploadController.uploadFile
);

export default router;
