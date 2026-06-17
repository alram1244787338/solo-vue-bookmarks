# 书签管理器 (Bookmark Manager)

一个基于 Vue 3 + Vite 构建的现代化书签管理工具，支持文件夹嵌套、多标签筛选、全文搜索、书签导入导出等功能。

---

## 项目介绍

本工具是一个纯前端的书签管理器，数据保存在浏览器 localStorage 中，无需后端即可运行。

### 核心功能

- **文件夹嵌套管理**：侧边栏树形结构，支持无限层级嵌套文件夹，可展开/折叠，支持新建、重命名、删除
- **书签卡片展示**：响应式网格布局，展示标题、URL、网站 Favicon、描述和标签
- **多标签系统**：每个书签可打多个标签，支持按标签组合筛选
- **全文搜索**：支持标题、URL、描述、标签四个字段的模糊搜索，带防抖优化
- **拖拽移动**：将书签拖拽到任意文件夹即可移动归属
- **数据导入导出**：
  - 导入：JSON 格式文件、浏览器导出的 Netscape Bookmark HTML 文件（自动还原文件夹层级）
  - 导出：JSON 格式、Netscape Bookmark HTML 格式
- **本地持久化**：所有数据自动保存到 localStorage，刷新不丢失

---

## 文件目录结构

```
work/
├── src/
│   ├── components/              # UI 组件
│   │   ├── Sidebar.vue              # 侧边栏（文件夹树容器）
│   │   ├── FolderItem.vue           # 递归文件夹节点组件（新建/重命名/删除/拖拽目标）
│   │   ├── Toolbar.vue              # 顶部工具栏（添加书签、导入/导出）
│   │   ├── SearchBar.vue            # 搜索栏（带 300ms 防抖）
│   │   ├── TagFilter.vue            # 标签筛选器
│   │   ├── BookmarkGrid.vue         # 书签网格布局容器
│   │   ├── BookmarkCard.vue         # 单张书签卡片（可拖拽源）
│   │   └── BookmarkModal.vue        # 添加/编辑书签的弹窗
│   ├── composables/             # 组合式逻辑
│   │   └── useBookmarkStore.js      # 全局状态管理（文件夹、书签、搜索、标签、展开状态）
│   ├── utils/                   # 工具函数
│   │   ├── helpers.js               # 通用工具（ID 生成、域名提取、Favicon URL、防抖）
│   │   ├── storage.js               # localStorage 读写封装
│   │   └── bookmarkImportExport.js  # HTML 书签解析器、文件下载工具
│   ├── styles/                  # 样式
│   │   └── global.css               # 全局样式与 CSS 变量
│   ├── tests/                   # 测试用例
│   │   ├── setup.js                 # Vitest 全局 setup（localStorage mock）
│   │   ├── folders.test.js          # 文件夹树操作测试（13 个用例）
│   │   ├── import.test.js           # 导入功能测试（14 个用例）
│   │   ├── search.test.js           # 搜索功能测试（17 个用例）
│   │   └── drag.test.js             # 拖拽移动测试（11 个用例）
│   ├── App.vue                  # 根组件（布局整合）
│   └── main.js                  # 应用入口
├── index.html                   # HTML 模板
├── package.json                 # 依赖与脚本
└── vite.config.js               # Vite 配置（含 Vitest 测试配置）
```

---

## 数据模型说明

### 1. 文件夹 (Folder)

```js
{
  id: string,        // 唯一 ID（由 generateId() 生成）
  name: string,      // 文件夹名称
  parentId: string | null  // 父文件夹 ID，null 表示根文件夹
}
```

**嵌套关系**：通过 `parentId` 形成树形结构。根文件夹的 `parentId` 为 `null`。获取某个文件夹的子文件夹用 `getFolderChildren(parentId)`。

### 2. 书签 (Bookmark)

```js
{
  id: string,              // 唯一 ID
  title: string,           // 书签标题
  url: string,             // 书签链接
  description: string,     // 书签描述（可选，默认空字符串）
  tags: string[],          // 标签数组，例如 ['前端', 'Vue']
  folderId: string | null, // 所属文件夹 ID
  createdAt: number        // 创建时间戳（毫秒）
}
```

### 3. 状态管理

所有状态集中在 `useBookmarkStore.js` 中，使用 Vue 3 的 `ref` 和 `computed` 管理：

| 状态 | 类型 | 说明 |
|---|---|---|
| `folders` | `Ref<Folder[]>` | 所有文件夹 |
| `bookmarks` | `Ref<Bookmark[]>` | 所有书签 |
| `currentFolderId` | `Ref<string \| null>` | 当前选中的文件夹 |
| `searchQuery` | `Ref<string>` | 搜索关键词 |
| `activeTags` | `Ref<string[]>` | 当前激活的筛选标签 |
| `expandedFolderIds` | `Ref<Set<string>>` | 展开状态的文件夹 ID 集合 |

所有状态自动持久化到 localStorage。

---

## 导入功能说明

### 1. JSON 格式导入

**文件格式**：

```json
{
  "version": "1.0",
  "bookmarks": [
    {
      "title": "书签标题",
      "url": "https://example.com",
      "description": "描述（可选）",
      "tags": ["标签1", "标签2"]
    }
  ]
}
```

**导入逻辑**：
- `title` 缺失时使用 `url` 作为标题
- `description` 缺失时默认为空字符串
- `tags` 缺失时默认为空数组
- 所有书签导入到当前选中的文件夹

### 2. 浏览器 HTML 书签格式（Netscape Bookmark File Format）

这是 Chrome、Firefox、Safari、Edge 等主流浏览器导出书签的标准格式。

**格式示例**：

```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><A HREF="https://root-bookmark.com" TAGS="tag1,tag2">根书签</A>
    <DD>书签描述（可选）

    <DT><H3>文件夹名称</H3>
    <DL><p>
        <DT><A HREF="https://nested.com">嵌套书签</A>
        <DT><H3>子文件夹</H3>
        <DL><p>
            <DT><A HREF="https://deep-nested.com">深层嵌套书签</A>
        </DL><p>
    </DL><p>
</DL><p>
```

**格式关键特征**：
- 根节点是 `<DL>` 元素
- 每个书签用 `<DT><A>...</A>` 表示
  - `HREF` 属性：书签 URL
  - `TAGS` 属性：逗号分隔的标签列表
- 书签的描述用紧跟在 `<DT>` 后的 `<DD>` 元素表示（或嵌套在 `<DT>` 内部）
- 文件夹用 `<DT><H3>文件夹名</H3></DT>` + 其后兄弟节点 `<DL>...</DL>` 表示
  - `<H3>` 内容为文件夹名
  - 后续的 `<DL>` 为该文件夹的内容

**解析逻辑**（`bookmarkImportExport.js`）：
1. 从根 `<DL>` 开始递归遍历
2. 遇到 `<A>` 标签解析为书签（提取 `HREF`、`TAGS`、文本内容为标题）
3. 检查下一个兄弟节点是否为 `<DD>`，是则作为描述
4. 遇到 `<H3>` 标签时，检查其 `<DT>` 内是否有 `<DL>` 子元素，或下一个兄弟节点是否为 `<DL>`，作为子文件夹递归解析
5. 每个书签附带 `folderPath: string[]` 记录所在文件夹路径

**导入逻辑**（`importBookmarksWithFolders()`）：
- 根据 `folderPath` 数组逐层查找/创建文件夹，不存在则自动新建
- 同名同层级文件夹不会重复创建
- 空 `folderPath` 的书签放入当前选中文件夹

---

## 搜索和多字段匹配规则

搜索入口为 `SearchBar.vue` 组件，输入后经 300ms 防抖触发筛选。

### 匹配字段

书签的 **4 个字段**都会被搜索，任一匹配即命中：

| 字段 | 匹配方式 |
|---|---|
| `title` 标题 | 包含匹配 |
| `url` 链接 | 包含匹配 |
| `description` 描述 | 包含匹配（可选字段） |
| `tags` 标签数组 | 任一标签包含匹配 |

### 匹配规则

- **不区分大小写**：搜索 `Vue` 和 `vue` 结果相同
- **部分匹配**：搜索 `官` 可以匹配「官方文档」
- **中文支持**：完全支持中文字符搜索

### 组合筛选

搜索可以与 **文件夹筛选** 和 **标签筛选** 同时生效，三者为 **逻辑与 (AND)** 关系：

```
结果 = 当前文件夹下的书签 ∩ 含有所有激活标签的书签 ∩ 搜索匹配的书签
```

例如：选中「前端开发」文件夹 + 激活标签「Vue」 + 搜索「文档」，结果必须同时满足三个条件。

---

## 测试说明

### 测试框架

- **Vitest**：与 Vite 无缝集成的测试运行器
- **@vue/test-utils**：Vue 组件测试工具库
- **jsdom**：Node.js 端的 DOM 模拟环境

### 运行方式

```bash
# 单次运行所有测试
npm test

# 监听模式（文件变化自动重跑）
npm run test:watch
```

### 测试覆盖

共 **4 个测试文件，55 个测试用例**，全部通过。

| 测试文件 | 用例数 | 覆盖模块 |
|---|---|---|
| `folders.test.js` | 13 | 文件夹增删改查、嵌套、数量统计、删除级联、展开状态 |
| `import.test.js` | 14 | JSON 格式校验、HTML Netscape 格式解析、嵌套文件夹还原 |
| `search.test.js` | 17 | 四字段匹配、大小写不敏感、与标签/文件夹的组合筛选 |
| `drag.test.js` | 11 | 拖拽移动、嵌套目标、批量移动、属性不变性、边界情况 |

### 重点测试场景

**文件夹树**：新建根/子文件夹、多层嵌套数量统计、删除时子文件夹级联删除且书签迁移到其他根文件夹、重命名空字符串保护、展开状态持久化。

**HTML 导入**：DL 作为 DT 兄弟元素的标准 Netscape 格式解析、DD 描述提取、多层嵌套文件夹还原、TAGS 属性解析、同名文件夹去重。

**搜索**：标题/URL/标签/描述四个维度分别验证、与标签筛选的 AND 组合、清除筛选后的恢复。

**拖拽**：跨文件夹移动、属性保留、删除源文件夹不影响已移动书签、不存在的 ID 不抛出错误。

---

## 开发说明

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 运行测试
npm test
```
