import { useState } from 'react';
import React from 'react';

import { Button, Form } from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/headersNode.css'
import GeneralNode from './generalNode';

function HeadersNode({ data, isConnectable, xPos, yPos }) {

    const [headers, setHeaders] = useState(data.custom.headers || [{ key: '', value: '' }]);

    const handleKeyChange = (index, value) => {
        const updatedHeaders = [...headers];
        updatedHeaders[index].key = value;
        setHeaders(updatedHeaders);
    };

    const handleValueChange = (index, value) => {
        const updatedHeaders = [...headers];
        updatedHeaders[index].value = value;
        setHeaders(updatedHeaders);
    };

    const addHeader = () => {
        setHeaders([...headers, { key: '', value: '' }]);
    };

    const removeHeader = (index) => {
        const updatedHeaders = [...headers];
        updatedHeaders.splice(index, 1);
        setHeaders(updatedHeaders);
    };

    rapiLog(level.DEBUG, "[Headers node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Headers node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Headers node] Y pos: ", yPos)

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'headers-node',
        accItemClass: 'headers-item',
        accHeaderClass: 'headers-header',
        accBodyClass: 'nodrag',
        accIconClass: 'headers-icon',
        header: 'Headers'
    };

    const getState = () => {
        const state = headers
        return state
    }

    data.custom.getState = getState

    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <label>Headers</label>

                {headers.map((header, index) => (
                    <div className='header-line' key={index}>

                        <Form.Control value={header.key} onChange={(e) => handleKeyChange(index, e.target.value)} className="key-field" type="text" placeholder="Key" />
                        <Form.Control value={header.value} onChange={(e) => handleValueChange(index, e.target.value)} className="value-field" type="text" placeholder="Value" />
                        <Button className='remove-header' variant="light" size="sm" onClick={() => removeHeader(index)}>-</Button>

                    </div>
                ))}
                <p></p>
                <button className='addButton' onClick={addHeader}>+ Add Header</button>

            </GeneralNode>
        </div>
    );
};


export default HeadersNode;