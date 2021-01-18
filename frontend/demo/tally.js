import beforeunloadRequest from './node_modules/beforeunload-request/dist/beforeunload-request.esm.js'

function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

class Tally {
  constructor() {
    this.baseUrl = `http://192.168.0.124:3000/dev`;
    this.id = CryptoJS.MD5(window.location.href).toString();

    console.log(`TALLY`, this.baseUrl, this.id);
    
    window.addEventListener("load", this.add.bind(this));
    window.addEventListener("beforeunload", this.unload.bind(this));
    if (iOS()) {
      window.addEventListener("pagehide", this.unload.bind(this));
    }
    this.init();
  }

  async init() {
    setInterval(async () => {
      const count = await this.get();
      const event = new CustomEvent(`tally`, { detail: count });
      window.dispatchEvent(event);
    }, 1000)
  }

  async get() {
    let res = await fetch(`${this.baseUrl}/${this.id}`)
    return await res.text()
  }

  async add() {
    return await fetch(`${this.baseUrl}/${this.id}`, { method: 'post' })
  }

  async remove() {
    return await fetch(`${this.baseUrl}/${this.id}`, { method: 'delete' })
  }

  unload() {
    beforeunloadRequest(`${this.baseUrl}/${this.id}`, { method: 'delete' });
  }
}

export default Tally