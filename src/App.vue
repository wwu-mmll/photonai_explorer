<template>
  <div id="app">
    <video playsinline autoplay muted loop poster="assets/img/index_back.jpg" id="videoBackground"
           v-show="this.files.length === 0">
      <source src="../assets/video/SlowMotion3.mp4" type="video/mp4">
      Browser does not support HTML5 video.
    </video>
    <div :class="[(this.files.length === 0) ? videoContentClass : contentClass]">
      <h1>Photon Explorer</h1>
      <FileAcceptor :files="files"></FileAcceptor>
      <br/>
      <div v-if="this.files.length > 0">
        <h3>Active analyses ({{ this.files.length }})</h3>
        <ul>
          <li v-for="(file, index) in files" :key="index">
            <Visualisation :file="file"></Visualisation>
            <br>
            <button @click="removeFile(file)" title="Button" class="btn-style waves-light btn-small">Remove entry</button>
          </li>
        </ul>
      </div>
      <div v-else>
        <h3>Drag a suitable .json file into the box above to begin.</h3>
      </div>
    </div>
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
        files: [],
        contentClass: "content container",
        videoContentClass: "contentVideo"
      };
    },
    methods: {
      removeFile(file) {
        this.files = this.files.filter(f => {
          return f !== file;
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
    color: var(--photon-light);
    margin-top: 60px;
  }

  #videoBackground {
    position: fixed;
    right: 0;
    top: 0;
    min-width: 100%;
    min-height: 100%;
  }

  .contentVideo {
    position: fixed;
    left: 7.5%;
    right: 7.5%;
  }

  .content {
    color: black;
  }

  button.btn-style {
    background-color: var(--photon-gray);
  }
</style>
