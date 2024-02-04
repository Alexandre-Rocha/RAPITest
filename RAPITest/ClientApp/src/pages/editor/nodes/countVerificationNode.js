import { useState } from 'react';
import React from 'react';

import { Form } from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/countVerificationNode.css'
import GeneralNode from './generalNode';

function CountVerificationNode({ data, isConnectable, xPos, yPos }) {

    const [key, setKey] = useState(data.custom.key || "")
    const [value, setValue] = useState(data.custom.value || "")


    rapiLog(level.DEBUG, "[Count node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Count node] Test ID: ", data.custom._testIndex)
    rapiLog(level.DEBUG, "[Count node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Count node] Y pos: ", yPos)


    const handleKeyChange = (key) => {
        setKey(key)
        data.custom.keyChangeCallback(key, data.custom._wfIndex, data.custom._testIndex)
    };

    const handleValueChange = (value) => {
        setValue(value)
        data.custom.valueChangeCallback(value, data.custom._wfIndex, data.custom._testIndex)
    };

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'count-node',
        accItemClass: 'count-item',
        accHeaderClass: 'count-header',
        accBodyClass: 'nodrag',
        accIconClass: 'countVerif-icon',
        header: 'Count'
    };

    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <label>Count </label>
                <Form.Control id='countKey' value={key} onChange={(e) => handleKeyChange(e.target.value)} className="key-field" type="text" placeholder="Key" />
                <Form.Control id='countValue' value={value} onChange={(e) => handleValueChange(e.target.value)} className="value-field" type="text" placeholder="Value" />

            </GeneralNode>
        </div>
    );
}


export default CountVerificationNode;
