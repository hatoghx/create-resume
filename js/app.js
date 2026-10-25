(function () {
  var f = Resume.fields;

  f.load();
  f.alignAll();

  document.addEventListener("input", function (e) {
    if (e.target === Resume.editor.element || e.target.id === "fn") {
      return;
    }
    f.align(e.target);
    Resume.layout.apply();
    f.save();
    Resume.editor.push();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.classList && e.target.classList.contains("ti")) {
      e.preventDefault();
    }
  });

  document.addEventListener("paste", function (e) {
    if (e.target && e.target.isContentEditable) {
      e.preventDefault();
      var t = (e.clipboardData || window.clipboardData).getData("text");
      document.execCommand("insertText", false, t);
    }
  });

  window.__resume = {
    imp: function (text) {
      Resume.format.importText(text);
      Resume.editor.push();
    },
    exp: Resume.format.build,
    view: Resume.view.set,
    type: Resume.editor.setText
  };

  Resume.editor.element.value = Resume.format.build();
  Resume.layout.apply();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(Resume.layout.apply);
  }
  window.addEventListener("load", Resume.layout.apply);
  window.addEventListener("beforeprint", Resume.layout.apply);
  Resume.view.initial();
})();
