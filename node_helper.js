"use strict"

var NodeHelper = require("node_helper")
var log = (...args) => { /* do nothing */ }
var LibCast = require("./components/castLib.js")

module.exports = NodeHelper.create({
  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        console.log("[CAST] EXT-YouTubeCast Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.initialize(payload)
      break
    }
  },

  initialize: async function (config) {
    this.config = config
    if (this.config.debug) log = (...args) => { console.log("[CAST]", ...args) }
    this.serverStart()
  },
  
  serverStart: function () {
    log("Starting Cast module...")
    if (this.config.castName) {
      this.cast = new LibCast(
        this.config,
        (noti, params) => this.sendSocketNotification(noti, params),
        this.config.debug
      )
      this.cast.start()
    } else {
      this.sendSocketNotification("CAST_WARNING")
    }
  }
})
