import { useState } from 'react';
import React from 'react';

import SimpleModalComp from '../../../components/SimpleModalComp';

import { Form, Tooltip, OverlayTrigger } from 'react-bootstrap';

import searchIcon from '../../../assets/search.png'

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/bodyNode.css'
import GeneralNode from './generalNode';
import MyTextModal from '../other-components/MyTextModal';

function BodyNode({ data, isConnectable, xPos, yPos }) {

    const [bodyText, setBodyText] = useState(data.custom.bodyText || "")
    const [bodyRef, setBodyRef] = useState(data.custom.bodyRef || "")
    const [useBodyRef, setUseBodyRef] = useState(data.custom.useBodyRef || false)

    const [showSchema, setShowSchema] = useState(false)

    rapiLog(level.DEBUG, "[Body node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Body node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Body node] Y pos: ", yPos)

    const onBodyTextChange = (text) => {
        rapiLog(level.INFO, "[Body node] Body text: ", text);
        setBodyText(text)
        //data.custom.bodyTextChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)

    };

    const onBodyRefChange = (evt) => {
        rapiLog(level.INFO, "[Body node] Body ref: ", evt.target.value);
        if (evt.target.value == "textBox") {
            setBodyRef(null)
            setUseBodyRef(false)
        }
        else{
            setBodyRef(evt.target.value)
            setUseBodyRef(true)
        }
        //data.custom.bodyRefChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
    };

    const tooltip = (
        <Tooltip className="custom-tooltip" id="tooltip">
            <strong>WIP</strong> Body tooltip.
        </Tooltip>
    );

    const renderSchemaData = () => {
        if (!useBodyRef) {
            return bodyText
        }
        else if (data.custom.dictObj) {
            return data.custom.dictObj[bodyRef]
        }
        return ""
    }

    const renderSchemaList = () => {
        if (data.custom.dictObj) {
            return Object.keys(data.custom.dictObj)
        } else
            return []
    }

    const getState = () => {
        const state = {
            bodyText: bodyText,
            bodyRef: bodyRef,
            useBodyRef: useBodyRef
        }
        return state
    }


    data.custom.getState = getState

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'body-node',
        accItemClass: 'body-item',
        accHeaderClass: 'body-header',
        accBodyClass: 'nodrag',
        accIconClass: 'body-icon',
        header: 'Body'
    };


    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                {/* <label htmlFor="bodyText">
                    Body text WIP
                    <OverlayTrigger placement="right" overlay={tooltip}>
                        <span>  🛈</span>
                    </OverlayTrigger>
                </label>
                <Form.Control id='bodyText' value={bodyText} onChange={onBodyTextChange} className="body-text" type="text" placeholder="Enter text" /> */}

                <label htmlFor="bodyRef">Choose Body:</label>
                <div className='body-ref-div'>
                    <Form.Select id='bodyRef' className='body-ref' aria-label="Default select example" onChange={onBodyRefChange} >
                        <option value="textBox" >Use text box</option>
                        {renderSchemaList().map((item, index) => {
                            return (
                                <option key={index} value={item}>{item}</option>
                            )
                        })}
                    </Form.Select>

                    <img className="see-more-body" onClick={() => setShowSchema(true)} width="24" height="24" src={searchIcon} alt="Logo" />
                </div>

                <p></p>
                
                <MyTextModal handleSave={onBodyTextChange} text="Open Body text box"></MyTextModal>

            </GeneralNode>


            <SimpleModalComp
                title={"Body preview"}
                body={renderSchemaData()}
                cancelButtonFunc={() => { setShowSchema(false) }}
                visible={showSchema}
            />

        </div>
    );
}


export default BodyNode;
