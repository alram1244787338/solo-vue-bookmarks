import { ref, computed, watch } from 'vue'
import { generateId, getFaviconUrl } from '@/utils/helpers.js'
import { loadFromStorage, saveToStorage } from '@/utils/storage.js'

const folders = ref([])
const bookmarks = ref([])
const currentFolderId = ref(null)
const searchQuery = ref('')
const activeTags = ref([])

function initData() {
  const saved = loadFromStorage()
  if (saved) {
    folders.value = saved.folders || []
    bookmarks.value = saved.bookmarks || []
    currentFolderId.value = saved.currentFolderId || null
  } else {
    const defaultFolderId = generateId()
    folders.value = [
      { id: defaultFolderId, name: '未分类', parentId: null }
    ]
    currentFolderId.value = defaultFolderId
    bookmarks.value = [
      {
        id: generateId(),
        title: 'Vue.js',
        url: 'https://vuejs.org',
        tags: ['前端', '框架'],
        folderId: defaultFolderId,
        createdAt: Date.now()
      },
      {
        id: generateId(),
        title: 'GitHub',
        url: 'https://github.com',
        tags: ['开发', '工具'],
        folderId: defaultFolderId,
        createdAt: Date.now()
      },
      {
        id: generateId(),
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        tags: ['前端', '文档'],
        folderId: defaultFolderId,
        createdAt: Date.now()
      }
    ]
  }
}

initData()

watch(
  () => [folders.value, bookmarks.value, currentFolderId.value],
  () => {
    saveToStorage({
      folders: folders.value,
      bookmarks: bookmarks.value,
      currentFolderId: currentFolderId.value
    })
  },
  { deep: true }
)

export function useBookmarkStore() {
  const allTags = computed(() => {
    const tagSet = new Set()
    bookmarks.value.forEach(b => {
      b.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  const currentFolder = computed(() => {
    return folders.value.find(f => f.id === currentFolderId.value) || null
  })

  const filteredBookmarks = computed(() => {
    let result = bookmarks.value

    if (currentFolderId.value) {
      result = result.filter(b => b.folderId === currentFolderId.value)
    }

    if (activeTags.value.length > 0) {
      result = result.filter(b =>
        activeTags.value.every(tag => b.tags.includes(tag))
      )
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        b.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return result.sort((a, b) => b.createdAt - a.createdAt)
  })

  const childFolders = computed(() => {
    return (parentId = null) => {
      return folders.value.filter(f => f.parentId === parentId)
    }
  })

  function getFolderChildren(parentId) {
    return folders.value.filter(f => f.parentId === parentId)
  }

  function addFolder(name, parentId = null) {
    const folder = {
      id: generateId(),
      name: name || '新建文件夹',
      parentId
    }
    folders.value.push(folder)
    return folder
  }

  function renameFolder(folderId, newName) {
    const folder = folders.value.find(f => f.id === folderId)
    if (folder) {
      folder.name = newName
    }
  }

  function deleteFolder(folderId) {
    const folderIndex = folders.value.findIndex(f => f.id === folderId)
    if (folderIndex === -1) return

    const allChildIds = getAllChildFolderIds(folderId)
    allChildIds.push(folderId)

    const defaultFolder = folders.value.find(f => f.parentId === null && f.id !== folderId)
    const targetFolderId = defaultFolder ? defaultFolder.id : null

    bookmarks.value.forEach(b => {
      if (allChildIds.includes(b.folderId)) {
        b.folderId = targetFolderId
      }
    })

    folders.value = folders.value.filter(f => !allChildIds.includes(f.id))

    if (currentFolderId.value && allChildIds.includes(currentFolderId.value)) {
      currentFolderId.value = targetFolderId
    }
  }

  function getAllChildFolderIds(parentId) {
    const childIds = []
    const children = folders.value.filter(f => f.parentId === parentId)
    children.forEach(child => {
      childIds.push(child.id)
      childIds.push(...getAllChildFolderIds(child.id))
    })
    return childIds
  }

  function setCurrentFolder(folderId) {
    currentFolderId.value = folderId
  }

  function addBookmark({ title, url, tags = [], folderId = null }) {
    const bookmark = {
      id: generateId(),
      title: title || url,
      url,
      tags,
      folderId: folderId || currentFolderId.value,
      createdAt: Date.now()
    }
    bookmarks.value.push(bookmark)
    return bookmark
  }

  function updateBookmark(bookmarkId, updates) {
    const bookmark = bookmarks.value.find(b => b.id === bookmarkId)
    if (bookmark) {
      Object.assign(bookmark, updates)
    }
  }

  function deleteBookmark(bookmarkId) {
    const index = bookmarks.value.findIndex(b => b.id === bookmarkId)
    if (index > -1) {
      bookmarks.value.splice(index, 1)
    }
  }

  function moveBookmark(bookmarkId, newFolderId) {
    const bookmark = bookmarks.value.find(b => b.id === bookmarkId)
    if (bookmark) {
      bookmark.folderId = newFolderId
    }
  }

  function addTagToBookmark(bookmarkId, tag) {
    const bookmark = bookmarks.value.find(b => b.id === bookmarkId)
    if (bookmark && !bookmark.tags.includes(tag)) {
      bookmark.tags.push(tag)
    }
  }

  function removeTagFromBookmark(bookmarkId, tag) {
    const bookmark = bookmarks.value.find(b => b.id === bookmarkId)
    if (bookmark) {
      const index = bookmark.tags.indexOf(tag)
      if (index > -1) {
        bookmark.tags.splice(index, 1)
      }
    }
  }

  function toggleActiveTag(tag) {
    const index = activeTags.value.indexOf(tag)
    if (index > -1) {
      activeTags.value.splice(index, 1)
    } else {
      activeTags.value.push(tag)
    }
  }

  function clearActiveTags() {
    activeTags.value = []
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function importBookmarks(newBookmarks, targetFolderId = null) {
    const folderId = targetFolderId || currentFolderId.value
    newBookmarks.forEach(b => {
      const bookmark = {
        id: generateId(),
        title: b.title || b.url,
        url: b.url,
        tags: b.tags || [],
        folderId,
        createdAt: Date.now()
      }
      bookmarks.value.push(bookmark)
    })
  }

  function exportBookmarksJson() {
    const data = {
      version: '1.0',
      folders: folders.value,
      bookmarks: bookmarks.value
    }
    return JSON.stringify(data, null, 2)
  }

  function exportBookmarksHtml() {
    const lines = [
      '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
      '<!-- This is an automatically generated file.',
      '     It will be read and overwritten.',
      '     DO NOT EDIT! -->',
      '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
      '<TITLE>Bookmarks</TITLE>',
      '<H1>Bookmarks</H1>',
      '<DL><p>'
    ]

    function buildFolderHtml(folderId, indent = '') {
      const folder = folders.value.find(f => f.id === folderId)
      const folderBookmarks = bookmarks.value.filter(b => b.folderId === folderId)
      const childFolders = folders.value.filter(f => f.parentId === folderId)

      if (folder) {
        lines.push(`${indent}<DT><H3>${folder.name}</H3>`)
        lines.push(`${indent}<DL><p>`)
      }

      folderBookmarks.forEach(b => {
        const tags = b.tags.join(',')
        lines.push(`${indent}  <DT><A HREF="${b.url}" TAGS="${tags}">${b.title}</A>`)
      })

      childFolders.forEach(child => {
        buildFolderHtml(child.id, indent + '  ')
      })

      if (folder) {
        lines.push(`${indent}</DL><p>`)
      }
    }

    const rootFolders = folders.value.filter(f => f.parentId === null)
    rootFolders.forEach(folder => {
      buildFolderHtml(folder.id, '    ')
    })

    lines.push('</DL><p>')
    return lines.join('\n')
  }

  function getFavicon(bookmark) {
    return getFaviconUrl(bookmark.url)
  }

  function getFolderById(folderId) {
    return folders.value.find(f => f.id === folderId)
  }

  return {
    folders,
    bookmarks,
    currentFolderId,
    currentFolder,
    searchQuery,
    activeTags,
    allTags,
    filteredBookmarks,
    childFolders,
    getFolderChildren,
    getFolderById,
    addFolder,
    renameFolder,
    deleteFolder,
    setCurrentFolder,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    moveBookmark,
    addTagToBookmark,
    removeTagFromBookmark,
    toggleActiveTag,
    clearActiveTags,
    setSearchQuery,
    importBookmarks,
    exportBookmarksJson,
    exportBookmarksHtml,
    getFavicon
  }
}
