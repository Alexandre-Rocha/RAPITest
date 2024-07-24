import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
import { Row, Col, Form } from 'react-bootstrap';
import Dropzone from '../../../components/Dropzone';
// import './UploadFile.css';
import { warningMessage, dangerMessage } from '../../../components/AlertComp';
import authService from '../../api-authorization/AuthorizeService';
import Loader from 'react-loader-spinner';
import { AwesomeButton } from 'react-awesome-button';
import ListGroupComp from '../../../components/ListGroupComp';
import successIcon from '../../../assets/tickSmall.png';
import binIcon from '../../../assets/bin.png';
import uploadIcon from '../../../assets/uploadSmall.png';

import { useSettings } from './SettingsContext';

const delay = ms => new Promise(res => setTimeout(res, ms));

const SmallApiUpload = (props) => {

    const { settings } = useSettings();

    const [state, setState] = useState({
        showInput: true,
        showDanger: false,
        showWarning: false,
        warningMessage: "",
        files: []
    });

    const onDrop = async (accept, reject) => {
        console.log("DropCallback");
        if (reject.length !== 0 || accept.length > 1) {
            setState({ ...state, showWarning: true, warningMessage: "Please upload only one yaml or json file" });
        } else {
            setState({ ...state, showInput: false });

            let data = new FormData();
            data.append('apiSpecification', accept[0]);
            data.append('title', props.apiTitle);
            console.log("gonna get auth token");
            const token = await authService.getAccessToken();
            console.log("gonna fetch");
            fetch(`SetupTest/GetSpecificationDetails`, {
                method: 'POST',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
                body: data
            }).then(async (res) => {
                if (!res.ok) {
                    await delay(2000);
                    console.log("Error uploading API");
                    setState({ ...state, showDanger: true, showInput: true });
                } else {
                    await delay(2500);
                    console.log("API uploaded");
                    res.json().then(response => {
                        let aux = accept.concat(state.files);
                        setState({ ...state, files: aux });
                        props.handlerAPI(response.Paths, response.Servers, response.Schemas, response.SchemasValues, aux);
                    });
                }
            });
        }
    };

    const uploadURL = async () => {
        let formString = document.getElementById("formURL").value;
        if (formString.length === 0) {
            setState({ ...state, showWarning: true, warningMessage: "Please fill out the required form" });
            return;
        }

        setState({ ...state, showInput: false });

        let data = new FormData();
        data.append('apiSpecification', formString);
        data.append('title', props.apiTitle);
        const token = await authService.getAccessToken();
        fetch(`SetupTest/GetSpecificationDetailsURL`, {
            method: 'POST',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
            body: data
        }).then(async (res) => {
            if (!res.ok) {
                console.log("Error uploading API");
                await delay(2000);
                setState({ ...state, showDanger: true, showInput: true });
            } else {
                await delay(2500);
                console.log("API uploaded");
                res.json().then(response => {
                    props.handlerAPI(response.Paths, response.Servers, response.Schemas, response.SchemasValues);
                });
            }
        });
    };

    const closeWarning = () => setState({ ...state, showWarning: false });
    const closeDanger = () => setState({ ...state, showDanger: false });

    return (
        <div>
            {state.showWarning ? warningMessage(state.warningMessage, closeWarning) : <div></div>}
            {state.showDanger ? dangerMessage("Error while validating OpenAPI Specification, please upload a valid specification", closeDanger) : <div></div>}
            {state.showInput && <div>
                <Row>
                    <div className="root-dropzone">
                        <Dropzone className="sidebar-dropzone"
                            accept=".yaml, .json"
                            onDrop={onDrop}
                            history={props.history}
                            text={
                                <div align="center">
                                    <p>Upload API specification</p>
                                    <p>(.yaml or .json)</p>
                                </div>}
                        />
                    </div>
                </Row>

                <p></p>
                <div>
                    <Form.Label style={{ fontWeight: 'bold' }}>Upload using URL</Form.Label>
                    <Form.Control id="formURL" className="nodrag" type="text" placeholder="Enter API URL" />
                    {settings.showTips ?
                        <Form.Text className="text-muted">
                            The URL of the OpenAPI Specification you want to test. Should point to a .json or .yaml file.
                        </Form.Text>
                        :
                        <></>}
                </div>
                <AwesomeButton className="buttonAdd" style={{ marginTop: '10px' }} type="primary" onPress={uploadURL}><img style={{ marginRight: "15px" }} width="36" height="36" src={uploadIcon} alt="Logo" />Upload URL file</AwesomeButton>
            </div>}
            {!state.showInput && <div>
                <div>
                    Please wait while API specification is processed...
                </div>
                <div>
                    <Col>
                        <Loader type="Grid" color="#00BFFF" height={55} width={55} />
                    </Col>
                </div>
            </div>}
        </div>
    );
};

export default SmallApiUpload;
