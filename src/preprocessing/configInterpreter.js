/**
 * File containing functions for human readable config uniformity.
 */

export { normalizeConfig, formatHRC, getAttributes }

/*let sampleInput = {
  "PCA": [
    "n_components=0.6824498291365451",
    "disabled=True"
  ],
  "ImbalancedDataTransformer": [
    "method_name=SMOTE",
    "disabled = False"
  ],
  "estimators": [
    "DecisionTreeClassifier__branch__min_samples_split=2",
    "LinearSVC__C=18.946803550125505"
  ]
};

let sampleResult = {
  "name": "root",
  "type": "parent",
  "value": [
    {
      "name": "PCA",
      "type": "parent",
      "value": [
        {
          "type": "value",
          "name": "n_components",
          "value": "0.6824498291365451"
        },
        {
          "type": "value",
          "name": "disabled",
          "value": "True"
        }
      ]
    },
    {
      "name": "ImbalancedDataTransformer",
      "type": "parent",
      "value": [
        {
          "type": "value",
          "name": "method_name",
          "value": "SMOTE"
        },
        {
          "type": "value",
          "name": "disabled ",
          "value": " False"
        }
      ]
    },
    {
      "name": "estimators",
      "type": "parent",
      "value": [
        {
          "type": "parent",
          "name": "DecisionTreeClassifier",
          "value": [
            {
              "name": "branch",
              "value": [
                {
                  "name": "min_samples_split",
                  "value": "2",
                  "type": "value"
                }
              ],
              "type": "parent"
            }
          ]
        },
        {
          "type": "parent",
          "name": "LinearSVC",
          "value": [
            {
              "name": "C",
              "value": "18.946803550125505",
              "type": "value"
            }
          ]
        }
      ]
    }
  ]
}*/

function prepare_pipeline(root_object, pipeline_structure){

  for (let [element_name, element_value] of Object.entries(pipeline_structure)) {

    // prep entry
    let entry = {name: element_name, type: "parent", value: [], class: ""};

    let photon_element_precursor = element_name.split(":", 2)
    if (photon_element_precursor.length > 1){
      entry["name"] = photon_element_precursor[1];
      entry["class"] = photon_element_precursor[0];
    }

    if (typeof element_value === 'string' || element_value instanceof String){
      entry["class"] = element_value;
    }
    else{
      prepare_pipeline(entry, element_value);
    }
    root_object.value.push(entry);
  }
  return root_object
}

/**
 * Main function to turn a human_readable_config object to a uniformly interpretable object.
 * TODO make sure multiple basic attributes of 'deeper' objects are displayed as one
 * @param human_readable_config
 */
function normalizeConfig(human_readable_config, pipeline_structure) {
  let output = {name: ":root", type: "parent", value: [], class: "Hyperpipe"};
  let pipeline_stub = prepare_pipeline(output, pipeline_structure);

  // iterate over hyperparameters
  for (let [param_key, param_value] of Object.entries(human_readable_config)) {

    // find belonging element in pipeline
    param_key = param_key.replace(" ", "");
    let curr_obj = pipeline_stub;
    let splitted_param_key = param_key.split("__");
    (splitted_param_key).forEach(name =>{
      name = name.replace(" ", "");
      curr_obj = curr_obj.value.filter(obj => obj.name == name)[0]
    });

    // copy and tidy parameters
    let valueArray = tidyJSON(param_value);

    // distribute parameters to elements
    (valueArray).forEach(parameter =>{

      let param_obj = curr_obj;
      let splitted_param_value = parameter.split("__");
      if (splitted_param_value.length > 1){
        for (let i = 0; i < splitted_param_value.length - 1; i++) {
          let search_name = splitted_param_value[i].replace(" ", "");
          param_obj = param_obj.value.filter(obj => obj.name == search_name)[0];
        }
        parameter = splitted_param_value[splitted_param_value.length -1];
      }

      let outputObject = {...parseParameter(parameter), ...{type: "value"}};
      if(!param_obj){
        console.log("param_obj is None");
        console.log(valueArray);
      }
      param_obj.value.push(outputObject)
    })
  }


    // prep entry
    // // let entry = {name: key, type: "parent", value: []};
    // //
    // // // iterate over array values and check for nesting / unparsed JSON. Using basic array syntax to facilitate extension
    // // // during iteration in case unparsed JSON is detected
    // let valueArray = value.slice(); // Create copy to possibly extend
    // for (let i = 0; i < valueArray.length; i++) {
    //   let s = valueArray[i];
    //   // check for unparsed JSON. In case some is detected the new strings are appended and this iteration is skipped
    //   let jsonCheck = correctUnparsedJSON(s);
    //   if (jsonCheck.length > 0) {
    //     valueArray.push(...jsonCheck);
    //     continue;
    //   }
    //
    //   let outputObject = {type: "value"}; // object to be added to final product. Default type is value
    //   let outputPair = outputObject;      // object holding key/value pair. Reference will be overwritten if nesting exists
    //   let splitString =  s;                // String containing 'key=value'
    //
    //
    //   if (s.includes("__")) {
    //     // case: further splitting needed
    //     let parents = s.split("__");  // elements 0..n-2 contain object names
    //
    //     let tObj = outputObject;      // "Pointer" updated as we go deeper, aka. recursion avoidance^10
    //     for (let i = 0; i < parents.length - 1; i++) {
    //       let nObj = {};
    //       tObj.name = parents[i];
    //       tObj.value = [nObj];
    //       tObj.type = "parent"
    //       tObj = nObj;
    //     }
    //
    //     // set deepest object (tObj) to outputPair and set splitString to last value in __ split array
    //     outputPair = tObj;
    //     splitString = parents.pop();
    //
    //   }
    //
    //   // add all values
    //   let splitPair = splitString.split("=", 2);
    //   if (splitPair.length == 1) { // Handle standalone values
    //     splitPair[1] = "-"
    //   }
    //   outputPair.name = splitPair[0].trim();
    //   let rawValue = splitPair[1].trim();
    //   outputPair.value = (!isNaN(parseFloat(rawValue)) && !Number.isInteger(rawValue)) ? parseFloat(rawValue) : rawValue; // parse
    //
    //
    //   outputPair.type = "value"
    //
    //   entry.value.push(outputObject);
    // }
    //
    // output.value.push(entry);

  return output;
}

/**
 * Function checks if given string {@code s} contains unparsed JSON and returns an array of strings containing
 * one '=' separated key / value pair, conforming with regular syntax.
 * @param s {String} String to be analysed
 * @return {String[]} Array of corrected strings. If no unparsed JSON is found an empty array is returned
 */
function correctUnparsedJSON(s) {
  let newStrings = [];

  if (s.includes(":") && s.includes("{") && s.includes("}")) {
    // case: String contains unparsed JSON

    let replaceAll = (target, search, replacement) => {
      return target.replace(new RegExp(search, 'g'), replacement);
    };

    // remove any JSON format characters, except separators
    let reducedString = s.replace("{", "").replace("}", "");
    reducedString = replaceAll(reducedString, ":", "=");
    reducedString = replaceAll(reducedString, "'", "");

    newStrings = reducedString.split(",")
  }

  return newStrings;
}

/**
 * This function checks an object for half-parsed json.
 * @param {Array} param_value Expects photonai human-readable-config param_values
 * @return {Array} tidies param values
 */
function tidyJSON(param_value){
  let valueArray = [];
  for (let i = 0; i < param_value.length; i++) {
    let s = param_value[i];
    // check for unparsed JSON. In case some is detected the new strings are appended and this iteration is skipped
    let jsonCheck = correctUnparsedJSON(s);
    if (jsonCheck.length > 0) {
      valueArray.push(...jsonCheck);
      continue;
    }
    else{
      valueArray.push(s);
    }
  }
  return valueArray
}

Number.prototype.countDecimals = function () {
  if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
  return this.toString().split(".")[1].length || 0;
}

/**
 * This function parses a paramter = value string.
 * @param {String} parameter Expects something like "SVC=1.23823"
 * @return {Object} Returns name and correctly parsed value of parameter
 */
function parseParameter(parameter){
  let outputObject = Object();
  parameter.replace(" ", "");
  let splitPair = parameter.split("=", 2);
  if (splitPair.length == 1) { // Handle standalone values
    splitPair[1] = "";
  }
  outputObject["name"] = splitPair[0].trim();
  let rawValue = splitPair[1].trim();
  let value_to_set = rawValue;
  if (Number.isInteger(rawValue)){
    value_to_set = parseInt(rawValue);
  }
  else{
    let parsed_value = parseFloat(rawValue);

    if (!isNaN(parsed_value) && !Number.isInteger(rawValue)) {
      if (parsed_value.countDecimals() > 4) {
        value_to_set = parsed_value.toFixed(4);
      } else {
        value_to_set = parsed_value;
      }
    }
  }


  outputObject["value"] = value_to_set
  return outputObject;
}


/**
 * This function formats any normalised config into a string.
 * @param {Object} config Expects normalised config (initially provided by {@link normalizeConfig}).
 * @param {String} element_name Expects namespace of element to identify it in the pipeline.
 * @return {String} String representation of given config (contains html tags).
 */
function formatHRC(config){

  let outputArray = {};
  for (let [param_key, param_value] of Object.entries(config)) {

    let namespace_praefix = param_key.replace("__", ".");
    let valueArray = tidyJSON(param_value);

    // distribute parameters to elements
    (valueArray).forEach(parameter =>{

      let splitted_param_value = parameter.split("__");
      parameter = parseParameter(splitted_param_value.pop());
      let namespace_postfix = splitted_param_value.join(".");

      // add all values
      let parameter_object_key = [namespace_praefix, namespace_postfix].join(".");
      if (parameter_object_key.endsWith(".")) parameter_object_key = parameter_object_key.slice(0, -1);
      if (!(parameter_object_key in outputArray)){
        outputArray[parameter_object_key] = [parameter]
      }
      else{
        outputArray[parameter_object_key].push(parameter)
      }
    })
  }

  let html_output = [];
  for (let [namespace, parameters] of Object.entries(outputArray)) {
    let output_string = "";
    let parameter_strings = parameters.map(param_obj =>
      `<b>${param_obj["name"]}</b>=<i>${param_obj["value"]}</i>`);
    if (parameter_strings.length > 1){
      output_string = `${namespace}: ${parameter_strings.join(", ")}`;
    }
    else{
      output_string = `${namespace}: ${parameter_strings[0]}`;
    }

    html_output.push(output_string);
  }
  return html_output.join("<br>")
}

/**
 * Returns a flat object containing all attributes as keys and their values. Duplicate keys are overwritten so you might
 * get its 'last' version.
 * @param config Expects normalised config (provided by {@link normalizeConfig}).
 * @return {Object} flat object containing all attributes as keys and their values
 */
function getAttributes(config) {
  let result = {};
  getAttributesInternal(config, result);
  return result;
}

/**
 * Internal, recursing function to get all the attributes
 * @param config normalised config
 * @param result object to write results to
 */
function getAttributesInternal(config, result) {
  if (config.type === "parent") {
    for (const child of config.value) {
      getAttributesInternal(child, result);
    }
  } else {
    result[config.name] = config.value;
  }
}