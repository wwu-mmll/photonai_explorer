import {PlotlyPlot, PlotlyTrace} from "./PlotlyPlot";
import {BestConfigPlot, BestConfigTrace} from "./BestConfigPlot";
import ConfusionMatrix from "ml-confusion-matrix";

export { createPlot, plotFoldComparisonData, PlotTypes, plotPerformance, plotBestConfigConfusion, plotOptimizerHistory };

// Enumeration containing plot types for use in 'createPlot' function
const PlotTypes = Object.freeze({
  showPipeline: 1,
  showOuterFold: 2,
  testedConfig: 4,
  innerFoldConfig: 5
});


const ColorList = ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B',
                   '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF']

/**
 * This function interfaces with the Plot component to update data and layout variables. TODO rethink need for this function. Seems to be a lot of logic for little reward
 * @param {Object} file Pipeline file needed for processing.
 * @param {Int} config Config controlling plot generation. For details see 'Readme.md' in src/preprocessing.
 * @returns {Object} An object of various plots and other data. Check the return documentation of the individual plot* functions for more details.
 */
function createPlot(file, config) {
  switch (config.type) {
    case PlotTypes.showPipeline: //////////////////////////////////////////////////////////////////
      return plotShowPipeline(file);
    case PlotTypes.showOuterFold: //////////////////////////////////////////////////////////////////
      if (!Object.prototype.hasOwnProperty.call(config,"foldNo")) {
        alert(
          'Plottypes.showOuterFold was requested, but needed argument "foldNo" was not supplied!'
        );
        window.console.log("createPlot-showOuterFold: foldNo not found");
        return {};
      }
      return plotShowOuterFolds(file, config.foldNo);
    case PlotTypes.testedConfig: //////////////////////////////////////////////////////////////////
      if (
        !Object.prototype.hasOwnProperty.call(config,"foldNo") ||
        !Object.prototype.hasOwnProperty.call(config,"innerFoldNo") ||
        !Object.prototype.hasOwnProperty.call(config,"configIndex")
      ) {
        alert(
          "Plottypes.testedConfig was requested, but some of the needed arguments are missing. Required: foldNo, innerFoldNo, configIndex"
        );
        window.console.log(
          "Plottypes.testedConfig was requested, but some of the needed arguments are missing. Required: foldNo, innerFoldNo, configIndex"
        );
        return {};
      }
      return plotShowTestedConfig(
        file,
        config.foldNo,
        config.innerFoldNo,
        config.configIndex
      );
    default:
      //////////////////////////////////////////////////////////////////
      alert(
        `Error in plotCreation.js::createPlot - Given config is unknown and default was triggered: ${config}`
      );
  }
}

/**
 * Plotting function generating all data needed for plots in PerformancePlots component.
 * @param {Object} file Pipeline file needed for processing.
 * @return {Object} Object containing metric names as keys and plot data as values
 */
function plotPerformance(file) { // TODO integrate into createPlot function? Consider removing that system
  let outputData = {};  // result data

  // extract metrics from dummy_results for iteration
  (file.hyperpipe_info.metrics).forEach(metricName => {

    // Create empty plot
    outputData[metricName] = new PlotlyPlot(metricName, [], false);

    let shapes = [];      // array containing all shape objects representing horizontal dummy result data
    let meanValues = {
      training: [],
      validation: []
    };  // object storing values for mean trace calculation in keys: training, validation


    // add dummy result
    // Extracts .MEAN value from metric list
    let dummyValueExtractor = (metric) => file.dummy_estimator.metrics_train
        .filter((metricObject) => metricObject.metric_name === metric && metricObject.operation.endsWith("mean"))
        .map((metricObject) => metricObject.value)[0];

    let dummyResult = dummyValueExtractor(metricName);
    shapes.push({
      type: "line",
      xref: "paper",
      x0: 0,
      y0: dummyResult,
      x1: 1,
      y1: dummyResult,
      line: {
        color: "#0e0e1d",
        width: 2
      }
    })


    // add dummy result shapes to plot
    outputData[metricName].addStyle("shapes", shapes);


    // iterate over folds
    file.outer_folds.forEach(fold => {
      let foldIndex = fold.fold_nr;

      // get fold data
      let foldTrain = fold.best_config.best_config_score.training.metrics[metricName];
      let foldValidation = fold.best_config.best_config_score.validation.metrics[metricName];

      meanValues["training"].push(foldTrain);
      meanValues["validation"].push(foldValidation);

      let trainingTrace = new PlotlyTrace(`Fold ${foldIndex}`, undefined, undefined, undefined, "#666");
      let validationTrace = new PlotlyTrace(`Fold ${foldIndex}`, undefined, undefined, undefined, "#666");

      trainingTrace.x.push("Training");
      trainingTrace.y.push(foldTrain);
      validationTrace.x.push("Validation");
      validationTrace.y.push(foldValidation);

      outputData[metricName].traces.push(trainingTrace, validationTrace);

    })

    // calculate mean values for bar trace
    let meanTrainingTrace = new PlotlyTrace("Mean training", undefined, "bar", undefined, "#2388fe");
    let meanValidationTrace = new PlotlyTrace("Mean validation", undefined, "bar", undefined, "#231c44");

    let average = (array) => array.reduce((a, b) => a + b) / array.length;

    meanTrainingTrace.x.push("Training");
    meanTrainingTrace.y.push(average(meanValues.training))
    meanValidationTrace.x.push("Validation");
    meanValidationTrace.y.push(average(meanValues.validation))

    outputData[metricName].traces.push(meanTrainingTrace, meanValidationTrace);
  })

  return outputData;
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

  let overviewPlotTraining = new PlotlyPlot("Training", [], false);
  let overviewPlotTesting = new PlotlyPlot('Testing', [], false);

  file.outer_folds.forEach(fold => {

    // MAIN OVERVIEW PLOT TRACES
    let overviewPlotTrainingTrace = new PlotlyTrace(
      `Fold ${fold.fold_nr}`,
      ...Array(3).fill(undefined),
      "rgb(91,91,91)"
    );
    let overviewPlotTestingTrace = new PlotlyTrace(
      `Fold ${fold.fold_nr}`,
      ...Array(3).fill(undefined),
      "rgb(91,91,91)"
    );

    for (const [key, value] of Object.entries(
      fold.best_config.inner_folds[defaultBestConfigFold].training.metrics
    )) {
      overviewPlotTrainingTrace.x.push(key);
      overviewPlotTrainingTrace.y.push(value);
      trainingMetrics[key] = value;
    }

    for (const [key, value] of Object.entries(
      fold.best_config.inner_folds[defaultBestConfigFold].validation.metrics
    )) {
      overviewPlotTestingTrace.x.push(key);
      overviewPlotTestingTrace.y.push(value);
      testingMetrics[key] = value;
    }

    overviewPlotTraining.traces.push(overviewPlotTrainingTrace);
    overviewPlotTesting.traces.push(overviewPlotTestingTrace);

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
    'bar',
    8,
    "rgb(214, 123, 25)",
    undefined
  );
  let testingMeanTrace = new PlotlyTrace(
    "mean_testing",
    undefined,
    'bar',
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
    trainingMeanTrace.x.push(key);
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
    testingMeanTrace.x.push(key);
    testingMeanTrace.y.push(value / count[key]);
  }

  overviewPlotTraining.traces.push(trainingMeanTrace);
  overviewPlotTesting.traces.push(testingMeanTrace);

  // return overviewplot and best config plots
  return { overview: [overviewPlotTraining, overviewPlotTesting], bestConfigs: bestConfigPlots };
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
  let metricTrainingList = {};
  let metricValidationList = {};

  let outerFold = file.outer_folds[foldNo - 1];

  // save training metrics in list
  for (const [key, value] of Object.entries(
    outerFold.best_config.inner_folds[defaultFoldBestConfig].training.metrics
  )) {
    metricTrainingList[key] = value;
  }

  // save validation metrics in list
  for (const [key, value] of Object.entries(
    outerFold.best_config.inner_folds[defaultFoldBestConfig].validation.metrics
  )) {
    metricValidationList[key] = value;
  }

  // building traces from lists
  let metricTrainingTrace = new BestConfigTrace(
    "Training",
    Object.entries(metricTrainingList).map(([key, value]) => ({ key, value })),
    "",
    "bar"
  );
  let metricValidationTrace = new BestConfigTrace(
    "Validation",
    Object.entries(metricValidationList).map(([key, value]) => ({
      key,
      value
    })),
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
  let finalValueTrainingPlot = new PlotlyPlot("True/Predict for training set", [
    trueTrainingTrace,
    predTrainingTrace
  ]);
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
      for (const [key, value] of Object.entries(innerFold.validation.metrics)) {
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
    allInclusive: [
      ...errorPlotList,
      bestConfigPlot,
      finalValueTrainingPlot,
      finalValueValidationPlot
    ]
  };
}

/**
 * Plotting function for all plots as seen in ajax.py::load_tested_config_for_inner_fold.
 * @param {Object} file Object containing all needed information.
 * @param {Int} foldNo Outer fold number to be further inspected (1 based).
 * @param {Int} innerFoldNo Inner fold number to be further inspected (1 based).
 * @param {Int} configIndex Index of config to be further inspected (0 based).
 * @returns An object with the following attributes:
 */
function plotShowTestedConfig(file, foldNo, innerFoldNo, configIndex) {
  let outerFoldNo = foldNo;
  let innerFold =
    file.outer_folds[outerFoldNo].tested_config_list[configIndex].inner_folds[
      innerFoldNo
    ];

  // Training plot
  let traceTrainingPrediction = new PlotlyTrace("Prediction", undefined, "");
  traceTrainingPrediction.x = [
    ...Array(innerFold.training.y_pred.length).keys()
  ].map(k => k + 1);
  traceTrainingPrediction.y = innerFold.training.y_pred;

  let traceTrainingTrue = new PlotlyTrace("True", undefined, "");
  traceTrainingTrue.x = [...Array(innerFold.training.y_true.length).keys()].map(
    k => k + 1
  );
  traceTrainingTrue.y = innerFold.training.y_true;

  // Validation plot
  let traceValidationPrediction = new PlotlyTrace("Prediction", undefined, "");
  traceValidationPrediction.x = [
    ...Array(innerFold.validation.y_pred.length).keys()
  ].map(k => k + 1);
  traceValidationPrediction.y = innerFold.validation.y_pred;

  let traceValidationTrue = new PlotlyTrace("True", undefined, "");
  traceValidationTrue.x = [
    ...Array(innerFold.validation.y_true.length).keys()
  ].map(k => k + 1);
  traceValidationTrue.y = innerFold.validation.y_true;

  return {
    training: new PlotlyPlot("True/Predict for training set", [
      traceTrainingPrediction,
      traceTrainingTrue
    ]),
    validation: new PlotlyPlot("True/Predict for validation set", [
      traceValidationPrediction,
      traceValidationTrue
    ])
  };
}

/**
 * Plotting function for all plots as seen in ajax.py::load_inner_fold_data_for_config.
 * @param {Object} file Object containing all needed information.
 * @param {Int} foldNo Outer fold number to be further inspected (1 based).
 * @param {Int} innerFoldNo Inner fold number to be further inspected (1 based).
 * @param {Int} configIndex Index of config to be further inspected (0 based).
 * @returns An object with the following structure: {folds: [{training, validation}, ...]}
 */
function plotShowInnerFoldConfig(file, foldNo, configIndex) {
  let outerFoldIndex = foldNo - 1;
  let foldPlots = [];

  file.outer_folds[outerFoldIndex].tested_config_list[
    configIndex
  ].inner_folds.forEach(innerFold => {
    // Training plot
    let traceTrainingPrediction = new PlotlyTrace("Prediction", undefined, "");
    traceTrainingPrediction.x = [
      ...Array(innerFold.training.y_pred.length).keys()
    ].map(k => k + 1);
    traceTrainingPrediction.y = innerFold.training.y_pred;

    let traceTrainingTrue = new PlotlyTrace("True", undefined, "");
    traceTrainingTrue.x = [
      ...Array(innerFold.training.y_true.length).keys()
    ].map(k => k + 1);
    traceTrainingTrue.y = innerFold.training.y_true;

    // Validation plot
    let traceValidationPrediction = new PlotlyTrace(
      "Prediction",
      undefined,
      ""
    );
    traceValidationPrediction.x = [
      ...Array(innerFold.validation.y_pred.length).keys()
    ].map(k => k + 1);
    traceValidationPrediction.y = innerFold.validation.y_pred;

    let traceValidationTrue = new PlotlyTrace("True", undefined, "");
    traceValidationTrue.x = [
      ...Array(innerFold.validation.y_true.length).keys()
    ].map(k => k + 1);
    traceValidationTrue.y = innerFold.validation.y_true;

    foldPlots.push({
      training: new PlotlyPlot("True/Predict for training set", [
        traceTrainingPrediction,
        traceTrainingTrue
      ]),
      validation: new PlotlyPlot("True/Predict for validation set", [
        traceValidationPrediction,
        traceValidationTrue
      ])
    });
  });

  return {folds: foldPlots}
}

/**
 * Function generates all data needed for tested config comparison.
 * Due to its abnormal parametrisation in comparison to the other plot* functions it is not accessed through the createPlot interface.
 * @param {Object} file Object containing all needed information.
 * @param {Int} foldNo Outer fold number to be further inspected (1 based).
 * @param {Array} toCompare Array of tested config indices to compare (0 based).
 * @returns An object with the following attributes: outerFold (Raw obj), plotTraining (PlotlyPlot), plotTest(PlotlyPlot), configDictList (Array)
 */
function plotFoldComparisonData(file, foldNo, toCompare) {
  let configDictList = [];
  let configList = [];
  let traceTrainingList = [];
  let traceTestList = [];

  let outerFold = file.outer_folds[foldNo - 1];

  outerFold.tested_config_list.forEach(config => {
    if (toCompare.includes(config.config_nr)) {
      let configDict = { configName: `config_${config.config_nr}` };
      configList.push(config);

      let traceTraining = new PlotlyTrace(
        `config_${config.config_nr}`,
        "",
        "bar"
      );
      let traceTest = new PlotlyTrace(`config_${config.config_nr}`, "", "bar");

      config.metrics_train.forEach(train => {
        if (train.operation == "FoldOperations.MEAN") {
          traceTraining.x.push(String(train.metric_name));
          traceTraining.y.push(train.value);
        }
      });
      config.metrics_test.forEach(test => {
        if (test.operation == "FoldOperations.MEAN") {
          traceTraining.x.push(String(test.metric_name));
          traceTraining.y.push(test.value);
        }
      });
      traceTrainingList.push(traceTraining);
      traceTestList.push(traceTest);

      configDict = { ...configDict, ...config.config_dict };
      configDictList.push(configDict);
    }
  });

  let plotTraining = new PlotlyPlot(
    "Train metrics of selected configurations",
    traceTrainingList
  );
  let plotTest = new PlotlyPlot(
    "Test metrics of selected configurations",
    traceTestList
  );

  return { outerFold, plotTraining, plotTest, configDictList };
}

const pSBC=(p,c0,c1,l)=>{
  let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
  if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
  let pSBCr=(d)=>{
    let n=d.length,x={};
    if(n>9){
      [r,g,b,a]=d=d.split(","),n=d.length;
      if(n<3||n>4)return null;
      x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
    }else{
      if(n==8||n==6||n<4)return null;
      if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
      d=i(d.slice(1),16);
      if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
      else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
    }return x};
  h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=pSBCr(c0),P=p<0,t=c1&&c1!="c"?pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
  if(!f||!t)return null;
  if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
  else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
  a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
  if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
  else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

/**
 * Plots a confusion matrix if file.hyperpipe_info.estimation_type equals "classifier" and plots a graph otherwise
 * @param {Object} file Object containing all needed information
 * @returns Object containing objects 'training' and 'validation' with keys 'data' and 'layout'
 */
function plotBestConfigConfusion(file) {
  let plotTraining = {data: [], layout: {title: "Training", paper_bgcolor: "rgba(0, 0, 0, 0)", plot_bgcolor: "rgba(0, 0, 0, 0)"}};
  let plotValidation = {data: [], layout: {title: "Test", paper_bgcolor: "rgba(0, 0, 0, 0)", plot_bgcolor: "rgba(0, 0, 0, 0)"}};

  if (file.hyperpipe_info.estimation_type === "classifier") {
    let y_trueTraining = file.best_config.best_config_score.training.y_true;
    let y_predTraining = file.best_config.best_config_score.training.y_pred;
    let y_trueValidation = file.best_config.best_config_score.validation.y_true;
    let y_predValidation = file.best_config.best_config_score.validation.y_pred;

    let uniqueLabels = [...new Set(y_trueTraining)].map(value => `Label ${value}`)
    let uniqueLabelsReverse = [...new Set(y_trueTraining)].reverse().map(value => `Label ${value}`)

    let confusionMatrixTraining = ConfusionMatrix.fromLabels(y_trueTraining, y_predTraining);
    let confusionMatrixValidation = ConfusionMatrix.fromLabels(y_trueValidation, y_predValidation);

    // create z data for plot
    let flatten = (arr) => {
      return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
      }, []);
    };
    let matrixTraining = confusionMatrixTraining.getMatrix().reverse();
    let matrixTrainingFlat = flatten(matrixTraining);
    let matrixValidation = confusionMatrixValidation.getMatrix().reverse();
    let matrixValidationFlat = flatten(matrixValidation);

    let zDataTraining = {z: matrixTraining, zmin: Math.min(matrixTrainingFlat), zmax: Math.max(matrixTrainingFlat)};
    let zDataValidation = {z: matrixValidation, zmin: Math.min(matrixValidationFlat), zmax: Math.max(matrixValidationFlat)};

    // PLOT CONFUSION MATRIX
    let colorscaleValuesTrain = [[0, '#ffffff'], [1, '#2388fe']]
    let colorscaleValuesTest = [[0, '#ffffff'], [1, '#231c44']]
    // let traceTraining = {type: "heatmap", x: uniqueLabels, y: uniqueLabelsReverse, ...zDataTraining, autocolorscale: false, colorScale: colourScale};
    // let traceValidation = {type: "heatmap", x: uniqueLabels, y: uniqueLabelsReverse, ...zDataValidation, autocolorscale: false, colorScale: colourScale};
    let traceTraining = {type: "heatmap", x: uniqueLabels, y: uniqueLabelsReverse, ...zDataTraining,
                         colorscale: colorscaleValuesTrain};
    let traceValidation = {type: "heatmap", x: uniqueLabels, y: uniqueLabelsReverse, ...zDataValidation,
                           colorscale: colorscaleValuesTest};

    plotTraining.data.push(traceTraining);
    plotValidation.data.push(traceValidation);

    // add styling
    plotTraining.layout.xaxis = {title: 'Predicted value'};
    plotTraining.layout.yaxis = {title: 'True value'};
    plotValidation.layout.xaxis = {title: 'Predicted value'};
    plotValidation.layout.yaxis = {title: 'True value'};

  } else {

    // TRUE / PRED GRAPH
    let range = (size, startAt = 0) => {
      return [...Array(size).keys()].map(i => i + startAt);
    }

    for (const [idx, fold] of file.outer_folds.entries()) {
      // Training
      let y_true = fold.best_config.best_config_score.training.y_true;
      let y_pred = fold.best_config.best_config_score.training.y_pred;

      let tmp_color = ColorList[idx];
      let traceTrueTraining = {name: "Fold "+ + idx, type: "scatter", mode: 'markers',
        marker: {color: tmp_color},
        x: y_pred, y: y_true};
      // let tracePredictionTraining = {name: "Predicted", type: "scatter", mode: 'markers',
      //   marker: {color: tmp_color},
      //   x: range(y_pred.length), y: y_pred};

      // Validation
      y_true = fold.best_config.best_config_score.validation.y_true;
      y_pred = fold.best_config.best_config_score.validation.y_pred;

      let traceTrueValidation = {name: "Fold " + idx, type: "scatter", mode: 'markers',
        x: y_pred, y: y_true};
      // let tracePredictionValidation = {name: "Predicted", type: "scatter", mode: 'markers',
      //   x: range(y_pred.length), y: y_pred};

      plotTraining.data.push(traceTrueTraining);
      plotValidation.data.push(traceTrueValidation);
      plotTraining.layout.xaxis = {title: 'Predicted value'};
      plotTraining.layout.yaxis = {title: 'True value'};
      plotValidation.layout.xaxis = {title: 'Predicted value'};
      plotValidation.layout.yaxis = {title: 'True value'};
    }


  }

  return {training: plotTraining, validation: plotValidation}
}

/**
 * Plots the optimisation history
 * @param {Object} file Object containing all needed information
 */
function plotOptimizerHistory(file) {
  // determine best_config_metric and order
  let bestConfigMetric = file.hyperpipe_info.best_config_metric;
  let maximizeBestConfigMetric = file.hyperpipe_info.maximize_best_config_metric;
  let caption = maximizeBestConfigMetric ? "Max" : "Min";

  // utility range function
  let range = (size, startAt = 0) => [...Array(size).keys()].map(i => i + startAt);

  let traces = [];
  let maxLen = 0; // length of longest optimisation trace
  // create one current_metric_value trace and one $caption_metric_value trace for each fold - aggregate data
  for (const [idx, fold] of file.outer_folds.entries()) {

    let tmp_color = ColorList[idx];
    let tmp_color_lightened = pSBC(0.4, tmp_color);

    let data = fold.tested_config_list.map(conf =>
      conf.metrics_test.filter(op => op.operation === "mean" && op.metric_name === bestConfigMetric)[0].value);

    let currentBest = data[0]
    let bestData = data.map(value => {
      if (maximizeBestConfigMetric) {
        let v = Math.max(value, currentBest);
        currentBest = v;
        return v;
      } else {
        let v = Math.min(value, currentBest);
        currentBest = v;
        return v;
      }
    });

    if (data.length > maxLen)
      maxLen = data.length;

    let traceCurrentMetricValue = {name: `Fold ${fold.fold_nr}`,
                                   type: 'scatter',
                                   mode: "markers",
                                   marker: {color: tmp_color_lightened},
                                   x: range(data.length, 1), y: data};
    let traceBestMetricValue = {name: `Fold ${fold.fold_nr} Best`, mode: "lines",
                                line: {shape: "hv", color: tmp_color},
                                x: range(data.length, 1), y: bestData};

    traces.push(traceCurrentMetricValue, traceBestMetricValue);
  }

  return {
    data: traces,
    layout: {
      title: "",
      xaxis: {
        title: "No of Hyperparameter Configs Tested",
        tickvals: range(maxLen, 1)
      },
      yaxis: {title: bestConfigMetric},
      showlegend: true,
      paper_bgcolor: "rgba(0, 0, 0, 0)",
      plot_bgcolor: "rgba(0, 0, 0, 0)"
   }
  }

}
