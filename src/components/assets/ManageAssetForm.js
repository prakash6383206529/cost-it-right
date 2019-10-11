import React from 'react'
import { connect } from "react-redux";
import { toastr } from 'react-redux-toastr';
import { } from "../../actions/Index";
import { Field, reduxForm } from 'redux-form';
import { langs } from "../../config/localization";
import { renderSelectField, renderTextInputField, focusOnError, renderTextAreaField } from '../layout/FormInputs'
import { getSites } from '../../actions/SiteActions';
import { updateAsset, addAsset } from '../../actions/AssetActions';
import { getAuthUserDetails } from '../../actions/CommonActions';
import { getLocations } from '../../actions/LocationActions';


class ManageAssetForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            title: "Add",
            disabled: false,
        };
        this.handleCancel = this.handleCancel.bind(this);
    }

    /** Fetch all list on component will mount  */
    componentWillMount() {
        if (this.props.assetDetail !== "") {
            this.setState({ title: "Edit" });
        }
        this.props.getLocations();
        this.props.getSites(function (response) { });
    }

    /**Close the popup  */
    handleCancel() {
        this.props.onClose('', '', 'Cancel');
    };


    /**
     * Submit the Site detail  form
     * @param values
     */
    onSubmit(values) {
        this.setState({ disabled: true });
        if (values.location === "") {
            delete values.location;
        }
        /** Update detail of the existing asset  */
        if (this.props.assetDetail !== "") {
            this.props.updateAsset(this.props.assetDetail._id, values, (response) => {
                if (response) {
                    this.setState({ disabled: false });
                    if (response.status === 204) {
                        // toastr.success(langs.messages.record_updated_success);
                        this.props.onClose('', '', 'Ok');
                    } else {
                        if (response.status === 400) {
                            toastr.error(langs.error, response.data);
                        } else {
                            toastr.error(langs.error, langs.messages.default_error);
                        }
                    }
                } else {
                    toastr.error(langs.error, langs.messages.default_error);
                }
            });
        } else {   /** Add new detail of the asset  */
            const userDetail = JSON.parse(getAuthUserDetails());
            values.isActive = true;
            values.site = this.props.siteId;
            values.organisation = userDetail.data.organisation;
            this.props.addAsset(values, (response) => {
                this.setState({ disabled: false });
                if (response) {

                    if (response.status === 201) {
                        toastr.success(langs.messages.record_added_success);
                        this.props.onClose('', '', 'Ok');
                    } else {
                        if (response.status === 400) {
                            toastr.error(langs.error, response.data);
                        } else {
                            toastr.error(langs.error, langs.messages.default_error);
                        }
                    }
                } else {
                    toastr.error(langs.error, langs.messages.default_error);
                }
            });
        }
    }

    render() {
        const { handleSubmit, locationList } = this.props;
        const isOpenClass = this.props.open === true ? { display: "block" } : { display: "none" };
        return (
            <div className="modal show fade" style={isOpenClass}>
                <div className="modal-dialog ">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{this.state.title} Asset</h5>
                            <button onClick={this.handleCancel} type="button" className="close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form noValidate className="form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                                <div className="form-group">
                                    <Field
                                        name="name"
                                        label="Asset Name"
                                        placeholder="Enter a name"
                                        component={renderTextInputField}
                                    />
                                </div>
                                <div className="form-group">
                                    <Field
                                        name="description"
                                        label="Description"
                                        placeholder="Enter a description"
                                        component={renderTextAreaField}
                                    />
                                </div>
                                <div className="form-group">
                                    <Field
                                        name="location"
                                        label="Location"
                                        options={locationList}
                                        optionValue="_id"
                                        optionLabel="name"
                                        component={renderSelectField}
                                    />
                                </div>

                                <div className="modal-footer">

                                    <button type="submit" value={`${this.state.title} Site `} disabled={this.state.disabled} className="btn btn-primary">Save changes</button>
                                    <button onClick={this.handleCancel} type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}



/**
 * Form validations
 * @param values
 * @returns {{}}
 */
function validate(values) {
    let errors = {};

    if (!values.name) {
        errors.name = langs.validation_messages.field_required;
    }

    if (values.name && values.name.length > 30) {
        errors.name = langs.validation_messages.text_length;
    }

    if (values.description && values.description.length > 300) {
        errors.description = langs.validation_messages.text_area_length;
    }

    return errors;
}

//Map state to props
function mapStateToProps(state, localProps) {
    let returnObj = {
        locationList: [],
        initialValues: {}
    };

    if (localProps.assetDetail !== "") {
        returnObj.initialValues = {
            name: localProps.assetDetail.name,
            description: localProps.assetDetail.description,
            site: localProps.assetDetail.site._id,
            location: (localProps.assetDetail.location !== undefined) ? localProps.assetDetail.location._id : "",
        };
    }
    /** Getting list of the location and site from the state */
    returnObj.locationList = (typeof state.location.locationList !== 'undefined') ? state.location.locationList : [];

    return returnObj;
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
    {
        addAsset,
        updateAsset,
        getLocations,
        getSites
    }
)(reduxForm({
    validate,
    form: 'manageAsset',
    enableReinitialize: true,
    onSubmitFail: (errors) => {
        focusOnError(errors)
    }
})(ManageAssetForm));