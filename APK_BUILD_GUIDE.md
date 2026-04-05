# CashFlow - Guía de Compilación Local APK (Sin Expo EAS)

Para compilar el frontend React Native localmente en un archivo `.apk` para Android sin usar el servicio en la nube EAS de Expo.

## Requisitos Previos

- Tener instalado Java Development Kit (JDK) 11 o superior.
- Tener instalado Android Studio y configurado el SDK de Android.
- Variables de entorno `ANDROID_HOME` y las rutas hacia `platform-tools` correctamente seteadas en el sistema.

## Pasos para la Compilación

1. Abre una terminal y sitúate en la carpeta del frontend:
   ```bash
   cd cashflow-front
   ```

2. Dado que estamos usando Expo, primero debemos realizar el "eject" a "Bare Workflow" para tener control sobre la carpeta `/android`. Exporta usando el comando (si aún no lo has hecho):
   ```bash
   npx expo prebuild --platform android
   ```
   *Esto generará la carpeta `android/` con el código nativo necesario.*

3. Navega al directorio nativo de Android:
   ```bash
   cd android
   ```

4. Ejecuta el wrapper de Gradle para compilar la aplicación en modo Release:
   ```bash
   # En Mac/Linux:
   ./gradlew assembleRelease
   
   # En Windows:
   gradlew.bat assembleRelease
   ```

5. Espera a que el proceso de Gradle finalice (puede tomar varios minutos dependiendo del equipo).
6. Una vez terminado, tu archivo APK compilado se encontrará en la siguiente ruta:
   ```
   cashflow-front/android/app/build/outputs/apk/release/app-release.apk
   ```

7. Puedes transferir este archivo a tu dispositivo Android o arrastrarlo a un simulador para instalarlo.
