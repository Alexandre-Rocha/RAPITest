import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import { Accordion } from 'react-bootstrap';

import './css/generalNode.css'
import './css/bodyNode.css'

function BodyNode({ data, isConnectable }) {





  return (
    <div className="body-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='body-area area' eventKey="0">
          <Accordion.Header className='body-header header'>Body</Accordion.Header>
          <Accordion.Body>

      <div>
        <label htmlFor="text">Body node</label>
      </div>

      </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default BodyNode;