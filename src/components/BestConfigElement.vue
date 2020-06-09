<template> 
  <div class="bestConfigElement" :style="darkeningStyle">
    <p class="header"><u>{{ configDict.name }}</u></p>
    <p class="simpleContent" v-for="(child, index) in simpleChildren" :key="index">{{child.name}} = {{child.value}}</p>
    <hr v-if="complexChildren.length > 0">
    <div class="complexWrapper">
      <BestConfigElement v-for="(child, index) in complexChildren" :key="index" :config-dict="child" :depth="depth + 1"></BestConfigElement>
    </div>
  </div>
</template>

<script>
export default {
  name: "BestConfigElement",
  components: {},
  props: {
    configDict: Object,       // Pattern: Normalised config
    depth: Number             // depth of element. Default / upper level is 0.
  }, data: function() {
    return {
      simpleChildren: [],     // Objects of type 'value'
      complexChildren: []     // Objects of type 'parent' -> further recursion
    }
  },
  computed: {
    /**
     * Darken element by 10% every depth level
     */
    darkeningStyle() {
      return {filter: `brightness(${100 - 10 * this.depth}%)`};
    }
  },
  created() {
    // separate simple from complex children
    for (const element of this.configDict.value) {
      if (element.type === "value")
        this.simpleChildren.push(element);
      else
        this.complexChildren.push(element);
    }
  }
};
</script>

<style scoped>
  .bestConfigElement {
    background-color: var(--photon-blue);
    float: left;
  }

  .header {
    margin-left: 1em;
    margin-right: 1em;
    margin-block-start: .5em;
  }

  .simpleContent {
    margin-left: 1em;
    margin-right: 1em;
    margin-block-start: 0;
    margin-block-end: .5em;

    text-align: left;
  }

  hr {
    margin-left: 1em;
    margin-right: 1em;
    border: 1px solid var(--photon-very-dark);
  }

  .complexWrapper > .bestConfigElement {
    margin-left: 1em;
    margin-right: 1em;
    float: none;
  }
</style>