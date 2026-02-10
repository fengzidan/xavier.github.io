<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="detail-mask" @click.self="handleClose">
        <div class="detail-panel">
          <header class="detail-header">
            <h2 class="detail-title">{{ config?.name || province }}</h2>
            <button type="button" class="btn-close" aria-label="关闭" @click="handleClose">
              <SvgIcon name="common-close" class="icon-close" />
            </button>
          </header>
          <template v-if="passed">
            <div class="detail-opening">
              <p>正在打开……</p>
            </div>
          </template>
          <template v-else>
            <div class="detail-auth">
              <p v-if="needName" class="auth-tip">你的名字是唯一的钥匙</p>
              <p v-else class="auth-tip">该省份暂无打卡媒体</p>
              <div v-if="needName" class="auth-form">
                <input
                  v-model="inputName"
                  type="text"
                  class="auth-input"
                  placeholder="请输入姓名"
                  maxlength="20"
                  @keyup.enter="checkName"
                />
                <button type="button" class="btn-confirm" @click="checkName">
                  确认
                </button>
              </div>
              <p v-if="authError" class="auth-error">{{ authError }}</p>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SvgIcon from '@/components/SvgIcon.vue'

const props = defineProps({
  province: { type: String, default: '' },
  config: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const visible = ref(true)
const inputName = ref('')
const authError = ref('')
const passed = ref(false)

const needName = computed(() => {
  if (!props.config) return false
  return props.config.viewPermission === 'name'
})

watch(
  () => props.config,
  (c) => {
    if (!c) return
    passed.value = c.viewPermission === 'public'
    authError.value = ''
    inputName.value = ''
  },
  { immediate: true }
)

watch(passed, (val) => {
  if (val) openInNewTabAndClose()
})

function openInNewTabAndClose() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || ''
  const url = `${window.location.origin}${base}#/province/${props.province}`
  window.open(url, '_blank')
  handleClose()
}

async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function checkName() {
  const hashes = props.config?.allowedNameHashes
  if (!hashes?.length) {
    passed.value = true
    return
  }
  const name = inputName.value?.trim()
  if (!name) {
    authError.value = '请输入姓名'
    return
  }
  const inputHash = await sha256Hex(name)
  const allowed = hashes.includes(inputHash)
  if (allowed) {
    authError.value = ''
    passed.value = true
  } else {
    authError.value = '姓名不正确，无法查看'
  }
}

function handleClose() {
  visible.value = false
  setTimeout(() => emit('close'), 200)
}
</script>

<style scoped>
.detail-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
}

.detail-panel {
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.detail-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.btn-close {
  padding: 0.25rem;
  border: none;
  background: none;
  cursor: pointer;
  color: #606266;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #f5f5f5;
  color: #303133;
}

.icon-close {
  width: 20px;
  height: 20px;
}

.detail-opening {
  padding: 2rem 1.25rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.detail-auth {
  padding: 2rem 1.25rem;
  text-align: center;
}

.auth-tip {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.auth-form {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  max-width: 280px;
  margin: 0 auto 0.5rem;
}

.auth-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 0.9375rem;
}

.auth-input:focus {
  outline: none;
  border-color: var(--color-planned);
}

.btn-confirm {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: var(--color-planned);
  color: #fff;
  font-size: 0.9375rem;
  cursor: pointer;
}

.btn-confirm:hover {
  opacity: 0.9;
}

.auth-error {
  font-size: 0.8125rem;
  color: #f56c6c;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .detail-panel,
.modal-leave-active .detail-panel {
  transition: transform 0.2s;
}

.modal-enter-from .detail-panel,
.modal-leave-to .detail-panel {
  transform: scale(0.95);
}
</style>
