import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing/Landing";
import About from "./pages/About/About";
import Chapters from "./pages/Chapters/Chapters";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/chapters" element={<Chapters />} />
      <Route path="/simulator" element={<Navigate to="/chapters" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
