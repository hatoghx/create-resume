Resume.font = (function () {
  var FILE = "font/NotoSerifJP-300.ttf";
  var bytes = null;

  var ready = fetch(FILE).then(function (res) {
    return res.ok ? res.arrayBuffer() : null;
  }).then(function (buf) {
    bytes = buf ? new Uint8Array(buf) : null;
  }).catch(function () {
    bytes = null;
  });

  function acquire() {
    return ready.then(function () {
      if (!bytes) {
        throw new Error("font");
      }
      return bytes;
    });
  }

  return { ready: ready, acquire: acquire };
})();
