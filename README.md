# Local-trans Translation 官方网站

长沙乔译翻译有限公司官方网站 - 专业翻译服务提供商

## 项目概述

这是一个专业的翻译服务公司网站，提供医疗、制造业、金融、软件、多媒体等领域的高质量翻译、口译、本地化服务。

## 最新优化内容

### 1. 技术架构升级
- ✅ 移除了 Bmob 后端服务依赖
- ✅ 集成 Supabase 作为新的后端服务
- ✅ 添加现代化的 CSS 样式和动画效果
- ✅ 优化了页面 SEO 配置

### 2. 设计风格优化
- ✅ 采用现代简约设计风格
- ✅ 添加了渐变背景和卡片阴影效果
- ✅ 优化了导航栏的透明度和固定效果
- ✅ 增加了滚动动画和交互效果
- ✅ 改进了移动端响应式布局

### 3. SEO 优化
- ✅ 添加了完整的 meta 标签
- ✅ 优化了页面标题和描述
- ✅ 创建了 robots.txt 文件
- ✅ 生成了 sitemap.xml 站点地图
- ✅ 添加了结构化数据标记
- ✅ 优化了图片 alt 属性

### 4. 功能增强
- ✅ 添加了专业的联系表单
- ✅ 集成了 Supabase 数据存储
- ✅ 改进了多语言支持
- ✅ 添加了用户行为跟踪
- ✅ 优化了错误处理机制

## 技术栈

- **前端框架**: HTML5, CSS3, JavaScript (ES6+)
- **UI 框架**: Bootstrap 3.2.0
- **图标字体**: Font Awesome 4.7.0
- **后端服务**: Supabase
- **国际化**: jQuery i18n Properties
- **统计分析**: Clicky Analytics
- **构建工具**: 无需构建，纯静态网站

## 项目结构

```
local-trans.github.io/
├── index.html              # 主页
├── about.html              # 关于我们
├── join.html               # 加入我们
├── products.html           # 产品服务
├── news.html               # 新闻动态
├── profuile.html           # 公司介绍
├── css/
│   ├── main.css           # 主要样式
│   └── modern-style.css   # 现代化样式
├── js/
│   ├── main.js            # 主要脚本
│   └── animations.js      # 动画效果
├── i18n/                  # 国际化文件
│   ├── strings_zh.properties
│   └── strings_en.properties
├── img/                   # 图片资源
├── plug/                  # 第三方插件
├── robots.txt             # 搜索引擎爬虫配置
├── sitemap.xml            # 站点地图
├── .env                   # 环境变量配置
└── package.json           # 项目配置
```

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/local-trans/local-trans.github.io.git
cd local-trans.github.io
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问网站
打开浏览器访问 `http://localhost:3000`

## Supabase 配置

项目使用 Supabase 作为后端服务，需要创建以下数据表：

### contact_inquiries 表结构
```sql
CREATE TABLE contact_inquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  language TEXT DEFAULT 'zh',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 部署说明

### GitHub Pages 部署
1. 推送代码到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支作为发布源
4. 网站将自动部署到 `https://local-trans.github.io`

### 自定义域名
如需使用自定义域名，请：
1. 在仓库根目录创建 `CNAME` 文件
2. 在文件中添加您的域名
3. 在域名提供商处配置 DNS 记录

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)
- IE 11+ (基本支持)

## 性能优化

- 图片懒加载
- CSS 和 JS 文件压缩
- 启用浏览器缓存
- CDN 加速静态资源
- 响应式图片优化

## 联系方式

- **电话**: (+86)13823531229
- **邮箱**: joanne.wan@local-trans.com
- **公司**: 长沙乔译翻译有限公司
- **网站**: https://local-trans.github.io

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 更新日志

### v1.0.0 (2024-01-15)
- 移除 Bmob 依赖，集成 Supabase
- 优化页面设计风格
- 完善 SEO 配置
- 添加现代化交互效果
- 改进移动端体验