<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="localQuery"
        type="text"
        class="search-input"
        placeholder="搜索书签标题、URL 或标签..."
        @input="handleInput"
      />
      <button
        v-if="localQuery"
        class="search-clear"
        @click="clearSearch"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'
import { debounce } from '@/utils/helpers.js'

const store = useBookmarkStore()
const localQuery = ref('')

onMounted(() => {
  localQuery.value = store.searchQuery.value
})

const debouncedSetQuery = debounce((value) => {
  store.setSearchQuery(value)
}, 300)

function handleInput() {
  debouncedSetQuery(localQuery.value)
}

function clearSearch() {
  localQuery.value = ''
  store.setSearchQuery('')
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  font-size: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  transition: all var(--transition-fast);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.search-clear {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text-muted);
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.search-clear:hover {
  background: var(--color-border);
  color: var(--color-text-secondary);
}
</style>
