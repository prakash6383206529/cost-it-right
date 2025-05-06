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
  
  // Get the maximum character length from props or use default values
  const maxLength = props?.maxLength || 250
  
  // Define special characters regex
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/;
  
  // Initialize remark with defaultValue when component mounts or defaultValue changes
  useEffect(() => {
    // This will ensure the remark is updated when a new default value is provided
    setRemark(props?.defaultValue || "");
    if (props?.defaultValue) {
      props?.setInputData && props?.setInputData(props?.defaultValue);
    }
  }, [props?.defaultValue, props?.setInputData]);

  function confirmHandler(e) {
    // Validate input before proceeding
    if (props?.isInputField || props?.isInputFieldResponse) {
      if (!remark.trim()) {
        setFormError("Please enter a remark");
        return; // Stop execution if validation fails
      } else if (remark.length > maxLength) {
        setFormError(`Remark should not exceed ${maxLength} characters`);
        return; // Stop execution if validation fails
      }
      
      // Check for special characters at start or end
      if (remark && (specialCharRegex.test(remark[0]) || specialCharRegex.test(remark[remark.length - 1]))) {
        setFormError("Remark cannot start or end with special characters");
        return; // Stop execution if validation fails
      }
    }
    
    // Only if validation passes, proceed with confirmation
    props.confirmPopup(e);
    
    setTimeout(() => {
      document.querySelector('body').removeAttribute('style')
      if (props.redirectPath !== '' && props?.redirectPath !== null && props?.redirectPath !== undefined) {
        history.push(SUPPLIER_MANAGEMENT, { vendorId: props.vendorId, plantId: props.plantId });
      }
    }, 200);
  }
  
  const changeHandler = (e) => {
    const inputValue = e.target.value;
    
    // Always update remark and pass to parent
    setRemark(inputValue);
    props.setInputData(inputValue);
    
    // Clear previous error
    setFormError("");
    
    // Validate and show errors but don't prevent setting the value
    if (!inputValue.trim()) {
      setFormError("Please enter a remark");
    } else if (inputValue?.length > maxLength) {
      setFormError(`Remark should not exceed ${maxLength} characters`);
    } else if (inputValue && (specialCharRegex.test(inputValue[0]) || specialCharRegex.test(inputValue[inputValue.length - 1]))) {
      setFormError("Remark cannot start or end with special characters");
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
        {props?.header ? props?.header : "Confirm"}
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
              <div className="text-right text-muted small">
                {remark?.length || 0}/{maxLength}
              </div>
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
            disabled={props?.isDisabled}
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
