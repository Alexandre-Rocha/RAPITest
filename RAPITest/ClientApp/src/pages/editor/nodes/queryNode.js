import { useState } from 'react';
import React from 'react';

import { Button, Form } from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/queryNode.css'
import GeneralNode from './generalNode';

function QueryNode({ data, isConnectable, xPos, yPos }) {


    const [query, setQuery] = useState(data.custom.query || [{ key: '', value: '' }]);

    const handleKeyChange = (index, value) => {
        const updatedQuery = [...query];
        updatedQuery[index].key = value;
        setQuery(updatedQuery);
        data.custom.keyChangeCallback(index, value, data.custom._wfIndex, data.custom._testIndex);
    };

    const handleValueChange = (index, value) => {
        const updatedQuery = [...query];
        updatedQuery[index].value = value;
        setQuery(updatedQuery);
        data.custom.valueChangeCallback(index, value, data.custom._wfIndex, data.custom._testIndex);
    };

    const addQuery = () => {
        setQuery([...query, { key: '', value: '' }]);
        data.custom.addQueryCallback(data.custom._wfIndex, data.custom._testIndex)
    };

    const removeQuery = (index) => {
        const updatedQuery = [...query];
        updatedQuery.splice(index, 1);
        setQuery(updatedQuery);
        data.custom.removeQueryCallback(index, data.custom._wfIndex, data.custom._testIndex)
    };


    rapiLog(level.DEBUG, "[Query node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Query node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Query node] Y pos: ", yPos)

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'query-node',
        accItemClass: 'query-item',
        accHeaderClass: 'query-header',
        accBodyClass: 'nodrag',
        header: 'Query'
    };

    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <label>Query</label>

                {query.map((queryItem, index) => (
                    <div className='query-line' key={index}>

                        <Form.Control value={queryItem.key} onChange={(e) => handleKeyChange(index, e.target.value)} className="key-field" type="text" placeholder="Key" />
                        <Form.Control value={queryItem.value} onChange={(e) => handleValueChange(index, e.target.value)} className="value-field" type="text" placeholder="Value" />
                        <Button className='remove-query' variant="light" size="sm" onClick={() => removeQuery(index)}>-</Button>

                    </div>
                ))}

                <button onClick={addQuery}>Add Query</button>

            </GeneralNode>
        </div>
    );
}


export default QueryNode;