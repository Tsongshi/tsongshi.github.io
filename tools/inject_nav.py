#!/usr/bin/env python3
"""给站点各页注入 <script src="/nav.js" defer></script>（返回导航）。

为什么需要这个脚本：
    fakao-session.html / fakao-knowledge-map.html 是构建产物（Session/build.py、
    知识图谱/build.mjs 生成），每次重新构建都会覆盖。所以约定：
    **每次重新构建或新增页面后，跑一次本脚本再提交。**

    长期更省事的做法是让各构建模板自己带上这一行（见 README 里给模板维护者的说明），
    模板带了之后本脚本对那些页面就变成空操作，留着也无害。

幂等：已注入过的文件会跳过，可以随便重复跑。

用法：
    python3 tools/inject_nav.py            # 处理默认页面
    python3 tools/inject_nav.py a.html b.html   # 只处理指定文件
"""

import sys
from pathlib import Path

TAG = '<script src="/nav.js" defer></script>'
ROOT = Path(__file__).resolve().parent.parent

# 公开层需要导航的页面（首页自己有页脚导航，不在此列）
DEFAULT_TARGETS = [
    "child-learning-map.html",
    "fakao-knowledge-map.html",
    "fakao-session.html",
]

# 密码层：注入到明文源，注入后需要重新跑 staticrypt 才会进加密产物
PRIVATE_SRC_TARGETS = [
    "private-src/ai-chat.html",
    "private-src/career-panel.html",
    "private-src/weike-checklist.html",
]


def inject(path: Path) -> str:
    if not path.exists():
        return "缺失"
    text = path.read_text(encoding="utf-8")
    if TAG in text:
        return "已有，跳过"
    idx = text.rfind("</body>")
    if idx == -1:
        return "⚠ 没有 </body>，跳过"
    path.write_text(text[:idx] + "  " + TAG + "\n" + text[idx:], encoding="utf-8")
    return "已注入"


def main() -> int:
    args = sys.argv[1:]
    targets = args if args else (DEFAULT_TARGETS + PRIVATE_SRC_TARGETS)

    worst = 0
    for rel in targets:
        p = (ROOT / rel) if not Path(rel).is_absolute() else Path(rel)
        result = inject(p)
        print(f"  {result:12} {rel}")
        if result.startswith("⚠") or result == "缺失":
            worst = 1

    if not args:
        print("\n提醒：密码层的明文源改动后，要重新加密才会生效：")
        print('  npx --yes staticrypt private-src/*.html -p "<密码>" -d private --short')
    return worst


if __name__ == "__main__":
    raise SystemExit(main())
