import React from 'react';
import { useState } from "react"

import { SmallApiUpload } from './SmallApiUpload';

const ApiUploadArea = (props) => {


    const [uploaded, setUploaded] = useState(props.uploaded)

    const { apiTitle, handlerAPI } = props

    const {onTestConfNameChange} = props

    const newHandler = (paths, servers, schemas, schemasValues)=>{
        handlerAPI(paths, servers, schemas, schemasValues)
        setUploaded(true)
    }

    return (

        <div>
            <label><b>Name of test configuration:</b></label>
            <input  id="text" name="text" onChange={onTestConfNameChange} value={apiTitle} className="nodrag" />

            <label><b>API Specification:</b></label>

            {(uploaded === false ) ?
                <SmallApiUpload handlerAPI={newHandler} apiTitle={apiTitle} ></SmallApiUpload> : <div>API uploaded!</div>}
        </div>
    );
};

//TODO: VER a cena da location aí em cima       && location?.state?.APITitle === undefined
export default ApiUploadArea;