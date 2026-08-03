function Instructions() {
  return (
    <section className="instructions">
      <div className="instructions__header">
        <p className="instructions__eyebrow">Guía práctica</p>
        <h2>Cómo obtener mejores resultados</h2>
      </div>

      <div className="instructions__grid">
        <article className="instructions__card">
          <h3>Recomendaciones para resultados óptimos</h3>
          <ul className="instructions__list">
            <li>
              Rota las páginas a la orientación correcta antes de subirlas.
            </li>
            <li>Evita las páginas borrosas o con poca claridad.</li>
            <li>
              Si usas una sola página, coloca el texto después de la página.
            </li>
          </ul>
        </article>

        <article className="instructions__card">
          <h3>Qué puede hacer Gemini</h3>
          <ul className="instructions__list">
            <li>
              Analizar e interpretar contenido, incluidos texto, imágenes,
              diagramas, gráficos y tablas, incluso en documentos largos de
              hasta 1,000 páginas.
            </li>
            <li>Extraer información en formatos de salida estructurados.</li>
            <li>
              Resumir y responder preguntas basadas en los elementos visuales y
              textuales de un documento.
            </li>
            <li>
              Transcribir contenido de documentos y preservar diseños y formatos
              para su uso en aplicaciones posteriores.
            </li>
            <li>
              Procesar documentos que no sean PDF, aunque en ese caso perderán
              parte del contexto visual (gráficos o formatos).
            </li>
          </ul>
        </article>

        <article className="instructions__card">
          <h3>Preguntas de ejemplo</h3>
          <ul className="instructions__list">
            <li>Explica esta parte específica del documento.</li>
            <li>Amplía el resumen que generaste.</li>
            <li>Resume este contenido en pocas palabras.</li>
            <li>Aclara esta parte que no entiendo del documento.</li>
            <li>Identifica las fechas, nombres y datos relevantes.</li>
            <li>
              Responde las siguientes dudas sobre el contenido: ¿Cuál es el tema
              principal?
            </li>
            <li>
              Responde las siguientes dudas sobre el contenido: ¿Qué información
              es más importante?
            </li>
            <li>
              Responde las siguientes dudas sobre el contenido: ¿Qué
              conclusiones se pueden obtener?
            </li>
            <li>
              Indica si el contenido es claro o presenta problemas de
              interpretación.
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export default Instructions;
