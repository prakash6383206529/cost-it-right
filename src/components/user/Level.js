import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText, searchableSelect } from "../layout/FormInputs";
import "./UserRegistration.scss";
import {
    addUserLevelAPI, getUserLevelAPI, getAllLevelAPI, updateUserLevelAPI,
    setEmptyLevelAPI, setApprovalLevelForTechnology, getAllTechnologyAPI,
    getLevelMappingAPI, updateLevelMappingAPI,
} from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import LevelsListing from './LevelsListing';
import LevelTechnologyListing from "./LevelTechnologyListing";
import { loggedInUserId } from "../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import $ from 'jquery';

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

                        let technologyObj = technologyList && technologyList.filter(item => item.Value == Data.TechnologyId)
                        let levelObj = levelList && levelList.filter(item => item.LevelId == Data.LevelId)

                        this.setState({
                            isEditMappingFlag: true,
                            LevelId: LevelId,
                            isShowTechnologyForm: true,
                            technology: { label: technologyObj[0].Text, value: technologyObj[0].Value },
                            level: { label: levelObj[0].LevelName, value: levelObj[0].LevelId },
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
            technologyList && technologyList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'level') {
            levelList && levelList.map(item =>
                temp.push({ label: item.LevelName, value: item.LevelId })
            );
            return temp;
        }

    }

    /**
        * @method technologyHandler
        * @description Used to handle 
        */
    technologyHandler = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
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
        if (newValue && newValue != '') {
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
        const { technology, level } = this.state;
        const { isEditFlag, reset } = this.props;
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
                    if (res.data.Result) {
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
        const { handleSubmit, pristine, reset, submitting, isShowForm,
            isShowMappingForm, isEditFlag } = this.props;
        const { isLoader, isSubmitted } = this.state;

        return (
            <div>
                {isLoader && <Loader />}
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper'}>
                            <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>

                                <Row className="drawer-heading">
                                    <Col>
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

                                <Row>


                                    {this.props.isShowForm &&
                                        <div className="col-md-12 mb20">


                                            <div className=" row form-group">
                                                <div className="input-group col-md-4 input-withouticon" >
                                                    <Field
                                                        label="Level Name"
                                                        name={"LevelName"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        maxLength={26}
                                                        customClassName={'withBorder'}
                                                    />
                                                </div>
                                                <div className="input-group  col-md-4 input-withouticon">
                                                    <Field
                                                        label="Sequence"
                                                        name={"Sequence"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[number]}
                                                        component={renderText}
                                                        required={false}
                                                        maxLength={26}
                                                        customClassName={'withBorder'}
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-center ">
                                                <input
                                                    //disabled={pristine || submitting}
                                                    onClick={this.cancel}
                                                    type="button"
                                                    value="Cancel"
                                                    className="reset mr15 cancel-btn"
                                                />
                                                <input
                                                    disabled={isSubmitted ? true : false}
                                                    type="submit"
                                                    value={isEditFlag ? 'Update' : 'Save'}
                                                    className="submit-button mr5 save-btn"
                                                />


                                            </div>


                                        </div>}


                                    {this.props.isShowMappingForm &&
                                        <div className="col-md-12">
                                            <div className="row form-group">
                                                <div className="col-md-6">
                                                    <Field
                                                        name="TechnologyId"
                                                        type="text"
                                                        label="Technology"
                                                        component={searchableSelect}
                                                        options={this.searchableSelectType('technology')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.technology == null || this.state.technology.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.technologyHandler}
                                                        valueDescription={this.state.technology}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <Field
                                                        name="LevelId"
                                                        type="text"
                                                        label="Level"
                                                        component={searchableSelect}
                                                        options={this.searchableSelectType('level')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.level == null || this.state.level.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.levelHandler}
                                                        valueDescription={this.state.level}
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-center ">
                                                <input
                                                    //disabled={pristine || submitting}
                                                    onClick={this.cancel}
                                                    type="button"
                                                    value="Cancel"
                                                    className="reset mr15 cancel-btn"
                                                />
                                                <input
                                                    disabled={isSubmitted ? true : false}
                                                    type="submit"
                                                    value={isEditFlag ? 'Update' : 'Save'}
                                                    className="submit-button mr5 save-btn"
                                                />
                                            </div>
                                        </div>}

                                </Row>
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

    if (levelDetail && levelDetail != undefined) {
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