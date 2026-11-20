const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { tomorrowIn, buildMessages } = require("./messages");
admin.initializeApp();

// Todos los días a las 21:00 (hora de Mendoza) avisa los turnos del día siguiente.
exports.avisoTurnos = onSchedule({ schedule: "0 21 * * *", timeZone: "America/Argentina/Mendoza", region: "southamerica-east1" }, async () => {
  const db = admin.firestore();
  const date = tomorrowIn("America/Argentina/Mendoza");
  const [slotsS, signS, venS] = await Promise.all([
    db.collection("slots").where("date", "==", date).get(),
    db.collection("enrol").get(),
    db.collection("venues").get()
  ]);
  const slots = slotsS.docs.map((d) => Object.assign({ id: d.id }, d.data()));
  const enrol = signS.docs.map((d) => d.data());
  const venues = {}; venS.docs.forEach((d) => { venues[d.id] = d.data(); });
  const msgs = buildMessages(slots, enrol, venues, date);
  for (const m of msgs) {
    const dev = await db.doc("devices/" + m.uid).get();
    const tokens = dev.exists ? (dev.data().tokens || []) : [];
    if (!tokens.length) continue;
    const res = await admin.messaging().sendEachForMulticast({ tokens, notification: { title: m.title, body: m.body }, webpush: { fcmOptions: { link: "/" } } });
    const dead = [];
    res.responses.forEach((r, i) => { if (!r.success && /registration-token-not-registered|invalid-argument|invalid-registration-token/.test((r.error && r.error.code) || "")) dead.push(tokens[i]); });
    if (dead.length) await dev.ref.update({ tokens: admin.firestore.FieldValue.arrayRemove(...dead) });
  }
});
