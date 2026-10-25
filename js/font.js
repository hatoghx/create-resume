Resume.font = (function () {
  var FILE = "font/msmincho.ttc";
  var current = null;

  function pick(bytes, offsets) {
    try {
      var col = window.fontkit.create(bytes);
      var fonts = col.fonts || [];
      for (var i = 0; i < offsets.length; i++) {
        var name = fonts[i] && fonts[i].postscriptName;
        if (name && /^MS-?PMincho$/i.test(name)) {
          return i;
        }
      }
    } catch (e) {}
    return 0;
  }

  function extract(buf) {
    var dv = new DataView(buf);
    var head = dv.getUint32(0);
    if (head === 0x00010000 || head === 0x4f54544f || head === 0x74727565) {
      return new Uint8Array(buf);
    }
    if (head !== 0x74746366) {
      throw new Error("font");
    }
    var n = dv.getUint32(8);
    var offsets = [];
    for (var k = 0; k < n; k++) {
      offsets.push(dv.getUint32(12 + k * 4));
    }
    var base = offsets[pick(new Uint8Array(buf), offsets)];
    var count = dv.getUint16(base + 4);
    var dir = 12 + count * 16;
    var size = dir;
    var i;
    for (i = 0; i < count; i++) {
      size += (dv.getUint32(base + 12 + i * 16 + 12) + 3) & ~3;
    }
    var out = new Uint8Array(size);
    var ov = new DataView(out.buffer);
    out.set(new Uint8Array(buf, base, 12));
    var pos = dir;
    for (i = 0; i < count; i++) {
      var rec = base + 12 + i * 16;
      var off = dv.getUint32(rec + 8);
      var len = dv.getUint32(rec + 12);
      out.set(new Uint8Array(buf, rec, 4), 12 + i * 16);
      ov.setUint32(12 + i * 16 + 4, dv.getUint32(rec + 4));
      ov.setUint32(12 + i * 16 + 8, pos);
      ov.setUint32(12 + i * 16 + 12, len);
      out.set(new Uint8Array(buf, off, len), pos);
      pos += (len + 3) & ~3;
    }
    return out;
  }

  function apply(bytes) {
    var face = new FontFace("ResumeFont", bytes.slice().buffer);
    return face.load().then(function () {
      document.fonts.add(face);
      current = bytes;
      Resume.layout.apply();
    });
  }

  function load() {
    return fetch(FILE).then(function (res) {
      return res.ok ? res.arrayBuffer() : null;
    }).then(function (buf) {
      return buf ? apply(extract(buf)) : null;
    }).catch(function () {
      return null;
    });
  }

  var ready = load();

  return {
    ready: ready,
    bytes: function () {
      return current;
    }
  };
})();
