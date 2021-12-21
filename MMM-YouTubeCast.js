/**
 ** Module : MMM-YouTubeCast
 ** @bugsounet
 ** ©01-2021
 ** support: http://forum.bugsounet.fr
 **/

logCast = (...args) => { /* do nothing */ }

Module.register("MMM-YouTubeCast", {
  defaults: {
    debug: true,
    castName: "MagicMirror",
    port: 8569,
    NPMCheck: {
      useChecker: true,
      delay: 10 * 60 * 1000,
      useAlert: true
    }
  },

  start: function () {
    if (this.config.debug) logCast = (...args) => { console.log("[CAST]", ...args) }
  },

  getScripts: function() {
    return [ ]
  },

  getStyles: function () {
    return [
      "MMM-YouTubeCast.css",
      "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
    ]
  },

  getDom: function() {

  },

  notificationReceived: function(noti, payload) {
    switch(noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.config)
        this.preparePopup()
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      /** cast module **/
      case "CAST_START":
        this.sendSocketNotification("SCREEN_WAKEUP")
        //this.Informations("information", { message: "CastStart" })
        this.castStart(payload)
        break
      case "CAST_STOP":
        //this.Informations("information", { message: "CastStop" })
        this.castStop()
        break
    }    
  },

  castStart: function (url) {
    /** emulation of displaying links **/
    // stop all other EXT
    var webView = document.getElementById("EXT_CAST")
    logCast("Cast Loading", url)
    this.castShow()
    // lock EXT
    webView.src= url
  },

  castStop: function () {
    this.HideCast()
  },

  castShow: function () {

  },

  castHide: function () {

  },

  preparePopup: function () {
    var Cast = document.createElement("webview")
    Cast.useragent= "Mozilla/5.0 (SMART-TV; Linux; Tizen 2.4.0) AppleWebkit/538.1 (KHTML, like Gecko) SamsungBrowser/1.1 TV Safari/538.1"
    Cast.id = "EXT_CAST"
    Cast.scrolling="no"
    Cast.classList.add("hidden")
    document.body.appendChild(Cast)
  }

})
