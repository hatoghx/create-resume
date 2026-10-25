Resume.zoom = (function () {
  var PAGE_WIDTH = 1587.52;
  var SIDE = 16;
  var MAX_ZOOM = 2.5;
  var VIEWPORT = "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no";
  var factor = 1;
  var startDistance = 0;
  var startFactor = 1;
  var active = true;

  function base() {
    return Math.min(1, (window.innerWidth - SIDE) / PAGE_WIDTH);
  }

  function fit() {
    document.querySelector('meta[name="viewport"]').setAttribute("content", VIEWPORT);
    document.getElementById("wrap").style.zoom = base() * factor;
    Resume.layout.pitch();
  }

  function distance(t) {
    return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  }

  function zoomAt(next, cx, cy) {
    var wrap = document.getElementById("wrap");
    var b = base();
    var old = parseFloat(wrap.style.zoom) || b;
    next = Math.max(1, Math.min(next, MAX_ZOOM / b));
    var z = b * next;
    var px = (window.scrollX + cx) / old;
    var py = (window.scrollY + cy) / old;
    factor = next;
    wrap.style.zoom = z;
    Resume.layout.pitch();
    window.scrollTo(px * z - cx, py * z - cy);
  }

  function setActive(v) {
    active = v;
  }

  document.addEventListener("touchstart", function (e) {
    if (active && e.touches.length === 2) {
      startDistance = distance(e.touches);
      startFactor = factor;
    }
  }, { passive: true });

  document.addEventListener("touchmove", function (e) {
    if (!active || e.touches.length !== 2 || !startDistance) {
      return;
    }
    e.preventDefault();
    zoomAt(
      startFactor * distance(e.touches) / startDistance,
      (e.touches[0].clientX + e.touches[1].clientX) / 2,
      (e.touches[0].clientY + e.touches[1].clientY) / 2
    );
  }, { passive: false });

  document.addEventListener("touchend", function (e) {
    if (e.touches.length < 2) {
      startDistance = 0;
    }
  }, { passive: true });

  document.addEventListener("wheel", function (e) {
    if (!active || !e.ctrlKey) {
      return;
    }
    e.preventDefault();
    zoomAt(factor * Math.exp(-e.deltaY * 0.002), e.clientX, e.clientY);
  }, { passive: false });

  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", function () {
    setTimeout(fit, 300);
  });

  return { fit: fit, setActive: setActive };
})();
