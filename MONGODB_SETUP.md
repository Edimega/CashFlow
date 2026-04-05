# CashFlow - Guía de Configuración Mongo DB Atlas API

Para el funcionamiento completo del backend, se requiere usar la conexión directa con MongoDB Atlas.

## Pasos

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) y crea una cuenta o inicia sesión.
2. Crea un Cluster gratuito (M0 Sandbox).
3. En la sección "Database Access", crea un usuario de base de datos con contraseña.
4. En "Network Access", permite el acceso desde tu IP actual o desde cualquier lugar (`0.0.0.0/0`) para desarrollo.
5. Ve a "Databases", haz clic en "Connect" y elige "Connect your application".
6. Copia el string de conexión (URI) proporcionado. Se verá algo así: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/CashFlowApp?retryWrites=true&w=majority`
7. Ve a la carpeta `cashflow-backend` y abre el archivo `.env`.
8. Reemplaza el valor de `MONGO_URI` con el string copiado, asegurándote de sustituir `<username>` y `<password>` por las credenciales del usuario creado en el paso 3.

## Data API (Opcional si usas Fetch/Axios desde cliente sin servidor Node.js)
El backend actual usa `mongoose` tradicional sobre la URI, pero al estar en Atlas ya está preparado para integrarse de las dos vías. Si prefieres usar exclusivamente Data API (Restful), puedes habilitarlo en Atlas en la opción **"Data API"** y generar tu `URLEndpoint` y `API_KEY`.
