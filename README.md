# CALENDARIO GIOCHI BlackOut404

Web App SPA (Single Page Application) pronta per essere ospitata gratuitamente su **Firebase Hosting** (piano Spark Gratuito) con **Firebase Firestore** per la sincronizzazione istantanea dei voti e delle partite.

## 🚀 Pubblicazione Gratuita su Firebase Hosting (Piano Spark)

Non richiede Cloud Run, container né fatturazione:

1. **Compila l'applicazione statica:**
   ```bash
   npm run build
   ```
   I file statici pronti per la distribuzione verranno generati nella cartella `dist/`.

2. **Accedi a Firebase CLI:**
   ```bash
   npx firebase-tools login
   ```

3. **Deploy Gratuito (Hosting + Firestore Rules):**
   ```bash
   npx firebase-tools deploy --only hosting,firestore
   ```

## ⚙️ Configurazione Inclusa
- `firebase.json`: Configurato per servire `dist/` come SPA con rewrite su `/index.html` e regole Firestore.
- `firestore.rules`: Permette a tutti i membri di vedere e votare le partite in tempo reale.
- `firebase-applet-config.json`: Contiene le chiavi del progetto Firebase create per l'applet.
