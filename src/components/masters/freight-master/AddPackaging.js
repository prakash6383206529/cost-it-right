import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import "react-datepicker/dist/react-datepicker.css";
import { validateForm } from '../../layout/FormInputs';

class AddPackaging extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            IsVendor: false,
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, } = this.props;
        const { isEditFlag, } = this.state;

        return (
            <>
                <div>
                    <div className="login-container signup-form">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="shadow-lgg login-formg">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-heading mb-0">
                                                <h2>{isEditFlag ? `Update Packaging Details` : `Add Packaging Details`}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                    >
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {


    return {

    }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {

})(reduxForm({
    form: 'AddPackaging',
    validate: validateForm,
    enableReinitialize: true,
    touchOnChange: true
})(AddPackaging));
