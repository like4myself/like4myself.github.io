// Отдаёт встречу настоящим файлом календаря: Safari на iPhone не открывает data:-ссылки,
// а на ответ с типом text/calendar показывает «Добавить в Календарь». GitHub Pages сам такой
// файл собрать не может, поэтому его «отвечает» этот скрипт: meeting.ics?ics=<текст события>.
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) { event.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== location.origin || !/\/meeting\.ics$/.test(url.pathname)) return;
  var ics = url.searchParams.get("ics") || "";
  if (ics.indexOf("BEGIN:VCALENDAR") !== 0) return;
  event.respondWith(new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="meeting.ics"'
    }
  }));
});
