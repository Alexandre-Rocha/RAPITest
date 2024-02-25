import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
import { Row, Col } from 'react-bootstrap'
import Dropzone from '../../../components/Dropzone';
//import './UploadFile.css';
import { warningMessage, dangerMessage } from '../../../components/AlertComp'
import authService from '../../api-authorization/AuthorizeService';
import Loader from 'react-loader-spinner'


const delay = ms => new Promise(res => setTimeout(res, ms));

export class SmallApiUpload extends Component {

    constructor() {

        super()

        this.state = {
            showInput: true,
            showDanger: false,
            showWarning: false,
            warningMessage: ""
        }

        this.onDrop = this.onDrop.bind(this)
        this.closeWarning = this.closeWarning.bind(this)
        this.closeDanger = this.closeDanger.bind(this)
        this.uploadURL = this.uploadURL.bind(this)
    }

    //callback for dropzone
    onDrop(accept, reject) {
        console.log("DropCallback");
        if (reject.length !== 0 || accept.length > 1) {
            this.setState({ showWarning: true, warningMessage: "Please upload only one yaml or json file" })
        }
        else {
            this.setState({ showInput: false }, async () => {

                let data = new FormData();
                data.append('apiSpecification', accept[0]);
                data.append('title', this.props.apiTitle);
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
                        this.setState({ showDanger: true, showInput: true })
                    }
                    else {
                        await delay(2500);
                        console.log("API uploaded");
                        res.json().then(response => {
                            this.props.handlerAPI(response.Paths, response.Servers, response.Schemas, response.SchemasValues)
                        })
                    }
                })
            })
        }
    }

    uploadURL() {
        let formString = document.getElementById("formURL").value
        if (formString.length === 0) {
            this.setState({ showWarning: true, warningMessage: "Please fill out the required form" })
            return
        }

        this.setState({ showInput: false }, async () => {
            let data = new FormData();
            data.append('apiSpecification', formString);
            data.append('title', this.props.apiTitle);
            const token = await authService.getAccessToken();
            fetch(`SetupTest/GetSpecificationDetailsURL`, {
                method: 'POST',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
                body: data
            }).then(async (res) => {
                if (!res.ok) {
                    console.log("Error uploading API");
                    await delay(2000);
                    this.setState({ showDanger: true, showInput: true })
                }
                else {
                    await delay(2500);
                    console.log("API uploaded");
                    res.json().then(response => {
                        this.props.handlerAPI(response.Paths, response.Servers, response.Schemas, response.SchemasValues)
                    })
                }
            })
        })
    }

    closeWarning() {
        this.setState({ showWarning: false })
    }

    closeDanger() {
        this.setState({ showDanger: false })
    }

    render() {
        return (
            <div>
                {this.state.showWarning ? warningMessage(this.state.warningMessage, this.closeWarning) : <div></div>}
                {this.state.showDanger ? dangerMessage("Error while validating OpenAPI Specification, please upload a valid specification", this.closeDanger) : <div></div>}
                {this.state.showInput && <div>
                    <Row>
                        <div className="root-dropzone">
                            <Dropzone className="sidebar-dropzone"
                                accept=".yaml, .json"
                                onDrop={this.onDrop}
                                history={this.props.history}
                                text={
                                    <div align="center">
                                        <p>Upload API specification</p>
                                        <p>(.yaml or .json)</p>
                                    </div>}
                                />
                        </div>
                    </Row>
                </div>}
                {!this.state.showInput && <div>
                    <Row>
                        <Col>
                            <Loader type="Grid" color="#00BFFF" height={55} width={55} />
                        </Col>
                    </Row>
                </div>}
                
             </div>
             
        )
    }
}