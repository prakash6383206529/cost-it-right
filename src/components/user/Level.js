import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import Toaster from "../common/Toaster";
import { connect } from "react-redux";
import { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80, postiveNumber, maxLength2 } from "../../helper/validation";
import { renderText, searchableSelect } from "../layout/FormInputs";
import "./UserRegistration.scss";
import {
  addUserLevelAPI, getUserLevelAPI, getAllLevelAPI, updateUserLevelAPI, setEmptyLevelAPI, setApprovalLevelForTechnology, getAllTechnologyAPI,
  getLevelMappingAPI, updateLevelMappingAPI, getSimulationTechnologySelectList, addSimulationLevel, updateSimulationLevel, getSimulationLevel, getMastersSelectList,
  addMasterLevel, updateMasterLevel, getMasterLevel
} from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { getConfigurationKey, loggedInUserId } from "../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import { Container, Row, Col, Label, } from 'reactstrap';
import LoaderCustom from "../common/LoaderCustom";

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
    };
  }

  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {

    if (this.props.isEditFlag) {
      this.props.getAllLevelAPI(() => { this.setState({ isLoader: this.props.isEditFlag ? true : false }) })
      this.getLevelDetail()
      this.getLevelMappingDetail()
    } else {
      if (this.state.levelType === 'Costing') {
        this.props.getAllTechnologyAPI(() => { })
      } else if (this.state.levelType === 'Simulation') {
        this.props.getSimulationTechnologySelectList(() => { })
      }
      this.props.getAllLevelAPI(() => { this.setState({ isLoader: this.props.isEditFlag ? true : false }) })
      this.getLevelDetail()
      this.getLevelMappingDetail()
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
  * @method getLevelMappingDetail
  * @description used to get level detail
  */
  getLevelMappingDetail = () => {
    const { isShowMappingForm, isEditFlag, TechnologyId, isEditedlevelType } = this.props;

    // WHEN COSTING LEVEL DETAILS GET
    if (isEditFlag && isShowMappingForm && isEditedlevelType === 'Costing') {
      this.props.getLevelMappingAPI(TechnologyId, (res) => {

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
          }, 500)
        }
      })
    }

    // WHEN SIMULATION LEVEL DETAILS GET
    if (isEditFlag && isShowMappingForm && isEditedlevelType === 'Simulation') {
      this.props.getSimulationLevel(TechnologyId, (res) => {

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
          }, 500)
        }
      })
    }

    // WHEN MASTER LEVEL DETAILS GET
    if (isEditFlag && isShowMappingForm && isEditedlevelType === 'Master') {
      this.props.getMasterLevel(TechnologyId, (res) => {
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
    const { technologyList, levelList, simulationTechnologyList } = this.props;
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
    if (label === 'Costing') {
      this.props.getAllTechnologyAPI(() => { })
    } else if (label === 'Simulation') {
      this.props.getSimulationTechnologySelectList(() => { })
    }
    this.setState({ levelType: label });
    this.setState({ technology: [], level: [] });
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
    this.toggleDrawer('cancel')
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

  toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.setState({
      technology: [],
      level: [],
    })

    this.props.setEmptyLevelAPI('', () => { })
    if (event === 'cancel') {
      this.props.closeDrawer('cancel')
    } else {
      this.props.closeDrawer('')
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

    const { technology, level } = this.state;
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
            ModifiedBy: loggedInUserId()
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
              this.toggleDrawer('')
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
            ModifiedBy: loggedInUserId()
          }
          if (this.state.dataToCheck.label === formReq.Level) {
            this.toggleDrawer('')
            return false
          }
          this.props.updateSimulationLevel(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
            }
            this.toggleDrawer('')
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
            ModifiedBy: loggedInUserId()
          }
          if (this.state.dataToCheck.label === formReq.Level) {
            this.toggleDrawer('')
            return false
          }
          this.props.updateMasterLevel(formReq, (res) => {
            if (res && res.data && res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
            }
            this.toggleDrawer('')
            reset();
          })
        }

      } else {

        let formData = {
          LevelId: level.value,
          TechnologyId: technology.value,
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
            this.toggleDrawer('')
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
            this.toggleDrawer('')
          })
        }
        if (this.state.levelType === 'Master') {
          let masterData = {
            LevelId: level.value,
            MasterId: technology.value,
            UserId: loggedInUserId()
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
            this.toggleDrawer('')
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
                          <h3>{isEditFlag ? 'Update Level Mapping' : 'Add Level Mapping'}</h3>
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
                            <span>Costing Level</span>
                          </Label>
                          <Label className={'pl0  radio-box mb-0 pb-3 d-inline-block pr-3 w-auto'} check>
                            <input
                              type="radio"
                              name="levelType"
                              checked={this.state.levelType === 'Simulation' ? true : false}
                              onClick={() => this.onPressRadioLevel('Simulation')}
                              disabled={this.props.isEditFlag}
                            />{' '}
                            <span>Simulation Level</span>
                          </Label>

                          {
                            getConfigurationKey().IsMasterApprovalAppliedConfigure &&
                            <Label className={'pl0  radio-box mb-0 pb-3 d-inline-block  w-auto'} check>
                              <input
                                type="radio"
                                name="levelType"
                                checked={this.state.levelType === 'Master' ? true : false}
                                onClick={() => this.onPressRadioLevel('Master')}
                                disabled={this.props.isEditFlag}
                              />{' '}
                              <span>Master Level</span>
                            </Label>
                          }
                        </Col>
                      </Row>
                      <div className="row pr-0">
                        <div className="input-group  form-group col-md-12 input-withouticon" >
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
                        </div>
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


                </div>

              </form>
            </div>
            {/* <LevelsListing
                    onRef={ref => (this.child = ref)}
                    getLevelDetail={this.getLevelDetail} />

                <LevelTechnologyListing
                    onRef={ref => (this.childMapping = ref)}
                    getLevelMappingDetail={this.getLevelMappingDetail}
                /> */}
          </Container>
        </Drawer>
      </div>
    );
  }
}


/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = ({ auth }) => {
  const { technologyList, levelList, simulationTechnologyList } = auth;
  let initialValues = {};

  return { technologyList, levelList, simulationTechnologyList, initialValues };
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
  getMasterLevel
})(reduxForm({
  form: 'Level',
  enableReinitialize: true,
  touchOnChange: true
})(Level));