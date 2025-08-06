const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// ⚠️ SMTP CONFIG - puedes mover esto a variables de entorno luego
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // o smtp.zoho.com, etc.
  port: 465,
  secure: true,
  auth: {
    user: "afterlife.tudominio@gmail.com", // Tu correo emisor
    pass: "app_password_o_password_normal", // App password o contraseña
  },
});

//exports.checkInactiveUsers = functions.pubsub.schedule("every 24 hours").onRun(async () => {
exports.checkInactiveUsers = functions.https.onRequest(async (req, res) => {

  const now = Date.now();

  // Paso 1: Obtener el último alive_check por usuario
  const aliveSnapshot = await db.collection("alive_checks").orderBy("timestamp", "desc").get();
  const latestCheckByUser = new Map();

  aliveSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const userId = data.user_id;
    if (!latestCheckByUser.has(userId)) {
      latestCheckByUser.set(userId, data.timestamp.toDate().getTime());
    }
  });

  // Paso 2: Consultar user_settings activos
  const settingsSnapshot = await db.collection("user_settings").where("active", "==", true).get();

  for (const doc of settingsSnapshot.docs) {
    const settings = doc.data();
    const userId = settings.user_id;
    const notificationDays = settings.notification_days;
    const emailList = settings.emergency_email.map(e => e.trim()).filter(Boolean) || [];

    const lastSeenTimestamp = latestCheckByUser.get(userId) || 0;
    const limitTimestamp = now - notificationDays * 24 * 60 * 60 * 1000;

    if (lastSeenTimestamp < limitTimestamp) {
      // Buscar info del usuario
      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : { name: "Usuario desconocido" };

      const subject = `⚠️ Protocolo After Life activado para ${userData.name || "Usuario"}`;

      const generateHtml = (email) => `
        <p>Hola,</p>
        <p>El protocolo <strong>After Life</strong> se ha activado para <strong>${userData.name}</strong>.</p>
        <p>Usted ha sido asignado como persona de confianza por este usuario.</p>
        <p>Esto significa que, tras no recibir confirmación de vida en ${notificationDays} días, se ha activado el envío de su información configurada.</p>
        <p>Puede acceder a la información a través del siguiente enlace:</p>
        <p><a href="https://afterlife.app/access?email=${encodeURIComponent(email)}">Ver datos de ${userData.name}</a></p>
        <br/>
        <p>Gracias por ser parte del protocolo de confianza de After Life.</p>
      `;

      for (const email of emailList) {
        try {
          await transporter.sendMail({
            from: `"After Life" <afterlife.tudominio@gmail.com>`,
            to: email,
            subject: subject,
            html: generateHtml(email),
          });

          console.log(`Correo enviado a ${email} para ${userData.name}`);
        } catch (err) {
          console.error(`Error enviando a ${email}:`, err);
        }
      }
    }
  }

  return null;
});