<template>
  <div class="visualisation">
    <h3>{{ file.name }}</h3>
    <!-- Plots from hyperpipe.py -->
    <div id="hyperpipe">
      <h4>Overview</h4>
      <Plot :plotData="overviewPlot"></Plot>
      <h5>Folds</h5>
      <div class="row">
        <div class="col s12">
          <ul class="tabs">
            <li
              class="tab col s4"
              :key="index"
              v-for="(data, index) in foldPlots"
            >
              <a class="active" :href="'#plot' + index">Fold {{ index + 1 }}</a>
            </li>
          </ul>
        </div>
        <br /><br />
        <div
          :id="'plot' + index"
          v-for="(data, index) in foldPlots"
          :key="index"
        >
          <Plot :plotData="data"></Plot>
        </div>
      </div>
    </div>

    <!-- Plots from outerfold.py -->
    <div id="outerfold">
      <h4>Outer folds ({{ this.file.outer_folds.length }})</h4>
      <div :id="'of-' + index" :key="index" v-for="(fold, index) in outerFolds">
        <h5>Fold {{ index + 1 }}</h5>
        <Plot :plotData="data" :key="innerIndex" v-for="(data, innerIndex) in fold.allInclusive"></Plot>
      </div>
    </div>
    <br />
  </div>
</template>

<script>
import { createPlot, PlotTypes } from "../preprocessing/plotCreation";
import Plot from "./Plot";

export default {
  name: "Visualisation",
  components: {
    Plot
  },
  props: {
    file: Object
  },
  data: function() {
    return {
      overviewPlot: {},
      foldPlots: [],
      outerFolds: []
    };
  },
  mounted() {
    // eslint-disable-next-line
    M.AutoInit();
  },
  created() {
    let hyperpipePlots = createPlot(this.file, {type: PlotTypes.showPipeline});
    this.overviewPlot = hyperpipePlots.overview;
    this.foldPlots = hyperpipePlots.bestConfigs;

    for (let i = 1; i <= this.file.outer_folds.length; i++) {
      this.outerFolds.push(createPlot(this.file, {type: PlotTypes.showOuterFold, foldNo: i}))
    }
  }
};
</script>
