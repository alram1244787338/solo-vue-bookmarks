<template>
  <div class="app-layout">
    <Sidebar />

    <main class="main-content">
      <div class="content-wrapper">
        <header class="page-header">
          <h1 class="page-title">我的书签</h1>
          <p class="page-desc">管理和组织你的书签收藏</p>
        </header>

        <Toolbar @add="openAddModal" />

        <SearchBar />

        <TagFilter />

        <BookmarkGrid
          :bookmarks="filteredBookmarks"
          @add="openAddModal"
          @edit="openEditModal"
        />
      </div>
    </main>

    <BookmarkModal
      :visible="showModal"
      :bookmark="editingBookmark"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'
import Sidebar from '@/components/Sidebar.vue'
import Toolbar from '@/components/Toolbar.vue'
import SearchBar from '@/components/SearchBar.vue'
import TagFilter from '@/components/TagFilter.vue'
import BookmarkGrid from '@/components/BookmarkGrid.vue'
import BookmarkModal from '@/components/BookmarkModal.vue'

const store = useBookmarkStore()

const filteredBookmarks = computed(() => store.filteredBookmarks.value)

const showModal = ref(false)
const editingBookmark = ref(null)

function openAddModal() {
  editingBookmark.value = null
  showModal.value = true
}

function openEditModal(bookmark) {
  editingBookmark.value = bookmark
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingBookmark.value = null
}

function handleSubmit(data) {
  if (editingBookmark.value) {
    store.updateBookmark(editingBookmark.value.id, data)
  } else {
    store.addBookmark(data)
  }
  closeModal()
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}

.page-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
