function FileUpload({ setFile }) {
  async function handleFileUpload(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const fileBuffer = await selectedFile.arrayBuffer();
    const file = new File([fileBuffer], selectedFile.name, {
      type: selectedFile.type,
    });

    setFile(file);
  }

  return (
    <section className="upload-card">
      <div className="upload-card__copy">
        <p className="upload-card__eyebrow">Paso 1</p>
        <h2>Sube un archivo</h2>
        <p className="upload-card__text">
          Compatible con PDF, JPG, JPEG y PNG. El contenido se procesará de forma automática.
        </p>
      </div>

      <label className="upload-card__button" htmlFor="document-upload">
        Elegir archivo
      </label>
      <input
        id="document-upload"
        className="upload-input"
        type="file"
        accept=".pdf, .jpg, .jpeg, .png"
        onChange={handleFileUpload}
      />

      <p className="upload-card__hint">Puedes revisar el resultado inmediatamente después de cargarlo.</p>
    </section>
  );
}

export default FileUpload;
