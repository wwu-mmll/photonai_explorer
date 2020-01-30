export default {
  PlotlyPlot, 
  PlotlyTrace
}

/**
 * Class which prepares given data for usage in Plot component.
 * @author Jakob Steenweg
 */
class PlotlyPlot {

  /**
   * Create new PlotlyPlot.
   * @param {String} title Title displayed above plot.
   * @param {*} traces 
   * @param {*} showLegend 
   */
  constructor(title, traces = [], showLegend = true) {
    this.title = title
    this.traces = traces
    this.showLegend = showLegend
  }


  toPlot() {
    return {
      data: this.traces,
      layout: {
        title: this.title,
        yaxis: {range: [-.25, 1.25]}
      }
    }
  }

}

/**
 * Class representing a single trace of a PlotlyPlot.
 * @author Jakob Steenweg
 * @see PlotlyPlot
 */
class PlotlyTrace {

  /**
   * Class representing a single trace of a PlotlyPlot.
   * @param {String} traceName Trace name shown in plot
   * @param {String} mode Trace mode (default: 'markers')
   * @param {String} traceType Trace type (default: 'scatter')
   * @param {Integer} traceSize Trace size (default: 0)
   * @param {String} traceColour String representing trace color (default: '')
   * @param {Boolean} withError Show error margins (default: false)
   */
  constructor(traceName, mode='markers', traceType='scatter', traceSize=0, traceColour='', withError=false) {
    this.traceName = traceName
    this.mode = mode
    this.traceType = traceType
    this.traceSize = traceSize
    this.traceColour = traceColour
    this.withError = withError

    this.x = []
    this.y = []
    this.error = []
  }

  /**
   * Converts object into plotly acceptable object.
   * @param {Boolean} showError Should error data be shown (if available / allowed)
   * @returns {Object} Object representing trace in plotly compliant format.
   */
  toTrace(showError) {
    return {
      name: this.traceName,
      mode: this.mode,
      type: this.traceType,
      marker: {
        color: this.traceColour != '' ? this.traceColour : undefined,
        size: this.traceSize != 0 ? this.traceSize : undefined
      },
      x: this.x,
      y: this.y,
      error_y: this.withError && showError ? this.error : undefined
    }
  }
}