<template>
  <div>
    <div
      class="dropZone card-panel hoverable"
      @drop.prevent="addFile"
      @dragover.prevent
    >
      <span class="white-text flow-text">
        I eat your files! NomNomNom
      </span>
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
      [...droppedFiles].forEach(f => {
        // process given file
        f.text().then(text => {
          window.console.log(`${f.name} loaded`);

          try {
            this.files.push(JSON.parse(text));
            this.updateCallback()
          } catch (e) {
            if (e instanceof SyntaxError) {
              alert("No json recognised!")
            } else {
              throw e; // let others bubble up
            }
          }

          //this.description = `${f.name} - Project: ${jsonfile["name"]}`;
        });
        window.console.log(`${f.name} processed`);
      });
    }
  }
};
</script>

<style>
  div.dropZone {
    background-color: var(--photon-gray);
    height: 200px;
  }
</style>