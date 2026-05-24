import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

if (window.location.pathname === "/atendimentos") {
  import("./pages/Atendimentos").then(({ default: Atendimentos }) => {
    root.render(<Atendimentos />);
  });
} else {
  import("./App.tsx").then(({ default: App }) => {
    root.render(<App />);
  });
}
