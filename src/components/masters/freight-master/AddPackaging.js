import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from "redux-form";
import { } from 'reactstrap';
import { checkForNull, } from "../../../helper/validation";
import {

} from "../../layout/FormInputs";
import {

} from '../../../actions/Common';
import {

} from '../sap-masters/actions/BoughtOutParts';

import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";

import "react-datepicker/dist/react-datepicker.css";
import $ from 'jquery';

import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import moment from 'moment';

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
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

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
                                            <div className="form-heading">
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
    enableReinitialize: true,
})(AddPackaging));
