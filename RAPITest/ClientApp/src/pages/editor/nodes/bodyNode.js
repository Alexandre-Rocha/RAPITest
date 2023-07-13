import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

function BodyNode({ data, isConnectable }) {





  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <div>
        <label htmlFor="text">Body node</label>
      </div>


      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default BodyNode;