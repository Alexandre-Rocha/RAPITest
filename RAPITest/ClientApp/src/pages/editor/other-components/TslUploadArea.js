import React from 'react';
import { useState } from "react"

import { SmallApiUpload } from './SmallApiUpload';

import SimpleAccordion from './SimpleAccordion';

import Dropzone from "../../../components/Dropzone"

import { Form } from 'react-bootstrap';

import AcceptedFilesList from './AcceptedFilesList';
import ListGroupComp from '../../../components/ListGroupComp';

import successIcon from '../../../assets/tickSmall.png'
import binIcon from '../../../assets/bin.png'



const TslUploadArea = (props) => {


    const [uploaded, setUploaded] = useState(props.uploaded)

    const [tslFiles, setTslFiles] = useState([]) //only 1 allowed, this is for ease for display because of listgroup component

    const { apiTitle, handlerAPI } = props

    const { onDropTsl } = props


    const newOnDropTsl = (accept, reject) => {

        if (reject.length !== 0 || accept.length > 1) {
            alert("WIP- one yaml file only!")
            return
        }

        //TODO: validate TSL

        onDropTsl(accept,reject)
        setUploaded(true)
        setTslFiles(accept) 
        console.log("finished newOnDropTsl");

    }

    const fileNameFuction = (file) => {
        //return "file test"
        console.log(file);
        return file.name
    }

    const removeFileFunction = (fileToRemove) => {
        setTslFiles(currentFiles => currentFiles.filter(file => file !== fileToRemove));
        //if api file is removed, enable dropzone again
        //TODO: how does this affect the backedn tho? uploading, removing, uploading, etc..
        //need to call some endpoint to cancel?
        setUploaded(false)
    }

    //TODO: label css class instead of inline
    return (

        <div>

            <SimpleAccordion header={"Upload TSL file"} accHeaderClass={"sidebar-simple-header"} accItemClass={"sidebar-simple-item"} accIconClass={"tsl-icon"}>             

                {(uploaded === false) ?
                    <div>
                        <span style={{ fontWeight: 'bold' }}>Upload a TSL file</span> <span>  to recreate the Editor state. If you do this, all</span> <span style={{ fontWeight: 'bold' }}> current nodes will be deleted!</span>
                        <Dropzone className="sidebar-dropzone"
                    accept=".yaml"
                    onDrop={newOnDropTsl}
                    text={
                        <div align="center">
                            <p>Upload TSL (.yaml)</p>
                        </div>}
                />

                    </div>
                    : <div>
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