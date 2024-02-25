import { useState } from 'react';
import React from 'react';

import { Button, Form } from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/retainNode.css'
import GeneralNode from './generalNode';

function RetainNode({ data, isConnectable, xPos, yPos }) {

    const [retains, setRetains] = useState(data.custom.retains || [{ key: '', value: '' }]);

    const handleKeyChange = (index, value) => {
        const updatedRetains = [...retains];
        updatedRetains[index].key = value;
        setRetains(updatedRetains);
        //data.custom.keyChangeCallback(index, value, data.custom._wfIndex, data.custom._testIndex)
    };

    const handleValueChange = (index, value) => {
        const updatedRetains = [...retains];
        updatedRetains[index].value = value;
        setRetains(updatedRetains);
        //data.custom.valueChangeCallback(index, value, data.custom._wfIndex, data.custom._testIndex)
    };

    const addRetain = () => {
        setRetains([...retains, { key: '', value: '' }]);
        //data.custom.addRetainCallback(data.custom._wfIndex, data.custom._testIndex)
    };

    const removeRetain = (index) => {
        const updatedRetains = [...retains];
        updatedRetains.splice(index, 1);
        setRetains(updatedRetains);
        //data.custom.removeRetainCallback(index, data.custom._wfIndex, data.custom._testIndex)
    };


    const getState = () => {
        const state = retains
        return state
    }

    data.custom.getState = getState

    rapiLog(level.DEBUG, "[Retain node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Retain node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Retain node] Y pos: ", yPos)


    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'retain-node',
        accItemClass: 'retain-item',
        accHeaderClass: 'retain-header',
        accBodyClass: 'nodrag',
        accIconClass: 'retain-icon',
        header: 'Retain'
    };

    return (
        <div>
            <GeneralNode {...generalNodeProps}>
                
                <label>Retain</label>

                {retains.map((retain, index) => (
                    <div className='retain-line' key={index}>

                        <Form.Control value={retain.key} onChange={(e) => handleKeyChange(index, e.target.value)} className="key-field" type="text" placeholder="Key" />
                        <Form.Control value={retain.value} onChange={(e) => handleValueChange(index, e.target.value)} className="value-field" type="text" placeholder="Value" />
                        <Button className='remove-retain' variant="light" size="sm" onClick={() => removeRetain(index)}>-</Button>

                    </div>
                ))}

                <button onClick={addRetain}>Add Retain</button>

            </GeneralNode>
        </div>
    );
}


export default RetainNode;