import { describe, it, expect, beforeEach } from 'vitest'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'
import { parseBookmarkHtml } from '@/utils/bookmarkImportExport.js'

describe('书签导入', () => {
  let store

  beforeEach(() => {
    store = useBookmarkStore()
    store.resetStore()
    store.initData()
  })

  describe('JSON 导入格式校验', () => {
    it('可以导入正确格式的 JSON 书签', () => {
      const jsonData = {
        version: '1.0',
        bookmarks: [
          { title: 'JSON 测试1', url: 'https://test1.com', tags: ['测试1'], description: 'JSON 导入测试1' },
          { title: 'JSON 测试2', url: 'https://test2.com', tags: ['测试2', 'demo'] }
        ]
      }

      const initialCount = store.bookmarks.value.length
      store.importBookmarks(jsonData.bookmarks)

      expect(store.bookmarks.value.length).toBe(initialCount + 2)

      const imported1 = store.bookmarks.value.find(b => b.title === 'JSON 测试1')
      expect(imported1).toBeTruthy()
      expect(imported1.url).toBe('https://test1.com')
      expect(imported1.tags).toEqual(['测试1'])
      expect(imported1.description).toBe('JSON 导入测试1')

      const imported2 = store.bookmarks.value.find(b => b.title === 'JSON 测试2')
      expect(imported2).toBeTruthy()
      expect(imported2.url).toBe('https://test2.com')
      expect(imported2.tags).toEqual(['测试2', 'demo'])
      expect(imported2.description).toBe('')
    })

    it('导入时没有 title 会用 url 替代', () => {
      const jsonData = {
        bookmarks: [
          { url: 'https://no-title.com', tags: [] }
        ]
      }

      store.importBookmarks(jsonData.bookmarks)

      const imported = store.bookmarks.value.find(b => b.url === 'https://no-title.com')
      expect(imported.title).toBe('https://no-title.com')
    })

    it('导入时没有 tags 会默认为空数组', () => {
      const jsonData = {
        bookmarks: [
          { title: '无标签', url: 'https://no-tags.com' }
        ]
      }

      store.importBookmarks(jsonData.bookmarks)

      const imported = store.bookmarks.value.find(b => b.url === 'https://no-tags.com')
      expect(imported.tags).toEqual([])
    })

    it('导入的书签会放到当前选中的文件夹', () => {
      const testFolder = store.addFolder('测试文件夹', null)
      store.setCurrentFolder(testFolder.id)

      const jsonData = {
        bookmarks: [
          { title: '测试', url: 'https://test.com', tags: [] }
        ]
      }

      store.importBookmarks(jsonData.bookmarks)

      const imported = store.bookmarks.value.find(b => b.url === 'https://test.com')
      expect(imported.folderId).toBe(testFolder.id)
    })
  })

  describe('HTML 书签文件解析', () => {
    it('可以解析基本的 Netscape 书签格式', () => {
      const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><A HREF="https://example.com" TAGS="tag1,tag2">Example Site</A>
    <DT><A HREF="https://google.com">Google</A>
    <DD>搜索引擎
</DL><p>`

      const bookmarks = parseBookmarkHtml(html)

      expect(bookmarks.length).toBe(2)
      expect(bookmarks[0].title).toBe('Example Site')
      expect(bookmarks[0].url).toBe('https://example.com')
      expect(bookmarks[0].tags).toEqual(['tag1', 'tag2'])
      expect(bookmarks[0].description).toBe('')

      expect(bookmarks[1].title).toBe('Google')
      expect(bookmarks[1].url).toBe('https://google.com')
      expect(bookmarks[1].tags).toEqual([])
      expect(bookmarks[1].description).toBe('搜索引擎')
    })

    it('可以解析嵌套文件夹结构（DL 作为 DT 兄弟元素的标准格式）', () => {
      const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><H3>前端开发</H3>
    <DL><p>
        <DT><A HREF="https://vuejs.org" TAGS="框架">Vue.js</A>
        <DT><H3>Vue 生态</H3>
        <DL><p>
            <DT><A HREF="https://router.vuejs.org">Vue Router</A>
            <DD>Vue 官方路由
            <DT><A HREF="https://pinia.vuejs.org">Pinia</A>
        </DL><p>
    </DL><p>
    <DT><H3>工具网站</H3>
    <DL><p>
        <DT><A HREF="https://github.com" TAGS="工具,开发">GitHub</A>
    </DL><p>
    <DT><A HREF="https://example.com">根目录书签</A>
</DL><p>`

      const bookmarks = parseBookmarkHtml(html)

      expect(bookmarks.length).toBe(5)

      const vue = bookmarks.find(b => b.url === 'https://vuejs.org')
      expect(vue.folderPath).toEqual(['前端开发'])

      const router = bookmarks.find(b => b.url === 'https://router.vuejs.org')
      expect(router.folderPath).toEqual(['前端开发', 'Vue 生态'])
      expect(router.description).toBe('Vue 官方路由')

      const pinia = bookmarks.find(b => b.url === 'https://pinia.vuejs.org')
      expect(pinia.folderPath).toEqual(['前端开发', 'Vue 生态'])

      const github = bookmarks.find(b => b.url === 'https://github.com')
      expect(github.folderPath).toEqual(['工具网站'])
      expect(github.tags).toEqual(['工具', '开发'])

      const rootBookmark = bookmarks.find(b => b.url === 'https://example.com')
      expect(rootBookmark.folderPath).toEqual([])
    })

    it('可以解析 TAGS 属性为空的情况', () => {
      const html = `<DL><p>
    <DT><A HREF="https://test.com" TAGS="">无标签</A>
</DL><p>`

      const bookmarks = parseBookmarkHtml(html)
      expect(bookmarks[0].tags).toEqual([])
    })

    it('可以解析没有 TAGS 属性的书签', () => {
      const html = `<DL><p>
    <DT><A HREF="https://test.com">无标签属性</A>
</DL><p>`

      const bookmarks = parseBookmarkHtml(html)
      expect(bookmarks[0].tags).toEqual([])
    })

    it('DD 描述支持中文和特殊字符', () => {
      const html = `<DL><p>
    <DT><A HREF="https://test.com">测试</A>
    <DD>这是一段中文描述，包含 特殊字符!@#$%^&*() 以及数字 123456
</DL><p>`

      const bookmarks = parseBookmarkHtml(html)
      expect(bookmarks[0].description).toBe('这是一段中文描述，包含 特殊字符!@#$%^&*() 以及数字 123456')
    })

    it('空的 HTML 返回空数组', () => {
      const bookmarks = parseBookmarkHtml('')
      expect(bookmarks).toEqual([])
    })

    it('没有 DL 元素的 HTML 返回空数组', () => {
      const html = '<html><body>没有书签</body></html>'
      const bookmarks = parseBookmarkHtml(html)
      expect(bookmarks).toEqual([])
    })
  })

  describe('嵌套文件夹结构还原', () => {
    it('导入时会自动创建嵌套的文件夹结构', () => {
      const parsedBookmarks = [
        { title: '深层书签', url: 'https://deep.com', tags: [], folderPath: ['工作', '项目A', '文档'] },
        { title: '中层书签', url: 'https://mid.com', tags: [], folderPath: ['工作', '项目B'] },
        { title: '根书签', url: 'https://root.com', tags: [], folderPath: [] },
        { title: '同层另一个', url: 'https://deep2.com', tags: [], folderPath: ['工作', '项目A', '文档'] }
      ]

      const initialFolderCount = store.folders.value.length
      const initialBookmarkCount = store.bookmarks.value.length

      store.importBookmarksWithFolders(parsedBookmarks)

      expect(store.folders.value.length).toBe(initialFolderCount + 4)

      const workFolder = store.folders.value.find(f => f.name === '工作' && f.parentId === null)
      expect(workFolder).toBeTruthy()

      const projectA = store.folders.value.find(f => f.name === '项目A' && f.parentId === workFolder.id)
      const projectB = store.folders.value.find(f => f.name === '项目B' && f.parentId === workFolder.id)
      expect(projectA).toBeTruthy()
      expect(projectB).toBeTruthy()

      const docs = store.folders.value.find(f => f.name === '文档' && f.parentId === projectA.id)
      expect(docs).toBeTruthy()

      expect(store.bookmarks.value.length).toBe(initialBookmarkCount + 4)

      const deepBookmark = store.bookmarks.value.find(b => b.url === 'https://deep.com')
      expect(deepBookmark.folderId).toBe(docs.id)

      const midBookmark = store.bookmarks.value.find(b => b.url === 'https://mid.com')
      expect(midBookmark.folderId).toBe(projectB.id)

      const defaultFolder = store.folders.value.find(f => f.name === '未分类')
      const rootBookmark = store.bookmarks.value.find(b => b.url === 'https://root.com')
      expect(rootBookmark.folderId).toBe(defaultFolder.id)

      const deep2 = store.bookmarks.value.find(b => b.url === 'https://deep2.com')
      expect(deep2.folderId).toBe(docs.id)
    })

    it('已存在的同名同层级文件夹不会重复创建', () => {
      store.addFolder('已存在', null)

      const parsedBookmarks = [
        { title: '测试', url: 'https://test.com', tags: [], folderPath: ['已存在'] }
      ]

      const initialFolderCount = store.folders.value.length
      store.importBookmarksWithFolders(parsedBookmarks)

      expect(store.folders.value.length).toBe(initialFolderCount)

      const existing = store.folders.value.filter(f => f.name === '已存在')
      expect(existing.length).toBe(1)
    })

    it('混合导入有文件夹和无文件夹的书签', () => {
      const defaultFolder = store.folders.value.find(f => f.name === '未分类')
      const workFolder = store.addFolder('工作', null)

      const parsedBookmarks = [
        { title: '有文件夹', url: 'https://with-folder.com', tags: [], folderPath: ['工作'] },
        { title: '无文件夹1', url: 'https://no-folder1.com', tags: [], folderPath: null },
        { title: '无文件夹2', url: 'https://no-folder2.com', tags: [], folderPath: [] }
      ]

      store.importBookmarksWithFolders(parsedBookmarks)

      const withFolder = store.bookmarks.value.find(b => b.url === 'https://with-folder.com')
      expect(withFolder.folderId).toBe(workFolder.id)

      const noFolder1 = store.bookmarks.value.find(b => b.url === 'https://no-folder1.com')
      expect(noFolder1.folderId).toBe(defaultFolder.id)

      const noFolder2 = store.bookmarks.value.find(b => b.url === 'https://no-folder2.com')
      expect(noFolder2.folderId).toBe(defaultFolder.id)
    })
  })
})
