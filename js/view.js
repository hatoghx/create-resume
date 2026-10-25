Resume.view = (function () {
  var current = "resume";

  function set(v) {
    current = v;
    document.getElementById("wrap").classList.toggle("off", v !== "resume");
    document.getElementById("v-in").hidden = v !== "in";
    document.getElementById("v-set").hidden = v !== "set";
    document.getElementById("tb-r").classList.toggle("on", v === "resume");
    document.getElementById("tb-i").classList.toggle("on", v === "in");
    document.getElementById("tb-s").classList.toggle("on", v === "set");
    Resume.zoom.setActive(v === "resume");
    if (v === "in") {
      Resume.editor.push();
    }
    if (v === "set") {
      Resume.settings.autoName();
    }
    if (v === "resume") {
      Resume.layout.apply();
    }
    window.scrollTo(0, 0);
    Resume.zoom.fit();
  }

  function go(v) {
    if (v !== current) {
      location.replace("?v=" + v);
    }
  }

  function initial() {
    var m = location.search.match(/[?&]v=(in|set)\b/);
    if (m) {
      set(m[1]);
    } else {
      Resume.zoom.fit();
    }
  }

  document.getElementById("tb-r").addEventListener("click", function () {
    go("resume");
  });
  document.getElementById("tb-i").addEventListener("click", function () {
    go("in");
  });
  document.getElementById("tb-s").addEventListener("click", function () {
    go("set");
  });

  return { set: set, go: go, initial: initial };
})();
