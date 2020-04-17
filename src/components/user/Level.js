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
import $ from 'jquery';

class Level extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.childMapping = React.createRef();
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
            isEditFlag: false,
            isEditMappingFlag: false,
            isShowForm: false,
            isShowTechnologyForm: false,
            technology: [],
            level: [],
        })
        this.props.setEmptyLevelAPI('', () => { })
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

    /**
    * @method getLevelDetail
    * @description used to get level detail
    */
    getLevelDetail = (data) => {
        if (data && data.isEditFlag) {
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getUserLevelAPI(data.LevelId, () => {
                this.setState({
                    isEditFlag: true,
                    LevelId: data.LevelId,
                    isShowForm: true,
                })
            })
        }
    }

    /**
    * @method getLevelMappingDetail
    * @description used to get level detail
    */
    getLevelMappingDetail = (data) => {
        if (data && data.isEditMappingFlag) {
            $('html, body').animate({ scrollTop: 200 }, 'slow');
            this.props.getLevelMappingAPI(data.LevelId, (res) => {
                const { technologyList, levelList } = this.props;
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;

                    setTimeout(() => {

                        let technologyObj = technologyList && technologyList.filter(item => item.Value == Data.TechnologyId)
                        let levelObj = levelList && levelList.filter(item => item.LevelId == Data.LevelId)
                        console.log('technologyObj', technologyObj)
                        console.log('levelObj', levelObj)

                        this.setState({
                            isEditMappingFlag: true,
                            LevelId: data.LevelId,
                            isShowTechnologyForm: true,
                            technology: { label: technologyObj[0].Text, value: technologyObj[0].Value },
                            level: { label: levelObj[0].LevelName, value: levelObj[0].LevelId },
                        })
                    }, 500)
                }
            })
        }
    }

    submitLevelTechnology = () => {
        const { technology, level, isEditMappingFlag } = this.state;
        const { reset } = this.props;
        this.setState({ isLoader: true })

        if (isEditMappingFlag) {
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
                        isEditMappingFlag: false,
                        isShowTechnologyForm: false,
                        technology: [],
                        level: [],
                    })
                    this.childMapping.getUpdatedData();
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
                this.childMapping.getUpdatedData();
            })
        }

    }

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        const { isEditFlag, LevelId } = this.state;
        const { reset } = this.props;
        this.setState({ isLoader: true })

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
                this.props.getAllLevelAPI(res => { })
                this.props.setEmptyLevelAPI('', () => { })
                reset();
                this.setState({
                    isLoader: false,
                    isEditFlag: false,
                    isShowForm: false,
                })
                this.child.getUpdatedData();
            })
        } else {
            // Add new level
            this.props.addUserLevelAPI(values, (res) => {
                if (res && res.data && res.data.Result) {
                    toastr.success(MESSAGES.ADD_LEVEL_SUCCESSFULLY)
                }
                this.props.getAllLevelAPI(res => { })
                this.child.getUpdatedData();
                reset();
                this.setState({ isLoader: false, isShowForm: false, })
            })
        }

    }


    render() {
        const { handleSubmit, pristine, reset, submitting } = this.props;
        const { isLoader, isSubmitted, isEditFlag } = this.state;

        return (
            <div>
                {isLoader && <Loader />}
                <div className="login-container  signup-form">
                    <div className="row">
                        <div className="col-md-12" >
                            <button
                                type="button"
                                className={'btn btn-primary user-btn mr20'}
                                onClick={() => this.setState({ isShowTechnologyForm: !this.state.isShowTechnologyForm })}>Level Mapping</button>
                            <button
                                type="button"
                                className={'btn btn-primary user-btn mr20'}
                                onClick={() => this.setState({ isShowForm: !this.state.isShowForm })}>Add</button>
                        </div>




                        {this.state.isShowForm &&
                            <div className="col-md-12 mb20">
                                <div className="shadow-lg login-form">
                                    <div className="form-heading">
                                        <h2>{isEditFlag ? 'Update Level' : 'Add Level'}</h2>
                                    </div>
                                    <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
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
                                                />
                                            </div>
                                        </div>

                                        <div className="text-center ">
                                            <input
                                                disabled={isSubmitted ? true : false}
                                                type="submit"
                                                value={this.state.isEditFlag ? 'Update' : 'Save'}
                                                className="btn login-btn w-10 dark-pinkbtn mr15"
                                            />
                                            {!this.state.isEditFlag &&
                                                <input
                                                    disabled={pristine || submitting}
                                                    onClick={this.resetForm}
                                                    type="submit"
                                                    value="Reset"
                                                    className="btn  login-btn w-10 dark-pinkbtn"
                                                />}
                                            {isEditFlag &&
                                                <input
                                                    //disabled={pristine || submitting}
                                                    onClick={this.cancel}
                                                    type="button"
                                                    value="Cancel"
                                                    className="btn  login-btn w-10 dark-pinkbtn"
                                                />}
                                        </div>
                                    </form>
                                </div>
                            </div>}



                        {this.state.isShowTechnologyForm &&
                            <div className="col-md-12">
                                <div className="shadow-lg login-form level-mapping">
                                    <div className="form-heading">
                                        <h2>{this.state.isEditMappingFlag ? 'Update Level Mapping' : 'Add Level Mapping'}</h2>
                                    </div>
                                    <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                                        <div className="row form-group">
                                            <div className="col-md-6">
                                                <Field
                                                    name="TechnologyId"
                                                    type="text"
                                                    label="Technology"
                                                    component={searchableSelect}
                                                    options={this.searchableSelectType('technology')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    //validate={[required, maxLength50]}
                                                    //required={true}
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
                                                    //validate={[required, maxLength50]}
                                                    //required={true}
                                                    handleChangeDescription={this.levelHandler}
                                                    valueDescription={this.state.level}
                                                />
                                            </div>
                                        </div>

                                        <div className="text-center ">
                                            <input
                                                disabled={isSubmitted ? true : false}
                                                type="button"
                                                onClick={this.submitLevelTechnology}
                                                value="Save"
                                                className="btn login-btn w-10 dark-pinkbtn mr15"
                                            />
                                            {!this.state.isEditMappingFlag &&
                                                <input
                                                    disabled={pristine || submitting}
                                                    onClick={this.resetMappingForm}
                                                    type="submit"
                                                    value={this.state.isEditMappingFlag ? 'Update' : 'Save'}
                                                    className="btn  login-btn w-10 dark-pinkbtn"
                                                />}
                                            {this.state.isEditMappingFlag &&
                                                <input
                                                    //disabled={pristine || submitting}
                                                    onClick={this.cancel}
                                                    type="button"
                                                    value="Cancel"
                                                    className="btn  login-btn w-10 dark-pinkbtn"
                                                />}
                                        </div>
                                    </form>
                                </div>
                            </div>}

                    </div>
                </div>
                <LevelsListing
                    onRef={ref => (this.child = ref)}
                    getLevelDetail={this.getLevelDetail} />

                <LevelTechnologyListing
                    onRef={ref => (this.childMapping = ref)}
                    getLevelMappingDetail={this.getLevelMappingDetail}
                />
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