import React, { useEffect, useState } from "react";
import { Field } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import Toaster from "../common/Toaster";
import { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80, postiveNumber, maxLength2 } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import { MESSAGES } from "../../config/message";
import { getConfigurationKey, loggedInUserId } from "../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import { Container, Row, Col, Label, } from 'reactstrap';
import LoaderCustom from "../common/LoaderCustom";
import { COST, COSTING_LEVEL, MASTER_LEVEL, ONBOARDINGID, ONBOARDINGNAME, ONBOARDING_MANAGEMENT_LEVEL, SIMULATION_LEVEL } from "../../config/constants";
import TourWrapper from "../common/Tour/TourWrapper";
import { Steps } from "./TourMessages";
import { getApprovalModuleSelectList, getApprovalTypeSelectList } from "../../actions/Common";
import { addMasterLevel, addOnboardingLevel, addSimulationLevel, addUserLevelAPI, getAllLevelAPI, getAllLevelMappingAPI, getAllTechnologyAPI, getLevelMappingAPI, getMasterLevel, getMasterLevelDataList, getOnboardingLevel, getOnboardingLevelDataList, getSimulationLevel, getSimulationLevelDataList, getSimulationTechnologySelectList, getUserLevelAPI, manageLevelTabApi, setApprovalLevelForTechnology, setEmptyLevelAPI, updateLevelMappingAPI, updateMasterLevel, updateOnboardingLevel, updateSimulationLevel, updateUserLevelAPI } from "../../actions/auth/AuthActions";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { SearchableSelectHookForm } from "../layout/HookFormInputs";

/**************************************THIS FILE IS FOR ADDING LEVEL MAPPING*****************************************/
const Level = (props) => {
  const { t } = useTranslation("Level");
  const { register, control, setValue, handleSubmit, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const dispatch = useDispatch();
  const [state, setState] = useState({
    isLoader: true,
    isSubmitted: false,
    isEditFlag: false,
    isEditMappingFlag: false,
    isShowForm: false,
    isShowTechnologyForm: false,
    technology: [],
    level: [],
    levelType: Number(props?.activeTab),
    dataToCheck: [],
    approvalTypeObject: [],
    modules: [],
  });
  const technologyList = useSelector(state => state?.auth?.technologyList)
  const simulationTechnologyList = useSelector(state => state?.auth?.simulationTechnologyList)
  const approvalTypeSelectList = useSelector(state => state?.comman?.approvalTypeSelectList)
  const levelList = useSelector(state => state?.auth.levelList)
  const { isOpen, isShowForm, isShowMappingForm, closeDrawer, isEditFlag, TechnologyId, anchor, approvalTypeId } = props
  const isEditlevelType = props?.isEditedlevelType === 'Costing' ? COSTING_LEVEL : props?.isEditedlevelType === 'Simulation' ? SIMULATION_LEVEL : props?.isEditedlevelType === 'Master' ? MASTER_LEVEL : props?.isEditedlevelType === 'Onboarding' ? ONBOARDING_MANAGEMENT_LEVEL : null
  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */

  useEffect(() => {
    dispatch(getApprovalModuleSelectList((res) => {
      if (res && res.data && res.data.Result) {
        const filteredModules = res?.data?.SelectList?.filter(item => item.Value !== '0');
        setState((prevState) => ({ ...prevState, modules: filteredModules }))
      }
    }))
    if (isEditFlag) {

      dispatch(getAllLevelAPI(() => {
        setState((prevState) => ({ ...prevState, isLoader: isEditFlag ? true : false }))
      }))
      getLevelDetail()
      getLevelMappingDetails()
    } else {
      if (Number(state?.levelType) === COSTING_LEVEL) {

        dispatch(getAllTechnologyAPI(() => { }, '', true))
      } else if (Number(state?.levelType) === SIMULATION_LEVEL) {
        dispatch(getSimulationTechnologySelectList(() => { }))
      }
      onPressRadioLevel(state?.levelType)
      dispatch(getAllLevelAPI(() => { setState((prevState) => ({ ...prevState, isLoader: isEditFlag ? true : false })) }))
      getLevelDetail()
      getLevelMappingDetails()
    }
  }, [])

  /**
  * @method getLevelDetail
  * @description used to get level detail
  */
  const getLevelDetail = () => {
    if (isEditFlag && isShowForm) {
      dispatch(getUserLevelAPI(TechnologyId, () => { }))
    }
  }

  /**
  * @method getLevelMappingDetails
  * @description used to get level detail
  */

  const getLevelMappingDetails = () => {
    const handleResponse = (res, isEditlevelType, dataKey) => {
      if (res && res.data && res.data.Data) {
        let Data = dataKey ? res.data.Data[0] : res.data.Data;
        setValue('LevelId', { label: Data?.Level, value: Data?.LevelId });
        setValue('ApprovalType', { label: Data?.ApprovalType, value: Data?.ApprovalTypeId });
        setValue('TechnologyId', Number(isEditlevelType) === MASTER_LEVEL ? { label: Data?.Master, value: Data?.MasterId } : { label: Data?.Technology, value: Data?.TechnologyId });
        setTimeout(() => {
          setState((prevState) => ({
            ...prevState,
            isEditMappingFlag: true,
            isShowTechnologyForm: true,
            technology: Number(isEditlevelType) === MASTER_LEVEL ? { label: Data?.Master, value: Data?.MasterId } : { label: Data?.Technology, value: Data?.TechnologyId },
            level: { label: Data?.Level, value: Data?.LevelId },
            levelType: isEditlevelType,
            isLoader: false,
            dataToCheck: { label: Data?.Level, value: Data?.LevelId }
          }),);
          // setState((prevState) => ({ ...prevState, dataToCheck: { label: Data?.Level, value: Data?.LevelId } }));
          // 
          setState((prevState) => ({ ...prevState, approvalTypeObject: { label: Data?.ApprovalType, value: Data?.ApprovalTypeId } }));
        }, 100);
      }
    };


    if (isEditFlag && isShowMappingForm) {
      let apiFunction;
      let approvalType;
      let dataKey = false;

      switch (Number(isEditlevelType)) {
        case COSTING_LEVEL:
          apiFunction = getLevelMappingAPI;
          approvalType = approvalTypeId.Costing;
          break;
        case SIMULATION_LEVEL:
          apiFunction = getSimulationLevel;
          approvalType = approvalTypeId.Simulation;
          break;
        case MASTER_LEVEL:
          apiFunction = getMasterLevel;
          approvalType = approvalTypeId.Master;
          break;
        case ONBOARDING_MANAGEMENT_LEVEL:

          apiFunction = getOnboardingLevel;
          approvalType = approvalTypeId.Onboarding;
          dataKey = true;
          break;
        default:
          return;
      }

      const dispatchFunction = (apiFunction, approvalType, dataKey) => {
        if (Number(isEditlevelType) === ONBOARDING_MANAGEMENT_LEVEL) {
          dispatch(apiFunction(approvalType, (res) => {
            handleResponse(res, isEditlevelType, dataKey);
          }));
        } else {
          dispatch(apiFunction(TechnologyId, approvalType, (res) => {
            handleResponse(res, isEditlevelType, dataKey);
          }));
        }
      };

      dispatchFunction(apiFunction, approvalType, dataKey);
    }
  };

  /**
  * @method selectType
  * @description Used show listing of unit of measurement
  */
  const searchableSelectType = (label) => {
    const temp = [];
    // RENDER WHEN COSTING TECHNOLOGY LIST IN USE
    if (label === 'technology' && Number(state?.levelType) === COSTING_LEVEL) {
      technologyList && technologyList?.map(item => {

        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    // RENDER WHEN SIMULATION TECHNOLOGY LIST IN USE
    if (label === 'technology' && Number(state?.levelType) === SIMULATION_LEVEL) {
      simulationTechnologyList && simulationTechnologyList.map(item => {

        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'technology' && Number(state?.levelType) === MASTER_LEVEL) {
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
      levelList && levelList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
    }

    // RENDER WHEN COSTING TECHNOLOGY LIST IN USE

    if (label === 'ApprovalType') {
      approvalTypeSelectList && approvalTypeSelectList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
    }
  }

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

    dispatch(getApprovalTypeSelectList(() => { }), label)
    reset();
    setValue('ApprovalType', '');
    setValue('TechnologyId', '');
    setValue('LevelId', '');
    if (Number(label) === COSTING_LEVEL) {

      dispatch(getAllTechnologyAPI(() => { }))
    } else if (Number(label) === SIMULATION_LEVEL) {

      dispatch(getSimulationTechnologySelectList(() => { }))
    }
    setState((prevState) => ({ ...prevState, levelType: label, technology: [], level: [], approvalTypeObject: [] }));
  };

  /**
  * @method cancel
  * @description used to cancel level edit
  */
  const cancel = () => {
    reset();
    resetForm()
    setState((prevState) => ({
      ...prevState,
      technology: [],
      level: [],
    }))
    dispatch(setEmptyLevelAPI('', () => { }))
    toggleDrawer('cancel', state?.levelType)
  }

  /**
   * @method resetForm
   * @description used to Reset form
   */
  const resetForm = () => {
    reset();
    dispatch(setEmptyLevelAPI('', () => { }))
  }

  /**
   * @method resetMappingForm
   * @description used to Reset Mapping form
   */
  const resetMappingForm = () => {
    reset();
    setState((prevState) => ({
      ...prevState,
      technology: [],
      level: [],
    }))
  }

  const toggleDrawer = (event, levelTypeData, update = false, res = '') => {

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
      closeDrawer('cancel', "")
    }
    else {
      closeDrawer('', levelTypeData, update)
    }
  };
  /**
   * @name onSubmit
   * @param values
   * @desc Submit the signup form values.
   * @returns {{}}
   */
  const onSubmit = (values) => {

    const { technology, level, approvalTypeObject } = state;


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

        if (Number(state?.levelType) === COSTING_LEVEL) {
          // UPDATE COSTING LEVEL
          let formReq = {
            TechnologyId: technology.value,
            LevelId: level.value,
            Technology: technology.label,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value,
            ApprovalType: approvalTypeObject?.label
          }



          if (state?.dataToCheck.label === formReq.Level) {

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
              toggleDrawer('', state?.levelType, true, res.status)
              dispatch(manageLevelTabApi(true))
            }
          }))
        }

        if (Number(state?.levelType) === SIMULATION_LEVEL) {
          // UPDATE SIMULATION LEVEL
          let formReq = {
            TechnologyId: technology.value,
            LevelId: level.value,
            Technology: technology.label,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value,
            ApprovalType: approvalTypeObject?.label
          }

          if (state?.dataToCheck.label === formReq.Level) {
            toggleDrawer('')
            return false
          }
          dispatch(updateSimulationLevel(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)

              setState((prevState) => ({
                ...prevState,
                isLoader: false,
                technology: [],
                level: [],
              }))
              toggleDrawer('', state?.levelType, '', res.status)
              dispatch(manageLevelTabApi(true))
              reset();
            }
          }))
        }

        if (Number(state?.levelType) === MASTER_LEVEL) {
          // manageLevelTabApi(true)
          // UPDATE SIMULATION LEVEL
          let formReq = {

            MasterId: technology.value,
            LevelId: level.value,
            Master: technology.label,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value,
            ApprovedType: approvalTypeObject?.label
          }

          if (state?.dataToCheck.label === formReq.Level) {
            toggleDrawer('', state?.levelType)
            return false
          }
          dispatch(updateMasterLevel(formReq, (res) => {

            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
              toggleDrawer('', state?.levelType, '', res.status)
              dispatch(manageLevelTabApi(true))
              setState((prevState) => ({ ...prevState, isLoader: false }))
              reset();
            }
          }))
        }
        if (Number(state?.levelType) === ONBOARDING_MANAGEMENT_LEVEL) {
          let formReq = {
            LevelId: level.value,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value,
            ApprovalType: approvalTypeObject?.label,
            OnboardingApprovalId: 1,
            OnboardingApprovalName: ONBOARDINGNAME,
          }
          if (state?.dataToCheck.label === formReq.Level) {
            toggleDrawer('', state?.levelType)
            return false
          }
          dispatch(updateOnboardingLevel(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_ONBOARDING_USER_SUCCESSFULLY)

              toggleDrawer('', state?.levelType, '', res.status)
              dispatch(manageLevelTabApi(true))
              reset();
            }
          }))
        }

      }
      else {
        let formData = {
          LevelId: level.value,
          TechnologyId: technology.value,
          ApprovalTypeId: approvalTypeObject?.value
        }
        if (Number(state?.levelType) === COSTING_LEVEL) {
          dispatch(setApprovalLevelForTechnology(formData, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.ADD_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
              toggleDrawer('', state?.levelType, '')
              dispatch(manageLevelTabApi(true))
            }
            reset();
            setState((prevState) => ({
              ...prevState,
              isLoader: false,
              technology: [],
              level: [],
            }))

          }))
        }

        if (Number(state?.levelType) === SIMULATION_LEVEL) {
          // ADD SIMULATION NEW LEVEL
          dispatch(addSimulationLevel(formData, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.ADD_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
              toggleDrawer('', state?.levelType, '')
              dispatch(manageLevelTabApi(true))
            }

            reset();
            setState((prevState) => ({
              ...prevState,
              isLoader: false,
              technology: [],
              level: [],
            }))

          }))
        }
        if (Number(state?.levelType) === MASTER_LEVEL) {
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
              toggleDrawer('', state?.levelType, '')
              dispatch(manageLevelTabApi(true))
            }
            reset();
            setState((prevState) => ({
              ...prevState,
              isLoader: false,
              technology: [],
              level: [],
            }))

          }))
        }
        if (Number(state?.levelType) === ONBOARDING_MANAGEMENT_LEVEL) {
          let OnboardingData = {
            LevelId: level.value,
            UserId: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value,
            OnboardingApprovalMasterId: ONBOARDINGID
          }
          dispatch(addOnboardingLevel(OnboardingData, (res) => {

            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.ADD_LEVEL_ONBOARDING_USER_SUCCESSFULLY)
              // dispatch(getOnboardingLevelDataList(res))
              toggleDrawer('', state?.levelType, '')
              dispatch(manageLevelTabApi(true))
            }
            reset();
            setState((prevState) => ({
              ...prevState,
              isLoader: false,
              technology: [],
              level: [],
            }))
          }))
        }

      }
    }

  }


  return (
    <div>
      <Drawer className="add-update-level-drawer" anchor={anchor} open={isOpen}
      >
        <Container>
          {state.isLoader && <LoaderCustom />}
          <div className={'drawer-wrapper'}>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }} noValidate>
              <Row className="drawer-heading">
                <Col className="d-flex">
                  {
                    isShowForm ?
                      <div className={'header-wrapper left'}>
                        <h3>{isEditFlag ? 'Update Level' : 'Add Level'}</h3>
                      </div>
                      :
                      <div className={'header-wrapper left'}>
                        <h3>{isEditFlag ? 'Update Highest Level of Approvals' : 'Set Highest Level of Approvals'}
                          <TourWrapper
                            buttonSpecificProp={{ id: "Add_Hightest_Level_Form" }}
                            stepsSpecificProp={{
                              steps: Steps(t, { isEditFlag: isEditFlag }).ADD_LEVEL_MAPPING
                            }} />
                        </h3>
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
                      <Field
                        label="Level Name"
                        name={"LevelName"}
                        type="text"
                        placeholder={'Enter'}
                        validate={[required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80]}
                        component={renderText}
                        required={true}
                        maxLength={26}
                        customClassName={'withBorder'}
                      />
                    </div>
                    <div className="col-md-12 input-withouticon mb-0" >
                      <Field
                        label="Sequence"
                        name={"Sequence"}
                        type="text"
                        placeholder={'Enter'}
                        validate={[postiveNumber, maxLength2]}
                        component={renderText}
                        required={false}
                        // maxLength={26}
                        customClassName={'withBorder'}
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
                        disabled={state?.isSubmitted ? true : false}
                        className="user-btn save-btn"
                      >
                        <div className={"save-icon"}></div>
                        {state?.isEditFlag ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </div>}

                {/* *********************************THIS IS LEVEL MAPPING FORM*************************************************** */}
                {isShowMappingForm &&
                  <>
                    <Row>
                      <Col md="12">
                        {state?.modules?.map((module) => {
                          if (
                            (Number(module.Value) === MASTER_LEVEL && !getConfigurationKey().IsMasterApprovalAppliedConfigure) ||
                            (Number(module.Value) === ONBOARDING_MANAGEMENT_LEVEL && !getConfigurationKey().IsShowOnboarding)
                          ) {
                            return null;
                          }
                          return (
                            <Label
                              key={module.Value}
                              id={`AddApproval_${module.Value}Level`}
                              className={'pl0 radio-box mb-0 pb-3 d-inline-block pr-3 w-auto'}
                              check
                            >
                              <input
                                type="radio"
                                name="levelType"
                                checked={state?.levelType === Number(module.Value)}
                                onClick={() => onPressRadioLevel(Number(module.Value))}
                                disabled={isEditFlag}
                              />{' '}
                              <span>{module.Text}</span>
                            </Label>
                          );
                        })}
                      </Col>
                    </Row>
                    <div className="row pr-0">
                      <div className="input-group  form-group col-md-12 input-withouticon" >
                        <SearchableSelectHookForm
                          label={'Approval Type'}
                          name={'ApprovalType'}
                          placeholder='Select'
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          options={searchableSelectType('ApprovalType')}
                          validate={(state?.approvalTypeObject == null || state?.approvalTypeObject.length === 0) ? [required] : []}
                          handleChange={approvalTypeHandler}
                          disabled={isEditFlag ? true : false}
                        //MINDA
                        // disabled={!(userData.Department.length > 1 && reasonId !== REASON_ID) || disableSR ? true : false}
                        // errors={errors.approver}
                        />
                      </div>
                      {Number(state?.levelType) !== ONBOARDING_MANAGEMENT_LEVEL && <div className="input-group  form-group col-md-12 input-withouticon" >
                        <SearchableSelectHookForm
                          name={"TechnologyId"}
                          label={"Technology/Heads"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          options={searchableSelectType('technology')}
                          validate={(state?.technology == null || state?.technology.length === 0) ? [required] : []}
                          placeholder={"Select"}
                          handleChange={technologyHandler}
                          valueDescription={state?.technology}
                          disabled={isEditFlag ? true : false}
                        />
                      </div>}
                      <div className="input-group col-md-12  form-group input-withouticon" >
                        <SearchableSelectHookForm
                          name={"LevelId"}
                          label={"Highest Approval Level"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          options={searchableSelectType('level')}
                          validate={(state?.level == null || state?.level.length === 0) ? [required] : []}
                          placeholder={"Select"}
                          handleChange={(value) => {

                            levelHandler(value);
                          }}
                          valueDescription={state?.level}
                        />
                      </div>
                      <div className="text-right mt-0 col-md-12">
                        <button
                          id="AddApproval_Cancel"
                          //disabled={pristine || submitting}
                          onClick={cancel}
                          type="button"
                          value="CANCEL"
                          className="reset mr15 cancel-btn">
                          <div className={"cancel-icon"}></div> CANCEL</button>
                        <button
                          id="AddApproval_Save"
                          type="submit"
                          disabled={state?.isSubmitted ? true : false}
                          className="btn-primary save-btn"
                        >
                          <div className={"save-icon"}></div>
                          {isEditFlag ? 'Update' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </>}
              </div >
            </form >
          </div >
        </Container >
      </Drawer >
    </div >
  );
}

export default Level