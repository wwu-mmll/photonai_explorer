<template>
  <div class="viz">
    <div class="vizHeader row">
      <div class="col s12">
        <h1>{{ pipeName }}</h1>
        <h5>{{ pipeDate }}</h5>
      </div>
    </div>


    <div class="row">
      <div class="col m7 s12">
        <h2>Best Hyperparameter configuration</h2>
        <BestConfigDiagram :config-dict="file.best_config.human_readable_config"></BestConfigDiagram>
      </div>
      <div class="col m4 offset-m1 s12">
        <h2>Cross Validation</h2>
        <p><b>Outer Fold:</b> {{ file.hyperpipe_info.cross_validation.OuterCV }}</p>
        <p><b>Inner Fold:</b> {{ file.hyperpipe_info.cross_validation.InnerCV }}</p>
      </div>
    </div>

    <div class="row">
      <div class="col s12">
        <h2>Performance</h2>
        <PerformancePlots :file="file"></PerformancePlots>
      </div>

    </div>
    <div class="row">
      <div class="col m6 s12">
        <h2>Confusion matrix</h2>
        <Confusion :file="file"></Confusion>
      </div>
      <div class="col m5 offset-m1 s12">
        <h2>Optimization Progress</h2>
      </div>
    </div>

    <div class="row">
      <div class="col s12">
        <div class="configItemHeader">
          <h2>Fold Information</h2>
          <a @click="showFoldTable = !showFoldTable" href="#" class="btn-flat expansionBtn">
            <i class="material-icons" style="font-size: 3rem">{{ foldInfoButtonText }}</i>
          </a>
        </div>
        <FoldTable style="float: none" v-show="showFoldTable" :best-config-metric="file.hyperpipe_info.best_config_metric"
                   :bestFoldMetrics="file.best_config.best_config_score.validation.metrics" :folds="file.outer_folds" :max-metric-count="99"></FoldTable>
      </div>
    </div>

    <!-- One column once again -->
    <TestedConfigTable class="configTable" :max-metric-count="0" :folds="file.outer_folds"></TestedConfigTable>
  </div>
</template>

<script>
  import BestConfigDiagram from "./BestConfigDiagram";
  import FoldTable from "./FoldTable";
  import TestedConfigTable from "./TestedConfigTable";
  import PerformancePlots from "./PerformancePlots";
  import Confusion from "./Confusion";

  export default {
    name: "NewVisualisation",
    components: {
      BestConfigDiagram,
      FoldTable,
      TestedConfigTable,
      PerformancePlots,
      Confusion
    },
    props: {
      file: Object
    },
    data: function() {
      return {
        showFoldTable: true
      }
    },
    computed: {
      /**
       * Returns name of this pipe
       */
      pipeName() {
        return this.file.name;
      },
      /**
       * Returns creation date of this pipe
       */
      pipeDate() {
        let unixTime = this.file.computation_end_time["$date"];
        return new Date(unixTime).toLocaleString();
      },
      /**
       * Returns button text for expand / collapse button controlling FoldTable visibility
       */
      foldInfoButtonText() {
        return this.showFoldTable ? "expand_less" : "expand_more";
      }
    },
    mounted() {
      M.AutoInit();
    }
  }
</script>

<style scoped>

  .vizHeader h1{
    margin-bottom: 5px;
  }
  .vizHeader{
    margin-bottom: 20px;
  }

  a.expansionBtn {
    margin-top: 1.52rem;
  }

  .configTable {
    margin-top: 100px;
  }
  .configItemHeader{
    display: flex;
    justify-content: space-between;
  }


</style>