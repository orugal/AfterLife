import admin from 'firebase-admin';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

dotenv.config();

// Inicializar Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.VITE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.VITE_PROJECT_ID
});

const db = admin.firestore();
const messaging = admin.messaging(); // Agregar el servicio de messaging

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // o tu proveedor preferido
  auth: {
    user: process.env.EMAIL_USER, // tu email
    pass: process.env.EMAIL_APP_PASSWORD // contraseña de aplicación de Gmail
  }
});


const protocoloAfterLife = async () => {
  try {
    console.log("Iniciando Protocolo After Life...");
    
    // Leer la colección de usuarios
    const userRef = db.collection('users');
    const snapshotUsers = await userRef.orderBy('name').get();
    
    if (snapshotUsers.empty) {
      console.log('No se encontraron usuarios.');
      return;
    }
    
    const usersData = [];
    snapshotUsers.forEach(doc => {
      usersData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Se encontraron ${usersData.length} usuarios:`);
    
    // Procesar cada usuario
    for (const userData of usersData) {
      console.log(`\n--- Procesando usuario: ${userData.name} (ID: ${userData.id}) ---`);
      
      try {
        // Consultar la configuración del usuario
        const userSettingsRef = db.collection('user_settings');
        const settingsQuery = await userSettingsRef.where('user_id', '==', userData.id).get();
        
        if (settingsQuery.empty) {
          console.log(`⚠️  No se encontró configuración para el usuario ${userData.name}`);
          continue;
        }
        
        const userSettings = settingsQuery.docs[0].data();
        const notificationDays = userSettings.notification_days || 30; // Default 30 días
        const emergencyEmails = userSettings.emergency_email || [];
        
        console.log(`📋 Configuración: ${notificationDays} días, ${emergencyEmails.length} emails de emergencia`);
        
        // Consultar el último alive_check del usuario
        const aliveChecksRef = db.collection('alive_checks');
        const aliveCheckQuery = await aliveChecksRef
          .where('user_id', '==', userData.id)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();
        
        if (aliveCheckQuery.empty) {
          console.log(`⚠️  Usuario ${userData.name} no tiene registros de alive_checks`);
          continue;
        }
        
        // Obtener el último check
        const lastAliveCheckDoc = aliveCheckQuery.docs[0];
        const lastAliveCheckData = lastAliveCheckDoc.data();
        const lastAliveTimestamp = lastAliveCheckData.timestamp;
        
        if (!lastAliveTimestamp) {
          console.log(`⚠️  Usuario ${userData.name} tiene un alive_check sin timestamp válido`);
          continue;
        }
        
        // Calcular días transcurridos
        const lastAliveDate = lastAliveTimestamp.toDate ? lastAliveTimestamp.toDate() : new Date(lastAliveTimestamp);
        const currentDate = new Date();
        const daysDifference = Math.floor((currentDate - lastAliveDate) / (1000 * 60 * 60 * 24));
        
        console.log(`📅 Último alive_check: ${lastAliveDate.toLocaleDateString()} ${lastAliveDate.toLocaleTimeString()}`);
        console.log(`📊 Han pasado ${daysDifference} días desde el último check de vida`);
        console.log(`⏰ Días configurados para notificación: ${notificationDays}`);
        
        // Verificar si se ha superado el tiempo
        if (daysDifference <= notificationDays) {
          console.log(`✅ Usuario ${userData.name} está dentro del tiempo límite (${daysDifference}/${notificationDays} días)`);
          
          // OPCIÓN 1: Enviar notificación SOLO con las reglas inteligentes
          const daysUntilLimit = notificationDays - daysDifference;
          const shouldSendReminder = shouldSendReminderNotification(daysDifference, notificationDays);
          
          // OPCIÓN 2: Enviar notificación SIEMPRE (cada vez que se ejecuta el script)
          const shouldSendAlways = true; // Cambia a false si solo quieres las reglas inteligentes
          
          const shouldNotify = shouldSendAlways || shouldSendReminder;
          
          if (shouldNotify && userData.fcmToken) {
            try {
              await sendReminderFCM(userData, daysUntilLimit, daysDifference, shouldSendAlways);
              console.log(`🔔 Notificación enviada a ${userData.name} ${shouldSendAlways ? '(enviado por script)' : '(regla inteligente)'}`);
            } catch (fcmError) {
              console.error(`❌ Error enviando FCM a ${userData.name}:`, fcmError);
            }
          } else if (shouldNotify && !userData.fcmToken) {
            console.log(`⚠️  Usuario ${userData.name} no tiene FCM token para notificación`);
          } else if (!shouldNotify) {
            console.log(`ℹ️  Sin notificación para ${userData.name} (no cumple criterios)`);
          }
          
          continue;
        }
        
        console.log(`🚨 PROTOCOLO ACTIVADO para ${userData.name}! Han pasado ${daysDifference} días (límite: ${notificationDays})`);
        
        // Enviar emails a contactos de emergencia
        if (emergencyEmails.length === 0) {
          console.log(`⚠️  Usuario ${userData.name} no tiene emails de emergencia configurados`);
          continue;
        }
        
        for (const emergencyEmail of emergencyEmails) {
          try {
            await sendEmergencyEmail(userData, emergencyEmail, notificationDays, daysDifference, lastAliveDate);
            console.log(`📧 Email enviado a: ${emergencyEmail}`);
          } catch (emailError) {
            console.error(`❌ Error enviando email a ${emergencyEmail}:`, emailError);
          }
        }
        
        console.log(`✅ Protocolo completado para ${userData.name}`);
        
      } catch (userError) {
        console.error(`❌ Error procesando usuario ${userData.name}:`, userError);
      }
    }
    
    console.log('\n🏁 Protocolo After Life completado');
    
  } catch (error) {
    console.error('Error en protocoloAfterLife:', error);
  } finally {
    // Cerrar la conexión
    await admin.app().delete();
  }
};

// Función para generar el HTML del email
const generateHtml = (userData, emergencyEmail, notificationDays, daysPassed, lastAliveDate) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
      🔔 Protocolo After Life Activado
    </h2>
    
    <p>Hola,</p>
    
    <p>El protocolo <strong>After Life</strong> se ha activado para <strong>${userData.name}</strong>.</p>
    
    <p>Usted ha sido asignado como persona de confianza por este usuario.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
      <p><strong>Detalles del protocolo:</strong></p>
      <ul>
        <li>Días sin confirmación de vida: <strong>${daysPassed} días</strong></li>
        <li>Límite configurado: <strong>${notificationDays} días</strong></li>
        <li>Último check de vida: <strong>${lastAliveDate.toLocaleDateString()} a las ${lastAliveDate.toLocaleTimeString()}</strong></li>
      </ul>
    </div>
    
    <p>Esto significa que, tras no recibir confirmación de vida en ${notificationDays} días, se ha activado el envío de su información configurada.</p>
    
    <p>Puede acceder a la información a través del siguiente enlace:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://afterlife.app/access?email=${encodeURIComponent(emergencyEmail)}" 
         style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        🔗 Ver datos de ${userData.name}
      </a>
    </div>
    
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    
    <p style="font-size: 14px; color: #666;">
      Gracias por ser parte del protocolo de confianza de <strong>After Life</strong>.
    </p>
    
    <p style="font-size: 12px; color: #999; margin-top: 20px;">
      Este es un email automático del sistema After Life. Si cree que esto es un error, 
      puede contactar con nuestro soporte técnico.
    </p>
  </div>
`;

// Función para enviar email (implementada con Nodemailer)
const sendEmergencyEmail = async (userData, emergencyEmail, notificationDays, daysPassed, lastAliveDate) => {
  const emailHtml = generateHtml(userData, emergencyEmail, notificationDays, daysPassed, lastAliveDate);
  const subject = `🚨 Protocolo After Life Activado - ${userData.name}`;
  
  const mailOptions = {
    from: {
      name: 'After Life Protocol',
      address: process.env.EMAIL_USER
    },
    to: emergencyEmail,
    subject: subject,
    html: emailHtml,
    // Opcional: versión texto plano
    text: `
Protocolo After Life Activado

Hola,

El protocolo After Life se ha activado para ${userData.name}.
Usted ha sido asignado como persona de confianza por este usuario.

Detalles:
- Días sin confirmación: ${daysPassed} días
- Límite configurado: ${notificationDays} días  
- Último check: ${lastAliveDate.toLocaleDateString()} ${lastAliveDate.toLocaleTimeString()}

Acceda a la información en: https://afterlife-515a8.firebaseapp.com/access?email=${encodeURIComponent(emergencyEmail)}

Gracias por ser parte del protocolo After Life.
    `.trim(),
    // Headers adicionales
    headers: {
      'X-Priority': '1', // Alta prioridad
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    }
  };
  
  try {
    console.log(`📧 Enviando email a: ${emergencyEmail}...`);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email enviado exitosamente:`, {
      messageId: info.messageId,
      response: info.response,
      to: emergencyEmail
    });
    
    // Registrar el envío en Firestore para auditoría
    await db.collection('email_logs').add({
      user_id: userData.id,
      type: 'emergency_protocol_activated',
      recipient: emergencyEmail,
      subject: subject,
      message_id: info.messageId,
      days_passed: daysPassed,
      notification_days: notificationDays,
      last_alive_date: admin.firestore.Timestamp.fromDate(lastAliveDate),
      sent_at: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent',
      smtp_response: info.response
    });
    
    return info;
    
  } catch (error) {
    console.error(`❌ Error enviando email a ${emergencyEmail}:`, error);
    
    // Registrar el error en Firestore
    await db.collection('email_logs').add({
      user_id: userData.id,
      type: 'emergency_protocol_activated',
      recipient: emergencyEmail,
      subject: subject,
      days_passed: daysPassed,
      notification_days: notificationDays,
      last_alive_date: admin.firestore.Timestamp.fromDate(lastAliveDate),
      sent_at: admin.firestore.FieldValue.serverTimestamp(),
      status: 'failed',
      error_message: error.message,
      error_code: error.code
    });
    
    throw error;
  }
};

// Función para determinar si se debe enviar notificación de recordatorio
const shouldSendReminderNotification = (daysPassed, notificationDays) => {
  const daysLeft = notificationDays - daysPassed;
  
  // Enviar recordatorio cuando quedan:
  // - 7 días o menos
  // - 3 días o menos  
  // - 1 día o menos
  // - Solo si han pasado al menos 50% del tiempo configurado
  
  const halfPeriod = Math.floor(notificationDays / 2);
  const hasPassedHalfPeriod = daysPassed >= halfPeriod;
  
  return hasPassedHalfPeriod && (daysLeft <= 7 || daysLeft <= 3 || daysLeft <= 1);
};

// Función para enviar notificación FCM de recordatorio
const sendReminderFCM = async (userData, daysUntilLimit, daysPassed, isScriptRun = false) => {
  if (!userData.fcmToken) {
    throw new Error('Usuario no tiene FCM token');
  }
  
  // Crear mensaje personalizado según los días restantes
  let title, body, urgencyLevel;
  
  if (isScriptRun && daysUntilLimit > 7) {
    // Mensaje especial cuando se ejecuta el script y no está cerca del límite
    urgencyLevel = 'routine';
    title = '💙 Recordatorio rutinario - After Life';
    body = `Hola ${userData.name}, recuerda hacer tu check de vida. Han pasado ${daysPassed} de ${daysPassed + daysUntilLimit} días.`;
  } else if (daysUntilLimit <= 1) {
    urgencyLevel = 'critical';
    title = '🚨 ¡Último día! - After Life';
    body = `${userData.name}, tienes menos de 24 horas para confirmar que estás bien. ¡Haz tu check de vida ahora!`;
  } else if (daysUntilLimit <= 3) {
    urgencyLevel = 'high';
    title = '⚠️ Quedan pocos días - After Life';
    body = `${userData.name}, quedan ${daysUntilLimit} días para tu check de vida. No olvides confirmar que estás bien.`;
  } else if (daysUntilLimit <= 7) {
    urgencyLevel = 'medium';
    title = '🔔 Recordatorio - After Life';
    body = `Hola ${userData.name}, han pasado ${daysPassed} días desde tu último check. Quedan ${daysUntilLimit} días.`;
  } else {
    urgencyLevel = 'low';
    title = '💙 Check de vida - After Life';
    body = `${userData.name}, es un buen momento para hacer tu check de vida. Han pasado ${daysPassed} días.`;
  }
  
  const message = {
    token: userData.fcmToken,
    notification: {
      title: title,
      body: body,
    },
    data: {
      type: 'alive_check_reminder',
      urgency: urgencyLevel,
      days_passed: daysPassed.toString(),
      days_until_limit: daysUntilLimit.toString(),
      user_id: userData.id,
      is_script_run: isScriptRun.toString(),
      timestamp: new Date().toISOString()
    },
    android: {
      notification: {
        icon: 'ic_notification',
        color: urgencyLevel === 'critical' ? '#FF0000' : 
               urgencyLevel === 'high' ? '#FF8800' : 
               urgencyLevel === 'medium' ? '#FFB800' : '#007BFF',
        priority: urgencyLevel === 'critical' ? 'max' : 'high',
        channelId: 'alive_check_reminders'
      }
    },
    apns: {
      payload: {
        aps: {
          badge: 1,
          sound: urgencyLevel === 'critical' ? 'critical_alert.wav' : 'default',
          category: 'ALIVE_CHECK_REMINDER'
        }
      }
    }
  };
  
  try {
    const response = await messaging.send(message);
    console.log(`✅ FCM enviado exitosamente: ${response}`);
    
    // Registrar el envío en una colección (opcional)
    await db.collection('notification_logs').add({
      user_id: userData.id,
      type: 'alive_check_reminder',
      urgency: urgencyLevel,
      days_passed: daysPassed,
      days_until_limit: daysUntilLimit,
      is_script_run: isScriptRun,
      fcm_response: response,
      sent_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return response;
    
  } catch (error) {
    console.error('Error enviando FCM:', error);
    
    // Si el token es inválido, podrías marcarlo para limpieza
    if (error.code === 'messaging/registration-token-not-registered' ||
        error.code === 'messaging/invalid-registration-token') {
      console.log(`⚠️  FCM Token inválido para ${userData.name}, considerar limpiar`);
      
      // Opcional: Marcar el token como inválido en la base de datos
      // await db.collection('users').doc(userData.id).update({
      //   fcmToken: admin.firestore.FieldValue.delete(),
      //   fcmTokenInvalidatedAt: admin.firestore.FieldValue.serverTimestamp()
      // });
    }
    
    throw error;
  }
};

// Ejecutar cada 24 horas a las 00:00
cron.schedule('0 0 * * *', protocoloAfterLife);
// Ejecutar inmediatamente
//protocoloAfterLife();
console.log('Script programado para ejecutar cada 24 horas...');