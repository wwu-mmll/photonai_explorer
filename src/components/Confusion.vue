<template>
  <Plotly :data="data.validation.data" :layout="data.validation.layout"></Plotly>
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