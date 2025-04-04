# Web3 College Backend

这是Web3 College项目的后端服务。

## 环境要求

- Node.js 20+
- pnpm
- PostgreSQL

## 项目设置

1. 首先，仿照`.env.example`创建 `.env` 文件在项目根目录，并添加以下必要的环境变量：

2. 安装依赖：

```bash
pnpm install
```

3. 生成Prisma客户端：

```bash
pnpm run prisma:generate
```

## 启动项目

开发环境启动：

```bash
pnpm run start:dev
```
项目启动后会生产openapi-spec.json文件，这是帮助前端生产请求api的文件