# About the `createPlot` configuration object

For indicating what type of plot data is needed the enumeration-like object `PlotTypes`, exported by `plotCreation.js` can be used.
In addition to the type some plots require additional data. The table below shows more details on who needs what:

| Plot Type        | `foldNo` | `configIndex` |
| :--------------- | :------: | ------------: |
| `showPipeline`   |    N     |        N      |
| `showOuterFold`  |    Y     |        N      |
| `compareConfigs` |    Y     |        N      |
| `testedConfig`   |    Y     |        Y      |
| `config`         |    Y     |        Y      |  

At the time of this commit only `showPipeline` is implemented.

## Exampe usage

Using the config could look like this:

```js
let config = {type: PlotTypes.showOuterFold,
              foldNo: 2}
let result = createPlot(this.file, config)
```
