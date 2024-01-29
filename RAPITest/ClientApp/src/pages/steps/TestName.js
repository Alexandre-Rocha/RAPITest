import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
import { warningMessage } from '../../components/AlertComp'
import { Row, Col, Figure } from 'react-bootstrap'
import thinkingIcon from '../../assets/thinking.webp'
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";
import continueIcon from '../../assets/continue.png'

import editIcon from '../../assets/pencil.png' //TODO: here

import { withRouter } from 'react-router-dom'; //TODO: use this to navigat to editor

import { Link } from 'react-router-dom/cjs/react-router-dom';
import { NavLink } from 'react-bootstrap';

class TestName extends Component {

    constructor(props) {    // todo eu added props

        super(props)    //todo eu added props

        this.state = {
            name: "",
            showWarning: false,
            warningMessage: ""
        }

        this.finalizeCallback = this.finalizeCallback.bind(this)
        this.closeWarning = this.closeWarning.bind(this)
        this.editInEditor = this.editInEditor.bind(this);

    }

    componentDidMount() {
        console.log("propes");
        console.log(this.props);
      }

    finalizeCallback() {
        let formString = document.getElementById("formBasicEmail").value
        if (formString.length === 0) {
            this.setState({ showWarning: true, warningMessage: "Please fill out the required form" })
            return <div></div>
        }
        if (formString.length > 40) {
            this.setState({ showWarning: true, warningMessage: "Limit of 40 characters exceeded" })
            return <div></div>
        }
        var format = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
        if (format.test(formString)) {
            this.setState({ showWarning: true, warningMessage: "Invalid characters, no special characters allowed" })
        } else {
            this.props.handlerName(formString)
        }
    }

    closeWarning() {
        this.setState({ showWarning: false })
    }

    editInEditor() {
/*         window.location.href = '/devEditor'; //TODO: this works but can be better
 */    this.props.history.push('/editor');
    }

    render() {
        return (
            <div>
                {this.state.showWarning ? warningMessage(this.state.warningMessage, this.closeWarning) : <div></div>}
                <Row>
                    <Col sm={4}>
                        <Form>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>API Test Name</Form.Label>
                                <Form.Control placeholder="Enter Name" />
                                <Form.Text className="text-muted">
                                    The name of the API you want to test.
                                </Form.Text>
                            </Form.Group>
                        </Form>
                        <div style={{ textAlign: "center" }}>
                            <AwesomeButton type="primary" onPress={() => this.finalizeCallback()}><img style={{ marginRight: "10px" }} width="30" height="30" src={continueIcon} alt="Logo" />Continue</AwesomeButton>
                        </div>
                        <br></br>
                        <br></br>

                        <div style={{ backgroundColor: "rgba(255, 165, 0, 0.4)", display: "flex", flexDirection: "column", alignItems: "center", padding: "10px" }}>


                            <div style={{ marginTop: "20px", marginBottom: "20px", textAlign: "center" }}>
                                You can set up your test configuration using the 5-steps approach, or you can do everything in the Workflow Editor instead!
                            </div>

                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <AwesomeButton className="buttonAdd" type="primary" onPress={() => this.editInEditor()}><img style={{ marginRight: "15px" }} width="50" height="50" src={editIcon} alt="Logo" />Go to Workflow Editor</AwesomeButton>
                            </div>

                            <br></br>
                        </div>


                    </Col>
                    <Col sm={8}>
                        <Figure style={{ padding: "100px 0px 0px 250px" }}>
                            <Figure.Image
                                width={400}
                                height={400}
                                alt="400x400"
                                src={thinkingIcon}
                            />
                            <Figure.Caption>
                            </Figure.Caption>
                        </Figure>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default withRouter(TestName)