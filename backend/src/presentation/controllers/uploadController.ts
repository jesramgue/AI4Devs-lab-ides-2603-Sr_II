import { Request, Response } from 'express';
import { FileStorageService } from '../../infrastructure/fileStorage';

export class UploadController {
  private fileStorageService: FileStorageService;

  constructor() {
    this.fileStorageService = new FileStorageService();
  }

  /**
   * Handle file upload
   * POST /upload
   */
  uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if file exists
      if (!req.file) {
        res.status(400).json({
          error: 'No file provided',
          message: 'File is required',
        });
        return;
      }

      // Validate file type
      if (!this.fileStorageService.validateMimeType(req.file)) {
        res.status(415).json({
          error: 'Unsupported Media Type',
          message: `File type ${req.file.mimetype} is not supported. Allowed types: ${this.fileStorageService.getAllowedMimeTypes().join(', ')}`,
        });
        return;
      }

      // Validate file size
      if (!this.fileStorageService.validateFileSize(req.file)) {
        res.status(413).json({
          error: 'Payload Too Large',
          message: `File size exceeds maximum of ${this.fileStorageService.getMaxFileSizeMb()}MB`,
        });
        return;
      }

      // Upload file
      const fileMetadata = this.fileStorageService.uploadFile(req.file);

      res.status(200).json({
        success: true,
        data: fileMetadata,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message:
          error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };
}
