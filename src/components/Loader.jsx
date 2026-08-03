import "./Loader.css";

function Loader({ text = "Cargando..." }) {
  return (
    <div className="loader__wrapper" role="status" aria-live="polite">
      <div className="loader" aria-hidden="true">
        <div className="loader__ring" />
        <div className="loader__core" />
      </div>
      <p className="loader__text">{text}</p>
    </div>
  );
}

export default Loader;
