<template>
  <div class="plt z-depth-1">
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
    plotData: Object
  },
  data: function() {
    return {
      unpackedData: {}
    };
  },
  methods: {
    // param: 'data' or 'layout' 
    getPlotData(neededType) {
      window.console.log('gePlotData: entry')
      let r = {}
      if (neededType == 'data')
        //r = this.unpackedData != {} ? this.unpackedData.data : this.unpackedData.data = this.plotData.toPlot().data;
        r = this.plotData.toPlot().data
      else if (neededType == 'layout')
        //r = this.unpackedData != {} ? this.unpackedData.layout : this.unpackedData.layout = this.plotData.toPlot().layout;
        r = this.plotData.toPlot().layout
      window.console.log(r)
      if (r == {})
        alert(`Error in Plot.vue::generatePlotData - value for parameter neededType unknown: ${neededType}`)
      return r
    }
  }
};
</script>

<style>
.plt {
  margin: 5px;
}
</style>
