<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEdit ? '编辑书签' : '添加书签' }}</h3>
        <button class="modal-close" @click="handleClose">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">标题</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="输入书签标题"
          />
        </div>

        <div class="form-group">
          <label class="form-label">URL</label>
          <input
            v-model="form.url"
            type="text"
            class="form-input"
            placeholder="https://example.com"
          />
        </div>

        <div class="form-group">
          <label class="form-label">描述</label>
          <textarea
            v-model="form.description"
            class="form-input form-textarea"
            rows="3"
            placeholder="书签描述（可选）"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">标签（用逗号分隔）</label>
          <input
            v-model="tagsInput"
            type="text"
            class="form-input"
            placeholder="前端, 工具, 学习"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" @click="handleClose">取消</button>
        <button class="btn btn-primary" @click="handleSubmit">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  bookmark: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  title: '',
  url: '',
  description: '',
  tags: []
})

const tagsInput = ref('')

const isEdit = computed(() => !!props.bookmark)

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.bookmark) {
      form.value = {
        title: props.bookmark.title,
        url: props.bookmark.url,
        description: props.bookmark.description || '',
        tags: [...props.bookmark.tags]
      }
      tagsInput.value = props.bookmark.tags.join(', ')
    } else if (newVal) {
      form.value = {
        title: '',
        url: '',
        description: '',
        tags: []
      }
      tagsInput.value = ''
    }
  }
)

function parseTags(input) {
  return input
    .split(/[,，]/)
    .map(t => t.trim())
    .filter(t => t.length > 0)
}

function handleClose() {
  emit('close')
}

function handleSubmit() {
  const tags = parseTags(tagsInput.value)
  const data = {
    title: form.value.title || form.value.url,
    url: form.value.url,
    description: form.value.description || '',
    tags
  }

  if (!data.url) {
    alert('请输入 URL')
    return
  }

  if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
    data.url = 'https://' + data.url
  }

  emit('submit', data)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--color-text-secondary);
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 72px;
  line-height: 1.5;
  font-family: inherit;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
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

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-ghost:hover {
  background: var(--color-bg);
  color: var(--color-text);
}
</style>
