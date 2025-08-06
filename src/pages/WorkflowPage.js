import './WorkflowPage.css';
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';

const WorkflowListPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');
  const navigate = useNavigate();

  // pagination
  const [page, setPage] = useState(1);        // 1-based
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // fetch list (supports server or client fallback)
  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          page_size: pageSize,
          q: searchTerm || undefined,
          sort: sortKey,
          order: sortOrder,
          created_by: filterCreatedBy || undefined,
        };
        const res = await axios.get('/api/workflow/', { params });

        if (res?.data && typeof res.data === 'object' && 'results' in res.data && 'count' in res.data) {
          // server-side mode: assume API already applied filters/sort
          setWorkflows(res.data.results);
          setTotalCount(res.data.count);
        } else if (Array.isArray(res.data)) {
          // client-side mode: apply your original filters/sort locally, then slice
          const all = res.data;

          const filteredAndSorted = all
            .filter(wf =>
              wf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              wf.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(wf =>
              filterCreatedBy ? wf.created_by === filterCreatedBy : true
            )
            .sort((a, b) => {
              // Pinned workflows come first
              if (a.pinned && !b.pinned) return -1;
              if (!a.pinned && b.pinned) return 1;

              // If both are pinned or both unpinned, fall back to sort logic
              if (sortKey === 'created_at') {
                return sortOrder === 'asc'
                  ? new Date(a.created_at) - new Date(b.created_at)
                  : new Date(b.created_at) - new Date(a.created_at);
              } else {
                return sortOrder === 'asc'
                  ? (a[sortKey] || '').localeCompare(b[sortKey] || '')
                  : (b[sortKey] || '').localeCompare(a[sortKey] || '');
              }
            });

          setTotalCount(filteredAndSorted.length);
          const start = (page - 1) * pageSize;
          setWorkflows(filteredAndSorted.slice(start, start + pageSize));
        } else {
          setWorkflows([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error(err);
        setWorkflows([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [page, pageSize, searchTerm, sortKey, sortOrder, filterCreatedBy]);

  // reset page when filter inputs change heavily (optional: already in deps)
  // useEffect(() => { setPage(1); }, [searchTerm, sortKey, sortOrder, filterCreatedBy]);

  const deleteWorkflow = (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    axios.delete(`/api/workflow/${id}/`)
      .then(() => {
        setWorkflows(prev => prev.filter(wf => wf.id !== id));
        setTotalCount(c => Math.max(0, c - 1));
      })
      .catch(err => console.error(err));
  };

  const executeWorkflow = (id) => {
    axios.post(`/api/workflow/execute/${id}/`)
      .then(() => alert('Workflow executed!'))
      .catch(err => console.error(err));
  };

  const pinWorkflow = (id) => {
    axios.put(`/api/pinworkflow/${id}/`)
      .catch(err => console.error(err));
  };

  const viewWorkflow = (id) => {
    navigate(`/workflows/${id}`);
  };

  // keep this for the creator filter dropdown (works in both modes)
  const creatorOptions = useMemo(() => [...new Set(workflows.map(wf => wf.created_by))], [workflows]);

  return (
    <Layout>
      <div className="workflow-list-page">
        <h2>Workflows</h2>

        {/* Toolbar */}
        <div className="workflow-controls">
          <div className="control-group">
            <input
              type="text"
              className="search-input"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>

          <div className="control-group">
            <select
              value={filterCreatedBy}
              onChange={(e) => { setFilterCreatedBy(e.target.value); setPage(1); }}
              className="filter-select"
            >
              <option value="">Filter by creator</option>
              {creatorOptions.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <select
              value={sortKey}
              onChange={(e) => { setSortKey(e.target.value); setPage(1); }}
              className="sort-select"
            >
              <option value="created_at">Sort by Created Date</option>
              <option value="name">Sort by Name</option>
            </select>
            <button
              className="sort-toggle"
              style={{background: "#0096c7"}}
              onClick={() => { setSortOrder(s => (s === 'asc' ? 'desc' : 'asc')); setPage(1); }}
            >
              {sortOrder === 'asc' ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-message">Loading…</div>
        ) : totalCount === 0 ? (
          <div className="empty-message">No workflows found.</div>
        ) : (
          <div className="workflow-table-wrapper">
            <table className="workflow-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Input</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map(wf => (
                  <tr key={wf.id} className={wf.pinned ? 'pinned-workflow' : ''}>
                    <td>{wf.name}</td>
                    <td>{wf.description}</td>
                    <td>{wf.input?.path || 'N/A'}</td>
                    <td>{wf.created_by}</td>
                    <td>{new Date(wf.created_at).toLocaleString()}</td>
                    <td>
                      <button className="button-view" onClick={() => viewWorkflow(wf.id)}>View</button>
                      <button className="button-delete" onClick={() => deleteWorkflow(wf.id)}>Delete</button>
                      <button className="button-execute" onClick={() => executeWorkflow(wf.id)}>Execute</button>
                      <button className="button-pin" onClick={() => pinWorkflow(wf.id, !wf.pinned)}>{wf.pinned ? 'Unpin' : 'Pin'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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
};

export default WorkflowListPage;