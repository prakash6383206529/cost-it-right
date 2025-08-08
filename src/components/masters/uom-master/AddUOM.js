import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { debounce } from 'lodash';
import Drawer from '@material-ui/core/Drawer';
import {
  createUnitOfMeasurementAPI, updateUnitOfMeasurementAPI, getOneUnitOfMeasurementAPI,
  getUnitOfMeasurementAPI, getUnitTypeListAPI
} from '../actions/unitOfMeasurment';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import { required, minLength3, maxLength80, acceptAllExceptSingleSpecialCharacter } from "../../../helper/validation";
import { TextFieldHookForm, SearchableSelectHookForm } from '../../layout/HookFormInputs';

function AddUOM(props) {
  const { isEditFlag, ID } = props ?? {};
  const dispatch = useDispatch();
  
  const initialState = {
    unitTypes: null,
    isSubmitting: false
  };
  const [state, setState] = useState(initialState);
  
  const unitOfMeasurementData = useSelector((state) => state?.unitOfMeasrement?.unitOfMeasurementData);
  const unitTypeList = useSelector((state) => state?.unitOfMeasrement?.unitTypeList);
  
  const { register, handleSubmit, formState: { errors }, control, setValue, reset } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      Unit: unitOfMeasurementData?.Unit ?? '',
      UnitTypeId: ''
    }
  });

  const getDetails = useCallback(() => {
    dispatch(getUnitTypeListAPI(() => { }));
    if (isEditFlag) {
      dispatch(getOneUnitOfMeasurementAPI(ID, true, (res) => {
        if (res?.data?.Data) {
          const Data = res.data.Data;
          const tempObj = unitTypeList?.find(item => item?.Value === Data?.UnitTypeId);
          setState(prev => ({ 
            ...prev, 
            unitTypes: tempObj ? { label: tempObj?.Text, value: tempObj?.Value } : null
          }));
          setValue('Unit', Data?.Unit ?? '');
          setValue('UnitTypeId', tempObj ? { label: tempObj?.Text, value: tempObj?.Value } : null);
        }
      }));
    } else {
      dispatch(getOneUnitOfMeasurementAPI('', false, () => { }));
    }
  }, [isEditFlag, ID, dispatch, setValue, unitTypeList]);

  useEffect(() => {
    getDetails();
  }, []);

  const toggleDrawer = useCallback((event) => {
    if (event?.type === 'keydown' && (event?.key === 'Tab' || event?.key === 'Shift')) {
      return;
    }
    props?.closeDrawer?.('');
  }, []);

  const searchableSelectType = useCallback((label) => {
    const temp = [];
    
    if (label === 'UnitType') {
      unitTypeList?.map(item => {
        if (item?.Value === '0') return false;
        temp.push({ label: item?.Text ?? '', value: item?.Value ?? '' });
        return null;
      });
      return temp;
    }
    return [];
  }, [unitTypeList]);

  const unitTypeHandler = useCallback((newValue) => {
    setState(prev => ({ ...prev, unitTypes: newValue }));
  }, []);

  const cancel = useCallback(() => {
    reset();
    setState({
      unitTypes: null,
      isSubmitting: false
    });
    toggleDrawer('');
  }, [reset, toggleDrawer]);

  const onSubmit = debounce((values) => {
    const { unitTypes } = state;
    
    if (!unitTypes?.value) {
      Toaster.error('Please select Unit Type');
      return;
    }
    
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    if (isEditFlag) {
      const formData = {
        Id: ID,
        Unit: values?.Unit?.trim() ?? '',
        UnitTypeId: unitTypes?.value ?? '',
        IsActive: true,
        ModifiedBy: loggedInUserId(),
      };
      
      dispatch(updateUnitOfMeasurementAPI(formData, (res) => {
        setState(prev => ({ ...prev, isSubmitting: false }));
        if (res?.data?.Result) {
          Toaster.success(MESSAGES?.UPDATE_UOM_SUCESS ?? 'UOM updated successfully');
          reset();
          toggleDrawer('');
          dispatch(getUnitOfMeasurementAPI(() => { }));
        } else {
          Toaster.error(MESSAGES?.SOME_ERROR ?? 'Something went wrong');
        }
      }));
    } else {
      const reqData = {
        Unit: values?.Unit?.trim() ?? '',
        UnitTypeId: unitTypes?.value ?? '',
        CreatedBy: loggedInUserId()
      };
      
      dispatch(createUnitOfMeasurementAPI(reqData, (res) => {
        setState(prev => ({ ...prev, isSubmitting: false }));
        if (res?.data?.Result === true) {
          Toaster.success(MESSAGES?.UOM_ADD_SUCCESS ?? 'UOM added successfully');
          reset();
          toggleDrawer('');
          dispatch(getUnitOfMeasurementAPI(() => { }));
        } else {
          Toaster.error(res?.data?.message ?? 'Something went wrong');
        }
      }));
    }
  }, 500);

  const handleKeyDown = useCallback((e) => {
    if (e?.key === 'Enter' && e?.shiftKey === false) {
      e.preventDefault();
    }
  }, []);

  return (
    <Drawer
      anchor={props?.anchor}
      open={props?.isOpen}
    >
      <Container>
        <div className={"drawer-wrapper"}>
          <form
            noValidate
            className="form"
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={handleKeyDown}
          >
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{isEditFlag ? "UPDATE UNIT" : "ADD UNIT"}</h3>
                </div>
                <div
                  onClick={toggleDrawer}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>

            <Row className="pl-3">
              <div className="input-group form-group col-md-12 input-withouticon">
                <TextFieldHookForm
                  label="UOM Name"
                  name="Unit"
                  Controller={Controller}
                  control={control}
                  register={register}
                  rules={{
                    required: true,
                    validate: { required, acceptAllExceptSingleSpecialCharacter, minLength3, maxLength80 }
                  }}
                  mandatory={true}
                  defaultValue={''}
                  customClassName={'withBorder'}
                  errors={errors?.Unit}
                  disabled={false}
                  placeholder={''}
                  maxLength={26}
                />
              </div>
              <div className="col-md-12 form-group">
                <SearchableSelectHookForm
                  label="Unit Type"
                  name="UnitTypeId"
                  placeholder="Select"
                  Controller={Controller}
                  control={control}
                  rules={{
                    required: !state?.unitTypes?.value,
                    validate: !state?.unitTypes?.value ? { required } : {}
                  }}
                  isClearable={true}
                  register={register}
                  options={searchableSelectType("UnitType")}
                  mandatory={true}
                  handleChange={unitTypeHandler}
                  errors={errors?.UnitTypeId}
                  defaultValue={state?.unitTypes}
                />
              </div>
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between px-3">
              <div className="col-sm-12 text-right px-3">
                <button
                  type={"button"}
                  className="reset mr15 cancel-btn"
                  onClick={cancel}
                  disabled={state?.isSubmitting}
                >
                  <div className={'cancel-icon'}></div>
                  {"Cancel"}
                </button>
                <button
                  type="submit"
                  className="submit-button save-btn"
                  disabled={state?.isSubmitting}
                >
                  <div className={"save-icon"}></div>
                  {"Save"}
                </button>
              </div>
            </Row>
          </form>
        </div>
      </Container>
    </Drawer>
  );
}

export default AddUOM;