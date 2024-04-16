import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function MyTextModal(props) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSave = () => {
    // Here you could handle the text, e.g., send it in an HTTP request
    //console.log(text);

    props.handleSave(text)
    handleClose();
  };

  return (
    <>
      <Button variant="light" className="textBox" onClick={handleShow}>
        {props.text}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Your Text</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{maxHeight: '560px', overflowY: 'auto'}}>
          <Form>
            <Form.Group>
              <Form.Label>Text Input</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={6} 
                value={text} 
                style={{maxHeight: '460px'}}
                onChange={(e) => setText(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MyTextModal;
