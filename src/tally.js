import md5 from "../node_modules/blueimp-md5/js/md5"

function iOS() {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  )
}

class Tally {
  constructor(options) {
    this.options = options
    this.baseUrl = options.apiUrl
      ? options.apiUrl
      : `https://tally-data-dev.s3.amazonaws.com`
    this.id = options.id
      ? md5(window.location.href + options.id.toString()).toString()
      : md5(window.location.href).toString()
    this.interval = options.interval ? options.interval : 1000

    this.running = false
    this.count = 0
    this.loop = null
    this.stop = this.stop

    window.addEventListener("beforeunload", async (e) => {
      // console.log(`BEFOREUNLOAD`);
      this.unload()
    })

    window.addEventListener("unload", async (e) => {
      // console.log(`UNLOAD`);
      this.unload()
    })

    document.addEventListener("visibilitychange", (e) => {
      // console.log(`VISIBILITYCHANGE ${document.visibilityState}`);

      if (
        document.visibilityState === "hidden" ||
        document.visibilityState === "unloaded"
      ) {
        this.unload()
      } else if (document.visibilityState === "visible") {
        this.add()
      }
    })

    if (iOS()) {
      window.addEventListener("pagehide", (e) => {
        // console.log(`PAGEHIDE`);
        this.unload()
      })

      window.addEventListener("pageshow", (e) => {
        // console.log(`PAGESHOW`);
        this.add()
      })
    }

    this.start()
  }

  async start() {
    if (!this.running) {
      await this.add()

      this.loop = setInterval(async () => {
        await this.get()
      }, this.interval)

      this.running = true
    }
  }

  dispatch() {
    const event = new CustomEvent("tally.change", {
      detail: { count: this.count, running: this.running },
    })
    window.dispatchEvent(event)

    if (this.options.change) {
      this.options.change({
        count: this.count,
        running: this.running,
      })
    }
  }

  async add() {
    // console.log("ADD BEACON");
    await this.get()

    await fetch(`${this.baseUrl}/${this.id}.txt`, {
      method: "put",
      body: this.count + 1,
    })

    this.dispatch()
  }

  async get() {
    try {
      const res = await fetch(`${this.baseUrl}/${this.id}.txt`)
      if (!res.ok) {
        throw new Error("NO FILE")
      }

      this.count = parseInt(await res.text())
      this.dispatch()
    } catch (e) {
      console.log(e.message)

      await this.create()
      await this.get()
    }
  }

  async create() {
    await fetch(`${this.baseUrl}/${this.id}.txt`, { method: "put", body: 0 })
  }

  unload() {
    // console.log(`UNLOAD`)
    fetch(`${this.baseUrl}/${this.id}.txt`, {
      method: "put",
      body: this.count > 0 ? this.count - 1 : 0,
      keepalive: true,
    })
  }

  stop() {
    clearInterval(this.loop)
    this.unload()
    this.running = false
  }
}

export default Tally
