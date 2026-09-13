# 水晶球世界 · Crystal Ball World

> 一个温暖治愈系的「私域小世界」Web App —— 把日记、记忆与情绪，安放在属于你自己的水晶球里。
> **无需后端、无需配置，克隆下来直接就能跑。**

移动端优先的 React 单页应用：每个用户拥有多个「世界」，在世界里写日记、把不愿留存的记忆「写完即焚」、把沉淀下来的记忆封存进「记忆圣殿」，并让匿名的心事流入「共鸣池」，等待频率相同的人。

---

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 <http://localhost:5173> 即可。

**不需要**起数据库、**不需要**配任何环境变量、**不需要**启动后端 —— 项目默认读取 `src/mocks/` 下的本地演示数据（含 6 组世界、日记、好友、共鸣故事等），全站页面都能正常浏览。

### 演示账号

登录页**已预填**凭据，直接点「登录」即可：

| 字段 | 值 |
| --- | --- |
| 邮箱 | 任意（已预填 `demo@crystal.app`） |
| 密码 | 任意（已预填 `123456`） |

演示模式下不做真实鉴权，任意邮箱 + 任意密码都能进入。

---

## 技术栈

**前端**

- React 18 + TypeScript 5（`strict` 模式）
- Vite 6（构建 / 开发服务器）
- Zustand 5（状态管理，按业务域拆分 8 个 store）
- react-router-dom 6（29 条路由）
- Three.js + @react-three/fiber + @react-three/drei（3D 水晶球）
- Tailwind CSS 4 + CSS Modules（原子类与组件级样式隔离并存）
- 纯手写 Canvas 2D 星场动画 / 粒子焚毁动画

**后端**（可选，默认不参与运行）

- Node.js + Express 5
- MySQL 8 + mysql2
- JWT（jsonwebtoken）+ bcryptjs 鉴权
- helmet / cors / morgan 中间件
- Dockerfile + docker-compose + Nginx（容器化部署）

**规模**：38 个 `.tsx`（其中 24 个页面级组件）· 35 个 CSS Modules · 35 个 `.ts` · 29 条路由 · 6 组 RESTful 接口（auth / worlds / entries / friends / resonances / users）

---

## 数据源切换

全站数据源由**唯一开关** `VITE_USE_MOCK` 控制，定义在 `src/config/env.ts`：

| 取值 | 行为 |
| --- | --- |
| `true`（默认） | 使用 `src/mocks/` 本地演示数据，无需后端 |
| `false` | 请求后端真实 API（需先启动 `backend/`） |

设计上采用**「默认可用」**策略：只有显式写成 `'false'` 才走后端，未配置、留空或拼写错误都会回落到演示数据。这样即使部署环境缺少后端，页面也不会出现「登录失败 + 列表全空」的整站空白。

想在本机联调后端：

```bash
# 1) 启动后端（默认 3000 端口）
cd backend && npm install && npm run dev

# 2) 把开关关掉
echo "VITE_USE_MOCK=false" > .env.local

# 3) 前端 dev server 已配置 /api 代理到 http://localhost:3000（见 vite.config.ts）
npm run dev
```

数据库连接串、JWT 密钥等放在 `backend/.env`（已被 `.gitignore` 忽略，可参考 backend 内的配置说明）。

---

## 构建与容器化部署

```bash
npm run build      # 产出 dist/
npm run preview    # 本地预览构建产物
```

仓库内已包含一键容器化方案：

```bash
docker-compose up -d   # 前端（Nginx 静态托管）+ 后端 + MySQL
```

> 使用容器化全栈部署时，记得把 `.env.production` 中的 `VITE_USE_MOCK` 改为 `false`，
> 让前端指向真实后端 API。

---

## 目录结构

```
private-world/
├─ src/
│  ├─ config/          # 全局配置（数据源开关等）
│  ├─ features/        # 按业务域划分的页面：auth / world / entry / social / timecapsule / settings / shared
│  ├─ components/      # 通用组件与布局（layout / crystal / common）
│  ├─ stores/          # Zustand store（8 个业务域）
│  ├─ mocks/           # 本地演示数据（6 组）
│  ├─ lib/             # API 封装、3D 材质与场景引擎
│  ├─ hooks/           # 自定义 hooks（深夜模式、主题同步等）
│  └─ styles/          # 全局样式与设计变量
├─ backend/            # Express + MySQL 后端（routes / controllers / middleware）
├─ public/             # 静态资源与配图
├─ Dockerfile · docker-compose.yml · nginx.conf   # 容器化部署
└─ tailwind.config.ts · vite.config.ts
```

---

## 核心功能

| 模块 | 说明 |
| --- | --- |
| 世界广场 | 瀑布流卡片布局，Bento Grid + 毛玻璃 + 搜索与筛选 |
| 世界详情 | 3D 可交互水晶球（`meshPhysicalMaterial` + transmission 玻璃材质） |
| 日记编辑器 | 情绪标记、场景匹配、流入共鸣池开关 |
| 写完即焚 | Canvas 手写粒子焚毁动画，记忆「燃烧」后不留痕 |
| 记忆圣殿 | 封存世界按展厅陈列，支持解封 |
| 共鸣池 | 匿名心事以星体轨道排布，可共鸣/点赞 |
| 时光机 | 按时间轴回溯历史日记 |
| 好友 | 好友列表、世界分享与好友世界浏览 |
| 深夜模式 | 按自定义时间段（默认 22:00–06:00，支持跨零点）自动切换，配径向暗角遮罩 |

---

## 已知限制与后续计划

这个项目**可以完整浏览全部页面与交互，但尚不是一个可真实运营的产品**，主要限制：

- **数据不可持久化到服务端**：默认演示模式下数据来自本地 mock，刷新后回到初始状态；`localStorage` 仅持久化了水晶球参数与主题偏好
- **未做路由级代码分割**：29 条路由一次性加载，首屏 JS 体积偏大，页面切换时会有明显卡顿（计划引入 `React.lazy` + `Suspense`，并用 Vite `manualChunks` 将 Three.js 生态独立分包）
- **后端功能未与前端全量打通**：6 组接口已实现，但前端默认走演示数据，未做端到端联调
- **缺少自动化测试**：暂无单元测试与 E2E（计划引入 Vitest + React Testing Library）
- **3D 场景性能**：低端移动设备上水晶球与星场动画可能掉帧

---

## License

课程学习项目，仅供学习交流。
