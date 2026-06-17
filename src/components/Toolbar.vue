<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button class="btn btn-primary" @click="$emit('add')">
        <span class="btn-icon">+</span>
        添加书签
      </button>
    </div>

    <div class="toolbar-right">
      <div class="import-export-group">
        <label class="btn btn-outline import-btn">
          <span>📥</span>
          导入
          <input
            type="file"
            accept=".html,.json"
            style="display: none"
            @change="handleImport"
          />
        </label>

        <div class="export-dropdown" v-if="showExportDropdown" @click.stop>
          <button class="btn btn-outline" @click="toggleExportDropdown">
            <span>📤</span>
            导出
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="dropdown-menu">
            <button class="dropdown-item" @click="handleExportJson">
              导出为 JSON
            </button>
            <button class="dropdown-item" @click="handleExportHtml">
              导出为 HTML
            </button>
          </div>
        </div>
        <button v-else class="btn btn-outline" @click="toggleExportDropdown">
          <span>📤</span>
          导出
          <span class="dropdown-arrow">▼</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useBookmarkStore } from '@/composables/useBookmarkStore.js'
import { parseBookmarkHtml, downloadFile } from '@/utils/bookmarkImportExport.js'

const emit = defineEmits(['add'])

const store = useBookmarkStore()
const showExportDropdown = ref(false)

function toggleExportDropdown() {
  showExportDropdown.value = !showExportDropdown.value
}

function handleDocumentClick() {
  showExportDropdown.value = false
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const content = event.target.result

      if (file.name.endsWith('.json')) {
        const data = JSON.parse(content)
        if (data.bookmarks && Array.isArray(data.bookmarks)) {
          store.importBookmarks(data.bookmarks)
        } else {
          alert('JSON 文件格式不正确')
        }
      } else if (file.name.endsWith('.html')) {
        const bookmarks = parseBookmarkHtml(content)
        if (bookmarks.length > 0) {
          store.importBookmarks(bookmarks)
          alert(`成功导入 ${bookmarks.length} 个书签`)
        } else {
          alert('未找到书签')
        }
      }

      e.target.value = ''
    } catch (err) {
      console.error('Import error:', err)
      alert('导入失败：' + err.message)
    }
  }
  reader.readAsText(file)
}

function handleExportJson() {
  const json = store.exportBookmarksJson()
  const date = new Date().toISOString().slice(0, 10)
  downloadFile(json, `bookmarks_${date}.json`, 'application/json')
  showExportDropdown.value = false
}

function handleExportHtml() {
  const html = store.exportBookmarksHtml()
  const date = new Date().toISOString().slice(0, 10)
  downloadFile(html, `bookmarks_${date}.html`, 'text/html')
  showExportDropdown.value = false
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.import-export-group {
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
  cursor: pointer;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
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

.import-btn {
  cursor: pointer;
}

.export-dropdown {
  position: relative;
}

.dropdown-arrow {
  font-size: 10px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  min-width: 140px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  font-size: 14px;
  color: var(--color-text);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--color-bg);
}
</style>
