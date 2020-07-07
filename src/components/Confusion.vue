<template>
  <div class="row">
    <div class="col s6">
      <Plotly :data="data.training.data" :layout="data.training.layout"></Plotly>
    </div>
    <div class="col s6">
      <Plotly :data="data.validation.data" :layout="data.validation.layout"></Plotly>
    </div>
  </div>

</template>

<script>
  import { Plotly } from "vue-plotly";
  import { plotBestConfigConfusion } from "../preprocessing/plotCreation";

  export default {
    name: "Confusion",
    components: {
      Plotly
    },
    props: {
      file: Object    // Complete pipe required
    },
    computed: {
      data() {
        return plotBestConfigConfusion(this.file);
      }
    }
  }
</script>

<style scoped>

</style>