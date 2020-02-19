import { PlotlyPlot, PlotlyTrace } from "./PlotlyPlot";
import { BestConfigTrace, BestConfigPlot } from "./BestConfigPlot";

export { createPlot, PlotTypes };

// Enumeration containing plot types for use in 'createPlot' function
const PlotTypes = Object.freeze({
  showPipeline: 1,
  showOuterFold: 2,
  compareConfigs: 3
});

/**
 * This function interfaces with the Plot component to update data and layout variables.
 * @param {Object} file Pipeline file needed for processing.
 * @param {Int} config Config controlling plot generation. For details see 'Readme.md' in src/preprocessing.
 * @returns {Object} An object of various plots and other data. Check the return documentation of the individual plot* functions for more details.
 */
function createPlot(file, config) {
  switch (config.type) {
    case PlotTypes.showPipeline:
      return plotShowPipeline(file);
    case PlotTypes.showOuterFold:
      if (!config.hasOwnProperty('foldNo')) {
        alert('Plottypes.showOuterFold was requested, but needed argument "foldNo" was not supplied!')
        window.console.log('createPlot-showOuterFold: foldNo not found')
        return {}
      }
      return plotShowOuterFolds(file, config.foldNo)
    case PlotTypes.compareConfigs:
      window.console.log(
        "PlotTypes.compareConfigs triggered, but not yet implemented"
      );
      return [];
    default:
      alert(
        `Error in plotCreation.js::createPlot - Given config is unknown and default was triggered: ${config}`
      );
  }
}

/**
 * Plotting function for the general overview plot as seen in hyperpipe.py
 * @param {Object} file Object containing all needed information.
 * @returns An object of plots: One overview plot (overview) and a config plot for each fold (best plot each; bestConfigs)
 */
function plotShowPipeline(file) {
  let defaultBestConfigFold = 0;

  let trainingMetrics = {};
  let testingMetrics = {};
  let bestConfigPlots = [];

  let overviewPlot = new PlotlyPlot("Overview Plot", [], false);

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
      "Training",
      Object.entries(trainingMetrics).map(([key, value]) => ({ key, value })),
      "",
      "bar"
    );
    let metricTestingTrace = new BestConfigTrace(
      "Testing",
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
  let trainingMeanTrace = new PlotlyTrace(
    "mean_training",
    undefined,
    undefined,
    8,
    "rgb(214, 123, 25)",
    undefined
  );
  let testingMeanTrace = new PlotlyTrace(
    "mean_testing",
    undefined,
    undefined,
    8,
    "rgb(214, 123, 25)",
    undefined
  );

  let temp = {};
  let count = {};

  // training
  for (let [key, value] of Object.entries(trainingMetrics)) {
    // two loops used in python code... check for correctness
    temp[key] = parseFloat(value);
    count[key] = 1;
  }

  for (let [key, value] of Object.entries(temp)) {
    trainingMeanTrace.x.push(`${key}_training`);
    trainingMeanTrace.y.push(value / count[key]);
  }

  // clear temps
  temp = {};
  count = {};

  // testing
  for (let [key, value] of Object.entries(testingMetrics)) {
    // two loops used in python code... check for correctness
    temp[key] = parseFloat(value);
    count[key] = 1;
  }

  for (let [key, value] of Object.entries(temp)) {
    testingMeanTrace.x.push(`${key}_testing`);
    testingMeanTrace.y.push(value / count[key]);
  }

  overviewPlot.traces.push(trainingMeanTrace);
  overviewPlot.traces.push(testingMeanTrace);

  // return overviewplot and best config plots
  return { overview: overviewPlot, bestConfigs: bestConfigPlots };
}

/**
   * Plotting function for all plots as seen in Outer_fold.py
   * @param {Object} file Object containing all needed information.
   * @param {Int} foldNo Fold number to be further inspected (1 based).
   * @returns An object with the following attributes: outerFold (copy of raw fold), errorPlots, bestConfigPlot, finalValueTrainingPlot, finalValueValidationPlot, configDicts (objects containing used config)
   */
  function plotShowOuterFolds(file, foldNo) {
    // best config object always has just one fold
    let defaultFoldBestConfig = 0;
    let configDictList = [];
    let errorPlotList = [];
    let metricTrainingList = [];
    let metricValidationList = [];

    let outerFold = file.outer_folds[foldNo - 1];

    // save training metrics in list
    for (const [key, value] of Object.entries(
      outerFold.best_config.inner_folds[defaultFoldBestConfig].training.metrics
    )) {
      metricTrainingList.push({ [key]: value });
    }

    // save validation metrics in list
    for (const [key, value] of Object.entries(
      outerFold.best_config.inner_folds[defaultFoldBestConfig].validation
        .metrics
    )) {
      metricValidationList.push({ [key]: value });
    }

    // building traces from lists
    let metricTrainingTrace = new BestConfigTrace(
      "Training",
      metricTrainingList,
      "",
      "bar"
    );
    let metricValidationTrace = new BestConfigTrace(
      "Validation",
      metricValidationList,
      "",
      "bar"
    );

    // building plot from traces
    let bestConfigPlot = new BestConfigPlot(
      "bestConfigOverview",
      "Best Configuration Overview",
      metricTrainingTrace,
      metricValidationTrace
    );

    // START building final values for training set (best config)
    let trueTrainingTrace = new PlotlyTrace("y_true");
    let predTrainingTrace = new PlotlyTrace("y_pred");

    // TRAINING basically a complex fori loop I guess
    for (const [index, value] of outerFold.best_config.inner_folds[
      defaultFoldBestConfig
    ].training.y_true.entries()) {
      trueTrainingTrace.x.push(index);
      trueTrainingTrace.y.push(value);
    }

    // PREDICTION
    for (const [index, value] of outerFold.best_config.inner_folds[
      defaultFoldBestConfig
    ].training.y_pred.entries()) {
      predTrainingTrace.x.push(index);
      predTrainingTrace.y.push(value);
    }

    // put it all together
    let finalValueTrainingPlot = new PlotlyPlot(
      "True/Predict for training set",
      [trueTrainingTrace, predTrainingTrace]
    );
    // END building final values for training set (best config)

    // START building final values for validation set (best config)
    let trueValidationTrace = new PlotlyTrace("y_true");
    let predValidationTrace = new PlotlyTrace("y_pred");

    // TRAINING
    for (const [index, value] of outerFold.best_config.inner_folds[
      defaultFoldBestConfig
    ].validation.y_true.entries()) {
      trueValidationTrace.x.push(index);
      trueValidationTrace.y.push(value);
    }

    // PREDICTION
    for (const [index, value] of outerFold.best_config.inner_folds[
      defaultFoldBestConfig
    ].validation.y_pred.entries()) {
      predValidationTrace.x.push(index);
      predValidationTrace.y.push(value);
    }

    // put it all together
    let finalValueValidationPlot = new PlotlyPlot(
      "True/Predict for validation set",
      [trueValidationTrace, predValidationTrace]
    );
    // END building final values for validation set (best config)

    // START building plot objects for each tested config
    outerFold.tested_config_list.forEach(config => {
      let configDict = {
        investigatorName: `config_${config.config_nr}`,
        investigatorID: config.config_nr
      };

      let errorPlotTrain = new PlotlyPlot(
        `Train Error Plot ${config.config_nr}`,
        [],
        false
      );
      let errorPlotTest = new PlotlyPlot(
        `Test Error Plot ${config.config_nr}`,
        [],
        false
      );

      config.inner_folds.forEach(innerFold => {
        let traceTrainingMetrics = new PlotlyTrace(
          `training_fold_${innerFold.fold_nr}`,
          undefined,
          undefined,
          undefined,
          "rgb(91, 91, 91)"
        );
        let traceTestMetrics = new PlotlyTrace(
          `test_fold_${innerFold.fold_nr}`,
          undefined,
          undefined,
          undefined,
          "rgb(91, 91, 91)"
        );

        for (const [key, value] of Object.entries(innerFold.training.metrics)) {
          traceTrainingMetrics.x.push(key);
          traceTrainingMetrics.y.push(value);
        }
        for (const [key, value] of Object.entries(
          innerFold.validation.metrics
        )) {
          traceTestMetrics.x.push(key);
          traceTestMetrics.y.push(value);
        }

        errorPlotTrain.traces.push(traceTrainingMetrics);
        errorPlotTest.traces.push(traceTestMetrics);
      });

      let traceTraining = new PlotlyTrace(
        `training_mean_${config.config_nr}`,
        undefined,
        undefined,
        8,
        undefined,
        true
      );
      let traceTest = new PlotlyTrace(
        `test_mean_${config.config_nr}`,
        undefined,
        undefined,
        8,
        undefined,
        true
      );

      config.metrics_train.forEach(train => {
        if (train.operation == "FoldOperations.MEAN") {
          traceTraining.x.push(train.metric_name);
          traceTraining.y.push(train.value);
        } else if (train.operation == "FoldOperations.STD") {
          traceTraining.error.push(train.value);
        }
      });
      config.metrics_test.forEach(test => {
        if (test.operation == "FoldOperations.MEAN") {
          traceTest.x.push(test.metric_name);
          traceTest.y.push(test.value);
        } else if (test.operation == "FoldOperations.STD") {
          traceTest.error.push(test.value);
        }
      });
      errorPlotTrain.traces.push(traceTraining);
      errorPlotTest.traces.push(traceTest);

      errorPlotList.push(errorPlotTrain, errorPlotTest);

      // convert config values to string for later display
      for (const [key, value] of Object.entries(config.config_dict)) {
        configDict[key] = String(value);
      }
      configDictList.push(configDict);
    });
    // END building plot objects for each tested config

    return {
      outerFold: outerFold,
      errorPlots: errorPlotList,
      bestConfigPlot: bestConfigPlot,
      finalValueTrainingPlot: finalValueTrainingPlot,
      finalValueValidationPlot: finalValueValidationPlot,
      configDicts: configDictList,
      allInclusive: [...errorPlotList, bestConfigPlot, finalValueTrainingPlot, finalValueValidationPlot]
    };
  }
