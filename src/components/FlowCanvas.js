import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node type for scripts
const ScriptNode = ({ data }) => {
  return (
    <div style={{ padding: '10px', background: '#333', color: '#fff', borderRadius: '6px', minWidth: '100px' }}>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <div style={{ textAlign: 'center' }}>{data.label}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes = { script: ScriptNode };

function FlowCanvas({ flowData }) {
  const wrapperRef = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { project } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = wrapperRef.current.getBoundingClientRect();
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${+new Date()}`,
        type: 'script',
        position,
        data: { label: data.file_name },
      };


      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes]
  );

  return (
    <div ref={wrapperRef} style={{ height: '600px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap nodeColor="#555" nodeStrokeColor="#999" maskColor="rgba(0,0,0,0.6)" style={{ backgroundColor: '#1e1e1e' }} />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default function WrappedCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
