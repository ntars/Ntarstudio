# 星玖工作室 Ntarstudio 官网主页

基于原始仓库部分内容，原作者仓库：https://github.com/asorn/asorn-open

许可证：本项目采用 Apache License 2.0，详情见 `LICENSE` 文件。

---

## 项目概览

星玖工作室（Ntarstudio）个人/团队品牌主页，支持暗色/亮色双主题，包含品牌展示、社交媒体入口与多个子项目导航。

## 站点链接

| 平台 | 地址 | 说明 |
|------|------|------|
| 官网主页 | [https://ntars.github.io/Home-Page/](https://ntars.github.io/Home-Page/) | 本项目部署地址 |
| 星玖工作室 | [https://www.ntars.cn/](https://www.ntars.cn/) | 关于我们与服务展示 |
| NTYI-LINK | [https://yi.ntars.cn/](https://yi.ntars.cn/) | 传统文化与现代科技的智慧连接 |
| GitHub 主页 | [https://github.com/ntars](https://github.com/ntars) | 开源项目与代码仓库 |
| 抖音 Douyin | [https://v.douyin.com/nR0PSoflcOk/](https://v.douyin.com/nR0PSoflcOk/) | 短视频分享与创意内容创作 |
| 哔哩哔哩 Bilibili | [https://space.bilibili.com/499925438](https://space.bilibili.com/499925438) | 技术教程与创意视频创作平台 |
| 爱发电 Afdian | [https://ifdian.net/a/ntars/](https://ifdian.net/a/ntars/) | 创作者赞助支持平台 |

---

## 技术架构

```
Home-Page/
├── index.html              # 主页面（主题初始化 + 设备检测 + 彩蛋 + PWA + Typed.js）
├── manifest.json           # PWA Web App Manifest
├── sw.js                   # Service Worker（离线缓存加速）
├── README.md               # 项目文档
├── LICENSE                 # 开源协议
├── baidu_verify_codeva-C4tp7NQbk5.html  # 百度站长验证
├── tencent-cloud-config.yml              # 腾讯云部署配置
└── assets/
    ├── css/
    │   └── base.css        # 全局样式（暗/亮双主题 / 过渡动画 / 响应式 / PWA适配）
    ├── js/
    │   ├── security.js     # 安全防护模块（禁止选中/复制/右键/快捷键/链接触摸/篡改监测）
    │   ├── app.min.js      # 卡片光晕悬停交互（鼠标位置跟随 radial-gradient）
    │   ├── anime.js        # 动画引擎库（anime.js v2.0.2）
    │   ├── firework.js     # 烟花粒子效果（点击/触摸触发，主题颜色适配）
    │   ├── trail.js        # 鼠标拖尾效果（主题适配 / 触摸支持）
    │   └── bg.js           # 背景交互粒子（鼠标排斥 / 触摸支持 / 连线效果）
    └── img/
        ├── favicon-color.svg       # SVG 网站图标
        ├── apple-touch-icon.png    # Apple Touch Icon (180x180)
        ├── icon-192.png            # PWA 图标 192x192
        └── icon-512.png            # PWA 图标 512x512
```

---

## 核心特性

### 1. 双主题支持
- 默认主题根据用户系统偏好（`prefers-color-scheme`）自动切换
- 无系统偏好时根据时间（6:00-18:00 亮色，其余暗色）
- 双击 "Selected Projects" 标题可手动切换主题
- 主题切换带 0.5s CSS 过渡动画
- 所有视觉元素（背景、卡片、光晕、拖尾、烟花、星星）均适配双主题

### 2. 安全防护 (`assets/js/security.js`)
- 禁止文本选中、复制、剪切
- 禁止右键菜单、拖拽操作
- 禁止键盘快捷键（F12 / Ctrl+Shift+I/C / Ctrl+U/S/P/C / Ctrl+A）
- 鼠标悬停链接时隐藏 URL 显示
- DOM 篡改监测（body 被清空时自动刷新）
- 控制台保护（DevTools 检测 + 警告提示）

### 3. 视觉特效
- **烟花粒子** (`firework.js`)：点击/触摸触发烟花绽放动画，颜色随主题切换
- **鼠标拖尾** (`trail.js`)：鼠标/触摸移动产生渐变拖尾，自动适配主题颜色
- **背景交互粒子** (`bg.js`)：浮动粒子连线网络，鼠标靠近时排斥
- **卡片光晕** (`app.min.js`)：悬停时 radial-gradient 光晕跟随鼠标
- **底部装饰**：紫色光晕 + 三层上升星星动画 + 地球圆
- **背景点阵**：问候语区域虚线点阵装饰

### 4. PWA 支持
- **Web App Manifest**：`display: standalone` 独立窗口模式
- **Apple Web App 适配**：`apple-mobile-web-app-capable` + safe-area-inset
- **Service Worker**：缓存优先策略，离线可用
- **安装事件**：`beforeinstallprompt` 浏览器原生安装横幅

### 5. 设备适配与彩蛋
- **手机端**：显示 "Hi, I'm Ntars"（个人模式）
- **桌面端**：显示 "Hi, We're Ntarstudio"（工作室模式）
- **平板端**：横屏显示工作室模式，竖屏显示个人模式，自动切换
- **触发方式**：点击名字区域可手动切换（平板端除外）
- **平滑过渡**：淡入淡出动画
- **打字效果**：Typed.js 自动打字动画

---

## 本地开发

```bash
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

> Service Worker 仅在 `localhost` 下生效，`file://` 协议不支持。

## 部署

- **GitHub Pages**：推送至 `main` 分支自动部署
- **腾讯云 COS**：通过 GitHub Actions 部署，需配置 `TENCENT_CLOUD_*` 密钥
