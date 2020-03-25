<template> 
  <div class="bestConfigElement left" style="text-align: center">
    <b><u>{{ configDict.conf_name }}</u></b>
    <br>
    <span class="confContent" v-for="(pair, index) in configDict.attributes" :key="index">
      {{ pair }} <br>
    </span>

  </div>
</template>

<script>
export default {
  name: "BestConfigElement",
  components: {},
  props: {
    /* Pattern: {conf_name: ABC, attributes: [{key: D, value: E}, ...]} supplied by BestConfigDiagram component */
    configDict: Object,
    depth: Number
  }
};
</script>

<style>
  .bestConfigElement {
    background-color: var(--photon-blue);
  }

  .confContent {
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 5px;
  }
</style>