import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap';
import { ListGroup, Row, Col } from 'react-bootstrap'
import './css/AcceptedFilesList.css';

export default class AcceptedFilesList extends Component {

    render() {
        let title = this.props.title
        let files = this.props.files
        let symbol = this.props.symbol
        let toShow = this.props.toShow
        let removeSymbol = this.props.removeSymbol
        let removeFunction = this.props.removeFunction

        return (
            <div>
                <div>{files.length === 0 ? <div></div> : <span style={{ fontWeight: 'bold' }}>{title}</span>}</div>
                <ListGroup as="ol">
                    {
                        files.map((f, i) => <ListGroup.Item as="li" key={i}>
                            <Row>
                                <Col sm={2}>
                                    <img style={{ marginRight: "15px" }} width="32" height="32" src={symbol} alt="Logo" />
                                </Col>
                                <Col sm={8}>
                                    {toShow(f)}
                                </Col>
                                <Col sm={2}>
                                    <div className="removeFileIcon" onClick={() => removeFunction(f)}>
                                        <img width="32" height="32" src={removeSymbol} alt="Logo" />
                                    </div>
                                </Col>
                            </Row>
                        </ListGroup.Item>)
                    }
                </ListGroup>
            </div>
        )
    }
}