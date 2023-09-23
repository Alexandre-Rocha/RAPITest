import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import { Form, Accordion, Tooltip, OverlayTrigger } from 'react-bootstrap';

import './css/generalNode.css'
import './css/bodyNode.css'

function BodyNode({ data, isConnectable, xPos, yPos }) {

  const [bodyText, setBodyText] = useState(data.custom.bodyText || "")
  const [bodyRef, setBodyRef] = useState(data.custom.bodyRef || "")

  console.log("[Body node] X pos: ", xPos)
  console.log("[Body node] Y pos: ", yPos)

  const onBodyTextChange = (evt) => {
    console.log("[Body node] Body text: ", evt.target.value);
    setBodyText(evt.target.value)
    data.custom.bodyTextChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)

  };

  const onBodyRefChange = (evt) => {
    console.log("[Body node] Body ref: ", evt.target.value);
    setBodyRef(evt.target.value)
    data.custom.bodyRefChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
  };

  const tooltip = (
    <Tooltip className="custom-tooltip" id="tooltip">
      <strong>Holy guacamole!</strong> Check this info.
    </Tooltip>
  );
//&#9432;
//&#x1F6C8;
  return (
    <div className="body-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='body-area area' eventKey="0">
          <Accordion.Header className='body-header header'>Body</Accordion.Header>
          <Accordion.Body>


            <label htmlFor="text">Body text wip<OverlayTrigger placement="right" overlay={tooltip}>
            <span>  🛈</span> 
            </OverlayTrigger></label>


            <Form.Control value={bodyText} onChange={onBodyTextChange} className="test-name" type="text" placeholder="Enter text" />

            <label htmlFor="text">Body ref wip</label>
            <Form.Control value={bodyRef} onChange={onBodyRefChange} className="test-name" type="text" placeholder="Enter text" />

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