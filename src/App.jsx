import { useState } from "react";
import jobRoles from "./data/jobRoles.json"; // load JSON dynamically
import castleImg from "./img/castle.png";
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
  const levels = ["level_1", "level_2", "level_3", "level_4"];

  const [role1, setRole1] = useState(roles[0]);
  const [role2, setRole2] = useState("");
  const [level1, setLevel1] = useState("level_1");
  const [level2, setLevel2] = useState("level_1");

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
    if (!role2) return "N/A"; // no comparison if role2 is empty
    const s1 = jobRoles[role1][level1];
    const s2 = jobRoles[role2][level2];
    const diffs = selectedSkills.map((skill) => Math.abs(s1[skill] - s2[skill]));
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return Math.max(0, 100 - avgDiff).toFixed(2);
  };




  const radarDatasets = [
    {
      label: `${role1} (${level1})`,
      data: selectedSkills.map((s) => jobRoles[role1][level1][s]),
      backgroundColor: "rgba(144,238,144,0.4)", // light green
      borderColor: "rgba(0,100,0,0.9)", // dark green
      borderWidth: 2
    }
  ];

  // Only add role 2 dataset if role2 has a value
  if (role2) {
    radarDatasets.push({
      label: `${role2} (${level2})`,
      data: selectedSkills.map((s) => jobRoles[role2][level2][s]),
      backgroundColor: "rgba(3, 173, 252,0.4)", // light red
      borderColor: "rgba(0, 87, 128,0.9)", // dark red
      borderWidth: 2
    });
  }

  const radarData = {
    labels: selectedSkills,
    datasets: radarDatasets
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        ticks: {
          stepSize: 5, // small step, but only show labels for highlighted levels
          callback: function(value) {
            const levelLabels = {
              15: "Level 1",
              30: "Level 2",
              60: "Level 3",
              95: "Level 4"
            };
            return levelLabels[value] || ""; // show label only for these values
          },
          color: function(context) {
            // Color the label based on the level
            const value = context.tick.value;
            if (value === 15) return "#ffcccc"; // light red
            if (value === 30) return "#ff9999";
            if (value === 60) return "#ff6666";
            if (value === 95) return "#cc0000"; // dark red
            return "#333"; // other ticks (empty)
          }
        },
        grid: {
          color: function(context) {
            const value = context.tick.value;
            if (value === 15) return "#ffcccc";
            if (value === 30) return "#ff9999";
            if (value === 60) return "#ff6666";
            if (value === 95) return "#cc0000";
            return "#ccc";
          },
          lineWidth: function(context) {
            const value = context.tick.value;
            if (value === 15) return 0.5;
            if (value === 30) return 0.75;
            if (value === 60) return 1;
            if (value === 95) return 1.25; // thickest for highest level
            return 1;
          },
          circular: true
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: "#333"
        }
      }
    }
  };

  // Trend chart (average skill progression)
  const trendLevels = levels;
  const trendDatasets = [
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
    }
  ];

  // Only add Role 2 dataset if it exists
  if (role2) {
    trendDatasets.push({
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
    });
  }

  const trendData = {
    labels: trendLevels,
    datasets: trendDatasets
  };

  return (
    <div className="app-container">
      <div className="header">
        <img src={castleImg} alt="Castle" className="header-img" />
        <h1>The Guild Build</h1>
        <img src={castleImg} alt="Castle" className="header-img" />
      </div>
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
          <label>Level:</label>
          <select value={level1} onChange={(e) => setLevel1(e.target.value)}>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Role 2:</label>
          <select
            value={role2}
            onChange={(e) => setRole2(e.target.value)}
          >
            <option value="">-- None --</option> {/* allow no value */}
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Level:</label>
          <select
            value={level2}
            onChange={(e) => setLevel2(e.target.value)}
            disabled={!role2}  // disable if Role 2 has no value
          >
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
        <table>
          <tbody>
            {Array.from({ length: 2 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 4 }).map((_, colIndex) => {
                  const skillIndex = rowIndex * 4 + colIndex;
                  if (skillIndex >= skills.length) return <td key={colIndex}></td>;
                  const skill = skills[skillIndex];
                  return (
                    <td key={colIndex}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                        />
                        {skill}
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="chart-container">
        <Radar data={radarData} options={radarOptions} />
      </div>

      <h2>Job Similarity Score: {computeSimilarity()}%</h2>

      <h2>Trend Chart</h2>
      <div className="chart-container">
        <Line data={trendData} />
      </div>
    </div>
  );
}