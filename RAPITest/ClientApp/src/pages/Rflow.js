import React,{ useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import TextUpdaterNode from '../components/nodes/textnode';

import '../components/nodes/textnode.css';


const initialNodes = [
  { id: '0', type: 'textUpdater', position: { x: 0, y: 0 }, data: { value: 123 } },
  {
    id: '1',
    data: { label: 'Input node' },
    position: { x: 0, y: 0 },
    type: 'input',
  },
  {
    id: '2',
    data: { label: 'Mixed node' },
    position: { x: 50, y: 50 },
  },
  {
    id: '3',
    data: { label: 'Output node' },
    position: { x: 100, y: 100 },
    type: 'output'
  },
];

const initialEdges = [{ id: 'e2-3', source: '2', target: '3', animated: true },];

// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { textUpdater: TextUpdaterNode };

function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const [variant, setVariant] = useState('cross');

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  return (
    <div style={{ height: 600, width: 900 }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        nodeTypes={nodeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
              <Panel position="bottom-right">Display something on top of bg. Can put in more places</Panel>

        <Background color='#aaaaaa' variant={variant} />
        <Panel>
          <div>Change bg:</div>
          <button onClick={() => setVariant('dots')}>dots</button>
          <button onClick={() => setVariant('lines')}>lines</button>
          <button onClick={() => setVariant('cross')}>cross</button>
        </Panel>
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Flow;
