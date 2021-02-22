<template>
  <div>
    <p v-if="bestFoldMetrics.length < getMetricNames.length" style="color: var(--photon-explorer-dark-pink)">
      Warning: Due to size restrictions this table is only showing {{ getMetricNames.length }} of {{
      Object.keys(bestFoldMetrics).length }} supplied metrics!
    </p>
    <table class="foldTable centered">
      <thead>
      <tr>
        <th>Outer Fold #</th>
        <th>Best Config</th>
        <th v-for="(metricName, index) in getMetricNames" :key="index"
            :class="{ bestConfigMetric: metricName === bestConfigMetric }">
          {{metricName}}
        </th>
      </tr>
      </thead>
      <tbody v-for="(fold, index) in folds" :key="index">
      <tr @click="toggleRowExpansion(index)"
          :class="{ bestFold: metricsEqual(fold.best_config.best_config_score.validation.metrics, bestFoldMetrics) }">
        <td>{{ fold.fold_nr }}</td>
        <td><span v-html="formatConfig(fold.best_config.human_readable_config)"></span></td>
        <td v-for="(metricName, index) in getMetricNames" :key="index">
          {{fold.best_config.best_config_score.validation.metrics[metricName] | formatMetric}}
        </td>
      </tr>
      <tr v-if="rowsOpened.includes(index)">
        <td :colspan="getMetricNames.length + 2"> <!-- +2 for Fold number column and config -->
          <BestConfigDiagram :configDict="fold.best_config.human_readable_config"></BestConfigDiagram>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import BestConfigDiagram from "./BestConfigDiagram"
  import {normalizeConfig, formatHRC} from "../preprocessing/configInterpreter";


  export default { // TODO: fix metric # restriction message: See TestedConfigTable for reference
    name: "FoldTable",
    components: {
      BestConfigDiagram
    },
    props: {
      /* Expects an array of outer folds.  */
      folds: Array,
      bestConfigMetric: String, /* String of metric used to determine best config */
      bestFoldMetrics: Object,  /* metrics of the best fold, to identify it. These keys are used as reference for what columns to use in table */
      maxMetricCount: Number, /* this value indicates how many metrics are displayed in the table TODO: How many are good? */
      hyperpipeInfo: Object
    },
    data: function () {
      return {
        rowsOpened: []
      }
    },
    methods: {
      /**
       * Adds given row to rowsOpened array to be given an expansion in template
       * @param id row index of row to expand
       */
      toggleRowExpansion(id) {
        let index = this.rowsOpened.indexOf(id)

        if (index > -1) this.rowsOpened.splice(index, 1)
        else this.rowsOpened.push(id)
      },

      /**
       * Compares all keys / values of the given objects. Does NOT compare recursively.
       * @param m1 First object to compare
       * @param m2 Second object to compare
       * @return {boolean} false if attributes do not match, else true
       */
      metricsEqual(m1, m2) {
        let metricsToCompare = this.getMetricNames;
        for (let i = 0; i < metricsToCompare.length; i++) {
          const metric = metricsToCompare[i];

          if (m1[metric] !== m2[metric]) {
            return false;
          }
        }
        return true;
      },
      /**
       * Properly formats given human readable config
       */
      formatConfig(human_readable_config) {
        return formatHRC(normalizeConfig(human_readable_config, this.hyperpipeInfo.elements));
      }
    },
    computed: {
      /**
       * Computed method that returns an array of all metric names (sorted alphabetically), limited in count by maxMetricCount
       * TODO: Ensure that deciding metric in always included. Location: hyperpipe_info.best_config_metric
       * @return {string[]}
       */
      getMetricNames() {
        return this.hyperpipeInfo.metrics.slice(0, this.maxMetricCount);
      }
    },
    filters: {
      formatMetric(value) {
        // window.console.log(`Filter called with value ${value}`);
        return value.toFixed(3);
      }
    }
  };
</script>

<style>
  .bestFold {
    background-color: var(--photon-light-blue);
  }

  .bestConfigMetric {
    color: var(--photon-light-blue);
  }
  .foldTable td{
    padding: 7px;
  }
</style>