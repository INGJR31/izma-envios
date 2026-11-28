/* IZMA ENVÍOS · service worker
   Solo para NOTIFICACIONES (no guarda copias de la app, así nunca se queda una versión vieja). */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

/* Tocar la notificación: abre la app (o la trae al frente) en la pantalla indicada */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const vista = (e.notification.data && e.notification.data.vista) || "";
  const base = self.registration.scope;
  e.waitUntil((async () => {
    const lista = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of lista) {
      if (c.url.startsWith(base)) {
        try { await c.focus(); } catch (err) { }
        if (vista) c.postMessage({ izma_ir: vista });
        return;
      }
    }
    await self.clients.openWindow(base + (vista ? "#ir=" + vista : ""));
  })());
});

/* Listo para avisos enviados desde el servidor (push), si algún día se activan */
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "IZMA ENVÍOS", {
    body: d.body || "", tag: d.tag || "izma", data: { vista: d.vista || "" }
  }));
});
