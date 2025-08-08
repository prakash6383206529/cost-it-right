import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
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

function AddReason(props) {
  const { isEditFlag, ID } = props;
  const dispatch = useDispatch();
  
  const initialState = {
    isActive: true,
    reasonId: '',
    dataToCheck: [],
    setDisable: false,
    showPopup: false,
    isLoader: false
  };
  const [state, setState] = useState(initialState);
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
  }, [getDetail]);
  const { register, handleSubmit, formState: { errors }, control, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  
  // Watch form fields
  const watchedFields = useWatch({ 
    control,
    name: ['Reason']
  });

  const getDetail = useCallback(() => {
    if (isEditFlag) {
      setState(prev => ({ ...prev, isLoader: true }));
      setState(prev => ({ ...prev, reasonId: ID }));
      setTimeout(() => {
        dispatch(getReasonAPI(ID, (res) => {
          if (res?.data?.Data) {
            const data = res.data.Data;
            setState(prev => ({ 
              ...prev, 
              dataToCheck: data,
              isActive: data.IsActive
            }));
            setValue('Reason', data.Reason);
          }
        }));
        setState(prev => ({ ...prev, isLoader: false }));
      }, 300);
    }
  }, [isEditFlag, ID, dispatch, setValue]);

  const toggleDrawer = useCallback((event, type) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', type);
  }, []);

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = useCallback((type) => {
    setState(prev => ({ 
      ...prev, 
      isActive: true,
      setDisable: false 
    }));
    toggleDrawer('', type);
    setEmptyReason();
  }, [toggleDrawer]);

  const cancelHandler = useCallback(() => {
    cancel('cancel');
  }, [cancel]);

  const onPopupConfirm = useCallback(() => {
    cancel('cancel');
    setState(prev => ({ ...prev, showPopup: false }));
  }, [cancel]);

  const closePopUp = useCallback(() => {
    setState(prev => ({ ...prev, showPopup: false }));
  }, []);
  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = debounce((values) => {
    const { isEditFlag } = props;

    if (isEditFlag) {
      if (state.dataToCheck.Reason === values?.Reason) {
        Toaster.warning('Please change the data to save Reason Details');
        return false;
      }
      setState(prev => ({ ...prev, setDisable: true }));
      const formData = {
        ReasonId: state.reasonId,
        Reason: values?.Reason,
        IsActive: state.isActive,
        LoggedInUserId: loggedInUserId(),
      };
      dispatch(updateReasonAPI(formData, (res) => {
        setState(prev => ({ ...prev, setDisable: false }));
        if (res?.Result === true) {
          Toaster.success(MESSAGES.UPDATE_REASON_SUCESS);
        }
        cancel('submit');
      }));
    } else {
      setState(prev => ({ ...prev, setDisable: true }));
      const formData = {
        Reason: values?.Reason,
        IsActive: true,
        LoggedInUserId: loggedInUserId(),
      };
      dispatch(createReasonAPI(formData, (res) => {
        setState(prev => ({ ...prev, setDisable: false }));
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
        {state.isLoader && <LoaderCustom />}
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
                    control={control}
                    register={register}
                    rules={{
                      required: true,
                      validate: { required, checkWhiteSpaces, maxLength80, acceptAllExceptSingleSpecialCharacter, checkSpacesInString, hashValidation }
                    }}
                    mandatory={true}
                    handleChange={(e) => {}}
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
                    disabled={state.setDisable}
                  >
                    <div className={"cancel-icon"}></div>
                    {"Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="user-btn save-btn"
                    disabled={state.setDisable}
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
        state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
      }
    </>
  );
}

export default AddReason
