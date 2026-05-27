# 星玖工作室 Ntarstudio 官网主页

开源声明：本项目基于原始仓库的部分内容，原作者仓库：https://github.com/asorn/asorn-open

许可证：本项目采用 Apache License 2.0，详情见 `LICENSE` 文件。

使用方式：

## 本地开发

克隆仓库后直接部署静态站点即可：

```bash
git clone <repo>
cd <repo>
python3 -m http.server 8000
# 然后在浏览器打开 http://localhost:8000
```

## GitHub Pages 部署

本项目已配置 GitHub Actions 自动部署到 GitHub Pages：

1. 将代码推送到 GitHub 仓库的 `main` 分支
2. GitHub Actions 会自动构建并部署到 GitHub Pages
3. 访问地址：`https://<username>.github.io/<repository-name>/`

也可以在 GitHub 仓库的 Actions 页面手动触发部署。

## 腾讯云静态网站托管部署

本项目也支持部署到腾讯云 COS 静态网站托管：

### 前置准备

1. 在腾讯云控制台创建 COS 存储桶，并启用静态网站功能
2. 获取腾讯云 API 密钥（SecretId 和 SecretKey）
3. 在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下密钥：
   - `TENCENT_CLOUD_SECRET_ID`: 腾讯云 SecretId
   - `TENCENT_CLOUD_SECRET_KEY`: 腾讯云 SecretKey
   - `TENCENT_COS_BUCKET`: COS 存储桶名称
   - `TENCENT_COS_REGION`: 存储桶所在区域（如 ap-beijing）
   - `TENCENT_CDN_DOMAIN`: CDN 域名（可选，如果启用了 CDN）

### 部署流程

1. 将代码推送到 GitHub 仓库的 `main` 分支
2. GitHub Actions 会自动构建并部署到腾讯云 COS
3. 通过配置的域名访问网站