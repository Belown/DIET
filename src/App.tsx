import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import About from "./pages/About";
import SimulatorLayout from "./components/SimulatorLayout/SimulatorLayout";
import DatasetPhase from "./pages/phases/DatasetPhase";
import ClassifierPhase from "./pages/phases/ClassifierPhase";
import EvaluationPhase from "./pages/phases/EvaluationPhase";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/simulator" element={<SimulatorLayout />}>
        <Route index element={<Navigate to="dataset" replace />} />
        <Route path="dataset" element={<DatasetPhase />} />
        <Route path="classifier" element={<ClassifierPhase />} />
        <Route path="evaluation" element={<EvaluationPhase />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
