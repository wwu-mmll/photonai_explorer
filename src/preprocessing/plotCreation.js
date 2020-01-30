import {PlotlyPlot, PlotlyTrace} from "./PlotlyPlot";

export default {
  createPlot,
  PlotTypes
};

// Enumeration containing plot types for use in 'createPlot' function
const PlotTypes = Object.freeze({
  showPipeline: 1,
  showOuterFold: 2,
  compareConfigs: 3
});

/**
 * This function interfaces with the Plot component to update data and layout variables.
 * @param {Array} files All pipeline files known to the application. TODO: maybe only pass the correct file?
 * @param {Object} config Config controlling plot generation. For details see 'Readme.md' in preprocessing folder.
 * @returns {Object} Object containing 'data' and 'layout'
 */
function createPlot(files, config) {}

/**
 * Plotting function for the general overview plot as seen in hyperpipe.py
 * @param {Object} file Object containing all needed information.
 * @returns {Object} Object containing 'data' and 'layout'
 */
function plotShowPipeline(file) {
 let defaultBestConfigFold = 0

  let overviewPlot = new PlotlyPlot("Overview Plot", [], false)

  file.outer_folds.forEach(fold => {
    let overviewPlotTrainingTrace = new PlotlyTrace(`Fold ${fold.fold_nr} (Training)`, ...Array(3).fill(undefined), 'rgb(91,91,91)')
    let overviewPlotTestingTrace = new PlotlyTrace(`Fold ${fold.fold_nr} (Testing)`, ...Array(3).fill(undefined), 'rgb(91,91,91)')
    
    for (const [key, value] of Object.entries(fold.best_config.inner_folds[defaultBestConfigFold].training.metrics)) {
      overviewPlotTrainingTrace.x.push()
    }
  });
}
