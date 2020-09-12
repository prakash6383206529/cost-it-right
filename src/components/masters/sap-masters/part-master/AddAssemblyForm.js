import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Label, CustomInput } from 'reactstrap';
import { required, number, upper, email, minLength7, maxLength70 } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderEmailInputField, renderMultiSelectField,
    searchableSelect
} from "../../../layout/FormInputs";
import { } from '../../../../actions/master/Supplier';
import { } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import HeaderTitle from '../../../common/HeaderTitle';

class AddAssemblyForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            assemblyPart: [],
            parentPart: [],
            isAddMore: false,
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {

    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        const { isEditFlag } = this.props;

        if (isEditFlag) {

        } else {

        }
    }

    checkRadio = (radioType) => {
        this.setState({ childType: radioType })
    }

    /**
    * @method handleAssemblyPartChange
    * @description  used to handle 
    */
    handleAssemblyPartChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ assemblyPart: newValue });
        } else {
            this.setState({ assemblyPart: [], });
        }
    }

    /**
    * @method handleParentPartChange
    * @description  used to handle 
    */
    handleParentPartChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ parentPart: newValue });
        } else {
            this.setState({ parentPart: [], });
        }
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { } = this.props;
        const temp = [];
        // if (label === 'country') {
        //     countryList && countryList.map(item =>
        //         temp.push({ label: item.Text, value: item.Value })
        //     );
        //     return temp;
        // }

    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.props.toggleDrawer('')
        //this.props.getRMSpecificationDataAPI('', res => { });
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { isAddMore } = this.state;

        /** Update existing detail of supplier master **/
        if (this.props.isEditFlag) {
            const { supplierId } = this.props;
            let formData = {

            }

            // this.props.updateSupplierAPI(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_SUPPLIER_SUCESS);
            //         this.props.toggleDrawer('')
            //     }
            // });

        } else {/** Add new detail for creating supplier master **/

            let formData = {

            }
            // this.props.createSupplierAPI(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.SUPPLIER_ADDED_SUCCESS);
            //         this.props.toggleDrawer('')
            //     }
            // });
        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset } = this.props;
        const { childType } = this.state;
        return (
            <>

                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >
                    <Row>
                        <Col md='6'>
                            <Field
                                name="AssemblyPart"
                                type="text"
                                label={'Assembly Part No.'}
                                component={searchableSelect}
                                placeholder={'Assembly Part'}
                                options={this.renderListing('assemblyPart')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.assemblyPart == null || this.state.assemblyPart.length == 0) ? [required] : []}
                                required={true}
                                handleChangeDescription={this.handleAssemblyPartChange}
                                valueDescription={this.state.assemblyPart}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Assembly Name`}
                                name={"AssemblyName"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>

                        <Col md="6">
                            <Field
                                label={`Description`}
                                name={"Description"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`ECO No.`}
                                name={"ECONumber"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>

                        <Col md="6">
                            <Field
                                label={`Revision No.`}
                                name={"RevisionNumber"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Drawing No.`}
                                name={"DrawingNumber"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>

                        <Col md="6">
                            <Field
                                label={`Group Code`}
                                name={"GroupCode"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`RM Material`}
                                name={"RawMaterial"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>

                        <Col md="6">
                            <Field
                                label={`Quantity`}
                                name={"Quantity"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={false}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`BOM Level`}
                                name={"BOMLevel"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={false}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col md="12">
                            <HeaderTitle
                                title={'Association:'}
                                customClass={'Personal-Details'} />
                        </Col>
                        <Col md='6'>
                            <Field
                                name="Parent"
                                type="text"
                                label={'Parent'}
                                component={searchableSelect}
                                placeholder={'Parent Part'}
                                options={this.renderListing('parentPart')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.parentPart == null || this.state.parentPart.length == 0) ? [required] : []}
                                required={true}
                                handleChangeDescription={this.handleParentPartChange}
                                valueDescription={this.state.parentPart}
                            />
                        </Col>
                    </Row>

                    <Row className="sf-btn-footer no-gutters justify-content-between">
                        <div className="col-md-12">
                            <div className="text-center ">
                                <input
                                    //disabled={pristine || submitting}
                                    onClick={this.cancel}
                                    type="button"
                                    value="Cancel"
                                    className="reset mr15 cancel-btn"
                                />
                                <input
                                    //disabled={isSubmitted ? true : false}
                                    type="submit"
                                    onClick={() => this.setState({ isAddMore: true })}
                                    value={'ADD MORE'}
                                    className="submit-button mr5 save-btn"
                                />
                                <input
                                    //disabled={isSubmitted ? true : false}
                                    type="submit"
                                    onClick={() => this.setState({ isAddMore: false })}
                                    value={isEditFlag ? 'Update' : 'Save'}
                                    className="submit-button mr5 save-btn"
                                />
                            </div>
                        </div>
                    </Row>
                </form>
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ }) {

    return {}
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {

})(reduxForm({
    form: 'AddAssemblyForm',
    enableReinitialize: true,
})(AddAssemblyForm));
