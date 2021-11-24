import React from 'react';
import {Button,Modal,ModalHeader,ModalBody,ModalFooter} from 'reactstrap';
import confirmImg from '../../assests/images/confirm.svg';


function PopupMsgWrapper(props) {
    return (             
        <Modal
          fade={false}
          toggle={props.closePopUp}
          isOpen={props.isOpen}
          className="popup-container"
        >
          <ModalHeader toggle={props.closePopUp} className="pl-5">
           {props.header ?props.header:'Confirm'}
          </ModalHeader>
          <ModalBody className="text-center">
          <div className="text-center img-block">
            <img alt={""} src={confirmImg} />
          </div>
           {props.message ?props.message:'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={props.confirmPopup}
              className="save-btn"
            >
               <div className={"save-icon"}></div>
             {props.firstButtonName ?props.firstButtonName:'OK'}
            </Button>
            {' '}
            <Button className="cancel-btn" onClick={props.closePopUp}>
            <div className={'cancel-icon'}></div>
             {props.secondButtonName ?props.secondButtonName:'Cancel'}
            </Button>
          </ModalFooter>
        </Modal>
     
    );
}

export default PopupMsgWrapper;