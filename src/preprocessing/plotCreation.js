import { PlotlyPlot, PlotlyTrace } from "./PlotlyPlot";
import { BestConfigTrace, BestConfigPlot } from "./BestConfigPlot";

export {
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
 * @param {Object} file Pipeline file needed for processing.
 * @param {Int} config Config controlling plot generation. For details see 'Readme.md' in preprocessing folder.
 * @returns {Object} An array of various plots
 */
function createPlot(file, config) {
  switch (config) {
    case PlotTypes.showPipeline:
      return plotShowPipeline(file)
    case PlotTypes.showOuterFold:
      window.console.log('PlotTypes.showOuterFold triggered, but not yet implemented')
      return []
      case PlotTypes.compareConfigs:
        window.console.log('PlotTypes.compareConfigs triggered, but not yet implemented')
        return []
    default:
      alert(`Error in plotCreation.js::createPlot - Given config is unknown and default was triggered: ${config}`)
  }
}

/**
 * Plotting function for the general overview plot as seen in hyperpipe.py
 * @param {Object} file Object containing all needed information.
 * @returns {Array} An array of plots: One overview plot and a config plot for each fold (best plot each)
 */
function plotShowPipeline(file) {
  let defaultBestConfigFold = 0;

  let trainingMetrics = {};
  let testingMetrics = {};
  let bestConfigPlots = [];

  let overviewPlot = new PlotlyPlot("Overview Plot", [], true);

  file.outer_folds.forEach(fold => {
    let overviewPlotTrainingTrace = new PlotlyTrace(
      `Fold ${fold.fold_nr} (Training)`,
      ...Array(3).fill(undefined),
      "rgb(91,91,91)"
    );
    let overviewPlotTestingTrace = new PlotlyTrace(
      `Fold ${fold.fold_nr} (Testing)`,
      ...Array(3).fill(undefined),
      "rgb(91,91,91)"
    );

    for (const [key, value] of Object.entries(
      fold.best_config.inner_folds[defaultBestConfigFold].training.metrics
    )) {
      overviewPlotTrainingTrace.x.push(key + "_training");
      overviewPlotTrainingTrace.y.push(value);
      trainingMetrics[key] = value;
    }

    for (const [key, value] of Object.entries(
      fold.best_config.inner_folds[defaultBestConfigFold].validation.metrics
    )) {
      overviewPlotTestingTrace.x.push(key + "_testing");
      overviewPlotTestingTrace.y.push(value);
      testingMetrics[key] = value;
    }

    overviewPlot.traces.push(overviewPlotTrainingTrace);
    overviewPlot.traces.push(overviewPlotTestingTrace);

    let metricTrainingTrace = new BestConfigTrace(
      "training-WHERE AM I z70",
      Object.entries(trainingMetrics).map(([key, value]) => ({ key, value })),
      "",
      "bar"
    );
    let metricTestingTrace = new BestConfigTrace(
      "testing-WHERE AM I z76",
      Object.entries(testingMetrics).map(([key, value]) => ({ key, value })),
      "",
      "bar"
    );

    let bestConfigPlot = new BestConfigPlot(
      "bestConfigOverviewINTERNAL",
      `Best Configuration Overview - Fold ${fold.fold_nr}`,
      metricTrainingTrace,
      metricTestingTrace
    );
    bestConfigPlots.push(bestConfigPlot);
  });

  // Start calculating mean values grouped by metrics and training or validation set
  let trainingMeanTrace = new PlotlyTrace('mean_training', undefined, undefined, 8, 'rgb(214, 123, 25)', undefined)
  let testingMeanTrace = new PlotlyTrace('mean_testing', undefined, undefined, 8, 'rgb(214, 123, 25)', undefined)
  
  let temp = {}
  let count = {}

  // training
  for (let [key, value] of Object.entries(trainingMetrics)) { // two loops used in python code... check for correctness
    temp[key] = parseFloat(value)
    count[key] = 1
  }

  for (let [key, value] of Object.entries(temp)) {
    trainingMeanTrace.x.push(`${key}_training`)
    trainingMeanTrace.y.push(value / count[key])
  }

  // clear temps
  temp = {}
  count = {}

  // testing
  for (let [key, value] of Object.entries(testingMetrics)) { // two loops used in python code... check for correctness
    temp[key] = parseFloat(value)
    count[key] = 1
  }

  for (let [key, value] of Object.entries(temp)) {
    testingMeanTrace.x.push(`${key}_testing`)
    testingMeanTrace.y.push(value / count[key])
  }

  overviewPlot.traces.push(trainingMeanTrace)
  overviewPlot.traces.push(testingMeanTrace)

  // return overviewplot and best config plots
  return [
    overviewPlot,
    ...bestConfigPlots
  ]
  

}
