<template>
  <div
    class="bookmark-card"
    :class="{ dragging: isDragging }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="card-header">
      <img
        :src="faviconUrl"
        :alt="bookmark.title"
        class="favicon"
        @error="handleFaviconError"
      />
      <div class="card-actions">
        <button class="action-btn" title="编辑" @click.stop="$emit('edit', bookmark)">
          ✎
        </button>
        <button class="action-btn action-delete" title="删除" @click.stop="handleDelete">
          ✕
        </button>
      </div>
    </div>

    <a
      :href="bookmark.url"
      target="_blank"
      rel="noopener noreferrer"
      class="card-title"
      @click="handleClick"
    >
      {{ bookmark.title }}
    </a>

    <div class="card-url" :title="bookmark.url">
      {{ displayUrl }}
    </div>

    <div class="card-tags" v-if="bookmark.tags && bookmark.tags.length > 0">
      <span
        v-for="tag in bookmark.tags"
        :key="tag"
        class="tag"
        @click.stop="$emit('tag-click', tag)"
      >
        #{{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getFaviconUrl, getDomain } from '@/utils/helpers.js'

const props = defineProps({
  bookmark: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'tag-click'])

const isDragging = ref(false)
const faviconError = ref(false)

const faviconUrl = computed(() => {
  if (faviconError.value) {
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsb3NzPSJub25lIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik0yIDEyaDIwIi8+PHBhdGggZD0iTTEyIDJhMTUuMyAxNS4zIDAgMCAxIDAgMjAgMTUuMyAxNS4zIDAgMCAxIDAtMjAiLz48L3N2Zz4='
  }
  return getFaviconUrl(props.bookmark.url)
})

const displayUrl = computed(() => {
  const domain = getDomain(props.bookmark.url)
  return domain || props.bookmark.url
})

function handleDragStart(e) {
  isDragging.value = true
  e.dataTransfer.setData('bookmarkId', props.bookmark.id)
  e.dataTransfer.effectAllowed = 'move'
}

function handleDragEnd() {
  isDragging.value = false
}

function handleDelete() {
  if (confirm('确定要删除这个书签吗？')) {
    emit('delete', props.bookmark.id)
  }
}

function handleFaviconError() {
  faviconError.value = true
}

function handleClick() {
  // 打开链接的默认行为
}
</script>

<style scoped>
.bookmark-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: all var(--transition-normal);
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bookmark-card:hover {
  box-shadow: var(--shadow-md);
  border-color: transparent;
  transform: translateY(-2px);
}

.bookmark-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.favicon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: contain;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.bookmark-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--color-text-secondary);
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

.action-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  min-height: 2.8em;
}

.card-title:hover {
  color: var(--color-primary);
}

.card-url {
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  padding-top: 4px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 11px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 10px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag:hover {
  background: var(--color-primary);
  color: white;
}
</style>
