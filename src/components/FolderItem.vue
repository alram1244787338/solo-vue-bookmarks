<template>
  <div class="folder-item-wrapper">
    <div
      class="folder-item"
      :class="{
        active: isActive,
        'drag-over': isDragOver,
        expanded: isExpanded
      }"
      @click="handleClick"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div class="folder-item-content">
        <button
          v-if="hasChildren"
          class="folder-toggle"
          @click.stop="toggleExpand"
        >
          <span class="toggle-icon">{{ isExpanded ? '▼' : '▶' }}</span>
        </button>
        <span v-else class="folder-toggle-placeholder"></span>

        <span class="folder-icon">📁</span>

        <template v-if="isEditing">
          <input
            ref="editInput"
            v-model="editName"
            class="folder-edit-input"
            @blur="saveRename"
            @keyup.enter="saveRename"
            @keyup.escape="cancelRename"
            @click.stop
          />
        </template>
        <span v-else class="folder-name">{{ folder.name }}</span>
      </div>

      <div class="folder-actions" v-if="!isEditing">
        <button class="action-btn" title="新建子文件夹" @click.stop="handleAddChild">
          <span>+</span>
        </button>
        <button class="action-btn" title="重命名" @click.stop="startRename">
          <span>✎</span>
        </button>
        <button class="action-btn action-delete" title="删除" @click.stop="handleDelete">
          <span>✕</span>
        </button>
      </div>
    </div>

    <div v-if="isExpanded && hasChildren" class="folder-children">
      <FolderItem
        v-for="child in childFolders"
        :key="child.id"
        :folder="child"
        :level="level + 1"
        @select="$emit('select', $event)"
        @add-child="$emit('add-child', $event)"
        @rename="$emit('rename', $event)"
        @delete="$emit('delete', $event)"
        @drop-bookmark="$emit('drop-bookmark', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'

const props = defineProps({
  folder: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select', 'add-child', 'rename', 'delete', 'drop-bookmark'])

const store = useBookmarkStore()

const isExpanded = ref(true)
const isEditing = ref(false)
const editName = ref('')
const editInput = ref(null)
const isDragOver = ref(false)

const isActive = computed(() => {
  return store.currentFolderId.value === props.folder.id
})

const childFolders = computed(() => {
  return store.getFolderChildren(props.folder.id)
})

const hasChildren = computed(() => {
  return childFolders.value.length > 0
})

function handleClick() {
  if (!isEditing.value) {
    emit('select', props.folder.id)
  }
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function handleAddChild() {
  emit('add-child', props.folder.id)
  isExpanded.value = true
}

function startRename() {
  editName.value = props.folder.name
  isEditing.value = true
  nextTick(() => {
    if (editInput.value) {
      editInput.value.focus()
      editInput.value.select()
    }
  })
}

function saveRename() {
  const newName = editName.value.trim()
  if (newName && newName !== props.folder.name) {
    emit('rename', { folderId: props.folder.id, name: newName })
  }
  isEditing.value = false
}

function cancelRename() {
  isEditing.value = false
}

function handleDelete() {
  emit('delete', props.folder.id)
}

function handleDragOver(e) {
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(e) {
  isDragOver.value = false
  const bookmarkId = e.dataTransfer.getData('bookmarkId')
  if (bookmarkId) {
    emit('drop-bookmark', { bookmarkId, folderId: props.folder.id })
  }
}

function handleStartRename(event) {
  if (event.detail.folderId === props.folder.id) {
    startRename()
  }
}

onMounted(() => {
  window.addEventListener('start-rename', handleStartRename)
})

onUnmounted(() => {
  window.removeEventListener('start-rename', handleStartRename)
})
</script>

<style scoped>
.folder-item-wrapper {
  user-select: none;
}

.folder-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  margin: 2px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.folder-item:hover {
  background: var(--color-primary-light);
}

.folder-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.folder-item.drag-over {
  background: var(--color-primary-light);
  border: 2px dashed var(--color-primary);
}

.folder-item-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.folder-toggle {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: var(--color-text-muted);
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
}

.toggle-icon {
  transition: transform var(--transition-fast);
}

.folder-toggle-placeholder {
  width: 16px;
  height: 16px;
}

.folder-icon {
  font-size: 16px;
}

.folder-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-edit-input {
  flex: 1;
  min-width: 0;
  padding: 2px 6px;
  font-size: 14px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  outline: none;
}

.folder-actions {
  display: none;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.folder-item:hover .folder-actions {
  display: flex;
  opacity: 1;
}

.action-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text-secondary);
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-text);
}

.action-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.folder-children {
  margin-left: 16px;
}
</style>
