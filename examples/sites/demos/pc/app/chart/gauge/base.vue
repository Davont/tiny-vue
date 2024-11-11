<template>
  <div>
    <tiny-gauge :options="options"></tiny-gauge>
  </div>
</template>

<script lang="jsx">
import { TinyChartGauge } from '@opentiny/vue'

export default {
  components: {
    TinyGauge: TinyChartGauge
  },
  data() {
    return {
      options: {
        data: [
          {
            value: 71,
            name: 'Utilization rate'
          }
        ]
      }
    }
  }
}
</script>
