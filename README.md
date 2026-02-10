# 路过人间 · 打卡中国

Vue 3 + Vite 静态项目：中国地图省份打卡状态展示。根据配置为各省份着色（已打卡 / 即将打卡 / 规划中 / 未规划），已打卡省份可点击查看打卡图片、视频；支持公开查看或输入姓名校验两种权限。纯前端，无后端请求。

## 技术栈

- Vue 3 + Vite 5
- Vue Router
- vite-plugin-svg-icons（svg-icon 组件）
- 静态资源置于 `public/media/`

## 环境要求

- Node.js >= 18.0.0

## 开发

```bash
npm install
npm run dev
```

## 构建与部署（GitHub Pages）

```bash
npm run build
```

将 `dist` 目录内容推送到仓库根目录或配置的 GitHub Pages 分支即可。若仓库名为 `用户名.github.io`（根站点），请在 `vite.config.js` 中将生产环境 `base` 改为 `'/'`；若为项目子路径站点，则保持 `base: '/仓库名/'`。

## 配置说明

- **省份配置**：`src/config/provinces.js`
  - `state`: `done` | `soon` | `planned` | `unplanned`
  - `viewPermission`: `public`（所有人可看）| `name`（需输入允许的姓名）
  - `allowedNames`: 当 `viewPermission` 为 `name` 时的允许姓名列表
  - `media`: 媒体列表，`type` 为 `image` 或 `video`，`src` 为相对于站点 base 的路径（如 `media/beijing/1.jpg`）

- **媒体文件**：放在 `public/media/` 下，按省份建子目录（如 `public/media/beijing/`、`public/media/shanghai/`），在配置中引用即可。

- **地图数据**：当前使用简化版省份 path，在 `src/assets/map/paths.js`。可替换为完整中国地图 SVG path 数据（如从 echarts map、datav 等转换）以得到更精确的省界。

## 项目结构（简要）

```
src/
  components/   # ChinaMap、ProvinceDetail、SvgIcon
  config/        # provinces.js 省份与打卡配置
  assets/        # map/paths.js、icons/（svg-icon 图标）
  views/         # MapView
  router/
  styles/
public/
  media/         # 打卡图片、视频（按省份分子目录）
```
