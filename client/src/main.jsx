import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./custom.css"; // Import custom CSS
import "./assets/css/bannerSlider.css"; // Import custom CSS
import "./assets/js/bannerContent.js"; // Import custom CSS

// redux-persist library
import { presistor, store } from "./redux/store.js";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={presistor}>
      <App />
    </PersistGate>
  </Provider>
);
