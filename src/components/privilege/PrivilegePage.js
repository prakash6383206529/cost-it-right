import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText, renderSelectField } from "../layout/FormInputs";
import { createPrivilegePage, getModuleSelectList } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import { toastr } from "react-redux-toastr";

class PrivilegePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoader: false,
            isSubmitted: false,
            isEditFlag: false,
            isRoot: false,
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {
        this.props.getModuleSelectList(() => { })
    }

    /**
    * @method cancel
    * @description used to cancel privilege edit
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({ isRoot: false })
    }

    /**
    * @method cancel
    * @description used to cancel privilege edit
    */
    rootHandler = () => {
        this.setState({ isRoot: !this.state.isRoot })
    }

    /**
    * @method renderTypeOfListing
    * @description Used show select listings
    */
    renderTypeOfListing = (label) => {
        const { moduleSelectList } = this.props;
        const temp = [];

        if (label === 'module') {
            moduleSelectList && moduleSelectList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

    }

    /**
    * @method handleModule
    * @description Used handle module select list
    */
    handleModule = (e) => {
        console.log("eeeee", e.target.value)
    }

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        console.log("values", values)
        const { reset } = this.props;
        const { isRoot } = this.state;
        this.setState({ isLoader: true })

        let formData = {
            PrivilageModuleId: values.PrivilageModuleId,
            PageName: values.PageName,
            FormsName: values.FormsName != undefined ? values.FormsName : values.PageName,
            IsRoot: isRoot,
            IsActive: true,
            CreatedDate: '',
            CreatedBy: ''
        }

        this.props.createPrivilegePage(formData, (res) => {
            if (res && res.data && res.data.Result) {
                toastr.success(MESSAGES.ADD_PRIVILEGE_PAGE_SUCCESSFULLY)
            }
            reset();
            this.setState({ isLoader: false, isRoot: false })
        })

    }


    render() {
        const { handleSubmit, pristine, reset, submitting } = this.props;
        const { isLoader, isSubmitted } = this.state;

        return (
            <div>
                {isLoader && <Loader />}
                <div className="login-container  signup-form">
                    <div className="shadow-lg privilege-form login-form">
                        <div className="form-heading">
                            <h2>
                                Privilege Page
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                            <div className=" row form-group">
                                <div className="input-group col-md-4 input-withouticon" >
                                    <Field
                                        label={`Privilege Module`}
                                        name={"PrivilageModuleId"}
                                        type="text"
                                        placeholder={'Enter'}
                                        validate={[required]}
                                        required={true}
                                        className=" withoutBorder custom-select"
                                        options={this.renderTypeOfListing('module')}
                                        onChange={this.handleModule}
                                        optionValue={'Value'}
                                        optionLabel={'Text'}
                                        component={renderSelectField}
                                    />
                                </div>
                                <div className="input-group col-md-3 input-withouticon" >
                                    <Field
                                        label="Page Name"
                                        name={"PageName"}
                                        type="text"
                                        placeholder={'Enter'}
                                        validate={[required, alphabetsOnlyForName]}
                                        component={renderText}
                                        required={true}
                                        maxLength={26}
                                    />
                                </div>
                                <div className="input-group  col-md-3 input-withouticon">
                                    <Field
                                        label="Forms Name"
                                        name={"FormsName"}
                                        type="text"
                                        placeholder={'Enter'}
                                        validate={[]}
                                        component={renderText}
                                        required={false}
                                        maxLength={26}
                                    />
                                </div>
                                <div className="input-group  col-md-2 input-withouticon">
                                    <label
                                        className="custom-checkbox pull-right"
                                        onChange={this.rootHandler}
                                    >
                                        Is Root
                                                <input type="checkbox" checked={this.state.isRoot} />
                                        <span
                                            className=" before-box"
                                            checked={this.state.isRoot}
                                            onChange={this.rootHandler}
                                        />
                                    </label>
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
                                    type="button"
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
    const { moduleSelectList } = auth;
    return { moduleSelectList };
};

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createPrivilegePage,
    getModuleSelectList,
})(reduxForm({
    form: 'PrivilegePage',
    enableReinitialize: true,
})(PrivilegePage));