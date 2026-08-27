# 项目上下文

## 项目概述

**AIGC+宜宾** — 活动报名系统，支持前端报名表单提交和后端管理员数据导出。

- 活动名称：AIGC+宜宾
- 活动时间：7月12日 周日 13:30-17:30
- 活动地点：宜宾市大数据产业园
- 联合主办：Datawhale / 宜宾市大数据有限责任公司 / 展望数科（成都）科技有限公司 / 智创会

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 通用工具函数 (cn)
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象、`catch` 错误在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。

### next.config 配置规范

- 配置的路径不要写死绝对路径，必须使用 path.resolve(__dirname, ...)、import.meta.dirname 或 process.cwd() 动态拼接。

### Hydration 问题防范

1. 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。**必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染**；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。
2. **禁止使用 head 标签**，优先使用 metadata，详见文档：https://nextjs.org/docs/app/api-reference/functions/generate-metadata
   1. 三方 CSS、字体等资源可在 `globals.css` 中顶部通过 `@import` 引入或使用 next/font
   2. preload, preconnect, dns-prefetch 通过 ReactDOM 的 preload、preconnect、dns-prefetch 方法引入
   3. json-ld 可阅读 https://nextjs.org/docs/app/guides/json-ld

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**

## API 路由

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/register` | POST | 报名提交（name, phone, role, occupation） |
| `/api/sponsor/register` | POST | 赞助商报名（company, contact, phone, wechat） |
| `/api/settings` | GET | 获取站点设置（公开） |
| `/api/settings` | PUT | 更新站点设置（需 password） |
| `/api/admin/verify` | POST | 管理员密码验证（password） |
| `/api/admin/list` | POST | 获取报名列表（password） |
| `/api/admin/download` | POST | 下载报名数据 Word（password） |
| `/api/admin/clear` | POST | 清除所有报名数据（password） |
| `/api/admin/sponsors` | POST | 获取赞助商列表 / 下载赞助商 Word（password, action） |

## 数据库

### registrations
- 字段：`id`(serial PK), `name`(varchar50), `phone`(varchar11), `role`(varchar20), `occupation`(varchar30), `created_at`(timestamptz)
- 索引：`registrations_created_at_idx`, `registrations_role_idx`

### sponsors
- 字段：`id`(serial PK), `company_name`(varchar200), `contact_name`(varchar50), `phone`(varchar11), `wechat`(varchar50), `created_at`(timestamptz)
- 索引：`sponsors_created_at_idx`

### site_settings
- 字段：`key`(varchar50 PK), `value`(text)
- 存储：联合主办方等可动态编辑的站点信息

- RLS：所有表均启用，后端使用 service_role_key 绕过 RLS
- Schema 定义：`src/storage/database/shared/schema.ts`
- 客户端：`src/storage/database/supabase-client.ts`

## 管理员密码

`Nowey2024.9`

## 设计规范

详见 `DESIGN.md`：
- 深色主题（`#0a0f14` 背景）
- 翠绿主色（`#10b981`）+ 暖金高亮（`#f59e0b`）
- 字体：Noto Sans SC
- 动画：淡入上移、缩放弹入、翠绿微光聚焦效果
- 禁止使用蓝色渐变、花哨动画
