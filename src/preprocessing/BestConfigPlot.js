export {
  BestConfigPlot,
  BestConfigTrace
}

/**
 * Class which prepares given data for usage in Plot component.
 * @author Jakob Steenweg
 */
class BestConfigPlot {
  /**
   * Create new BestConfigPlot.
   * @param {String} plotName Legacy variable kept to avoid confusion/mistakes during rewrite. Doesn't do anything.
   * @param {String} title Title displayed above plot.
   * @param {BestConfigTrace} bestConfigTraining Trace representing training data.
   * @param {BestconfigTrace} bestConfigValidation Trace representing validation data.
   */
  constructor(plotName, title, bestConfigTraining, bestConfigValidation) {
    this.plotName = plotName
    this.title = title
    this.bestConfigTraining = bestConfigTraining
    this.bestConfigValidation = bestConfigValidation
  }

  toPlot() {
    let r = {}
    r['data'] = [this.bestConfigTraining.toTrace(), this.bestConfigValidation.toTrace()]
    r['layout'] = {title: this.title} // , yaxis: {range: [-.25, 1.25]}

    return r
  }
}

/**
 * Class representing a single trace of a BestConfigPlot.
 * @author Jakob Steenweg
 * @see BestConfigPlot
 */
class BestConfigTrace {
  /**
   * Create new BestConfigTrace.
   * @param {String} traceName Trace name displayed in plot.
   * @param {Array} metricList An array of key/value pairs representing the trace data (default: null)
   * @param {String} traceMode Trace mode (default: markers)
   * @param {String} traceType Trace type (default: scatter)
   */
  constructor(traceName, metricList = [], traceMode = 'markers', traceType = 'scatter') {
    this.traceName = traceName
    this.metricList = metricList
    this.traceMode = traceMode
    this.traceType = traceType
  }

  /**
   * Returns all information in proper form.
   * @returns {Object} {traceName: String, x: Array, y: Array, traceMode: String, traceType: String}
   */
  toTrace() {
    let r = {}
    r['name'] = this.traceName
    r['mode'] = this.traceMode
    r['type'] = this.traceType
    r['x'] = this.metricList.map(item => item['key'])
    r['y'] = this.metricList.map(item => item['value'])

    return r
  }
}