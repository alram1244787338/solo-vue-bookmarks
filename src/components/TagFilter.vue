<template>
  <div class="tag-filter" v-if="allTags.length > 0">
    <div class="tag-filter-header">
      <span class="tag-filter-title">标签筛选</span>
      <button
        v-if="activeTags.length > 0"
        class="clear-tags-btn"
        @click="clearTags"
      >
        清除筛选
      </button>
    </div>
    <div class="tag-list">
      <span
        v-for="tag in allTags"
        :key="tag"
        class="tag-chip"
        :class="{ active: isTagActive(tag) }"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'

const store = useBookmarkStore()

const allTags = computed(() => store.allTags.value)
const activeTags = computed(() => store.activeTags.value)

function isTagActive(tag) {
  return activeTags.value.includes(tag)
}

function toggleTag(tag) {
  store.toggleActiveTag(tag)
}

function clearTags() {
  store.clearActiveTags()
}
</script>

<style scoped>
.tag-filter {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.tag-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tag-filter-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.clear-tags-btn {
  font-size: 12px;
  color: var(--color-primary);
  transition: color var(--transition-fast);
}

.clear-tags-btn:hover {
  color: var(--color-primary-hover);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 12px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-chip.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
</style>
