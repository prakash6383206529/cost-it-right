import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { createMaterialTypeAPI, getMaterialTypeDataAPI, updateMaterialtypeAPI } from '../actions/Material';
import Toaster from '../../common/Toaster';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { useTranslation } from 'react-i18next';
import { getConfigurationKey, loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import { debounce } from 'lodash';
import { MESSAGES } from '../../../config/message';
import { acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, decimalLengthFour, hashValidation, positiveAndDecimalNumber, required } from '../../../helper';
import AddMaterialTypeDetail from './AddMaterialTypeDetail';
import { checkForNull } from '../../../helper/validation';

const AddMaterialType = ({ isEditFlag, ID, isOpen, closeDrawer, anchor, isViewFlag }) => {
  const { t } = useTranslation("RawMaterialMaster");
  const dispatch = useDispatch();
  const RMIndex = getConfigurationKey()?.IsShowMaterialIndexation
  const [state, setState] = useState({
    isShowForm: false,
    MaterialTypeId: '',
    DataToChange: [],
    setDisable: false,
    showPopup: false,
    tableData: []
  });

  const materialTypeData = useSelector(state => state.material);
  const {
    register,
    control,
    setValue,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    const fetchData = () => {
      const materialId = isEditFlag || isViewFlag ? ID : ''; // Use a default value for ID
      dispatch(getMaterialTypeDataAPI(materialId, '', res => {
        const data = res?.data?.Data;
        if (data) {
          const defaultValues = {
            MaterialType: data.MaterialType,
            CalculatedDensityValue: data.Density,
          };
          setState((prevState) => ({ ...prevState, tableData: data.MaterialCommodityStandardDetails }));
          Object.entries(defaultValues).forEach(([key, value]) => {
            setValue(key, value);
          });
        }
      }));
    }
    if (isEditFlag) {
      fetchData();
    }
  }, [isEditFlag, isViewFlag, ID, dispatch, setValue]);

  const cancel = (type) => {
    reset();
    dispatch(getMaterialTypeDataAPI('', '', res => { }));
    toggleDrawer('', '', type);
  };

  const cancelHandler = () => {
    if (isDirty) {
      setState(prevState => ({ ...prevState, showPopup: true }));
    } else {
      cancel('cancel');
    }
  };

  const onPopupConfirm = () => {
    cancel('cancel');
    setState(prevState => ({ ...prevState, showPopup: false }));
  };

  const closePopUp = () => {
    setState(prevState => ({ ...prevState, showPopup: false }));
  };

  const toggleDrawer = (event, formData, type) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    closeDrawer('', formData, type);
  };

  const onSubmit = debounce(values => {
    if(state.tableData.length === 0){
      Toaster.warning('Please add at least one material type detail before saving');
      return false;
    }
    if (isEditFlag) {
      const isMaterialTypeUnchanged = materialTypeData?.materialTypeData?.MaterialType === values?.MaterialType;
      const isDensityUnchanged = checkForNull(materialTypeData?.materialTypeData?.Density) === checkForNull(values?.CalculatedDensityValue);
      const originalCommodities = materialTypeData?.materialTypeData?.MaterialCommodityStandardDetails || [];
      const newCommodities = state?.tableData || [];

      const areCommoditiesUnchanged =
        originalCommodities.length === newCommodities?.length &&
        originalCommodities?.every((original, index) => {
          const newItem = newCommodities[index];
          return (
            original?.CommodityStandardName === newItem?.CommodityStandardName &&
            checkForNull(original?.Percentage) === checkForNull(newItem?.Percentage)
          );
        });

      if (isMaterialTypeUnchanged && isDensityUnchanged && areCommoditiesUnchanged) {
        Toaster.warning("Please change data to save Material Details");
        return false;
      }

      setState(prevState => ({ ...prevState, setDisable: true }));

      const updateData = {
        MaterialTypeId: ID,
        ModifiedBy: loggedInUserId(),
        CreatedDate: '',
        MaterialType: values.MaterialType,
        CalculatedDensityValue: values.CalculatedDensityValue,
        IsActive: true,
        MaterialCommodityStandardDetails: state.tableData
      };

      dispatch(updateMaterialtypeAPI(updateData, res => {
        setState(prevState => ({ ...prevState, setDisable: false }));
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.MATERIAL_UPDATE_SUCCESS);
          dispatch(getMaterialTypeDataAPI('', '', res => { }));
          reset();
          toggleDrawer('', updateData, 'submit');
        }
      }));
    } else {
      setState(prevState => ({ ...prevState, setDisable: true }));

      const formData = {
        MaterialType: values.MaterialType,
        CalculatedDensityValue: values.CalculatedDensityValue,
        CreatedBy: loggedInUserId(),
        IsActive: true,
        MaterialCommodityStandardDetails: state.tableData
      };

      dispatch(createMaterialTypeAPI(formData, res => {
        setState(prevState => ({ ...prevState, setDisable: false }));
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.MATERIAL_ADDED_SUCCESS);
          dispatch(getMaterialTypeDataAPI('', '', res => { }));
          reset();
          toggleDrawer('', formData, 'submit');
        }
      }));
    }
  }, 500);

  const handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };
  const tableData = (data) => {
    setState(prevState => ({ ...prevState, tableData: data }));
  }
  const { setDisable } = state;
  return (
    <div>
      <Drawer anchor={anchor} open={isOpen}>
        <Container>
          <div className={`drawer-wrapper ${RMIndex ? 'layout-min-width-720px' : ''}`}>
            <form
              noValidate
              className="form"
              onSubmit={handleSubmit(onSubmit)}
              onKeyDown={e => handleKeyDown(e)}
            >
              <Row className="drawer-heading">
                <Col>
                  <div className={"header-wrapper left"}>
                    <h3>
                      {isEditFlag ? "Update Material" : "Add Material"}
                      <TourWrapper
                        buttonSpecificProp={{ id: "Add_Material_Type_Form" }}
                        stepsSpecificProp={{
                          steps: Steps(t, { isEditFlag: isEditFlag }).ADD_MATERIAL,
                        }}
                      />
                    </h3>
                  </div>
                  <div
                    onClick={e => toggleDrawer(e)}
                    className={"close-button right"}
                  ></div>
                </Col>
              </Row>
              <Row className="pl-3">
                <Col md={RMIndex ? "6" : "12"}>
                  <TextFieldHookForm
                    label={`Material`}
                    name={"MaterialType"}
                    type="text"
                    Controller={Controller}
                    control={control}
                    register={register}
                    placeholder={""}
                    mandatory={true}
                    handleChange={e => { }}
                    customClassName={"withBorder"}
                    rules={{
                      required: true,
                      validate: { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, hashValidation },
                    }}
                    errors={errors.MaterialType}
                    disabled={isViewFlag}
                  />
                </Col>
                <Col md={RMIndex ? "6" : "12"}>
                  <TextFieldHookForm
                    label={`Density (g/cm3)`}
                    name={"CalculatedDensityValue"}
                    type="text"
                    placeholder={""}
                    rules={{
                      required: true,
                      validate: { required, positiveAndDecimalNumber, decimalLengthFour },
                    }}
                    Controller={Controller}
                    customClassName={"withBorder"}
                    mandatory={true}
                    handleChange={e => { }}
                    control={control}
                    errors={errors.CalculatedDensityValue}
                    register={register}
                    disabled={isViewFlag}
                  />
                </Col>
              </Row>
              { }
              {RMIndex && <AddMaterialTypeDetail tableData={tableData} tableDataState={state.tableData} isViewFlag={isViewFlag} isEditFlag={isEditFlag} />}
              <Row className=" no-gutters justify-content-between">
                <div className="col-md-12">
                  <div className="text-right ">
                    <button
                      id="AddMaterialType_Cancel"
                      onClick={cancelHandler}
                      type="button"
                      value="CANCEL"
                      className="mr15 cancel-btn"
                      disabled={setDisable}
                    >
                      <div className={"cancel-icon"}></div>
                      CANCEL
                    </button>
                    {!isViewFlag && <button
                      id="AddMaterialType_Save"
                      type="submit"
                      className="user-btn save-btn"
                      disabled={setDisable}
                    >
                      {" "}
                      <div className={"save-icon"}></div>
                      {isEditFlag ? "UPDATE" : "SAVE"}
                    </button>}
                  </div>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
      {state.showPopup && (
        <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
      )}
    </div>
  );
};

export default AddMaterialType;
