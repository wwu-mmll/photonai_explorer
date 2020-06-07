<!-- Redesigned root page containing navbar & co -->
<template>
  <div id="app">
    <!-- Navigation -->
    <div class="navbar-fixed">
      <nav>
        <div class="nav-wrapper">
          <a @click="pageNo = -1" href="#" class="left logoText">PHOTON Explorer</a>
          <hr v-show="files.length !== 0" class="separatorMain">
          <ul id="nav-mobile" class="hide-on-med-and-down">
            <li v-for="(file, index) in files" :key="index">
              <a style="display: inline-block" href="#" @click="pageNo = index">{{ file.name }}</a>
              <a @click="removeFile(file)" class="btn-flat"><i class="material-icons">close</i></a>
              <hr v-show="index !== files.length - 1" class="separatorMinor">
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <!-- Content -->
    <div>
      <Landingpage class="centered" v-show="showPage(-1)" :files="files" :update-callback="updatePage"></Landingpage>
      <Visualisation class="content" v-show="showPage(index)" v-for="(file, index) in files" :file="file" :key="index"></Visualisation>
    </div>

  </div>
</template>

<script>
    import Landingpage from "./components/Landingpage";
    import Visualisation from "./components/Visualisation";

    export default {
        name: "App",
        components: {
            Landingpage,
            Visualisation,
        },
        data() {
            return {
                files: [],
                pageNo: -1     // Current page number. -1 is landing page
            };
        },
        methods: {
            removeFile(file) {
                let remPageIndex = this.files.indexOf(file);
                this.files = this.files.filter(f => {
                    return f !== file;
                });

                // handle page state
                if (this.pageNo === remPageIndex) {
                    // case: current page is equal to removed index: goto previous page
                    this.pageNo--;
                } else if (this.pageNo > remPageIndex) {
                    // case: current page is after removed index: increase pageNo to stay on same page
                    this.pageNo--;
                }
            },
            showPage(page) {
                return this.pageNo === page;
            },
            updatePage() {
                this.pageNo = this.files.length - 1;
            }
        }
    }
</script>

<style scoped>
  #app {
    font-family: "Oxygen-Regular", "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: var(--photon-light);
  }

  nav .logoText {
    padding-left: 10px;
    font-size: 2.1rem;
  }

  nav .logo {
    vertical-align: middle;
    max-height: 3rem;
  }

  nav .separatorMain {
    display: inline;
    vertical-align: middle;
    float: left;
    height: 3rem;
    border-color: var(--photon-light);
    margin-left: 10px;
  }

  nav .separatorMinor {
    display: inline;
    border-color: var(--photon-gray);
  }

  nav {
    background-color: var(--photon-purple);
  }

  .content {
    color: black;
    margin: auto;
    width: 90%;
  }

  .centered {
    position: absolute;
    margin: auto;
    top: 33%;
    right: 0;
    bottom: 0;
    left: 0;
  }

  li .btn-flat {
    margin: 0;
    padding-left: 0;
    color: inherit;
  }
</style>