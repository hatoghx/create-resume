Resume.pdf = (function () {
  var PAGE_W = 1190.64;
  var PAGE_H = 841.92;
  var PX_TO_PT = 0.75;
  var FONT_FILE = "font/ipamp.ttf";

  function parseColor(s) {
    var m = (s || "").match(/rgba?\(([^)]+)\)/);
    if (!m) {
      return null;
    }
    var p = m[1].split(",").map(parseFloat);
    if (p.length > 3 && p[3] === 0) {
      return null;
    }
    return [p[0] / 255, p[1] / 255, p[2] / 255];
  }

  function tokenize(d) {
    return d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  }

  function pathPoints(d, ctm) {
    var t = tokenize(d);
    var out = [];
    var i = 0;
    var cmd = "";
    var x = 0;
    var y = 0;
    var sx = 0;
    var sy = 0;

    function num() {
      return parseFloat(t[i++]);
    }

    function map(px, py) {
      return [ctm.a * px + ctm.c * py + ctm.e, ctm.b * px + ctm.d * py + ctm.f];
    }

    function line(nx, ny) {
      x = nx;
      y = ny;
      out.push("L" + map(x, y).join(" "));
    }

    while (i < t.length) {
      if (/[a-zA-Z]/.test(t[i])) {
        cmd = t[i++];
      }
      if (cmd === "M") {
        x = num();
        y = num();
        sx = x;
        sy = y;
        out.push("M" + map(x, y).join(" "));
        cmd = "L";
      } else if (cmd === "L") {
        line(num(), num());
      } else if (cmd === "H") {
        line(num(), y);
      } else if (cmd === "V") {
        line(x, num());
      } else if (cmd === "Z" || cmd === "z") {
        out.push("Z");
        x = sx;
        y = sy;
      } else {
        break;
      }
    }
    return out;
  }

  function clipRects(node) {
    var rects = [];
    for (var el = node.parentElement; el; el = el.parentElement) {
      if (getComputedStyle(el).overflow !== "visible") {
        rects.push(el.getBoundingClientRect());
      }
    }
    return rects;
  }

  function inside(r, rects) {
    var cx = (r.left + r.right) / 2;
    var cy = (r.top + r.bottom) / 2;
    return rects.every(function (c) {
      return cx >= c.left && cx <= c.right && cy >= c.top && cy <= c.bottom;
    });
  }

  function collectPaths(wrap, origin) {
    var list = [];
    wrap.querySelectorAll("svg path").forEach(function (p) {
      if (!p.getClientRects().length) {
        return;
      }
      var color = parseColor(getComputedStyle(p).fill);
      if (!color) {
        return;
      }
      var m = p.getScreenCTM();
      var ctm = {
        a: m.a * PX_TO_PT,
        b: m.b * PX_TO_PT,
        c: m.c * PX_TO_PT,
        d: m.d * PX_TO_PT,
        e: (m.e - origin.left) * PX_TO_PT,
        f: (m.f - origin.top) * PX_TO_PT
      };
      list.push({ d: pathPoints(p.getAttribute("d"), ctm).join(" "), color: color });
    });
    return list;
  }

  function collectChars(wrap, origin) {
    var list = [];
    var walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT);
    var range = document.createRange();
    var node;
    while ((node = walker.nextNode())) {
      var parent = node.parentElement;
      if (!parent || !node.nodeValue.trim() || !parent.getClientRects().length) {
        continue;
      }
      var cs = getComputedStyle(parent);
      var family = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
      var color = parseColor(cs.color) || [0, 0, 0];
      var clips = clipRects(node);
      for (var i = 0; i < node.nodeValue.length; i++) {
        var ch = node.nodeValue.charAt(i);
        if (!ch.trim()) {
          continue;
        }
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        var r = range.getClientRects()[0];
        if (!r || !r.width || !r.height || !inside(r, clips)) {
          continue;
        }
        list.push({
          ch: ch,
          family: family,
          color: color,
          x: (r.left - origin.left) * PX_TO_PT,
          top: (r.top - origin.top) * PX_TO_PT,
          h: r.height * PX_TO_PT
        });
      }
    }
    return list;
  }

  function collectImages(wrap, origin) {
    var list = [];
    wrap.querySelectorAll("img").forEach(function (img) {
      if (img.hidden || !img.getAttribute("src") || !img.naturalWidth) {
        return;
      }
      var r = img.getBoundingClientRect();
      var scale = 3;
      var c = document.createElement("canvas");
      c.width = Math.round(r.width * scale);
      c.height = Math.round(r.height * scale);
      var k = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
      var w = img.naturalWidth * k;
      var h = img.naturalHeight * k;
      var g = c.getContext("2d");
      g.fillStyle = "#fff";
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
      list.push({
        data: c.toDataURL("image/jpeg", 0.92),
        x: (r.left - origin.left) * PX_TO_PT,
        top: (r.top - origin.top) * PX_TO_PT,
        w: r.width * PX_TO_PT,
        h: r.height * PX_TO_PT
      });
    });
    return list;
  }

  function snapshot() {
    var wrap = document.getElementById("wrap");
    var zoom = wrap.style.zoom;
    var off = wrap.classList.contains("off");
    wrap.style.zoom = 1;
    wrap.classList.remove("off");
    Resume.layout.apply();
    var o = wrap.getBoundingClientRect();
    var origin = { left: o.left, top: o.top };
    var data = {
      paths: collectPaths(wrap, origin),
      chars: collectChars(wrap, origin),
      images: collectImages(wrap, origin)
    };
    wrap.classList.toggle("off", off);
    wrap.style.zoom = zoom;
    return data;
  }

  function loadFonts(PDFLib, doc, chars) {
    var used = {};
    chars.forEach(function (c) {
      used[c.family] = true;
    });
    var fonts = {};
    return Promise.all(Object.keys(used).map(function (name) {
      return fetch(FONT_FILE)
        .then(function (res) {
          return res.arrayBuffer();
        })
        .then(function (buf) {
          var bytes = new Uint8Array(buf);
          return doc.embedFont(bytes, { subset: true }).then(function (font) {
            var info = window.fontkit.create(bytes);
            fonts[name] = { pdf: font, info: info };
          });
        });
    })).then(function () {
      return fonts;
    });
  }

  function draw(PDFLib, doc, page, data, fonts) {
    var rgb = PDFLib.rgb;
    data.paths.forEach(function (p) {
      page.drawSvgPath(p.d, {
        x: 0,
        y: PAGE_H,
        color: rgb(p.color[0], p.color[1], p.color[2]),
        borderWidth: 0
      });
    });
    return Promise.all(data.images.map(function (im) {
      return doc.embedJpg(im.data).then(function (img) {
        page.drawImage(img, { x: im.x, y: PAGE_H - im.top - im.h, width: im.w, height: im.h });
      });
    })).then(function () {
      data.chars.forEach(function (c) {
        var f = fonts[c.family] || fonts.IPAPMincho;
        if (!f || !f.info.hasGlyphForCodePoint(c.ch.codePointAt(0))) {
          return;
        }
        var upm = f.info.unitsPerEm;
        var asc = f.info.ascent;
        var desc = -f.info.descent;
        var size = c.h / ((asc + desc) / upm);
        var baseline = c.top + c.h * asc / (asc + desc);
        page.drawText(c.ch, {
          x: c.x,
          y: PAGE_H - baseline,
          size: size,
          font: f.pdf,
          color: rgb(c.color[0], c.color[1], c.color[2])
        });
      });
    });
  }

  function build() {
    var PDFLib = window.PDFLib;
    return document.fonts.ready.then(function () {
      var data = snapshot();
      return PDFLib.PDFDocument.create().then(function (doc) {
        doc.registerFontkit(window.fontkit);
        var page = doc.addPage([PAGE_W, PAGE_H]);
        return loadFonts(PDFLib, doc, data.chars).then(function (fonts) {
          return draw(PDFLib, doc, page, data, fonts);
        }).then(function () {
          return doc.save();
        });
      });
    });
  }

  function download(bytes, name) {
    var url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 10000);
  }

  function save(name) {
    return build().then(function (bytes) {
      download(bytes, name + ".pdf");
    });
  }

  return { save: save, build: build };
})();
