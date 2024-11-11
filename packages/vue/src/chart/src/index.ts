import { ChartPie } from '../chart-pie'
import { ChartRing } from '../chart-ring'
import { ChartBar } from '../chart-bar'
import { ChartHistogram } from '../chart-histogram'
import { ChartRadar } from '../chart-radar'
import { ChartLine } from '../chart-line'

import { AutonaviMap } from '../chart-amap'
import { BaiduMap } from '../chart-bmap'
import { ChartBoxplot } from '../chart-boxplot'
import { ChartCandle } from '../chart-candle'
import { ChartFunnel } from '../chart-funnel'
import { ChartGauge } from '../chart-gauge'
import { ChartGraph } from '../chart-graph'
import { ChartHeatmap } from '../chart-heatmap'
import { ChartLiquidfill } from '../chart-liquidfill'
import { ChartMap } from '../chart-map'

import { ChartSankey } from '../chart-sankey'
import { ChartScatter } from '../chart-scatter'
import { ChartSunburst } from '../chart-sunburst'
import { ChartTree } from '../chart-tree'
import { ChartWaterfall } from '../chart-waterfall'
import { ChartWordcloud } from '../chart-wordcloud'

import Core from '@opentiny/vue-chart-core'

import { $prefix, defineComponent, h } from '@opentiny/vue-common'

export default defineComponent({
  name: $prefix + 'Chart',
  props: {
    ...Core.props,
    type: {
      type: String
    }
  },
  data() {
    this.chartLib = {
      bar: ChartBar,
      histogram: ChartHistogram,
      line: ChartLine,
      pie: ChartPie,
      ring: ChartRing,
      radar: ChartRadar,
      autonaviMap: AutonaviMap,
      baiduMap: BaiduMap,
      boxplot: ChartBoxplot,
      candle: ChartCandle,
      funnel: ChartFunnel,
      gauge: ChartGauge,
      graph: ChartGraph,
      heatmap: ChartHeatmap,
      liquidfill: ChartLiquidfill,
      map: ChartMap,
      sankey: ChartSankey,
      scatter: ChartScatter,
      sunburst: ChartSunburst,
      tree: ChartTree,
      waterfall: ChartWaterfall,
      wordcloud: ChartWordcloud
    }
    return {}
  },
  methods: {
    ready(val) {
      this.$emit('ready', val)
    },
    readyOnce(val) {
      this.$emit('readyOnce', val)
    },
    handleColor(val) {
      this.$emit('handle-color', val)
    },
    ...Core.methods
  },
  render() {
    return h(
      'div',
      {
        style: {
          width: this.width,
          height: this.height,
          position: 'relative'
        }
      },
      [
        h(this.chartLib[this.settings.type || this.type], {
          props: {
            ...this.$props
          },
          on: {
            ready: this.ready,
            readyOnce: this.readyOnce,
            handleColor: this.handleColor
          }
        }),

        // eslint-disable-next-line vue/require-slots-as-functions
        this.$slots.default
      ]
    )
  }
})
