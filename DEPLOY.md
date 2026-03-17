# xbsan.com Deployment Checklist

这个文档只负责：

- `xbsan.com`
- `www.xbsan.com`

它们对应的永久入口站部署。

不涉及：

- `xben3.com` 主站 UI
- `xbssss.com` / `xbensan.com` 镜像业务逻辑
- XB3 主工程数据库或 API

---

## 目标

让 `xbsan.com` 成为独立、纯静态、长期稳定的永久入口。

要求：

1. 不依赖 `XB3-platform`
2. 不依赖数据库
3. 不依赖 Vercel 主站部署
4. 只通过 `addresses.json` 切换当前推荐入口
5. 所有公网访问经过 Cloudflare

---

## 当前源码目录

入口站源码固定在：

- `/Users/dianhua/Documents/New project/apps/entry-site`

核心文件：

- `/Users/dianhua/Documents/New project/apps/entry-site/index.html`
- `/Users/dianhua/Documents/New project/apps/entry-site/styles.css`
- `/Users/dianhua/Documents/New project/apps/entry-site/addresses.json`

---

## 推荐部署方式

优先：

- Cloudflare Pages

原因：

1. 与 Cloudflare DNS 在同一平台
2. 入口站是纯静态，非常适合 Pages
3. 不占用 `xben3.com` 的 Vercel 主站流程
4. 将来切换域名和代理更顺

---

## 上线步骤

### Step 1. 建一个独立 GitHub 仓库

建议仓库名：

- `xbsan-entry-site`

仓库里只放 `entry-site` 的内容，不要把整个 `New project` 推上去。

建议目录内容就是：

- `index.html`
- `styles.css`
- `addresses.json`
- `README.md`
- `DEPLOY.md`

---

### Step 2. 推送入口站源码

在终端里：

```bash
cd "/Users/dianhua/Documents/New project/apps/entry-site"
git init
git branch -M main
git add .
git commit -m "chore(entry): initial xbsan static entry site"
git remote add origin <你的 xbsan-entry-site 仓库地址>
git push -u origin main
```

---

### Step 3. 在 Cloudflare Pages 创建项目

路径：

1. Cloudflare Dashboard
2. `Workers & Pages`
3. `Create application`
4. `Pages`
5. `Connect to Git`
6. 选择 `xbsan-entry-site`

构建设置：

- Framework preset: `None`
- Build command: 留空
- Build output directory: `/`
- Root directory: 留空

入口站是纯静态，不需要 Node 构建。

---

### Step 4. 先用 Pages 默认域名验收

Cloudflare Pages 会给你一个类似：

- `https://<project>.pages.dev`

先检查：

1. 首页能打开
2. 主按钮指向 `https://www.xben3.com`
3. 页面里能显示两个镜像域名
4. 更新 `addresses.json` 后页面会反映变化

---

### Step 5. 绑定自定义域名

在 Pages 项目里添加：

- `xbsan.com`
- `www.xbsan.com`

如果 `xbsan.com` 已经托管在 Cloudflare，这一步会最顺。

---

### Step 6. 验证 DNS 和代理

要求：

1. `xbsan.com` 可打开
2. `www.xbsan.com` 可打开
3. 两者都应经过 Cloudflare
4. 不要把 `xbsan.com` 指到 XB3 主站 Vercel 项目

---

## 入口切换方式

只改这个文件：

- `/Users/dianhua/Documents/New project/apps/entry-site/addresses.json`

主要字段：

- `primary`
- `mirrors`
- `routingPolicy.fallbackOrder`

例如主站异常时：

1. 把 `primary.url` 改成某个镜像
2. 更新时间 `updatedAt`
3. 提交并发布入口站

---

## 回归检查

每次入口站更新后，至少检查：

1. `xbsan.com` 是否可达
2. `www.xbsan.com` 是否可达
3. 主站按钮是否正确指向 `xben3.com`
4. 备用地址是否正确显示
5. 页面是否仍然为纯静态，无登录/无 API 依赖

---

## 明确禁止

1. 不要把 `xbsan.com` 接到 `XB3-platform` 的 Next.js 工程
2. 不要让入口站接数据库
3. 不要把后台入口挂到 `xbsan.com`
4. 不要让入口站依赖主站 API 返回当前地址
5. 不要把入口站和主站放到同一个部署故障域

---

## 后续扩展

后面如果新增镜像域名，只做三件事：

1. 在 Cloudflare 接入新域名
2. 在镜像部署平台绑定新域名
3. 更新 `addresses.json`

不要改入口页结构，不要把域名常量硬编码到多个地方。
