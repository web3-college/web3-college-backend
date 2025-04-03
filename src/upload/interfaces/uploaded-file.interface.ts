export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface FileCheckResult {
  exists: boolean | null;
  url?: string;
  fileHash?: string;
  error?: string;
} 