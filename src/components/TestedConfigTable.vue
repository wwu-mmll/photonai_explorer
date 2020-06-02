<template>
  <div class="testedConfigTable">
    <div class="row">
      <h4 class="col s12 m6 left-align">Tested Configurations</h4>
      <h4 class="col s6 offset-m2 m2" style="display: inline">Search:</h4>
      <div class="input-field">
        <input id="tableSearchbar" v-model="currentSearchTerm" class="col s6 m2 autocomplete" style="margin-top: 1em" type="text">
      </div>
    </div>

    <p v-if="metricCount !== metricNames.length" style="color: var(--photon-explorer-dark-pink)">
      Warning: Due to size restrictions this table is only showing {{ metricNames.length }} of {{
      metricCount }} supplied metrics!
    </p>

    <div class="tableControllers">
      <a class="btn" @click="alterRowCount(Number.MIN_SAFE_INTEGER)">Min</a>
      <a class="btn" @click="alterRowCount(-5)">Less(5)</a>
      <a class="btn" @click="alterRowCount(5)">More(5)</a>
      <a class="btn" @click="alterRowCount(Number.MAX_SAFE_INTEGER)">Max</a>
    </div>

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
            <span v-html="formatTableCell(value)"></span>
          </td>
        </tr>
      </tbody>
    </table>
    debug: sort={{currentSortRow}}, dir={{currentSortDir}}
  </div>
</template>

<script>
    export default { // TODO Consider using SCSS & lazy loading table
        name: "TestedConfigTable",
        props: {
            folds: Array,           // An array of folds as found in file.outer_folds
            maxMetricCount: Number  // Number of metrics shown in table
        },
        data() {
            return {
                rawData: [],
                currentSortRow: "foldID",               // column name to sort by
                currentSortDir: "ASC",                  // current sorting direction: ASC or DESC
                currentSearchTerm: "",                  // content of searchbar
                rowsShown: {                            // Object to manage stats for # shown rows. NOT FOR DIRECT USE! Use computed property 'shownRowsCount
                    minCount: 5,                        // # rows shown if MIN is pressed
                    currentCount: 10,                   // actual count. Manipulated by setters, read by computed property
                    maxCount: 10000                     // # rows shown if MAX is pressed TODO: is a static value advantageous?
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

                /*var instance = M.Autocomplete.getInstance(document.querySelector(".autocomplete"));
                instance.updateData({
                    "Apple": null,
                    "Microsoft": null,
                    "Google": 'https://placehold.it/250x250'
                });*/ //TODO figure out autocompletion using materializecss
                return this.rawData.filter(row => row.configString.toLowerCase().includes(this.normalisedSearchTerm))
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
             * @return {string|*} Either formatted float or whatever was passed in.
             */
            formatNumericValue(value) {
                if (!isNaN(value) && !Number.isInteger(value))
                    return value.toFixed(3);
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
             * This function formats any config into a string.
             * @param {Object} config human_readable_config object as found in any tested config.
             * @return {String} String representation of given config (contains html tags).
             */
            formatHRF(config) {
                let outputStrings = [];
                for (const [key, value] of Object.entries(config)) {
                    outputStrings.push(`<b>${key}</b>: ${value.join(", ")}`);
                }

                return outputStrings.join(", ");
            }
        },
        computed: {
            /**
             * Return array of metrics limited by prop 'maxMetricCount'
             * @return {string[]} String array of alphabetically sorted metric names
             */
            metricNames() {
                let metricObject = this.folds[0].best_config.best_config_score.training.metrics;
                return Object.keys(metricObject).sort().slice(0, this.maxMetricCount);
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
                    let configString = this.formatHRF(config.human_readable_config);
                    let metrics = this.extractMeanMetrics(config.metrics_test)

                    let row = { // Order: Fold#, Config#, Config string, Metrics as returned by computed#metricNames
                        foldID,
                        configID,
                        configString,
                        ...metrics
                    };

                    this.rawData.push(row);
                })
            })
        },
        filters: {}

    }
</script>

<style>
  span.markedText {
    background-color: var(--photon-light-blue);
  }

  a.btn {
    background-color: var(--photon-gray);
    margin-right: 15px;
  }
</style>