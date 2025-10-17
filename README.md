# AfterLife 💜

**Sistema de supervivencia digital** que monitorea tu actividad diaria y protege tu información crítica para el futuro. Si no confirmas que estás vivo dentro de un período configurado, el sistema notifica automáticamente a tus contactos de confianza.

## 🌟 Características Principales

- **🔐 Autenticación Segura** - Login con Google y GitHub OAuth
- **⏰ Check-in Diario** - Confirma que estás vivo con un simple click  
- **📧 Notificaciones Inteligentes** - FCM push notifications y emails automáticos
- **⚙️ Configuración Personalizable** - Define días límite y contactos de emergencia
- **🎨 Interfaz Moderna** - 6 temas de color con efectos interactivos
- **📱 Diseño Responsivo** - Optimizado para móvil y desktop
- **🔄 Sistema de Respaldo** - Funciones programadas en la nube

## 🏗️ Arquitectura del Proyecto

```
AfterLife/
├── frontend/                    # React + Vite Application
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── context/           # Context API (Auth, etc.)
│   │   ├── firebase/          # Configuración Firebase
│   │   ├── pages/             # Páginas de la aplicación
│   │   └── utils/             # Utilidades
│   ├── public/                # Archivos estáticos
│   └── package.json           # Dependencias frontend
├── functions/                  # Firebase Cloud Functions
│   ├── index.js              # Función scheduled principal
│   ├── package.json          # Dependencias backend
│   └── test-local.js         # Testing local
├── backend/                   # Funciones adicionales (legacy)
└── firebase.json             # Configuración Firebase
```

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 19.1.0** - Framework principal
- **Vite 7.0.4** - Build tool y dev server
- **Tailwind CSS 4.1.11** - Styling y responsive design
- **Firebase SDK 12.0.0** - Autenticación y Firestore
- **React Router 7.7.1** - Navegación SPA
- **Lucide React** - Iconografía moderna
- **React Hot Toast** - Notificaciones UI
- **React Confetti** - Efectos visuales

### **Backend**
- **Firebase Cloud Functions** - Serverless functions
- **Node.js 22** - Runtime del servidor
- **Firebase Admin SDK 12.6.0** - Administración server-side
- **Nodemailer 7.0.9** - Envío de emails
- **Moment-timezone 0.6.0** - Manejo de fechas y zonas horarias
- **Firebase Firestore** - Base de datos NoSQL
- **Firebase Cloud Messaging** - Push notifications

### **Infraestructura**
- **Firebase Hosting** - Deployment frontend
- **Firebase Functions** - Deployment backend
- **Firebase Authentication** - OAuth con Google/GitHub
- **Gmail SMTP** - Servidor de correo
- **Cron Scheduler** - Tareas programadas

## 🗄️ Estructura de Base de Datos (Firestore)

### **Colección: `users`**
```javascript
{
  id: "user_uid",                    // String - UID de Firebase Auth
  id_platform: "google_user_id",    // String - ID del proveedor OAuth
  platform: "google",               // String - google | github
  email: "usuario@email.com",       // String - Email del usuario
  name: "Nombre Usuario",           // String - Nombre completo
  avatar: "https://...",            // String - URL de avatar
  created_at: Timestamp,            // Timestamp - Fecha creación
  last_alive_check: Timestamp,      // Timestamp - Último check-in
  fcmToken: "fcm_token..."          // String - Token para push notifications
}
```

### **Colección: `user_settings`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  notification_days: 15,            // Number - Días antes de emergencia
  emergency_email: [                // Array - Contactos de emergencia
    "contacto1@email.com",
    "contacto2@email.com"
  ],
  active: true,                     // Boolean - Configuración activa
  created_at: Timestamp,            // Timestamp - Fecha creación
  updated_at: Timestamp             // Timestamp - Última actualización
}
```

### **Colección: `alive_checks`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  timestamp: Timestamp              // Timestamp - Momento del check-in
}
```

### **Colección: `notifications_sent`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  sent_at: Timestamp,               // Timestamp - Momento del envío
  status: "push_sent",              // String - email_sent | push_sent
  type: "daily_reminder"            // String - daily_reminder | urgent_reminder | emergency | alive_check
}
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 20+ 
- npm o yarn
- Cuenta de Firebase
- Cuenta de Gmail (para SMTP)

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/afterlife.git
cd afterlife
```

### **2. Instalar Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
```

### **3. Crear Proyecto Firebase**
```bash
# Crear nuevo proyecto en Firebase Console
firebase init

# Seleccionar:
# ✅ Functions
# ✅ Hosting  
# ✅ Firestore
# ✅ Authentication
```

### **4. Configurar Authentication**

En **Firebase Console → Authentication → Sign-in method**, habilitar:
- ✅ Google
- ✅ GitHub

Configurar dominios autorizados y OAuth redirects.

### **5. Configurar Variables de Entorno**

#### **Frontend (`.env.development` y `.env.production`)**
```env
VITE_API_KEY=tu_firebase_api_key
VITE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_PROJECT_ID=tu-proyecto-id
VITE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_MESSAGING_SENDER_ID=123456789
VITE_APP_ID=1:123456789:web:abcdef
VITE_VAPID_KEY=tu_vapid_key_para_notificaciones_web
```

#### **Obtener VAPID Key**
```bash
# En Firebase Console → Project Settings → Cloud Messaging
# Generar par de claves para certificados de aplicación web
```

### **6. Configurar Gmail SMTP**

#### **Generar Contraseña de Aplicación**
1. Gmail → Gestionar cuenta de Google
2. Seguridad → Verificación en 2 pasos (activar)
3. Contraseñas de aplicaciones → Generar
4. Copiar contraseña generada (formato: `abcd efgh ijkl mnop`)

#### **Actualizar Functions**
En `functions/index.js` línea 15-19:
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tu-email@gmail.com',      // ⚠️ CAMBIAR
    pass: 'abcd efgh ijkl mnop'      // ⚠️ CAMBIAR - Contraseña de app
  }
});
```

### **7. Instalar Dependencias**

#### **Frontend**
```bash
cd frontend
npm install
```

#### **Functions**  
```bash
cd functions
npm install
```

## 🚀 Comandos de Deployment

### **1. Deploy Completo (Recomendado)**
```bash
# Desde la raíz del proyecto
firebase deploy
```

### **2. Deploy por Componentes**

#### **Solo Frontend**
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

#### **Solo Functions**
```bash
firebase deploy --only functions
```

#### **Solo Firestore Rules**  
```bash
firebase deploy --only firestore:rules
```

### **3. Testing Local**

#### **Frontend Development**
```bash
cd frontend
npm run dev
# Disponible en: http://localhost:5173
```

#### **Functions Emulator**
```bash
cd functions
npm run serve
# Disponible en: http://localhost:5001
```

#### **Test Manual de Functions**
```bash
cd functions
firebase functions:shell
# En la shell: checkAliveStatus()
```

#### **Testing con Node.js**
```bash
cd functions
node test-local.js
```

## ⚡ Configuración de Firestore Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User settings
    match /user_settings/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // Alive checks
    match /alive_checks/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // Notifications sent (read-only for users)
    match /notifications_sent/{document} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
  }
}
```

## 🔧 Configuración de Cloud Scheduler

La función `checkAliveStatus` se ejecuta automáticamente todos los días a las **9:55 AM (Colombia)**:

```javascript
// functions/index.js - línea 23
export const checkAliveStatus = onSchedule({
  schedule: '55 9 * * *',          // Cron: minuto hora * * *
  timeZone: 'America/Bogota'       // Zona horaria
}, async (event) => {
  // Lógica de verificación...
});
```

### **Modificar Horario**
```javascript
// Ejemplos de horarios cron:
'0 8 * * *'    // 8:00 AM diario
'30 20 * * *'  // 8:30 PM diario  
'0 12 * * 1'   // 12:00 PM solo lunes
'*/30 * * * *' // Cada 30 minutos
```

## � Variables de Seguridad

### **⚠️ IMPORTANTE: Cambiar Antes del Deploy**

1. **Gmail Credentials** (`functions/index.js`)
2. **Firebase Config** (archivos `.env`)
3. **VAPID Keys** (Firebase Console)
4. **OAuth Providers** (URLs autorizadas)

### **🔐 Variables Sensibles**
```bash
# NO subir al repositorio:
.env.development
.env.production
.env.local
functions/.env
```

## 📊 Monitoreo y Logs

### **Ver Logs de Functions**
```bash
firebase functions:log
firebase functions:log --only checkAliveStatus
```

### **Logs en Tiempo Real**
```bash
firebase functions:log --follow
```

### **Métricas en Firebase Console**
- Functions → Métricas
- Authentication → Usuarios
- Firestore → Uso
- Hosting → Estadísticas

## 🧪 Testing y Desarrollo

### **1. Datos de Prueba**
```javascript
// Crear usuario de prueba en Firestore
{
  id: "test_user_123",
  name: "Usuario Test",
  email: "test@example.com",
  fcmToken: "token_de_prueba...",
  created_at: new Date()
}
```

### **2. Testing Manual**
1. Registrarse en la app
2. Configurar contactos de emergencia  
3. Hacer check-in diario
4. Esperar notificación (o usar emulador)

### **3. Debug Common Issues**
```bash
# Verificar permisos Firestore
firebase firestore:rules:list

# Verificar functions deployment
firebase functions:log --only checkAliveStatus  

# Test notifications permissions
# En DevTools Console:
Notification.requestPermission()
```

## 🌍 Contribución Open Source

### **🎯 Cómo Contribuir**
1. Fork el repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### **🐛 Reportar Issues**
- Usar GitHub Issues
- Incluir logs de error
- Describir pasos para reproducir
- Especificar navegador/OS

### **📝 Roadmap**
- [ ] App móvil nativa (React Native)
- [ ] Integración con más proveedores OAuth
- [ ] Backup automático de datos
- [ ] Interfaz de administración
- [ ] API pública para terceros
- [ ] Soporte multi-idioma
- [ ] Notificaciones por SMS/WhatsApp

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT** - libre para uso comercial y personal. Ver archivo `LICENSE` para más detalles.

## 💝 Mensaje del Creador

Este software fue creado por un desarrollador independiente que cree en el poder de la tecnología open source para hacer el mundo más seguro.

**AfterLife** es mi contribución a la comunidad global de programadores, con la esperanza de que esta tecnología pueda salvar vidas y dar tranquilidad a familias de todo el mundo.

### 🌍 **Para Desarrolladores del Mundo**

Si eres programador y usas este proyecto:
- ✅ **Úsalo libremente** para ti, tu familia o tu empresa
- ✅ **Modifícalo** según tus necesidades
- ✅ **Crea versiones comerciales** si quieres
- ✅ **Contribuye mejoras** para ayudar a otros
- ✅ **No necesitas dar crédito** (pero se aprecia)

**Mi única petición**: Usa este código para hacer el mundo un poco más seguro.

## 🤝 Comunidad

- **GitHub Issues**: Para reportar bugs y sugerir funcionalidades
- **GitHub Discussions**: Para preguntas y conversaciones
- **Pull Requests**: Para contribuir código
- **Stars**: Para mostrar apoyo al proyecto ⭐

## ⚠️ Disclaimer

Este sistema está diseñado como una herramienta de respaldo digital personal. Es un proyecto open source creado con buenas intenciones, pero sin garantías.

**Recomendación**: Usar como sistema complementario, no como único método de emergencia.

## 🙏 Agradecimientos

A todos los desarrolladores que:
- Usan este software para proteger a sus seres queridos
- Contribuyen con mejoras y correcciones  
- Comparten el proyecto con otros programadores
- Creen en el poder del código abierto para cambiar el mundo

---

### 💜 *"Protege lo que importa, para cuando ya no estés aquí"*

> **"Código con propósito, construye con amor, comparte con el mundo."**

**¿Te gusta el proyecto?** ⭐ Dale una estrella en GitHub y compártelo con otros desarrolladores para que juntos hagamos del mundo digital un lugar más seguro.