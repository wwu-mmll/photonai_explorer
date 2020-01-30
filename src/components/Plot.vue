<template>
  <div class="plt z-depth-1">
    <Plotly :data="data" :layout="layout" :display-mode-bar="false"></Plotly>
  </div>
</template>

<script>
import { Plotly } from "vue-plotly";
import { bla } from "@src/preprocessing/plotCreation";

export default {
  components: {
    Plotly
  },
  name: "Plot",
  props: {
    plotConfig: Object,
    files: Array
  }, 
  data: {
    data: [],
    layout: []
  },
  computed: {
    updatePlot() {
      let
    }
  }
};
</script>

<style>
.plt {
  margin: 5px;
}
</style>
