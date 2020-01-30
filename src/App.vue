<template>
  <div id="app" class="container">
    <h1>Investigator UI</h1>
    <FileAcceptor :files="files"></FileAcceptor>
    <br />
    <h3>Active files</h3>
    <ul>
      <li v-for="(file, index) in files" :key="index">
        {{ index }}. {{ file.name }}
        <button @click="removeFile(file)" title="Button">Remove file</button>
      </li>
    </ul>
    <br />
    <h3>Plots</h3>
    <div class="row">
      <Plot class="col s5" :key="index" :data="data['data']" :layout="data['layout']" v-for="(data, index) in plotData" ></Plot>
      <!--<div class="col s6" v-for="(index, val) in [1,2,3]" :key="index">{{ val }}</div>-->
    </div>
  </div>
</template>

<script>
import FileAcceptor from "./components/FileAcceptor.vue";
import Plot from "./components/Plot.vue";

export default {
  name: "app",
  components: {
    FileAcceptor,
    Plot
  },
  data() {
    return {
      files: [],
      plotData: [
        {
          data: [{
            x: [1, 2, 3, 4, 5],
            y: [2, 4, 6, 8, 10],
            type: "scatter",
            mode: "markers"
          }],
          layout: {
            title: "My graph scatter"
          }
        },
        {
          data: [{
            x: [1, 2, 3, 4, 5],
            y: [2, 4, 6, 8, 10],
            type: "scatter"
          }],
          layout: {
            title: "My graph line"
          }
        },
        {
          data: [{
            x: [1, 2, 3, 4, 5],
            y: [99, 4, -10, 8, 10],
            type: "scatter"
          }],
          layout: {
            title: "My graph third"
          }
        },
      ]
    };
  },
  methods: {
    removeFile(file) {
      this.files = this.files.filter(f => {
        return f != file;
      });
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
