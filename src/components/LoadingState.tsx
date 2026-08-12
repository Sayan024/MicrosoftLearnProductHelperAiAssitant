import { useEffect, useState } from "react";

const STAGES = ["Searching Microsoft Learn…", "Reading relevant documentation…", "Preparing your answer…"];

const STAGE_DURATIONS_MS = [1400, 1800];

export default function LoadingState() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) return;
    const timer = setTimeout(() => setStageIndex((i) => i + 1), STAGE_DURATIONS_MS[stageIndex]);
    return () => clearTimeout(timer);
  }, [stageIndex]);

  return (
    <div className="loading-row" role="status" aria-live="polite">
      <span className="loading-dot" aria-hidden="true" />
      <span>{STAGES[stageIndex]}</span>
    </div>
  );
}
