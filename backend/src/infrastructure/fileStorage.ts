import fs from 'fs';
import path from 'path';
import { Express } from 'express';

export interface FileMetadata {
  filePath: string;
  fileType: string;
  fileSize: number;
}

export class FileStorageService {
  private uploadDir: string;
  private maxFileSizeMb: number;
  private allowedMimeTypes: string[];

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);
    this.allowedMimeTypes = (
      process.env.ALLOWED_MIME_TYPES ||
      'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ).split(',');

    // Ensure upload directory exists
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validates file size against configured maximum
   */
  validateFileSize(file: Express.Multer.File, maxMb?: number): boolean {
    const maxBytes = (maxMb || this.maxFileSizeMb) * 1024 * 1024;
    return file.size <= maxBytes;
  }

  /**
   * Validates MIME type against allowed types
   */
  validateMimeType(
    file: Express.Multer.File,
    allowedTypes?: string[]
  ): boolean {
    const typesToCheck = allowedTypes || this.allowedMimeTypes;
    return typesToCheck.includes(file.mimetype);
  }

  /**
   * Uploads file and returns metadata
   */
  uploadFile(file: Express.Multer.File): FileMetadata {
    if (!this.validateMimeType(file)) {
      throw new Error(
        `Unsupported file type: ${file.mimetype}. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    if (!this.validateFileSize(file)) {
      throw new Error(
        `File size exceeds maximum of ${this.maxFileSizeMb}MB`
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, filename);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    return {
      filePath: filename,
      fileType: file.mimetype,
      fileSize: file.size,
    };
  }

  /**
   * Deletes file safely
   */
  deleteFile(filename: string): void {
    const filePath = path.join(this.uploadDir, filename);

    // Prevent directory traversal attacks
    const resolvedUploadDir = path.resolve(this.uploadDir);
    const resolvedFilePath = path.resolve(filePath);

    if (!resolvedFilePath.startsWith(resolvedUploadDir)) {
      throw new Error('Invalid file path');
    }

    if (fs.existsSync(resolvedFilePath)) {
      fs.unlinkSync(resolvedFilePath);
    }
  }

  /**
   * Get upload directory path
   */
  getUploadDir(): string {
    return this.uploadDir;
  }

  /**
   * Get allowed MIME types
   */
  getAllowedMimeTypes(): string[] {
    return this.allowedMimeTypes;
  }

  /**
   * Get max file size in MB
   */
  getMaxFileSizeMb(): number {
    return this.maxFileSizeMb;
  }
}
