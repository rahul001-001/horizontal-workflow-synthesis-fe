// src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from '../utils/axiosInstance';
import { FormControl, InputLabel, MenuItem, Select, Button, TextField, IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import './DashboardPage.css';

function DashboardPage() {
  const [inputFiles, setInputFiles] = useState([]);
  const [modelFiles, setModelFiles] = useState([]);
  const [wheelFiles, setWheelFiles] = useState([]);
  const [classFiles, setClassFiles] = useState([]);
  const [groundTruthFiles, setGroundTruthFiles] = useState([]);
  const [inputTypes, setinputTypes] = useState([]);

  const [selectedInput, setSelectedInput] = useState(null);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');

  const [steps, setSteps] = useState([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inputRes = await axios.get('/files/list/input/');
        const modelRes = await axios.get('/files/list/model/');
        const wheelRes = await axios.get('/files/list/wheel/');
        const classRes = await axios.get('/files/list/class/');
        const groundTruthRes = await axios.get('/files/list/groundtruth/');
        const inputTypes = [
          { id: 'video', name: 'Video' },
          { id: 'images', name: 'Images' }
        ];
        setInputFiles(inputRes.data);
        setModelFiles(modelRes.data);
        setWheelFiles(wheelRes.data);
        setClassFiles(classRes.data);
        setGroundTruthFiles(groundTruthRes.data);
        setinputTypes(inputTypes);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const newNodes = [];
    const newEdges = [];

    if (selectedInput) {
      newNodes.push({
        id: 'input',
        position: { x: 50, y: 150 },
        data: { label: `Input: ${selectedInput.path} (${selectedInput.description})` },
        type: 'input',
        sourcePosition: 'right'
      });
    }

    steps.forEach((step, idx) => {
      const stepId = `step-${idx + 1}`;
      const prevId = idx === 0 ? 'input' : `step-${idx}`;
      newNodes.push({
        id: stepId,
        position: { x: 200 + idx * 200, y: 150 },
        data: {
          label: `Step ${idx + 1}: ${step.script?.name || 'N/A'}\nModel: ${step.model?.name || 'None'}`
        },
        targetPosition: 'left',
        sourcePosition: 'right'
      });
      newEdges.push({
        id: `e-${stepId}`,
        source: prevId,
        target: stepId,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [selectedInput, steps]);

  const renderSelector = (label, value, setValue, options) => (
    <FormControl fullWidth margin="dense">
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
      >
        {options.map((opt) => (
          <MenuItem key={opt.id} value={opt}>
            {opt.path ? `${opt.name}` : opt.file_name || '(no name)'}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

    const renderInputTypeSelector = (label, value, setValue, options) => (
    <FormControl fullWidth margin="dense">
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
      >
        {options.map((opt) => (
          <MenuItem key={opt.id} value={opt.name}>
            {`${opt.name}` || '(no name)'}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const addStep = () => {
    setSteps([...steps, { step: null,script: null, model: null , input_type: 'video'}]);
  };

  const updateStep = (index, key, value) => {
    const newSteps = [...steps];
    newSteps[index][key] = value;
    setSteps(newSteps);
  };

  const deleteStep = (index) => {
    setSteps(steps.filter((_, idx) => idx !== index));
  };

  const handleSubmitFlow = async () => {
    if (!flowName || !flowDescription || !selectedInput || steps.length === 0) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload = {
      name: flowName,
      description: flowDescription,
      input: selectedInput.id,
      steps: steps.map((step, index) => ({
        step_number: index+1,
        script: step.script?.id,
        model: step.model?.id || null,
        class: step.class?.id,
        ground_truth: step.ground_truth?.id,
        input_type: step.input_type,
      }))
    };

    try {
      await axios.post('/api/workflow/create/', payload);
      alert('Flow submitted successfully!');
    } catch (error) {
      console.error('Failed to submit flow:', error);
      alert('Failed to submit flow.');
    }
  };

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <h2 className="dashboard-header">Flow Details</h2>
          <TextField margin="normal" label="Flow Name" value={flowName} onChange={(e) => setFlowName(e.target.value)} />
          <TextField margin="normal" label="Description" value={flowDescription} onChange={(e) => setFlowDescription(e.target.value)} />
          {renderSelector('Input File / Folder', selectedInput, setSelectedInput, inputFiles)}

          {steps.map((step, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '0.5rem', marginTop: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong class="custom-strong">Step {index + 1}</strong>
                <div>
                  <IconButton size="small" onClick={() => deleteStep(index)}><Delete className="delete-icon-button"/></IconButton>
                </div>
              </div>
              {renderSelector('Select File', step.script, (val) => updateStep(index, 'script', val), wheelFiles)}
              {renderSelector(`U${index + 1} Model (Optional)`, step.model, (val) => updateStep(index, 'model', val), modelFiles)}
              {renderSelector(`U${index + 1} Class`, step.class, (val) => updateStep(index, 'class', val), classFiles)}
              {renderSelector(`U${index + 1} Ground Truth`, step.ground_truth, (val) => updateStep(index, 'ground_truth', val), groundTruthFiles)}
              {renderInputTypeSelector(`U${index + 1} Input Types`, step.input_type, (val) => updateStep(index, 'input_type', val), inputTypes)}
            </div>
          ))}

          <Button className="add-step-button" onClick={addStep} style={{ marginTop: '1rem' }}>+ Add Script</Button>
          <Button variant="contained" className="button-submit" onClick={handleSubmitFlow}>Save Flow</Button>
        </div>

        <div className="dashboard-flowarea">
          <ReactFlowProvider>
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;



