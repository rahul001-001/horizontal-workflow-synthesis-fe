import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import axios from '../utils/axiosInstance';
import { TimeDiff } from './ResultsPage';
import './LeaderboardPage.css';
import ComparisonChart from '../components/ComparisonChart';
import Pagination from '../components/Pagination';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);       // 1-based
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/modelperformance/', { params: { page, page_size: pageSize } });
        if (res?.data && typeof res.data === 'object' && 'results' in res.data && 'count' in res.data) {
          // server-side pagination
          setLeaderboardData(res.data.results);
          setTotalCount(res.data.count);
        } else if (Array.isArray(res.data)) {
          // client-side fallback
          const all = res.data;
          setTotalCount(all.length);
          const start = (page - 1) * pageSize;
          setLeaderboardData(all.slice(start, start + pageSize));
        } else {
          setLeaderboardData([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setLeaderboardData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [page, pageSize]);

  const [selectedModels, setSelectedModels] = useState([]);
  const [compareData, setCompareData] = useState(null);

  const toggleSelection = (model) => {
    setSelectedModels((prev) => {
      const exists = prev.find(m => m.id === model.id);
      return exists ? prev.filter(m => m.id !== model.id) : [...prev, model];
    });
  };

  const handleCompare = () => {
    if (selectedModels.length >= 2) setCompareData(selectedModels);
  };

  // precompute table rows (stable ids in current page)
  const rows = useMemo(() => {
    return leaderboardData.map((entry, index) => {
      const sizeMB = (entry.workflow_step_run.workflow_step.model_file.size / (1024 * 1024)).toFixed(2);
      const seconds = (new Date(entry.workflow_step_run.end_time) - new Date(entry.workflow_step_run.start_time)) / 1000;
      const model = {
        id: `${page}:${index}`, // stable within page
        name: entry.workflow_step_run.workflow_step.model_file.name,
        description: entry.workflow_step_run.workflow_step.model_file.description,
        user: entry.workflow_run.run_by,
        accuracy: entry.accuracy,
        size: sizeMB,
        secondsTaken: seconds,
        time: <TimeDiff from={entry.workflow_step_run.start_time} to={entry.workflow_step_run.end_time} />
      };
      return { model, entry, index };
    });
  }, [leaderboardData, page]);

  return (
    <Layout>
      <div className="leaderboard-page">
        <h2>Model Leaderboard</h2>

        {/* Page size control */}
        <div style={{ margin: '0 0 0.75rem 0' }}>
          <label className="text-sm" style={{ color: '#374151' }}>
            Items per page:&nbsp;
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
              className="border rounded-md px-2 py-1"
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>

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
                {rows.map(({ model, entry, index }) => {
                  const isSelected = selectedModels.some(m => m.id === model.id);
                  return (
                    <tr key={model.id} className={index < 3 ? `top-rank rank-${index + 1}` : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(model)}
                        />
                      </td>
                      <td>{(page - 1) * pageSize + index + 1}</td>
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
