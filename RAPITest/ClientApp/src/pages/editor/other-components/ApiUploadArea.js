import React from 'react';
import { useState } from "react"

import SmallApiUpload from './SmallApiUpload';

import SimpleAccordion from './SimpleAccordion';


import { Form } from 'react-bootstrap';

import AcceptedFilesList from './AcceptedFilesList';
import ListGroupComp from '../../../components/ListGroupComp';

import successIcon from '../../../assets/tickSmall.png'
import binIcon from '../../../assets/bin.png'


import { useSettings } from './SettingsContext';

const ApiUploadArea = (props) => {

    const { settings } = useSettings();

    const [uploaded, setUploaded] = useState(props.uploaded)

    const [apiFiles, setApiFiles] = useState([]) //only 1 allowed, this is for ease for display because of listgroup component

    const { apiTitle, handlerAPI } = props

    const { onTestConfNameChange } = props

    const newHandler = (paths, servers, schemas, schemasValues, files) => {
        handlerAPI(paths, servers, schemas, schemasValues)
        setUploaded(true)
        setApiFiles(files)
    }

    const fileNameFuction = (file) => {
        return file.name
    }

    const removeFileFunction = (fileToRemove) => {
        setApiFiles(currentFiles => currentFiles.filter(file => file !== fileToRemove));
        //if api file is removed, enable dropzone again
        //TODO: how does this affect the backedn tho? uploading, removing, uploading, etc..
        //need to call some endpoint to cancel?
        setUploaded(false)
    }

    //TODO: label css class instead of inline
    return (
        <div>
            <SimpleAccordion header={"Test configuration"} accHeaderClass={"sidebar-simple-header"} accItemClass={"sidebar-simple-item"} accIconClass={"name-icon"}>

                <Form.Label style={{ fontWeight: 'bold' }}>Name:</Form.Label>
                <Form.Control value={apiTitle} onChange={onTestConfNameChange} className="nodrag" type="text" placeholder="Enter name" />
                {settings.showTips ?
                        <Form.Text className="text-muted">
                            The name for your test configuration. For example, "Petstore test suite".
                        </Form.Text>
                        :
                        <></>}

            </SimpleAccordion>

            <p></p>

            <SimpleAccordion header={"API Upload"} accHeaderClass={"sidebar-simple-header"} accItemClass={"sidebar-simple-item"} accIconClass={"api-icon"}>

                {(uploaded === false) ?
                    <div>
                        <Form.Label style={{ fontWeight: 'bold', display:'block' }}>Upload using file</Form.Label>
                        {settings.showTips ?
                        <Form.Text className="text-muted">
                            Drag and drop the file that contains your API Specification.
                        </Form.Text>
                        :
                        <></>}
                        <SmallApiUpload handlerAPI={newHandler} apiTitle={apiTitle} ></SmallApiUpload>
                    </div>
                    : 
                    <div>
                        <span style={{ fontWeight: 'bold' }}>API uploaded!</span> <span> If you want to upload another specification, delete the already uploaded one below.</span>
                    </div>}

                <p></p>

                <AcceptedFilesList
                    title="Uploaded file:"
                    files={apiFiles}
                    symbol={successIcon}
                    toShow={fileNameFuction}
                    removeSymbol={binIcon}
                    removeFunction={removeFileFunction}></AcceptedFilesList>

            </SimpleAccordion>
        </div>
    );
};

//TODO: VER a cena da location aí em cima       && location?.state?.APITitle === undefined
export default ApiUploadArea;