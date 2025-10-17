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

const creativeMessage = "¿Estás vivo? 😊 Realiza tu check-in hoy y confirma que todo está bien";

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
                await transporter.sendMail({
                  from: `"${process.env.SENDER_NAME || 'AfterLife Monitor'}" <${process.env.GMAIL_USER}>`,
                  to: email,
                  subject: `Alerta: ${user.name} no ha hecho check-in`,
                  text: `Hola, ${user.name} no ha registrado actividad en ${daysSinceLastCheck} días. Por favor verifica si está bien.`
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
                  : creativeMessage
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
                        : creativeMessage
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
                    : creativeMessage,
                  icon: '/icon-192.png',
                  badge: '/badge-72.png',
                  requireInteraction: true
                }
              }
            };

            const response = await messaging.send(message);
            console.log(`✅ FCM enviado exitosamente a ${user.name}`);
            console.log(`📊 Response ID: ${response}`);
            
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