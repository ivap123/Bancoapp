# BancoDigital

Aplicación web para el banco digital BancoDigital.

## Requisitos previos

- Node.js (v14.0.0 o superior)
- npm (v6.0.0 o superior)

## Instalación

Para instalar todas las dependencias necesarias, ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm install
```

### Dependencias principales

Si experimentas problemas con la instalación, asegúrate de tener instaladas estas dependencias específicas:

```bash
# React y React DOM
npm install react@19.1.0 react-dom@19.1.0

# Enrutamiento
npm install react-router-dom@7.6.0

# UI y estilos
npm install bootstrap@5.3.6 react-bootstrap@2.10.10 reactstrap@9.2.3
npm install bootstrap-icons@1.11.1
npm install @popperjs/core

# Firebase
npm install firebase@11.7.3
```

## Configuración de Firebase

Para que la aplicación funcione correctamente, necesitas configurar las variables de entorno para Firebase. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
REACT_APP_API_KEY=tu_api_key
REACT_APP_AUTH_DOMAIN=tu_auth_domain
REACT_APP_PROJECT_ID=tu_project_id
REACT_APP_STORAGE_BUCKET=tu_storage_bucket
REACT_APP_MESSAGING_SENDER_ID=tu_messaging_sender_id
REACT_APP_APP_ID=tu_app_id
```

## Ejecución

Para iniciar la aplicación en modo desarrollo, ejecuta:

```bash
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Solución de problemas comunes

### Iconos no visibles
Si los iconos de Bootstrap no se muestran correctamente:
1. Asegúrate de tener instalado `bootstrap-icons`
2. Verifica que se está importando correctamente en `src/index.js`

### Menús desplegables no funcionan
Si los menús desplegables no funcionan:
1. Asegúrate de tener instalado `@popperjs/core`
2. Verifica que Bootstrap JS está importado en `src/index.js`

### Errores de importación de componentes
Si aparecen errores como "Cannot find module './components/LoginForm'":
1. Verifica que las importaciones en `App.js` incluyan la extensión `.jsx`
2. O renombra los archivos de componentes de `.jsx` a `.js`

## Linting y Formateo de Código

Este proyecto utiliza ESLint y Prettier para mantener un estilo de código consistente.

### Comandos disponibles

```bash
# Verificar problemas de linting
npm run lint

# Corregir automáticamente problemas de linting
npm run lint:fix

# Formatear código con Prettier
npm run format
```

### Configuración del editor

Para aprovechar al máximo ESLint y Prettier, configura tu editor para formatear al guardar:

#### VS Code
1. Instala las extensiones "ESLint" y "Prettier - Code formatter"
2. Agrega esto a tu `settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### Uso de la aplicación

1. Ingresar a la aplicación
2. Registrarse o ingresar con una cuenta existente (cuenta exitente: admin@admin.com  contraseña: 123456789)
3. En el dashboard, se puede ver el saldo actual y las transacciones recientes
4. En el menú desplegable, se puede acceder a las opciones de transferencia, pago de servicios, etc.
5. En el menú desplegable, también se puede cerrar sesión


