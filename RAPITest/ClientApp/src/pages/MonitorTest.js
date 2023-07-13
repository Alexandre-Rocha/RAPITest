﻿import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService'
import 'bootstrap/dist/css/bootstrap.css'
import { Container, Row, Col, InputGroup, FormControl, Tab, Nav } from 'react-bootstrap'
import 'bootstrap';
import './MonitorTest.css'
import ModalComp from '../components/ModalComp.js'
import ModalCompEditTestName from '../components/ModalCompEditTestName.js'
import Loader from 'react-loader-spinner'
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";
import editIcon from '../assets/pencil.png'
import deleteIcon from '../assets/bin.png'
import reportIcon from '../assets/statsSmall.png'
import downloadIcon from '../assets/cloud.png'
import runIcon from '../assets/play.png'

const jsYaml = require('js-yaml')

export class MonitorTest extends Component {

    static displayName = MonitorTest.name;

    constructor(props) {
        super(props)
        this.state = {
            apis: new Map(),
            interval: null,
            onShowDeleteModal: false,
            searchByName: '',
            idToRemove: -1,
            showEditNameModal: false,
            apiTitleToEdit: ''
        }
        this.enableDeleteModal = this.enableDeleteModal.bind(this)
        this.disableDeleteModal = this.disableDeleteModal.bind(this)
        this.removeFile = this.removeFile.bind(this)
        this.Remove = this.Remove.bind(this)
        this.handleOnChange = this.handleOnChange.bind(this)
        this.checkTestCompletions = this.checkTestCompletions.bind(this)
        this.RunNow = this.RunNow.bind(this)
        this.editName = this.editName.bind(this)
        this.disableEditNameModal = this.disableEditNameModal.bind(this)
        this.newName = this.newName.bind(this)
    }

    handleOnChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    //get user apis
    async componentDidMount() {
        this.checkTestCompletions();
        this.interval = setInterval(() => this.checkTestCompletions(), 60000);
    }

    async componentWillUnmount() {
        clearInterval(this.interval);
    }

    removeFile(apiId) {
        var mapAux = this.state.apis
        mapAux.delete(apiId)
        this.setState({
            apis: mapAux
        })
    }

    //Interval to check with backend if the analysis is completed
    async checkTestCompletions() {
        const token = await authService.getAccessToken();
        const response = await fetch('MonitorTest/GetUserAPIs', {
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        var allAPIS = new Map()
        data.forEach(api => {
            if (api.NextTest === "0001-01-01T00:00:00") {
                api.NextTest = "-"
            } else {
                api.NextTest = api.NextTest.replace("T", " ").substring(0, 19)
            }
            if (api.LatestReport === "0001-01-01T00:00:00") {
                api.LatestReport = "-"
                api.Warnings = "-"
                api.Errors = "-"
            } else {
                api.LatestReport = api.LatestReport.replace("T", " ").substring(0, 19)
            }
            if (api.ErrorMessages !== null) api.ErrorMessages.pop()
            allAPIS.set(api.ApiId, api)
        })
        this.setState({ apis: allAPIS })
    }

    //redirect to Analysis
    async visualizeReport(apiId) {
        this.props.history.push(`monitorTests/report/${apiId}`)
    }

    //callback for download analysis button
    async DownloadReport(apiId, apiTitle, latestReportDate) {
        const token = await authService.getAccessToken();

        fetch(`MonitorTest/DownloadReport?` + new URLSearchParams({
            apiId: apiId,
        }), {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(response => {
            response.blob().then(blob => {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = apiTitle + '_' + latestReportDate + '.json';
                a.click();
            });
        });

    }

    enableDeleteModal(id) {
        this.setState({ onShowDeleteModal: true, idToRemove: id })
    }

    disableDeleteModal() { this.setState({ onShowDeleteModal: false }) }

    //delete a file from workspacce
    async Remove(next) {
        const token = await authService.getAccessToken();
        let apiId = this.state.idToRemove
        fetch(`MonitorTest/RemoveApi?apiId=${apiId}`, {
            method: 'DELETE',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            this.removeFile(apiId)
            next()
            this.disableDeleteModal()
        })
    }

    async RunNow(apiId, item) {
        const token = await authService.getAccessToken();

        item.RunningNow = true;
        fetch(`MonitorTest/RunNow?` + new URLSearchParams({
            apiId: apiId,
        }), {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })
        this.setState({})
    }

    async editInEditor(ApiId, APITitle) { //Navigate to Node Editor

        const token = await authService.getAccessToken();

        let tslState;
        let apiFile = {
            servers: "",
            paths: "",
            schemas: "",
            schemasValues: ""
        }

        console.log("trying fetch tsl");
        // Grab the TSL from the DB and turn into string that can be processed
        const tslResponse = await fetch(`MonitorTest/ReturnTsl?apiId=${ApiId}`, {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })
        const tslString = await tslResponse.text()

        tslState = jsYaml.load(tslString)

        console.log(tslState);

        // Grab the Spec from the DB and turn into JS obj
        const specResponse = await fetch(`MonitorTest/ReturnSpec?apiId=${ApiId}`, {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })
        const spec = await specResponse.json()

        apiFile.paths = Object.keys(spec.paths);
        
        //TODO: methods not supported in the backend, only Delete,Get,Post,Put
        /* const httpMethods = Object.values(spec.paths).flatMap(pathObj => Object.keys(pathObj))
        const uniqueHttpMethods = Array.from(new Set(httpMethods));
        const sortedHttpMethods = uniqueHttpMethods.sort();
 */
        apiFile.servers = spec.servers.map((obj) => obj.url);

        // TODO: Schema and schema values need to be checked again
        apiFile.schemas = Object.keys(spec.components.schemas);
        apiFile.schemasValues = Object.values(spec.components.schemas).map((obj) => JSON.stringify(obj));


        this.props.history.push({
            pathname: 'devEditor',
            state: { tslState, apiFile, APITitle }
        });

    }


    renderTestButtons(item) {
        if (item.ErrorMessages !== null) return <AwesomeButton type="secondary" onPress={() => this.enableDeleteModal(item.ApiId)}>Delete Test</AwesomeButton>
        if ((item.LatestReport === "-" && item.NextTest === "-") || (item.RunningNow !== undefined)) {
            return <div className="row" style={{ marginLeft: 10, marginRight: 10 }}><div style={{ marginRight: 10 }}>Running Tests..</div><Loader type="Grid" color="#00BFFF" height={35} width={35} /></div>
        }
        if (item.LatestReport === "-") {
            return (
                <div>
                    <div style={{ display: "inline-block", paddingRight: "10px" }}>
                        <AwesomeButton type="primary" onPress={() => this.RunNow(item.ApiId)}>Run Tests</AwesomeButton>
                    </div>
                    <AwesomeButton type="secondary" onPress={() => this.enableDeleteModal(item.ApiId)}>Delete Test</AwesomeButton>
                </div>
            )
        }
        return (
            <div>
                <div>
                    <div style={{ paddingLeft: "5px", paddingRight: '5px', display: "inline-block" }}>
                        <AwesomeButton className="buttonAdd" type="primary" onPress={() => this.visualizeReport(item.ApiId)}><img style={{ marginRight: "15px" }} width="50" height="50" src={reportIcon} alt="Logo" />Analyse</AwesomeButton>
                    </div>
                    <div style={{ paddingRight: '5px', display: "inline-block" }}>
                        <AwesomeButton className="buttonAdd" type="primary" onPress={() => this.DownloadReport(item.ApiId, item.APITitle, item.LatestReport)}><img style={{ marginRight: "15px" }} width="50" height="50" src={downloadIcon} alt="Logo" />Download</AwesomeButton>
                    </div>
                    <div style={{ display: "inline-block" }}>
                        <AwesomeButton className="buttonAdd" type="primary" onPress={() => this.RunNow(item.ApiId, item)}><img style={{ marginRight: "15px" }} width="50" height="50" src={runIcon} alt="Logo" />Run</AwesomeButton>
                    </div>
                </div>
                <div style={{ display: "inline-block", paddingLeft: "5px", paddingRight: "10px", paddingTop: "9px" }}>
                    <AwesomeButton className="buttonEdit" type="primary" onPress={() => this.editName(item.ApiId, item.APITitle)}><img width="50" height="50" src={editIcon} alt="Logo" /></AwesomeButton>
                </div>
                <div style={{ display: "inline-block", paddingLeft: "5px", paddingRight: "10px", paddingTop: "9px" }}>
                    <AwesomeButton className="buttonEdit" type="secondary" onPress={() => this.enableDeleteModal(item.ApiId)}><img width="50" height="50" src={deleteIcon} alt="Logo" /></AwesomeButton>
                </div>
                <div style={{ display: "inline-block", paddingLeft: "5px", paddingRight: "10px", paddingTop: "9px" }}>
                    {/* <button onClick={this.editInEditor}>
                        <Link to="/devEditor">Edit in Workflow Editor</Link>
                    </button>
                    <button onClick={this.editInEditor}>
                        <Link to={{ pathname: '/devEditor', state: { objectData: { a: "www" } } }}>Go to About</Link>
                    </button> */}
                    {/* <button onClick={() => this.editInEditor(item.ApiId, item.APITitle, item.LatestReport)}>
                        Edit in Workflow editor
                    </button> */}
                    <AwesomeButton className="buttonAdd" type="primary" onPress={() => this.editInEditor(item.ApiId, item.APITitle, item.LatestReport)}><img style={{ marginRight: "15px" }} width="50" height="50" src={editIcon} alt="Logo" />Edit in Workflow editor</AwesomeButton>
                </div>{/*  TODO:HERE */}
            </div>
        )
    }




    renderMetaData(item) {
        if (item.ErrorMessages !== null) {
            return (
                <div style={{ marginBottom: "10px" }}>
                    <h4>Validation failed with the following errors:</h4>
                    <ul className="list-group">
                        {item.ErrorMessages.map((item, i) => {
                            return <li key={i} className="list-group-item">{item}</li>
                        })}
                    </ul>
                </div>
            )
        }
        //TODO:remove button editor
        return (
            <table className="table table-striped">
                <tbody>
                    <tr><th>Errors</th><td>{item.Errors}</td></tr>
                    <tr><th>Warnings</th><td>{item.Warnings}</td></tr>
                    <tr><th>Latest Report</th><td>{item.LatestReport}</td></tr>
                    <tr><th>Next Test</th><td>{item.NextTest}</td></tr>
                    {/* <AwesomeButton className="buttonAdd" type="primary" onPress={() => this.editInEditor(item.ApiId, item.APITitle, item.LatestReport)}><img style={{ marginRight: "15px" }} width="50" height="50" src={editIcon} alt="Logo" />Edit in Workflow editor</AwesomeButton> */}
                </tbody>
            </table>
        )
    }

    editName(apiId, apiTitle) {
        this.setState({ apiTitleToEdit: apiTitle, idToRemove: apiId, showEditNameModal: true })
    }

    async newName(name) {
        const token = await authService.getAccessToken();
        fetch(`MonitorTest/ChangeApiTitle?` + new URLSearchParams({
            apiId: this.state.idToRemove,
            newTitle: name
        }), {
            method: 'PUT',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(resp => {
            if (resp.ok) {
                let aux = this.state.apis
                aux.forEach((value, key) => {
                    if (value.ApiId === this.state.idToRemove) {
                        value.APITitle = name
                    }
                })
                this.setState({ apis: aux, showEditNameModal: false })
            }
        })

    }

    disableEditNameModal() { this.setState({ showEditNameModal: false }) }

    render() {

        return (
            <div style={{ minHeight: "808px" }}>
                <div>
                    <h1 className="row justify-content-md-center" style={{ width: "100%" }}>Monitor Tests</h1>
                    <h4 className="row justify-content-md-center" style={{ marginTop: 25, width: "100%" }}>Search, Analyse and Visualize.</h4>
                </div>
                <Container style={{ marginTop: "20px" }}>
                    <Tab.Container id="list-group-tabs-example">
                        <Row>
                            <Col>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text id="basic search">{
                                        <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z" />
                                            <path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
                                        </svg>
                                    }</InputGroup.Text>
                                    <FormControl placeholder="Search by name ..." name="searchByName" type="text" onChange={this.handleOnChange} />
                                </InputGroup>

                                <Nav variant="pills" className="flex-column">
                                    {Array.from(this.state.apis).map(([key, item]) => {
                                        if (item.APITitle.toLowerCase().includes(this.state.searchByName.toLowerCase()))
                                            return <div style={{ paddingBottom: "5px" }} key={key}><Nav.Item className="testItem" style={{ borderColor: "#dfdfdf", borderStyle: "solid", borderRadius: "7px", boxShadow: "1px 3px 1px #9E9E9E" }} >
                                                <Nav.Link style={{}} eventKey={"#details-" + item.ApiId}><svg className="bi bi-file-text" width="100" height="35" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" ><path fillRule="evenodd" d="M4 1h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2zm0 1a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V3a1 1 0 00-1-1H4z" clipRule="evenodd" /><path fillRule="evenodd" d="M4.5 10.5A.5.5 0 015 10h3a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 8h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 6h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 4h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5z" clipRule="evenodd" /></svg>{item.APITitle.length > 55 ? item.APITitle.substring(0, 52) + '...' : item.APITitle}</Nav.Link>
                                            </Nav.Item></div>
                                        return <div key={key}></div>
                                    })}
                                </Nav>

                            </Col>
                            <Col>
                                <Tab.Content>
                                    {Array.from(this.state.apis).map(([key, item]) => {
                                        return <Tab.Pane key={key} style={{ borderColor: "#45ABD1", borderStyle: "solid", borderRadius: "20px", padding: 7, boxShadow: "1px 3px 1px #9E9E9E" }} eventKey={"#details-" + item.ApiId} aria-labelledby={'list-' + item.APITitle}>
                                            {this.renderMetaData(item)}
                                            {this.renderTestButtons(item)}
                                        </Tab.Pane>
                                    })}
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                    <ModalComp
                        title="Delete Test"
                        body="Are you sure you want to delete this test. This will delete everything related to the test."
                        okButtonText="Delete"
                        okButtonFunc={this.Remove}
                        cancelButtonFunc={this.disableDeleteModal}
                        visible={this.state.onShowDeleteModal}
                    />
                    <ModalCompEditTestName
                        okButtonFunc={this.newName}
                        cancelButtonFunc={this.disableEditNameModal}
                        visible={this.state.showEditNameModal}
                        currentName={this.state.apiTitleToEdit}
                    />
                </Container>
            </div>
        )
    }
}


/*<ListGroup.Item key={key} id={'list-' + item.apiTitle} action href={"#details-" + item.apiTitle}>
    <svg className="bi bi-file-text" width="100" height="35" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" ><path fillRule="evenodd" d="M4 1h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2zm0 1a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V3a1 1 0 00-1-1H4z" clipRule="evenodd" /><path fillRule="evenodd" d="M4.5 10.5A.5.5 0 015 10h3a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 8h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 6h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 4h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5z" clipRule="evenodd" /></svg>
    {item.apiTitle.length > 55 ? item.apiTitle.substring(0, 52) + '...' : item.apiTitle}
</ListGroup.Item>*/