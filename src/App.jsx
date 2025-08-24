import { useState } from "react";
import jobRoles from "./data/jobRoles.json"; // load JSON dynamically
import { Radar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from "chart.js";
import "./App.css";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

export default function App() {
  const roles = Object.keys(jobRoles);
  const levels = ["entry", "mid", "senior", "principal"];

  const [role1, setRole1] = useState(roles[0]);
  const [role2, setRole2] = useState(roles[1]);
  const [level1, setLevel1] = useState("entry");
  const [level2, setLevel2] = useState("entry");

  const skills = Object.keys(jobRoles[role1][level1]).sort();
  const [selectedSkills, setSelectedSkills] = useState(skills);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const selectAll = () => setSelectedSkills(skills);
  const clearAll = () => setSelectedSkills([]);

  // Job similarity based on selected skills and levels
  const computeSimilarity = () => {
    const s1 = jobRoles[role1][level1];
    const s2 = jobRoles[role2][level2];
    const diffs = selectedSkills.map((skill) => Math.abs(s1[skill] - s2[skill]));
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return Math.max(0, 100 - avgDiff).toFixed(2);
  };

  const radarData = {
    labels: selectedSkills,
    datasets: [
      {
        label: `${role1} (${level1})`,
        data: selectedSkills.map((s) => jobRoles[role1][level1][s]),
        backgroundColor: "rgba(144,238,144,0.4)", // light green
        borderColor: "rgba(0,100,0,0.9)", // dark green
        borderWidth: 2
      },
      {
        label: `${role2} (${level2})`,
        data: selectedSkills.map((s) => jobRoles[role2][level2][s]),
        backgroundColor: "rgba(255,182,193,0.4)", // light red
        borderColor: "rgba(178,34,34,0.9)", // dark red
        borderWidth: 2
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 10 }
      }
    }
  };

  // Trend chart (average skill progression)
  const trendLevels = levels;
  const trendData = {
    labels: trendLevels,
    datasets: [
      {
        label: role1,
        data: trendLevels.map(
          (lvl) =>
            selectedSkills.reduce(
              (sum, skill) => sum + jobRoles[role1][lvl][skill],
              0
            ) / selectedSkills.length
        ),
        borderColor: "rgba(0,100,0,0.9)",
        backgroundColor: "rgba(144,238,144,0.4)",
        fill: false
      },
      {
        label: role2,
        data: trendLevels.map(
          (lvl) =>
            selectedSkills.reduce(
              (sum, skill) => sum + jobRoles[role2][lvl][skill],
              0
            ) / selectedSkills.length
        ),
        borderColor: "rgba(178,34,34,0.9)",
        backgroundColor: "rgba(255,182,193,0.4)",
        fill: false
      }
    ]
  };

  return (
    <div className="app-container">
      <h1>Job Role Comparison</h1>

      <div className="select-container">
        <div>
          <label>Role 1:</label>
          <select value={role1} onChange={(e) => setRole1(e.target.value)}>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Level 1:</label>
          <select value={level1} onChange={(e) => setLevel1(e.target.value)}>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Role 2:</label>
          <select value={role2} onChange={(e) => setRole2(e.target.value)}>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Level 2:</label>
          <select value={level2} onChange={(e) => setLevel2(e.target.value)}>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button onClick={selectAll}>Select All</button>
        <button onClick={clearAll}>Clear All</button>
      </div>

      <div className="checkbox-container">
        {skills.map((skill) => (
          <label key={skill}>
            <input
              type="checkbox"
              checked={selectedSkills.includes(skill)}
              onChange={() => toggleSkill(skill)}
            />
            {skill}
          </label>
        ))}
      </div>

      <h2>Job Similarity Score: {computeSimilarity()}%</h2>

      <div className="chart-container">
        <Radar data={radarData} options={radarOptions} />
      </div>

      <h2>Trend Chart</h2>
      <div className="chart-container">
        <Line data={trendData} />
      </div>
    </div>
  );
}