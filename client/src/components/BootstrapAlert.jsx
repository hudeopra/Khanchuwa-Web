import { useEffect, useState } from "react";

export default function BootstrapAlert({
  type,
  message,
  duration = 5000,
  onClose,
}) {
  const [show, setShow] = useState(true);

  // Map type to Bootstrap classes
  const typeClass =
    {
      success: "alert-success",
      error: "alert-warning",
      warning: "alert-danger",
    }[type] || "alert-info";

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!show || !message) return null;

  return (
    <div
      className={`alert ${typeClass} alert-dismissible fade show`}
      role="alert"
    >
      {message}
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={() => {
          setShow(false);
          if (onClose) onClose();
        }}
      ></button>
    </div>
  );
}
