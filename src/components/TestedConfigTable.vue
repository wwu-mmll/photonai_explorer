<template>
  <div class="col s12">
    <div class="testedConfigTable row" style="margin-bottom: 0px">
      <h2 class="col s12 m6 left-align">Tested Configurations</h2>
      <div class="col s6 offset-m2 m4 searchBox">
        <h2>Search:</h2>
        <div class="input-field">
          <input autocomplete="off" id="autocomplete-input" v-model.lazy="currentSearchTerm" v-model="currentSearchTerm"
                 class="autocomplete no-autoinit" type="text">
        </div>
      </div>
    </div>

    <p v-if="metricCount !== metricNames.length" style="color: var(--photon-explorer-dark-pink)">
      Warning: Due to size restrictions this table is only showing {{ metricNames.length }} of {{
      metricCount }} supplied metrics!
    </p>

    <table class="responsive-table">
      <thead>
      <tr>
        <th @click="sortTable('foldID')">
          Fold#
        </th>
        <th @click="sortTable('configID')">
          Config#
        </th>
        <th @click="sortTable('configString')">
          Config
        </th>
        <th @click="sortTable(metricName)" v-for="(metricName, index) in metricNames" :key="index">
          {{ metricName }}
        </th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="(row, rowIndex) in getSortedTable()" :key="rowIndex">
        <td v-for="(value, name, index) in row" :key="index">
          <span v-if="name !== 'tctMetadata'" v-html="formatTableCell(value)"></span>
        </td>
      </tr>
      </tbody>
    </table>

    <div class="tableControllers">
      <a class="btn tooltipped" data-position="bottom" data-tooltip="Min (5)"
         @click="alterRowCount(Number.MIN_SAFE_INTEGER)">
        <i class="material-icons">fast_rewind</i>
      </a>
      <a class="btn tooltipped" data-position="bottom" data-tooltip="Less (5)" @click="alterRowCount(-5)">
        <i class="material-icons">arrow_upward</i>
      </a>
      <a class="btn tooltipped" data-position="bottom" data-tooltip="More (5)" @click="alterRowCount(5)">
        <i class="material-icons">arrow_downward</i>
      </a>
      <a class="btn tooltipped" data-position="bottom" :data-tooltip="'Max (' + rowsShown.maxCount + ')'"
         @click="alterRowCount(Number.MAX_SAFE_INTEGER)">
        <i class="material-icons">fast_forward</i>
      </a>
    </div>

  </div>


</template>

<script>

  import {normalizeConfig, formatHRC, getAttributes} from "../preprocessing/configInterpreter"

  export default {
    name: "TestedConfigTable",
    props: {
      folds: Array,           // An array of folds as found in file.outer_folds
      maxMetricCount: Number  // Number of metrics shown in table. A value < 1 shows all
    },
    data() {
      return {
        rawData: [],
        currentSortRow: "foldID",               // column name to sort by
        currentSortDir: "ASC",                  // current sorting direction: ASC or DESC
        currentSearchTerm: "",                  // content of searchbar
        rowsShown: {                            // Object to manage stats for # shown rows. NOT FOR DIRECT USE! Use computed property 'shownRowsCount
          minCount: 5,                        // # rows shown if MIN is pressed
          currentCount: 5,                    // actual count. Manipulated by setters, read by computed property
          maxCount: 100                       // # rows shown if MAX is pressed. 100 is a placeholder and the actual value is set in created() call
        }
      }
    },
    methods: {
      /**
       * Function to extract mean metrics from all metrics.
       * @param {Object[]} metricList Array of metric object as seen in ...tested_config_list.metrics_*
       * @return {Object} Object containing mean value of all metrics passed in input.
       */
      extractMeanMetrics(metricList) {
        let rMetrics = {};
        metricList.forEach(metric => {
          if (metric.operation.endsWith(".MEAN") && this.metricNames.includes(metric.metric_name))
            rMetrics[metric.metric_name] = metric.value
        })

        return rMetrics;
      },
      /**
       * Set row to be sorted by and direction. Property change triggers actual sorting
       */
      sortTable(row) {
        if (row === this.currentSortRow)
          this.currentSortDir = this.currentSortDir === 'ASC' ? 'DESC' : 'ASC';

        this.currentSortRow = row;
      },
      /**
       * Returns a sorted and filtered version of rawData according to current sorting properties.
       * Also controls the number of rows shown.
       */
      getSortedTable() {
        let filter = row => row.configString.toLowerCase().includes(this.normalisedSearchTerm); // default basic filter
        let replaceAll = (target, search, replacement) => {
          return target.replace(new RegExp(search, 'g'), replacement);
        };

        if (this.normalisedSearchTerm.startsWith("$")) {
          // adv search
          let evalQuery = replaceAll(this.currentSearchTerm, "\\$", "this.") // dont use normalised searach term bc some attributes are case sensitive

          filter = row => {
            let rowCopy = Object.assign({}, row); // create working copy to not mess with table creation
            // create aliases for row config. From 'configString' to:
            rowCopy.config = rowCopy.configString;
            rowCopy.Config = rowCopy.configString;
            // expose attributes
            Object.assign(rowCopy, getAttributes(row.tctMetadata.normalisedConfig))
            try {
              return ((str) => eval(str)).call(rowCopy, evalQuery) // TODO remove need to write $xyz: 'this' to context without 'with' bc deprecated?
            } catch (error) {
              return false;
            }
          }
        }

        // regular text search
        return this.rawData.filter(filter)
          .sort((a, b) => {
            let modifier = 1;
            if (this.currentSortDir === 'DESC') modifier = -1;
            if (a[this.currentSortRow] < b[this.currentSortRow]) return -1 * modifier;
            if (a[this.currentSortRow] > b[this.currentSortRow]) return 1 * modifier;
            return 0;
          }).slice(0, this.shownRowsCount)
      },
      /**
       * Filter that limits floating point values to 3 fraction digits and lets everything else pass.
       * @param value Value to format
       * @return Either formatted float or whatever was passed in.
       */
      formatNumericValue(value) {
        if (!isNaN(parseFloat(value)) && !Number.isInteger(value)) {
          return value.toFixed(3);
        }
        return value;
      },
      /**
       * Returns the input string with the first occurance of the current search term coloured in specified colour
       * @param {String} input String to be searched / coloured
       * @param toColour {String} String to colour
       * @return {String} Input string with coloured sub section.
       */
      colourSearchTerm(input, toColour) {
        let inputString = String(input);
        if (toColour !== "" && inputString.toLowerCase().includes(toColour)) {
          let occuranceIndex = inputString.toLowerCase().indexOf(toColour);
          let occuranceSize = toColour.length;

          let first = inputString.substring(0, occuranceIndex);
          let coloured = `<span class="markedText">${inputString.substr(occuranceIndex, occuranceSize)}</span>`;
          let last = inputString.substring(occuranceIndex + occuranceSize);

          return first + coloured + last;
        }
        return input;
      },
      /**
       * Wrapper simulating filters : x | formatNumericValue | colourSearchTerm(currentSearchTerm, searchTermColour)
       */
      formatTableCell(input) {
        return this.colourSearchTerm(this.formatNumericValue(input), this.normalisedSearchTerm)
      },
      /**
       * Use this function to change the numbers of shown rows.
       * @param {Number} change Number to change row count by.
       */
      alterRowCount(change) {
        let appliedChange = this.rowsShown.currentCount + change;
        let rowCountNormalised = appliedChange < this.rowsShown.minCount ? this.rowsShown.minCount : appliedChange; // set lower bound
        rowCountNormalised = rowCountNormalised > this.rowsShown.maxCount ? this.rowsShown.maxCount : rowCountNormalised; // set upper bound
        this.rowsShown.currentCount = rowCountNormalised;
      },
      /**
       * Represents all options shown in the search dropdown. Array not flattened
       */
      autocompletionData(normalisedConfig) {
        let data = []
        if (normalisedConfig.type === "parent") {
          for (const child of normalisedConfig.value) {
            data.push(this.autocompletionData(child));
          }

          return data;
        }

        return [normalisedConfig.name, "$" + normalisedConfig.name];
      }
    },
    computed: {
      /**
       * Returns normalised max shown metrics. Based on 'maxMetricCountProp'
       */
      maxAllowedMetrics() {
        return this.maxMetricCount < 1 ? this.metricCount : this.maxMetricCount;
      },
      /**
       * Return array of metrics limited by prop 'maxMetricCount'
       * @return {string[]} String array of alphabetically sorted metric names
       */
      metricNames() {
        let metricObject = this.folds[0].best_config.best_config_score.training.metrics;
        return Object.keys(metricObject).sort().slice(0, this.maxAllowedMetrics);
      },
      /**
       * Returns number of metrics used in analysis
       * @return {Number} metric count
       */
      metricCount() {
        let metricObject = this.folds[0].best_config.best_config_score.training.metrics;
        return Object.keys(metricObject).length;
      },
      /**
       * Normalise the search term
       * @return {string} Normalised string
       */
      normalisedSearchTerm() {
        return this.currentSearchTerm.toLowerCase();
      },
      /**
       * Number of rows to be shown. Restricts value between min and max.
       */
      shownRowsCount() {
        return this.rowsShown.currentCount;
      }
    },
    created() {
      // Init row data
      this.folds.forEach(fold => { // iterate folds
        let foldID = fold.fold_nr;
        fold.tested_config_list.forEach(config => { // iterate configs
          let configID = config.config_nr;
          let normalisedConfig = normalizeConfig(config.human_readable_config);
          let configString = formatHRC(normalisedConfig);
          let metrics = this.extractMeanMetrics(config.metrics_test)

          let row = { // Order: Fold#, Config#, Config string, Metrics as returned by computed#metricNames
            foldID,
            configID,
            configString,
            ...metrics,
            tctMetadata: { // meta data that is not displayed in table
              normalisedConfig
            }
          };

          this.rawData.push(row);
        })
      })

      // set max length for table
      this.rowsShown.maxCount = this.rawData.length;
    },
    mounted() {
      // Populate autocomplete
      let elems = document.querySelectorAll('.autocomplete');
      let res = this.autocompletionData(normalizeConfig(this.folds[0].best_config.human_readable_config));
      // flatten res TODO cleanup!! Consider giving recursion function output array arg to avoid having to flatten
      let flatten = (arr) => {
        return arr.reduce(function (flat, toFlatten) {
          return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
        }, []);
      };
      res = flatten(res);
      // add metrics for adv. search
      res.push(...(this.metricNames.map(value => "$" + value)))
      let autoCompleteData = {};
      res.forEach(e => autoCompleteData[e] = null);

      let instances = M.Autocomplete.init(elems, {
        data: autoCompleteData
      });
    }

  }
</script>

<style>
  span.markedText {
    background-color: var(--photon-light-blue);
  }

  .searchBox h2{
    float: left;
  }
  .searchBox .input-field{
    display: block;
    float: left;
    margin-left: 1em;
    margin-top: 1em;
  }

  .tableControllers{
    margin-top: 20px;
    font-size: 1em;
  }
  .configTable table{
    color: var(--photon-dark);
  }
</style>