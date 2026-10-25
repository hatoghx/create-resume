Resume.photo = (function () {
  var KEY = "create-resume-photo-v1";
  var MAX_SIDE = 900;
  var QUALITY = 0.92;
  var box = document.getElementById("photo");
  var img = document.getElementById("pimg");
  var file = document.getElementById("pfile");
  var hint = document.getElementById("phs");

  function show(src) {
    if (src) {
      img.src = src;
      img.hidden = false;
      box.classList.add("has");
      hint.style.display = "none";
    } else {
      img.removeAttribute("src");
      img.hidden = true;
      box.classList.remove("has");
      hint.style.display = "";
    }
  }

  function store(data) {
    try {
      if (data) {
        sessionStorage.setItem(KEY, data);
      } else {
        sessionStorage.removeItem(KEY);
      }
    } catch (e) {}
  }

  function restore() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
    try {
      var saved = sessionStorage.getItem(KEY);
      if (saved) {
        show(saved);
      }
    } catch (e) {}
  }

  function shrink(image) {
    var r = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
    var c = document.createElement("canvas");
    c.width = Math.round(image.width * r);
    c.height = Math.round(image.height * r);
    c.getContext("2d").drawImage(image, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", QUALITY);
  }

  function pick(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) {
      return;
    }
    var url = URL.createObjectURL(f);
    var image = new Image();
    image.onload = function () {
      var data = shrink(image);
      URL.revokeObjectURL(url);
      show(data);
      store(data);
    };
    image.src = url;
    e.target.value = "";
  }

  box.addEventListener("click", function (e) {
    if (e.target !== file) {
      file.click();
    }
  });
  file.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  file.addEventListener("change", pick);
  box.addEventListener("contextmenu", function (e) {
    if (!box.classList.contains("has")) {
      return;
    }
    e.preventDefault();
    if (confirm("写真を削除します。よろしいですか。")) {
      show("");
      store("");
    }
  });

  restore();
})();
