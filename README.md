# X-Gym 健身应用

一个基于 Vue 3 + Vite + Firebase 的现代化健身追踪 Web 应用，支持运动数据记录、预约管理、BMI 计算等功能。

## 🚀 功能特性

- **运动数据追踪** - 记录每日运动活动和卡路里消耗
- **预约管理** - 健身房设备和课程预约系统
- **BMI 计算器** - 健康指标计算和可视化
- **数据可视化** - 图表展示运动趋势和成果
- **多语言支持** - 中英文界面切换
- **响应式设计** - 适配桌面端和移动端
- **暗色主题** - 支持明暗主题切换

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **样式框架**: Tailwind CSS + PostCSS
- **后端服务**: Firebase (Authentication, Firestore)
- **地图服务**: Leaflet
- **图表库**: Chart.js
- **代码规范**: ESLint + Prettier

## 📋 环境要求

- Node.js >= 20.0.0
- npm >= 10.0.0

## 🔧 项目安装

### 1. 克隆项目
```bash
git clone https://github.com/I-am-ctrl-c/mobilefinal.git
cd mobilefinal
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置 Firebase
创建 `.env` 文件并添加您的 Firebase 配置：
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 🚀 运行项目

### 开发环境
```bash
npm run dev
```
启动开发服务器，默认运行在 `http://localhost:5173`

### 预览构建结果
```bash
npm run preview
```
预览生产构建，用于本地测试

## 📦 项目构建

### 标准构建
```bash
npm run build
```
生成优化的生产版本到 `dist/` 目录

### 增强混淆构建（推荐用于生产）
```bash
npm run build:obfuscated
```
生成高度混淆的生产版本，提供额外的代码保护

## 🔍 代码质量

### 代码检查
```bash
npm run lint
```
运行 ESLint 检查并自动修复问题

### 代码格式化
```bash
npm run format
```
使用 Prettier 格式化代码

## 📁 项目结构

```
src/
├── App/                 # 主应用组件
├── assets/             # 静态资源（图片、样式）
├── components/         # 可复用组件
│   ├── NavBar/         # 导航栏组件
│   └── Footer/         # 页脚组件
├── pages/              # 页面组件
│   ├── Home/           # 首页
│   ├── Booking/        # 预约页面
│   ├── Workout/        # 运动数据页面
│   ├── Schedule/       # 日程管理
│   ├── Profile/        # 用户资料
│   └── Map/            # 地图页面
├── services/           # 业务逻辑服务
├── i18n/              # 国际化文件
├── router/            # 路由配置
├── models/            # 数据模型
└── main.js            # 应用入口
```

## 🌐 部署

### Vercel
1. 在 Vercel Dashboard 添加环境变量
2. 连接 GitHub 仓库自动部署

### Netlify
1. 在 Netlify Dashboard 配置环境变量
2. 上传 `dist/` 目录或连接 Git 仓库

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
npm run build:obfuscated
firebase deploy
```

## 🔐 安全特性

- Firebase 安全规则保护数据访问
- API 密钥多层混淆处理
- 代码压缩和变量名混淆
- 移除生产环境调试信息

## 🐛 常见问题

### Firebase 配置问题
- 确保 `.env` 文件配置正确
- 检查 Firebase 项目权限设置

### 构建失败
- 确保 Node.js 版本 >= 20
- 删除 `node_modules` 重新安装依赖

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙋‍♂️ 支持

如有问题请提交 [Issue](https://github.com/I-am-ctrl-c/mobilefinal/issues) 或联系维护者。

---

**开发环境推荐**: [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 扩展
