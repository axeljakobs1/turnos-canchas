// Manda a las 21:00 (Mendoza) los turnos del día siguiente. Corre en GitHub Actions, gratis y sin plan Blaze.
const admin = require("firebase-admin");
const { tomorrowIn, buildMessages } = require("./messages");

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });

(async () => {
  const db = admin.firestore();
  const date = process.env.FECHA || tomorrowIn("America/Argentina/Mendoza");
  const [slotsS, signS, venS] = await Promise.all([
    db.collection("slots").where("date", "==", date).get(),
    db.collection("signups").get(),
    db.collection("venues").get()
  ]);
  const slots = slotsS.docs.map((d) => Object.assign({ id: d.id }, d.data()));
  const signups = {}; signS.docs.forEach((d) => { signups[d.id] = d.data(); });
  const venues = {}; venS.docs.forEach((d) => { venues[d.id] = d.data(); });
  const msgs = buildMessages(slots, signups, venues, date);
  console.log("Fecha:", date, "| turnos:", slots.length, "| personas con aviso:", msgs.length);
  let sent = 0;
  for (const m of msgs) {
    const dev = await db.doc("devices/" + m.uid).get();
    const tokens = dev.exists ? (dev.data().tokens || []) : [];
    if (!tokens.length) { console.log("Sin dispositivo activado para", m.uid); continue; }
    const res = await admin.messaging().sendEachForMulticast({ tokens, notification: { title: m.title, body: m.body }, ...(process.env.APP_URL ? { webpush: { fcmOptions: { link: process.env.APP_URL } } } : {}) });
    sent += res.successCount;
    const dead = [];
    res.responses.forEach((r, i) => { if (!r.success && /registration-token-not-registered|invalid-argument|invalid-registration-token/.test((r.error && r.error.code) || "")) dead.push(tokens[i]); });
    if (dead.length) await dev.ref.update({ tokens: admin.firestore.FieldValue.arrayRemove(...dead) });
  }
  console.log("Avisos enviados:", sent);
})().catch((e) => { console.error(e); process.exit(1); });
