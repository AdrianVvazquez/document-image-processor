import { useState, useRef } from "react";
import { chatModel } from "../../firebase/config.js";
import Loader from "./Loader";
import "./Chat.css";

const INITIAL_MESSAGE = {
  id: 0,
  role: "model",
  parts: [
    {
      text: "Haz una pregunta sobre este documento y te responderé en seguida.",
    },
  ],
};

function Chat({ fileData }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);
  const fileIncluded = useRef(false);

  async function handleSendMessage(e) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed.length || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      parts: [{ text: trimmed }],
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        chatRef.current = chatModel.startChat({});
      }

      // Include the file only on the first message so the model has document context
      const parts = !fileIncluded.current
        ? [
            {
              inlineData: {
                data: fileData.base64,
                mimeType: fileData.mimeType,
              },
            },
            trimmed,
          ]
        : trimmed;

      fileIncluded.current = true;

      const { stream } = await chatRef.current.sendMessageStream(parts);

      const modelId = Date.now();
      setMessages((prev) => [
        ...prev,
        { id: modelId, role: "model", parts: [{ text: "" }] },
      ]);

      for await (const chunk of stream) {
        const text = chunk.text();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelId
              ? { ...msg, parts: [{ text: msg.parts[0].text + text }] }
              : msg,
          ),
        );
      }
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "model",
          parts: [
            { text: "No se pudo obtener una respuesta. Inténtalo de nuevo." },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="chat-card">
      <div className="chat-card__header">
        <p className="chat-card__eyebrow">Chat</p>
        <h3>Pregunta sobre el documento</h3>
      </div>

      <div className="chat-card__messages" role="log" aria-live="polite">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-card__bubble chat-card__bubble--${message.role}`}
          >
            <p>{message.parts[0].text}</p>
          </div>
        ))}
        {isLoading && messages.at(-1)?.role === "user" && (
          <div className="chat-card__bubble chat-card__bubble--model">
            <Loader />
          </div>
        )}
      </div>

      <form className="chat-card__composer" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Haz una pregunta..."
          aria-label="Pregunta sobre el documento"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Enviar
        </button>
      </form>
    </section>
  );
}

export default Chat;
