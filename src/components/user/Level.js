import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import "./UserRegistration.scss";
import { addUserLevelAPI, getUserLevelAPI, getAllLevelAPI } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import LevelsListing from './LevelsListing';

class Level extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoader: false,
            isSubmitted: false,
            isEditFlag: false,
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {

    }

    /**
    * @method cancel
    * @description used to cancel level edit
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({ isEditFlag: false })
    }

    /**
    * @method getLevelDetail
    * @description used to get level detail
    */
    getLevelDetail = (data) => {
        if (data && data.isEditFlag) {
            this.props.getUserLevelAPI(data.LevelId, () => {
                this.setState({
                    isEditFlag: true,
                })
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
        const { isEditFlag } = this.state;
        const { reset } = this.props;
        this.setState({ isLoader: true })

        if (isEditFlag) {
            // Update existing level
            this.props.updateRoleAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_LEVEL_SUCCESSFULLY)
                }
                this.props.getAllLevelAPI(res => { })
                reset();
                this.setState({ isLoader: false, isEditFlag: false })
            })
        } else {
            // Add new level
            this.props.addUserLevelAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.ADD_LEVEL_SUCCESSFULLY)
                }
                this.props.getAllLevelAPI(res => { })
                reset();
                this.setState({ isLoader: false })
            })
        }

    }


    render() {
        const { handleSubmit, pristine, reset, submitting } = this.props;
        const { isLoader, isSubmitted } = this.state;

        return (
            <div>
                {isLoader && <Loader />}
                <div className="login-container  signup-form">
                    <div className="shadow-lg login-form">
                        <div className="form-heading">
                            <h2>
                                Add Level
                            </h2>
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
                                        label="Description"
                                        name={"Description"}
                                        type="text"
                                        placeholder={''}
                                        validate={[]}
                                        component={renderText}
                                        required={false}
                                        maxLength={26}
                                    />
                                </div>
                                <div className="input-group  col-md-4 input-withouticon">
                                    <Field
                                        label="Sequence"
                                        name={"Sequence"}
                                        type="text"
                                        placeholder={''}
                                        validate={[]}
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
                                    value="Save"
                                    className="btn  login-btn w-10 dark-pinkbtn"
                                />
                                <input
                                    disabled={pristine || submitting}
                                    onClick={this.cancel}
                                    type="submit"
                                    value="Reset"
                                    className="btn  login-btn w-10 dark-pinkbtn"
                                />
                            </div>
                        </form>
                    </div>
                </div>
                <LevelsListing
                    getLevelDetail={this.getLevelDetail} />
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
    const { levelDetail } = auth;
    let initialValues = {};

    if (levelDetail && levelDetail != undefined) {
        initialValues = {
            LevelName: levelDetail.LevelName,
            Description: levelDetail.Description,
            Sequence: levelDetail.Sequence,
        }
    }

    return { levelDetail, initialValues };
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
})(reduxForm({
    form: 'Level',
    enableReinitialize: true,
})(Level));