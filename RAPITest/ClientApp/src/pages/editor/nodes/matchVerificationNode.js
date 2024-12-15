import { useState } from 'react';
import React from 'react';

import { Form } from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/matchVerificationNode.css'
import GeneralNode from './generalNode';

function MatchVerificationNode({ data, isConnectable, xPos, yPos }) {

    const [key, setKey] = useState(data.custom.key || "")
    const [value, setValue] = useState(data.custom.value || "")

    rapiLog(level.DEBUG, "[Match node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Match node] Test ID: ", data.custom._testIndex)
    rapiLog(level.DEBUG, "[Match node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Match node] Y pos: ", yPos)


    const handleKeyChange = (key) => {
        setKey(key)
    };

    const handleValueChange = (value) => {
        setValue(value)
    };

    const getState = () => {
        const state = {
            key: key,
            value: value
        }
        return state
    }

    data.custom.getState = getState

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'match-node',
        accItemClass: 'match-item',
        accHeaderClass: 'match-header',
        accBodyClass: 'nodrag',
        accIconClass: 'matchVerif-icon',
        header: 'Match'
    };

    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <label>Match </label>
                <Form.Control id='matchKey' value={key} onChange={(e) => handleKeyChange(e.target.value)} className="key-field" type="text" placeholder="Key" />
                <Form.Control id='matchValue' value={value} onChange={(e) => handleValueChange(e.target.value)} className="value-field" type="text" placeholder="Value" />

            </GeneralNode>
        </div>
    );
}


export default MatchVerificationNode;
