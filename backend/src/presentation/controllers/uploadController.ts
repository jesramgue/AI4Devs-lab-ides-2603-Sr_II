import { Request, Response, NextFunction } from 'express';
import { FileStorageService } from '../../infrastructure/fileStorage';
import {
  ValidationError as DomainValidationError,
  FileTooLargeError,
  UnsupportedFileTypeError,
} from '../../domain/errors';

export class UploadController {
  private fileStorageService: FileStorageService;

  constructor() {
    this.fileStorageService = new FileStorageService();
  }

  /**
   * Handle file upload
   * POST /upload
   * Domain errors forwarded to the centralized error handler via next().
   */
  uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new DomainValidationError('File is required', [
          { field: 'file', message: 'No file provided' },
        ]);
      }

      if (!this.fileStorageService.validateMimeType(req.file)) {
        throw new UnsupportedFileTypeError(req.file.mimetype);
      }

      if (!this.fileStorageService.validateFileSize(req.file)) {
        throw new FileTooLargeError(this.fileStorageService.getMaxFileSizeMb());
      }

      const fileMetadata = this.fileStorageService.uploadFile(req.file);
      res.status(200).json({ success: true, data: fileMetadata });
    } catch (error) {
      next(error);
    }
  };
}
