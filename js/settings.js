Resume.settings = (function () {
  var KEY = "create-resume-fn-v1";
  var fn = document.getElementById("fn");
  var touched = false;

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

  function save() {
    autoName();
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
  restore();

  return { autoName: autoName };
})();
