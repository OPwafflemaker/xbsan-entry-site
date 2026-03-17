# entry-site

`entry-site` 是 `xbsan.com` 的静态入口页骨架。

目标：

- 作为 XB3 的永久入口
- 只展示当前主站与备用镜像地址
- 保持纯静态，不依赖数据库、Node 服务或 Vercel 主工程

## 文件说明

- `index.html`: 入口页主页面
- `styles.css`: 纯静态样式
- `addresses.json`: 当前主站与备用地址配置
- `DEPLOY.md`: `xbsan.com` 的独立部署清单

## 配置结构

`addresses.json` 现在包含：

- `entry`: 永久入口本身
- `primary`: 当前推荐主站
- `mirrors`: 备用镜像列表
- `routingPolicy`: 默认跳转与备用顺序

## 当前地址策略

- 主站: `https://www.xben3.com`
- 备用 1: `https://www.xbssss.com`
- 备用 2: `https://www.xbensan.com`

## 运维原则

1. 对外优先传播 `xbsan.com`
2. 主站可用时，入口页推荐 `xben3.com`
3. 主站异常时，只更新 `addresses.json`
4. 入口页不要接数据库、鉴权、内部管理功能

## 本地预览

最简单的方式是在当前目录起一个静态文件服务，例如：

```bash
cd "/Users/dianhua/Documents/New project/apps/entry-site"
python3 -m http.server 4321
```

然后打开：

`http://127.0.0.1:4321`
