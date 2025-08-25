const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// -----------------------------------------------------------------------------
// CONFIGURACIÓN DE ENVÍO DE CORREO (NODEMAILER)
// -----------------------------------------------------------------------------
// Para mayor seguridad, las credenciales de correo se deben configurar como
// variables de entorno en Firebase.
// Para configurar las variables de entorno, usa los siguientes comandos en tu terminal:
// firebase functions:config:set email.user="afterlifeorugal@gmail.com"
// firebase functions:config:set email.password="tu_contraseña_de_app"
//
// Asegúrate de usar una "App Password" de Gmail si tienes 2FA activado.
// -----------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

/**
 * Función programada que se ejecuta cada 2 horas para verificar usuarios inactivos.
 *
 * Pasos que sigue la función:
 * 1. Obtiene el último 'alive_check' de cada usuario.
 * 2. Itera sobre la configuración de cada usuario ('user_settings') que esté activa.
 * 3. Compara la fecha del último check-in con el umbral de días de inactividad ('notification_days').
 * 4. Si un usuario ha superado el umbral, envía un correo de notificación a sus contactos de emergencia.
 */
exports.checkInactiveUsers = functions.pubsub.schedule("every 2 hours").onRun(async (context) => {
  console.log("Iniciando la verificación de usuarios inactivos...");
  const now = new Date();

  // Paso 1: Obtener el último alive_check por usuario.
  // Nota: Firestore no tiene un "group by" nativo. Este enfoque obtiene todos los
  // checks ordenados por fecha y luego los procesa en memoria para encontrar el
  // más reciente de cada usuario. Puede ser ineficiente si la colección 'alive_checks'
  // crece mucho. Una optimización futura podría ser guardar el último check en el
  // perfil del usuario.
  const aliveSnapshot = await db.collection("alive_checks").orderBy("timestamp", "desc").get();
  const latestCheckByUser = new Map();

  aliveSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const userId = data.user_id;
    if (!latestCheckByUser.has(userId)) {
      latestCheckByUser.set(userId, data.timestamp.toDate());
    }
  });

  // Paso 2: Consultar todos los 'user_settings' que estén activos.
  const settingsSnapshot = await db.collection("user_settings").where("active", "==", true).get();
  console.log(`Encontrados ${settingsSnapshot.docs.length} usuarios con configuraciones activas.`);

  for (const doc of settingsSnapshot.docs) {
    const settings = doc.data();
    const userId = settings.user_id;
    const notificationDays = settings.notification_days;
    const emergencyEmails = settings.emergency_email || [];

    if (!userId || !notificationDays || emergencyEmails.length === 0) {
      console.log(`Saltando usuario ${userId} por datos incompletos.`);
      continue;
    }

    const lastCheckDate = latestCheckByUser.get(userId) || new Date(0); // Si no hay check, se usa una fecha muy antigua.
    const thresholdDate = new Date(now.getTime() - notificationDays * 24 * 60 * 60 * 1000);

    console.log(`Verificando usuario ${userId}: Último check: ${lastCheckDate.toISOString()}, Umbral: ${thresholdDate.toISOString()}`);

    if (lastCheckDate < thresholdDate) {
      console.log(`¡Usuario inactivo detectado! User ID: ${userId}`);

      // Paso 3: Usuario inactivo, obtener sus datos y enviar correos.
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        console.error(`No se encontró el usuario con ID: ${userId}`);
        continue;
      }
      const userData = userDoc.data();
      const userName = userData.name || "Usuario";

      const subject = `⚠️ Protocolo After Life activado para ${userName}`;

      const generateHtml = (email) => `
        <p>Hola,</p>
        <p>El protocolo <strong>After Life</strong> se ha activado para <strong>${userName}</strong>.</p>
        <p>Usted ha sido asignado como persona de confianza por este usuario.</p>
        <p>Esto significa que, tras no recibir confirmación de vida en ${notificationDays} días, se ha activado el envío de su información configurada.</p>
        <p>Puede acceder a la información a través del siguiente enlace:</p>
        <p><a href="https://afterlife.app/access?email=${encodeURIComponent(email)}">Ver datos de ${userName}</a></p>
        <br/>
        <p>Gracias por ser parte del protocolo de confianza de After Life.</p>
      `;

      for (const email of emergencyEmails) {
        if (email) {
          try {
            await transporter.sendMail({
              from: `"After Life" <${functions.config().email.user}>`,
              to: email,
              subject: subject,
              html: generateHtml(email),
            });
            console.log(`Correo enviado a ${email} para notificar sobre ${userName}`);
          } catch (err) {
            console.error(`Error enviando correo a ${email}:`, err);
          }
        }
      }
    }
  }

  console.log("Verificación de usuarios inactivos completada.");
  return null; // Finaliza la función correctamente.
});