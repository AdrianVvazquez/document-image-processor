// https://ai.google.dev/gemini-api/docs/document-processing
// Gemini admite archivos PDF de hasta 50 MB o 1,000 páginas. Cada página del documento equivale a 258 tokens.
import "./App.css";
import FileUpload from "./components/FileUpload";
import Header from "./components/Header";
import Instructions from "./components/Instructions";
import Summary from "./components/Summary";
import { useState } from "react";

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <section className="workspace-panel">
          {uploadedFile ? (
            <Summary file={uploadedFile} />
          ) : (
            <FileUpload setFile={setUploadedFile} />
          )}
        </section>

        <aside className="guidance-panel">
          <Instructions />
        </aside>
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 Fortaleza Digital. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
