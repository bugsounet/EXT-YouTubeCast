/**
 ** Module : EXT-YouTubeCast
 ** @bugsounet
 ** ©02-2022
 ** support: https://forum.bugsounet.fr
 **/

/**
 * Todo : make EXT-Alert for library not loaded
 **/

logCast = (...args) => { /* do nothing */ }

Module.register("EXT-YouTubeCast", {
  defaults: {
    debug: true,
    fullscreen: false,
    alwaysDisplayed: true,
    width: "30vw",
    height: "17vw",
    castName: "MagicMirror",
    port: 8569,
    NPMCheck: {
      useChecker: true,
      delay: 10 * 60 * 1000,
      useAlert: true
    }
  },

  start: function () {
    //override user set !
    if (this.data.position== "fullscreen_above" || this.data.position== "fullscreen_below") this.config.fullscreen = true
    if (!this.data.position) this.data.position= "top_center"
    if (this.config.debug) logCast = (...args) => { console.log("[CAST]", ...args) }
    this.castActive = false
  },

  getStyles: function () {
    return [
      "EXT-YouTubeCast.css",
    ]
  },

  getDom: function() {
    var wrapper = document.createElement('div')
    wrapper.id = "EXT-CAST_WINDOW"
    if (this.config.fullscreen) {
      wrapper.className = "hidden"
      return wrapper
    }

    if (!this.config.alwaysDisplayed && !this.config.fullscreen) this.hide(0, {lockString: "EXT-CAST_LOCKED"})
    wrapper.style.width = this.config.width
    wrapper.style.height = this.config.height
    var CASTLogo= document.createElement('img')
    CASTLogo.id = "EXT-CAST_LOGO"
    CASTLogo.src = "modules/EXT-YouTubeCast/resources/cast-Logo.png"
    wrapper.appendChild(CASTLogo)

    var CASTPlayer = document.createElement("webview")
    CASTPlayer.id = "EXT-CAST"
    CASTPlayer.useragent= "Mozilla/5.0 (SMART-TV; Linux; Tizen 2.4.0) AppleWebkit/538.1 (KHTML, like Gecko) SamsungBrowser/1.1 TV Safari/538.1"
    CASTPlayer.scrolling="no"
    CASTPlayer.classList.add("hidden")

    wrapper.appendChild(CASTPlayer)
    return wrapper
  },

  notificationReceived: function(noti, payload) {
    switch(noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.config)
        this.sendNotification("EXT_HELLO", this.name)
        if (this.config.fullscreen) this.preparePopup()
        break
      case "EXT_STOP":
        if (!this.castActive) return
        this.broadcastStatus("END")
        this.castStop()
    }
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      /** cast module **/
      case "CAST_START":
        this.sendNotification("EXT_ALERT", {
          type: "information",
          message: this.translate("CastStart"),
          icon: "modules/EXT-YouTubeCast/resources/cast-icon.png"
        })
        this.broadcastStatus("START")
        this.castStart(payload)
        break
      case "CAST_STOP":
        this.sendNotification("EXT_ALERT", {
          type: "information",
          message: this.translate("CastStop"),
          icon: "modules/EXT-YouTubeCast/resources/cast-icon.png"
        })
        this.broadcastStatus("END")
        this.castStop()
        break
    }
  },

  broadcastStatus: function(status) {
    switch (status) {
      case "START":
        this.sendNotification("EXT_YOUTUBECAST-CONNECTED")
        this.castActive = true
        break
      case "END":
        this.sendNotification("EXT_YOUTUBECAST-DISCONNECTED")
        this.castActive = false
        break
    }
  },

  castStart: function (url) {
    if (this.config.fullscreen) this.modulesHide()
    var CASTPlayer = document.getElementById("EXT-CAST")
    var CASTLogo = document.getElementById("EXT-CAST_LOGO")

    if (!this.config.alwaysDisplayed && !this.config.fullscreen) this.show(0, {lockString: "EXT-CAST_LOCKED"})
    if (!this.config.fullscreen) CASTLogo.className= "hidden"
    CASTPlayer.classList.remove("hidden")
    CASTPlayer.src = url
  },

  castStop: function () {
    var CASTPlayer = document.getElementById("EXT-CAST")
    var CASTLogo = document.getElementById("EXT-CAST_LOGO")

    CASTPlayer.classList.add("hidden")
    CASTPlayer.src= "about:blank?&seed="+Date.now()
    if (!this.config.fullscreen) CASTLogo.classList.remove("hidden")
    if (!this.config.alwaysDisplayed && !this.config.fullscreen) this.hide(0, {lockString: "EXT-CAST_LOCKED"})
    if (this.config.fullscreen) this.modulesShow()
  },

  modulesHide: function () {
    MM.getModules().enumerate((module)=> {
      module.hide(100, {lockString: "EXT_LOCKED"})
    })
  },

  modulesShow: function () {
    MM.getModules().enumerate((module)=> {
      module.show(100, {lockString: "EXT_LOCKED"})
    })
  },

  preparePopup: function () {
    var CASTPlayer = document.createElement("webview")
    CASTPlayer.id = "EXT-CAST"
    CASTPlayer.useragent= "Mozilla/5.0 (SMART-TV; Linux; Tizen 2.4.0) AppleWebkit/538.1 (KHTML, like Gecko) SamsungBrowser/1.1 TV Safari/538.1"
    CASTPlayer.scrolling="no"
    CASTPlayer.classList.add("hidden", "fullscreen")
    document.body.appendChild(CASTPlayer)
  }
})
