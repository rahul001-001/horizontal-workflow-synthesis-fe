// src/components/ScriptList.js
import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';

function ScriptList({ onDrop }) {
  const [scripts, setScripts] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    const fetchScriptsModelsInputs = async () => {
      try {
        const wheelResponse = await axios.get('/files/list/wheel/');
        const inputResponse = await axios.get('/files/list/input/');
        const modelResponse = await axios.get('/files/list/model/');
        setScripts(wheelResponse.data);
        setInputs(inputResponse.data);
        setModels(modelResponse.data);
      } catch (error) {
        console.error('Failed to load scripts:', error);
      }
    };

    fetchScriptsModelsInputs();
  }, []);

  const handleDragStart = (e, script) => {
    e.dataTransfer.setData('application/json', JSON.stringify(script));
  };

  return (
    <div style={{ width: '250px', padding: '1rem', backgroundColor: '#2a2a2a', color: '#fff' }}>
      <h3>Available Scripts</h3>
      {scripts.map(script => (
        <div
          key={script.id}
          draggable
          onDragStart={(e) => handleDragStart(e, script)}
          style={{
            padding: '0.5rem',
            margin: '0.5rem 0',
            backgroundColor: '#444',
            cursor: 'grab',
            borderRadius: '4px'
          }}
        >
          {script.name || script.file_name}
        </div>
      ))}
    </div>
  );
}

export default ScriptList;
