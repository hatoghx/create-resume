Resume.editor = (function () {
  var tx = document.getElementById("tx");

  function push() {
    if (document.activeElement !== tx) {
      tx.value = Resume.format.build();
    }
  }

  function setText(text) {
    tx.value = text;
    tx.dispatchEvent(new Event("input", { bubbles: true }));
  }

  tx.addEventListener("input", function () {
    Resume.format.apply(Resume.format.parse(tx.value), true);
  });

  return {
    element: tx,
    push: push,
    setText: setText
  };
})();
