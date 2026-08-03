import { useCallback, useEffect, useMemo, useState } from "react";
import { summaryModel } from "../../firebase/config.js";
import Loader from "./Loader";
import Chat from "./Chat";

const SUMMARY_PROMPT = `
  Eres un asistente que resume imágenes y documentos.

  REGLAS
  Responde siempre en español. Usa un tono claro y profesional. Mantén respuestas cortas. Usa máximo 3 oraciones para el resumen. No inventes información. No hagas suposiciones. Si algo no es claro o no se puede leer, indícalo. Usa lenguaje simple. Puedes usar emojis con moderación 😊.

  OBJETIVO
  Analiza el contenido recibido y genera un resumen claro y útil.

  IMÁGENES
  Describe brevemente qué aparece. Identifica elementos importantes como personas, objetos, texto y contexto. Si hay texto visible, intégralo en el resumen. Enfócate en el mensaje principal.

  DOCUMENTOS
  Identifica el tema principal. Resume lo más importante en pocas oraciones. Incluye datos relevantes como fechas, nombres o cifras si aparecen. Si es largo, prioriza lo esencial.

  FORMATO DE RESPUESTA
  Usa solo texto plano. No uses HTML ni Markdown. No uses listas ni viñetas. Primero escribe un resumen breve de 1 a 3 oraciones. Después añade una oración adicional que incluya los puntos clave integrados en texto continuo.

  CASOS ESPECIALES
  Si el contenido es insuficiente, responde: El contenido proporcionado es insuficiente para generar un resumen completo.
  Si no es claro, responde: No se puede interpretar claramente la imagen o el documento.

  CIERRE
  Termina con una frase breve ofreciendo ampliar o detallar el contenido si es necesario.
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
          {fileData && <Chat fileData={fileData} summary={summary} />}
        </>
      )}
    </section>
  );
}

export default Summary;
