import { useState } from 'react';
import React from 'react';

import { Form } from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/schemaVerificationNode.css'
import GeneralNode from './generalNode';

function SchemaVerificationNode({ data, isConnectable, xPos, yPos }) {

    const [schema, setSchema] = useState(data.custom.initialSchema)

    rapiLog(level.DEBUG, "[Schema node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Schema node] Test ID: ", data.custom._testIndex)
    rapiLog(level.DEBUG, "[Schema node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Schema node] Y pos: ", yPos)


    const onSchemaChange = (evt) => {
        const schema = evt.target.value
        setSchema(schema)
        data.custom.schemaChangeCallback(schema, data.custom._wfIndex, data.custom._testIndex)

    }

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'schema-node',
        accItemClass: 'schema-item',
        accHeaderClass: 'schema-header',
        accBodyClass: 'nodrag',
        accIconClass: 'schemaVerif-icon',
        header: 'Schema'
    };

    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <Form.Select aria-label="Default select example" value={schema} onChange={onSchemaChange} >
                    <option value=""></option>
                    {data.custom.schemas.map((item, index) => {
                        return (
                            <option key={index} value={item}>{item}</option>
                        )
                    })}
                </Form.Select>

            </GeneralNode>
        </div>
    );
}


export default SchemaVerificationNode;
