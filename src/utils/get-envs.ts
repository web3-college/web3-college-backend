import * as dotenv from 'dotenv';
import fs from 'fs';

export function getEnvs() {
  const envFilePaths = [
    `.env.${process.env.NODE_ENV || `development`}`,
    '.env',
  ];
  let parsedConfig;
  if (!fs.existsSync('.env')) {
    parsedConfig = process.env;
  } else {
    parsedConfig = dotenv.config({ path: '.env' }).parsed;
  }
  envFilePaths.forEach((path) => {
    if (path === '.env') return;
    if (fs.existsSync(path)) {
      const config = dotenv.config({ path });
      Object.assign(parsedConfig, config.parsed);
    }
  });
  return parsedConfig;
}