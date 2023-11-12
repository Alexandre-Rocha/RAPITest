import React from 'react';
import { useState } from "react"

import { SmallApiUpload } from './SmallApiUpload';

import SimpleAccordion from './SimpleAccordion';

import { Form } from 'react-bootstrap';

const ApiUploadArea = (props) => {


    const [uploaded, setUploaded] = useState(props.uploaded)

    const { apiTitle, handlerAPI } = props

    const {onTestConfNameChange} = props

    const newHandler = (paths, servers, schemas, schemasValues)=>{
        handlerAPI(paths, servers, schemas, schemasValues)
        setUploaded(true)
    }
//TODO: label css class instead of inline
    return (

        <div>

            <Form.Label style={{ fontWeight: 'bold' }}>Name of test configuration:</Form.Label>
            <Form.Control value={apiTitle} onChange={onTestConfNameChange} className="nodrag" type="text" placeholder="Enter text" />

            {/* <input  id="text" name="text" onChange={onTestConfNameChange} value={apiTitle} className="nodrag" /> */}

{/*             <label><b>API Specification:</b></label>
 */}
            <SimpleAccordion header={"API Upload"} accHeaderClass={"sidebar-simple-header"}>



            {(uploaded === false ) ?
                <SmallApiUpload handlerAPI={newHandler} apiTitle={apiTitle} ></SmallApiUpload> : <div>API uploaded! (WIP)</div>}

</SimpleAccordion>

        </div>
    );
};

//TODO: VER a cena da location aí em cima       && location?.state?.APITitle === undefined
export default ApiUploadArea;