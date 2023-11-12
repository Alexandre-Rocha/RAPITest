import { useState } from 'react';
import React from 'react';

import { Form } from 'react-bootstrap';

import { LOG_LEVELS as level, rapiLog } from '../utils';

import './css/customVerificationNode.css'
import GeneralNode from './generalNode';

function CustomVerificationNode({ data, isConnectable, xPos, yPos }) {

    const [selectedDll, setSelectedDll] = useState();

    rapiLog(level.DEBUG, "[Custom node] Workflow ID: ", data.custom._wfIndex)
    rapiLog(level.DEBUG, "[Custom node] Test ID: ", data.custom._testIndex)
    rapiLog(level.DEBUG, "[Custom node] X pos: ", xPos)
    rapiLog(level.DEBUG, "[Custom node] Y pos: ", yPos)


    const onSelectedDllChange = (evt) => {

        const newSelectedDll = evt.target.value
        setSelectedDll(newSelectedDll)

        data.custom.customVerifChangeCallback(newSelectedDll, data.custom._wfIndex, data.custom._testIndex)
    };


    const getDllNames = () => {
        if (data.custom.dllNames) {
            return data.custom.dllNames
        }
        else return []
    }

    const generalNodeProps = {
        data: data,
        isConnectable: isConnectable,
        nodeClass: 'custom-node',
        accItemClass: 'custom-item',
        accHeaderClass: 'custom-header',
        accBodyClass: 'nodrag',
        header: 'Custom'
    };


    return (
        <div>
            <GeneralNode {...generalNodeProps}>

                <Form.Select aria-label="Default select example" value={selectedDll} onChange={onSelectedDllChange} >
                    <option value=""></option>
                    {getDllNames().map((item, index) => {
                        return (
                            <option key={index} value={item}>{item}</option>
                        )
                    })}
                </Form.Select>

            </GeneralNode>
        </div>
    );
}


export default CustomVerificationNode;
