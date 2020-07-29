import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required, number, upper, email, minLength7, maxLength70 } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderEmailInputField, renderMultiSelectField,
    searchableSelect
} from "../../../layout/FormInputs";
import { getProcessCode, getMachineTypeSelectList, createProcess, } from '../../../../actions/master/MachineMaster';
import { getPlantSelectList, } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddProcessDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPlants: [],
            selectedMachine: [],
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
        this.props.getPlantSelectList(() => { })
        this.props.getMachineTypeSelectList(() => { })

    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    checkProcessCode = (e) => {
        console.log('triggered >>>>>>>>>>>>', e.target.value)
        const value = e.target.value;
        this.props.getProcessCode(value, res => {
            if (res && res.data && res.data.Result) {
                let Data = res.data.DynamicData;
                this.props.change('ProcessCode', Data.ProcessCode)
            }
        })
    }

    /**
     * @method handlePlants
     * @description Used handle Plants
     */
    handlePlants = (e) => {
        this.setState({ selectedPlants: e })
    }

    /**
     * @method handleMachine
     * @description Used handle Machine
     */
    handleMachine = (e) => {
        this.setState({ selectedMachine: e })
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { plantSelectList, machineTypeSelectList } = this.props;
        const temp = [];
        if (label === 'machine') {
            machineTypeSelectList && machineTypeSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }

    }

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
        const { selectedPlants, selectedMachine } = this.state;

        let plantArray = [];
        selectedPlants && selectedPlants.map((item) => {
            plantArray.push(item.Value)
            return plantArray;
        })

        let machineArray = [];
        selectedMachine && selectedMachine.map((item) => {
            machineArray.push(item.Value)
            return machineArray;
        })

        /** Update existing detail of supplier master **/
        if (this.props.isEditFlag) {

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
                ProcessName: values.ProcessName,
                ProcessCode: values.ProcessCode,
                PlantIds: plantArray,
                MachineIds: machineArray,
                LoggedInUserId: loggedInUserId(),
            }

            this.props.createProcess(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.PROCESS_ADD_SUCCESS);
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
                                            <h3>{isEditFlag ? 'Update Process' : 'Add Process'}</h3>
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
                                            label={`Process Name`}
                                            name={"ProcessName"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required]}
                                            component={renderText}
                                            onBlur={this.checkProcessCode}
                                            required={true}
                                            className=" "
                                            customClassName=" withBorder"
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Field
                                            label={`Process Code`}
                                            name={"ProcessCode"}
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
                                            label="Plant"
                                            name="Plant"
                                            placeholder="--Select--"
                                            selection={(this.state.selectedPlants == null || this.state.selectedPlants.length == 0) ? [] : this.state.selectedPlants}
                                            options={this.renderListing('plant')}
                                            selectionChanged={this.handlePlants}
                                            optionValue={option => option.Value}
                                            optionLabel={option => option.Text}
                                            component={renderMultiSelectField}
                                            mendatory={true}
                                            className="multiselect-with-border"
                                            disabled={isEditFlag ? true : false}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Field
                                            label="Machine"
                                            name="Machine"
                                            placeholder="--Select--"
                                            selection={(this.state.selectedMachine == null || this.state.selectedMachine.length == 0) ? [] : this.state.selectedMachine}
                                            options={this.renderListing('machine')}
                                            selectionChanged={this.handleMachine}
                                            optionValue={option => option.Value}
                                            optionLabel={option => option.Text}
                                            component={renderMultiSelectField}
                                            mendatory={true}
                                            className="multiselect-with-border"
                                            disabled={isEditFlag ? true : false}
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
function mapStateToProps({ comman, machine }) {
    const { plantSelectList } = comman;
    const { machineTypeSelectList } = machine;

    let initialValues = {};
    // if (supplierData && supplierData !== undefined) {
    //     initialValues = {
    //         VendorName: supplierData.VendorName,
    //     }
    // }
    return { plantSelectList, machineTypeSelectList, initialValues }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getProcessCode,
    getPlantSelectList,
    getMachineTypeSelectList,
    createProcess,
})(reduxForm({
    form: 'AddProcessDrawer',
    enableReinitialize: true,
})(AddProcessDrawer));
