import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required, number, upper, email, minLength7, maxLength70 } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderEmailInputField, renderMultiSelectField,
    searchableSelect
} from "../../../layout/FormInputs";
import { createMachineType } from '../../../../actions/master/MachineMaster';
import { getLabourTypeSelectList } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddMachineTypeDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            labourType: [],
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
        this.props.getLabourTypeSelectList(() => { })
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { labourTypeSelectList } = this.props;
        const temp = [];
        if (label === 'labourList') {
            labourTypeSelectList && labourTypeSelectList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

    }

    /**
    * @method labourHandler
    * @description called
    */
    labourHandler = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ labourType: newValue });
        } else {
            this.setState({ labourType: [] })
        }
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.toggleDrawer('')
        //this.props.getRMSpecificationDataAPI('', res => { });
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { labourType } = this.state;

        /** Update existing detail of supplier master **/
        if (this.props.isEditFlag) {
            const { supplierId } = this.props;
            let formData = {

            }

            // this.props.updateSupplierAPI(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_SUPPLIER_SUCESS);
            //         this.toggleDrawer('')
            //     }
            // });
        } else {/** Add new detail for creating supplier master **/
            let formData = {
                MachineType: values.MachineType,
                LoggedInUserId: loggedInUserId(),
                LabourTypeIds: [labourType.value]
            }

            this.props.createMachineType(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.MACHINE_TYPE_ADD_SUCCESS);
                    this.toggleDrawer('')
                }
            });
        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset } = this.props;
        return (
            <div>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper'}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>{isEditFlag ? 'Update Machine Type' : 'Add Machine Type'}</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>

                                    <Col md="12">
                                        <Field
                                            label={`Machine Type`}
                                            name={"MachineType"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required]}
                                            component={renderText}
                                            required={true}
                                            className=" "
                                            customClassName=" withBorder"
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Field
                                            name="LabourTypeIds"
                                            type="text"
                                            label="Labour Type"
                                            component={searchableSelect}
                                            placeholder={'Select Labour'}
                                            options={this.renderListing('labourList')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.labourType == null || this.state.labourType.length == 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.labourHandler}
                                            valueDescription={this.state.labourType}
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
                                                value={isEditFlag ? 'Update' : 'Save'}
                                                className="submit-button mr5 save-btn"
                                            />
                                        </div>
                                    </div>
                                </Row>
                            </form>
                        </div>
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
function mapStateToProps({ comman }) {
    const { labourTypeSelectList } = comman;

    let initialValues = {};
    // if (supplierData && supplierData !== undefined) {
    //     initialValues = {
    //         VendorName: supplierData.VendorName,
    //     }
    // }
    return { labourTypeSelectList, initialValues }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createMachineType,
    getLabourTypeSelectList,
})(reduxForm({
    form: 'AddMachineTypeDrawer',
    enableReinitialize: true,
})(AddMachineTypeDrawer));
