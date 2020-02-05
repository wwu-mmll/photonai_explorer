<template>
  <div id="app" class="container">
    <h1>Investigator UI</h1>
    <FileAcceptor :files="files"></FileAcceptor>
    <br />
    <div v-if="this.files.length > 0">
      <h3>Active analyses ({{ this.files.length }})</h3>
      <ul>
        <li v-for="(file, index) in files" :key="index">
          <Visualisation :file="file"></Visualisation>
          <button @click="removeFile(file)" title="Button">Remove entry</button>
        </li>
      </ul>
    </div>
    <div v-else>
      <h3>Drag a .json file into the box above to begin.</h3>
    </div>

    <!-- <Visualisation :file="file" v-for="(file, index) in files" :key="index"></Visualisation> -->
  </div>
</template>

<script>
import FileAcceptor from "./components/FileAcceptor";
import Visualisation from "./components/Visualisation";

export default {
  name: "app",
  components: {
    Visualisation,
    FileAcceptor
  },
  data() {
    return {
      files: []
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
