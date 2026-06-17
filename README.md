# 养生馆经营跟进系统 - 桌面版

本地 SQLite 数据库，数据不离开电脑。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 构建前端

```bash
npm run build
```

### 3. 启动

```bash
npm start
```

> 会自动启动后端服务器 (localhost:3001) + Electron 桌面窗口

## 功能

- 驾驶舱：今日KPI、待回访、疗程卡预警
- 客户管理：搜索、详情、分类标签
- 到店服务：记录、筛选
- 成交收款：双业务线（养生馆/中医馆）
- 疗程卡：状态、到期预警、进度条
- 回访任务：话术建议、完成标记
- 项目价格：单次/套餐/活动价
- AI话术：回访/朋友圈/抖音/套餐升级
- Excel导入：兼容《6月份报表.xlsx》

## 技术栈

- 前端：React 18 + Tailwind CSS + Lucide 图标
- 后端：Express + better-sqlite3
- 桌面：Electron 31
- 数据：SQLite（本地文件，路径 `~/.wellness/data.db`）
