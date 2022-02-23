﻿import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap';
import { ListGroup, Row, Col } from 'react-bootstrap'

export default class ListGroupComp extends Component {

    render() {
        let title = this.props.title
        let files = this.props.files
        let symbol = this.props.symbol
        let toShow = this.props.toShow

        return (
            <div>
                <h4>{files.length === 0 ? <div></div> : title}</h4>
                <ListGroup as="ol">
                    {
                        files.map((f, i) => <ListGroup.Item as="li" key={i}>
                            <Row>
                                <Col sm={2}>
                                    {symbol}
                                </Col>
                                <Col sm={10}>
                                    {toShow(f)}
                                </Col>
                            </Row>
                        </ListGroup.Item>)
                    }
                </ListGroup>
            </div>
        )
    }
}