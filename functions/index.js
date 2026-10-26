import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import moment from 'moment-timezone';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

// Configuración de Nodemailer con variables de entorno
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verificar que las variables de entorno estén configuradas
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error('⚠️ ADVERTENCIA: Variables de entorno GMAIL_USER o GMAIL_APP_PASSWORD no configuradas');
  console.error('📝 Copia functions/.env.example a functions/.env y configura las credenciales');
}

if (!process.env.AFTERLIFE_URL) {
  console.error('⚠️ ADVERTENCIA: Variable de entorno AFTERLIFE_URL no configurada');
  console.error('📝 Esta URL se usa para los enlaces en emails de emergencia');
}

// Mensajes aleatorios para notificaciones push
const creativeMessages = [
  "¿Estás vivo? 😊 Realiza tu check-in hoy y confirma que todo está bien",
  "🌟 ¡Otro día más! Confirma que estás bien con tu check-in diario",
  "💪 Sigues aquí, sigues fuerte. Haz tu check-in y continúa brillando",
  "🚀 Tu legado digital está seguro. Solo confirma que todo va bien",
  "🌅 Un nuevo día, nuevas oportunidades. ¡Haz tu check-in!",
  "💜 Tus seres queridos confían en ti. Confirma que estás bien hoy",
  "⚡ Eres importante para muchos. Tu check-in diario los tranquiliza",
  "🎯 Mantén tu protocolo activo. Un simple click y listo",
  "🛡️ Tu información está protegida. Solo falta tu confirmación diaria",
  "✨ Cada día cuenta, cada check-in importa. ¡Hazlo ahora!"
];

// Función para obtener mensaje aleatorio
const getRandomMessage = () => {
  return creativeMessages[Math.floor(Math.random() * creativeMessages.length)];
};

export const checkAliveStatus = onSchedule({
  schedule: '10 8 * * *',
  timeZone: process.env.TIMEZONE || 'America/Bogota'
}, async (event) => {
  try {
    console.log('Iniciando verificación de estado de usuarios...');
    
    const usersSnapshot = await db.collection('users').get();
    console.log(`Encontrados ${usersSnapshot.docs.length} usuarios`);

    for (const userDoc of usersSnapshot.docs) {
      try {
        const user = userDoc.data();
        const userId = user.id;
        
        if (!userId || !user.name) {
          console.log(`Usuario sin datos válidos: ${userDoc.id}`);
          continue;
        }

        const aliveChecks = await db.collection('alive_checks')
          .where('user_id', '==', userId)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();

        const lastCheck = aliveChecks.empty ? null : aliveChecks.docs[0].data().timestamp.toDate();

        const settingsSnap = await db.collection('user_settings')
          .where('user_id', '==', userId)
          .limit(1)
          .get();

        if (settingsSnap.empty) {
          console.log(`No se encontraron configuraciones para usuario: ${userId}`);
          continue;
        }

        const settings = settingsSnap.docs[0].data();
        const notificationDays = settings.notification_days || 15;
        const emergencyEmails = settings.emergency_email || [];

        const now = moment().tz('America/Bogota');
        const lastCheckDate = lastCheck ? moment(lastCheck).tz('America/Bogota') : null;
        const daysSinceLastCheck = lastCheckDate ? now.diff(lastCheckDate, 'days') : Infinity;

        console.log(`Usuario ${user.name}: ${daysSinceLastCheck} días desde último check-in`);

        if (daysSinceLastCheck >= notificationDays) {
          // EMERGENCIA: Usuario ha superado el límite - enviar emails
          if (emergencyEmails.length > 0) {
            for (const email of emergencyEmails) {
              try {
                const emailHtml = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                      <h2 style="color: #dc3545; text-align: center; margin-bottom: 20px;">🚨 Protocolo AfterLife Activado</h2>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        <strong>Se ha desplegado el protocolo AfterLife para ${user.name}.</strong>
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        Usted ha sido seleccionado como <strong>contacto de confianza</strong> para mantener a salvo la información que <strong>${user.name}</strong> ha decidido proteger.
                      </p>
                      
                      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404;">
                          <strong>📊 Estado actual:</strong> ${user.name} no ha registrado actividad en <strong>${daysSinceLastCheck} días</strong>.
                        </p>
                      </div>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        Como contacto de emergencia, ahora tiene acceso al panel de información protegida. Por favor, verifique el estado de ${user.name} y acceda a la información crítica si es necesario.
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.AFTERLIFE_URL}/emergency/${userId}" 
                           style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                          🛡️ Acceder al Dashboard de Emergencia
                        </a>
                      </div>
                      
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      
                      <p style="font-size: 14px; color: #666; text-align: center;">
                        Este es un mensaje automático del sistema AfterLife.<br>
                        Si tiene preguntas, por favor contacte directamente a ${user.name} o a su familia.
                      </p>
                    </div>
                  </div>
                `;

                await transporter.sendMail({
                  from: `"${process.env.SENDER_NAME || 'AfterLife Monitor'}" <${process.env.GMAIL_USER}>`,
                  to: email,
                  subject: `🚨 Protocolo AfterLife Activado - ${user.name}`,
                  html: emailHtml,
                  text: `PROTOCOLO AFTERLIFE ACTIVADO\n\nSe ha desplegado el protocolo AfterLife para ${user.name}. Usted ha sido seleccionado como contacto de confianza para mantener a salvo su información protegida.\n\nEstado: ${user.name} no ha registrado actividad en ${daysSinceLastCheck} días.\n\nAcceda al dashboard: ${process.env.AFTERLIFE_URL}/emergency?user=${userId}\n\nPor favor verifique su estado y acceda a la información crítica si es necesario.`
                });
                console.log(`Email de emergencia enviado a: ${email}`);
              } catch (emailError) {
                console.error(`Error enviando email a ${email}:`, emailError);
              }
            }

            await db.collection('notifications_sent').add({
              user_id: userId,
              sent_at: Timestamp.now(),
              status: 'email_sent',
              type: 'emergency'
            });
          }
        } 
        
        // RECORDATORIO DIARIO: Siempre enviar FCM (independiente de si se envió email)
        let pushSent = false;
        if (user.fcmToken) {
          try {
            console.log(`🔄 Intentando enviar FCM a ${user.name} con token: ${user.fcmToken.substring(0, 20)}...`);
            
            // Usar Firebase Admin SDK (usa automáticamente las credenciales del proyecto)
            const message = {
              token: user.fcmToken,
              notification: {
                title: 'AfterLife Check',
                body: daysSinceLastCheck >= notificationDays 
                  ? "⚠️ URGENTE: Tus contactos han sido notificados. ¡Haz check-in YA!"
                  : getRandomMessage()
              },
              data: {
                type: 'alive_check',
                timestamp: new Date().toISOString(),
                urgency: daysSinceLastCheck >= notificationDays ? 'high' : 'normal'
              },
              android: {
                priority: 'high',
                notification: {
                  channelId: 'afterlife_notifications',
                  priority: 'high',
                  defaultSound: true,
                  defaultVibrateTimings: true
                }
              },
              apns: {
                payload: {
                  aps: {
                    alert: {
                      title: 'AfterLife Check',
                      body: daysSinceLastCheck >= notificationDays 
                        ? "⚠️ URGENTE: Tus contactos han sido notificados. ¡Haz check-in YA!"
                        : getRandomMessage()
                    },
                    sound: 'default',
                    badge: 1,
                    'content-available': 1
                  }
                }
              },
              webpush: {
                notification: {
                  title: 'AfterLife Check',
                  body: daysSinceLastCheck >= notificationDays 
                    ? "⚠️ URGENTE: Tus contactos han sido notificados. ¡Haz check-in YA!"
                    : getRandomMessage(),
                  icon: '/icon-192.png',
                  badge: '/badge-72.png',
                  requireInteraction: true
                }
              }
            };

            const response = await messaging.send(message);
            console.log(`✅ FCM enviado exitosamente a ${user.name}`);
            console.log(`📊 Response ID: ${response}`);
            pushSent = true;
            
          } catch (fcmError) {
            console.error(`❌ Error enviando FCM a ${user.name}:`, fcmError.message);
            console.error(`🔍 Código de error: ${fcmError.code}`);
            console.error(`📝 Detalles completos:`, fcmError);
            
            // Verificar si el token es inválido
            if (fcmError.code === 'messaging/registration-token-not-registered' || 
                fcmError.code === 'messaging/invalid-registration-token') {
              console.log(`🔄 Token FCM inválido para ${user.name}, debería actualizarse en la app`);
            }
          }

          await db.collection('notifications_sent').add({
            user_id: userId,
            sent_at: Timestamp.now(),
            status: 'push_sent',
            type: daysSinceLastCheck >= notificationDays ? 'urgent_reminder' : 'daily_reminder'
          });
        } else {
          console.log(`Usuario ${user.name} no tiene FCM token`);
        }

        // RESPALDO EMAIL: Enviar email al usuario como respaldo de la notificación push
        // Esto asegura que el usuario reciba el recordatorio incluso si la push falla
        if (user.email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
          try {
            console.log(`📧 Enviando email de respaldo a ${user.email}...`);
            
            const emailMessage = daysSinceLastCheck >= notificationDays 
              ? "⚠️ URGENTE: Tus contactos han sido notificados. ¡Haz check-in YA!"
              : getRandomMessage();

            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h2 style="color: ${daysSinceLastCheck >= notificationDays ? '#dc3545' : '#6366f1'}; text-align: center; margin-bottom: 20px;">
                    ${daysSinceLastCheck >= notificationDays ? '⚠️' : '💜'} AfterLife Check-in
                  </h2>
                  
                  <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    Hola <strong>${user.name}</strong>,
                  </p>
                  
                  <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    ${emailMessage}
                  </p>
                  
                  ${daysSinceLastCheck >= notificationDays ? `
                  <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #856404;">
                      <strong>⏰ Estado:</strong> Han pasado <strong>${daysSinceLastCheck} días</strong> desde tu último check-in.
                    </p>
                  </div>
                  ` : `
                  <div style="background-color: #e8f4f8; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #0c5460;">
                      <strong>✅ Recordatorio:</strong> No olvides hacer tu check-in diario para mantener tu protocolo activo.
                    </p>
                  </div>
                  `}
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.AFTERLIFE_URL || 'https://afterlife.app'}" 
                       style="background-color: ${daysSinceLastCheck >= notificationDays ? '#dc3545' : '#6366f1'}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                      ${daysSinceLastCheck >= notificationDays ? '🚨' : '💜'} Hacer Check-in Ahora
                    </a>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                  
                  <p style="font-size: 14px; color: #666; text-align: center;">
                    Este es un recordatorio automático del sistema AfterLife.<br>
                    ${!pushSent ? 'Este email es un respaldo ya que no se pudo enviar la notificación push.<br>' : ''}
                    Para gestionar tus notificaciones, accede a tu dashboard.
                  </p>
                </div>
              </div>
            `;

            await transporter.sendMail({
              from: `"${process.env.SENDER_NAME || 'AfterLife Monitor'}" <${process.env.GMAIL_USER}>`,
              to: user.email,
              subject: daysSinceLastCheck >= notificationDays 
                ? `⚠️ URGENTE: AfterLife Check-in Requerido - ${user.name}`
                : `💜 Recordatorio AfterLife: Tu Check-in Diario`,
              html: emailHtml,
              text: `${emailMessage}\n\nHaz tu check-in ahora: ${process.env.AFTERLIFE_URL || 'https://afterlife.app'}\n\n${!pushSent ? 'Este email es un respaldo ya que no se pudo enviar la notificación push.\n\n' : ''}${daysSinceLastCheck >= notificationDays ? `Han pasado ${daysSinceLastCheck} días desde tu último check-in.` : ''}`
            });

            console.log(`✅ Email de respaldo enviado exitosamente a ${user.email}`);
            
            await db.collection('notifications_sent').add({
              user_id: userId,
              sent_at: Timestamp.now(),
              status: 'email_backup_sent',
              type: daysSinceLastCheck >= notificationDays ? 'urgent_reminder' : 'daily_reminder',
              recipient: user.email
            });

          } catch (emailError) {
            console.error(`❌ Error enviando email de respaldo a ${user.email}:`, emailError);
            
            await db.collection('notifications_sent').add({
              user_id: userId,
              sent_at: Timestamp.now(),
              status: 'email_backup_failed',
              type: daysSinceLastCheck >= notificationDays ? 'urgent_reminder' : 'daily_reminder',
              recipient: user.email,
              error: emailError.message
            });
          }
        } else {
          if (!user.email) {
            console.log(`⚠️ Usuario ${user.name} no tiene email configurado`);
          }
          if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            console.log(`⚠️ Configuración de email no disponible (GMAIL_USER o GMAIL_APP_PASSWORD no configurados)`);
          }
        }
      } catch (userError) {
        console.error(`Error procesando usuario ${userDoc.id}:`, userError);
      }
    }

    console.log('Verificación completada exitosamente');
    return null;
  } catch (error) {
    console.error('Error en checkAliveStatus:', error);
    throw error;
  }
});