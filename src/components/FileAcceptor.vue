<template>
  <div class="dropZoneWrapper">
    <h1 class="explorer-logo">Explorer</h1>
    <h3>Inspect your training, optimization and evaluation results.</h3>
    <div
      class="dropZone card-panel hoverable" @drop.prevent="addFile" @dragover.prevent>
      <p class="dropInfo">
        Drag your output .json file into this box.</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    files: Array,
      updateCallback: Function
  },
  methods: {
    addFile(e) {
      let droppedFiles = e.dataTransfer.files;
      if (!droppedFiles) return;
      droppedFiles.forEach(f => {
        // process given file
        let reader = new FileReader();
        reader.onload = () => {
          try {
            this.files.push(JSON.parse(reader.result.replace(/\bNaN\b/g, "null")));
            this.updateCallback()
          } catch (e) {
            if (e instanceof SyntaxError) {
              alert("No json recognised!")
            } else {
              throw e; // let others bubble up
            }
          }
        }
        reader.readAsText(f);
        window.console.log(`${f.name} processed`);
      });
    }
  }
};
</script>

<style>
  div.dropZone {
    background-color: var(--photon-purple);
    color: var(--photon-white);
    opacity: .7;
    min-height: 150px;
    margin-top: 50px;
    border: var(--photon-blue) solid 2px;
  }
  div.dropZone:hover{
    background-color: var(--photon-very-dark);
    color: var(--photon-blue);
  }
  .dropZoneWrapper{
    margin-top: 200px;
  }
  .dropZoneWrapper h3{
    margin-top: 0px;
    font-weight: normal;
  }
  .dropZoneWrapper h1{
    margin: 0px 0px 10px 0px;
    padding: 0px;
    letter-spacing: 10px;
  }
  .dropZoneWrapper .dropInfo{
    font-weight: bold;
    font-size: 1.2em;
    padding-top: 10px;
  }
</style>