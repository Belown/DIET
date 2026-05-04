import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing/Landing";
import About from "./pages/About/About";
import Simulator from "./pages/Simulator/Simulator";
import BackgroundPhase from "./pages/phases/BackgroundPhase/BackgroundPhase";
import DatasetPhase from "./pages/phases/DatasetPhase/DatasetPhase";
import ClassifierPhase from "./pages/phases/ClassifierPhase/ClassifierPhase";
import EvaluationPhase from "./pages/phases/EvaluationPhase/EvaluationPhase";
import DebriefPhase from "./pages/phases/DebriefPhase/DebriefPhase";
import SamplingBiasPhase from "./pages/phases/SamplingBiasPhase/SamplingBiasPhase";
import { SimulatorProvider } from "./context/SimulatorContext";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/simulator" element={<SimulatorProvider><Simulator /></SimulatorProvider>}>
        <Route index element={<Navigate to="background" replace />} />
        <Route path="background" element={<BackgroundPhase />} />
        <Route path="dataset" element={<DatasetPhase />} />
        <Route path="classifier" element={<ClassifierPhase />} />
        <Route path="evaluation" element={<EvaluationPhase />} />
        <Route path="debrief" element={<DebriefPhase />} />
        <Route path="sampling-bias" element={<SamplingBiasPhase />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
