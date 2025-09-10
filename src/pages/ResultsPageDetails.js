// ResultsPageDetails.js (patched)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from '../utils/axiosInstance';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { TimeDiff } from './ResultsPage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from 'react-tooltip';
import './ResultsPageDetails.css';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';

function ResultsPageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [modelPerformance, setModelPerformance] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [newMetric, setNewMetric] = useState({
    model_performance: '',
    object_type: '',
    object_desc: '',
    count: '',
    detection_count: ''
  });

  const [selectedJson, setSelectedJson] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [jsonResults, setJsonResults] = useState([]);

  useEffect(() => {
    axios.get(`/api/workflow/run/${id}/`).then(res => {
      setResult(res.data);
      const { nodes, edges, jsonData } = buildGraphElements(res.data);
      setNodes(nodes);
      setEdges(edges);
      setJsonResults(jsonData);
    });
    axios.get(`/api/modelperformance/${id}`).then(res => setModelPerformance(res.data));
  }, [id]);

  const buildGraphElements = (data) => {
    const nodes = [];
    const edges = [];
    const jsonData = [];

    const NODE_WIDTH = 200;
    const Y = 150;

    nodes.push({
      id: 'input',
      type: 'input',
      position: { x: 50, y: Y },
      sourcePosition: 'right',
      data: { label: `Input: ${data.workflow.input?.name || 'N/A'}` }
    });

    let prevId = 'input';

    const steps = data.workflow?.steps || [];
    steps.forEach((step, i) => {
      const nodeId = `step-${i + 1}`;
      const wheel = step.wheel_file?.name || 'Wheel';
      const model = step.model_file?.name || 'None';

      nodes.push({
        id: nodeId,
        position: { x: 50 + NODE_WIDTH * (i + 1), y: Y },
        sourcePosition: 'right',
        targetPosition: 'left',
        data: { label: `${wheel}\nModel: ${model}` }
      });

      edges.push({
        id: `e-${prevId}-${nodeId}`,
        source: prevId,
        target: nodeId
      });

      jsonData.push({
        id: nodeId,
        name: wheel,
        input: data.workflow.input?.path,
        output: step.result_file || 'N/A',
        model
      });

      prevId = nodeId;
    });

    return { nodes, edges, jsonData };
  };

  const handleDownload = async (relativePath) => {
  try {
    const response = await axios.post(`/files/download/output_path/`, { relative_path: relativePath }, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    const fileName = relativePath.split('/').pop() || 'output.zip';
    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
};

  if (!result) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <ToastContainer position="top-center" />
      <Tooltip id="help-tooltip" place="top" effect="solid" />
      <div className="results-details-page">
        <button className="primary-button" onClick={() => navigate('/results')}>← Back</button>
        <h2>{result.name}</h2>

        <section className="results-section">
          <h3>Run Flowchart</h3>
          <div style={{ height: 300 }}>
            {nodes.length > 0 && (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={(event, node) => {
                  const data = jsonResults.find(j => j.id === node.id);
                  console.log(data)
                  if (data) {
                    setSelectedJson({ id: node.id, ...data });
                  } else {
                    setSelectedJson(null);
                  }
                }}
                fitView
              >
                <MiniMap />
                <Controls />
                <Background />
              </ReactFlow>
            )}
          </div>
        </section>

        {selectedJson && (
          <section style={{ marginTop: '1rem' }}>
            <h3>JSON Result for: {selectedJson.id}</h3>
            <pre style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '6px',
              overflowX: 'auto',
            }}>
              {JSON.stringify(selectedJson, null, 2)}
            </pre>
          </section>
        )}

        <section className="results-section overview">
          <h3>Overview</h3>
          <p><strong>Description:</strong> {result.workflow.description}</p>
          <p><strong>Status:</strong> <span className={`result-badge ${result.error ? 'error' : 'success'}`}>{result.error ? 'Error' : 'Success'}</span></p>
          <p><strong>Run By:</strong> {result.run_by || 'N/A'}</p>
          <p><strong>Start:</strong> {new Date(result.start_time).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(result.end_time).toLocaleString()}</p>
          <p><strong>Error Message:</strong> {result.error_message || 'None'}</p>
        </section>

        <section className="results-section files">
          <h3>Files</h3>
          <p><strong>Input:</strong> {result.workflow.input.name}</p>
          <p><strong>Output:</strong> {result.output || 'None'} {result.output && <button onClick={() => handleDownload(result.output)}> Download </button>}</p>
        </section>

        {/* {Array.isArray(result.video_paths) && result.video_paths.length > 0 && (
          <section className="results-section video-preview">
            <h3>Inference Videos</h3>
            {result.video_paths.map((videoPath, index) => {
              // Extract path safely
              const relativePath = videoPath.includes('/media/')
                ? videoPath.split('/media/')[1]
                : videoPath;

              return (
                <video
                  key={index}
                  width="100%"
                  height="auto"
                  controls
                  style={{ borderRadius: '8px', marginTop: '1rem' }}
                >
                  <source src={`/media/${relativePath}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              );
            })}
          </section>
        )} */}

        {Array.isArray(result.video_paths) && result.video_paths.length > 0 && (
          <section className="results-section video-preview">
            <h3>Inference Videos</h3>
            {result.video_paths.map((videoPath, index) => {
              // Extract relative path for display + API fallback
              const relativePath = videoPath.includes('/media/')
                ? videoPath.split('/media/')[1]
                : videoPath;

              const fallbackApiUrl = `/files/download/serve-video/?path=${encodeURIComponent(relativePath)}`;

              return (
                <video
                  key={index}
                  width="100%"
                  height="auto"
                  controls
                  style={{ borderRadius: '8px', marginTop: '1rem' }}
                >
                  {/* <source src={`/media/${relativePath}`} type="video/mp4" /> */}
                  <source src={fallbackApiUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              );
            })}
          </section>
        )}


      <section className="results-section metrics">
        {modelPerformance.length > 0 && (
          <div className="chart-container">
            <h4>Performance Summary</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={modelPerformance.map((m) => {
                  const step = m.workflow_step_run?.workflow_step?.step_number;
                  const size = m.workflow_step_run?.workflow_step?.model_file?.size || 0;
                  const modelSizeMB = (size / (1024 * 1024)).toFixed(2);
                  const accuracy = m.accuracy || 0;
                  const duration = (new Date(m.workflow_step_run?.end_time) - new Date(m.workflow_step_run?.start_time)) / 1000;
                  return { step: `Step ${step}`, accuracy, modelSize: parseFloat(modelSizeMB), duration };
                })}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#82ca9d" name="Accuracy (%)" />
                <Bar dataKey="modelSize" fill="#8884d8" name="Model Size (MB)" />
                <Bar dataKey="duration" fill="#ffc658" name="Duration (s)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        </section>

        <section className="results-section performance">
          <h3>Model Performance (Sorted by Accuracy → Size → Time)</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Model</th>
                <th>Accuracy</th>
                <th>Model Size</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {[...modelPerformance]
                .sort((a, b) => {
                  const accDiff = (b.accuracy || 0) - (a.accuracy || 0);
                  if (accDiff !== 0) return accDiff;

                  const sizeA = a.workflow_step?.model_file?.size || 0;
                  const sizeB = b.workflow_step?.model_file?.size || 0;
                  if (sizeB !== sizeA) return sizeB - sizeA;

                  const timeA = new Date(a.workflow_step_run?.end_time) - new Date(a.workflow_step_run?.start_time);
                  const timeB = new Date(b.workflow_step_run?.end_time) - new Date(b.workflow_step_run?.start_time);
                  return timeA - timeB;
                })
                .map((m, i) => (
                  <tr key={i}>
                    <td>{m.workflow_step_run?.workflow_step?.step_number}</td>
                    <td>{m.workflow_step_run?.workflow_step?.model_file?.name || 'N/A'}</td>
                    <td>{`${m.accuracy}%` || 0}</td>
                    <td>{(m.workflow_step_run?.workflow_step?.model_file?.size / (1024 * 1024)).toFixed(2)} MB</td>
                    <td><TimeDiff from={m.workflow_step_run?.start_time} to={m.workflow_step_run?.end_time} fallback="In progress" /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
}

export default ResultsPageDetails;

