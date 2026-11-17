// Выбор языка: ?lang=en в адресе → сохранённый выбор → язык браузера → английский.
(function () {
  var supported = ["ru", "en", "pt", "ro"];
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  function pick() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && supported.indexOf(q) >= 0) return q;
    try {
      var saved = localStorage.getItem("lang");
      if (saved && supported.indexOf(saved) >= 0) return saved;
    } catch (e) {}
    var list = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i]).toLowerCase().slice(0, 2);
      if (code === "ru" || code === "uk" || code === "be") return "ru";
      if (supported.indexOf(code) >= 0) return code;
    }
    return "en";
  }

  function apply(lang) {
    root.lang = lang === "pt" ? "pt-BR" : lang;
    document.querySelectorAll("[data-l]").forEach(function (el) {
      el.classList.toggle("on", el.getAttribute("data-l") === lang);
    });
    document.querySelectorAll(".langs button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-set") === lang ? "true" : "false");
    });
    // Ссылки между страницами сохраняют язык.
    document.querySelectorAll("a[data-keep-lang]").forEach(function (a) {
      var url = new URL(a.getAttribute("href"), location.href);
      url.searchParams.set("lang", lang);
      a.href = url.pathname + url.search + url.hash;
    });
    var t = document.querySelector('meta[name="title-' + lang + '"]');
    if (t) document.title = t.content;
  }

  document.addEventListener("DOMContentLoaded", function () {
    apply(pick());
    document.querySelectorAll(".langs button").forEach(function (b) {
      b.addEventListener("click", function () {
        var lang = b.getAttribute("data-set");
        try { localStorage.setItem("lang", lang); } catch (e) {}
        var url = new URL(location.href);
        url.searchParams.set("lang", lang);
        history.replaceState(null, "", url.pathname + url.search + url.hash);
        apply(lang);
      });
    });
  });
})();
