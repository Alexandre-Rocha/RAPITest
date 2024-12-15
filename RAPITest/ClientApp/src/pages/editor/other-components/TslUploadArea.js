import React from 'react';
import { useState } from "react"

import SimpleAccordion from './SimpleAccordion';

import Dropzone from "../../../components/Dropzone"

import { Form } from 'react-bootstrap';

import AcceptedFilesList from './AcceptedFilesList';

import successIcon from '../../../assets/tickSmall.png'
import binIcon from '../../../assets/bin.png'

import { useSettings } from './SettingsContext';

const TslUploadArea = (props) => {

    const { settings } = useSettings()

    const [uploaded, setUploaded] = useState(props.uploaded)

    const [tslFiles, setTslFiles] = useState([]) //only 1 allowed, this is for ease for display because of listgroup component

    const { onDropTsl } = props

    const { apiUploaded } = props


    const newOnDropTsl = (accept, reject) => {

        if (reject.length !== 0 || accept.length > 1) {
            alert("Invalid - Please upload a single .yaml file")
            return
        }

        /*
        TODO: It would probably be a good idea to validate the TSL here.
        It is already validated in the backend, but validation here would be useful as well.
        The utils file has functions that should be useful for this, but they are incomplete and require more testing so we are not doing it for now.
        */

        onDropTsl(accept, reject)
        setUploaded(true)
        setTslFiles(accept)

    }

    const fileNameFuction = (file) => {
        return file.name
    }

    const removeFileFunction = (fileToRemove) => {
        setTslFiles(currentFiles => currentFiles.filter(file => file !== fileToRemove));
        setUploaded(false)
    }

    return (

        <div>

            <SimpleAccordion header={"Upload TSL file"} accHeaderClass={"sidebar-simple-header"} accItemClass={"sidebar-simple-item"} accIconClass={"tsl-icon"}>

                {(uploaded === false) ?
                    <div>
                        {
                            (apiUploaded === true) ?

                                <div>
                                    <div style={{ fontWeight: 'bold' }}>Upload a TSL file</div>

                                    {settings.showTips ?
                                        <Form.Text className="text-muted">
                                            <span> Uploading a TSL file will recreate the Editor state. If you do this, all</span> <span style={{ fontWeight: 'bold' }}> current nodes will be deleted!</span>
                                        </Form.Text>
                                        :
                                        <></>}

                                    <Dropzone className="sidebar-dropzone"
                                        accept=".yaml"
                                        onDrop={newOnDropTsl}
                                        text={
                                            <div align="center">
                                                <p>Upload TSL (.yaml)</p>
                                            </div>}
                                    />
                                </div>

                                :
                                <div>To upload a TSL file, first upload the API specification.</div>

                        }

                    </div>
                    :

                    <div>
                        <span style={{ fontWeight: 'bold' }}>TSL uploaded!</span> <span> If you want to upload another TSL file, delete the already uploaded one below.</span>
                    </div>}

                <p></p>

                <AcceptedFilesList
                    title="Uploaded file:"
                    files={tslFiles}
                    symbol={successIcon}
                    toShow={fileNameFuction}
                    removeSymbol={binIcon}
                    removeFunction={removeFileFunction}></AcceptedFilesList>



            </SimpleAccordion>

        </div>
    );
};

export default TslUploadArea;