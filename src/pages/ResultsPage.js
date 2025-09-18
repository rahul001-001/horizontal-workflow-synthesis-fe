import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from '../utils/axiosInstance';
import moment from 'moment';
import { UserContext } from '../context/userContext';
import './ResultsPage.css';

import Pagination from '../components/Pagination';

export const TimeDiff = ({ from, to, fallback = 'N/A' }) => {
  if (!from || !to) {
    return <span>{fallback}</span>;
  }

  const duration = moment.duration(moment(to).diff(moment(from)));
  const hours = String(duration.hours()).padStart(2, '0');
  const minutes = String(duration.minutes()).padStart(2, '0');
  const seconds = String(duration.seconds()).padStart(2, '0');

  return <span>{`${hours}h ${minutes}m ${seconds}s`}</span>;
};

function ResultsPage() {
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);          // 1-based
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const userInfo = useContext(UserContext);

  // Fetch results with server-side pagination if supported; else slice client-side.
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/workflow/run', {
          params: { page, page_size: pageSize },
        });

        if (res?.data && typeof res.data === 'object' && 'results' in res.data && 'count' in res.data) {
          // Server-side pagination mode
          setResults(res.data.results);
          setTotalCount(res.data.count);
        } else if (Array.isArray(res.data)) {
          // Client-side pagination fallback
          const all = res.data;
          setTotalCount(all.length);
          const start = (page - 1) * pageSize;
          setResults(all.slice(start, start + pageSize));
        } else {
          setResults([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error('Failed to load results:', error);
        setResults([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [page, pageSize]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    try {
      await axios.delete(`/api/workflow/run/${id}/`);
      setResults((prev) => prev.filter(r => r.id !== id));
      setTotalCount((c) => Math.max(0, c - 1));
      // if we removed the last item on the page, go back a page (client-friendly)
      setResults((prev) => {
        if (prev.length === 0 && page > 1) setPage(page - 1);
        return prev;
      });
    } catch (error) {
      console.error('Failed to delete run:', error);
    }
  };

  return (
    <Layout>
      <div className="results-page">
        <h1>Results</h1>

        {loading ? (
          <p className="empty-message">Loading…</p>
        ) : totalCount === 0 ? (
          <p className="empty-message">No results found.</p>
        ) : (
          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Input File</th>
                  <th>Status</th>
                  <th>Executed at</th>
                  <th>Executed by</th>
                  <th>Time to run</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => (
                  <tr key={result.id}>
                    <td>{result.workflow?.name}</td>
                    <td>{result.workflow?.description}</td>
                    <td>{result.workflow?.input?.name || 'N/A'}</td>
                    <td>
                      <span
                        className={`status ${
                          result.error ? 'error' : result.end_time ? 'success' : 'in-progress'
                        }`}
                      >
                        {result.error ? 'Error' : result.end_time ? 'Success' : 'In Progress'}
                      </span>
                    </td>
                    <td>{result.workflow?.created_at}</td>
                    <td>{result.workflow?.created_by}</td>
                    <td>
                      <TimeDiff from={result.start_time} to={result.end_time} fallback="In progress" />
                    </td>
                    <td>
                      <Link to={`/results/${result.id}`} className="view-link">View</Link>
                      {['admin', 'scientist', 'engineer'].includes(userInfo?.role) && (
                        <button
                          style={{
                            backgroundColor: '#b11226',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            marginLeft: '0.5rem',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleDelete(result.id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination bar */}
            <div style={{ marginTop: '1rem' }}>
              <Pagination
                totalItems={totalCount}
                pageSize={pageSize}
                currentPage={page}
                onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                showPageSizeSelect
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ResultsPage;
