import md5 from "../node_modules/blueimp-md5/js/md5";

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
  );
}

class Tally {
  constructor(options) {
    this.options = options;
    this.baseUrl = this.options.apiUrl
      ? this.options.apiUrl
      : `https://djysg7o0wl.execute-api.us-west-2.amazonaws.com/dev`;
    this.id = this.options.id
      ? md5(window.location.href + this.options.id.toString()).toString()
      : md5(window.location.href).toString();

    this.status = 0;
    this.count = 0;
    this.counted = false;
    this.interval = null;

    console.log(`TALLY`, this.baseUrl, this.id);

    window.addEventListener("load", (e) => {
      console.log(`LOAD`);
      this.add();
    });

    window.addEventListener("beforeunload", async (e) => {
      console.log(`BEFOREUNLOAD`);
      this.unload();
    });

    window.addEventListener("unload", async (e) => {
      console.log(`UNLOAD`);
      this.unload();
    });

    document.addEventListener("visibilitychange", (e) => {
      console.log(`VISIBILITYCHANGE ${document.visibilityState}`);

      if (
        document.visibilityState === "hidden" ||
        document.visibilityState === "unloaded"
      ) {
        this.unload();
      } else if (document.visibilityState === "visible") {
        this.add();
      }
    });

    if (iOS()) {
      window.addEventListener("pagehide", (e) => {
        console.log(`PAGEHIDE`);
        this.unload();
      });

      window.addEventListener("pageshow", (e) => {
        console.log(`PAGESHOW`);
        this.add();
      });
    }

    this.init();
  }

  async init() {
    if (this.status === 0) {
      await this.get();

      this.interval = setInterval(
        async () => {
          await this.get();
        },
        this.options.interval ? this.options.interval : 1000
      );

      this.status = 1;
    }
  }

  dispatch() {
    const event = new CustomEvent(`tally`, { detail: { count: this.count } });
    window.dispatchEvent(event);

    if (this.options.change) {
      this.options.change({
        count: this.count,
        status: this.status,
        counted: this.counted,
      });
    }
  }

  async get() {
    console.log(`GET`);
    let res = await fetch(`${this.baseUrl}/${this.id}`);
    this.count = await res.text();
    this.dispatch();

    return this.count;
  }

  async add() {
    if (!this.counted) {
      console.log(`ADD BEACON`);
      this.counted = true;
      navigator.sendBeacon(`${this.baseUrl}/${this.id}`);
    }
  }

  unload() {
    if (this.counted) {
      console.log(`UNLOAD BEACON`);
      this.counted = false;
      navigator.sendBeacon(`${this.baseUrl}/${this.id}/remove`);
    }
  }

  destroy() {
    if (this.status === 1) {
      clearInterval(this.interval);
      this.status = 0;
    }
  }
}

export default Tally;
