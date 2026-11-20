// Lógica pura (sin Firebase) para armar los avisos del día siguiente.
var TYPE_TITLES = { viernes: "Fixture viernes", rutina: "Fixture rutina", extrarutina: "Fixture eventos extra rutina", especiales: "Fixture eventos especiales" };

function tomorrowIn(tz, now) {
  var parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now || new Date());
  var g = {}; parts.forEach(function (p) { g[p.type] = p.value; });
  var d = new Date(Date.UTC(+g.year, +g.month - 1, +g.day + 1));
  return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
}

// slots: [{id,type,venue,date,start,end}], signups: {uid:{byUser:{username:[slotIds]}}}, venues: {id:{name}}
// devuelve [{uid, title, body}]
function buildMessages(slots, signups, venues, date) {
  var byId = {};
  slots.forEach(function (s) { if (s.date === date) byId[s.id] = s; });
  var out = [];
  Object.keys(signups || {}).forEach(function (uid) {
    var by = (signups[uid] || {}).byUser || {}, seen = {}, mine = [];
    Object.keys(by).forEach(function (u) {
      (Array.isArray(by[u]) ? by[u] : []).forEach(function (id) { if (byId[id] && !seen[id]) { seen[id] = 1; mine.push(byId[id]); } });
    });
    if (!mine.length) return;
    mine.sort(function (a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; });
    out.push({
      uid: uid,
      title: mine.length === 1 ? "Mañana tenés un turno" : "Mañana tenés " + mine.length + " turnos",
      body: mine.map(function (s) { return s.start + " – " + s.end + " · " + (TYPE_TITLES[s.type] || s.type) + " · " + ((venues[s.venue] || {}).name || "Sede"); }).join("\n")
    });
  });
  return out;
}
module.exports = { tomorrowIn: tomorrowIn, buildMessages: buildMessages };
