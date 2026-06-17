import { describe, it, expect, beforeEach } from 'vitest'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'

describe('搜索功能', () => {
  let store
  let defaultFolder

  beforeEach(() => {
    store = useBookmarkStore()
    store.resetStore()
    store.initData()
    defaultFolder = store.folders.value.find(f => f.name === '未分类')

    store.bookmarks.value = []
    store.addBookmark({
      title: 'Vue.js 官方文档',
      url: 'https://vuejs.org',
      description: '渐进式 JavaScript 框架，用于构建用户界面',
      tags: ['前端', '框架', 'Vue']
    })
    store.addBookmark({
      title: 'GitHub 代码托管',
      url: 'https://github.com',
      description: '全球最大的代码托管平台和开发者社区',
      tags: ['开发', '工具', 'Git']
    })
    store.addBookmark({
      title: 'MDN Web 开发文档',
      url: 'https://developer.mozilla.org',
      description: 'Mozilla 官方 Web 开发技术文档',
      tags: ['前端', '文档', 'MDN']
    })
    store.addBookmark({
      title: 'React 官方网站',
      url: 'https://react.dev',
      description: '用于构建用户界面的 JavaScript 库',
      tags: ['前端', '框架', 'React']
    })
    store.addBookmark({
      title: 'Node.js 官网',
      url: 'https://nodejs.org',
      description: '基于 Chrome V8 引擎的 JavaScript 运行时',
      tags: ['后端', 'JavaScript', 'Node']
    })
    store.setCurrentFolder(defaultFolder.id)
    store.setSearchQuery('')
    store.clearActiveTags()
  })

  describe('多字段匹配', () => {
    it('可以通过标题搜索', () => {
      store.setSearchQuery('Vue')
      const results = store.filteredBookmarks.value
      expect(results.length).toBe(1)
      expect(results[0].title).toContain('Vue')
    })

    it('可以通过 URL 搜索', () => {
      store.setSearchQuery('github')
      const results = store.filteredBookmarks.value
      expect(results.length).toBe(1)
      expect(results[0].url).toContain('github')
    })

    it('可以通过标签搜索', () => {
      store.setSearchQuery('文档')
      const results = store.filteredBookmarks.value
      expect(results.length).toBe(2)
      const titles = results.map(b => b.title)
      expect(titles).toContain('MDN Web 开发文档')
      expect(titles).toContain('Vue.js 官方文档')
    })

    it('可以通过描述搜索', () => {
      store.setSearchQuery('JavaScript')
      const results = store.filteredBookmarks.value
      expect(results.length).toBe(3)
      const titles = results.map(b => b.title)
      expect(titles).toContain('Vue.js 官方文档')
      expect(titles).toContain('React 官方网站')
      expect(titles).toContain('Node.js 官网')
    })

    it('描述中的关键词会被搜到', () => {
      store.setSearchQuery('运行时')
      const results = store.filteredBookmarks.value
      expect(results.length).toBe(1)
      expect(results[0].title).toBe('Node.js 官网')
    })

    it('搜索不区分大小写', () => {
      store.setSearchQuery('GIT')
      const results1 = store.filteredBookmarks.value
      expect(results1.length).toBe(1)
      expect(results1[0].title).toBe('GitHub 代码托管')

      store.setSearchQuery('git')
      const results2 = store.filteredBookmarks.value
      expect(results2.length).toBe(1)
    })

    it('搜索标题部分匹配', () => {
      store.setSearchQuery('官')
      const results = store.filteredBookmarks.value
      expect(results.length).toBe(4)
      const titles = results.map(b => b.title)
      expect(titles).toContain('Vue.js 官方文档')
      expect(titles).toContain('MDN Web 开发文档')
      expect(titles).toContain('React 官方网站')
      expect(titles).toContain('Node.js 官网')
    })
  })

  describe('搜索结果筛选正确', () => {
    it('空搜索返回所有书签', () => {
      store.setSearchQuery('')
      const results = store.filteredBookmarks.value
      expect(results.length).toBe(5)
    })

    it('搜索无结果时返回空数组', () => {
      store.setSearchQuery('不存在的关键词')
      const results = store.filteredBookmarks.value
      expect(results.length).toBe(0)
    })

    it('搜索后切换文件夹，结果正确', () => {
      const testFolder = store.addFolder('测试文件夹', null)
      store.addBookmark({
        title: '测试书签',
        url: 'https://test.com',
        description: '测试描述',
        tags: ['测试'],
        folderId: testFolder.id
      })

      store.setCurrentFolder(defaultFolder.id)
      store.setSearchQuery('Vue')
      expect(store.filteredBookmarks.value.length).toBe(1)

      store.setCurrentFolder(testFolder.id)
      store.setSearchQuery('测试')
      expect(store.filteredBookmarks.value.length).toBe(1)
      expect(store.filteredBookmarks.value[0].title).toBe('测试书签')
    })

    it('搜索和标签筛选可以同时生效', () => {
      store.toggleActiveTag('前端')
      store.setSearchQuery('框架')

      const results = store.filteredBookmarks.value
      expect(results.length).toBe(2)
      const titles = results.map(b => b.title)
      expect(titles).toContain('Vue.js 官方文档')
      expect(titles).toContain('React 官方网站')
    })

    it('多关键词搜索（标签匹配多个字段', () => {
      store.setSearchQuery('Mozilla')
      const results = store.filteredBookmarks.value
      expect(results.length).toBe(1)
      expect(results[0].title).toBe('MDN Web 开发文档')
      expect(results[0].description).toContain('Mozilla')
    })
  })

  describe('标签筛选和搜索的组合', () => {
    it('同时筛选标签后搜索只会在当前标签下搜索', () => {
      store.toggleActiveTag('前端')
      let results = store.filteredBookmarks.value
      expect(results.length).toBe(3)

      store.setSearchQuery('框架')
      results = store.filteredBookmarks.value
      expect(results.length).toBe(2)
      expect(results.every(b => b.tags.includes('前端'))).toBe(true)
    })

    it('清除搜索后恢复标签筛选结果', () => {
      store.toggleActiveTag('前端')
      store.setSearchQuery('Vue')
      expect(store.filteredBookmarks.value.length).toBe(1)

      store.setSearchQuery('')
      expect(store.filteredBookmarks.value.length).toBe(3)
    })

    it('多标签筛选加搜索', () => {
      store.toggleActiveTag('前端')
      store.toggleActiveTag('框架')

      store.setSearchQuery('库')
      const results = store.filteredBookmarks.value
      expect(results.length).toBe(1)
      expect(results[0].title).toBe('React 官方网站')
    })

    it('清除标签筛选后搜索范围扩大', () => {
      store.toggleActiveTag('后端')
      store.setSearchQuery('JavaScript')
      expect(store.filteredBookmarks.value.length).toBe(1)

      store.clearActiveTags()
      expect(store.filteredBookmarks.value.length).toBe(3)
    })
  })

  describe('搜索后结果排序', () => {
    it('搜索结果按创建时间倒序排列', () => {
      store.setSearchQuery('')
      const results = store.filteredBookmarks.value
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].createdAt).toBeGreaterThanOrEqual(results[i + 1].createdAt)
      }
    })
  })
})
