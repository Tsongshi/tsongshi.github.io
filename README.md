# tsongshi.github.io

Simon 的个人站，静态 HTML，GitHub Pages 托管。上线地址 https://tsongshi.github.io/

## 两层结构

| 层级 | 路径 | 谁能看 | 索引 |
|---|---|---|---|
| 公开 | `/`、`/*.html` | 任何人 | `works.json`，首页自动渲染 |
| 密码层（工作台） | `/private/*.html` | 有链接+密码的人 | 手动维护 `private-src/index.html` |

**密码层入口是隐藏的**：公开首页页脚是「Tsongshi · 2026」，中间那个 `·` 就是入口链接
（`index.html` 里 `.foot .sep`）。做成标点是为了让只看公开层的人看不出还有隐藏内容；
用负 margin 撑出约 40×40 的点击区，手机也点得到。

> ⚠️ 这只是**视觉隐藏**，不是安全措施。本仓库是 public，任何人都能在 GitHub 上直接浏览
> `private/` 目录、下载加密文件离线爆破。真正的隔离要等服务器登录墙（备案后）。
> 所以红线不变：**工作/客户相关内容不进本仓库任何一层。**

## 公开主题与返回导航（fresh-theme.css + nav.js）

公开页面统一加载 `/fresh-theme.css`：雾薄荷底色、暖白表面、深绿灰正文，以及
鼠尾草绿 / 柔和天蓝点缀。该样式只用于公开层；Legacy `private/` 与
`private-src/` 不加载它。

各页左上角的悬浮「← 首页 / ← 工作台」按钮由 `/nav.js` 统一注入。

**为什么保留注入脚本**：`fakao-session.html`、`fakao-knowledge-map.html` 是构建产物
（`Session/build.py`、`知识图谱/build.mjs` 生成）。它们的权威模板已同步浅色主题与
Canvas 配色；本脚本仍作为新增页面或旧构建产物的幂等补漏工具。

行为：
- `/xxx.html` → 「← 首页」回公开首页
- `/private/xxx.html` → 「← 工作台」回密码层首页
- 两个首页本身不显示（它们有自己的导航）
- 普通滚动页会自动给 body 加 44px 顶部内边距，避免按钮压住标题；
  全屏应用页（3D 图谱这类，高度锁一屏）不加，防止挤坏布局
- 密码层页面解密后整个 document 会被 StatiCrypt 重写，`MutationObserver` 会把按钮补挂回来

### 新增页面 / 重新构建后要做的事

```bash
python3 tools/inject_nav.py       # 幂等，重复跑无害
```

它会给默认公开页补上 `/fresh-theme.css`，并在页面末尾补上
`<script src="/nav.js" defer></script>`。Legacy private-src 不在默认处理范围；如确需
维护，必须显式传入精确文件。权威模板已有这些引用时，本脚本会直接跳过。

## 发布

**公开内容**：文件放对位置 → `works.json` 加一条 → commit + push。

**密码层内容**：
1. 明文原稿放 `private-src/`（已 gitignore，不进仓库）
2. `private-src/index.html` 的清单里加一条
3. 加密：
   ```bash
   npx --yes staticrypt private-src/*.html -p "<密码>" -d private --short
   ```
   （改了任何一页都要整个目录重新加密，因为索引页也变了）
4. 提交 `private/` 下的加密产物

密码见 `Projects/Personal Website/分享记录.md`。

## 不能删的文件

| 文件 | 删了会怎样 |
|---|---|
| `.nojekyll` | 加密内容可能含 `{{`，被 Jekyll 误判为模板语法，构建直接失败 |
| `.staticrypt.json` | 里面是 salt，删了所有已解锁设备的「记住我」全部失效 |

## 备案通过后

域名切到 `tsongshi.cn`（走腾讯云服务器，**不要** CNAME 到 GitHub Pages——
解决不了微信外链拦截，还可能因「备案信息与实际接入不符」被注销备案）。
细节见 `Projects/Personal Website/备案实操SOP-20260724-V1.md`。

切换前提醒 Simon：各练习页的进度存在 localStorage，**按域名隔离**，
换域名前要用页面底部的「导出进度」带走。
