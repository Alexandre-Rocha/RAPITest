import React from 'react';
import { useState } from "react"

import SmallApiUpload from './SmallApiUpload';

import SimpleAccordion from './SimpleAccordion';

import { Form } from 'react-bootstrap';

import AcceptedFilesList from './AcceptedFilesList';

import successIcon from '../../../assets/tickSmall.png'
import binIcon from '../../../assets/bin.png'


import { useSettings } from './SettingsContext';

const ApiUploadArea = (props) => {

    const { settings } = useSettings();

    const [uploaded, setUploaded] = useState(props.uploaded)

    const [apiFiles, setApiFiles] = useState(props.apiFile ? [props.apiFile] : []) //only 1 allowed, this is for ease for display because of listgroup component

    const { apiTitle, handlerAPI } = props

    const { onTestConfNameChange } = props

    const { setApiUploadedCallback } = props

    const newHandler = (paths, servers, schemas, schemasValues, files) => {
        handlerAPI(paths, servers, schemas, schemasValues)
        setUploaded(true)
        if (!files || files.length === 0) { // this happens when upload done by url
            const fakeFile = new File([], "specification (url)", {
                type: "text/plain",
                lastModified: new Date().getTime()
            });
            files = [fakeFile]
        }
        setApiFiles(files)
        setApiUploadedCallback(true)
    }

    const fileNameFuction = (file) => {
        return file.name ? file.name : "specification"
    }

    const removeFileFunction = (fileToRemove) => {
        setApiFiles(currentFiles => currentFiles.filter(file => file !== fileToRemove));
        // TODO: Check how does this affect the backend - I believe we need to call a cancel endpoint to ensure everything works smoohtly.
        setUploaded(false)

        setApiUploadedCallback(false)
    }

    return (
        <div>
            <SimpleAccordion header={"Test configuration"} accHeaderClass={"sidebar-simple-header"} accItemClass={"sidebar-simple-item"} accIconClass={"name-icon"}>

                <Form.Label style={{ fontWeight: 'bold' }}>Name:</Form.Label>
                <Form.Control value={apiTitle} onChange={onTestConfNameChange} className="nodrag" type="text" placeholder="Enter name" />
                {settings.showTips ?
                    <Form.Text className="text-muted">
                        The name for your test configuration.
                    </Form.Text>
                    :
                    <></>}

            </SimpleAccordion>

            <p></p>

            <SimpleAccordion header={"API Upload"} accHeaderClass={"sidebar-simple-header"} accItemClass={"sidebar-simple-item"} accIconClass={"api-icon"}>

                {(uploaded === false) ?

                    <div>
                        {(apiTitle !== "") ?

                            <div>
                                <Form.Label style={{ fontWeight: 'bold', display: 'block' }}>Upload using file</Form.Label>
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
                                To upload the API specification, you must first enter the name for the test configuration.
                            </div>
                        }

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

export default ApiUploadArea;