import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import Toaster from "../common/Toaster";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { searchableSelect, focusOnError, validateForm } from "../layout/FormInputs";
import "./UserRegistration.scss";
import {
    addUserLevelAPI, getAllTechnologyAPI, getAllLevelAPI, getAllUserAPI,
    assignUserLevelAPI
} from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { withTranslation } from "react-i18next";

class LevelUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoader: false,
            isSubmitted: false,
            technology: [],
            level: [],
            user: [],
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {
        this.props.getAllTechnologyAPI(() => { })
        this.props.getAllLevelAPI(() => { })
        this.props.getAllUserAPI(() => { })
    }

    /**
    * @method selectType
    * @description Used show listing of unit of measurement
    */
    searchableSelectType = (label) => {
        const { technologyList, levelList, userList } = this.props;
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

        if (label === 'user') {
            userList && userList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
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
    * @method userHandler
    * @description Used to handle 
    */
    userHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ user: newValue });
        } else {
            this.setState({ user: [] });
        }
    };

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        const { technology, level, user } = this.state;

        // if (technology.length == 0 || level.length == 0 || user.length == 0) {
        //     return false;
        // }
        this.setState({ isLoader: true })

        let formData = {
            LevelId: level.value,
            UserId: user.value,
            TechnologyId: technology.value,
        }

        this.props.assignUserLevelAPI(formData, (res) => {
            if (res.data.Result) {
                Toaster.success(MESSAGES.ADD_LEVEL_USER_SUCCESSFULLY)
            }
            this.props.reset();
            this.setState({
                isLoader: false,
                technology: [],
                level: [],
                user: [],
            })
        })

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
                                Level Users
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                            <div className="row form-group">
                                <div className="col-md-12">
                                    <Field
                                        name="TechnologyId"
                                        type="text"
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        label={this.props.t('TechnologyLabel', { ns: 'MasterLabels', defaultValue: 'Technology' })}
                                        component={searchableSelect}
                                        //validate={[required, maxLength50]}
                                        options={this.searchableSelectType('technology')}
                                        //required={true}
                                        handleChangeDescription={this.technologyHandler}
                                        valueDescription={this.state.technology}
                                    />
                                </div>
                                <div className="col-md-12">
                                    <Field
                                        name="LevelId"
                                        type="text"
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        label="Level"
                                        component={searchableSelect}
                                        //validate={[required, maxLength50]}
                                        options={this.searchableSelectType('level')}
                                        //required={true}
                                        handleChangeDescription={this.levelHandler}
                                        valueDescription={this.state.level}
                                    />
                                </div>
                                <div className="col-md-12">
                                    <Field
                                        name="UserId"
                                        type="text"
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        label="User"
                                        component={searchableSelect}
                                        //validate={[required, maxLength50]}
                                        options={this.searchableSelectType('user')}
                                        //required={true}
                                        handleChangeDescription={this.userHandler}
                                        valueDescription={this.state.user}
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
                                    onClick={reset}
                                    type="submit"
                                    value="Reset"
                                    className="btn  login-btn w-10 dark-pinkbtn"
                                />
                            </div>
                        </form>
                    </div>
                </div>
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
    const { technologyList, levelList, userList } = auth;

    return { technologyList, levelList, userList };
};

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
    addUserLevelAPI,
    getAllTechnologyAPI,
    getAllLevelAPI,
    getAllUserAPI,
    assignUserLevelAPI,
})(reduxForm({
    form: 'LevelUser',
    validate: validateForm,
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
    touchOnChange: true
})(withTranslation(['MasterLabels'])(LevelUser)));