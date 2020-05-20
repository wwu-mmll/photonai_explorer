<template>
  <div>
    <p v-if="bestFoldMetrics.length !== getMetricNames.length" style="color: var(--photon-explorer-dark-pink)">
      Warning: Due to size restrictions this table is only showing {{ getMetricNames.length }} of {{
      Object.keys(bestFoldMetrics).length }} supplied metrics!
    </p>
    <table class="foldTable centered">
      <thead>
      <tr>
        <th>Fold #</th>
        <th v-for="(metricName, index) in getMetricNames" :key="index"
            :class="{ bestConfigMetric: metricName === bestConfigMetric }">
          {{metricName}}
        </th>
      </tr>
      </thead>
      <tbody v-for="(fold, index) in folds" :key="index">
      <tr @click="toggleRowExpansion(index)"
          :class="{ bestFold: metricsEqual(fold.best_config.best_config_score.validation.metrics, bestFoldMetrics) }">
        <td>Fold {{ fold.fold_nr }}</td>
        <td v-for="(metricName, index) in getMetricNames" :key="index">
          {{fold.best_config.best_config_score.validation.metrics[metricName] | formatMetric}}
        </td>
      </tr>
      <tr v-if="rowsOpened.includes(index)">
        <td :colspan="getMetricNames.length + 1"> <!-- +1 for Fold number column -->
          <BestConfigDiagram :configDict="fold.best_config.human_readable_config"></BestConfigDiagram>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import BestConfigDiagram from "./BestConfigDiagram"
  // TODO: Dynamic metrics all around (template headers + body + metricsEqual function). limit #metrics to 10-15? DONE?
  // TODO: Show best metric in table. Value style: %.3f
  export default {
    name: "FoldTable",
    components: {
      BestConfigDiagram
    },
    props: {
      /* Expects an array of outer folds.  */
      folds: Array,
      bestConfigMetric: String, /* String of metric used to determine best config */
      bestFoldMetrics: Object  /* metrics of the best fold, to identify it. These keys are used as reference for what columns to use in table */
    },
    data: function () {
      return {
        rowsOpened: [],
        maxMetricCount: 2 /* this value indicates how many metrics are displayed in the table TODO: How many are good? */
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
        let metricsToCompare = ["accuracy", "precision", "recall", "balanced_accuracy"] // TODO: Get dynamic metrics
        for (let i = 0; i < metricsToCompare.length; i++) {
          const metric = metricsToCompare[i];

          if (m1[metric] !== m2[metric]) {
            return false;
          }
        }
        return true;
      }
    },
    computed: {
      /**
       * Computed method that returns an array of all metric names (sorted alphabetically), limited in count by maxMetricCount
       * TODO: Ensure that deciding metric in always included. Where is that information located?
       * @return {string[]}
       */
      getMetricNames() {
        return Object.keys(this.bestFoldMetrics).sort().slice(0, this.maxMetricCount);
      }
    },
    filters: {
      formatMetric(value) {
        window.console.log(`Filter called with value ${value}`);
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
</style>