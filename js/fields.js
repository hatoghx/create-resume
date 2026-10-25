window.Resume = {};

Resume.fields = (function () {
  var KEY = "create-resume-v3";
  var BIRTH_EMPTY = "年　　　　　月　　　　　日生　（満　　　歳）　";
  var BIRTH_OLD_EMPTY = "年　　　月　　　日生（満　　歳）";

  function list() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-k]"));
  }

  function element(k) {
    return document.querySelector('[data-k="' + k + '"]');
  }

  function get(k) {
    var el = element(k);
    return el ? el.innerText.replace(/\n+$/, "") : "";
  }

  function set(k, v) {
    var el = element(k);
    if (el) {
      el.innerText = v;
    }
  }

  function clear() {
    list().forEach(function (el) {
      el.innerText = "";
    });
    set("birth", BIRTH_EMPTY);
  }

  function align(el) {
    if (!el || !el.dataset || !/^ec\d+$/.test(el.dataset.k || "")) {
      return;
    }
    var t = el.innerText.trim();
    if (t === "学歴" || t === "職歴") {
      el.style.textAlign = "center";
    } else if (t === "以上") {
      el.style.textAlign = "right";
    } else {
      el.style.textAlign = "";
    }
  }

  function alignAll() {
    list().forEach(align);
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      list().forEach(function (el) {
        var v = saved[el.dataset.k];
        if (v === undefined) {
          return;
        }
        if (el.dataset.k === "birth" && v === BIRTH_OLD_EMPTY) {
          return;
        }
        el.innerText = v;
      });
    } catch (e) {}
  }

  function save() {
    try {
      var o = {};
      list().forEach(function (el) {
        o[el.dataset.k] = el.innerText;
      });
      localStorage.setItem(KEY, JSON.stringify(o));
    } catch (e) {}
  }

  return {
    list: list,
    get: get,
    set: set,
    clear: clear,
    align: align,
    alignAll: alignAll,
    load: load,
    save: save
  };
})();
