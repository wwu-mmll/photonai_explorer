# About the `createPlot` configuration object

For indicating what type of plot data is needed the enumeration-like object `PlotTypes`, exported by `plotCreation.js` can be used.
In addition to the type some plots require additional data. The table below shows more details on who needs what:

| Plot Type        | `foldNo` | `innerFoldNo` | `configIndex` |
| :--------------- | :------: | :-----------: | ------------: |
| `showPipeline`   |    N     |       N       |        N      |
| `showOuterFold`  |    Y     |       N       |        N      |
| `compareConfigs` |    Y     |       N       |        N      |
| `testedConfig`   |    Y     |       Y       |        Y      |
| `innerFoldConfig`|    Y     |       N       |        Y      |  


## Exampe usage

Using the config could look like this:

```js
let config = {type: PlotTypes.showOuterFold,
              foldNo: 2}
let result = createPlot(this.file, config)
```
