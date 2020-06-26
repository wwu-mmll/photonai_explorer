<template>
  <div class="performancePlots row">
    <Plot v-for="(value, key) in plotData" :key="key" :plot-data="value"></Plot>
  </div>
</template>

<script>
  import Plot from "./Plot";
  import { plotPerformance } from "../preprocessing/plotCreation"

  export default {
    name: "PerformancePlots",
    components: {
      Plot
    },
    props: {
      file: Object
    },
    data: function() {
      return {

      }
    },
    computed: {
      /**
       * Wrapper for caching of performance plots
       * @return {Object} Object containing metric names as keys and plot data as values
       */
      plotData() {
        return plotPerformance(this.file);
      }
    }
  }
</script>

<style scoped>
  .performancePlots {
    display: grid;
    grid-auto-columns: minmax(20rem, auto);
    grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  }
</style>