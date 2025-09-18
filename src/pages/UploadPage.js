import React, { useState, useEffect, useContext, useMemo } from 'react';
import Layout from '../components/Layout';
import FileUploader from '../components/FileUploader';
import axios from '../utils/axiosInstance';
import { UserContext } from '../context/userContext';
import './UploadPage.css';
import Pagination from '../components/Pagination';

const TABS = ['wheel', 'input', 'model', 'class', 'groundtruth'];

function UploadPage() {
  const [activeTab, setActiveTab] = useState('wheel');
  const [files, setFiles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState('file');
  const userInfo = useContext(UserContext);

  // pagination
  const [page, setPage] = useState(1);      // 1-based
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/files/list/${activeTab}`, {
          params: { page, page_size: pageSize }
        });

        if (res?.data && typeof res.data === 'object' && 'results' in res.data && 'count' in res.data) {
          // server-side pagination
          setFiles(res.data.results);
          setTotalCount(res.data.count);
        } else if (Array.isArray(res.data)) {
          // client-side pagination
          const all = res.data;
          setTotalCount(all.length);
          const start = (page - 1) * pageSize;
          setFiles(all.slice(start, start + pageSize));
        } else {
          setFiles([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch files:', error);
        setFiles([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [activeTab, page, pageSize]);

  // reset page when tab changes
  useEffect(() => { setPage(1); }, [activeTab]);

  const handleDelete = async (id, input_type) => {
    try {
      if (activeTab === 'input' && input_type === 'folder') {
        await axios.delete(`/files/delete/folder/${id}/`);
      } else {
        await axios.delete(`/files/delete/file/${id}/${activeTab}`);
      }
      setFiles(prev => prev.filter(f => f.id !== id));
      setTotalCount(c => Math.max(0, c - 1));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('access');
      const response = await axios.get(`/files/download/${activeTab}/${fileId}/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const filteredFiles = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return files.filter(file => {
      const target = (file.file || file.folder_path || file.path || '').toLowerCase();
      return target.includes(lower);
    });
  }, [files, searchTerm]);

  return (
    <Layout>
      <div className="upload-page">
        <h1>Upload Files</h1>

        <div className="upload-controls">
          <div className="upload-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'input' && (
          <div className="upload-mode-toggle" style={{ marginBottom: '1rem' }}>
            <label>
              <input
                type="radio"
                name="uploadMode"
                value="file"
                checked={uploadMode === 'file'}
                onChange={(e) => setUploadMode(e.target.value)}
              />
              File
            </label>
            <label style={{ marginLeft: '1rem' }}>
              <input
                type="radio"
                name="uploadMode"
                value="folder"
                checked={uploadMode === 'folder'}
                onChange={(e) => setUploadMode(e.target.value)}
              />
              Folder
            </label>
          </div>
        )}

        <FileUploader
          type={activeTab}
          mode={activeTab === 'input' ? uploadMode : 'file'}
          onUploadSuccess={() =>
            axios.get(`/files/list/${activeTab}`, { params: { page, page_size: pageSize } })
              .then(res => {
                if (res?.data && 'results' in res.data && 'count' in res.data) {
                  setFiles(res.data.results);
                  setTotalCount(res.data.count);
                } else if (Array.isArray(res.data)) {
                  setTotalCount(res.data.length);
                  const start = (page - 1) * pageSize;
                  setFiles(res.data.slice(start, start + pageSize));
                }
              })
          }
        />

        {loading ? (
          <p className="loading-text">Loading files...</p>
        ) : (
          <div className="file-table-wrapper">
            <table className="file-table">
              <thead>
                <tr>
                  <th>File path</th>
                  <th>Description</th>
                  <th>Size</th>
                  <th>Uploaded At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.length > 0 ? (
                  filteredFiles.map(file => (
                    <tr key={file.id}>
                      <td>{file.file || file.path || <em>—</em>}</td>
                      <td>{file.description}</td>
                      <td>{file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : <em>—</em>}</td>
                      <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                      <td>
                        {['admin', 'scientist', 'engineer'].includes(userInfo?.role) && (
                          <>
                            {file.file && (
                              <button
                                className="action-button"
                                onClick={() => handleDownload(file.id, file.file_name)}
                              >
                                Download
                              </button>
                            )}
                            <button
                              className="action-button"
                              onClick={() => handleDelete(file.id, file.input_type || null)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6">No files or folders found.</td></tr>
                )}
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
}

export default UploadPage;
