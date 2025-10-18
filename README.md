# AfterLife 💜

## 💡 **La Historia Que Cambió Todo**

**Hola, soy Farez Prieto [@orugal](https://github.com/orugal)**

Hace un par de años trabajaba en una empresa pequeña junto a un compañero. Éramos solo nosotros dos manejando toda la infraestructura tecnológica. Durante una pausa de café, él me hizo una pregunta que cambió mi perspectiva para siempre:

> *"¿Tú sabes qué pasaría si alguno de los dos muriera o le pasara algo grave? Con tanta información crítica que manejamos, dejaríamos a la empresa en serios problemas. Y no bastan solo los repositorios... ¿quién se encargaría de las contraseñas, los accesos, las configuraciones?"*

Esa conversación me persiguió durante días. Como desarrollador freelance, ahora manejo información sensible de múltiples clientes: credenciales de AWS, claves de bases de datos, configuraciones de servidores, documentos legales... Si algo me pasara, no solo mis clientes perderían el acceso a sus sistemas, sino que años de trabajo podrían perderse para siempre.

**AfterLife nació de esa realidad.**

---

## 🛡️ **¿Qué es AfterLife?**

**Sistema de supervivencia digital** que monitorea tu actividad diaria y protege tu información crítica para el futuro. El usuario debe presionar regularmente el botón **"¿ESTÁS VIVO?"** para reportarle al sistema que todo está bien. Si no confirmas que estás vivo dentro del período configurado, el sistema automáticamente notifica a tus contactos de confianza y activa el protocolo de emergencia digital.

### 🔄 **¿Cómo Funciona?**

1. **Check-in Diario**: Presionas el botón "¿ESTÁS VIVO?" para confirmar tu estado
2. **Monitoreo Automático**: El sistema cuenta los días desde tu último check-in  
3. **Alertas Preventivas**: Recibes notificaciones push recordándote hacer check-in
4. **Protocolo de Emergencia**: Si superas el límite configurado (ej: 15 días), se notifica a tus contactos
5. **Acceso Protegido**: Tus contactos reciben acceso a la información crítica que decidiste compartir

## 🌟 Características Principales

### 💓 **El Corazón del Sistema: "¿ESTÁS VIVO?"**
- **Botón Central** - Interfaz simple con un botón que debes presionar regularmente
- **Check-in Diario** - Confirma tu estado con un simple click cada día
- **Recordatorios Automáticos** - Notificaciones push que te recuerdan hacer check-in
- **Contador Visual** - Muestra claramente cuándo fue tu último registro de vida

### 🛡️ **Protocolo de Emergencia Digital**
- **Monitoreo Silencioso** - Cuenta automáticamente los días sin actividad
- **Configuración Personalizable** - Define tú mismo el límite de días (ej: 15 días)
- **Contactos de Confianza** - Lista de personas que serán notificadas en emergencia
- **Activación Automática** - Sistema se activa solo cuando superas el límite

### 🔐 **Gestión de Información Crítica**
- **Credenciales Encriptadas** - Guarda passwords de AWS, GitHub, servidores, etc.
- **Documentos Importantes** - Almacena archivos PEM, certificados, manuales
- **Configuración de Servidores** - SSH, puertos, usuarios, instrucciones de acceso
- **Suscripciones y Licencias** - Control de vencimientos y renovaciones

### 📱 **Experiencia de Usuario**
- **🔐 Autenticación Segura** - Login con Google y GitHub OAuth
- **📧 Notificaciones Inteligentes** - FCM push notifications y emails automáticos
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

## � **¿Por Qué Firebase? La Filosofía del "Proyecto Inmortal"**

### **🎯 El Problema de los Servidores Pagos**
```markdown
❌ PROBLEMA: Si pagas un servidor mensual y mueres...
   → El servidor se suspende por falta de pago
   → Tu sistema de emergencia FALLA justo cuando más se necesita
   → Las personas que querías proteger quedan sin acceso

✅ SOLUCIÓN: Firebase Serverless + Topes Gratuitos
   → El sistema funciona INDEFINIDAMENTE sin pagos
   → No hay servidores que mantener o facturas que pagar
   → Tu legado digital permanece activo por años
```

### **📊 Costos de Firebase (Topes Gratuitos Generosos)**

**🔥 Firebase Functions:**
- **2 millones de invocaciones/mes** - GRATIS
- **400,000 GB-segundos/mes** - GRATIS
- Para AfterLife: ~30 ejecuciones/mes por usuario = **66,666 usuarios GRATIS**

**📱 Cloud Messaging (FCM):**
- **ILIMITADO** - Completamente GRATIS
- Sin límites de notificaciones push

**🗄️ Firestore Database:**
- **1 GB almacenamiento** - GRATIS
- **50,000 lecturas/día** - GRATIS  
- **20,000 escrituras/día** - GRATIS
- Para AfterLife: Almacena **miles de usuarios** sin costo

**🌐 Firebase Hosting:**
- **10 GB almacenamiento** - GRATIS
- **360 MB/día transferencia** - GRATIS

### **⚠️ Responsabilidad del Usuario**

**SI por alguna razón excepcional superas los límites gratuitos:**
- Deberás mantener una **tarjeta de crédito activa** en Firebase
- **PERO esta NO es la filosofía del proyecto**
- El sistema está diseñado para **mantenerse dentro de los topes gratuitos**
- Un usuario normal NUNCA debería superar estos límites

### **🛡️ Garantía de Continuidad**
```markdown
🎯 OBJETIVO: Sistema que funcione por DÉCADAS sin intervención
📈 ESCALABILIDAD: Hasta 66,000+ usuarios sin costos
🔒 SEGURIDAD: Google mantiene la infraestructura
⚡ DISPONIBILIDAD: 99.95% uptime garantizado por Google
```

## �🗄️ Estructura de Base de Datos (Firestore)

**⚠️ IMPORTANTE**: Todas las colecciones deben ser creadas para el funcionamiento completo del sistema.

### **🔐 Autenticación y Usuario**

#### **Colección: `users`**
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

#### **Colección: `user_settings`**
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

### **💓 Sistema de Supervivencia**

#### **Colección: `alive_checks`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  timestamp: Timestamp              // Timestamp - Momento del check-in
}
```

#### **Colección: `notifications_sent`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users  
  sent_at: Timestamp,               // Timestamp - Fecha y hora del evento
  status: "push_sent",              // String - Estado del evento (enviado, falló, pendiente)
  type: "daily_reminder"            // String - alive_check_reminder | urgent_reminder | emergency | alive_check
}
```

#### **Colección: `notification_logs`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  sent_at: Timestamp,               // Timestamp - Fecha envío notificación push
  type: "alive_check_reminder",     // String - Tipo de evento registrado
  urgency: "routine",               // String - routine | warning | critical
  days_passed: 1,                  // Number - Días desde último registro actividad
  days_until_limit: 14,            // Number - Días restantes antes del protocolo emergencia
  fcm_response: "fcm_message_id",  // String - ID respuesta Firebase Cloud Messaging
  is_script_run: true              // Boolean - Si script programado se ejecutó correctamente
}
```

#### **Colección: `email_logs`**
```javascript
{
  user_id: "user_uid",              // String - Usuario que activó protocolo
  last_alive_date: Timestamp,       // Timestamp - Último registro actividad
  days_passed: 16,                 // Number - Días transcurridos sin actividad
  notification_days: 15,           // Number - Umbral configurado para protocolo
  type: "emergency_protocol",      // String - Tipo evento registrado
  subject: "Alerta AfterLife...",  // String - Asunto correo enviado
  recipient: "contacto@email.com", // String - Destinatario alerta
  sent_at: Timestamp,              // Timestamp - Fecha envío notificación
  status: "delivered",             // String - Estado envío (sent, failed, delivered)
  smtp_response: "250 OK",         // String - Respuesta servidor SMTP
  message_id: "msg_123456"         // String - ID único mensaje correo
}
```

### **🔑 Gestión de Credenciales**

#### **Colección: `credentials`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  service_name: "AWS Empresa",      // String - Nombre del servicio
  username: "admin@empresa.com",    // String - Usuario acceso servicio
  password_encrypted: "encrypted...", // String - Clave encriptada
  notes: "Cuenta admin principal",   // String - Descripción/notas adicionales
  tags: ["trabajo", "aws", "admin"], // Array - Etiquetas para filtros
  created_at: Timestamp,            // Timestamp - Fecha creación
  updated_at: Timestamp             // Timestamp - Última actualización
}
```

### **📄 Gestión de Documentos**

#### **Colección: `documents`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  filename: "Tutorial.pdf",         // String - Nombre archivo físico
  file_path: "https://firebasestorage...", // String - URL Firebase Storage
  category: "general",              // String - Categoría (default: general)
  notes: "Tutorial configuración servidor", // String - Descripción archivo
  tags: ["tutorial", "servidor", "empresa"], // Array - Etiquetas filtros/búsqueda
  created_at: Timestamp             // Timestamp - Fecha carga Firebase Storage
}
```

### **🖥️ Gestión de Servidores**

#### **Colección: `servers`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  name: "Servidor Producción",      // String - Nombre identificativo
  ip_domain: "192.168.1.100",      // String - IP o dominio servidor
  ssh_port: 22,                    // Number - Puerto SSH (default: 22)
  ssh_user: "ubuntu",              // String - Usuario SSH autorizado
  instructions: "ssh -i key.pem ubuntu@server", // String - Comandos/instrucciones conexión
  tags: ["produccion", "aws", "web"], // Array - Etiquetas clasificación
  created_at: Timestamp,            // Timestamp - Fecha registro
  updated_at: Timestamp             // Timestamp - Última actualización
}
```

### **💳 Gestión de Suscripciones**

#### **Colección: `subscriptions`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  service_name: "GitHub Pro Plan",  // String - Nombre servicio/proveedor
  subscription_date: Timestamp,     // Timestamp - Fecha inicio suscripción
  subscription_time: "mensual",     // String - mensual | anual | trimestral
  tags: ["desarrollo", "github", "herramientas"], // Array - Etiquetas clasificación
  created_at: Timestamp             // Timestamp - Fecha registro sistema
}
```

### **🏷️ Sistema de Etiquetas**

#### **Colección: `tags`**
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  tag: "empresa-x"                  // String - Etiqueta para clasificación/filtrado
}
```

### **📝 Documentación y Feeds (Futuro)**

#### **Colección: `docs`** *(Preparada para futuro desarrollo)*
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  title: "Sistema Backup",          // String - Título contenido/módulo
  text: "Documentación técnica...", // String - Contenido libre (markdown permitido)
  repository: "https://github.com/user/repo", // String - URL repositorio asociado
  tags: ["documentacion", "backup", "sistema"], // Array - Etiquetas clasificación
  created_at: Timestamp             // Timestamp - Fecha registro/carga contenido
}
```

#### **Colección: `feeds`** *(Preparada para futuro desarrollo)*
```javascript
{
  user_id: "user_uid",              // String - Referencia a users
  post: "Contenido publicación...", // String - Texto principal publicación
  category: "general",              // String - Categoría contenido
  date_post: Timestamp,             // Timestamp - Fecha oficial publicación
  tags: ["blog", "actualizacion", "sistema"], // Array - Etiquetas temáticas
  created_at: Timestamp             // Timestamp - Fecha creación registro
}
```

### **🔧 Configuración de Índices Firestore**

Para optimizar las consultas, crear estos índices compuestos:

```javascript
// Índices requeridos para consultas eficientes
notifications_sent: [user_id, sent_at]
alive_checks: [user_id, timestamp] 
email_logs: [user_id, sent_at]
notification_logs: [user_id, sent_at]
credentials: [user_id, tags]
documents: [user_id, category, tags]
servers: [user_id, tags]
subscriptions: [user_id, tags]
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

# ⚠️ IMPORTANTE: Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales (ver sección Variables de Entorno)
```

### **🔧 Configurar Variables de Entorno (Functions)**

#### **Crear archivo `.env` en `/functions`**
```bash
cd functions
cp .env.example .env
```

#### **Completar credenciales en `functions/.env`**
```env
# Gmail SMTP para emails de emergencia
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-password-de-aplicacion

# URL del proyecto AfterLife (para enlaces en emails)
AFTERLIFE_URL=https://tu-proyecto.firebaseapp.com

# Configuraciones del sistema
TIMEZONE=America/Bogota
DEFAULT_NOTIFICATION_DAYS=15
SENDER_NAME=AfterLife Monitor
```

#### **⚠️ Obtener Gmail App Password**
1. Ve a [Google Account Security](https://myaccount.google.com/security)
2. Activa **2-Factor Authentication** si no lo tienes
3. Genera **App Password** para "Mail"
4. Copia el password **CON ESPACIOS** (ej: `jwql syxa bweg tfgr`)
5. Úsalo en `GMAIL_APP_PASSWORD`

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

## ⚡ Configuración de Firestore

### **1. Crear Base de Datos**
```bash
# En Firebase Console:
# Firestore Database → Create database
# Seleccionar: Start in test mode (cambiaremos las reglas después)
# Ubicación: us-central (o la más cercana a tus usuarios)
```

### **2. Crear Todas las Colecciones Requeridas**

**⚠️ CRÍTICO**: Crear todas las siguientes colecciones en Firestore antes del primer uso:

#### **Colecciones del Sistema Core**:
- ✅ `users` - Información de usuarios
- ✅ `user_settings` - Configuraciones personales  
- ✅ `alive_checks` - Registros de check-in
- ✅ `notifications_sent` - Log notificaciones generales

#### **Colecciones de Gestión Digital**:
- ✅ `credentials` - Credenciales encriptadas de servicios
- ✅ `documents` - Archivos y documentos importantes
- ✅ `servers` - Configuración de servidores SSH
- ✅ `subscriptions` - Suscripciones y licencias
- ✅ `tags` - Sistema de etiquetas para clasificación

#### **Colecciones de Auditoría**:
- ✅ `email_logs` - Log detallado de emails de emergencia
- ✅ `notification_logs` - Log detallado de notificaciones push

#### **Colecciones Preparadas para Futuro**:
- ✅ `docs` - Sistema de documentación (no desarrollado aún)
- ✅ `feeds` - Sistema de feeds/posts (no desarrollado aún)

```bash
# Método rápido para crear colecciones vacías:
# 1. Firebase Console → Firestore → "Start collection"  
# 2. Nombre: [nombre_coleccion]
# 3. Document ID: temp
# 4. Field: init, Value: true
# 5. Save → Delete document "temp"
# 6. Repetir para todas las colecciones
```

### **3. Configurar Reglas de Seguridad**

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ===== CORE SYSTEM =====
    
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
    
    // ===== DIGITAL MANAGEMENT =====
    
    // Credentials - solo el propietario
    match /credentials/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // Documents - solo el propietario
    match /documents/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // Servers - solo el propietario
    match /servers/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // Subscriptions - solo el propietario
    match /subscriptions/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // Tags - solo el propietario
    match /tags/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // ===== AUDIT LOGS =====
    
    // Email logs - solo lectura para el propietario
    match /email_logs/{document} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      // Write solo para Functions
    }
    
    // Notification logs - solo lectura para el propietario  
    match /notification_logs/{document} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      // Write solo para Functions
    }
    
    // ===== FUTURE COLLECTIONS =====
    
    // Docs - solo el propietario
    match /docs/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // Feeds - solo el propietario
    match /feeds/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
  }
}
```

### **4. Configurar Índices Compuestos**

En Firebase Console → Firestore → Indexes, crear estos índices para optimizar consultas:

```javascript
// Índices de consulta múltiple requeridos
Collection: alive_checks
Fields: user_id (Ascending), timestamp (Descending)

Collection: notifications_sent  
Fields: user_id (Ascending), sent_at (Descending)

Collection: email_logs
Fields: user_id (Ascending), sent_at (Descending)

Collection: notification_logs
Fields: user_id (Ascending), sent_at (Descending)

Collection: credentials
Fields: user_id (Ascending), tags (Arrays)

Collection: documents  
Fields: user_id (Ascending), category (Ascending), tags (Arrays)

Collection: servers
Fields: user_id (Ascending), tags (Arrays)

Collection: subscriptions
Fields: user_id (Ascending), tags (Arrays)
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

## 💝 **Mi Regalo al Mundo**

Quizás para algunos pueda sonar dramático o innecesario, pero para mí tiene sentido absoluto. Es mi forma humilde de crear un "protocolo de emergencia digital" - como Tony Stark dejando mensajes póstumos, pero para proteger la información de las personas que confían en nosotros.

Como desarrollador freelance que ha visto de primera mano los riesgos de la concentración de conocimiento técnico, libero **AfterLife** como software libre para que cualquier programador del mundo pueda:

- Proteger a sus clientes y empleadores
- Dar tranquilidad a sus familias  
- Asegurar la continuidad de proyectos críticos
- Crear su propio "protocolo Stark" de emergencia digital

**No es paranoia, es responsabilidad profesional.**

### 🌍 **Para Desarrolladores del Mundo**

Si eres programador y usas este proyecto:
- ✅ **Úsalo libremente** para ti, tu familia o tu empresa
- ✅ **Modifícalo** según tus necesidades
- ✅ **Crea versiones comerciales** si quieres
- ✅ **Contribuye mejoras** para ayudar a otros
- ✅ **No necesitas dar crédito** (pero se aprecia)

**Mi única petición**: Usa este código para hacer el mundo un poco más seguro.

## ⚖️ Responsabilidad Compartida

### 🛡️ **AfterLife (El Proyecto)**

**AfterLife tiene como responsabilidad:**
- ✅ Proveer el **código fuente completo** y funcional
- ✅ Documentar el **mecanismo de protección** y administración
- ✅ Ofrecer las **herramientas necesarias** para que los usuarios puedan:
  - Guardar información de forma segura
  - Configurar protocolos de emergencia  
  - Gestionar contactos de confianza
  - Administrar credenciales y documentos

**AfterLife y su creador NO se hacen responsables de:**
- ❌ La **información específica** que cada usuario almacene
- ❌ Los **servidores o infraestructura** que el usuario final provea
- ❌ La **continuidad del servicio** en instalaciones específicas
- ❌ **Pérdidas de información** por mal uso o configuración incorrecta
- ❌ **Decisiones administrativas** sobre qué información proteger
- ❌ **Costos por servicios de Firebase** que el usuario pueda incurrir
- ❌ **Cargos adicionales** si el usuario supera los topes gratuitos de Firebase

> **📊 Importante sobre costos:** La filosofía de AfterLife es funcionar dentro de los **topes gratuitos de Firebase**. Si un usuario decide superar estos límites o migrar a **planes pagos**, es completamente **su responsabilidad financiera**.

### 👤 **Usuario Final (Tu Responsabilidad)**

**Como usuario de AfterLife, tú eres responsable de:**

#### **🔧 Mantenimiento Técnico**
- ✅ **Mantener el código actualizado** con las últimas versiones
- ✅ **Administrar tu propia infraestructura** (Firebase, servidores, etc.)
- ✅ **Configurar correctamente** las variables de entorno y credenciales
- ✅ **Realizar backups** de tu información crítica
- ✅ **Monitorear el funcionamiento** del sistema regularmente

#### **📊 Gestión de Información**
- ✅ **Mantener actualizada** toda la información almacenada
- ✅ **Clasificar correctamente** los documentos y credenciales
- ✅ **Parametrizar contraseñas** de documentos PDF en las credenciales correspondientes
- ✅ **Revisar periódicamente** qué información sigue siendo relevante
- ✅ **Actualizar contactos de emergencia** cuando sea necesario

#### **🎯 Administración Activa**
- ✅ **Realizar check-ins regulares** para mantener el protocolo activo
- ✅ **Educar a tus contactos** sobre cómo usar el sistema en emergencias
- ✅ **Documentar procesos específicos** de tu empresa o proyectos
- ✅ **Mantener credenciales actualizadas** (passwords, tokens, certificados)

### ⚠️ **Principio Fundamental**

> **AfterLife NO funciona como sistema automático independiente.**
> 
> Requiere un **usuario activo** que esté constantemente:
> - Administrando la información
> - Actualizando credenciales
> - Manteniendo el sistema
> - Verificando su funcionamiento

**Es una herramienta, no una solución mágica.**

Tu información estará tan segura y actualizada como el esfuerzo que pongas en mantenerla.

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

## 🙏 **A Mis Compañeros Desarrolladores**

Si estás leyendo esto, probablemente tú también manejas información crítica de clientes, proyectos o empresas. Tal vez tengas esa misma inquietud que me llevó a crear AfterLife.

**Este proyecto no es solo código - es tranquilidad.**

- Para el freelancer que maneja 20 proyectos simultáneamente
- Para el lead developer que es el único que conoce la infraestructura  
- Para el sysadmin que guarda todas las credenciales en su cabeza
- Para cualquier programador que se preocupa por la continuidad del trabajo que hace

### 💝 **Mi Petición Personal**

Si este proyecto te sirve, úsalo. Si le encuentras errores, repórtalos. Si le puedes agregar funcionalidades, contribuye. Pero sobre todo: **compártelo con otros desarrolladores que puedan necesitarlo.**

No sabemos cuándo podríamos necesitar un sistema como este, pero cuando ese momento llegue, es mejor estar preparados.

### 🌟 **Un Último Pensamiento**

Hace años, una simple conversación durante un café cambió mi perspectiva sobre la responsabilidad que tenemos como desarrolladores. Hoy, comparto esa reflexión contigo a través de código.

Si AfterLife puede evitar que aunque sea un cliente, una empresa o una familia pierda información importante, entonces valió la pena cada línea de código escrita.

---

### 💜 *"Protege lo que importa, para cuando ya no estés aquí"*

> **"Código con propósito, construye con amor, comparte con el mundo."**  
> – *Farez Prieto, creador de AfterLife*

**¿Te identificas con esta historia?** ⭐ Dale una estrella en GitHub y compártelo con otros desarrolladores. Juntos podemos hacer del mundo digital un lugar más seguro y responsable.