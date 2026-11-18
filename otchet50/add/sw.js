// Отдаёт встречу настоящим файлом календаря: Safari на iPhone не открывает data:-ссылки,
// а на ответ с типом text/calendar показывает «Добавить в Календарь». GitHub Pages сам такой
// файл собрать не может, поэтому его «отвечает» этот скрипт: meeting.ics?d=…&t=…&l=ru —
// те же параметры, что у страницы; файл собирается только из них (meeting.js).
importScripts("meeting.js");
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) { event.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== location.origin || !/\/meeting\.ics$/.test(url.pathname)) return;
  var meeting = Meeting.parse(url.searchParams);
  event.respondWith(meeting
    ? new Response(Meeting.ics(meeting, url.searchParams.get("l")), {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": 'inline; filename="meeting.ics"'
        }
      })
    : new Response("Bad link", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } }));
});
