import { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import { Accordion, Form } from 'react-bootstrap';

import './css/schemaVerificationNode.css'
import './css/generalNode.css'

function SchemaVerificationNode({ data, isConnectable, xPos, yPos }) {

  const [schema, setSchema] = useState(data.custom.initialSchema)

  console.log("[Schema node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Schema node] Test ID: ", data.custom._testIndex)

  console.log("[Schema node] X pos: ", xPos)
  console.log("[Schema node] Y pos: ", yPos)


  const onSchemaChange = (evt) => {
    const schema = evt.target.value
    setSchema(schema)
    data.custom.schemaChangeCallback(schema, data.custom._wfIndex, data.custom._testIndex)

  };

  const accordionRef = useRef(null);

  function collapseAccordion () {
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement && !childElement.classList.contains('collapsed')) {
      childElement.click();
    }
  }

  function openAccordion () {
    const childElement = accordionRef.current.querySelector('.accordion-button');
    if (childElement && childElement.classList.contains('collapsed')) {
      childElement.click();
    }
  }

  data.custom.collapseAccordion = collapseAccordion
  data.custom.openAccordion = openAccordion


  return (
    <div className="schemaVerif-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='schemaVerif-area area' eventKey="0">
          <Accordion.Header ref={accordionRef} className='schemaVerif-header header'>Schema</Accordion.Header>
          <Accordion.Body className='nodrag'>

            <Form.Select aria-label="Default select example" value={schema} onChange={onSchemaChange} >
              <option value=""></option>
              {data.custom.schemas.map((item, index) => {
                return (
                  <option key={index} value={item}>{item}</option>
                )
              })}
            </Form.Select>

          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default SchemaVerificationNode;
