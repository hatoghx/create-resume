Resume.format = (function () {
  var f = Resume.fields;
  var EDU_ROWS = 16;
  var QUAL_ROWS = 5;
  var WISH_ROWS = 5;

  var SINGLE = [
    ["furi", "氏名ふりがな", "ふりがな"],
    ["name", "氏名"],
    ["sex", "性別"],
    ["afuri", "住所ふりがな"],
    ["zip", "郵便"],
    ["addr", "現住所"],
    ["tel", "TEL"],
    ["mail", "E-mail"],
    ["cfuri", "連絡先ふりがな", "連絡ふりがな"],
    ["czip", "連絡先郵便"],
    ["alt", "連絡先"],
    ["ctel", "連絡先TEL", "連絡TEL"],
    ["cmail", "連絡先E-mail", "連絡E-mail"]
  ];

  var LONG = [
    ["motive", "01", "志望の動機"],
    ["pr", "02", "自己PR"],
    ["study", "03", "学生時代の取り組み"]
  ];

  var NAME_QUAL = ["資格等", "資格・免許"];
  var NAME_WISH = ["本人希望記入欄", "本人希望"];

  function nullToEmpty(s) {
    s = (s || "").trim();
    return s === "null" ? "" : s;
  }

  function numbers(s) {
    return s.split(/[,、]/).map(function (x) {
      return x.trim();
    });
  }

  function entry(line) {
    var m = line.match(/^\s*([^,]*?)\s*,\s*([^,]*?)\s*,\s*(.*?)\s*$/);
    if (m) {
      return { y: nullToEmpty(m[1]), m: nullToEmpty(m[2]), c: nullToEmpty(m[3]) };
    }
    return { y: "", m: "", c: nullToEmpty(line) };
  }

  function entryText(y, m, c) {
    return (y || "null") + ", " + (m || "null") + ", " + c;
  }

  function parse(text) {
    var sections = [];
    var cur = null;
    text.replace(/^﻿/, "").split(/\r?\n/).forEach(function (line) {
      var h = line.match(/^\s*\[([^\]]+)\]\s*$/);
      if (h) {
        cur = { name: h[1].trim(), lines: [] };
        sections.push(cur);
        return;
      }
      if (cur) {
        cur.lines.push(line);
      }
    });
    sections.forEach(function (s) {
      while (s.lines.length && s.lines[s.lines.length - 1].trim() === "") {
        s.lines.pop();
      }
      while (s.lines.length && s.lines[0].trim() === "") {
        s.lines.shift();
      }
    });
    return sections;
  }

  function pick(sec, names) {
    for (var i = 0; i < names.length; i++) {
      if (sec[names[i]]) {
        return sec[names[i]];
      }
    }
    return null;
  }

  function applyRows(prefixes, count, rows) {
    for (var n = 0; n < count; n++) {
      var r = rows[n] || { y: "", m: "", c: "" };
      f.set(prefixes[0] + n, r.y);
      f.set(prefixes[1] + n, r.m);
      f.set(prefixes[2] + n, r.c);
    }
  }

  function applyHistory(sec) {
    var edu = sec["学歴"];
    var work = sec["職歴"];
    if (!edu && !work) {
      return;
    }
    var rows = [];
    if (edu) {
      rows.push({ y: "", m: "", c: "学歴" });
      edu.lines.forEach(function (l) {
        rows.push(entry(l));
      });
    }
    if (work) {
      if (edu) {
        rows.push({ y: "", m: "", c: "" });
      }
      rows.push({ y: "", m: "", c: "職歴" });
      work.lines.forEach(function (l) {
        rows.push(entry(l));
      });
    }
    if (rows[rows.length - 1].c !== "以上") {
      rows.push({ y: "", m: "", c: "以上" });
    }
    applyRows(["ey", "em", "ec"], EDU_ROWS, rows);
  }

  function applyQualifications(sec) {
    var q = pick(sec, NAME_QUAL);
    if (!q) {
      return;
    }
    applyRows(["qy", "qm", "qc"], QUAL_ROWS, q.lines.map(entry));
  }

  function applyWishes(sec) {
    var w = pick(sec, NAME_WISH);
    if (!w) {
      return;
    }
    for (var n = 0; n < WISH_ROWS; n++) {
      f.set("w" + n, w.lines[n] !== undefined ? w.lines[n].trim() : "");
    }
  }

  function applyDates(sec) {
    var d = sec["作成年月日"];
    if (d) {
      var dn = numbers(d.lines[0] || "");
      f.set("dy", dn[0] || "");
      f.set("dm", dn[1] || "");
      f.set("dd", dn[2] || "");
    }
    var b = sec["生年月日と満年齢"];
    if (b) {
      var bn = numbers(b.lines[0] || "");
      f.set("birth", bn.length > 3
        ? bn[0] + " 年 " + bn[1] + " 月 " + bn[2] + " 日生 （満 " + bn[3] + " 歳）"
        : "年　　　　　月　　　　　日生　（満　　　歳）　");
    }
  }

  function apply(sections, full) {
    var sec = {};
    if (full) {
      f.clear();
    }
    sections.forEach(function (x) {
      sec[x.name] = x;
    });
    SINGLE.forEach(function (a) {
      var s = pick(sec, a.slice(1));
      if (s) {
        f.set(a[0], s.lines.join("\n"));
      }
    });
    LONG.forEach(function (a) {
      var s = pick(sec, [a[1] + "-B", a[2]]);
      if (s) {
        f.set(a[0], s.lines.join("\n"));
      }
    });
    applyDates(sec);
    applyHistory(sec);
    applyQualifications(sec);
    applyWishes(sec);
    f.alignAll();
    Resume.layout.apply();
    f.save();
  }

  function build() {
    var o = [];
    var n;

    function section(title, value) {
      o.push("[" + title + "]");
      if (value !== "") {
        o.push(value);
      }
    }

    function single(key) {
      for (var i = 0; i < SINGLE.length; i++) {
        if (SINGLE[i][0] === key) {
          section(SINGLE[i][1], f.get(key));
        }
      }
    }

    function gap() {
      o.push("");
    }

    var dd = [f.get("dy"), f.get("dm"), f.get("dd")].map(function (x) {
      return x.trim();
    });
    section("作成年月日", dd.join("") === "" ? "" : dd.join(", "));
    single("furi");
    single("name");
    var bm = f.get("birth").match(/(\d+)\D+(\d+)\D+(\d+)\D+(\d+)/);
    section("生年月日と満年齢", bm ? bm.slice(1, 5).join(", ") : "");
    ["sex", "afuri", "zip", "addr", "tel", "mail", "cfuri", "czip", "alt", "ctel", "cmail"].forEach(single);
    gap();

    var state = "学歴";
    var history = { "学歴": [], "職歴": [] };
    for (n = 0; n < EDU_ROWS; n++) {
      var y = f.get("ey" + n).trim();
      var m = f.get("em" + n).trim();
      var c = f.get("ec" + n).trim();
      if (c === "学歴" || c === "職歴") {
        state = c;
        continue;
      }
      if (c === "以上" || (!y && !m && !c)) {
        continue;
      }
      history[state].push(entryText(y, m, c));
    }
    section("学歴", history["学歴"].join("\n"));
    section("職歴", history["職歴"].join("\n"));
    gap();

    var quals = [];
    for (n = 0; n < QUAL_ROWS; n++) {
      var qy = f.get("qy" + n).trim();
      var qm = f.get("qm" + n).trim();
      var qc = f.get("qc" + n).trim();
      if (qy || qm || qc) {
        quals.push(entryText(qy, qm, qc));
      }
    }
    section(NAME_QUAL[0], quals.join("\n"));
    gap();

    LONG.forEach(function (a) {
      section(a[1] + "-A", a[2]);
      section(a[1] + "-B", f.get(a[0]));
    });
    gap();

    var wishes = [];
    for (n = 0; n < WISH_ROWS; n++) {
      var t = f.get("w" + n).trim();
      if (t) {
        wishes.push(t);
      }
    }
    section(NAME_WISH[0], wishes.join("\n"));
    return o.join("\r\n");
  }

  function importText(text) {
    apply(parse(text), true);
  }

  return {
    parse: parse,
    apply: apply,
    build: build,
    importText: importText
  };
})();
