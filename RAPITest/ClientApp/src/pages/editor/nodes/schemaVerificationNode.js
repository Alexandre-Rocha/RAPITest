import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import './css/schemaVerificationNode.css'

import { Accordion } from 'react-bootstrap';
import { Form } from 'react-bootstrap';


import './css/generalNode.css'

//TODO: this whole node needs to be updated
function SchemaVerificationNode({ data, isConnectable }) {

  const [schema, setSchema] = useState(data.custom.initialSchema)

  console.log("[Schema node] Workflow ID: ", data.custom._wfIndex)
  console.log("[Schema node] Test ID: ", data.custom._testIndex)


  const onSchemaChange = (evt) => {
    const schema = evt.target.value
    setSchema(schema)
    data.custom.schemaChangeCallback(schema, data.custom._wfIndex, data.custom._testIndex)

  };


  return (
    <div className="schemaVerif-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='schemaVerif-area area' eventKey="0">
          <Accordion.Header className='schemaVerif-header header'>Schema</Accordion.Header>
          <Accordion.Body className='nodrag'>


            <Form.Select aria-label="Default select example" value={schema} onChange={onSchemaChange} >
              <option value=""></option>
              {data.custom.schemas.map((item, index) => {
                return (
                  <option key={index} value={item}>{item}</option>
                )
              })}
            </Form.Select>

            {/* <label htmlFor="readonly">Schema node</label>

      <div>
        <label htmlFor="text">Paste the schema:</label>
        <input value={schema} id="text" name="text" onChange={onSchemaChange} className="nodrag" />
      </div> */}

          </Accordion.Body>
        </Accordion.Item>
      </Accordion>


      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default SchemaVerificationNode;
