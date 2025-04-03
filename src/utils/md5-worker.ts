import { parentPort, workerData } from 'worker_threads';
import { createHash } from 'crypto';

if (!parentPort) {
  throw new Error('This file must be run as a worker thread');
}

const { chunk, index } = workerData;

try {
  const hash = createHash('md5');
  hash.update(chunk);
  const result = hash.digest('hex');
  
  parentPort.postMessage({
    index,
    hash: result
  });
} catch (error) {
  parentPort.postMessage({
    index,
    error: error.message
  });
} 