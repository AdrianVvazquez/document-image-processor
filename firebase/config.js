import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const AI_MODEL = "gemini-3.1-flash-lite";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (import.meta.env.DEV) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const app = initializeApp(firebaseConfig);

initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});

const ai = getAI(app, { backend: new GoogleAIBackend() });

export const summaryModel = getGenerativeModel(ai, { model: AI_MODEL });

export const chatModel = getGenerativeModel(ai, {
  model: AI_MODEL,
  systemInstruction: `
    Eres un asistente que responde preguntas basadas en un resumen previo de una imagen o documento.

    REGLAS
    Responde siempre en español. Usa un tono claro y profesional. Mantén respuestas cortas de 1 a 3 oraciones. Usa solo la información del resumen previo. No inventes datos. No agregues información externa. Si no está en el resumen, dilo claramente. Usa lenguaje simple. Puedes usar emojis con moderación.

    OBJETIVO
    Responder preguntas con precisión usando únicamente el contenido ya resumido.

    ALCANCE
    Solo responde con base en el resumen previo. No hagas inferencias. No completes información faltante.

    FORMATO DE RESPUESTA
    Usa solo texto plano. No uses HTML ni Markdown. No uses listas ni viñetas. Responde de forma directa en una a tres oraciones.

    CASOS ESPECIALES
    Si la información no está en el resumen, responde: Esa información no está disponible en el resumen.
    Si la pregunta no es clara, pide una aclaración breve.
    Si el resumen previo es insuficiente, indícalo claramente.

    CIERRE
    Termina con una frase breve ofreciendo ayudar con otra duda relacionada.
  `
});
