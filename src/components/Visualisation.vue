<template>
  <div id="visualisation">
    <h3>{{ file.name }}</h3>
    <div id="pipeline_structure">
      <h4>Pipeline structure coming soon? Maybe? Probably?</h4>
    </div>

    <div id="overview_plots">
      <h4>Overview</h4>
      <div class="row">
        <div class="col s12 l6">
          <Plot :plotData="overviewPlot[0]"></Plot>
        </div>
        <div class="col s12 l6">
          <Plot :plotData="overviewPlot[1]"></Plot>
        </div>
      </div>
    </div>

    <div class="bestconfComplete">
      <h4>Best configuration</h4>
      <BestConfigDiagram :configDict="file.best_config.human_readable_config"></BestConfigDiagram>
    </div>

    <div id="table_testing">
      <h4>Fold comparison</h4>
      <FoldTable :folds="file.outer_folds" :bestFoldMetrics="file.best_config.best_config_score.validation.metrics"></FoldTable>
    </div>

  </div>
</template>

<script>
import { createPlot, PlotTypes } from "../preprocessing/plotCreation";
import Plot from "./Plot";
import FoldTable from "./FoldTable"
import BestConfigElement from "./BestConfigElement"
import BestConfigDiagram from "./BestConfigDiagram"

export default {
  name: "Visualisation",
  components: {
    Plot, 
    FoldTable,
    //BestConfigElement,
    BestConfigDiagram
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
    window.console.log("All done extracting data")
  }
};
</script>
