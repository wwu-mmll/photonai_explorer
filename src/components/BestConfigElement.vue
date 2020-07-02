<template> 
  <div
       v-bind:class="[depth == 0 ? 'fixedWidth' : '', 'bestConfigElement']"
        :style="darkeningStyle">
    <p v-bind:class="[complexChildren.length > 0 ?  'configItemHeaderComplex': 'configItemHeader']">
      {{ configDict.name }}
    </p>
    <div class="simpleContent" v-for="(child, index) in simpleChildren" :key="index">
      <div >
        <div class="col m8 simpleContentKey truncate"><p>{{child.name}}</p></div>
        <div class="col m4 simpleContentValue truncate"><p>{{croppedValue(child.value)}}</p></div>
      </div>
    </div>
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
  methods:{
    croppedValue(val){
      if (isNaN(val))
      {
        return val;
      }
      else{
        let nr = Number(val)
        if (Number.isInteger(nr))
        {
          return val;
        }
        else{
          return Number(val).toFixed(4).toString();
        }
      }
    }
  },
  computed: {
    /**
     * Darken element by 10% every depth level
     */
    darkeningStyle() {
      return {filter: `brightness(${100 - 10 * this.depth}%)`};
    },
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
    background-color: var(--photon-white);
    float: left;

    padding: 5px 15px 15px 15px;
    margin-top: 5px;
    margin-bottom: 20px;
  }
  .fixedWidth{
    min-width: 230px;
  }

  .configItemHeader {
    font-weight: bold;
    margin: 5px 0px 5px 0px;
  }
  .configItemHeaderComplex{
    margin: 5px 0px 5px 0px;
    text-transform: uppercase;
    font-size: 0.8em;
    color: var(--photon-gray);
  }

  .simpleContent {
    text-align: left;
    min-height: 15px;
  }
  .simpleContent p{
    margin: 0px;
  }
  .simpleContentKey{
    font-style: italic;
    text-align: right;
  }
  .simpleContentValue p{
    margin-left: 10px;
    font-size: 0.85rem;
    padding-top: 3px;
  }

  hr {
    border: 1px solid var(--photon-gray);
    margin: 0px;
  }

  .complexWrapper > .bestConfigElement {
    float: none;
  }
</style>