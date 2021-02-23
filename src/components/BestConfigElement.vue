<template>
  <div
       v-bind:class="[depth == 0 ? 'fixedWidth' : '', 'bestConfigElement']">
    <div v-bind:class="separator == 'OR' && simpleChildren.length == 0 ?
                       'config-background-gray' : 'config-background-wrapper'" :style="darkeningStyle">
        <p v-if="complexChildren.length > 0" class="configItemHeaderComplex">
          <span class="photon-elements-praefix">{{ configDict.class}}</span>:{{configDict.name}}
        </p>
        <p v-else class="configItemHeader" >{{configDict.name}}</p>
        <div class="simpleContent" v-for="(child, index) in simpleChildren" :key="index">
          <div>
            <div class="col m8 simpleContentKey truncate"><p>{{child.name}}</p></div>
            <div class="col m4 simpleContentValue truncate"><p>{{croppedValue(child.value)}}</p></div>
          </div>
        </div>
        <div class="complexWrapper">
          <BestConfigElement v-for="(child, index) in complexChildren" :key="index"
                             :config-dict="child" :depth="depth + 1"
                             :last-item="index == complexChildren.length - 1 ? true : false"
                             :separator="configDict.class == 'SWITCH' ? 'OR' :
                                         configDict.class == 'STACK' ? 'AND' :
                                         configDict.class == 'BRANCH' ? 'b': ''" >
          </BestConfigElement>
        </div>
    </div>

    <div v-if="!this.lastItem && this.separator=='b'" class="separator-div-icon">
      <i class="material-icons" >arrow_downwards</i>
    </div>
    <div v-if="!this.lastItem && this.separator!='b'" class="separator-div">{{this.separator}}</div>
  </div>

</template>

<script>
export default {
  name: "BestConfigElement",
  components: {},
  props: {
    configDict: Object,       // Pattern: Normalised config
    depth: Number,             // depth of element. Default / upper level is 0.
    separator: String, // how elements in the parents are related (OR, AND, or in sequence (->))
    lastItem: Boolean // if this is the last element in the switch, stack or branch
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
    photonElements(){
      return ["SWITCH", "BRANCH", "STACK"]
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
    float: left;
  }
  .bestConfigElement:last-child{
    margin-bottom: 10px;
  }
  .fixedWidth{
    min-width: 230px;
  }
  .separator-div{
    margin: 0px;
    padding: 5px 2px;
    font-size: 0.8rem;
    font-style: italic;
  }
  .separator-div-icon{
    margin: 5px 0px 0px 0px;
    padding: 0px;
  }
  .config-background-wrapper{
    background-color: var(--photon-white);
    padding: 5px 15px 5px 15px;
  }
  .config-background-gray{
    background-color: #dddce1;
    padding: 5px 15px 5px 15px;
    text-decoration: line-through;
  }

  .configItemHeader {
    font-weight: bold;
    margin: 5px 0px 5px 0px;
  }
  .configItemHeaderComplex{
    margin: 5px 0px 5px 0px;
    /*text-transform: uppercase;*/
    font-size: 0.8em;
    color: var(--photon-gray);
  }
  .photon-elements-praefix{
    font-weight: bold;
    font-style: italic;
    margin-right: 5px;
  }

  .simpleContent {
    text-align: left;
    min-height: 25px;
    /*padding: 5px 0px;*/
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