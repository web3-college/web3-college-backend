import { createHash } from 'crypto';
import { Worker } from 'worker_threads';
import * as path from 'path';
import * as os from 'os';

/**
 * 使用多线程计算文件的MD5值
 * @param buffer 文件buffer
 * @param chunkSize 每个线程处理的数据块大小（默认5MB）
 * @returns Promise<string> MD5值
 */
export async function calculateMd5MultiThread(buffer: Buffer, chunkSize: number = 5 * 1024 * 1024): Promise<string> {
  // 获取CPU核心数，用于确定线程数
  const numThreads = os.cpus().length;
  
  // 计算每个线程需要处理的数据块
  const chunks: Buffer[] = [];
  for (let i = 0; i < buffer.length; i += chunkSize) {
    chunks.push(buffer.subarray(i, Math.min(i + chunkSize, buffer.length)));
  }

  // 如果数据块数量小于线程数，直接使用单线程计算
  if (chunks.length <= numThreads) {
    return calculateMd5(buffer);
  }

  // 创建工作线程
  const workers = chunks.map((chunk, index) => {
    return new Promise<string>((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'md5-worker.js'), {
        workerData: {
          chunk: chunk,
          index: index
        }
      });

      worker.on('message', (result) => {
        resolve(result.hash);
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  });

  // 等待所有工作线程完成
  const hashes = await Promise.all(workers);

  // 合并所有哈希值并计算最终MD5
  const finalHash = createHash('md5');
  hashes.forEach(hash => finalHash.update(hash));
  return finalHash.digest('hex');
}

/**
 * 单线程计算MD5值
 * @param buffer 文件buffer
 * @returns Promise<string> MD5值
 */
export function calculateMd5(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('md5');
    hash.on('readable', () => {
      const data = hash.read();
      if (data) {
        resolve(data.toString('hex'));
      }
    });
    hash.on('error', reject);
    hash.write(buffer);
    hash.end();
  });
}