// 定义分片上传初始化结果接口
export interface MultipartUploadInit {
  uploadId?: string;
  key: string;
  fileName: string;
  url?: string;
  expiration?: string | null;
}

// 定义分片上传部分结果接口
export interface PartUploadResult {
  ETag: string;
  PartNumber: number;
}

// 定义完成上传结果接口
export interface CompleteUploadResult {
  url: string;
  key: string;
} 