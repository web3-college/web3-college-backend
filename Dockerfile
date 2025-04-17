# 构建阶段
FROM public.ecr.aws/lambda/nodejs:20 AS builder

WORKDIR /app

# 复制pnpm配置文件
COPY pnpm-lock.yaml package.json ./

# 安装pnpm
RUN npm install -g pnpm

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 复制源代码和prisma文件夹
COPY . .

# 生成Prisma客户端
RUN pnpm run prisma:generate

# 编译TypeScript
RUN pnpm build

# 仅安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 最终阶段
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# 从构建阶段复制编译后的代码和node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 复制prisma相关文件
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 设置Lambda处理函数
CMD [ "dist/lambda.handler" ]