import React, { useState, useEffect, useCallback } from "react";
// import { Field, clearFields } from "redux-form";
import Toaster from "../common/Toaster";
import { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80, postiveNumber, maxLength2 } from "../../helper/validation";
import {
  addUserLevelAPI, getUserLevelAPI, getAllLevelAPI, updateUserLevelAPI, setEmptyLevelAPI, setApprovalLevelForTechnology, getAllTechnologyAPI,
  getLevelMappingAPI, updateLevelMappingAPI, getSimulationTechnologySelectList, addSimulationLevel, updateSimulationLevel, getSimulationLevel
  , addMasterLevel, updateMasterLevel, getMasterLevel
} from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { getConfigurationKey, loggedInUserId } from "../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import { Container, Row, Col, Label, } from 'reactstrap';
import LoaderCustom from "../common/LoaderCustom";
import { getApprovalTypeSelectList } from '../../actions/Common'
import { CUSTOMER_BASED, NCCTypeId, NFRAPPROVALTYPEID, PROVISIONAL, PROVISIONALAPPROVALTYPEIDFULL, RELEASESTRATEGYTYPEID1, RELEASESTRATEGYTYPEID2, RELEASESTRATEGYTYPEID3, RELEASESTRATEGYTYPEID4, RELEASESTRATEGYTYPEID6, WACAPPROVALTYPEID } from "../../config/constants";
import { reactLocalStorage } from "reactjs-localstorage";
import { useDispatch, useSelector } from 'react-redux';
import { SearchableSelectHookForm, TextFieldHookForm } from "../layout/HookFormInputs";
import { useForm, Controller } from "react-hook-form";
const Level = (props) => {
  const dispatch = useDispatch();
  const { technologyList, levelList, simulationTechnologyList } = useSelector((state) => state.auth)
  const { approvalTypeSelectList } = useSelector((state) => state.comman);
  const { register, control, setValue, handleSubmit, getValues, reset, formState: { errors } } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });
  console.log('approvalTypeSelectList', approvalTypeSelectList)
  console.log('technologyList', technologyList)
  const [state, setState] = useState({
    isLoader: true,
    isSubmitted: false,
    isEditFlag: false,
    isEditMappingFlag: false,
    isShowForm: false,
    isShowTechnologyForm: false,
    technology: [],
    level: [],
    levelType: 'Costing',
    dataToCheck: [],
    approvalTypeObject: [],
  });
 
  useEffect(() => {
    dispatch(getApprovalTypeSelectList(() => { }));

    if (props.isEditFlag) {
      dispatch(getAllLevelAPI(() => { setState((prevState) => ({ ...prevState, isLoader: props.isEditFlag ? true : false })) }));
      getLevelDetail();
      getLevelMappingDetails();
    } else {
      if (state.levelType === 'Costing') {
        dispatch(getAllTechnologyAPI(() => { }));
      } else if (state.levelType === 'Simulation') {
        dispatch(getSimulationTechnologySelectList(() => { }));
      }
      dispatch(getAllLevelAPI(() => { setState((prevState) => ({ ...prevState, isLoader: props.isEditFlag ? true : false })) }));
      getLevelDetail();
      getLevelMappingDetails();
    }
  }, []);

 /**
   * @method getLevelDetail
   * @description used to get level detail
   */
  const getLevelDetail = useCallback(() => {
    const { isShowForm, isEditFlag, TechnologyId } = props;

    if (isEditFlag && isShowForm) {
      dispatch(getUserLevelAPI(TechnologyId, () => { }));

    }
  }, []);

  /**
  * @method getLevelMappingDetails
  * @description used to get level detail
  */

  const getLevelMappingDetails = useCallback(() => {
    const { isShowMappingForm, isEditFlag, TechnologyId, isEditedlevelType, approvalTypeId } = props;

    if (isEditFlag && isShowMappingForm && isEditedlevelType === 'Costing') {
      dispatch(getLevelMappingAPI(TechnologyId, approvalTypeId.Costing, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          setValue("LevelId", Data.Level)
          setValue("TechnologyId", Data.Technology)
          setValue("ApprovalType", Data.ApprovalType)
          console.log("Data", Data)
          setTimeout(() => {
            setState((prevState) => ({
              ...prevState,
              isEditMappingFlag: true,
              isShowTechnologyForm: true,
              technology: { label: Data?.Technology, value: Data?.TechnologyId },
              level: { label: Data?.Level, value: Data?.LevelId },
              levelType: isEditedlevelType,
              isLoader: false,
            }));
            setState((prevState) => ({ ...prevState, dataToCheck: state.level }));
            setState((prevState) => ({ ...prevState, approvalTypeObject: { label: Data?.ApprovalType, value: Data?.ApprovalTypeId } }));
          }, 500);
        }
      }));
    }

    if (isEditFlag && isShowMappingForm && isEditedlevelType === 'Simulation') {
      dispatch(getSimulationLevel(TechnologyId, approvalTypeId.Simulation, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          setValue("LevelId", Data.Level)
          setValue("TechnologyId", Data.Technology)
          setValue("ApprovalType", Data.ApprovalType)
          console.log("Data", Data)
          setTimeout(() => {
            setState((prevState) => ({
              ...prevState,
              isEditMappingFlag: true,
              isShowTechnologyForm: true,
              technology: { label: Data?.Technology, value: Data?.TechnologyId },
              level: { label: Data?.Level, value: Data?.LevelId },
              levelType: isEditedlevelType,

              isLoader: false,
            }));
            setState((prevState) => ({ ...prevState, dataToCheck: state.level }));
            setState((prevState) => ({ ...prevState, approvalTypeObject: { label: Data?.ApprovalType, value: Data?.ApprovalTypeId } }));
          }, 500);
        }
      }));
    }

    if (isEditFlag && isShowMappingForm && isEditedlevelType === 'Master') {
      dispatch(getMasterLevel(TechnologyId, approvalTypeId.Master, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          setValue("LevelId", Data.Level)
          setValue("TechnologyId", Data.Technology)
          setValue("ApprovalType", Data.ApprovalType)
          console.log("Data", Data)
          setTimeout(() => {
            setState((prevState) => ({
              ...prevState,
              isEditMappingFlag: true,
              isShowTechnologyForm: true,
              technology: { label: Data?.Master, value: Data?.MasterId },
              level: { label: Data?.Level, value: Data?.LevelId },
              levelType: isEditedlevelType,
              isLoader: false,
            }));
            setState((prevState) => ({ ...prevState, dataToCheck: state.level }));
            setState((prevState) => ({ ...prevState, approvalTypeObject: { label: Data?.ApprovalType, value: Data?.ApprovalTypeId } }));
          }, 500);
        }
      }));
    }
  }, []);
  /**
    * @method selectType
    * @description Used show listing of unit of measurement
    */
  const searchableSelectType = useCallback((label) => {
    console.log(label)
    const temp = [];
    if (label === 'technology' && state.levelType === 'Costing') {
      technologyList && technologyList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    // RENDER WHEN SIMULATION TECHNOLOGY LIST IN USE
    if (label === 'technology' && state.levelType === 'Simulation') {
      simulationTechnologyList && simulationTechnologyList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'technology' && state.levelType === 'Master') {

      let arrayOfTechnology = []
      const myArray = getConfigurationKey().ApprovalMasterArrayList.split(",");
      myArray && myArray.map((item) => {
        let tempObj = {}
        let temp = item.split('=')
        tempObj.label = temp[0]
        tempObj.value = temp[1]
        arrayOfTechnology.push(tempObj)
        return null
      })
      return arrayOfTechnology
    }


    if (label === 'level') {
      console.log("levelList", levelList)
      levelList && levelList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value });
        return null;
      });
      return temp;
    }

    if (label === 'ApprovalType') {
      approvalTypeSelectList && approvalTypeSelectList.map(item => {
        if (item.Value === '0') return false
        if ((Number(item.Value) === Number(RELEASESTRATEGYTYPEID1) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID2) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID6)) && state.levelType === 'Simulation') return false
        if (item.Text === PROVISIONAL && state.levelType !== 'Simulation') return false
        if ((Number(item.Value) === Number(RELEASESTRATEGYTYPEID1) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID2) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID3) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID4) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID6) || Number(item.Value) === Number(WACAPPROVALTYPEID) || Number(item.Value) === Number(PROVISIONALAPPROVALTYPEIDFULL) || Number(item.Value) === Number(NFRAPPROVALTYPEID) || Number(item.Value) === Number(NCCTypeId)) && state.levelType === 'Master') return false
        if (item.Text === CUSTOMER_BASED && !(reactLocalStorage.getObject('cbcCostingPermission'))) return false
        temp.push({ label: item.Text, value: item.Value })
        console.log("temp", temp.label)
        return null;
      });
      return temp;
    }
  }, [/* props, state.levelType */]);
  /**
        * @method technologyHandler
        * @description Used to handle 
        */
  const technologyHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      setState((prevState) => ({ ...prevState, technology: newValue }));
    } else {
      setState((prevState) => ({ ...prevState, technology: [] }));
    }
  };

  /**
  * @method approvalTypeHandler
  * @description Used to handle 
  */
  const approvalTypeHandler = (newValue, actionMeta) => {
    console.log('newValue', newValue)
    if (newValue && newValue !== '') {
      setState((prevState) => ({ ...prevState, approvalTypeObject: newValue }));
    } else {
      setState((prevState) => ({ ...prevState, approvalTypeObject: [] }));
    }
  };

  /**
  * @method levelHandler
  * @description Used to handle 
  */
  const levelHandler = (newValue, actionMeta) => {
    console.log('newValue', newValue)
    if (newValue && newValue !== '') {
      setState((prevState) => ({ ...prevState, level: newValue }));
    } else {
      setState((prevState) => ({ ...prevState, level: [] }));
    }
  };

  /**
  * @method onPressRadioLevel
  * @description LEVEL TYPE HANDLING
  */
  const onPressRadioLevel = (label) => {
    const fieldsToClear = ['ApprovalType', 'TechnologyId', 'LevelId'];

    fieldsToClear.forEach(fieldName => {
      setValue(fieldName, '');
    });

    if (label === 'Costing') {
      // Assuming you have an asynchronous function to fetch technology data
      // Replace the following line with your actual function
      getAllTechnologyAPI(() => { });
    } else if (label === 'Simulation') {
      getSimulationTechnologySelectList(() => { });
    }
    setState((prevState) => ({ ...prevState, levelType: label }));
    setState((prevState) => ({ ...prevState, technology: [], level: [], approvalTypeObject: [] }));
  };


  /**
  * @method cancel
  * @description used to cancel level edit
  */
  const cancel = () => {

    reset();
    setState((prevState) => ({
      ...prevState,
      technology: [],
      level: [],
    }))
    dispatch(setEmptyLevelAPI('', () => { }))
    toggleDrawer('cancel')
  }
  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState((prevState) => ({
      ...prevState,
      technology: [],
      level: [],
    }))

    dispatch(setEmptyLevelAPI('', () => { }))
    if (event === 'cancel') {
      props.closeDrawer('cancel')
    } else {
      props.closeDrawer('')
    }

  };
  /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
  const onSubmit = (values) => {
    const { isShowForm, isShowMappingForm, isEditFlag, TechnologyId, reset } = props;

    const { technology, level, approvalTypeObject } = state;
    setState((prevState) => ({ ...prevState, isLoader: true }))

    if (isShowForm) {
      if (isEditFlag) {

        let formReq = {
          LevelId: TechnologyId,
          IsActive: true,
          CreatedDate: '',
          LevelName: values.LevelName,
          Description: values.Description,
          Sequence: values.Sequence,
        }

        dispatch(updateUserLevelAPI(formReq, (res) => {

          if (res && res.data && res.data.Result) {
            Toaster.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
          }
          toggleDrawer('')
          reset();
          setState((prevState) => ({ ...prevState, isLoader: false, }))
        }))

      } else {

        dispatch(addUserLevelAPI(values, (res) => {
          if (res && res.data && res.data.Result) {
            Toaster.success(MESSAGES.ADD_LEVEL_SUCCESSFULLY)
          }
          toggleDrawer('')
          reset();
          setState((prevState) => ({ ...prevState, isLoader: false }))
        }))
      }

    }

    if (isShowMappingForm) {
      if (isEditFlag) {

        if (state.levelType === 'Costing') {
          // UPDATE COSTING LEVEL
          let formReq = {
            TechnologyId: technology.value,
            LevelId: level.value,
            Technology: technology.value,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value
          }

          if (state.dataToCheck.label === formReq.Level) {
            toggleDrawer('')
            return false
          }
          dispatch(updateLevelMappingAPI(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
              reset();
              setState((prevState) => ({
                ...prevState,
                isLoader: false,
                technology: [],
                level: [],
              }))
              toggleDrawer('')
            }
          }))
        }

        if (state.levelType === 'Simulation') {
          // UPDATE SIMULATION LEVEL
          let formReq = {
            TechnologyId: technology.value,
            LevelId: level.value,
            Technology: technology.value,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value
          }
          if (state.dataToCheck.label === formReq.Level) {
            toggleDrawer('')
            return false
          }
          dispatch(updateSimulationLevel(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
            }
            toggleDrawer('')
            reset();

          }))
        }
        if (state.levelType === 'Master') {
          // UPDATE SIMULATION LEVEL
          let formReq = {
            MasterId: technology.value,
            LevelId: level.value,
            Master: technology.value,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value
          }
          if (state.dataToCheck.label === formReq.Level) {
            toggleDrawer('')
            return false
          }
          dispatch(updateMasterLevel(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
            }
            toggleDrawer('')
            reset();
          }))
        }

      } else {

        let formData = {
          LevelId: level.value,
          TechnologyId: technology.value,
          ApprovalTypeId: approvalTypeObject?.value

        }

        if (state.levelType === 'Costing') {
          dispatch(setApprovalLevelForTechnology(formData, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.ADD_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
            }
            reset();
            setState((prevState) => ({
              ...prevState,
              isLoader: false,
              technology: [],
              level: [],
            }))
            toggleDrawer('')
          }))
        }

        if (state.levelType === 'Simulation') {
          // ADD SIMULATION NEW LEVEL
          dispatch(addSimulationLevel(formData, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.ADD_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
            }
            reset();
            setState((prevState) => ({
              ...prevState,
              isLoader: false,
              technology: [],
              level: [],
            }))
            toggleDrawer('')
          }))
        }
        if (state.levelType === 'Master') {
          let masterData = {
            LevelId: level.value,
            MasterId: technology.value,
            UserId: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value
          }
          // ADD MASTER NEW LEVEL
          dispatch(addMasterLevel(masterData, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.ADD_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
            }
            reset();
            setState((prevState) => ({
              ...prevState,
              isLoader: false,
              technology: [],
              level: [],
            }))
            toggleDrawer('')
          }))
        }

      }
    }

  }
  const { isShowForm, isEditFlag } = props;
  const { isLoader, isSubmitted } = state;
  return (
    <div>
      <Drawer className="add-update-level-drawer" anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          {state.isLoader && <LoaderCustom />}
          <div className={'drawer-wrapper'}>
            <form noValidate>
              <Row className="drawer-heading">
                <Col className="d-flex">
                  {
                    state.isShowForm ?
                      <div className={'header-wrapper left'}>
                        <h3>{isEditFlag ? 'Update Level' : 'Add Level'}</h3>
                      </div>
                      :
                      <div className={'header-wrapper left'}>
                        <h3>{isEditFlag ? 'Update Level Mapping' : 'Add Level Mapping'}</h3>
                      </div>
                  }

                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}>
                  </div>
                </Col>
              </Row>
              <div className="drawer-body">

                {isShowForm &&
                  <div className="row pr-0">
                    <div className="col-md-12 input-withouticon" >
                      {/* <Field
                        label="Level Name"
                        name={"LevelName"}
                        type="text"
                        placeholder={'Enter'}
                        validate={[required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80]}
                        component={renderText}
                        required={true}
                        maxLength={26}
                        customClassName={'withBorder'}
                      /> */}
                      <TextFieldHookForm
                        label={"Level Name"}
                        name={"LevelName"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        placeholder={'Enter'}
                        mandatory
                        handleChange={(e) => { }}
                        customClassName={'withBorder'}
                        rules={{
                          required: true,
                          validate: { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80 },
                        }}
                        errors={errors?.LevelName && errors?.LevelName.message}
                      />
                    </div>
                    <div className="col-md-12 input-withouticon mb-0" >
                      {/* <Field
                        label="Sequence"
                        name={"Sequence"}
                        type="text"
                        placeholder={'Enter'}
                        validate={[postiveNumber, maxLength2]}
                        component={renderText}
                        required={false}
                        // maxLength={26}
                        customClassName={'withBorder'}
                      /> */}
                      <TextFieldHookForm
                        label={"Sequence"}
                        name={"Sequence"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        placeholder={'Enter'}
                        mandatory
                        handleChange={(e) => { }}
                        customClassName={'withBorder'}
                        rules={{
                          required: true,
                          validate: { postiveNumber, maxLength2 },
                        }}
                        errors={errors?.Sequence && errors?.Sequence.message}
                      />
                    </div>


                    <div className="text-right mt-0 col-md-12">
                      <button
                        //disabled={pristine || submitting}
                        onClick={cancel}
                        type="button"
                        value="CANCEL"
                        className="mr15 cancel-btn">
                        <div className={"cancel-icon"}></div> CANCEL</button>


                      <button
                        type="submit"
                        disabled={state.isSubmitted ? true : false}
                        className="user-btn save-btn"
                      >
                        <div className={"save-icon"}></div>
                        {state.isEditFlag ? 'Update' : 'Save'}
                      </button>


                    </div>


                  </div>}

                {/* *********************************THIS IS LEVEL MAPPING FORM*************************************************** */}
                {props.isShowMappingForm &&
                  <>
                    <Row>
                      <Col md="12">
                        <Label className={'pl0 radio-box mb-0 pb-3 d-inline-block pr-3 w-auto'} check>
                          <input
                            type="radio"
                            name="levelType"
                            checked={state.levelType === 'Costing' ? true : false}
                            onClick={() => onPressRadioLevel('Costing')}
                            disabled={props.isEditFlag}
                          />{' '}
                          <span>Costing Level</span>
                        </Label>
                        <Label className={'pl0  radio-box mb-0 pb-3 d-inline-block pr-3 w-auto'} check>
                          <input
                            type="radio"
                            name="levelType"
                            checked={state.levelType === 'Simulation' ? true : false}
                            onClick={() => onPressRadioLevel('Simulation')}
                            disabled={props.isEditFlag}
                          />{' '}
                          <span>Simulation Level</span>
                        </Label>

                        {
                          getConfigurationKey().IsMasterApprovalAppliedConfigure &&
                          <Label className={'pl0  radio-box mb-0 pb-3 d-inline-block  w-auto'} check>
                            <input
                              type="radio"
                              name="levelType"
                              checked={state.levelType === 'Master' ? true : false}
                              onClick={() => onPressRadioLevel('Master')}
                              disabled={props.isEditFlag}
                            />{' '}
                            <span>Master Level</span>
                          </Label>
                        }
                      </Col>
                    </Row>
                    <div className="row pr-0">
                      <div className="input-group  form-group col-md-12 input-withouticon" >
                        <SearchableSelectHookForm
                          label={`Approval Type`}
                          name={`ApprovalType`}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          register={register}

                          className={"w-100"}
                          options={searchableSelectType('ApprovalType')}
                          handleChange={(e) => approvalTypeHandler(e)}
                          /*                       handleChangeDescription={approvalTypeHandler}
                                                valueDescription={state.approvalTypeObject} */
                          disabled={state.isEditFlag ? true : false}
                          rules={{
                            required: state.approvalTypeObject == null || state.approvalTypeObject.length === 0 ? 'This field is required' : undefined,
                          }}
                        />
                      </div>
                      <div className="input-group  form-group col-md-12 input-withouticon" >
                        <SearchableSelectHookForm
                          label={`Technology/Heads`}
                          name={`TechnologyId`}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          required={true}
                          className={"w-100"}
                          options={searchableSelectType('technology')}
                          /* handleChangeDescription={technologyHandler}
                          valueDescription={state.technology} */

                          handleChange={(e) => technologyHandler(e)}
                          disabled={state.isEditFlag ? true : false}
                          rules={{
                            required: state.technology == null || state.technology.length === 0 ? 'This field is required' : undefined,
                          }}
                        />
                      </div>
                      <div className="input-group col-md-12  form-group input-withouticon" >

                        <SearchableSelectHookForm
                          label={`Highest Approval Level`}
                          name={`LevelId`}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          required={true}
                          className={"w-100"}
                          options={searchableSelectType('level')}
                          handleChange={(e) => levelHandler(e)}
                          /* handleChangeDescription={levelHandler}
                            valueDescription={state.level} */
                          disabled={state.isEditFlag ? true : false}
                          rules={{
                            required: state.level == null || state.level.length === 0 ? 'This field is required' : undefined,
                          }}

                        />
                      </div>
                      <div className="text-right mt-0 col-md-12">
                        <button
                          //disabled={pristine || submitting}
                          onClick={cancel}
                          type="button"
                          value="CANCEL"
                          className="reset mr15 cancel-btn">
                          <div className={"cancel-icon"}></div> CANCEL</button>
                        <button
                          type="submit"
                          disabled={state.isSubmitted ? true : false}
                          className="btn-primary save-btn"
                          onClick={handleSubmit(onSubmit)}
                        >
                          <div className={"save-icon"}></div>
                          {state.isEditFlag ? 'Update' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </>}


              </div>

            </form>
          </div>
          {/* <LevelsListing
                  onRef={ref => (child = ref)}
                  getLevelDetail={getLevelDetail} />

              <LevelTechnologyListing
                  onRef={ref => (childMapping = ref)}
                  getLevelMappingDetails={getLevelMappingDetails}
              /> */}
        </Container>
      </Drawer>
    </div>
  );
}
export default Level


