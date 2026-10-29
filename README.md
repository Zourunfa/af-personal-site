# 阿锋 — 个人产品与生活

暖白极简个人网站 MVP，使用 React、TypeScript 与 Vite。包含首页、五个项目详情、关于页、可拨动发声的六根琴弦，以及响应式布局和减少动态效果支持。

## 本地开发

```sh
npm install
npm run dev
```

## 构建与预览

```sh
npm run build
npm run preview
```

生产构建输出到 `dist/`。部署到静态托管时，需要将未知路径回退到 `index.html`，以支持 `/about` 与 `/projects/:slug` 直接访问。

## 内容维护

### 诗、感悟与摘抄

- 顶部「文字」进入 `/writing`，单篇地址如 `/writing/a-quiet-heart`。首页文字区展示第一首诗的节选，技术博客入口保留。
- `src/writings.ts` 存放诗与感悟的原文、分节和音乐信息。`imageExcerpts` 可追加摘抄图片路径、替代文本与说明；无图片时不显示空画廊。
- 阅读页采用本地霞鹜文楷字体、逐节入场动画，支持系统减少动态效果；桌面 25px、手机 22px。
- `public/music/zai-le-bonus.mp3` 是用户提供的苏紫旭 & The Paramecia《在了 (Bonus)》。默认不加载音频、不自动播放；点击后播放，可暂停、调进度与音量，离开阅读页时停止。
- 字体已按现有文字裁成约 125KB；后续添加文字后，可用 Python 3.10+ 安装 `fonttools brotli`，运行 `python3 scripts/subset-poetry-font.py` 更新字体。普通构建无需 Python，缺失字形仍可回退系统楷体。字体许可证见 `public/poetry-font-LICENSE.txt`。
- 已检查桌面和 390px 手机阅读布局；音频在浏览器实际播放并产生进度，时长约 4 分 43 秒。

- `src/content.ts`：个人信息、产品介绍、标签、源码与线上链接。
- `src/main.tsx`：页面结构、关于文案、博客与生活区、琴弦音频交互。
- `src/styles.css`：配色、排版、响应式和动效。
- 首页产品预览是标注过的 CSS 概念示意，并非真实产品截图。后续可替换为各产品的实际截图。
- 博客区域展示写作主题与入口，不展示访问量；GitHub star 数不硬编码。
- 旅行与音乐区目前仅介绍爱好；未填充虚构游记、照片或演奏录音。
- 外链产品可能受其服务器、网络与登录条件影响。
- 可选中文衬线字体来自 Google Fonts；加载失败会回退到系统字体。

## 验证

`npm run build` 包含 TypeScript 类型检查及生产打包。浏览器应检查桌面与移动端、项目往返、直接访问子路由、404、琴弦键盘操作和减少动态效果。

## 当前服务器部署

### 分享功能

首页首屏和每个产品详情页提供「分享」按钮，可复制当前页面链接、调用浏览器支持的系统分享、生成宽度 1080px、高度随内容自适应的 PNG 海报。旅行照片以 9:16 展示，海报包含完整链接及 360px 二维码。首页海报不显示个性签名，产品保留项目标题。生成过程完全在浏览器执行，二维码库随主包加载，避免发布更新后动态模块失效。

分享链接统一使用 `src/content.ts` 的 `profile.siteOrigin` 与当前页面路径，避免本地预览或通过 IP 访问时生成错误地址。照片位于 `public/afeng-travel.jpg`，已校正方向、缩小并去除 EXIF 元数据；海报按人物所在位置裁剪。

海报可下载或长按保存；支持文件分享的设备可以使用「分享图片」。微信浏览器显示右上角菜单提示。未接入微信公众号 JS-SDK，不保证微信卡片封面，也不自动发布朋友圈。系统分享、相册保存及具体应用可用性由手机和浏览器决定。

本地验证包括首页与产品海报生成、二维码解码匹配对应 URL、复制链接、Esc/关闭按钮恢复焦点与 390px 手机布局。

- 访问地址：`https://www.afai.asia/me/`
- 服务器：`120.76.141.65`，Nginx 静态托管。
- 文件位置：`/var/www/zourunfa-portfolio/releases/`，`current` 软链接指向当前版本。
- 发布时保留历史哈希资源，兼容已打开的旧页面；`/me/assets/` 下不存在的文件直接返回 404，不回退到首页 HTML。
- Nginx 配置：`/etc/nginx/sites-available/www.afai.asia` 中的 `ZOURUNFA_PORTFOLIO` 区块。仅新增 `/me` 与 `/me/`，保留已有业务配置。
- 初次部署前的 Nginx 配置备份保存在 `/var/www/zourunfa-portfolio/nginx-before-*.conf`。

子目录生产构建：

```sh
npm run build -- --base=/me/
```

上传 dist 压缩包和 `deploy/install-remote.py` 后，可在同一服务器使用安装脚本更新；脚本会新建版本目录、切换软链接、检查 Nginx 配置再 reload，失败时恢复旧配置与软链接。不要把 SSH 密码写入仓库。
