import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import confirmImg from "../../assests/images/confirm.svg";
import { Controller, useForm } from "react-hook-form";
import LoaderCustom from "./LoaderCustom";
import { useHistory } from 'react-router-dom';
import { SUPPLIER_MANAGEMENT } from '../../config/constants';

function PopupMsgWrapper(props) {
  
  const { handleSubmit, control } = useForm();
  const [remark, setRemark] = useState(props.defaultValue || "");
  const [formError, setFormError] = useState("");
  const history = useHistory();
  
  // Initialize remark with defaultValue when component mounts or defaultValue changes
  useEffect(() => {
    // This will ensure the remark is updated when a new default value is provided
    setRemark(props?.defaultValue || "");
    if (props?.defaultValue) {
      props?.setInputData && props?.setInputData(props?.defaultValue);
    }
  }, [props?.defaultValue, props?.setInputData]);

  function confirmHandler(e) {
    props.confirmPopup(e);
    setTimeout(() => {
      document.querySelector('body').removeAttribute('style')
      if (props.redirectPath !== '' && props?.redirectPath !== null && props?.redirectPath !== undefined) {
        history.push(SUPPLIER_MANAGEMENT, { vendorId: props.vendorId, plantId: props.plantId });
      }
    }, 200);
    if (props.isInputField) {
      if (!remark.trim()) {
        setFormError("Please enter a remark");
        return;
      } else if (remark.length > 250) {
        setFormError("Remark should not exceed 250 characters");
        return;
      }
    }
    else if (props?.isInputFieldResponse) {
      if (!remark.trim()) {
        setFormError("Please enter a remark");
        return;
      } else if (remark.length > 500) {
        setFormError("Remark should not exceed 500 characters");
        return;
      }
    }
  }
  const changeHandler = (e) => {
    const inputValue = e.target.value;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/;
    
    // Check if first or last character is special character
    if (inputValue && (specialCharRegex.test(inputValue[0]) || specialCharRegex.test(inputValue[inputValue.length - 1]))) {
      setFormError("Remark cannot start or end with special characters");
      return;
    }

    if (props.isInputFieldResponse) {
      if (inputValue.length <= 500) {
        setRemark(inputValue);
        props.setInputData(inputValue);
        setFormError(""); 
      } else {
        setFormError("Remark should not exceed 500 characters");
      }
    } else {
      if (inputValue.length <= 250) {
        setRemark(inputValue);
        props.setInputData(inputValue);
        setFormError(""); 
      } else {
        setFormError("Remark should not exceed 250 characters");
      }
    }
  };

  return (
    <Modal
      fade={false}
      toggle={props.closePopUp}
      isOpen={props.isOpen}
      className={`popup-container ${props.customClass || ""}`}
      centered
      size={props.size}
    >
      <ModalHeader toggle={props.closePopUp} className="pl-5">
        {props.header ? props.header : "Confirm"}
      </ModalHeader>
      {props.isInputField || props.isInputFieldResponse ? (
        <ModalBody>
          <form>
            <div className="mb-3">
              <label className="asterisk-sign text-left">
                Add Remark{/* <span className="asterisk-required">*</span> */}
              </label>
              <Controller
                control={control}
                name="remark"
                render={({ field }) => (
                  <textarea
                    rows={3}
                    placeholder="Enter"
                    value={remark}
                    onChange={(e) => {
                      changeHandler(e);
                    }}
                    disabled={props?.isDisabled}
                    // onChange={(e) => field.onChange(e.target.value)}
                    className="form-control hl-textarea-h"
                  />
                )}
              />
              {formError && <p className="text-help">{formError}</p>}
            </div>
          </form>
        </ModalBody>
      ) : (
        <ModalBody className="text-center">
          <div className="text-center img-block">
            <img
              alt={""}
              className={`${props.imgClass || ""}`}
              src={props.confirmImg || confirmImg}
            />
          </div>
          {props.message
            ? props.message
            : "You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?"}
        </ModalBody>
      )}

      <ModalFooter>
        <div className="p-relative">
          {/* {props?.buttonLoader} */}
          <Button
            color="primary"
            onClick={(e) => confirmHandler(e)}
            className={
              "save-btn"
            }
            disabled={ props.isDisabled}
          >
            <div className={`save-icon ${props.iconClass}`}></div>
            {props.firstButtonName ? props.firstButtonName : props.nfrPopup ? 'Yes' : 'OK'}
          </Button>
        </div>{" "}
        {props.closePopUp &&
          <Button className="cancel-btn" onClick={props.closePopUp ? props.closePopUp : ""}>
            <div className={`cancel-icon ${props.iconClass}`}></div>
            {props.secondButtonName ? props.secondButtonName : props.nfrPopup ? 'No' : 'Cancel'}
          </Button>}
      </ModalFooter>
    </Modal>
  );
}

export default PopupMsgWrapper;
