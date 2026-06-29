import Dashboard from "../../Dashboard";
import ChatBot from "./ChatBot";

function UaDashboard() {
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Dashboard />
      </div>
      <div style={{ width: 320, flexShrink: 0 }}>
        <ChatBot />
      </div>
    </div>
  );
}

export default UaDashboard;
