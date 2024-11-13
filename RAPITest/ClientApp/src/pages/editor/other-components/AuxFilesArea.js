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

    const { settings } = useSettings()

    const [uploadedDic, setUploadedDic] = useState(props.uploadedDic)

    const [uploadedDLL, setUploadedDLL] = useState(props.uploadedDll)

    //const [dic, setDic] = useState()

    const [dllArr, setDllArr] = useState([])

    const { apiUploaded } = props


    //const [files, setFiles] = useState([])

    const [dicFiles, setDicFiles] = useState(props.dictFile ? [props.dictFile] : [])
    const [dllFiles, setDllFiles] = useState(props.dllFiles || [])

    console.log("aux area dll files: ", dllFiles);


    const fileNameFuction = (file) => {
        return (<div>{file.name}</div>)
    }

    const removeFileFunctionDict = (fileToRemove) => {
        setDicFiles(currentFiles => currentFiles.filter(file => file !== fileToRemove));
        setUploadedDic(false)
    }

    const removeFileFunctionDLL = (fileToRemove) => {
        setDllFiles(currentFiles => currentFiles.filter(file => file !== fileToRemove));
        setDllArr(currentFiles => currentFiles.filter(file => file !== fileToRemove)) //TODO: this is duplicate, can remove dllArr
    }


    const onDropDic = (accept, reject) => {
        if (reject.length !== 0 || accept.length > 1) {
            alert("WIP- one txt file only!")
        }

        const txtFile = accept[0];

        onDictionaryDrop(txtFile)
        //setDic(txtFile)
        setUploadedDic(true)

        setDicFiles(currentFiles => [...currentFiles, ...accept]);
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

        setDllFiles(currentFiles => [...currentFiles, ...accept]);
    }

    console.log("auxarea uploadedDic: ", uploadedDic);

    return (
        <div>

            <div>
                {(apiUploaded === true) ?

                    <div>
                        {(uploadedDic === false) ?

                            <div>
                                <div style={{ fontWeight: 'bold' }}>Upload a Dictionary file</div>

                                {settings.showTips ?
                                    <Form.Text className="text-muted">
                                        Dictionary files are .txt files where you can define data such as schemas or body payloads to use in the tests.
                                    </Form.Text>
                                    :
                                    <></>}

                                <div className="root-dropzone sidebar-dropzone">
                                    <Dropzone className="sidebar-dropzone"
                                        accept=".txt"
                                        onDrop={onDropDic}
                                        text={
                                            <div align="center">
                                                <p>Upload Dictionary (.txt)</p>
                                            </div>}
                                    />
                                </div>
                            </div>

                            :

                            <div><span style={{ fontWeight: 'bold' }}>Dictionary uploaded!</span> <span> If you want to upload another dictionary, delete the already uploaded one below.</span></div>}

                        <p></p>


                        <div style={{ fontWeight: 'bold' }}>Upload Custom Verification files</div>

                        {settings.showTips ?
                            <Form.Text className="text-muted">
                                <span> If the provided verifications aren't enough, you can implement your own and use them with the Custom Verification node.</span> <span style={{ fontWeight: 'bold' }}> Make sure you trust the DLL file!</span>
                            </Form.Text>
                            :
                            <></>}

                        <div className="root-dropzone">

                            <Dropzone className="sidebar-dropzone"
                                accept=".dll"
                                onDrop={onDropDll}
                                text={
                                    <div align="center">
                                        <p>Upload Custom Verification (.dll)</p>
                                    </div>}
                            />

                        </div>

                        <AcceptedFilesList
                            title="Dictionary File"
                            files={dicFiles}
                            symbol={successIcon}
                            toShow={fileNameFuction}
                            removeSymbol={binIcon}
                            removeFunction={removeFileFunctionDict}></AcceptedFilesList>

                        <AcceptedFilesList
                            title="Custom Verification Files"
                            files={dllFiles}
                            symbol={successIcon}
                            toShow={fileNameFuction}
                            removeSymbol={binIcon}
                            removeFunction={removeFileFunctionDLL}></AcceptedFilesList>


                    </div>

                    :

                    <div>

                        To upload auxiliary files, first upload the API specification.
                    </div>

                }
            </div>


        </div>
    )
}

export default AuxFilesArea