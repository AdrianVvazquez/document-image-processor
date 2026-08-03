import { useCallback, useEffect, useMemo, useState } from "react";
import { summaryModel } from "../../firebase/config.js";
import Loader from "./Loader";
import Chat from "./Chat";

const SUMMARY_PROMPT = `
  Eres un asistente especializado en resumir contenido visual y textual.

  REGLAS DE COMPORTAMIENTO
  Responde siempre en español con un tono claro y profesional. Mantén los resúmenes breves y directos. Prioriza la información más importante y relevante. No inventes información ni hagas suposiciones sin evidencia. Si el contenido es ambiguo o ilegible, indícalo claramente. Usa lenguaje simple y fácil de entender. Puedes usar emojis de forma moderada para mejorar la claridad. 

  OBJETIVO
  Analizar imágenes o documentos proporcionados por el usuario y generar un resumen claro, preciso y útil.

  INSTRUCCIONES PARA IMÁGENES
  Describe brevemente qué aparece en la imagen. Identifica los elementos clave como personas, objetos, texto visible y contexto. Si hay texto en la imagen, intégralo en el análisis y resúmelo. Enfócate en el propósito o mensaje principal.

  INSTRUCCIONES PARA DOCUMENTOS
  Identifica el tema principal del contenido. Resume la información relevante en pocas oraciones. Extrae datos importantes como fechas, nombres, cifras o conclusiones. Si el documento es extenso, prioriza lo más relevante.

  FORMATO DE RESPUESTA
  Usa solo texto en las respuestas, sin formato HTML ni Markdown. Evita usar viñetas o listas.
  - Resumen breve: (1 a 3 oraciones)
  - Puntos clave:
  - Punto 1
  - Punto 2
  - Punto 3

  CASOS ESPECIALES
  Si el contenido está incompleto:
  “El contenido proporcionado es insuficiente para generar un resumen completo.”
  Si no es claro:
  “No se puede interpretar claramente la imagen/documento.”

  CIERRE
  “Si necesitas un resumen más detallado, puedo ampliarlo.”
  “Puedo enfocarme en una parte específica si lo deseas.”
`;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Summary({ file }) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileData, setFileData] = useState(null);

  const previewUrl = useMemo(() => {
    if (!file || !file.type?.startsWith("image/")) {
      return "";
    }

    return URL.createObjectURL(file);
  }, [file]);

  const encodeFile = useCallback(async () => {
    try {
      const base64 = await fileToBase64(file);
      return { base64, mimeType: file.type };
    } catch (err) {
      console.error("Error encoding file:", err);
      throw err;
    }
  }, [file]);

  const getSummary = useCallback(async (encoded) => {
    try {
      const result = await summaryModel.generateContent([
        { inlineData: { data: encoded.base64, mimeType: encoded.mimeType } },
        SUMMARY_PROMPT,
      ]);

      setSummary(result.response.text());
      setError("");
    } catch (err) {
      console.error("Error summarizing file:", err);
      setSummary("");
      setError("No se pudo generar el resumen. Inténtalo de nuevo.");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function generateSummary() {
      setIsLoading(true);
      setError("");

      try {
        const encoded = await encodeFile();
        if (!isMounted || !encoded) return;

        setFileData(encoded);
        await getSummary(encoded);
      } catch {
        if (!isMounted) return;
        setSummary("");
        setError("No se pudo generar el resumen. Inténtalo de nuevo.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    generateSummary();

    return () => {
      isMounted = false;
    };
  }, [file, encodeFile, getSummary]);

  return (
    <section className="summary">
      <div className="summary__header">
        <div>
          <p className="summary__eyebrow">Resultado</p>
          <h2 className="summary__title">Resumen generado</h2>
        </div>
        {file?.name && <p className="summary__filename">{file.name}</p>}
      </div>

      {file?.type?.startsWith("image/") && previewUrl ? (
        <div className="summary__preview">
          <img
            src={previewUrl}
            alt="Vista previa"
            className="summary__preview-image"
          />
        </div>
      ) : file?.type === "application/pdf" ? (
        <div className="summary__preview summary__preview--pdf">
          <i className="summary__preview-icon">PDF</i>
          <p className="summary__preview-label">Documento PDF cargado</p>
        </div>
      ) : null}

      {isLoading ? (
        <Loader text="Generando resumen..." />
      ) : error ? (
        <p className="summary__error">{error}</p>
      ) : (
        <>
          <p className="summary__body">{summary}</p>
          {fileData && <Chat fileData={fileData} />}
        </>
      )}
    </section>
  );
}

export default Summary;
