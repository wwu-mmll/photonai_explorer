<template>
  <div class="bestConfigDiagram">
    <div class="elemWrapper" v-for="(elem, index) in configList" :key="index">
      <BestConfigElement :configDict="elem" :depth="0"></BestConfigElement>
      <i v-if="(index + 1) !== configList.length" class="material-icons medium">arrow_forward</i>
    </div>
    <div style="clear:both;"></div>
  </div>
  
</template>

<script>
import BestConfigElement from "./BestConfigElement";
import { normalizeConfig } from "../preprocessing/configInterpreter";


export default {
  name: "BestConfigDiagram",
  components: {
    BestConfigElement
  },
  props: {
    /* Expects object from result file: outer_folds[x].best_config.human_readable_config */
    configDict: Object
  },
  data: function() {
    return {
      configList: []
    }
  },
  methods: {
    /* Alter value from human_readable_config to look properly. May need nested object handling in the future. */
    normaliseAttribute(attrString) {
      return attrString.replace('=', ': ')
    }
  },
  created() {
    /* Create normalised config and split it by :root values to supply to BestConfigElements */
    let normalisedConfig = normalizeConfig(this.configDict);
    this.configList = normalisedConfig.value;
  }
};
</script>

<style>
  .elemWrapper {
    float: left;
  }
</style>