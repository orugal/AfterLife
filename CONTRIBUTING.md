# Guía de Contribución 🤝

¡Gracias por tu interés en contribuir a AfterLife! Este proyecto está diseñado para ayudar a personas de todo el mundo a proteger su información digital importante.

## 🌟 Formas de Contribuir

### 1. Reportar Bugs 🐛
- Usa [GitHub Issues](https://github.com/tu-usuario/afterlife/issues)
- Incluye logs de error completos
- Describe pasos para reproducir el problema
- Especifica navegador, OS y versión

### 2. Solicitar Funcionalidades ✨
- Abre un Issue con el template "Feature Request"
- Explica el caso de uso
- Describe la solución propuesta
- Considera alternativas

### 3. Mejorar Documentación 📚
- Corregir errores de tipeo
- Actualizar guías de instalación
- Traducir a otros idiomas
- Agregar ejemplos de código

### 4. Desarrollo de Código 💻
- Revisar Issues marcados como "good first issue"
- Implementar nuevas funcionalidades
- Mejorar rendimiento
- Agregar tests

## 🚀 Proceso de Desarrollo

### 1. Setup Local
```bash
# Fork y clonar
git clone https://github.com/tu-usuario/afterlife.git
cd afterlife

# Instalar dependencias
cd frontend && npm install
cd ../functions && npm install

# Configurar Firebase (ver README.md)
firebase init
```

### 2. Crear Rama
```bash
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

### 3. Desarrollo
- Seguir las convenciones de código existentes
- Escribir código limpio y comentado
- Probar cambios localmente
- Usar commits semánticos

### 4. Testing
```bash
# Frontend
cd frontend && npm run dev

# Functions
cd functions && npm run serve
firebase functions:shell

# Testing completo
firebase emulators:start
```

### 5. Pull Request
- Llenar el template de PR
- Describir cambios realizados
- Agregar screenshots si es UI
- Referenciar Issues relacionados

## 📝 Convenciones

### Commits Semánticos
```
feat: agregar notificaciones SMS
fix: corregir error de token FCM  
docs: actualizar guía de instalación
style: mejorar formato de código
refactor: optimizar función de check-in
test: agregar tests para auth
chore: actualizar dependencias
```

### Naming Conventions
```javascript
// Variables y funciones: camelCase
const userName = 'John Doe';
const getUserData = () => {};

// Componentes React: PascalCase
const UserProfile = () => {};

// Constantes: UPPER_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Archivos: kebab-case
user-profile.jsx
auth-context.js
```

### Estructura de Commits
```
tipo(ámbito): descripción corta

Descripción más detallada del cambio si es necesario.
Explicar por qué se hizo el cambio, no solo qué cambió.

Fixes #123
```

## 🧪 Testing Guidelines

### Frontend Testing
- Probar en Chrome, Firefox, Safari
- Verificar responsive design
- Probar autenticación OAuth
- Validar notificaciones push

### Backend Testing
- Probar functions localmente
- Verificar logs de error
- Validar envío de emails
- Probar cron schedules

### Testing Checklist
- [ ] Código funciona localmente
- [ ] No hay errores en console
- [ ] Tests pasan (si existen)
- [ ] Documentación actualizada
- [ ] Variables sensibles no expuestas

## 🎯 Áreas de Contribución

### 🔥 High Priority
- Soporte para más proveedores OAuth
- App móvil nativa (React Native)  
- Sistema de backup automático
- Notificaciones SMS/WhatsApp
- Tests unitarios y de integración

### 🚀 Medium Priority
- Interfaz de administración
- Soporte multi-idioma (i18n)
- API pública documentada
- Métricas y analytics
- Optimizaciones de rendimiento

### 💡 Nice to Have
- Tema dark/light automático
- Integración con wearables
- Backup en múltiples clouds
- Sistema de plugins
- Marketplace de extensiones

## 🌍 Internacionalización

### Agregar Nuevo Idioma
1. Crear archivo `frontend/src/locales/es.json`
2. Traducir todas las keys
3. Actualizar configuración i18n
4. Probar en diferentes browsers
5. Documentar en README

### Convenciones de Traducción
- Mantener consistencia de tono
- Adaptar culturalmente (no solo traducir)
- Usar placeholders para variables: `{{userName}}`
- Considerar longitud de texto en UI

## 🔒 Seguridad

### Reportar Vulnerabilidades
- **NO** abrir Issue público
- Enviar email a: security@afterlife.app
- Incluir descripción detallada
- Proporcionar PoC si es posible

### Consideraciones de Seguridad
- No hardcodear credenciales
- Validar datos del frontend
- Usar HTTPS siempre
- Implementar rate limiting
- Logging sin datos sensibles

## 📋 Templates

### Issue Template
```markdown
## 🐛 Bug Report / ✨ Feature Request

### Descripción
[Describe claramente el problema o funcionalidad]

### Pasos para Reproducir (Bugs)
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

### Comportamiento Esperado
[Qué debería pasar]

### Comportamiento Actual  
[Qué pasa realmente]

### Información Adicional
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Versión: [v1.0.0]
- Logs: [Incluir si es posible]
```

### PR Template
```markdown
## 📝 Descripción
[Describe los cambios realizados]

### 🔗 Issues Relacionados
Fixes #[número_de_issue]

### 🧪 Testing
- [ ] Probado localmente
- [ ] Functions funcionan
- [ ] UI responsive
- [ ] No errores en console

### 📸 Screenshots
[Si aplica, agregar capturas]

### ✅ Checklist
- [ ] Código sigue convenciones
- [ ] Documentación actualizada
- [ ] No variables sensibles expuestas
- [ ] Commits semánticos
```

## 🏆 Reconocimiento

### Contributors Hall of Fame
Los contribuidores destacados serán:
- Mencionados en README.md
- Agregados al archivo CONTRIBUTORS.md
- Invitados al Discord VIP
- Reconocidos en releases

### Tipos de Contribución
- 💻 Código
- 📖 Documentación  
- 🐛 Bug Reports
- 💡 Ideas
- 🌍 Traducción
- 🎨 Diseño
- 📢 Promoción

## ❓ ¿Necesitas Ayuda?

### Comunidad
- **Discord**: [Enlace al servidor]
- **Telegram**: [Enlace al grupo]  
- **GitHub Discussions**: Para preguntas generales

### Mentorship
- Nuevos contribuidores son bienvenidos
- Asignamos mentores para issues complejos
- Sessions de pair programming disponibles

---

## 💜 Código de Conducta

### Nuestro Compromiso
Nos comprometemos a hacer de la participación en nuestro proyecto una experiencia libre de acoso para todos, independientemente de edad, tamaño corporal, discapacidad, etnia, identidad de género, nivel de experiencia, nacionalidad, apariencia personal, raza, religión o orientación sexual.

### Comportamiento Esperado
- Usar lenguaje acogedor e inclusivo
- Respetar diferentes puntos de vista
- Aceptar críticas constructivas
- Enfocarse en lo mejor para la comunidad
- Mostrar empatía hacia otros miembros

### Comportamiento Inaceptable
- Uso de lenguaje o imágenes sexualizadas
- Trolling, comentarios insultantes/despectivos
- Acoso público o privado
- Publicar información privada sin permiso
- Conducta inapropiada en contexto profesional

### Aplicación
Instancias de comportamiento abusivo pueden ser reportadas a [conduct@afterlife.app]. Todas las quejas serán revisadas e investigadas resultando en una respuesta apropiada.

---

**¡Gracias por hacer de AfterLife un proyecto mejor para todos! 🚀**