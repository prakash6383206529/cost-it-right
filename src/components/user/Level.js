import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, number, checkWhiteSpaces, alphaNumeric, notSingleSpecialCharacter, acceptAllExceptSingleSpecialCharacter, maxLength80, postiveNumber, maxLength2 } from "../../helper/validation";
import { renderText, searchableSelect } from "../layout/FormInputs";
import "./UserRegistration.scss";
import {
  addUserLevelAPI, getUserLevelAPI, getAllLevelAPI, updateUserLevelAPI,
  setEmptyLevelAPI, setApprovalLevelForTechnology, getAllTechnologyAPI,
  getLevelMappingAPI, updateLevelMappingAPI,
} from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { loggedInUserId } from "../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import { Container, Row, Col, } from 'reactstrap';

/**************************************THIS FILE IS FOR ADDING LEVEL MAPPING*****************************************/
class Level extends Component {
  constructor(props) {
    super(props);
    //this.child = React.createRef();
    //this.childMapping = React.createRef();
    this.state = {
      isLoader: false,
      isSubmitted: false,
      isEditFlag: false,
      isEditMappingFlag: false,
      LevelId: '',
      isShowForm: false,
      isShowTechnologyForm: false,
      technology: [],
      level: [],
    };
  }

  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {
    this.props.setEmptyLevelAPI('', () => { })
    this.props.getAllTechnologyAPI(() => { })
    this.props.getAllLevelAPI(() => { })
    this.getLevelDetail()
    this.getLevelMappingDetail()
  }

  /**
  * @method getLevelDetail
  * @description used to get level detail
  */
  getLevelDetail = () => {
    const { isShowForm, isEditFlag, LevelId } = this.props;
    if (isEditFlag && isShowForm) {
      //$('html, body').animate({ scrollTop: 0 }, 'slow');
      this.props.getUserLevelAPI(LevelId, () => { })
    }
  }

  /**
  * @method getLevelMappingDetail
  * @description used to get level detail
  */
  getLevelMappingDetail = () => {
    const { isShowMappingForm, isEditFlag, LevelId } = this.props;
    if (isEditFlag && isShowMappingForm) {
      //$('html, body').animate({ scrollTop: 200 }, 'slow');
      this.props.getLevelMappingAPI(LevelId, (res) => {
        const { technologyList, levelList } = this.props;

        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;

          setTimeout(() => {

            let technologyObj = technologyList && technologyList.filter(item => item.Value === Data.TechnologyId)
            let levelObj = levelList && levelList.filter(item => item.Value === Data.LevelId)

            this.setState({
              isEditMappingFlag: true,
              LevelId: LevelId,
              isShowTechnologyForm: true,
              technology: { label: technologyObj[0].Text, value: technologyObj[0].Value },
              level: { label: levelObj[0].Text, value: levelObj[0].Value },
            })
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
    const { technologyList, levelList } = this.props;
    const temp = [];

    if (label === 'technology') {
      technologyList && technologyList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
      }

      );
      return temp;
    }

    if (label === 'level') {
      let level = 5

      // for (let i = 1; i <= level; i++) {
      //   temp.push({ label: `L-${i}`, value: i })
      // }
      levelList && levelList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
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
    this.toggleDrawer('')
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
    this.props.closeDrawer('')
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
    const { isShowForm, isShowMappingForm, isEditFlag, LevelId, reset } = this.props;
    const { technology, level } = this.state;
    this.setState({ isLoader: true })

    if (isShowForm) {
      if (isEditFlag) {
        // Update existing level

        let formReq = {
          LevelId: LevelId,
          IsActive: true,
          CreatedDate: '',
          LevelName: values.LevelName,
          Description: values.Description,
          Sequence: values.Sequence,
        }

        this.props.updateUserLevelAPI(formReq, (res) => {
          if (res && res.data && res.data.Result) {
            toastr.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
          }
          this.toggleDrawer('')
          reset();
          this.setState({ isLoader: false, })
          //this.child.getUpdatedData();
        })
      } else {
        // Add new level
        this.props.addUserLevelAPI(values, (res) => {
          if (res && res.data && res.data.Result) {
            toastr.success(MESSAGES.ADD_LEVEL_SUCCESSFULLY)
          }
          this.toggleDrawer('')
          //this.child.getUpdatedData();
          reset();
          this.setState({ isLoader: false })
        })
      }
    }

    if (isShowMappingForm) {
      if (isEditFlag) {
        // Update existing level

        let formReq = {
          TechnologyId: technology.value,
          LevelId: level.value,
          Technology: technology.value,
          Level: level.label,
          ModifiedBy: loggedInUserId()
        }

        this.props.updateLevelMappingAPI(formReq, (res) => {
          if (res && res.data && res.data.Result) {
            toastr.success(MESSAGES.UPDATE_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
            reset();
            this.setState({
              isLoader: false,
              technology: [],
              level: [],
            })
            this.toggleDrawer('')
            //this.childMapping.getUpdatedData();
          }
        })
      } else {

        let formData = {
          LevelId: level.value,
          TechnologyId: technology.value,
        }
        this.props.setApprovalLevelForTechnology(formData, (res) => {
          if (res && res.data && res.data.Result) {
            toastr.success(MESSAGES.ADD_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY)
          }
          this.props.reset();
          this.setState({
            isLoader: false,
            technology: [],
            level: [],
          })
          this.toggleDrawer('')
          //this.childMapping.getUpdatedData();
        })
      }
    }

  }


  render() {
    const { handleSubmit, isShowForm, isEditFlag } = this.props;
    const { isLoader, isSubmitted } = this.state;

    return (
      <div>
        {isLoader && <Loader />}
        <Drawer className="add-update-level-drawer" anchor={this.props.anchor} open={this.props.isOpen} 
        // onClose={(e) => this.toggleDrawer(e)}
        >
          <Container>
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
                          className="reset mr15 cancel-btn">
                          <div className={'cross-icon'}><img src={require('../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> CANCEL</button>


                        <button
                          type="submit"
                          disabled={isSubmitted ? true : false}
                          className="btn-primary save-btn"
                        >	<div className={'check-icon'}><img src={require('../../assests/images/check.png')} alt='check-icon.jpg' />
                          </div>
                          {this.state.isEditFlag ? 'Update' : 'Save'}
                        </button>


                      </div>


                    </div>}

                  {/* *********************************THIS IS LEVEL MAPPING FORM*************************************************** */}
                  {this.props.isShowMappingForm &&
                    <div className="row pr-0">
                      <div className="input-group  form-group col-md-12 input-withouticon" >
                        <Field
                          name="TechnologyId"
                          type="text"
                          label="Technology"
                          className="w-100"
                          component={searchableSelect}
                          options={this.searchableSelectType('technology')}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={(this.state.technology == null || this.state.technology.length === 0) ? [required] : []}
                          placeholder={"Select"}
                          required={true}
                          handleChangeDescription={this.technologyHandler}
                          valueDescription={this.state.technology}
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
                        {/* <input
                            //disabled={pristine || submitting}
                            onClick={this.cancel}
                            type="button"
                            value="Cancel"
                            className="reset mr15 cancel-btn"
                          /> */}
                        <button
                          //disabled={pristine || submitting}
                          onClick={this.cancel}
                          type="button"
                          value="CANCEL"
                          className="reset mr15 cancel-btn">
                          <div className={'cross-icon'}><img src={require('../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> CANCEL</button>
                        {/* <input
                            disabled={isSubmitted ? true : false}
                            type="submit"
                            value={isEditFlag ? 'Update' : 'Save'}
                            className="submit-button mr5 save-btn"
                          /> */}

                        <button
                          type="submit"
                          disabled={isSubmitted ? true : false}
                          className="btn-primary save-btn"
                        >	<div className={'check-icon'}><img src={require('../../assests/images/check.png')} alt='check-icon.jpg' />
                          </div>
                          {isEditFlag ? 'Update' : 'Save'}
                        </button>
                      </div>
                    </div>}


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
  const { levelDetail, technologyList, levelList } = auth;
  let initialValues = {};

  if (levelDetail && levelDetail !== undefined) {
    initialValues = {
      LevelName: levelDetail.LevelName,
      Description: levelDetail.Description,
      Sequence: levelDetail.Sequence,
    }
  }

  return { levelDetail, technologyList, levelList, initialValues };
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
})(reduxForm({
  form: 'Level',
  enableReinitialize: true,
})(Level));