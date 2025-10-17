# Configuración de Variables de Entorno 🔧

Esta guía te ayudará a configurar todas las variables de entorno necesarias para ejecutar AfterLife localmente.

## 📂 Archivos de Configuración

### Frontend
- `.env.development` - Desarrollo local
- `.env.production` - Producción/deployment

### Backend
- `functions/.env` - Variables de Firebase Functions (opcional)

## 🔥 Firebase Configuration

### 1. Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea nuevo proyecto: "afterlife-tu-nombre"
3. Habilita Google Analytics (opcional)

### 2. Configurar Authentication
```bash
# En Firebase Console:
# Authentication → Sign-in method → Habilitar:
# ✅ Google
# ✅ GitHub (opcional)
```

### 3. Crear Web App
```bash
# En Firebase Console:
# Project Settings → General → Your apps
# Hacer clic en </> (Web app)
# Nombre: AfterLife Web
# ✅ También configurar Firebase Hosting
```

### 4. Obtener Configuración
Copiar el objeto de configuración:

```javascript
// Tu configuración se verá así:
const firebaseConfig = {
  apiKey: "AIzaSyB1234567890abcdefghijklmnop",
  authDomain: "afterlife-12345.firebaseapp.com", 
  projectId: "afterlife-12345",
  storageBucket: "afterlife-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## 📱 Push Notifications (FCM)

### 1. Generar VAPID Key
```bash
# En Firebase Console:
# Project Settings → Cloud Messaging
# Web configuration → Web Push certificates
# Hacer clic en "Generate key pair"
```

### 2. Copiar Claves
```javascript
// Copiar estas dos claves:
Server key: AAAA1234567890:APA91bF_ejemplo_de_server_key...
VAPID key: BNKou0yh41LB3USAmAY7IYTXCCBWZBC9fsWjOLgU4ouA9n0q9Kfei1vffKczvTJCqEpfAQMS1MFFcqgfIt_G1CE
```

## 📧 Gmail SMTP Configuration

### 1. Habilitar 2FA en Gmail
1. Ve a [Gestionar cuenta de Google](https://myaccount.google.com/)
2. Seguridad → Verificación en 2 pasos → Activar

### 2. Generar Contraseña de Aplicación
1. Seguridad → Contraseñas de aplicaciones
2. Seleccionar app: Correo
3. Seleccionar dispositivo: Otro (nombre personalizado)
4. Escribir: "AfterLife Backend"
5. **Generar** → Copiar la contraseña (formato: `abcd efgh ijkl mnop`)

⚠️ **IMPORTANTE**: La contraseña se muestra **con espacios**, déjala así.

## 📝 Templates de Variables

### Frontend: `.env.development`
```env
# Firebase Configuration
VITE_API_KEY=AIzaSyB1234567890abcdefghijklmnop
VITE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_PROJECT_ID=tu-proyecto-id
VITE_STORAGE_BUCKET=tu-proyecto.appspot.com  
VITE_MESSAGING_SENDER_ID=123456789012
VITE_APP_ID=1:123456789012:web:abcdef1234567890

# Push Notifications
VITE_VAPID_KEY=BNKou0yh41LB3USAmAY7IYTXCCBWZBC9fsWjOLgU4ouA9n0q9Kfei1vffKczvTJCqEpfAQMS1MFFcqgfIt_G1CE
```

### Frontend: `.env.production`
```env
# Firebase Configuration (Production)
VITE_API_KEY=AIzaSyB_PRODUCTION_KEY_diferente
VITE_AUTH_DOMAIN=tu-proyecto-prod.firebaseapp.com
VITE_PROJECT_ID=tu-proyecto-prod-id
VITE_STORAGE_BUCKET=tu-proyecto-prod.appspot.com
VITE_MESSAGING_SENDER_ID=987654321098
VITE_APP_ID=1:987654321098:web:fedcba0987654321

# Push Notifications (Production)
VITE_VAPID_KEY=BDifferentVapidKeyForProduction1234567890...
```

### Backend: `functions/.env` (Opcional)
```env
# Gmail SMTP (si no quieres hardcodear en el código)
GMAIL_USER=tu-email@gmail.com
GMAIL_PASS=abcd efgh ijkl mnop

# Configuraciones adicionales
NOTIFICATION_HOUR=9
NOTIFICATION_MINUTE=55
DEFAULT_NOTIFICATION_DAYS=15
```

## 🔧 Configuración Manual en Código

### functions/index.js
```javascript
// Líneas 15-19: Configuración Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'TU-EMAIL@gmail.com',           // ⚠️ CAMBIAR
    pass: 'abcd efgh ijkl mnop'           // ⚠️ CAMBIAR - Con espacios
  }
});

// Línea 23: Configuración de horario
export const checkAliveStatus = onSchedule({
  schedule: '55 9 * * *',                 // ⚠️ CAMBIAR si quieres otro horario
  timeZone: 'America/Bogota'              // ⚠️ CAMBIAR a tu zona horaria
}, async (event) => {
```

### Zonas Horarias Comunes
```javascript
'America/New_York'    // EST/EDT
'America/Los_Angeles' // PST/PDT  
'America/Chicago'     // CST/CDT
'America/Mexico_City' // CST
'America/Bogota'      // COT
'America/Buenos_Aires'// ART
'Europe/Madrid'       // CET/CEST
'Europe/London'       // GMT/BST
'Asia/Tokyo'          // JST
'Asia/Shanghai'       // CST
```

### Horarios Cron Ejemplos
```javascript
'0 8 * * *'     // 8:00 AM todos los días
'30 7 * * *'    // 7:30 AM todos los días  
'0 20 * * *'    // 8:00 PM todos los días
'0 12 * * 1'    // 12:00 PM solo los lunes
'*/30 * * * *'  // Cada 30 minutos (testing)
'0 9 * * 1-5'   // 9:00 AM días laborables
```

## 🔒 OAuth Providers Configuration

### Google OAuth
```bash
# En Firebase Console:
# Authentication → Sign-in method → Google
# ✅ Habilitar
# Agregar dominios autorizados:
# - localhost (para desarrollo)
# - tu-dominio.com (para producción)
```

### GitHub OAuth (Opcional)
```bash
# 1. Crear OAuth App en GitHub:
# GitHub → Settings → Developer settings → OAuth Apps
# 
# Application name: AfterLife
# Homepage URL: https://tu-dominio.com
# Authorization callback URL: https://tu-proyecto.firebaseapp.com/__/auth/handler
#
# 2. Copiar Client ID y Client Secret
#
# 3. En Firebase Console:
# Authentication → Sign-in method → GitHub
# ✅ Habilitar
# Pegar Client ID y Client Secret
```

## 🗄️ Firestore Configuration

### 1. Crear Base de Datos
```bash
# En Firebase Console:
# Firestore Database → Create database
# Seleccionar: Start in test mode (cambiaremos las reglas después)
# Ubicación: us-central (o la más cercana a tus usuarios)
```

### 2. Configurar Reglas de Seguridad
```javascript
// En Firebase Console: Firestore → Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users - solo el propietario puede leer/escribir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User settings - solo el propietario  
    match /user_settings/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // Alive checks - solo el propietario
    match /alive_checks/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // Notifications - solo lectura para el propietario
    match /notifications_sent/{document} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      // Write solo para Functions (automático)
    }
  }
}
```

## ✅ Verificación de Configuración

### Checklist Pre-Deploy
- [ ] Todas las variables `.env` configuradas
- [ ] Gmail SMTP con contraseña de aplicación
- [ ] Firebase project creado y configurado
- [ ] Authentication providers habilitados  
- [ ] Firestore rules configuradas
- [ ] VAPID keys generadas
- [ ] OAuth callbacks configurados
- [ ] Zona horaria correcta en functions

### Testing Rápido
```bash
# 1. Frontend
cd frontend
npm run dev
# Verificar: Login funciona, no errores en console

# 2. Functions  
cd functions
npm run serve
firebase functions:shell
# En shell: checkAliveStatus()
# Verificar: No errores, logs aparecen

# 3. Notificaciones
# En la app web, permitir notificaciones
# Verificar: Token FCM se genera y almacena
```

## 🚨 Troubleshooting

### Error: "Firebase project not found"
```bash
# Verificar que estás en el proyecto correcto
firebase projects:list
firebase use tu-proyecto-id
```

### Error: "Invalid VAPID key"
```bash
# Regenerar VAPID key en Firebase Console
# Actualizar en .env.development y .env.production
```

### Error: "Gmail authentication failed"  
```bash
# Verificar que:
# 1. 2FA está activado en Gmail
# 2. Contraseña de aplicación es correcta (con espacios)
# 3. Email es correcto
```

### Error: "Function deployment failed"
```bash
# Verificar Node.js version
node --version  # Debe ser 20+

# Limpiar y reinstalar
cd functions
rm -rf node_modules package-lock.json
npm install
```

---

**¿Problemas con la configuración?** Abre un [Issue](https://github.com/tu-usuario/afterlife/issues) con los detalles específicos.