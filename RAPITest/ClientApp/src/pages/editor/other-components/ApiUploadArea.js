import React from 'react';
import { SmallApiUpload } from './SmallApiUpload';

const ApiUploadArea = (props) => {

    const { apiTitle, handlerAPI } = props

    const {onTestConfNameChange} = props

    return (

        <div>
            <label><b>Name of test configuration:</b></label>
            <input  id="text" name="text" onChange={onTestConfNameChange} value={apiTitle} className="nodrag" />

            <label><b>API Specification:</b></label>

            {(props.uploaded === false ) ?
                <SmallApiUpload handlerAPI={handlerAPI} apiTitle={apiTitle} ></SmallApiUpload> : <div>API uploaded!</div>}
        </div>
    );
};

//TODO: VER a cena da location aí em cima       && location?.state?.APITitle === undefined
export default ApiUploadArea;