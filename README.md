# 拍档 - 羽毛球运动社交平台

一个基于 Vite + TypeScript 的 PWA 应用，支持在腾讯云 Edge One Pages 等静态托管平台上部署。

## 部署到腾讯云 Edge One Pages

### 方式一：通过腾讯云控制台部署

1. 访问 [腾讯云 Edge One Pages 控制台](https://console.cloud.tencent.com/eo/pages)
2. 点击 "新建项目"
3. 选择部署方式：
   - **Git 仓库部署**：连接 GitHub/GitLab 仓库
   - **本地上传**：直接上传 dist 文件夹内容
4. 配置构建参数：
   - 构建命令：`pnpm run build`
   - 输出目录：`dist`
5. 点击 "部署"

### 方式二：通过腾讯云 CLI 部署

```bash
# 安装腾讯云 CLI (如果还没有安装)
npm install -g @tencentcloud/cli

# 配置腾讯云 CLI
tccli configure

# 部署到 Edge One Pages
# 注意：需要先在控制台创建项目，然后使用项目 ID
```

### 方式三：手动上传部署

1. 本地构建项目：
   ```bash
   pnpm install
   pnpm run build
   ```
2. 将 `dist` 文件夹内容上传到腾讯云 Edge One Pages
3. 配置路由规则（已在 `_config.yml` 中配置）

## 项目配置

项目使用 `_config.yml` 文件进行腾讯云 Edge One Pages 配置：

- **构建命令**：`pnpm run build`
- **输出目录**：`dist`
- **路由规则**：SPA 路由配置
- **缓存策略**：静态资源缓存优化
- **忽略文件**：排除不必要的文件

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 项目结构

```
├── public/
│   ├── icons/          # PWA 图标
│   ├── manifest.json   # PWA 清单
│   └── sw.js          # Service Worker
├── src/
│   ├── api/           # API 接口
│   ├── components/    # UI 组件
│   ├── pages/        # 页面组件
│   ├── router/       # 路由
│   ├── store/        # 状态管理
│   ├── styles/       # 样式
│   ├── types/        # 类型定义
│   └── main.ts       # 入口文件
├── index.html
├── vite.config.ts
├── vercel.json       # Vercel 配置
└── package.json
```

## 技术栈

- **构建工具**: Vite 7
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **路由**: Hash 路由
- **状态管理**: 轻量级 Store
- **PWA**: Service Worker + Manifest

## 功能特性

- [x] 活动发现与创建
- [x] 场地查询
- [x] 用户认证
- [x] 个人中心
- [x] PWA 支持（可安装到桌面）
- [x] 响应式设计

## 环境变量

本项目无需后端 API，使用本地存储模拟数据。

如需连接真实后端，可创建 `.env` 文件：

```env
VITE_API_BASE_URL=https://your-api.com
```

## License

MIT
