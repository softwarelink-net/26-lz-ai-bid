# 泸州市疾病预防控制中心2026年人工智能辅助诊断信息系统运营服务项目

> **上线主域名 Host**：[https://26-lz-ai-bid.softwarelink.net/](https://26-lz-ai-bid.softwarelink.net/)  
> **项目代码仓库 Repo**：[https://github.com/softwarelink-net/26-lz-ai-bid](https://github.com/softwarelink-net/26-lz-ai-bid)

---

## 控制台效果图预览

![控制台预览](docs/assets/dashboard-preview.png)

---

## 部署与运行说明

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Wrangler CLI >= 3.0.0

### 安装依赖

```bash
npm install
```

### 本地运行

```bash
npm run dev
```

前端 Vite 联调（默认端口 5173）。Worker + D1 本地模拟：

```bash
npx wrangler dev
```

建议同时开两个终端：`npm run dev` 负责前端热更新，`npx wrangler dev` 提供 `/api/*` 与本地 D1。Vite 已将 `/api` 代理到 `http://127.0.0.1:8787`。

首次本地 D1 初始化：

```bash
npm run db:migrate
npm run db:seed
```

### 演示账号

- 超级管理员：`admin@lzcdc.cn` / `Admin@2026`
- 疾控质控专家：`expert@lzcdc.cn` / `Expert@2026`
- 临床医生：`doctor@lzcdc.cn` / `Doctor@2026`
- 运维工程师：`ops@lzcdc.cn` / `Ops@2026`

### 生产构建与发布

- 前端构建：`npm run build`
- Worker 部署：`npx wrangler deploy`
- 静态资源/R2 同步：上传至 `allworld-sites/26-lz-ai-bid/`

一键构建 + 部署 Worker + 同步 R2：

```bash
npm run deploy
```

静态产物同步至 R2 桶 `26-lz-ai-bid-assets`，并镜像到共享站点桶 `allworld-sites/26-lz-ai-bid/`，绑定域名 `https://26-lz-ai-bid.softwarelink.net/`。

### 常用脚本一览

| 脚本 | 说明 |
| :--- | :--- |
| `dev` | 启动 Vite 本地开发服务器（端口 5173） |
| `build` | `vue-tsc --noEmit` + 前端生产打包至 `dist/` |
| `preview` | 预览生产构建产物 |
| `lint` | ESLint 风格检查 |
| `db:migrate` | 向本地 D1（Allworld）执行 `migrations/0001_init.sql` |
| `db:seed` | 灌入预置用户、机构、诊断任务、SLA 工单与审计日志 |
| `preview:worker` | 构建后启动 Wrangler 本地 Workers / D1 / R2 仿真 |
| `db:migrate:remote` | 向远程 D1（Allworld）执行建表与种子数据 |
| `deploy` | 构建 + 部署 allworld Worker + 上传 R2 |
| `deploy:r2` | 仅将 `dist/` 同步到 `26-lz-ai-bid-assets` 与 `allworld-sites` |
| `deploy:worker` | 构建并 `wrangler deploy` |

### 目录结构树

```text
26-lz-ai-bid/
├── src/                     # Vue 3 + TypeScript 前端
│   ├── assets/              # 全局样式
│   ├── components/          # TopFixedBanner、DicomViewer、BaseChart
│   ├── layouts/             # AuthLayout & MainLayout
│   ├── router/              # Vue Router 4 与 beforeEach RBAC 守卫
│   ├── stores/              # Pinia（认证 / 布局）
│   ├── composables/         # SEO 注入与 API 客户端
│   ├── types/               # 角色、诊断、工单类型
│   └── views/               # 控制台、诊断工作台、网关、SLA、标讯、设置
├── functions/               # API 处理器（由 Worker 调度）
│   └── api/
│       ├── auth/            # 登录与 JWT
│       ├── dashboard/       # 全市态势聚合
│       ├── diagnostic/      # AI 诊断任务、复核、签署
│       ├── sla/             # 4 小时工单流转
│       ├── gateway/         # PHI 脱敏与传输流水
│       ├── system/          # Feature Flags、用户与机构
│       ├── audit/           # 审计日志
│       └── tender/          # 招标公告结构化数据
├── workers/                 # Cloudflare Worker allworld 入口（主机分流）
├── public/                  # favicon、robots.txt、sitemap.xml
├── docs/                    # 控制台预览图
│   └── assets/dashboard-preview.png
├── migrations/              # Cloudflare D1 建表与种子数据
│   └── 0001_init.sql
├── scripts/
│   └── deploy-allworld.mjs  # dist/ → R2
├── wrangler.toml            # Workers / D1 Allworld / R2 配置
├── vite.config.ts
├── package.json
└── README.md
```

---

## 招标公告全文

### 1. 标题

泸州市疾病预防控制中心2026年人工智能辅助诊断信息系统运营服务项目(二次)招标公告

### 2. 项目发包方

泸州市疾病预防控制中心（代理机构：四川建桥项目管理有限公司）

### 3. 项目编号

N5105012026000255

### 4. 项目发布时间

2026年08月14日

### 5. 关键词

泸州市疾控中心、人工智能辅助诊断、医疗AI运营服务、肺结核AI诊断、四川政府采购、医疗信息化

### 6. 摘要

泸州市疾病预防控制中心对2026年人工智能辅助诊断信息系统运营服务项目(二次)进行公开招标，采购预算为人民币350,000.00元，合同履行期限为自合同签订之日起30日内完成系统上线交付，并包含项目验收合格后第一年的全生命周期运营与运维服务。投标截止时间为2026年09月04日09时30分。

### 7. 技术要点

- 与泸州市远程医疗平台深度对接，安全调阅并解析 DR、CT 等医学影像与诊断数据；
- 深度应用肺结核等重大疾病人工智能辅助筛查算法，提供毫秒级病灶区域检测（ROI）与置信度热力图提示；
- 遵循《中华人民共和国数据安全法》与《医疗纠纷预防和处理条例》，构建端到端 PHI 脱敏和专网级安全隔离机制；
- 提供具备 4 小时内本地/远程快速响应能力的 7×24 小时运维体系及灾备保障。

### 8. 技术创新性

- 构建基于 Cloudflare 全球边缘计算的极简高可用医疗 AI 运营架构，消除传统机房单点故障瓶颈；
- 结合 WebAssembly 前端轻量化 DICOM 渲染与边缘流式推理代理，降低基层医院硬件负载；
- 创新双重交叉验证质控流（AI 预筛 + 基层初筛 + 市疾控中心专家终审复核），提高区域重大传染病早筛早治闭环效率。

---

## 免责声明

1. **数据来源与合规性**：本系统展示的所有招标信息、项目背景及采购需求均来源于公开招投标平台（如中国招标投标公共服务平台、中国建设银行龙集采平台等）。系统仅用于技术方案演示、架构原型验证与演示搭建，不涉及任何商业非法抓取或数据篡改。
2. **技术实现路径**：本系统前端基于 Vue 3 + Tailwind CSS 构建，后端基于 Cloudflare Workers 极简无服务器架构，数据存储采用 Cloudflare D1 关系型数据库，完整符合分布式高可用与银企对接安全标准。
3. **保密承诺**：开发团队严格遵守保密义务，系统内示例数据均经过伪化脱敏处理（Anonymized），不包含真实患者医疗健康信息（PHI）或建行敏感金融交易数据。
4. **知识产权与巧合声明**：本系统中涉及的商标、机构名称（中国建设银行、川北医学院附属医院等）归各自合法持有人所有。演示代码与系统架构若与实际投产系统存在相似之处，纯属技术通用设计之巧合。
5. **免责条款**：本演示系统不具备实际金融扣款功能，不承担因非授权使用、不可抗力或第三方平台接口变更所导致的任何法律责任与经济损失。
