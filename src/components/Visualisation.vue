<template>
  <div class="viz">
    <div class="vizHeader row">
      <h1>{{ pipeName }}</h1>
      <div class="analysis_info">
        <p>
          Computation finished {{new Date(this.file.computation_end_time["$date"]).toLocaleString()}} after ~
          {{Math.ceil(Math.abs(
            new Date(this.file.computation_end_time["$date"]).getTime() -
            new Date(this.file.computation_start_time["$date"]).getTime()) / 1000 / 60)}} minutes
          with {{this.file.hyperpipe_info.data.X_shape[0]}} samples
          and {{this.file.hyperpipe_info.data.X_shape[1]}} features.
        </p>
<!--          <p><b>Outer Fold Split:</b> {{ file.hyperpipe_info.cross_validation.OuterCV }}</p>-->
<!--          <p><b>Inner Fold Split:</b> {{ file.hyperpipe_info.cross_validation.InnerCV }}</p>-->
      </div>
    </div>


    <div class="row">
        <h2>Best Hyperparameter configuration</h2>
        <p class="description"> The best hyperparameter configuration was chosen by
          {{this.file.hyperpipe_info.maximize_best_config_metric ? "maximizing": "minimizing"}}
          {{this.file.hyperpipe_info.best_config_metric}}.</p>
        <BestConfigDiagram :config-dict="file.best_config.human_readable_config"
                           :pipeline-structure="file.hyperpipe_info.elements"></BestConfigDiagram>
    </div>


    <div class="row" style="margin-top: 100px;">
        <h2>Performance</h2>
        <p class="description">Here you see the performance mean of the best hyperparameter configuration of
          all outer folds, respectively. <br>
          For comparison, the baseline dummy performance is outlined in black.</p>
        <PerformancePlots :file="file"></PerformancePlots>
    </div>

    <div class="row">
        <div class="configItemHeader">
          <div class="fold-information">
            <h2>Outer Folds</h2>
            <p class="description"> Inspect the performance metrics of the best hyperparameter configuration of each outer fold
              as scored on the test set. Click to see the best hyperparameter configuration found. </p>
          </div>
<!--            <a @click="showFoldTable = !showFoldTable" href="#" class="btn-flat expansionBtn">-->
<!--              <i class="material-icons" style="font-size: 3rem">{{ foldInfoButtonText }}</i>-->
<!--            </a>-->
        </div>
        <FoldTable style="float: none" v-show="showFoldTable" :best-config-metric="file.hyperpipe_info.best_config_metric"
                   :bestFoldMetrics="file.best_config.best_config_score.validation.metrics"
                   :folds="file.outer_folds" :max-metric-count="99"
                   :hyperpipe-info="file.hyperpipe_info" ></FoldTable>

    </div>

    <div class="row" style="margin-top: 100px;">
      <div class="col m8 s12">
        <h2 v-if="file.hyperpipe_info.estimation_type=='classifier'">Confusion matrix</h2>
        <h2 v-else>Predictions</h2>
        <Confusion :file="file"></Confusion>
      </div>
    </div>

    <div class="row">
      <h2>Hyperparameter Optimization Progress</h2>
      <p class="description"> Hyperparameters were optimized by <b>{{ file.hyperpipe_info.optimization.Optimizer }} optimizer</b>
        with {{ file.hyperpipe_info.optimization.OptimizerParams}}</p>
      <div class="col m6 s12">
        <OptimisationHistory :file="file"></OptimisationHistory>
      </div>
    </div>

    <!-- One column once again -->
    <TestedConfigTable class="configTable" :max-metric-count="0"
                       :folds="file.outer_folds" :hyperpipe-info="file.hyperpipe_info"></TestedConfigTable>
  </div>
</template>

<script>
  import BestConfigDiagram from "./BestConfigDiagram";
  import FoldTable from "./FoldTable";
  import TestedConfigTable from "./TestedConfigTable";
  import PerformancePlots from "./PerformancePlots";
  import Confusion from "./Confusion";
  import OptimisationHistory from "./OptimisationHistory";

  export default {
    name: "NewVisualisation",
    components: {
      BestConfigDiagram,
      FoldTable,
      TestedConfigTable,
      PerformancePlots,
      Confusion,
      OptimisationHistory
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

  .fold-information p{
    margin: 0px;
  }
  .fold-information{
    margin-bottom: 20px;
  }


</style>