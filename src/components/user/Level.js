import React, { Component } from "react";
import { Field, reduxForm, clearFields } from "redux-form";
import Toaster from "../common/Toaster";
import { connect } from "react-redux";
import { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80, postiveNumber, maxLength2 } from "../../helper/validation";
import { renderText, searchableSelect } from "../layout/FormInputs";
import {
  addUserLevelAPI, getUserLevelAPI, getAllLevelAPI, updateUserLevelAPI, setEmptyLevelAPI, setApprovalLevelForTechnology, getAllTechnologyAPI,
  getLevelMappingAPI, updateLevelMappingAPI, getSimulationTechnologySelectList, addSimulationLevel, updateSimulationLevel, getSimulationLevel, getMastersSelectList,
  addMasterLevel, updateMasterLevel, getMasterLevel, addOnboardingLevel, updateOnboardingLevel, getOnboardingLevel
} from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { getConfigurationKey, loggedInUserId } from "../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import { Container, Row, Col, Label, } from 'reactstrap';
import LoaderCustom from "../common/LoaderCustom";
import { getApprovalTypeSelectList } from '../../actions/Common'
import { CUSTOMER_BASED, NCCTypeId, NFRAPPROVALTYPEID, PROVISIONAL, PROVISIONALAPPROVALTYPEIDFULL, RELEASESTRATEGYTYPEID1, RELEASESTRATEGYTYPEID2, RELEASESTRATEGYTYPEID3, RELEASESTRATEGYTYPEID4, RELEASESTRATEGYTYPEID6, WACAPPROVALTYPEID, NEW_COMPONENT, RELEASE_STRATEGY_B1, RELEASE_STRATEGY_B2, RELEASE_STRATEGY_B3, RELEASE_STRATEGY_B4, VENDORNEEDFORMID, ONBOARDINGNAME } from "../../config/constants";
import { reactLocalStorage } from "reactjs-localstorage";
import { transformApprovalItem } from "../common/CommonFunctions";

/**************************************THIS FILE IS FOR ADDING LEVEL MAPPING*****************************************/
class Level extends Component {
  constructor(props) {
    super(props);
    //this.child = React.createRef();
    //this.childMapping = React.createRef();
    this.state = {
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
    };
  }

  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {

    this.props.getApprovalTypeSelectList(() => { })
    if (this.props.isEditFlag) {
      this.props.getAllLevelAPI(() => { this.setState({ isLoader: this.props.isEditFlag ? true : false }) })
      this.getLevelDetail()
      this.getLevelMappingDetails()
    } else {
      if (this.state.levelType === 'Costing') {
        this.props.getAllTechnologyAPI(() => { }, '', true)
      } else if (this.state.levelType === 'Simulation') {
        this.props.getSimulationTechnologySelectList(() => { })
      }
      this.props.getAllLevelAPI(() => { this.setState({ isLoader: this.props.isEditFlag ? true : false }) })
      this.getLevelDetail()
      this.getLevelMappingDetails()
    }
  }

  /**
  * @method getLevelDetail
  * @description used to get level detail
  */
  getLevelDetail = () => {
    const { isShowForm, isEditFlag, TechnologyId } = this.props;
    if (isEditFlag && isShowForm) {
      //$('html, body').animate({ scrollTop: 0 }, 'slow');
      this.props.getUserLevelAPI(TechnologyId, () => { })
    }
  }

  /**
  * @method getLevelMappingDetails
  * @description used to get level detail
  */
  getLevelMappingDetails = () => {
    const { isShowMappingForm, isEditFlag, TechnologyId, isEditedlevelType, approvalTypeId } = this.props;

    // WHEN COSTING LEVEL DETAILS GET
    if (isEditFlag && isShowMappingForm && isEditedlevelType === 'Costing') {
      this.props.getLevelMappingAPI(TechnologyId, approvalTypeId.Costing, (res) => {

        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          setTimeout(() => {
            this.setState({
              isEditMappingFlag: true,
              isShowTechnologyForm: true,
              technology: { label: Data?.Technology, value: Data?.TechnologyId },
              level: { label: Data?.Level, value: Data?.LevelId },
              levelType: isEditedlevelType,
              isLoader: false,
              updateApi: !this.state.updateApi
            })
            this.setState({ dataToCheck: this.state.level })
            this.setState({ approvalTypeObject: { label: Data?.ApprovalType, value: Data?.ApprovalTypeId } })
          }, 500)

        }

      })
    }

    // WHEN SIMULATION LEVEL DETAILS GET
    if (isEditFlag && isShowMappingForm && isEditedlevelType === 'Simulation') {
      this.props.getSimulationLevel(TechnologyId, approvalTypeId.Simulation, (res) => {

        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          setTimeout(() => {
            this.setState({
              isEditMappingFlag: true,
              isShowTechnologyForm: true,
              technology: { label: Data?.Technology, value: Data?.TechnologyId },
              level: { label: Data?.Level, value: Data?.LevelId },
              levelType: isEditedlevelType,
              isLoader: false
            })
            this.setState({ dataToCheck: this.state.level })
            this.setState({ approvalTypeObject: { label: Data?.ApprovalType, value: Data?.ApprovalTypeId } })
          }, 500)
        }
      })
    }

    // WHEN MASTER LEVEL DETAILS GET
    if (isEditFlag && isShowMappingForm && isEditedlevelType === 'Master') {
      this.props.getMasterLevel(TechnologyId, approvalTypeId.Master, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;

          setTimeout(() => {
            this.setState({
              isEditMappingFlag: true,
              isShowTechnologyForm: true,
              technology: { label: Data?.Master, value: Data?.MasterId },
              level: { label: Data?.Level, value: Data?.LevelId },
              levelType: isEditedlevelType,
              isLoader: false
            })
            this.setState({ dataToCheck: this.state.level })
            this.setState({ approvalTypeObject: { label: Data?.ApprovalType, value: Data?.ApprovalTypeId } })
          }, 500)
        }
      })
    }
    if (isEditFlag && isShowMappingForm && isEditedlevelType === 'Onboarding') {
      this.props.getOnboardingLevel(approvalTypeId.Onboarding, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data[0];
          setTimeout(() => {
            this.setState({
              isEditMappingFlag: true,
              isShowTechnologyForm: true,
              level: { label: Data?.Level, value: Data?.LevelId },
              levelType: isEditedlevelType,
              isLoader: false
            })
            this.setState({ dataToCheck: this.state.level })
            this.setState({ approvalTypeObject: { label: Data?.ApprovalType, value: Data?.ApprovalTypeId } })
          }, 500)
        }
      })
    }
  }

  /**
  * @method selectType
  * @description Used show listing of unit of measurement
  */
  searchableSelectType = (label) => {
    const { technologyList, levelList, simulationTechnologyList, approvalTypeSelectList } = this.props;
    const temp = [];

    // RENDER WHEN COSTING TECHNOLOGY LIST IN USE
    if (label === 'technology' && this.state.levelType === 'Costing') {
      technologyList && technologyList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    // RENDER WHEN SIMULATION TECHNOLOGY LIST IN USE
    if (label === 'technology' && this.state.levelType === 'Simulation') {
      simulationTechnologyList && simulationTechnologyList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'technology' && this.state.levelType === 'Master') {

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
      // for (let i = 1; i <= level; i++) {
      //   temp.push({ label: `L-${i}`, value: i })
      // }
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
        if ((Number(item.Value) === Number(RELEASESTRATEGYTYPEID1) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID2) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID6) || Number(item.Value) === Number(WACAPPROVALTYPEID) || Number(item.Value) === Number(NCCTypeId) || Number(item.Value) === Number(NFRAPPROVALTYPEID)) && this.state.levelType === 'Simulation') return false
        if ((Number(item.Value) === Number(PROVISIONALAPPROVALTYPEIDFULL) || (!getConfigurationKey().IsNFRConfigured && Number(item.Value) === Number(NFRAPPROVALTYPEID))) && this.state.levelType === 'Costing') return false
        if ((Number(item.Value) === Number(RELEASESTRATEGYTYPEID1) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID2) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID3) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID4) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID6) || Number(item.Value) === Number(WACAPPROVALTYPEID) || Number(item.Value) === Number(PROVISIONALAPPROVALTYPEIDFULL) || Number(item.Value) === Number(NFRAPPROVALTYPEID) || Number(item.Value) === Number(NCCTypeId)) && this.state.levelType === 'Master') return false
        if (item.Text === CUSTOMER_BASED && !(reactLocalStorage.getObject('CostingTypePermission').cbc)) return false
        if (this.state.levelType === 'Onboarding' && Number(item.Value) !== VENDORNEEDFORMID) return false;
        const transformedText = transformApprovalItem(item);
        temp.push({ label: transformedText, value: item.Value });

        return null;
      });
      return temp;
    }
  }

  /**
      * @method technologyHandler
      * @description Used to handle 
      */
  technologyHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ technology: newValue });
    } else {
      this.setState({ technology: [] });
    }
  };

  /**
  * @method approvalTypeHandler
  * @description Used to handle 
  */
  approvalTypeHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ approvalTypeObject: newValue });
    } else {
      this.setState({ approvalTypeObject: [] });
    }
  };

  /**
  * @method levelHandler
  * @description Used to handle 
  */
  levelHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ level: newValue });
    } else {
      this.setState({ level: [] });
    }
  };

  /**
  * @method onPressRadioLevel
  * @description LEVEL TYPE HANDLING
  */
  onPressRadioLevel = (label) => {

    const fieldsToClear = ['ApprovalType', 'TechnologyId', 'LevelId'];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('Level', false, false, fieldName));
    });

    if (label === 'Costing') {
      this.props.getAllTechnologyAPI(() => { })
    } else if (label === 'Simulation') {
      this.props.getSimulationTechnologySelectList(() => { })
    }
    this.setState({ levelType: label });
    this.setState({ technology: [], level: [], approvalTypeObject: [] });
  };

  /**
  * @method cancel
  * @description used to cancel level edit
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      technology: [],
      level: [],
    })
    this.props.setEmptyLevelAPI('', () => { })
    this.toggleDrawer('cancel', this.state.levelType)
  }

  /**
   * @method resetForm
   * @description used to Reset form
   */
  resetForm = () => {
    const { reset } = this.props;
    reset();
    this.props.setEmptyLevelAPI('', () => { })
  }

  /**
   * @method resetMappingForm
   * @description used to Reset Mapping form
   */
  resetMappingForm = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      technology: [],
      level: [],
    })
  }

  toggleDrawer = (event, levelTypeData, update = false) => {

    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.setState({
      technology: [],
      level: [],
    })

    this.props.setEmptyLevelAPI('', () => { })
    if (event === 'cancel') {

      this.props.closeDrawer('cancel', "")
    } else {


      this.props.closeDrawer('', levelTypeData, update)

    }

  };

  submitLevelTechnology = () => {
    this.setState({ isLoader: true })
  }

  /**
   * @name onSubmit
   * @param values
   * @desc Submit the signup form values.
   * @returns {{}}
   */
  onSubmit(values) {
    const { isShowForm, isShowMappingForm, isEditFlag, TechnologyId, reset } = this.props;

    const { technology, level, approvalTypeObject } = this.state;
    this.setState({ isLoader: true })

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

        this.props.updateUserLevelAPI(formReq, (res) => {

          if (res && res.data && res.data.Result) {
            Toaster.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
          }
          this.toggleDrawer('')
          reset();
          this.setState({ isLoader: false, })
        })

      } else {

        this.props.addUserLevelAPI(values, (res) => {
          if (res && res.data && res.data.Result) {
            Toaster.success(MESSAGES.ADD_LEVEL_SUCCESSFULLY)
          }
          this.toggleDrawer('')
          reset();
          this.setState({ isLoader: false })
        })
      }

    }

    if (isShowMappingForm) {
      if (isEditFlag) {
        if (this.state.levelType === 'Costing') {
          // UPDATE COSTING LEVEL
          let formReq = {
            TechnologyId: technology.value,
            LevelId: level.value,
            Technology: technology.value,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value
          }

          if (this.state.dataToCheck.label === formReq.Level) {
            this.toggleDrawer('')
            return false
          }
          this.props.updateLevelMappingAPI(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
              reset();
              this.setState({
                isLoader: false,
                technology: [],
                level: [],
              })
              this.toggleDrawer('', this.state.levelType, true)
            }
          })
        }

        if (this.state.levelType === 'Simulation') {
          // UPDATE SIMULATION LEVEL
          let formReq = {
            TechnologyId: technology.value,
            LevelId: level.value,
            Technology: technology.value,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value
          }
          if (this.state.dataToCheck.label === formReq.Level) {
            this.toggleDrawer('')
            return false
          }
          this.props.updateSimulationLevel(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
            }
            this.toggleDrawer('', this.state.levelType)
            reset();

          })
        }
        if (this.state.levelType === 'Master') {
          // UPDATE SIMULATION LEVEL
          let formReq = {
            MasterId: technology.value,
            LevelId: level.value,
            Master: technology.value,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value
          }
          if (this.state.dataToCheck.label === formReq.Level) {
            this.toggleDrawer('', this.state.levelType)
            return false
          }
          this.props.updateMasterLevel(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
            }
            this.toggleDrawer('', this.state.levelType)
            reset();
          })
        }
        if (this.state.levelType === 'Onboarding') {
          let formReq = {
            LevelId: level.value,
            Level: level.label,
            ModifiedBy: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value,
            ApprovalType: approvalTypeObject?.label,
            OnboardingApprovalId: 1,
            OnboardingApprovalName: ONBOARDINGNAME,
          }
          if (this.state.dataToCheck.label === formReq.Level) {
            this.toggleDrawer('', this.state.levelType)
            return false
          }
          this.props.updateOnboardingLevel(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_ONBOARDING_USER_SUCCESSFULLY)
            }
            this.toggleDrawer('', this.state.levelType)
            reset();
          })
        }

      } else {

        let formData = {
          LevelId: level.value,
          TechnologyId: technology.value,
          ApprovalTypeId: approvalTypeObject?.value

        }

        if (this.state.levelType === 'Costing') {
          this.props.setApprovalLevelForTechnology(formData, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.ADD_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
            }
            this.props.reset();
            this.setState({
              isLoader: false,
              technology: [],
              level: [],
            })
            this.toggleDrawer('', this.state.levelType)
          })
        }

        if (this.state.levelType === 'Simulation') {
          // ADD SIMULATION NEW LEVEL
          this.props.addSimulationLevel(formData, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.ADD_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
            }
            this.props.reset();
            this.setState({
              isLoader: false,
              technology: [],
              level: [],
            })
            this.toggleDrawer('', this.state.levelType)
          })
        }
        if (this.state.levelType === 'Master') {
          let masterData = {
            LevelId: level.value,
            MasterId: technology.value,
            UserId: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value
          }
          // ADD MASTER NEW LEVEL
          this.props.addMasterLevel(masterData, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.ADD_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
            }
            this.props.reset();
            this.setState({
              isLoader: false,
              technology: [],
              level: [],
            })
            this.toggleDrawer('', this.state.levelType)
          })
        }
        if (this.state.levelType === 'Onboarding') {
          let OnboardingData = {
            LevelId: level.value,
            UserId: loggedInUserId(),
            ApprovalTypeId: approvalTypeObject?.value,
            OnboardingApprovalMasterId: 1
          }
          this.props.addOnboardingLevel(OnboardingData, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.ADD_LEVEL_ONBOARDING_USER_SUCCESSFULLY)
            }
            this.props.reset();
            this.setState({
              isLoader: false,
              technology: [],
              level: [],
            })
            this.toggleDrawer('', this.state.levelType)
          })
        }
      }
    }

  }


  render() {
    const { handleSubmit, isShowForm, isEditFlag } = this.props;
    const { isLoader, isSubmitted } = this.state;

    return (
      <div>
        <Drawer className="add-update-level-drawer" anchor={this.props.anchor} open={this.props.isOpen}
        // onClose={(e) => this.toggleDrawer(e)}
        >
          <Container>
            {isLoader && <LoaderCustom />}
            <div className={'drawer-wrapper'}>
              <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                <Row className="drawer-heading">
                  <Col className="d-flex">
                    {
                      isShowForm ?
                        <div className={'header-wrapper left'}>
                          <h3>{isEditFlag ? 'Update Level' : 'Add Level'}</h3>
                        </div>
                        :
                        <div className={'header-wrapper left'}>
                          <h3>{isEditFlag ? 'Update Highest Level of Approvals' : 'Set Highest Level of Approvals'}</h3>
                        </div>
                    }

                    <div
                      onClick={(e) => this.toggleDrawer(e)}
                      className={'close-button right'}>
                    </div>
                  </Col>
                </Row>
                <div className="drawer-body">

                  {this.props.isShowForm &&
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
                          onClick={this.cancel}
                          type="button"
                          value="CANCEL"
                          className="mr15 cancel-btn">
                          <div className={"cancel-icon"}></div> CANCEL</button>


                        <button
                          type="submit"
                          disabled={isSubmitted ? true : false}
                          className="user-btn save-btn"
                        >
                          <div className={"save-icon"}></div>
                          {this.state.isEditFlag ? 'Update' : 'Save'}
                        </button>


                      </div>


                    </div>}

                  {/* *********************************THIS IS LEVEL MAPPING FORM*************************************************** */}
                  {this.props.isShowMappingForm &&
                    <>
                      <Row>
                        <Col md="12">
                          <Label className={'pl0 radio-box mb-0 pb-3 d-inline-block pr-3 w-auto'} check>
                            <input
                              type="radio"
                              name="levelType"
                              checked={this.state.levelType === 'Costing' ? true : false}
                              onClick={() => this.onPressRadioLevel('Costing')}
                              disabled={this.props.isEditFlag}
                            />{' '}
                            <span>Costing</span>
                          </Label>
                          <Label className={'pl0  radio-box mb-0 pb-3 d-inline-block pr-3 w-auto'} check>
                            <input
                              type="radio"
                              name="levelType"
                              checked={this.state.levelType === 'Simulation' ? true : false}
                              onClick={() => this.onPressRadioLevel('Simulation')}
                              disabled={this.props.isEditFlag}
                            />{' '}
                            <span>Simulation</span>
                          </Label>

                          {getConfigurationKey().IsMasterApprovalAppliedConfigure &&
                            <Label className={'pl0  radio-box mb-0 pb-3 d-inline-block Onboarding pr-3 w-auto'} check>
                              <input
                                type="radio"
                                name="levelType"
                                checked={this.state.levelType === 'Master' ? true : false}
                                onClick={() => this.onPressRadioLevel('Master')}
                                disabled={this.props.isEditFlag}
                              />{' '}
                              <span>Master</span>
                            </Label>
                          }
                          <Label className={'pl0  radio-box mb-0 pb-3 d-inline-block w-auto'} check>
                            <input
                              type="radio"
                              name="levelType"
                              checked={this.state.levelType === 'Onboarding' ? true : false}
                              onClick={() => this.onPressRadioLevel('Onboarding')}
                              disabled={this.props.isEditFlag}
                            />{' '}
                            <span>Onboarding</span>
                          </Label>
                        </Col>
                      </Row >
                      <div className="row pr-0">
                        <div className="input-group  form-group col-md-12 input-withouticon" >
                          <Field
                            name="ApprovalType"
                            type="text"
                            label="Approval Type"
                            placeholder="Select"
                            className="w-100"
                            component={searchableSelect}
                            options={this.searchableSelectType('ApprovalType')}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            validate={(this.state.approvalTypeObject == null || this.state.approvalTypeObject.length === 0) ? [required] : []}
                            required={true}
                            handleChangeDescription={this.approvalTypeHandler}
                            valueDescription={this.state.approvalTypeObject}
                            disabled={isEditFlag ? true : false}
                          />
                        </div>
                        {this.state.levelType !== 'Onboarding' && <div className="input-group  form-group col-md-12 input-withouticon" >
                          <Field
                            name="TechnologyId"
                            type="text"
                            label="Technology/Heads"
                            className="w-100"
                            component={searchableSelect}
                            options={this.searchableSelectType('technology')}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            validate={(this.state.technology == null || this.state.technology.length === 0) ? [required] : []}
                            placeholder={"Select"}
                            required={true}
                            handleChangeDescription={this.technologyHandler}
                            valueDescription={this.state.technology}
                            disabled={isEditFlag ? true : false}
                          />
                        </div>}
                        <div className="input-group col-md-12  form-group input-withouticon" >
                          <Field
                            name="LevelId"
                            type="text"
                            label="Highest Approval Level"
                            className="w-100"
                            component={searchableSelect}
                            options={this.searchableSelectType('level')}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            validate={(this.state.level == null || this.state.level.length === 0) ? [required] : []}
                            required={true}
                            placeholder={"Select"}
                            handleChangeDescription={this.levelHandler}
                            valueDescription={this.state.level}
                          />
                        </div>
                        <div className="text-right mt-0 col-md-12">
                          <button
                            //disabled={pristine || submitting}
                            onClick={this.cancel}
                            type="button"
                            value="CANCEL"
                            className="reset mr15 cancel-btn">
                            <div className={"cancel-icon"}></div> CANCEL</button>
                          <button
                            type="submit"
                            disabled={isSubmitted ? true : false}
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
            {/* <LevelsListing
                    onRef={ref => (this.child = ref)}
                    getLevelDetail={this.getLevelDetail} />

                <LevelTechnologyListing
                    onRef={ref => (this.childMapping = ref)}
                    getLevelMappingDetails={this.getLevelMappingDetails}
                /> */}
          </Container >
        </Drawer >
      </div >
    );
  }
}


/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = (state) => {
  const { auth, comman } = state
  const { technologyList, levelList, simulationTechnologyList } = auth;
  const { approvalTypeSelectList } = comman;
  let initialValues = {};

  return { technologyList, levelList, simulationTechnologyList, initialValues, approvalTypeSelectList };
};

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  addUserLevelAPI,
  getUserLevelAPI,
  getAllLevelAPI,
  updateUserLevelAPI,
  setEmptyLevelAPI,
  getAllTechnologyAPI,
  setApprovalLevelForTechnology,
  getLevelMappingAPI,
  updateLevelMappingAPI,
  getSimulationTechnologySelectList,
  addSimulationLevel,
  updateSimulationLevel,
  getSimulationLevel,
  getMastersSelectList,
  addMasterLevel,
  updateMasterLevel,
  getMasterLevel,
  getApprovalTypeSelectList,
  addOnboardingLevel,
  updateOnboardingLevel,
  getOnboardingLevel
})(reduxForm({
  form: 'Level',
  enableReinitialize: true,
  touchOnChange: true
})(Level));