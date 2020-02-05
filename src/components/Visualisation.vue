<template>
  <div class="visualisation">
    <h3>{{ file.name }}</h3>
    <h5>Overview</h5>
    <div class="row">
      <Plot class="col s5" :key="index" :plotData="data" v-for="(data, index) in createOverview"></Plot>
    </div>
    <br>
  </div>
</template>

<script>
import { createPlot, PlotTypes } from "../preprocessing/plotCreation";
import Plot from "./Plot";

export default {
  name: 'Visualisation',
  components: {
    Plot
  },
  props: {
    file: Object
  },
  computed: {
    createOverview() {
      return createPlot(this.file, PlotTypes.showPipeline)
    }
  }
}

</script>