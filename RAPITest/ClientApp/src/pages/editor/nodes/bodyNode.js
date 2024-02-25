import { useState } from 'react';
import React from 'react';

import SimpleModalComp from '../../../components/SimpleModalComp';

import { Form, Tooltip, OverlayTrigger } from 'react-bootstrap';

import searchIcon from '../../../assets/search.png'

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/bodyNode.css'
import GeneralNode from './generalNode';

function BodyNode({ data, isConnectable, xPos, yPos }) {

    const [bodyText, setBodyText] = useState(data.custom.bodyText || "")
    const [bodyRef, setBodyRef] = useState(data.custom.bodyRef || "")
    const [useBodyRef, setUseBodyRef] = useState(data.custom.useBodyRef || false)

    const [showSchema, setShowSchema] = useState(false)

    rapiLog(level.DEBUG, "[Body node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Body node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Body node] Y pos: ", yPos)

    const onBodyTextChange = (evt) => {
        rapiLog(level.INFO, "[Body node] Body text: ", evt.target.value);
        setBodyText(evt.target.value)
        //data.custom.bodyTextChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)

    };

    const onBodyRefChange = (evt) => {
        rapiLog(level.INFO, "[Body node] Body ref: ", evt.target.value);
        setBodyRef(evt.target.value)
        //data.custom.bodyRefChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
    };

    const tooltip = (
        <Tooltip className="custom-tooltip" id="tooltip">
            <strong>WIP</strong> Body tooltip.
        </Tooltip>
    );

    const renderSchemaData = () => {
        if (data.custom.dictObj) {
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

                <label htmlFor="bodyText">
                    Body text WIP
                    <OverlayTrigger placement="right" overlay={tooltip}>
                        <span>  🛈</span>
                    </OverlayTrigger>
                </label>
                <Form.Control id='bodyText' value={bodyText} onChange={onBodyTextChange} className="body-text" type="text" placeholder="Enter text" />

                <label htmlFor="bodyRef">Body ref WIP</label>
                <div className='body-ref-div'>
                    <Form.Select id='bodyRef' className='body-ref' aria-label="Default select example" onChange={onBodyRefChange} >
                        <option></option>
                        {renderSchemaList().map((item, index) => {
                            return (
                                <option key={index} value={item}>{item}</option>
                            )
                        })}
                    </Form.Select>

                    <img className="see-more-body" onClick={() => setShowSchema(true)} width="24" height="24" src={searchIcon} alt="Logo" />
                </div>

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
