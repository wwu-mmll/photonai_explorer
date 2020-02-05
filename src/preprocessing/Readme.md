# About the `createPlot` configuration object
Currently only a enumeration-like object, exported by `plotCreation.js` is expected.  
`PlotTypes` contains the following attributes:
- `showPipeline`
- `showOuterFold`
- `compareConfigs`  

At the time of this commit only `showPipeline` is implemented. The config object will carry more weight, once more complex plots are implemented, like comparisons etc.

