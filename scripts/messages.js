// Lógica pura (sin Firebase) para armar los avisos del día siguiente.
var TYPE_TITLES = { viernes: "Fixture viernes", rutina: "Fixture rutina", extrarutina: "Fixture eventos extra rutina", especiales: "Fixture eventos especiales" };

function tomorrowIn(tz, now) {
  var parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now || new Date());
  var g = {}; parts.forEach(function (p) { g[p.type] = p.value; });
  var d = new Date(Date.UTC(+g.year, +g.month - 1, +g.day + 1));
  return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
}

// slots: [{id,type,venue,date,start,end}], enrol: [{slotId, uid}], venues: {id:{name}}
// devuelve [{uid, title, body}]
function buildMessages(slots, enrol, venues, date) {
  var byId = {};
  slots.forEach(function (s) { if (s.date === date) byId[s.id] = s; });
  var per = {}, out = [];
  (enrol || []).forEach(function (e) {
    var s = byId[e.slotId]; if (!s) return;
    var l = (per[e.uid] = per[e.uid] || {}); l[s.id] = s;
  });
  Object.keys(per).forEach(function (uid) {
    var mine = Object.keys(per[uid]).map(function (id) { return per[uid][id]; });
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
