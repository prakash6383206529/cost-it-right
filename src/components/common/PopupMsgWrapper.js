import React from 'react';
import {Button,Modal,ModalHeader,ModalBody,ModalFooter} from 'reactstrap'

function PopupMsgWrapper(props) {
    
    console.log("COMING IN POP P MESSAGE");
    return (             
        <Modal
          fade={false}
          toggle={props.closePopUp}
          isOpen={props.isOpen}
        >
          <ModalHeader toggle={props.closePopUp}>
           {props.header}
          </ModalHeader>
          <ModalBody>
           {props.message}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={props.confirmPopup}
            >
             {props.firstButtonName}
            </Button>
            {' '}
            <Button onClick={props.closePopUp}>
             {props.secondButtonName}
            </Button>
          </ModalFooter>
        </Modal>
     
    );
}

export default PopupMsgWrapper;