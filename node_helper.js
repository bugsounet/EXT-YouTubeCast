"use strict"

var NodeHelper = require("node_helper")
var log = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function () {
    this.Lib = {}
  },

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        console.log("[NOTI] EXT-YouTubeCast Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.initialize(payload)
      break
    }
  },

  initialize: async function (config) {
    this.config = config
    if (this.config.debug) log = (...args) => { console.log("[CAST]", ...args) }
    log(config)
    let bugsounet = await this.loadBugsounetLibrary()
    if (bugsounet) {
      console.error("[CAST] Warning:", bugsounet, "@bugsounet library not loaded !")
      console.error("[CAST] Try to solve it with `npm run rebuild` in CAST directory")
    }
    else {
      console.log("[CAST] All needed @bugsounet library loaded !")
      this.serverStart()
    }
  },
  
  serverStart: function () {
    log("Starting Cast module...")
    if (this.config.castName) {
      this.cast = new this.Lib.CastServer(
        this.config,
        (noti, params) => this.sendSocketNotification(noti, params),
        this.config.debug
      )
      this.cast.start()
    } else {
      this.sendSocketNotification("WARNING" , {  message: "Cast: castName error" } )
    }
  },

  /** Load require @busgounet library **/
  /** It will not crash MM (black screen) **/
  loadBugsounetLibrary: function() {
    let libraries= [
      // { "library to load" : [ "store library name", "path to check" ] }
      { "@bugsounet/npmcheck": [ "npmCheck", "NPMCheck.useChecker" ] },
      { "@bugsounet/cast": [ "CastServer", "castName" ] }
    ]

    let errors = 0
    return new Promise(resolve => {
      libraries.forEach(library => {
        for (const [name, configValues] of Object.entries(library)) {
          let libraryToLoad = name,
              libraryName = configValues[0],
              libraryPath = configValues[1],
              index = (obj,i) => { return obj[i] }

          // libraryActivate: verify if the needed path of config is activated (result of reading config value: true/false) **/
          let libraryActivate = libraryPath.split(".").reduce(index,this.config)
          if (libraryActivate) {
            try {
              if (!this.Lib[libraryName]) {
                this.Lib[libraryName] = require(libraryToLoad)
                log("Loaded " + libraryToLoad)
              }
            } catch (e) {
              console.error("[CAST]", libraryToLoad, "Loading error!" , e)
              this.sendSocketNotification("WARNING" , {message: "LibraryError", values: libraryToLoad })
              errors++
            }
          }
        }
      })
      resolve(errors)
    })
  }

})
