import { useEffect } from "react";

export default function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label={title}>
      <button className="modalBackdrop" onClick={onClose} aria-label="Fechar modal" />
      <div className="modalCard">
        <div className="modalHead">
          <h3 className="modalTitle">{title}</h3>
          <button className="iconBtn" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}
