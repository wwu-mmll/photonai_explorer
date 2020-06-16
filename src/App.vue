<!-- Redesigned root page containing navbar & co -->
<template>
  <div id="app">
    <!-- Navigation -->
    <div class="navbar-fixed">
      <nav>
        <div class="nav-wrapper">

          <!--<hr v-show="files.length !== 0" class="separatorMain">-->
          <ul id="nav-mobile" class="hide-on-med-and-down">
            <li v-for="(file, index) in files" :key="index">
              <a style="display: inline-block" href="#" @click="pageNo = index">{{ file.name }}</a>
              <a @click="removeFile(file)" class="btn-flat"><i class="material-icons">close</i></a>
            </li>
          </ul>
          <a @click="pageNo = -1" href="#" class="right photon-logo">PHOTON<span class="ai">AI</span></a>
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
