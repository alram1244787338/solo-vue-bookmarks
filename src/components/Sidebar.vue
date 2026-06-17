<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">书签管理器</h2>
    </div>

    <div class="sidebar-actions">
      <button class="btn btn-primary btn-block" @click="handleAddRootFolder">
        <span class="btn-icon">+</span>
        新建文件夹
      </button>
    </div>

    <div class="folder-tree">
      <FolderItem
        v-for="folder in rootFolders"
        :key="folder.id"
        :folder="folder"
        :level="0"
        @select="handleSelectFolder"
        @add-child="handleAddChildFolder"
        @rename="handleRenameFolder"
        @delete="handleDeleteFolder"
        @drop-bookmark="handleDropBookmark"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'
import FolderItem from './FolderItem.vue'

const store = useBookmarkStore()

const rootFolders = computed(() => {
  return store.folders.value.filter(f => f.parentId === null)
})

function handleSelectFolder(folderId) {
  store.setCurrentFolder(folderId)
}

function handleAddRootFolder() {
  const folder = store.addFolder('新建文件夹', null)
  emitRenameEvent(folder.id)
}

function handleAddChildFolder(parentId) {
  const folder = store.addFolder('新建文件夹', parentId)
  emitRenameEvent(folder.id)
}

function handleRenameFolder({ folderId, name }) {
  store.renameFolder(folderId, name)
}

function handleDeleteFolder(folderId) {
  if (confirm('确定要删除这个文件夹吗？文件夹内的书签将移动到其他文件夹。')) {
    store.deleteFolder(folderId)
  }
}

function handleDropBookmark({ bookmarkId, folderId }) {
  store.moveBookmark(bookmarkId, folderId)
}

function emitRenameEvent(folderId) {
  setTimeout(() => {
    const event = new CustomEvent('start-rename', { detail: { folderId } })
    window.dispatchEvent(event)
  }, 50)
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: var(--color-bg-sidebar);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.sidebar-actions {
  padding: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-block {
  width: 100%;
}

.btn-icon {
  font-size: 16px;
  line-height: 1;
}

.folder-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
</style>
