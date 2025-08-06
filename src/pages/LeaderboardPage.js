// import React, { useEffect, useState } from 'react';
// import Layout from '../components/Layout';
// import axios from '../utils/axiosInstance';
// import { TimeDiff } from './ResultsPage';
// import './LeaderboardPage.css'; //

// const LeaderboardPage = () => {
//   const [leaderboardData, setLeaderboardData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       try {
//         const response = await axios.get('/api/modelperformance/');
//         setLeaderboardData(response.data);
//       } catch (err) {
//         console.error('Failed to load leaderboard:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLeaderboard();
//   }, []);

//   return (
//     <Layout>
//       <div className="leaderboard-page">
//         <h2>Model Leaderboard</h2>
//         {loading ? (
//           <p className="loading-text">Loading...</p>
//         ) : (
//           <div className="leaderboard-table-wrapper">
//             <table className="leaderboard-table">
//               <thead>
//                 <tr>
//                   <th>Rank</th>
//                   <th>User</th>
//                   <th>Model Name</th>
//                   <th>Accuracy (%)</th>
//                   <th>Size</th>
//                   <th>Time Taken</th>
//                   <th>Submitted At</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {leaderboardData.map((entry, index) => (
//                   <tr key={index} className={index < 3 ? `top-rank rank-${index + 1}` : ''}>
//                     <td>{index + 1}</td>
//                     <td>{entry.workflow_run.run_by}</td>
//                     <td>{entry.workflow_step_run.workflow_step.model_file.name}</td>
//                     <td>{entry.accuracy}</td>
//                     <td>{(entry.workflow_step_run.workflow_step.model_file.size / (1024 * 1024)).toFixed(2)} MB</td>
//                     <td><TimeDiff from={entry.workflow_step_run.start_time} to={entry.workflow_step_run.end_time} /></td>
//                     <td>{new Date(entry.workflow_step_run.start_time).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default LeaderboardPage;

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from '../utils/axiosInstance';
import { TimeDiff } from './ResultsPage';
import './LeaderboardPage.css';
import ComparisonChart from '../components/ComparisonChart';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/modelperformance/');
        setLeaderboardData(response.data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

const [selectedModels, setSelectedModels] = useState([]);
const [compareData, setCompareData] = useState(null);

const toggleSelection = (model) => {
  setSelectedModels((prev) => {
    const exists = prev.find(m => m.id === model.id);

    if (exists) {
      return prev.filter(m => m.id !== model.id);
    }
    return [...prev, model];
  });
};

const handleCompare = () => {
  if (selectedModels.length >= 2) {
    setCompareData(selectedModels);
  }
};


  return (
    <Layout>
      <div className="leaderboard-page">
        <h2>Model Leaderboard</h2>
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
<div className="leaderboard-table-wrapper">
  <button
  className="compare-button"
  onClick={handleCompare}
  disabled={selectedModels.length < 2}
  >
    Compare
  </button>
  <table className="leaderboard-table">
    <thead>
      <tr>
        <th></th>
        <th>Rank</th>
        <th>User</th>
        <th>Model Name</th>
        <th>Model description</th>
        <th>Accuracy (%)</th>
        <th>Size</th>
        <th>Time Taken</th>
        <th>Submitted At</th>
      </tr>
    </thead>
    <tbody>
      {leaderboardData.map((entry, index) => {
        const sizeMB = (entry.workflow_step_run.workflow_step.model_file.size / (1024 * 1024)).toFixed(2);
        const model = {
          id: index,
          name: entry.workflow_step_run.workflow_step.model_file.name,
          description: entry.workflow_step_run.workflow_step.model_file.description,
          user: entry.workflow_run.run_by,
          accuracy: entry.accuracy,
          size: sizeMB,
          secondsTaken: (new Date(entry.workflow_step_run.end_time) - new Date(entry.workflow_step_run.start_time)) / 1000,
          time: <TimeDiff from={entry.workflow_step_run.start_time} to={entry.workflow_step_run.end_time} />
        };
        const isSelected = selectedModels.some(m => m.id === index);

        return (
          <tr key={index} className={index < 3 ? `top-rank rank-${index + 1}` : ''}>
            <td>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelection(model)}
              />
            </td>
            <td>{index + 1}</td>
            <td>{model.user}</td>
            <td>{model.name}</td>
            <td>{model.description}</td>
            <td>{model.accuracy}%</td>
            <td>{model.size} MB</td>
            <td>{model.time}</td>
            <td>{new Date(entry.workflow_step_run.start_time).toLocaleString()}</td>
          </tr>
        );
      })}
    </tbody>
  </table>

  {compareData && (
  <div className="comparison-section">
    <h3>Comparison</h3>
    <table className="comparison-table">
      <thead>
        <tr>
          <th>Metric</th>
          {compareData.map((m) => (
            <th key={m.id}>{m.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Accuracy</td>
          {compareData.map((m) => <td key={m.id}>{m.accuracy}%</td>)}
        </tr>
        <tr>
          <td>Size</td>
          {compareData.map((m) => <td key={m.id}>{m.size} MB</td>)}
        </tr>
        <tr>
          <td>Time Taken</td>
          {compareData.map((m) => <td key={m.id}>{m.time}</td>)}
        </tr>
      </tbody>
    </table>

    <div className="chart-section">
      <ComparisonChart
        title="Accuracy (%)"
        labels={compareData.map(m => m.name)}
        values={compareData.map(m => m.accuracy)}
      />
      <ComparisonChart
        title="Model Size (MB)"
        labels={compareData.map(m => m.name)}
        values={compareData.map(m => m.size)}
      />
      <ComparisonChart
        title="Time Taken (s)"
        labels={compareData.map(m => m.name)}
        values={compareData.map(m => m.secondsTaken || 0)}
      />
    </div>
  </div>
)}

</div>

        )}
      </div>
    </Layout>
  );
};

export default LeaderboardPage;