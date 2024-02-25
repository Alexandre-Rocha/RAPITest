import { useState } from 'react';
import React from 'react';

import { Form } from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/containsVerificationNode.css'
import GeneralNode from './generalNode';

function ContainsVerificationNode({ data, isConnectable, xPos, yPos }) {

    const [contains, setContains] = useState(data.custom.contains || "");


    rapiLog(level.DEBUG, "[Contains node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Contains node] Test ID: ", data.custom._testIndex)
    rapiLog(level.DEBUG, "[Contains node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Contains node] Y pos: ", yPos)


    const onContainsChange = (evt) => {
        rapiLog(level.INFO, "[Contains node] Contains: ", evt.target.value)
        setContains(evt.target.value)
        //data.custom.containsChangeCallback(evt.target.value, data.custom._wfIndex, data.custom._testIndex)
    };

    const getState = () => {
        const state = {
            contains: contains
        }
        return state
    }

    data.custom.getState = getState


    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'contains-node',
        accItemClass: 'contains-item',
        accHeaderClass: 'contains-header',
        accBodyClass: 'nodrag',
        accIconClass: 'containsVerif-icon',
        header: 'Contains'
    };

    return (
        <div >
            <GeneralNode {...generalNodeProps}>

                <label htmlFor="contains">Contains</label>
                <Form.Control id='contains' value={contains} onChange={onContainsChange} className="contains-name" type="text" placeholder="Enter text" />

            </GeneralNode>
        </div>
    );
}


export default ContainsVerificationNode;
