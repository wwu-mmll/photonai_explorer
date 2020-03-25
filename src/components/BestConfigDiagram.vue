<template>
  <div class="bestConfigDiagram">
    <div class="elemWrapper" v-for="(elem, index) in configList" :key="index">
      <BestConfigElement :configDict="elem" :depth="1"></BestConfigElement>
      <i v-if="(index + 1) != configList.length" class="material-icons medium">arrow_forward</i>
    </div>
    <div style="clear:both;"></div>
  </div>
  
</template>

<script>
import BestConfigElement from "./BestConfigElement";

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
    /* Convert human readable config to pattern: [{conf_name: ABC, attributes: ["key: value", ...]}, ...] */
    for (let [key, value] of Object.entries(this.configDict)) {
      let entry = {conf_name: key, attributes: []}
      for (let attribute of value) {
        entry.attributes.push(this.normaliseAttribute(attribute))
      }
      this.configList.push(entry)
    }
  }
};
</script>

<style>
  .elemWrapper {
    float: left;
  }
</style>