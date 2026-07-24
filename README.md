# tsongshi.github.io

公开展示区（面向朋友分享的小作品），静态 HTML，GitHub Pages 托管。

## 目录约定（两层权限）

| 层级 | 路径 | 说明 |
|---|---|---|
| 公开 | `/`、`/*.html` | 任何人凭链接可看，无密码 |
| 特定人+密码 | `/shared/*.html` | StatiCrypt 加密页，需密码解密查看，链接和密码分开发送 |

（第三层「仅本人」在 `personal-site` 仓库的服务器登录墙里，不在本仓库）

- 不含任何工作/客户相关信息，不含真实姓名以外的身份信息
- `index.html` 为首页，其余作品按主题放子目录，如 `/fakao/xxx.html`

## 发布方式

**公开内容**：在 Cowork 里说"发布这个 HTML 到公开展示区"，直接提交到仓库对应路径并推送，几十秒内 https://tsongshi.github.io/ 生效。

**特定人+密码内容**：说"发布到 shared，密码设成 XXX"。流程：
1. 原始 HTML 写入 `shared-src/`（本地 gitignore，不进仓库，避免明文进 git 历史）
2. 用 [StatiCrypt](https://github.com/robinmoisson/staticrypt) 加密：
   ```
   npx --yes staticrypt shared-src/文件名.html -p "密码" -d shared --short
   ```
3. 提交 `shared/文件名.html`（加密产物）并推送
4. 链接和密码分开发给对方（如：链接微信发，密码口头说），不要在同一条消息里

演示页：`shared/demo.html`，密码 `demo1234`，可作为模板参考。

## .nojekyll 说明

仓库根目录的 `.nojekyll` 文件禁用了 GitHub Pages 默认的 Jekyll 预处理——加密页面内容可能偶然包含 `{{` 等字符，会被 Jekyll 误判为模板语法导致构建失败。这个文件不要删。

## 备案通过后

`tsongshi.cn` 域名可通过 CNAME 指向本 Pages 站点（或迁移到腾讯云对象存储静态托管，二选一，见项目 `技术方案-V1.md`）。
