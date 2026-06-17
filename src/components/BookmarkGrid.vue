<template>
  <div class="bookmark-grid-wrapper">
    <div class="grid-header">
      <h3 class="grid-title">
        {{ currentFolderName }}
        <span class="bookmark-count">({{ bookmarks.length }})</span>
      </h3>
      <div class="grid-actions">
        <button class="btn btn-outline" @click="$emit('add')">
          <span class="btn-icon">+</span>
          添加书签
        </button>
      </div>
    </div>

    <div v-if="bookmarks.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <p class="empty-title">暂无书签</p>
      <p class="empty-desc">点击上方按钮添加你的第一个书签</p>
    </div>

    <div v-else class="bookmark-grid">
      <BookmarkCard
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        :bookmark="bookmark"
        @edit="$emit('edit', $event)"
        @delete="handleDelete"
        @tag-click="handleTagClick"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'
import BookmarkCard from './BookmarkCard.vue'

const props = defineProps({
  bookmarks: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['add', 'edit', 'delete', 'tag-click'])

const store = useBookmarkStore()

const currentFolderName = computed(() => {
  if (store.currentFolder.value) {
    return store.currentFolder.value.name
  }
  return '所有书签'
})

function handleDelete(bookmarkId) {
  store.deleteBookmark(bookmarkId)
}

function handleTagClick(tag) {
  store.toggleActiveTag(tag)
  emit('tag-click', tag)
}
</script>

<style scoped>
.bookmark-grid-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.grid-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.bookmark-count {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-muted);
  margin-left: 4px;
}

.grid-actions {
  display: flex;
  gap: 8px;
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

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover {
  background: var(--color-primary-light);
}

.btn-icon {
  font-size: 16px;
  line-height: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--color-text-muted);
}

.bookmark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
</style>
