Resume.settings = (function () {
  var KEY = "create-resume-fn-v1";
  var fn = document.getElementById("fn");
  var touched = false;
  var status = document.getElementById("fst");
  var picker = document.getElementById("fontfile");

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function stamp() {
    var d = new Date();
    return pad(d.getMonth() + 1) + pad(d.getDate());
  }

  function autoName() {
    if (!touched) {
      fn.value = "履歴書_" + stamp();
    }
  }

  function showFont() {
    status.textContent = Resume.font.bytes() ? "フォント: 読込済" : "フォント: 未読込";
  }

  function save() {
    autoName();
    if (!Resume.font.bytes()) {
      showFont();
      return;
    }
    var button = document.getElementById("print");
    button.disabled = true;
    Resume.pdf.save(fn.value.trim() || "履歴書").then(function () {
      button.disabled = false;
    }, function () {
      button.disabled = false;
    });
  }

  function restore() {
    try {
      var saved = sessionStorage.getItem(KEY);
      if (saved) {
        fn.value = saved;
        touched = true;
      }
    } catch (e) {}
  }

  fn.addEventListener("input", function () {
    touched = true;
    try {
      sessionStorage.setItem(KEY, fn.value);
    } catch (e) {}
  });

  document.getElementById("print").addEventListener("click", save);
  document.getElementById("fontbtn").addEventListener("click", function () {
    picker.click();
  });
  picker.addEventListener("change", function () {
    var file = picker.files && picker.files[0];
    picker.value = "";
    if (!file) {
      return;
    }
    Resume.font.install(file).then(showFont, function () {
      status.textContent = "フォント: 読込失敗";
    });
  });
  Resume.font.ready.then(showFont);
  restore();

  return { autoName: autoName };
})();
