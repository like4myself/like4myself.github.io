// Встреча из QR-кода приложения: ?d=2026-11-20&t=10:00&m=60&a=preaching&p=Место&n=Имя.
// Общий код страницы и service worker: оба собирают встречу и файл календаря только из этих
// параметров — так через наш адрес нельзя отдать произвольный файл календаря.
// Время «плавающее» (без пояса) — у напарника то же, что на часах.
(function (root) {
  var ACT = {
    preaching:    { ru: "Проповедь", en: "Field service", pt: "Pregação", ro: "Predicare" },
    cart:         { ru: "Проповедь в общественных местах", en: "Public witnessing", pt: "Testemunho público", ro: "Mărturie publică" },
    cityCart:     { ru: "Проповедь в общественных местах крупных городов", en: "Metropolitan public witnessing", pt: "Testemunho público em áreas metropolitanas", ro: "Mărturie publică în orașele mari" },
    group:        { ru: "Группа", en: "Group", pt: "Grupo", ro: "Grup" },
    territory:    { ru: "Территория", en: "Territory", pt: "Território", ro: "Teritoriu" },
    section:      { ru: "Участок", en: "Section", pt: "Território pessoal", ro: "Sector" },
    study:        { ru: "Изучение", en: "Bible study", pt: "Estudo", ro: "Studiu" },
    returnVisits: { ru: "Повторные посещения", en: "Return visits", pt: "Revisitas", ro: "Vizite ulterioare" },
    letters:      { ru: "Письма и звонки", en: "Letters and phone calls", pt: "Cartas e telefonemas", ro: "Scrisori și telefoane" },
    assignment:   { ru: "А-2", en: "A-2", pt: "A-2", ro: "A-2" }
  };
  var LANGS = ["ru", "en", "pt", "ro"];
  // Пределы — как в приложении (PartnerInvite.placeLimit / nameLimit).
  var PLACE_LIMIT = 60, NAME_LIMIT = 40;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function stamp(x) {
    return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + "T" + pad(x.getHours()) + pad(x.getMinutes()) + "00";
  }
  function esc(s) {
    return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/[\r\n]+/g, " ");
  }

  /** Встреча из параметров ссылки; неполная или невозможная дата (31 февраля, 25:00) — null. */
  function parse(q) {
    var d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(q.get("d") || "");
    var t = /^(\d{1,2}):(\d{2})$/.exec(q.get("t") || "");
    if (!d || !t || +t[1] > 23 || +t[2] > 59) return null;
    var start = new Date(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
    if (isNaN(start) || start.getFullYear() !== +d[1] || start.getMonth() !== +d[2] - 1 || start.getDate() !== +d[3]) return null;
    var minutes = Math.min(Math.max(parseInt(q.get("m"), 10) || 60, 5), 720);
    return {
      start: start,
      end: new Date(start.getTime() + minutes * 60000),
      act: ACT[q.get("a")] ? q.get("a") : "preaching",
      place: (q.get("p") || "").trim().slice(0, PLACE_LIMIT),
      name: (q.get("n") || "").trim().slice(0, NAME_LIMIT)
    };
  }

  function lang(l) { return LANGS.indexOf(l) >= 0 ? l : "en"; }
  function title(m, l) { return ACT[m.act][lang(l)]; }
  function summary(m, l) { return title(m, l) + (m.name ? " · " + m.name : ""); }

  function ics(m, l) {
    var lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Report50//EN", "BEGIN:VEVENT",
      "UID:" + stamp(m.start) + "-" + Math.random().toString(36).slice(2) + "@like4myself.github.io",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, ""),
      "SUMMARY:" + esc(summary(m, l)),
      "DTSTART:" + stamp(m.start), "DTEND:" + stamp(m.end)
    ];
    if (m.place) lines.push("LOCATION:" + esc(m.place));
    lines.push("END:VEVENT", "END:VCALENDAR");
    return lines.join("\r\n");
  }

  root.Meeting = { parse: parse, title: title, summary: summary, ics: ics, stamp: stamp };
})(self);
