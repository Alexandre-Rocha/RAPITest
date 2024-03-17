import React from "react"
import Dropzone from "../../../components/Dropzone"
import { useState } from "react"

import '../nodes/css/workflowNode.css'
import '../nodes/css/generalNode.css'

import './css/sidebar.css'; // Create this CSS file for styling


import ListGroupComp from '../../../components/ListGroupComp';

import successIcon from '../../../assets/tickSmall.png'
import binIcon from '../../../assets/bin.png'
import AcceptedFilesList from "./AcceptedFilesList"

import { useSettings } from "./SettingsContext"

import { Form } from "react-bootstrap"


function AuxFilesArea(props) {

    const { onDictionaryDrop, onDllDrop } = props

    const {settings} = useSettings()

    const [uploadedDic, setUploadedDic] = useState(false)

    const [uploadedDLL, setUploadedDLL] = useState(false)

    //const [dic, setDic] = useState()

    const [dllArr, setDllArr] = useState([])


    const [files, setFiles] = useState([])


    const fileNameFuction = (file) => {
        //return "file test"
        return (<div>{file.name}</div>)
    }

    const removeFileFunction = (fileToRemove) => {
        setFiles(currentFiles => currentFiles.filter(file => file !== fileToRemove));
    }


    const onDropDic = (accept, reject) => {
        if (reject.length !== 0 || accept.length > 1) {
            alert("WIP- one txt file only!")
        }

        const txtFile = accept[0];

        onDictionaryDrop(txtFile)
        //setDic(txtFile)
        setUploadedDic(true)

        setFiles(currentFiles => [...currentFiles, ...accept]);


    }

    const onDropDll = (accept, reject) => {
        if (reject.length !== 0) {
            alert("WIP- dll files only!")
            return
        }

        const dllFile = accept[0]
        let fileName = dllFile.name

        if (dllArr.some(file => file.name === fileName)) {
            alert("already exists!")
            return
        }

        let newDllArr = [...dllArr, dllFile]

        onDllDrop(newDllArr)
        setDllArr(newDllArr);
        setUploadedDLL(true)

        setFiles(currentFiles => [...currentFiles, ...accept]);
    }


    return (
        <div>
            <div style={{ fontWeight: 'bold' }}>Upload a TSL file</div>

            {settings.showTips ?
                <Form.Text className="text-muted">
                    <span> Uploading a TSL file will recreate the Editor state. If you do this, all</span> <span style={{ fontWeight: 'bold' }}> current nodes will be deleted!</span>
                </Form.Text>
                :
                <></>}

            <div className="root-dropzone sidebar-dropzone">
                {(uploadedDic === false) ?
                    <Dropzone className="sidebar-dropzone"
                        accept=".txt"
                        onDrop={onDropDic}
                        text={
                            <div align="center">
                                <p>Upload Dictionary (.txt)</p>
                            </div>}
                    />
                    : <div>Dictionary uploaded! (WIP)</div>
                }
            </div>

            <p></p>


            <div style={{ fontWeight: 'bold' }}>Upload a TSL file</div>

            {settings.showTips ?
                <Form.Text className="text-muted">
                    <span> Uploading a TSL file will recreate the Editor state. If you do this, all</span> <span style={{ fontWeight: 'bold' }}> current nodes will be deleted!</span>
                </Form.Text>
                :
                <></>}

            <div className="root-dropzone">

                {(uploadedDLL === false) ?
                    <Dropzone className="sidebar-dropzone"
                        accept=".dll"
                        onDrop={onDropDll}
                        text={
                            <div align="center">
                                <p>Upload Custom Verification (.dll)</p>
                            </div>}
                    />
                    : <div>
                        Dll uploaded! (WIP)
                        Upload another: (WIP)
                        <Dropzone className="sidebar-dropzone"
                            accept=".dll"
                            onDrop={onDropDll}
                            text={
                                <div align="center">
                                    <p>Upload Custom Verification (.dll)</p>
                                </div>}
                        />

                    </div>
                }

            </div>

            <AcceptedFilesList
                title="Accepted Files"
                files={files}
                symbol={successIcon}
                toShow={fileNameFuction}
                removeSymbol={binIcon}
                removeFunction={removeFileFunction}></AcceptedFilesList>

        </div>
    )
}

export default AuxFilesArea