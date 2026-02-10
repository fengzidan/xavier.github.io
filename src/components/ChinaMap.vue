<template>
  <div class="china-map-wrap">
    <div ref="chartRef" class="chart-container"></div>
    <div class="legend">
      <span
        v-for="item in legendItems"
        :key="item.state"
        class="legend-item"
      >
        <i class="legend-dot" :style="{ background: item.color }" />
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import * as topojson from 'topojson-client'
import chinaTopo from '@/config/china.json'
import {
  mapConfig,
  provinceNameToKey,
  STATE_DONE,
  STATE_SOON,
  STATE_PLANNED,
  STATE_UNPLANNED,
  STATE_LABELS,
} from '@/config/provinces.js'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['province-click'])

const chartRef = ref(null)
let chartInstance = null

const objects = chinaTopo.objects || {}
const topoObject = objects.default ?? objects[Object.keys(objects)[0]]
const chinaGeo = topoObject ? topojson.feature(chinaTopo, topoObject) : null

const stateOrder = {
  [STATE_DONE]: 1,
  [STATE_SOON]: 2,
  [STATE_PLANNED]: 3,
  [STATE_UNPLANNED]: 4,
}

const colors = {
  [STATE_DONE]: '#67c23a',
  [STATE_SOON]: '#e6a23c',
  [STATE_PLANNED]: '#409eff',
  [STATE_UNPLANNED]: '#dcdfe6',
}

const legendItems = computed(() => [
  { state: STATE_DONE, label: STATE_LABELS[STATE_DONE], color: colors[STATE_DONE] },
  { state: STATE_SOON, label: STATE_LABELS[STATE_SOON], color: colors[STATE_SOON] },
  { state: STATE_PLANNED, label: STATE_LABELS[STATE_PLANNED], color: colors[STATE_PLANNED] },
  { state: STATE_UNPLANNED, label: STATE_LABELS[STATE_UNPLANNED], color: colors[STATE_UNPLANNED] },
])

function getConfigByKey(key) {
  return props.config[key] ?? null
}

function getStateValue(name) {
  const key = provinceNameToKey[name]
  const conf = key ? getConfigByKey(key) : null
  const state = conf?.state ?? STATE_UNPLANNED
  return stateOrder[state]
}

function buildMapData() {
  if (!chinaGeo?.features) return []
  return chinaGeo.features.map((f) => {
    const name = f.properties?.name ?? f.name ?? ''
    return { name, value: getStateValue(name) }
  })
}

function getOption() {
  const mapData = buildMapData()
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const key = provinceNameToKey[params.name]
        const conf = key ? getConfigByKey(key) : null
        const state = conf ? STATE_LABELS[conf.state] : STATE_LABELS[STATE_UNPLANNED]
        return `${params.name}<br/>${state}`
      },
    },
    visualMap: {
      show: false,
      type: 'piecewise',
      pieces: [
        { value: stateOrder[STATE_DONE], color: colors[STATE_DONE] },
        { value: stateOrder[STATE_SOON], color: colors[STATE_SOON] },
        { value: stateOrder[STATE_PLANNED], color: colors[STATE_PLANNED] },
        { value: stateOrder[STATE_UNPLANNED], color: colors[STATE_UNPLANNED] },
      ],
    },
    series: [
      {
        type: 'map',
        map: 'china',
        roam: false,
        label: {
          show: true,
          fontSize: 10,
          color: '#333',
        },
        emphasis: {
          label: { show: true },
          itemStyle: { areaColor: '#b8daff', borderColor: '#fff', borderWidth: 1.5 },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        data: mapData,
      },
    ],
  }
}

function initChart() {
  if (!chartRef.value || !chinaGeo) return
  echarts.registerMap('china', chinaGeo)
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(getOption())
  chartInstance.on('click', (params) => {
    if (params.componentType !== 'series') return
    const name = params.name
    const key = provinceNameToKey[name]
    const conf = key ? getConfigByKey(key) : null
    if (conf?.state === STATE_DONE) {
      emit('province-click', key, conf)
    }
  })
}

function resize() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  () => props.config,
  () => {
    if (!chartInstance) return
    chartInstance.setOption(getOption())
  },
  { deep: true }
)
</script>

<style scoped>
.china-map-wrap {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.chart-container {
  width: 100%;
  height: 560px;
  background: #fafbfc;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
