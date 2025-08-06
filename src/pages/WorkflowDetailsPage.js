import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import Layout from '../components/Layout';
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
//import { ReactFlow, Background, Controls, MarkerType } from '@xyflow/react';
import './WorkflowDetailsPage.css';

const WorkflowDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [wheelFiles, setWheelFiles] = useState([]);
  const [modelFiles, setModelFiles] = useState([]);
  const [inputFiles, setInputFiles] = useState([]);

  useEffect(() => {
    axios.get(`/api/workflow/${id}/`)
      .then(res => {
        setWorkflow(res.data);
        const graphElements = buildGraphElements(res.data);
        setNodes(graphElements.nodes);
        setEdges(graphElements.edges);
      })
      .catch(err => console.error(err));

    axios.get('/files/list/wheel/')
      .then(res => setWheelFiles(res.data))
      .catch(err => console.error(err));

    axios.get('/files/list/model/')
      .then(res => setModelFiles(res.data))
      .catch(err => console.error(err));

    axios.get('/files/list/input/')
      .then(res => setInputFiles(res.data))
      .catch(err => console.error(err));
  }, [id]);

const buildGraphElements = (data) => {
  if (!data) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];

  const NODE_WIDTH = 200; // adjust spacing here
  const START_X = 50;
  const Y = 100;

  nodes.push({
    id: 'input',
    type: 'input',
    data: {
      label: `Input:\n${data.input?.name || data.input?.path || 'N/A'}`
    },
    position: { x: START_X, y: Y },
    sourcePosition: 'right'
  });

  let prevNodeId = 'input';

  data.steps.forEach((step, i) => {
    const nodeId = `step-${i + 1}`;
    // const nodeId = `step-${step.step_number}`;
    const wheel = step.wheel_file?.name || step.wheel_file?.description || step.wheel_file?.id || 'N/A';
    const model = step.model_file
      ? (step.model_file.name || step.model_file.description || step.model_file.id)
      : 'None';

    nodes.push({
      id: nodeId,
      type: 'default',
      data: {
        label: `Step ${i + 1}\nWheel: ${wheel}\nModel: ${model}`
      },
      position: {
        x: START_X + NODE_WIDTH * (i + 1),
        y: Y
      },
      targetPosition: 'left',
      sourcePosition: 'right'
    });

    edges.push({
      id: `e-${nodeId}`,
      source: prevNodeId,
      target: nodeId,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed }
    });

    prevNodeId = nodeId;
  });

  return { nodes, edges };
};




  const handleChange = (field, value) => {
    setWorkflow(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const payload = {
      ...workflow,
      input: workflow.input?.id || workflow.input,
    };
    axios.put(`/api/workflow/${id}/`, payload)
      .then(() => alert('Workflow updated!'))
      .catch(err => console.error(err));
  };

  const addStep = () => {
    const nextStepNumber = workflow.steps.length + 1;
    const newStep = { step_number: nextStepNumber, wheel_file: '', model_file: '' };
    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (index, field, value) => {
    const updatedSteps = [...workflow.steps];
    updatedSteps[index][field] = value;
    setWorkflow(prev => ({ ...prev, steps: updatedSteps }));
  };

  const deleteStep = (index) => {
    const updatedSteps = workflow.steps.filter((_, i) => i !== index);
    updatedSteps.forEach((s, i) => { s.step_number = i + 1; });
    setWorkflow(prev => ({ ...prev, steps: updatedSteps }));
  };

  if (!workflow) return <div className="loading-message">Loading…</div>;

  return (
    <Layout>
      <div className="workflow-detail-page">
        <h2>Workflow Detail</h2>

        <div className="workflow-section">
          <h3>Workflow Visual (Read-Only)</h3>
          <div style={{ height: '400px', background: '#fff', border: '1px solid #ccc', borderRadius: '8px', marginTop: '1rem' }}>
            <ReactFlow
            nodes={nodes}
            edges={edges}
            nodesDraggable={false}
            nodesConnectable={false}
            zoomOnScroll
            panOnScroll
            fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>

        <input
          className="workflow-input"
          value={workflow.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Name"
        />

        <input
          className="workflow-input"
          value={workflow.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Description"
        />

        <div className="workflow-section">
        <strong>Input File:</strong>
        <select
            className="workflow-input"
            value={workflow.input?.id || ''}
            onChange={(e) =>
            handleChange('input',
                inputFiles.find(f => f.id === parseInt(e.target.value)))
            }
        >
            <option value="">-- Select Input File --</option>
            {inputFiles.map(file => (
            <option key={file.id} value={file.id}>
                {file.file_name || file.path || file.id}
            </option>
            ))}
        </select>
        </div>

        <div className="workflow-section">
          <strong>Steps:</strong>
          {workflow.steps.map((step, index) => (
            <div className="workflow-step" key={index}>
              <span>Step {step.step_number}</span>

              <select
                className="step-input"
                value={step.wheel_file?.id || ''}
                onChange={(e) =>
                  updateStep(index, 'wheel_file',
                    wheelFiles.find(f => f.id === parseInt(e.target.value)))
                }
              >
                <option value="">-- Select Wheel File --</option>
                {wheelFiles.map(file => (
                  <option key={file.id} value={file.id}>
                    {file.file_name || file.description}
                  </option>
                ))}
              </select>

              <select
                className="step-input"
                value={step.model_file?.id || ''}
                onChange={(e) =>
                  updateStep(index, 'model_file',
                    modelFiles.find(f => f.id === parseInt(e.target.value)))
                }
              >
                <option value="">-- Select Model File --</option>
                {modelFiles.map(file => (
                  <option key={file.id} value={file.id}>
                    {file.file_name || file.description}
                  </option>
                ))}
              </select>

              <IconButton size="small" onClick={() => deleteStep(index)}>
                <Delete className="delete-icon-button"/>
              </IconButton>
            </div>
          ))}
          <button className="button-add-step" onClick={addStep}>+ Add Step</button>
        </div>

        <div className="workflow-actions">
          <button className="button-save" onClick={handleSave}>Update</button>
        </div>

      </div>
    </Layout>
  );
};

export default WorkflowDetailPage;