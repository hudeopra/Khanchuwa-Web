import { createContext, useState, useContext, useEffect } from "react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]); // Support multiple alerts
  const [progresses, setProgresses] = useState({}); // Track progress for each alert

  const showAlert = (type, message, duration = 3000) => {
    const id = Date.now(); // Unique ID for each alert
    setAlerts((prev) => [...prev, { id, type, message }]);
    setProgresses((prev) => ({ ...prev, [id]: 100 }));

    const interval = setInterval(() => {
      setProgresses((prev) => {
        const newProgress = prev[id] - 100 / (duration / 100);
        if (newProgress <= 0) {
          clearInterval(interval);
          dismissAlert(id);
        }
        return { ...prev, [id]: newProgress > 0 ? newProgress : 0 };
      });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      dismissAlert(id);
    }, duration);
  };

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    setProgresses((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const adjustAlertSpeeds = () => {
    setProgresses((prev) => {
      const updatedProgresses = { ...prev };
      const alertCount = alerts.length;
      const speedFactor = 0.5 * alertCount;

      Object.keys(updatedProgresses).forEach((id) => {
        updatedProgresses[id] -= speedFactor;
        if (updatedProgresses[id] <= 0) {
          dismissAlert(Number(id));
        }
      });

      return updatedProgresses;
    });
  };

  useEffect(() => {
    if (alerts.length > 0) {
      adjustAlertSpeeds();
    }
  }, [alerts]);

  return (
    <AlertContext.Provider value={{ showAlert, dismissAlert }}>
      {children}
      <div
        style={{ position: "fixed", top: "100px", right: "30px", zIndex: 1050 }}
      >
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`kh-alert alert-${alert.type} d-flex justify-content-between align-items-center`}
            style={{ marginBottom: "10px", minWidth: "300px" }}
          >
            <span>{alert.message}</span>
            <button
              type="button"
              className="kh-btn kh-btn__x btn-close"
              aria-label="Close"
              onClick={() => dismissAlert(alert.id)}
            >
              x
            </button>
            <div
              className="progress"
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                width: "100%",
                height: "5px",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${progresses[alert.id]}%`,
                  transition: "width 0.1s linear",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
