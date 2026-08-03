import { useCallback, useEffect, useMemo, useState } from "react";
import { summaryModel } from "../../firebase/config.js";
import Loader from "./Loader";
import Chat from "./Chat";

const SUMMARY_PROMPT =
  "Summarize this file in a few sentences. If the file is an image, describe its content. If the file is a document, provide a concise summary of its main points. Use clear and simple language. Avoid technical jargon. Reply in Spanish. Use only text in your responses, no HTML or Markdown formatting. Use emojis sparingly. Avoid using bullet points or lists. Focus on the main ideas and key points of the content.";

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
          <a href="https://www.flaticon.com/free-icons/pdf" title="pdf icons">
            <i className="summary__preview-icon">PDF</i>
          </a>
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
