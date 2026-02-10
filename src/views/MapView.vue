<template>
  <div class="map-view">
    <ChinaMap :config="mapConfig" @province-click="onProvinceClick" />
    <ProvinceDetail
      v-if="detailVisible"
      :province="selectedProvince"
      :config="selectedConfig"
      @close="detailVisible = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChinaMap from '@/components/ChinaMap.vue'
import ProvinceDetail from '@/components/ProvinceDetail.vue'
import { mapConfig } from '@/config/provinces.js'

const detailVisible = ref(false)
const selectedProvince = ref(null)
const selectedConfig = ref(null)

const onProvinceClick = (provinceKey, config) => {
  selectedProvince.value = provinceKey
  selectedConfig.value = config
  detailVisible.value = true
}
</script>
