Resume.layout = (function () {
  var BOXES = ["bx1", "bx2", "bx3"];
  var TOTAL = 3 * 95.64;
  var LINE_MAX = 2.1;
  var START_Y = 229.56;
  var GAP = 7.2;
  var HEAD = 24.96;
  var EDGE = 0.84;

  function frame(h) {
    var r = [
      [0, 0, EDGE, h],
      [483, EDGE, 483.84, h],
      [EDGE, 0, 483.84, EDGE],
      [EDGE, 24.12, 483.84, HEAD],
      [EDGE, h - EDGE, 483.84, h]
    ];
    return r.map(function (a) {
      return "M" + a[0] + " " + a[1] + "H" + a[2] + "V" + a[3] + "H" + a[0] + "Z";
    }).join("");
  }

  function measure(box) {
    var f = box.querySelector(".ed");
    var n = 1;
    f.style.lineHeight = LINE_MAX;
    var cs = getComputedStyle(f);
    var pad = (parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)) * 0.75;
    var fs = parseFloat(cs.fontSize) * 0.75;
    if (f.innerText.trim() !== "") {
      f.style.height = "auto";
      n = Math.max(1, Math.round((f.getBoundingClientRect().height * 0.75 - pad) / (fs * LINE_MAX)));
    }
    return { lines: n, pad: pad, fontSize: fs };
  }

  function apply() {
    var wrap = document.getElementById("wrap");
    var zoom = wrap.style.zoom;
    var y = START_Y;
    wrap.style.zoom = 1;

    var boxes = BOXES.map(function (id) {
      return document.getElementById(id);
    });
    var info = boxes.map(measure);
    var sum = 0;
    info.forEach(function (m) {
      sum += m.lines;
    });
    var pad = info[info.length - 1].pad;
    var fs = info[info.length - 1].fontSize;
    var lh = Math.max(fs, Math.min(fs * LINE_MAX, (TOTAL - 3 * pad) / sum));

    boxes.forEach(function (box, i) {
      var f = box.querySelector(".ed");
      var bh = (TOTAL - 3 * pad) * info[i].lines / sum + pad;
      var h = HEAD + bh + EDGE;
      var svg = box.querySelector("svg");
      f.style.lineHeight = lh / fs;
      f.style.height = bh + "pt";
      svg.setAttribute("height", h + "pt");
      svg.setAttribute("viewBox", "0 0 483.84 " + h);
      svg.querySelector("path").setAttribute("d", frame(h));
      box.style.transform = "translate(61.92pt," + y + "pt)";
      y += h + GAP;
    });
    document.getElementById("bx4").style.transform = "translate(61.92pt," + y + "pt)";
    wrap.style.zoom = zoom;
    pitch();
  }

  function pitch() {
    var wrap = document.getElementById("wrap");
    var zoom = parseFloat(wrap.style.zoom) || 1;
    Array.prototype.forEach.call(document.querySelectorAll(".fu"), function (el) {
      var probe = document.createElement("span");
      probe.className = "ed fu";
      probe.style.cssText = "position:absolute;visibility:hidden;width:auto;height:auto;padding:0;white-space:pre;letter-spacing:0";
      probe.textContent = Array(21).join("あ");
      el.parentNode.appendChild(probe);
      var advance = probe.getBoundingClientRect().width / 20 / zoom;
      var size = parseFloat(getComputedStyle(el).fontSize);
      el.parentNode.removeChild(probe);
      el.style.letterSpacing = (size - advance) + "px";
    });
  }

  return { apply: apply, pitch: pitch };
})();
