<!-- Landing / root page component with file drop. Child of App and sibling of all visualisations -->

<template>
  <div class="landingpage">
    <div>
      <video playsinline autoplay muted loop poster="assets/img/index_back.jpg" id="videoBackground">
        <source src="../../assets/video/SlowMotion3.mp4" type="video/mp4">
        Browser does not support HTML5 video.
      </video>
      <div id="bgpic"></div>
    </div>
    <div class="filemanager container">
      <FileAcceptor :files="files" :update-callback="updateCallback"></FileAcceptor>
      <h3 v-show="files.length === 0">Drag a suitable .json file into the box above to begin.</h3>
    </div>
  </div>
</template>

<script>
    import FileAcceptor from "./FileAcceptor";

    export default {
        name: "Landingpage",
        components: {
            FileAcceptor
        },
        props: {
            files: Array,
            updateCallback: Function
        }
    }
</script>

<style scoped>
  #videoBackground {
    position: fixed;
    right: 0;
    top: 0;
    min-width: 100%;
    min-height: 100%;
    z-index: -100;
  }

  #bgpic {
    position: fixed;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    z-index: -90;
    -ms-transform: translateX(-50%) translateY(-50%);
    -moz-transform: translateX(-50%) translateY(-50%);
    -webkit-transform: translateX(-50%) translateY(-50%);
    transform: translateX(-50%) translateY(-50%);
    background-size: cover;
    background: url("../../assets/img/index_back.png") no-repeat bottom center;
  }

  div .filemanager {

  }
</style>