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

class AddComponentForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            part: [],
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
    * @method handlePartChange
    * @description  used to handle 
    */
    handlePartChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ part: newValue });
        } else {
            this.setState({ part: [], });
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
        const { } = this.state;

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
            console.log('formData', formData)
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
                                name="PartNumber"
                                type="text"
                                label={'Part No.'}
                                component={searchableSelect}
                                placeholder={'--Select Part--'}
                                options={this.renderListing('part')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.part == null || this.state.part.length == 0) ? [required] : []}
                                required={true}
                                handleChangeDescription={this.handlePartChange}
                                valueDescription={this.state.part}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Part Name`}
                                name={"PartName"}
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
                                label={`Part Description`}
                                name={"PartDescription"}
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
                                label={`Plant`}
                                name={"plant"}
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
                                    value={isEditFlag ? 'Update' : 'Save'}
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
    form: 'AddComponentForm',
    enableReinitialize: true,
})(AddComponentForm));
