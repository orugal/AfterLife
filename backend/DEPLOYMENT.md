# Pasos para Desplegar la Función de Verificación de Inactividad

Esta guía describe cómo desplegar la función `checkInactiveUsers` en Firebase. Esta función está diseñada para ejecutarse periódicamente y notificar a los contactos de emergencia si un usuario no ha realizado un "check-in" en un período de tiempo determinado.

## Prerrequisitos

Antes de empezar, asegúrate de tener lo siguiente:

1.  **Node.js instalado:** La función utiliza Node.js. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
2.  **Firebase CLI instalado:** Necesitarás la interfaz de línea de comandos de Firebase para desplegar la función. Si no la tienes, instálala globalmente con npm:
    ```bash
    npm install -g firebase-tools
    ```
3.  **Acceso al proyecto de Firebase:** Debes tener permisos de editor o propietario en el proyecto de Firebase donde quieres desplegar la función.

## Paso 1: Iniciar Sesión y Seleccionar el Proyecto

1.  Abre tu terminal y navega hasta el directorio `backend` de este proyecto.

2.  Inicia sesión en Firebase:
    ```bash
    firebase login
    ```

3.  Selecciona el proyecto de Firebase que deseas usar. Si no lo has hecho antes en este directorio, ejecuta:
    ```bash
    firebase use --add
    ```
    Y sigue las instrucciones para seleccionar tu proyecto.

## Paso 2: Configurar las Variables de Entorno

La función utiliza `nodemailer` para enviar correos electrónicos a través de una cuenta de Gmail. Para mantener la seguridad de tus credenciales, estas se deben configurar como variables de entorno en Firebase.

**Importante:** Para enviar correos desde una cuenta de Gmail, es recomendable usar una **"Contraseña de Aplicación"** en lugar de tu contraseña normal, especialmente si tienes activada la autenticación de dos factores (2FA). Puedes generar una desde la configuración de seguridad de tu cuenta de Google.

Ejecuta los siguientes comandos en tu terminal para configurar el correo y la contraseña:

```bash
firebase functions:config:set email.user="afterlifeorugal@gmail.com"
firebase functions:config:set email.password="AQUI_VA_TU_CONTRASEÑA_DE_APLICACION"
```

*   Reemplaza `"AQUI_VA_TU_CONTRASEÑA_DE_APLICACION"` con la contraseña de aplicación que generaste en tu cuenta de Google.

Puedes verificar que las variables se hayan guardado correctamente con:
```bash
firebase functions:config:get
```

## Paso 3: Desplegar la Función

Una vez configuradas las variables de entorno, puedes desplegar la función.

1.  Asegúrate de estar en el directorio `backend/functions`.
    ```bash
    cd functions
    ```

2.  Instala las dependencias si es la primera vez que lo haces:
    ```bash
    npm install
    ```

3.  Despliega únicamente la función `checkInactiveUsers`:
    ```bash
    firebase deploy --only functions:checkInactiveUsers
    ```

El proceso de despliegue puede tardar unos minutos. Al finalizar, la terminal te mostrará un mensaje de éxito.

## Paso 4: Verificar el Despliegue y la Programación

La función está programada para ejecutarse **cada 2 horas**. Puedes verificar que se haya desplegado y programado correctamente de la siguiente manera:

1.  **En la Consola de Firebase:**
    *   Ve a la [Consola de Firebase](https://console.firebase.google.com/).
    *   Selecciona tu proyecto.
    *   En el menú de la izquierda, ve a **Build > Functions**.
    *   Deberías ver `checkInactiveUsers` en la lista de funciones.

2.  **En Google Cloud Scheduler (para verificar la programación):**
    *   Las funciones programadas de Firebase utilizan Google Cloud Scheduler.
    *   En la [Consola de Google Cloud](https://console.cloud.google.com/), asegúrate de estar en el proyecto correcto.
    *   Usa la barra de búsqueda para encontrar **"Cloud Scheduler"**.
    *   Deberías ver un trabajo programado que corresponde a tu función. El nombre será algo como `firebase-schedule-checkInactiveUsers-xxxxxxxx`.
    *   En la columna "Frecuencia", debería indicar `0 */2 * * * (UTC)`, lo que significa que se ejecuta cada 2 horas.

¡Y eso es todo! La función ahora se ejecutará automáticamente y enviará las notificaciones según la configuración de cada usuario.
