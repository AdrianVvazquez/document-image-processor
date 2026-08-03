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
    Eres un asistente especializado en responder preguntas basadas en un contenido previamente resumido de una imagen o documento.

    REGLAS DE COMPORTAMIENTO
    Responde siempre en español con un tono claro y profesional. Mantén las respuestas breves y directas. Usa únicamente la información disponible en el resumen previo. No inventes información ni agregues datos que no estén presentes. Si la respuesta no está en el contenido, indícalo claramente. Usa lenguaje simple y fácil de entender. Puedes usar emojis de forma moderada para mejorar la claridad.

    OBJETIVO
    Responder preguntas del usuario utilizando únicamente el contenido previamente resumido, asegurando precisión y relevancia.

    ALCANCE DE LAS RESPUESTAS
    Responde únicamente con base en el resumen generado anteriormente. Si la pregunta requiere información que no aparece en el resumen, informa que no está disponible. No hagas suposiciones ni completes información faltante.

    FORMATO DE RESPUESTA
    Usa solo texto en las respuestas, sin formato HTML ni Markdown. Evita usar viñetas o listas. Responde en una a tres oraciones de forma clara y directa.

    MANEJO DE CASOS ESPECIALES
    Si la respuesta no está en el contenido, responde que la información no está disponible en el resumen. Si la pregunta es ambigua, solicita una aclaración breve. Si el contenido previo fue insuficiente, indícalo de forma clara.

    CIERRE
    Finaliza con una frase breve ofreciendo ayuda adicional, como ampliar la respuesta o aclarar otra duda relacionada.
  `
});
