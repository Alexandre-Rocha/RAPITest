import { useState } from 'react';
import React from 'react';

import { Form } from 'react-bootstrap';

import searchIcon from '../../../assets/search.png'

import SimpleModalComp from '../../../components/SimpleModalComp';


import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/schemaVerificationNode.css'
import GeneralNode from './generalNode';

function SchemaVerificationNode({ data, isConnectable, xPos, yPos }) {

    const [schema, setSchema] = useState(data.custom.initialSchema)

    const [showSchema, setShowSchema] = useState(false)

    rapiLog(level.DEBUG, "[Schema node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Schema node] Test ID: ", data.custom._testIndex)
    rapiLog(level.DEBUG, "[Schema node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Schema node] Y pos: ", yPos)


    const onSchemaChange = (evt) => {
        const schema = evt.target.value
        setSchema(schema)
        console.log("[Schema node] Schema: ", schema);
    }

    const renderSchemaPreview = () => {
        return data.custom.schemaMap[schema]
    }

    const getState = () => {
        const state = {
            schema: schema
        }
        return state
    }

    data.custom.getState = getState

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

                <div className='schema-container'>
                    <Form.Select className='schema-select' aria-label="Default select example" value={schema} onChange={onSchemaChange} >
                        <option value=""></option>
                        {data.custom.schemas.map((item, index) => {
                            return (
                                <option key={index} value={item}>{item}</option>
                            )
                        })}
                    </Form.Select>

                    <img className="see-more-schema" onClick={() => setShowSchema(true)} width="24" height="24" src={searchIcon} alt="Logo" />
                </div>


            </GeneralNode>

            <SimpleModalComp
                title={"Schema preview"}
                body={renderSchemaPreview()}
                cancelButtonFunc={() => { setShowSchema(false) }}
                visible={showSchema}
            />

        </div>
    );
}


export default SchemaVerificationNode;
