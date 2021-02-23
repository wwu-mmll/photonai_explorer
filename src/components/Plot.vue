<template>
  <div class="plt">
    <Plotly :data="getPlotData('data')" :layout="getPlotData('layout')" :display-mode-bar="false"></Plotly>
  </div>
</template>

<script>
import { Plotly } from "vue-plotly";

export default {
  components: {
    Plotly
  },
  name: "Plot",
  props: {
    plotData: Object,
    transparentBg: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data: function() {
    return {
      transparency: {paper_bgcolor: "rgba(0, 0, 0, 0)", plot_bgcolor: "rgba(0, 0, 0, 0)"}
    };
  },
  methods: {
    // param: 'data' or 'layout' 
    getPlotData(neededType) {
      //window.console.log('gePlotData: entry')
      let r = {}
      if (neededType === 'data')
        r = this.plotData.toPlot().data
      else if (neededType === 'layout') {
        r = this.plotData.toPlot().layout;
        if (this.transparentBg)
          Object.assign(r, this.transparency)
      }

      if (r === {})
        window.console.log(`Error in Plot.vue::generatePlotData - value for parameter neededType unknown: ${neededType}`)
      return r
    }
  }
};
</script>

<style>
.plt {
  margin: 0px 0px -20px 0px;
}
</style>
