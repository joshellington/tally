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
    this.baseUrl = `https://djysg7o0wl.execute-api.us-west-2.amazonaws.com/dev`;
    this.id = this.options.id
      ? CryptoJS.MD5(
          window.location.href + this.options.id.toString()
        ).toString()
      : CryptoJS.MD5(window.location.href).toString();
    this.count = 0;
    this.counted = false;

    console.log(`TALLY`, this.baseUrl, this.id);

    window.addEventListener("load", this.add.bind(this));

    window.addEventListener("beforeunload", async (e) => {
      console.log(`BEFOREUNLOAD`);
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
    setInterval(
      async () => {
        this.count = await this.get();
        this.dispatch();
      },
      this.options.interval ? this.options.interval : 1000
    );
  }

  dispatch() {
    const event = new CustomEvent(`tally`, { detail: { count: this.count } });
    window.dispatchEvent(event);

    if (this.options.change) {
      this.options.change(this.count);
    }
  }

  async get() {
    console.log(`GET`);
    let res = await fetch(`${this.baseUrl}/${this.id}`);
    return await res.text();
  }

  async add() {
    if (!this.counted) {
      console.log(`ADD`);
      this.counted = true;
      navigator.sendBeacon(`${this.baseUrl}/${this.id}`);
    }
  }

  unload() {
    if (this.counted) {
      console.log(`UNLOAD`);
      this.counted = false;
      navigator.sendBeacon(`${this.baseUrl}/${this.id}/remove`);
    }
  }
}

export default Tally;
