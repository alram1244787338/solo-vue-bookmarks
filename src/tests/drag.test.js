import { describe, it, expect, beforeEach } from 'vitest'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'

describe('拖拽 - 书签移动到文件夹', () => {
  let store
  let defaultFolder

  beforeEach(() => {
    store = useBookmarkStore()
    store.resetStore()
    store.initData()
    defaultFolder = store.folders.value.find(f => f.name === '未分类')
  })

  it('可以将书签从一个文件夹移动到另一个文件夹', () => {
    const targetFolder = store.addFolder('目标文件夹', null)

    const bookmark = store.bookmarks.value[0]
    expect(bookmark.folderId).toBe(defaultFolder.id)

    store.moveBookmark(bookmark.id, targetFolder.id)

    const updatedBookmark = store.bookmarks.value.find(b => b.id === bookmark.id)
    expect(updatedBookmark.folderId).toBe(targetFolder.id)
  })

  it('移动书签后，原文件夹的书签数量减少，目标文件夹增加', () => {
    const sourceFolder = store.addFolder('源文件夹', null)
    const targetFolder = store.addFolder('目标文件夹', null)

    const bookmark = store.addBookmark({
      title: '测试书签',
      url: 'https://test.com',
      folderId: sourceFolder.id
    })

    expect(store.bookmarks.value.filter(b => b.folderId === sourceFolder.id).length).toBe(1)
    expect(store.bookmarks.value.filter(b => b.folderId === targetFolder.id).length).toBe(0)

    store.moveBookmark(bookmark.id, targetFolder.id)

    expect(store.bookmarks.value.filter(b => b.folderId === sourceFolder.id).length).toBe(0)
    expect(store.bookmarks.value.filter(b => b.folderId === targetFolder.id).length).toBe(1)
  })

  it('可以将书签移动到嵌套的子文件夹', () => {
    const parent = store.addFolder('父文件夹', null)
    const child = store.addFolder('子文件夹', parent.id)
    const grandChild = store.addFolder('孙子文件夹', child.id)

    const bookmark = store.bookmarks.value[0]
    expect(bookmark.folderId).toBe(defaultFolder.id)

    store.moveBookmark(bookmark.id, grandChild.id)

    const updatedBookmark = store.bookmarks.value.find(b => b.id === bookmark.id)
    expect(updatedBookmark.folderId).toBe(grandChild.id)

    store.setCurrentFolder(grandChild.id)
    const folderContent = store.filteredBookmarks.value
    expect(folderContent.length).toBe(1)
    expect(folderContent[0].id).toBe(bookmark.id)
  })

  it('移动书签后，搜索结果中显示新的归属文件夹', () => {
    const targetFolder = store.addFolder('前端收藏', null)

    store.addBookmark({
      title: 'Vue.js',
      url: 'https://vuejs.org',
      description: '前端框架',
      tags: ['前端'],
      folderId: defaultFolder.id
    })

    const bookmark = store.bookmarks.value.find(b => b.title === 'Vue.js')

    store.moveBookmark(bookmark.id, targetFolder.id)

    store.setCurrentFolder(targetFolder.id)
    store.setSearchQuery('Vue')

    const results = store.filteredBookmarks.value
    expect(results.length).toBe(1)
    expect(results[0].id).toBe(bookmark.id)
  })

  it('可以批量移动多个书签', () => {
    const targetFolder = store.addFolder('目标文件夹', null)

    const bookmark1 = store.bookmarks.value[0]
    const bookmark2 = store.bookmarks.value[1]
    const bookmark3 = store.bookmarks.value[2]

    store.moveBookmark(bookmark1.id, targetFolder.id)
    store.moveBookmark(bookmark2.id, targetFolder.id)
    store.moveBookmark(bookmark3.id, targetFolder.id)

    const targetBookmarks = store.bookmarks.value.filter(b => b.folderId === targetFolder.id)
    expect(targetBookmarks.length).toBe(3)

    const defaultBookmarks = store.bookmarks.value.filter(b => b.folderId === defaultFolder.id)
    expect(defaultBookmarks.length).toBe(0)
  })

  it('在不同文件夹之间来回移动书签', () => {
    const folderA = store.addFolder('文件夹A', null)
    const folderB = store.addFolder('文件夹B', null)

    const bookmark = store.addBookmark({
      title: '移动测试',
      url: 'https://move-test.com',
      folderId: folderA.id
    })

    expect(bookmark.folderId).toBe(folderA.id)

    store.moveBookmark(bookmark.id, folderB.id)
    expect(store.bookmarks.value.find(b => b.id === bookmark.id).folderId).toBe(folderB.id)

    store.moveBookmark(bookmark.id, folderA.id)
    expect(store.bookmarks.value.find(b => b.id === bookmark.id).folderId).toBe(folderA.id)

    store.moveBookmark(bookmark.id, defaultFolder.id)
    expect(store.bookmarks.value.find(b => b.id === bookmark.id).folderId).toBe(defaultFolder.id)
  })

  it('书签的其他属性在移动后保持不变', () => {
    const targetFolder = store.addFolder('目标文件夹', null)

    const originalBookmark = store.addBookmark({
      title: '完整属性测试',
      url: 'https://full-attrs.com',
      description: '测试描述',
      tags: ['标签1', '标签2']
    })

    const originalData = {
      title: originalBookmark.title,
      url: originalBookmark.url,
      description: originalBookmark.description,
      tags: [...originalBookmark.tags],
      createdAt: originalBookmark.createdAt
    }

    store.moveBookmark(originalBookmark.id, targetFolder.id)

    const movedBookmark = store.bookmarks.value.find(b => b.id === originalBookmark.id)
    expect(movedBookmark.title).toBe(originalData.title)
    expect(movedBookmark.url).toBe(originalData.url)
    expect(movedBookmark.description).toBe(originalData.description)
    expect(movedBookmark.tags).toEqual(originalData.tags)
    expect(movedBookmark.createdAt).toBe(originalData.createdAt)
    expect(movedBookmark.folderId).toBe(targetFolder.id)
  })

  it('移动不存在的书签 ID 不会抛出错误', () => {
    const targetFolder = store.addFolder('目标文件夹', null)

    expect(() => {
      store.moveBookmark('non-existent-id', targetFolder.id)
    }).not.toThrow()

    const count = store.bookmarks.value.filter(b => b.folderId === targetFolder.id).length
    expect(count).toBe(0)
  })

  it('移动到不存在的文件夹 ID 不会抛出错误', () => {
    const bookmark = store.bookmarks.value[0]
    const originalFolderId = bookmark.folderId

    expect(() => {
      store.moveBookmark(bookmark.id, 'non-existent-folder')
    }).not.toThrow()

    const updatedBookmark = store.bookmarks.value.find(b => b.id === bookmark.id)
    expect(updatedBookmark.folderId).toBe('non-existent-folder')
  })

  it('移动书签后，删除源文件夹不会影响已移动的书签', () => {
    const sourceFolder = store.addFolder('源文件夹', null)
    const targetFolder = store.addFolder('目标文件夹', null)

    const bookmark1 = store.addBookmark({
      title: '保留',
      url: 'https://keep.com',
      folderId: targetFolder.id
    })

    const bookmark2 = store.addBookmark({
      title: '移动',
      url: 'https://move.com',
      folderId: sourceFolder.id
    })

    store.moveBookmark(bookmark2.id, targetFolder.id)
    store.deleteFolder(sourceFolder.id)

    const stillExists = store.bookmarks.value.find(b => b.id === bookmark2.id)
    expect(stillExists).toBeTruthy()
    expect(stillExists.folderId).toBe(targetFolder.id)

    const alsoExists = store.bookmarks.value.find(b => b.id === bookmark1.id)
    expect(alsoExists).toBeTruthy()

    expect(store.bookmarks.value.filter(b => b.folderId === targetFolder.id).length).toBe(2)
  })

  it('通过文件夹切换可以验证书签移动结果', () => {
    const workFolder = store.addFolder('工作', null)
    const studyFolder = store.addFolder('学习', null)

    const workBookmark = store.addBookmark({
      title: '工作文档',
      url: 'https://work.com',
      folderId: workFolder.id
    })

    const studyBookmark = store.addBookmark({
      title: '学习资料',
      url: 'https://study.com',
      folderId: studyFolder.id
    })

    store.setCurrentFolder(workFolder.id)
    expect(store.filteredBookmarks.value.length).toBe(1)
    expect(store.filteredBookmarks.value[0].title).toBe('工作文档')

    store.setCurrentFolder(studyFolder.id)
    expect(store.filteredBookmarks.value.length).toBe(1)
    expect(store.filteredBookmarks.value[0].title).toBe('学习资料')

    store.moveBookmark(studyBookmark.id, workFolder.id)

    store.setCurrentFolder(workFolder.id)
    expect(store.filteredBookmarks.value.length).toBe(2)
    expect(store.filteredBookmarks.value.map(b => b.title)).toContain('工作文档')
    expect(store.filteredBookmarks.value.map(b => b.title)).toContain('学习资料')

    store.setCurrentFolder(studyFolder.id)
    expect(store.filteredBookmarks.value.length).toBe(0)
  })
})
