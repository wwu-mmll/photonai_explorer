<template>
  <table class="foldTable">
    <thead>
      <tr>
        <th></th>
        <th>Accuracy</th>
        <th>Balanced Accuracy</th>
        <th>Precision</th>
        <th>Recall</th>
      </tr>
    </thead>
    <tbody v-for="(fold, index) in folds" :key="index">
        <tr @click="toggleRowExpansion(index)" :class="{ bestFold: metricsEqual(fold.best_config.best_config_score.validation.metrics, bestFoldMetrics) }">
          <td>Fold {{ fold.fold_nr }}</td>
          <td>{{ fold.best_config.best_config_score.validation.metrics.accuracy }}</td>
          <td>{{ fold.best_config.best_config_score.validation.metrics.balanced_accuracy }}</td>
          <td>{{ fold.best_config.best_config_score.validation.metrics.precision }}</td>
          <td>{{ fold.best_config.best_config_score.validation.metrics.recall }}</td>
        </tr>
      <tr v-if="rowsOpened.includes(index)">
        <td colspan="5">
          <BestConfigDiagram :configDict="fold.best_config.human_readable_config"></BestConfigDiagram>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import BestConfigDiagram from "./BestConfigDiagram"

export default {
  name: "FoldTable",
  components: {
    BestConfigDiagram 
  },
  props: {
    /* Expects an array of outer folds.  */
    folds: Array,
    bestFoldMetrics: Object
  },
  data: function() {
    return {
      rowsOpened: []
    }
  }, 
  methods: {
    toggleRowExpansion(id) {
      let index = this.rowsOpened.indexOf(id)

      if (index > -1) this.rowsOpened.splice(index, 1)
      else this.rowsOpened.push(id)
    }, 
    metricsEqual(m1, m2) {
      let metricsToCompare = ["accuracy", "precision", "recall", "balanced_accuracy"]
      for (let i = 0; i < metricsToCompare.length; i++) {
        const metric = metricsToCompare[i];
        
        if (m1[metric] !== m2[metric]) {
          return false
        }
      }
      return true
    }
  }
};
</script>

<style>
  .bestFold {
    background-color: var(--photon-light-blue);
  }
</style>