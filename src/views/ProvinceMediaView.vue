<template>
  <div class="province-media-view">
    <header class="page-header">
      <a class="back-link" :href="backHref">← 返回地图</a>
      <h1 class="page-title">{{ config?.name || provinceKey }}</h1>
    </header>
    <template v-if="passed">
      <div v-if="config?.media?.length" class="media-list">
        <div
          v-for="(item, index) in config.media"
          :key="index"
          class="media-item"
        >
          <template v-if="item.type === 'image'">
            <a
              :href="resolveMediaSrc(item.src)"
              target="_blank"
              rel="noopener noreferrer"
              class="media-link"
            >
              <img
                :src="resolveMediaSrc(item.src)"
                :alt="item.title"
                class="media-img"
                loading="lazy"
                @error="onMediaError"
              />
            </a>
            <p v-if="item.title" class="media-title">{{ item.title }}</p>
          </template>
          <template v-else-if="item.type === 'video'">
            <video
              :src="resolveMediaSrc(item.src)"
              :title="item.title"
              class="media-video"
              controls
              preload="metadata"
            />
            <a
              :href="resolveMediaSrc(item.src)"
              target="_blank"
              rel="noopener noreferrer"
              class="media-open-new"
            >在新标签页打开</a>
            <p v-if="item.title" class="media-title">{{ item.title }}</p>
          </template>
        </div>
      </div>
      <p v-else class="no-media">该省份暂无打卡媒体</p>
    </template>
    <template v-else>
      <div class="auth-block">
        <p class="auth-tip">你的名字是唯一的钥匙</p>
        <div class="auth-form">
          <input
            v-model="inputName"
            type="text"
            class="auth-input"
            placeholder="请输入姓名"
            maxlength="20"
            @keyup.enter="checkName"
          />
          <button type="button" class="btn-confirm" @click="checkName">确认</button>
        </div>
        <p v-if="authError" class="auth-error">{{ authError }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { mapConfig } from '@/config/provinces.js'

const route = useRoute()
const provinceKey = computed(() => route.params.key || '')

const config = computed(() =>
  provinceKey.value ? mapConfig[provinceKey.value] ?? null : null
)

const passed = ref(false)
const inputName = ref('')
const authError = ref('')

const backHref = computed(() => {
  const base = import.meta.env.BASE_URL
  return `${base}#/`
})

watch(
  config,
  (c) => {
    if (!c) return
    document.title = `${c.name} · 路过人间`
    passed.value = c.viewPermission === 'public'
    authError.value = ''
    inputName.value = ''
  },
  { immediate: true }
)

async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function checkName() {
  const hashes = config.value?.allowedNameHashes
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

function resolveMediaSrc(src) {
  if (!src) return ''
  if (src.startsWith('http')) return src
  const base = import.meta.env.BASE_URL
  const path = src.startsWith('/') ? src.slice(1) : src
  return base + path
}

function onMediaError(e) {
  e.target.style.display = 'none'
}
</script>

<style scoped>
.province-media-view {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem 1.25rem 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-block;
  font-size: 0.875rem;
  color: var(--color-planned);
  text-decoration: none;
  margin-bottom: 0.5rem;
}

.back-link:hover {
  text-decoration: underline;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.media-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.media-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.media-link {
  display: block;
  line-height: 0;
}

.media-img,
.media-video {
  max-width: 100%;
  border-radius: 8px;
  background: #f5f5f5;
}

.media-video {
  min-height: 200px;
}

.media-open-new {
  font-size: 0.8125rem;
  color: var(--color-planned);
  text-decoration: none;
  margin-top: 0.25rem;
}

.media-open-new:hover {
  text-decoration: underline;
}

.media-title {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.no-media {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  text-align: center;
  padding: 2rem;
}

.auth-block {
  text-align: center;
  padding: 2rem 1rem;
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
</style>
