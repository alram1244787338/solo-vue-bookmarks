import { describe, it, expect, beforeEach } from 'vitest'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'

describe('文件夹树操作', () => {
  let store

  beforeEach(() => {
    store = useBookmarkStore()
    store.resetStore()
    store.initData()
  })

  it('初始化时有一个默认根文件夹', () => {
    expect(store.folders.value.length).toBe(1)
    expect(store.folders.value[0].name).toBe('未分类')
    expect(store.folders.value[0].parentId).toBe(null)
  })

  it('可以新建根文件夹', () => {
    const initialCount = store.folders.value.length
    const folder = store.addFolder('技术文章', null)

    expect(store.folders.value.length).toBe(initialCount + 1)
    expect(folder.name).toBe('技术文章')
    expect(folder.parentId).toBe(null)
    expect(folder.id).toBeTruthy()
  })

  it('可以新建嵌套子文件夹', () => {
    const parentFolder = store.addFolder('前端开发', null)

    const childFolder = store.addFolder('Vue 学习', parentFolder.id)
    expect(childFolder.parentId).toBe(parentFolder.id)

    const grandChildFolder = store.addFolder('Vue 3 新特性', childFolder.id)
    expect(grandChildFolder.parentId).toBe(childFolder.id)

    const children = store.getFolderChildren(parentFolder.id)
    expect(children.length).toBe(1)
    expect(children[0].id).toBe(childFolder.id)

    const grandChildren = store.getFolderChildren(childFolder.id)
    expect(grandChildren.length).toBe(1)
    expect(grandChildren[0].id).toBe(grandChildFolder.id)
  })

  it('子文件夹数量统计正确', () => {
    const root = store.addFolder('工作', null)
    store.addFolder('项目1', root.id)
    store.addFolder('项目2', root.id)
    store.addFolder('项目3', root.id)

    const child1 = store.addFolder('子项目', root.id)
    store.addFolder('子子项目', child1.id)

    const rootChildren = store.getFolderChildren(root.id)
    expect(rootChildren.length).toBe(4)

    const nestedChildren = store.getFolderChildren(child1.id)
    expect(nestedChildren.length).toBe(1)

    const leafChildren = store.getFolderChildren(nestedChildren[0].id)
    expect(leafChildren.length).toBe(0)
  })

  it('可以重命名文件夹', () => {
    const folder = store.addFolder('旧名字', null)
    store.renameFolder(folder.id, '新名字')

    const updatedFolder = store.folders.value.find(f => f.id === folder.id)
    expect(updatedFolder.name).toBe('新名字')
  })

  it('重命名空字符串不生效', () => {
    const folder = store.addFolder('测试文件夹', null)
    store.renameFolder(folder.id, '')

    const updatedFolder = store.folders.value.find(f => f.id === folder.id)
    expect(updatedFolder.name).toBe('测试文件夹')
  })

  it('删除文件夹时，子文件夹也被删除', () => {
    const parent = store.addFolder('父文件夹', null)
    const child1 = store.addFolder('子文件夹1', parent.id)
    const child2 = store.addFolder('子文件夹2', parent.id)
    const grandChild = store.addFolder('孙子文件夹', child1.id)

    const initialCount = store.folders.value.length
    store.deleteFolder(parent.id)

    const remainingIds = store.folders.value.map(f => f.id)
    expect(store.folders.value.length).toBe(initialCount - 4)
    expect(remainingIds).not.toContain(parent.id)
    expect(remainingIds).not.toContain(child1.id)
    expect(remainingIds).not.toContain(child2.id)
    expect(remainingIds).not.toContain(grandChild.id)
  })

  it('删除文件夹时，内部书签被移动到其他根文件夹', () => {
    const defaultFolder = store.folders.value.find(f => f.name === '未分类')
    const testFolder = store.addFolder('测试文件夹', null)

    const bookmark = store.addBookmark({
      title: '测试书签',
      url: 'https://test.com',
      folderId: testFolder.id
    })

    expect(bookmark.folderId).toBe(testFolder.id)

    store.deleteFolder(testFolder.id)

    const updatedBookmark = store.bookmarks.value.find(b => b.id === bookmark.id)
    expect(updatedBookmark.folderId).toBe(defaultFolder.id)
  })

  it('删除唯一的根文件夹时，书签 folderId 变为 null', () => {
    const defaultFolder = store.folders.value.find(f => f.name === '未分类')

    const bookmark = store.bookmarks.value[0]
    expect(bookmark.folderId).toBe(defaultFolder.id)

    store.deleteFolder(defaultFolder.id)

    const updatedBookmark = store.bookmarks.value.find(b => b.id === bookmark.id)
    expect(updatedBookmark.folderId).toBe(null)
  })

  it('删除当前选中的文件夹时，currentFolderId 自动切换', () => {
    const defaultFolder = store.folders.value[0]
    const newFolder = store.addFolder('新文件夹', null)
    store.setCurrentFolder(newFolder.id)

    expect(store.currentFolderId.value).toBe(newFolder.id)

    store.deleteFolder(newFolder.id)

    expect(store.currentFolderId.value).toBe(defaultFolder.id)
  })

  it('新建子文件夹时父文件夹自动展开', () => {
    const parent = store.addFolder('父文件夹', null)
    store.toggleFolderExpanded(parent.id)
    expect(store.isFolderExpanded(parent.id)).toBe(false)

    store.addFolder('子文件夹', parent.id)
    expect(store.isFolderExpanded(parent.id)).toBe(true)
  })

  it('可以切换文件夹展开状态', () => {
    const folder = store.folders.value[0]
    expect(store.isFolderExpanded(folder.id)).toBe(true)

    store.toggleFolderExpanded(folder.id)
    expect(store.isFolderExpanded(folder.id)).toBe(false)

    store.toggleFolderExpanded(folder.id)
    expect(store.isFolderExpanded(folder.id)).toBe(true)
  })

  it('getFolderById 可以正确查找文件夹', () => {
    const folder = store.addFolder('测试', null)
    const found = store.getFolderById(folder.id)
    expect(found).toEqual(folder)

    const notFound = store.getFolderById('non-existent-id')
    expect(notFound).toBeUndefined()
  })
})
