import React from 'react';
import {Button,Modal,ModalHeader,ModalBody,ModalFooter} from 'reactstrap'

function PopupMsgWrapper(props) {
    return (             
        <Modal
          fade={false}
          toggle={props.closePopUp}
          isOpen={props.isOpen}
        >
          <ModalHeader toggle={props.closePopUp}>
           {props.header ?props.header:'Confirm'}
          </ModalHeader>
          <ModalBody>
           {props.message ?props.message:'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={props.confirmPopup}
            >
             {props.firstButtonName ?props.firstButtonName:'OK'}
            </Button>
            {' '}
            <Button onClick={props.closePopUp}>
             {props.secondButtonName ?props.secondButtonName:'Cancel'}
            </Button>
          </ModalFooter>
        </Modal>
     
    );
}

export default PopupMsgWrapper;