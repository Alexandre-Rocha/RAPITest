import React from "react"
import { SmallApiUpload } from "./SmallApiUpload"
import NodeArea from "./ButtonArea"
import TimerSettings from "./TimerSettings"
import ApiUploadArea from "./ApiUploadArea"
import ButtonArea from "./ButtonArea"

import Dropzone from "react-dropzone"

import { useState } from "react"

import { Accordion } from 'react-bootstrap';
import { Form } from 'react-bootstrap';


import '../nodes/css/workflowNode.css'
import '../nodes/css/generalNode.css'

import './css/sidebar.css'; // Create this CSS file for styling

import menu from '../../../assets/burger-menu-svgrepo-com.svg'

function Sidebar(props) {


    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed((prevState) => !prevState);
    };

    const { onRunGeneratedChange, onRunImmediatelyChange, onRunIntervalChange } = props

    const { apiTitle, handlerAPI } = props

    const { onTestConfNameChange } = props

    const { buttonsArray } = props

    const { className } = props
    //TODO: maybe eventualmentepor accordions nas sectoes p serem colapsibles


    const onDropDic = (accept, reject) => {
         if (reject.length !== 0 || accept.length > 1) {
            //this.setState({ showWarning: true, warningMessage: "Please upload only one .txt file" })
            alert("WIP- one txt file only!")
        }
        /*else {

            if (this.findDuplicate(accept, this.state.acceptDIC)) {
                this.setState({ showWarning: true, warningMessage: "One or more of the uploaded files was already uploaded" })
                return
            }

            this.setState({ acceptDIC: accept, transitionDIC: true  })
        } */

        const txtFile = accept[0]; // Assuming you're only allowing one file to be dropped
      
        if (txtFile) {
          const reader = new FileReader();
  
          reader.onload = (event) => {
            const fileContents = event.target.result;
            // Do something with fileContents, like displaying it in your component
            console.log(fileContents);
          };
  
          reader.readAsText(txtFile);
        }
    }

    const onDropDll = (accept, reject) => {
        if (reject.length !== 0 ) {
            //this.setState({ showWarning: true, warningMessage: "Please upload only one .txt file" })
            alert("WIP- dll files only!")
        }
        /* else {

            if (this.findDuplicate(accept, this.state.acceptDIC)) {
                this.setState({ showWarning: true, warningMessage: "One or more of the uploaded files was already uploaded" })
                return
            }

            this.setState({ acceptDIC: accept, transitionDIC: true  })
        } */

        console.log("dll dropped");
    }

    return (
        <div className={`collapsible-sidebar ${isCollapsed ? 'collapsed' : ''} `}>

            <button className="toggle-button" onClick={toggleSidebar}>
                {/* {isCollapsed? "+" : "-"} */}
                <img src={menu} alt="Menu Icon" width="35" height="35" />
            </button>
            {/* TODO: uploaded hardocded false */}
            <div className={className}>

                <div className="root-dropzone">
                    <Dropzone accept=".txt" onDrop={onDropDic}>
                        {({ getRootProps, getInputProps }) => (
                                <div
                                    {...getRootProps({
                                        className: 'dropzone'
                                    })}
                                >
                                    <input {...getInputProps()} />
                                    <p>TXT - Drag 'n' drop some files here, or click to select files</p>
                                </div>
                        )}
                    </Dropzone>
                </div>


                <div className="root-dropzone">
                    <Dropzone accept=".dll" onDrop={onDropDll}>
                        {({ getRootProps, getInputProps }) => (
                                <div
                                    {...getRootProps({
                                        className: 'dropzone'
                                    })}
                                >
                                    <input {...getInputProps()} />
                                    <p>DLL - Drag 'n' drop some files here, or click to select files</p>
                                </div>
                        )}
                    </Dropzone>
                </div>


                <ApiUploadArea
                    uploaded={false}
                    apiTitle={apiTitle}
                    handlerAPI={handlerAPI}
                    onTestConfNameChange={onTestConfNameChange}>
                </ApiUploadArea>

                <TimerSettings
                    onRunGeneratedChange={onRunGeneratedChange}
                    onRunImmediatelyChange={onRunImmediatelyChange}
                    onRunIntervalChange={onRunIntervalChange}>
                </TimerSettings>

                <ButtonArea buttonsArray={buttonsArray}></ButtonArea>

            </div>
        </div>
    )
}

export default Sidebar