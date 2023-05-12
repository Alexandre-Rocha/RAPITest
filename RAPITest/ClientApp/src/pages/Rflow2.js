import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

import TestNameNode from '../components/nodes/testNameNode';

import '../components/nodes/textnode.css';

import colorSelectorNode from '../components/nodes/demoNodes/colorSelectorNode';

import GetRequestNode from '../components/nodes/tslNodes/getRequestNode';

import '../components/nodes/tslNodes/getRequestNode.css';

import GeneralRequestNode from '../components/nodes/tslNodes/generalRequestNode';

import '../components/nodes/tslNodes/generalRequestNode.css';


const initBgColor = '#fA122B';




const initialNodes = [
  { id: '0', type: 'testName', position: { x: 0, y: 0 }, data: { value: 123 } },
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
  { id: '4', type: 'testName', position: { x: 200, y: 200 }, data: { value: 456 } },
  {
    id: '5',
    type: 'selectorNode',
    data: { color: initBgColor },
    style: { border: '1px solid #777', padding: 10 },
    position: { x: 300, y: 50 },
  },
  { id: '6', type: 'getNode', position: { x: 0, y: 0 }, data: { value: 123 } },
  { id: '7', type: 'generalNode', position: { x: 0, y: 0 }, data: { value: 123 } },
];

const initialEdges = [{ id: 'e2-3', source: '2', target: '3', animated: true },];

// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { testName: TestNameNode, selectorNode: colorSelectorNode, getNode: GetRequestNode, generalNode: GeneralRequestNode };

function Flow2() {
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

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds))
    const { source, target } = params
    const data = source.data

    const updatedTarget = {
      ...target,
      data: { ...target.data, myData: data }
    };

    setNodes((els) =>
      els.map((el) => (el.id === updatedTarget.id ? updatedTarget : el))
    );

  }, []);


  const [nodeName, setNodeName] = useState('Node 1');

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.data = {
            ...node.data,
            label: nodeName,
          };
        }

        return node;
      })
    );
  }, [nodeName, setNodes]);

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
      <div className="updatenode__controls">
          <label>label:</label>
          <input value={nodeName} onChange={(evt) => setNodeName(evt.target.value)} />

        </div>

    </div>
  );
}

export default Flow2;
