# 养生馆经营跟进系统 - 桌面版

本地运行的养生馆经营管理软件，数据存储在本地电脑，不上传任何服务器。

## 前置条件

- 安装 Node.js 18+：[https://nodejs.org](https://nodejs.org) 下载 LTS 版本安装即可

## 安装使用

### 方式一：命令行启动（所有平台通用）

```bash
# 1. 下载并解压 wellness-desktop-v1.0.0.zip
# 2. 进入项目目录
cd wellness-desktop

# 3. 安装依赖（首次需要，约 2-3 分钟）
npm install

# 4. 启动（会自动打开浏览器）
npm start
```

### 方式二：Windows 双击启动

解压后，直接双击文件夹里的 **`start.bat`** 即可启动。

## 系统功能

- 经营驾驶舱 - 数据汇总看板
- 客户管理 - 客户档案增删改查
- 到店服务 - 服务记录管理
- 成交收款 - 收款记录管理
- 疗程卡管理 - 疗程卡查询管理
- 回访任务 - 客户回访任务
- 项目价格 - 服务项目定价
- AI 经营助手 - 智能数据分析
- Excel 导入 - 批量导入客户数据

## 数据安全

- 所有数据存储在本地 SQLite 数据库（`~/.wellness/data.db`）
- 不上传任何数据到外部服务器
- 支持数据备份：直接复制 data.db 文件即可

## 技术栈

- 后端：Express + better-sqlite3
- 前端：React + TypeScript + Tailwind CSS
- 构建：Vite

## 开发构建

```bash
npm install
npm run build    # 构建前端
npm start        # 启动系统
```

## 开源协议

MIT
