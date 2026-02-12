# 🔥 Firebase Functions - AfterLife

## 📧 Email Backup para Notificaciones Diarias

La función `checkAliveStatus` ahora incluye un **sistema de respaldo por email** que complementa las notificaciones push:

### ¿Cómo funciona?

1. **Notificación Push**: Se intenta enviar la notificación push al usuario (como siempre)
2. **Email de Respaldo**: Inmediatamente después, se envía un email al usuario con el mismo recordatorio
3. **Registro**: Se guarda un log en `notifications_sent` con estado `email_backup_sent`

### Ventajas

- ✅ **Mayor fiabilidad**: El usuario recibirá el recordatorio incluso si la notificación push falla
- ✅ **Múltiples canales**: Email + Push = más probabilidad de llegar al usuario
- ✅ **Información clara**: El email indica si es un respaldo por fallo de push
- ✅ **Escalabilidad**: No requiere cambios en la app móvil

### Tipos de Email

**Email Normal** (días < límite):
- Asunto: `💜 Recordatorio AfterLife: Tu Check-in Diario`
- Mensaje aleatorio motivacional
- Color: Azul (#6366f1)

**Email Urgente** (días >= límite):
- Asunto: `⚠️ URGENTE: AfterLife Check-in Requerido`
- Mensaje de alerta que contactos fueron notificados
- Color: Rojo (#dc3545)
- Incluye contador de días sin check-in

## 🔧 Configuración de Variables de Entorno

### 1. **Configurar Credenciales**

```bash
# Navegar a la carpeta functions
cd functions

# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales reales
nano .env  # o tu editor preferido
```

### 2. **Obtener Gmail App Password**

1. Ve a [Google Account Security](https://myaccount.google.com/security)
2. Activa **2-Factor Authentication** si no lo tienes
3. En "App passwords", genera una nueva para "Mail"
4. Copia el password **CON ESPACIOS** (ej: `jwql syxa bweg tfgr`)
5. Úsalo en `GMAIL_APP_PASSWORD`

### 3. **Variables Requeridas**

```env
# Gmail SMTP para emails de emergencia
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-password-con-espacios

# URL del proyecto AfterLife (para enlaces en emails)
AFTERLIFE_URL=https://tu-proyecto.firebaseapp.com

# Configuraciones del sistema
TIMEZONE=America/Bogota
DEFAULT_NOTIFICATION_DAYS=15
SENDER_NAME=AfterLife Monitor
```

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar localmente con emulators
npm run serve

# Desplegar a producción
npm run deploy

# Ver logs en tiempo real
npm run logs
```

## ⚠️ Notas de Seguridad

- **NUNCA subas** el archivo `.env` al repositorio
- **Siempre usa** App Passwords, no tu password principal de Gmail
- **Verifica** que `.env` esté en `.gitignore`

## 🔍 Troubleshooting

### Error "Variables de entorno no configuradas"
```bash
# Verifica que existe el archivo .env
ls -la .env

# Verifica el contenido (sin mostrar passwords)
grep "GMAIL_USER" .env
```

### Error de autenticación Gmail
- Verifica que 2FA esté activado en tu cuenta Google
- Regenera el App Password si es necesario
- Asegúrate de copiar el password CON espacios

### Error de timezone
- Usa formato válido de timezone (ej: `America/Bogota`)
- Ver [lista completa](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)