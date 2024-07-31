import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import confirmImg from '../../assests/images/confirm.svg';
import { useHistory } from 'react-router-dom';
import { SUPPLIER_MANAGEMENT } from '../../config/constants';


function PopupMsgWrapper(props) {
  const history = useHistory();

  function confirmHandler(e) {
    props.confirmPopup(e)
    setTimeout(() => {
      document.querySelector('body').removeAttribute('style')
      if (props.redirectPath !== '' && props?.redirectPath !== null && props?.redirectPath !== undefined) {
        history.push(SUPPLIER_MANAGEMENT, { vendorId: props.vendorId, plantId: props.plantId });
      }
    }, 200);

  }
  return (
    <Modal
      fade={false}
      toggle={props.closePopUp}
      isOpen={props.isOpen}
      className={`popup-container ${props.customClass}`}
    >
      <ModalHeader toggle={props.closePopUp} className="pl-5">
        {props.header ? props.header : 'Confirm'}
      </ModalHeader>
      <ModalBody className="text-center">
        <div className="text-center img-block">
          <img alt={""} src={confirmImg} />
        </div>
        {props.message ? props.message : 'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={(e) => confirmHandler(e)}
          className="save-btn"
          disabled={props?.disablePopup}
        >
          <div className={"save-icon"}></div>
          {props.firstButtonName ? props.firstButtonName : props.nfrPopup ? 'Yes' : 'OK'}
        </Button>
        {' '}
        <Button className="cancel-btn" onClick={props.closePopUp}>
          <div className={'cancel-icon'}></div>
          {props.secondButtonName ? props.secondButtonName : props.nfrPopup ? 'No' : 'Cancel'}
        </Button>
      </ModalFooter>
    </Modal>

  );
}

export default PopupMsgWrapper;