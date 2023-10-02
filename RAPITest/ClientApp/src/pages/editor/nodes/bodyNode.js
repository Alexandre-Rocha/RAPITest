import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React from 'react';

import SimpleModalComp from '../../../components/SimpleModalComp';

import { Form, Accordion, Tooltip, OverlayTrigger } from 'react-bootstrap';

//import searchIcon from '../assets/search.png'
import searchIcon from '../../../assets/search.png'

import { Combobox } from 'react-widgets';

import './css/generalNode.css'
import './css/bodyNode.css'

function BodyNode({ data, isConnectable, xPos, yPos }) {

  const [bodyText, setBodyText] = useState(data.custom.bodyText || "")
  const [bodyRef, setBodyRef] = useState(data.custom.bodyRef || "")

  const [showSchema, setShowSchema] = useState(false)


  const [] = useState()

  //data.custom.refList

  console.log("[Body node] X pos: ", xPos)
  console.log("[Body node] Y pos: ", yPos)
//<img className="seeMoreBody" onClick={this.showFullSchema} width="25" height="25" src={searchIcon} alt="Logo" />
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
      <strong>WIP</strong> Body tooltip.
    </Tooltip>
  );

    const renderSchemaData = ()=>{
      /* if (data.custom.refList) {
        
      } e */
      return "body wip"
    }

    const renderSchemaList = ()=>{
      if (data.custom.refList) {
        
      } else
      return ["asa","oeo"]
    }

    const onChangeSchemaList = ()=>{
        console.log("changed boy");
    }

//&#9432;
//&#x1F6C8;
  return (
    <div className="body-node node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Accordion defaultActiveKey="0">
        <Accordion.Item className='body-area area' eventKey="0">
          <Accordion.Header className='body-header header'>Body</Accordion.Header>
          <Accordion.Body>


            <label htmlFor="text">Body text WIP<OverlayTrigger placement="right" overlay={tooltip}>
            <span>  🛈</span> 
            </OverlayTrigger></label>


            <Form.Control value={bodyText} onChange={onBodyTextChange} className="test-name" type="text" placeholder="Enter text" />

            <label htmlFor="text">Body ref WIP</label>

            <div className='bodyRefDiv'>
            {/* <Form.Control value={bodyRef} onChange={onBodyRefChange} className="bodyRef" type="text" placeholder="Enter text" /> */}

            {/* <Combobox className='nowheel bodyRefDiv'
              data={renderSchemaList()}
              filter={false}
              onChange={onChangeSchemaList}
              defaultValue={"wip list:"}
            /> */}

            <Form.Select className='bodyRef' aria-label="Default select example" value={"ssf"} onChange={onChangeSchemaList} >
              <option value="dg"></option>
              {renderSchemaList().map((item, index) => {
                return (
                  <option key={index} value={item}>{item}</option>
                )
              })}
            </Form.Select>

            <img className="seeMoreBody" onClick={()=>setShowSchema(true)} width="20" height="20" src={searchIcon} alt="Logo" />
            </div>
            

            <div>
              <label htmlFor="text">Body node</label>
            </div>

          </Accordion.Body>
        </Accordion.Item>
      </Accordion>


      <SimpleModalComp
                    title={"card Schema wip"}
                    body={renderSchemaData}
                    cancelButtonFunc={()=>{setShowSchema(false)}}
                    visible={showSchema}
                />

      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}


export default BodyNode;