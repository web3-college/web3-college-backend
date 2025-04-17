#!/usr/bin/env node
const { execSync } = require('child_process');
const { exit } = require('process');
require('dotenv').config();

// 从.env文件中读取配置参数
const ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
const REGION = process.env.AWS_REGION;
const REPOSITORY = process.env.AWS_ECR_REPOSITORY;
const TAG = process.env.AWS_ECR_TAG;
const ARCHITECTURE = process.env.AWS_LAMBDA_ARCHITECTURE;

// 验证必要的环境变量已设置
if (!ACCOUNT_ID || !REGION || !REPOSITORY || !TAG || !ARCHITECTURE) {
  console.error('❌ 错误: 缺少必要的环境变量！');
  console.error('请确保已在.env文件中设置以下变量:');
  console.error('AWS_ACCOUNT_ID, AWS_REGION, AWS_ECR_REPOSITORY, AWS_ECR_TAG, AWS_LAMBDA_ARCHITECTURE');
  exit(1);
}

console.log('🚀 开始部署 AWS Lambda 容器镜像...');
console.log(`📋 配置信息:
  • 账号ID: ${ACCOUNT_ID}
  • 区域: ${REGION}
  • 仓库: ${REPOSITORY}
  • 标签: ${TAG}
  • 架构: ${ARCHITECTURE}
`);

try {
  // 第一步：构建Docker镜像
  console.log('\n📦 第1步：构建Docker镜像...');
  execSync(`docker buildx build --platform ${ARCHITECTURE} --provenance=false -t ${REPOSITORY}:latest .`,
    { stdio: 'inherit' });
  console.log('✅ Docker镜像构建成功');

  // 第二步：标记镜像
  console.log('\n🏷️  第2步：标记Docker镜像...');
  execSync(`docker tag ${REPOSITORY}:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPOSITORY}:${TAG}`,
    { stdio: 'inherit' });
  console.log('✅ Docker镜像标记成功');

  // 第三步：推送镜像到ECR
  console.log('\n☁️  第3步：推送Docker镜像到ECR...');
  execSync(`docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPOSITORY}:${TAG}`,
    { stdio: 'inherit' });
  console.log('✅ Docker镜像成功推送到ECR');

  console.log('\n🎉 部署完成！');
  console.log(`镜像地址: ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPOSITORY}:${TAG}`);
} catch (error) {
  console.error('\n❌ 部署过程中发生错误:');
  console.error(error.message);
  exit(1);
} 