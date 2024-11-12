import { $prefix } from '../common/util'
import { isObject } from '../common/type'
import setExtend from '../common/extend'
import { DEFAULT_COLORS, SAAS_DEFAULT_COLORS, SAAS_DEFAULT_SAME_COLORS, DEFAULT_THEME } from '../common/constants'
import IntegrateChart from '@opentiny/huicharts'
import BaiduMapChart from '@opentiny/huicharts/components/BaiduMapChart'
import AutonaviMapChart from '@opentiny/huicharts/components/AutonaviMapChart'
import cloneDeep from '@opentiny/huicharts/util/cloneDeep'
import '@opentiny/vue-theme/chart-core/index.less'

export default {
  name: $prefix + 'ChartCore',
  emits: ['ready', 'ready-once', 'handle-color'],
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    settings: {
      type: Object,
      default() {
        return {}
      }
    },
    width: { type: String, default: 'auto' },
    height: { type: String, default: '400px' },
    events: { type: Object, default() {} },
    initOptions: {
      type: Object,
      default() {
        return {}
      }
    },
    tooltipVisible: { type: Boolean, default: true },
    legendVisible: { type: Boolean, default: true },
    legendPosition: { type: String },
    theme: Object,
    themeName: [Object, String],
    judgeWidth: {
      type: Boolean,
      default: false
    },
    widthChangeDelay: {
      type: Number,
      default: 200
    },
    resizeable: {
      type: Boolean,
      default: true
    },
    changeDelay: { type: Number, default: 0 },
    dataEmpty: Boolean,

    beforeConfig: {
      type: Function
    },
    afterConfig: {
      type: Function
    },
    afterSetOption: {
      type: Function
    },
    afterSetOptionOnce: {
      type: Function
    },

    loading: {
      type: Boolean,
      default: false
    },
    extend: {
      type: Object,
      default() {}
    },
    tooltipFormatter: { type: Function },

    markArea: {
      type: Object
    },
    markLine: {
      type: Object
    },
    markPoint: {
      type: Object
    },

    grid: { type: [Object, Array] },
    colors: {
      type: Array
    },
    visualMap: [Object, Array],
    dataZoom: [Object, Array],
    toolbox: [Object, Array],
    title: Object,
    legend: [Object, Array],
    xAxis: [Object, Array],
    yAxis: [Object, Array],
    radar: Object,
    tooltip: Object,
    axisPointer: Object,
    brush: [Object, Array],
    geo: Object,
    timeline: [Object, Array],
    graphic: [Object, Array],
    series: [Object, Array],
    backgroundColor: [Object, String],
    textStyle: Object,
    animation: Object,
    options: {
      type: Object,
      default: () => {
        return {}
      }
    },
    cancelResizeCheck: {
      type: Boolean,
      default: false
    },
    setOptionOpts: {
      type: Object,
      default() {}
    },
    colorMode: {
      type: String,
      default: 'default'
    }
  },
  data() {
    return {
      option: {},
      eChartOption: {},
      renderOption: {},
      initOpts: {},
      watchToPropsEchartOptions: [],
      selfChart: ['BaiduMapChart', 'AutonaviMapChart'],
      isSelfChart: false,
      chartList: [],
      once: {},
      store: {}
    }
  },
  computed: {
    // 图表延时的集合
    delay() {
      return {
        widthChangeDelay: this.widthChangeDelay,
        resizeDelay: this.resizeDelay
      }
    },

    size() {
      return {
        width: this.width,
        height: this.height
      }
    },

    // 图表参数的集合
    setting() {
      return {
        data: this.data,
        settings: this.settings,
        extend: this.extend,
        tooltipVisible: this.tooltipVisible,
        legendVisible: this.legendVisible
      }
    }
  },
  watch: {
    options: {
      handler() {
        this.refreshChart()
      },
      deep: true
    },
    setting: {
      handler() {
        this.refreshChart()
      },
      deep: true
    },
    events: {
      handler(val, oldVal) {
        this.addEvents(val)
        this.removeEvents(oldVal)
      },
      deep: true
    },
    initOptions: {
      handler(val) {
        this.initOpts = {
          ...this.initOpts,
          ...val
        }
        this.renderChart(this.huiChartOption)
      },
      deep: true
    },
    judgeWidth: {
      handler(val) {
        this.initOpts.domResize = val
        this.renderChart(this.huiChartOption)
      }
    },
    delay: {
      handler(val) {
        this.initOpts.resizeThrottle = val
        this.renderChart(this.huiChartOption)
      },
      deep: true
    },
    resizeable: {
      handler(val) {
        this.initOpts.windowResize = val
        this.renderChart(this.huiChartOption)
      }
    },
    setOptionOpts: {
      handler(val) {
        this.renderOption = val
      },
      deep: true
    },
    loading(val) {
      this.$nextTick(() => {
        if (val) {
          this.integrateChart.showLoading()
        } else {
          this.integrateChart.closeLoading()
        }
      })
    },
    dataEmpty(val) {
      this.$nextTick(() => {
        if (val) {
          this.integrateChart.showEmpty()
        } else {
          this.integrateChart.closeEmpty()
        }
      })
    },

    size: {
      handler(val) {
        this.$nextTick(() => {
          this.integrateChart && this.integrateChart.echartsIns && this.integrateChart.echartsIns.resize()
        })
      }
    },
    colors: {
      handler(val) {
        this.refreshChart()
      },
      deep: true
    }
  },
  methods: {
    selfSetting(options) {
      const echartsSettings = [
        'grid',
        'dataZoom',
        'visualMap',
        'toolbox',
        'title',
        'legend',
        'xAxis',
        'yAxis',
        'radar',
        'tooltip',
        'axisPointer',
        'brush',
        'geo',
        'timeline',
        'graphic',
        'series',
        'backgroundColor',
        'textStyle'
      ]
      echartsSettings.forEach((setting, index) => {
        const unwatch = this.watchToPropsEchartOptions[index]
        if (this[setting]) {
          if (!options.extend) {
            options.extend = {}
          }

          options.extend[setting] = cloneDeep(this[setting])
          !unwatch &&
            this.$watch(
              setting,
              () => {
                this.refreshChart()
              },
              {
                deep: true
              }
            )
        } else {
          unwatch && unwatch()
        }
      })
    },
    setAnimation(options) {
      if (this.animation) {
        Object.keys(this.animation).forEach((key) => {
          options.extend[key] = this.animation[key]
        })
      }
    },
    applyMarks(options) {
      // MarkArea、markLine、markPoint 判断
      if (this.markArea || this.markLine || this.markPoint) {
        const marks = {
          markArea: this.markArea,
          markLine: this.markLine,
          markPoint: this.markPoint
        }
        const { series } = options
        const setMark = (seriesItem, marks) => {
          Object.keys(marks).forEach((key) => {
            if (marks[key]) {
              seriesItem[key] = marks[key]
            }
          })
        }

        if (Array.isArray(series)) {
          series.forEach((item) => {
            setMark(item, marks)
          })
        } else if (isObject(series)) {
          setMark(series, marks)
        }
      }
    },
    applyExtend(huiChartOption) {
      if (this.extend) {
        return setExtend({
          huiChartOption,
          extend: this.extend
        })
      }
    },

    // 更新图表
    refreshChart() {
      const { data } = this
      if (Object.keys(this.options).length === 0) {
        this.updateChart(data)
      } else {
        this.huiChartOption = cloneDeep(this.options)
      }
      let huiChartOption = cloneDeep(this.huiChartOption)
      if (!huiChartOption.theme) {
        huiChartOption.theme = 'cloud-light'
      }
      if (Array.isArray(this.colors) && this.colors.length > 0) {
        huiChartOption.color = cloneDeep(this.colors)
      }
      clearTimeout(this.timer)
      this.timer = null
      this.timer = setTimeout(() => {
        if (this.afterConfig) {
          huiChartOption = this.afterConfig(optichartOptionon)
        }

        this.selfSetting(huiChartOption)
        this.setAnimation(huiChartOption)
        this.applyMarks(this.integrateChart.eChartOption)
        this.integrateChart.refresh(cloneDeep(huiChartOption))
        if (this.colorMode !== 'default') {
          huiChartOption.color = this.computedChartColor()
        }
        if (this.extend && Object.keys(this.extend).length !== 0) {
          huiChartOption.extend = this.applyExtend(this.integrateChart.eChartOption)
          this.integrateChart.refresh(cloneDeep(huiChartOption))
        }
        this.$emit('handle-color', huiChartOption.color)
        if (this.afterSetOption) {
          this.afterSetOption(this.integrateChart.echartsIns)
        }
        this.$emit('ready', this.integrateChart.echartsIns, huiChartOption)
      }, this.changeDelay)
      this.eChartOption = this.integrateChart.eChartOption
    },

    // 初始渲染图表
    renderChart(huiChartOption) {
      // 设置默认theme为'cloud-light'
      if (!huiChartOption.theme) {
        huiChartOption.theme = 'cloud-light'
      }

      // 将外部colors放入配置项中
      if (Array.isArray(this.colors) && this.colors.length > 0) {
        huiChartOption.color = cloneDeep(this.colors)
      }
      const plugins = this.plugins || {}

      // 判断是否为huicharts自定义图表
      if (this.isSelfChart) {
        this.integrateChart.init(this.$refs.chartRef)
        if (this.colorMode !== 'default') {
          huiChartOption.color = this.computedChartColor()
        }
        this.integrateChart.setSimpleOption(this.chartList[this.iChartName], huiChartOption, plugins)
        this.$emit('handle-color', huiChartOption.color)
      } else {
        this.selfSetting(huiChartOption)
        this.setAnimation(huiChartOption)

        // theme为ecahrts主题参数
        const theme = this.themeName || this.theme || DEFAULT_THEME
        this.integrateChart.init(this.$refs.chartRef, this.initOpts, theme)

        // 通过colorMode参数控制颜色
        if (this.colorMode !== 'default') {
          huiChartOption.color = this.computedChartColor()
        }
        this.integrateChart.setSimpleOption(this.iChartName, cloneDeep(huiChartOption), plugins)
        this.$emit('handle-color', huiChartOption.color)
        this.applyMarks(this.integrateChart.eChartOption)
      }

      // 判断extend，将extend放入配置项中
      if (this.extend && Object.keys(this.extend).length !== 0) {
        huiChartOption.extend = this.applyExtend(this.integrateChart.eChartOption)
        this.integrateChart.setSimpleOption(this.iChartName, cloneDeep(huiChartOption), plugins)
      }
      this.integrateChart.render(this.renderOption)

      // 返回图表实例
      this.$emit('ready', this.integrateChart.echartsIns, huiChartOption)

      // 返回图表实例(仅一次)
      if (!this.once['ready-once']) {
        this.once['ready-once'] = true
        this.$emit('ready-once', this.integrateChart.echartsIns, huiChartOption)
      }

      // 赋值echartOption，方便用户获取
      this.eChartOption = this.integrateChart.eChartOption
    },
    addEvents(val) {
      if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) {
        const events = Object.keys(val)
        this.$nextTick(() => {
          events.forEach((item) => {
            this.integrateChart.on(item, val[item])
          })
        })
      }
    },
    removeEvents(oldVal) {
      if (typeof oldVal === 'object' && oldVal !== null && Object.keys(oldVal).length > 0) {
        const events = Object.keys(oldVal)
        this.$nextTick(() => {
          events.forEach((item) => {
            this.integrateChart.on(item, oldVal[item])
          })
        })
      }
    },
    resize() {
      if (!this.cancelResizeCheck) {
        this.integrateChart.echartsIns.resize()
      }
    },
    afterConfigFn(huiChartOption) {
      if (this.afterConfig) {
        huiChartOption = this.afterConfig(huiChartOption)
        this.huiChartOption = huiChartOption
      }
      return huiChartOption
    },
    beforeConfigFn(data) {
      if (this.beforeConfig) {
        data = this.beforeConfig(data)
      }
      return data
    },
    isStack() {
      let {
        settings: { stack },
        data: { columns }
      } = this
      let flag = false

      if (typeof stack !== 'object' || !Array.isArray(columns)) return flag

      Object.keys(stack).forEach((key) => {
        stack[key].forEach((stackItem) => {
          const isExist = columns.includes(stackItem)
          if (isExist) {
            flag = true
          }
        })
      })

      return flag
    },
    calcColors({ len, type, isStack }) {
      let SAAS_COLOR = SAAS_DEFAULT_COLORS
      let lastColor = '#1B3F86'
      if (isStack && type === '') {
        return len && len > 6 ? [lastColor].concat(SAAS_COLOR.slice(0, len - 1)) : SAAS_COLOR.slice(0, [len || 8])
      }
      if (!isStack && type === '') {
        type = 'default'
      }
      if (type === 'blue' || type === 'green') {
        SAAS_COLOR = SAAS_DEFAULT_SAME_COLORS[type]
          .slice(0, len)
          .sort((a, b) => a.idx - b.idx)
          .map((item) => item.color)
      }
      return len && len > 6 ? SAAS_COLOR.slice(0, len - 1).concat([lastColor]) : SAAS_COLOR.slice(0, [len || 8])
    },
    computedChartColor() {
      let defaultColors = DEFAULT_COLORS

      let flag = this.isStack()

      if (this.data && (Array.isArray(this.data.rows) || Array.isArray(this.data.columns))) {
        const { columns, rows } = this.data
        const len = Math.max(columns ? columns.length : 0, rows ? rows.length : 0)
        defaultColors = this.calcColors({ len, type: this.colorMode, isStack: flag })
      } else if (Array.isArray(this.data)) {
        defaultColors = this.calcColors({ len: this.data.length, type: this.colorMode, isStack: flag })
      } else if (this.extend && this.extend.series && Array.isArray(this.extend.series.data)) {
        defaultColors = this.calcColors({ len: this.extend.series.data.length, type: this.colorMode, isStack: flag })
      } else if (this.extend && Array.isArray(this.extend.series)) {
        defaultColors = this.calcColors({ len: this.extend.series.length, type: this.colorMode, isStack: flag })
      }
      return this.colors || (this.theme && this.theme.color) || defaultColors
    }
  },
  created() {
    this.huiChartOption = {}
    if (!this.selfChart.includes(this.iChartName)) {
      this.isSelfChart = false
      this.integrateChart = new IntegrateChart()
    } else {
      this.isSelfChart = true
      this.chartList = {
        BaiduMapChart,
        AutonaviMapChart
      }
      this.integrateChart = new this.chartList[this.iChartName]()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.addEvents(this.events)
      this.loading && this.integrateChart.showLoading()

      this.dataEmpty && this.integrateChart.showEmpty()
    })
    this.initOpts = {
      ...this.initOptions,
      domResize: this.judgeWidth,
      resizeThrottle: this.widthChangeDelay
    }
    let { data } = this
    data = this.beforeConfigFn(data)
    if (Object.keys(this.options).length === 0) {
      this.updateChart(data)
    } else {
      this.huiChartOption = cloneDeep(this.options)
    }
    let { huiChartOption } = this
    huiChartOption = this.afterConfigFn(huiChartOption)

    this.renderChart(huiChartOption)

    this.afterSetOption && this.afterSetOption(this.integrateChart.echartsIns)

    this.afterSetOptionOnce && this.afterSetOptionOnce(this.integrateChart.echartsIns)
  },
  beforeUnmount() {
    this.watchToPropsEchartOptions.forEach((unwatch) => {
      unwatch && unwatch()
    })
  }
}
