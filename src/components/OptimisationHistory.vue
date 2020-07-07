<template>
  <div class="optHist">
    <Plotly :data="data.data" :layout="data.layout"></Plotly>
  </div>
</template>

<script>
  import { Plotly } from "vue-plotly";
  import { plotOptimizerHistory } from "../preprocessing/plotCreation";

  export default {
    name: "OptimisationHistory",
    components: {
      Plotly
    },
    props: {
      file: Object    // Complete pipe required
    },
    computed: {
      data() {
        return plotOptimizerHistory(this.file);
      }
    }
  }
</script>

<style scoped>

</style>