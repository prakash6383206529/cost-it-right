import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { debounce } from 'lodash';
import Drawer from '@material-ui/core/Drawer';
import { createReasonAPI, getReasonAPI, updateReasonAPI, setEmptyReason } from '../actions/ReasonMaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from '../../../helper/auth';
import LoaderCustom from '../../common/LoaderCustom';
import Toaster from '../../common/Toaster';
import { acceptAllExceptSingleSpecialCharacter, checkSpacesInString, checkWhiteSpaces, hashValidation, maxLength80, required } from '../../../helper/validation';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';

const AddReason = (props) => {
  const { isEditFlag, ID } = props;
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(true);
  const [reasonId, setReasonId] = useState('');
  const [dataToCheck, setDataToCheck] = useState([]);
  const [setDisable, setSetDisable] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  // const module = [
  //   {
  //     "label": "Module A",
  //     "value": "module_a"
  //   },
  //   {
  //     "label": "Module B",
  //     "value": "module_b"
  //   },
  //   {
  //     "label": "Module C",
  //     "value": "module_c"
  //   },
  //   {
  //     "label": "Module D",
  //     "value": "module_d"
  //   }
  // ]


  useEffect(() => {
    getDetail();
  }, []);
  const { register, handleSubmit, formState: { errors }, control, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const getDetail = () => {
    if (isEditFlag) {
      setIsLoader(true);
      setReasonId(ID);
      setTimeout(() => {
        dispatch(getReasonAPI(ID, (res) => {
          if (res?.data?.Data) {
            const data = res.data.Data;
            setDataToCheck(data);
            setIsActive(data.IsActive);
            setValue('Reason', data.Reason);
          }
        }));
        setIsLoader(false);
      }, 300);
    }
  };

  const toggleDrawer = (event, type) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', type);
  };

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = (type) => {
    setIsActive(true);
    setSetDisable(false);
    toggleDrawer('', type);
    setEmptyReason()
  };

  const cancelHandler = () => {
    cancel('cancel');
  };

  const onPopupConfirm = () => {
    cancel('cancel');
    setShowPopup(false);
  };

  const closePopUp = () => {
    setShowPopup(false);
  };
  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = debounce((values) => {
    const { isEditFlag } = props;

    if (isEditFlag) {
      if (dataToCheck.Reason === values?.Reason) {
        Toaster.warning('Please change the data to save Reason Details')
        return false;
      }
      setSetDisable(true);
      const formData = {
        ReasonId: reasonId,
        Reason: values?.Reason,
        IsActive: isActive,
        LoggedInUserId: loggedInUserId(),
      };
      dispatch(updateReasonAPI(formData, (res) => {
        setSetDisable(false);
        if (res?.Result === true) {
          Toaster.success(MESSAGES.UPDATE_REASON_SUCESS);
        }
        cancel('submit');
      }));
    } else {
      setSetDisable(true);
      const formData = {
        Reason: values?.Reason,
        IsActive: true,
        LoggedInUserId: loggedInUserId(),
      };
      dispatch(createReasonAPI(formData, (res) => {
        setSetDisable(false);
        if (res?.data?.Result === true) {
          Toaster.success(MESSAGES.REASON_ADD_SUCCESS);
          cancel('submit');
        }
      }));
    }
  }, 500);

  /**
  * @method render
  * @description Renders the component
  */

  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        {isLoader && <LoaderCustom />}
        <Container>
          <div className={"drawer-wrapper"}>
            <form
              onSubmit={handleSubmit(onSubmit)}
            >
              <Row className="drawer-heading">
                <Col>
                  <div className={"header-wrapper left"}>
                    <h3>{isEditFlag ? "Update Reason" : "Add Reason"}</h3>
                  </div>
                  <div
                    onClick={cancel}
                    className={"close-button right"}
                  ></div>
                </Col>
              </Row>
              <Row className="pl-3">
                <Col md="12">
                  <TextFieldHookForm
                    label={`Reason`}
                    name={"Reason"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    rules={{
                      required: true,
                      validate: { required, checkWhiteSpaces, maxLength80, acceptAllExceptSingleSpecialCharacter, checkSpacesInString, hashValidation }
                    }}
                    mandatory={true}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.Reason}
                    disabled={false}
                    placeholder={isEditFlag ? '-' : "Enter"}
                  />
                </Col>
                {/* <Col md="12">
                  <div className="form-group">
                    <SearchableSelectHookForm
                      label={'Modules'}
                      name={'Selectmodules'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: false }}
                      isClearable={true}
                      register={register}
                      // defaultValue={selectedVendor}
                      // options={supplierDetailData?.map((vendor) => ({ label: vendor.SupplierName, value: vendor.SupplierCode }))}
                      mandatory={true}
                      // handleChange={handleVendorChange}
                      errors={errors.Masters}
                    />
                  </div>
                </Col> */}

              </Row>

              <Row className="sf-btn-footer no-gutters justify-content-between px-3">
                <div className="col-sm-12 text-right px-3">
                  <button
                    type={"button"}
                    className=" mr15 cancel-btn"
                    onClick={cancelHandler}
                    disabled={setDisable}
                  >
                    <div className={"cancel-icon"}></div>
                    {"Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="user-btn save-btn"
                    disabled={setDisable}
                  >
                    <div className={"save-icon"}></div>
                    {isEditFlag ? "Update" : "Save"}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
      {
        showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
      }
    </>
  );
}

export default AddReason
