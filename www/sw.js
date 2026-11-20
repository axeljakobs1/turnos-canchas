// Service worker: guarda la pantalla de la app para que abra rápido. Los datos siempre vienen de Firebase.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js", "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js", "firebase-config.js");
try { firebase.initializeApp(self.FIREBASE_CONFIG); firebase.messaging(); } catch (e) {}
var CACHE = "turnos-v2";
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(["./", "index.html", "manifest.webmanifest", "icon-192.png"]); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }));
  self.clients.claim();
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); return r;
  }).catch(function () { return caches.match(e.request); }));
});
