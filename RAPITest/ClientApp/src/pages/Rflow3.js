import React, { useCallback } from 'react';
import ReactFlow, { ReactFlowProvider, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';


//import './button.css';



let defaultNodes = [
    {
      id: 'a',
      type: 'input',
      data: { label: 'Node A' },
      position: { x: 250, y: 25 },
    },
  
    {
      id: 'b',
      data: { label: 'Node B' },
      position: { x: 100, y: 125 },
    },
    {
      id: 'c',
      type: 'output',
      data: { label: 'Node C' },
      position: { x: 250, y: 250 },
    },
  ];

let defaultEdges = [{ id: 'ea-b', source: 'a', target: 'b' }];


let nodeId = 0;

function Flow() {
  const reactFlowInstance = useReactFlow();
  const onClick = useCallback(() => {
    const id = `${++nodeId}`;
    const newNode = {
      id,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        label: `Node ${id}`,
      },
    };
    reactFlowInstance.addNodes(newNode);
  }, []);

  return (
    <div style={{ height: 600, width: 900 }}>
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
      />
      <button onClick={onClick} className="btn-add">
        add node
      </button>
    </div>
  );
}

export default function Rflow3 () {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
