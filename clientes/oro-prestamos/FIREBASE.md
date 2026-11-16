# Conectar la nube entre los 2 socios (Firebase)

La app funciona sin nube: los datos se guardan solo en el celular. La nube hace que lo que registra un socio
le aparezca al otro en segundos. Todo se **cifra en el celular** antes de subir (AES-256 con la "clave del negocio"),
así que ni NEXO PC ni Google pueden leer los datos.

Costo: $0. El plan gratis de Firebase (Spark) alcanza de sobra para 2 usuarios.

## 1. Crear el proyecto (una sola vez, ~10 minutos, desde un PC)
1. Entra a https://console.firebase.google.com con la cuenta de NEXO PC → **Agregar proyecto** → nombre, ej. `oro-capital`.
   Google Analytics: no.
2. **Compilación → Authentication → Comenzar → Correo electrónico/contraseña → Habilitar.**
3. **Compilación → Firestore Database → Crear base de datos →** ubicación `southamerica-east1` (São Paulo) → modo producción.
4. En Firestore → **Reglas**, pega esto (cambia los 2 correos por los de los socios) y **Publicar**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /negocios/{negocio}/items/{item} {
      allow read, write: if request.auth != null
        && request.auth.token.email in ['socio1@gmail.com', 'socio2@gmail.com'];
    }
  }
}
```

5. **Configuración del proyecto (⚙) → Tus apps → Web (</>)** → registra la app → copia el bloque `firebaseConfig`
   (apiKey, authDomain, projectId, appId…).
6. En **Authentication → Settings → Dominios autorizados**, agrega el dominio donde está publicada la app
   (por ahora `nexopc.github.io`).

## 2. En cada iPhone (el día de la instalación)
App → ⚙ → **Nube entre socios**:
- Pegar la configuración de Firebase.
- **Código del negocio**: el mismo en los dos (ej. `oro-capital`).
- Correo del socio + contraseña (la primera vez crea la cuenta; la contraseña no se guarda en el celular).
- **Clave del negocio**: la misma en los dos, mínimo 6 caracteres. **Escríbanla en papel y guárdenla:**
  sin ella nadie puede recuperar los datos.

## Notas
- Los datos que ya estaban en el celular se suben solos al conectar.
- Lo personal (PIN, Face ID, quién es cada socio) nunca se sube.
- Si sale "No se pudo leer un dato", la clave del negocio no es la misma en los dos celulares.
