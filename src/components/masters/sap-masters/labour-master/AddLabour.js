import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, number, upper, maxLength100, getVendorCode, decimalLength2 } from "../../../../helper/validation";
import {
    renderText, renderMultiSelectField, searchableSelect, renderNumberInputField, renderTextAreaField
} from "../../../layout/FormInputs";
import { getVendorWithVendorCodeSelectList } from '../../../../actions/master/Supplier';
import { } from '../../../../actions/master/Labour';
import { getLabourTypeSelectList, } from '../../../../actions/master/Comman';
import { getMachineTypeSelectList, } from '../../../../actions/master/MachineMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId, userDetails } from "../../../../helper/auth";
import Switch from "react-switch";
import $ from 'jquery';
import { reactLocalStorage } from "reactjs-localstorage";
import AddMachineTypeDrawer from '../machine-master/AddMachineTypeDrawer';

class AddLabour extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            IsVendor: false,
            IsEmployeContractual: false,

            vendorName: [],
            StateName: [],
            selectedPlants: [],

            machineType: [],
            labourType: [],

            isEditFlag: false,
            isOpenMachineType: false,
            LabourId: '',
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
        this.props.getMachineTypeSelectList(() => { })
        this.props.getLabourTypeSelectList(() => { })
        this.getDetail()

    }

    componentDidUpdate(prevProps) {

    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { plantSelectList, vendorWithVendorCodeSelectList, filterPlantList, machineTypeSelectList,
            labourTypeSelectList, } = this.props;
        const temp = [];

        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'MachineTypeList') {
            machineTypeSelectList && machineTypeSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'labourList') {
            labourTypeSelectList && labourTypeSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
    * @method onPressEmployeeTerms
    * @description EMPLOYEE TERMS 
    */
    onPressEmployeeTerms = () => {
        this.setState({
            IsEmployeContractual: !this.state.IsEmployeContractual,
        });
    }

    /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */
    onPressVendor = () => {
        this.setState({
            IsVendor: !this.state.IsVendor,
            // vendorName: [],
            // selectedVendorPlants: [],
            // vendorLocation: [],
        });
    }

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorName: newValue, selectedVendorPlants: [] }, () => {
                const { vendorName } = this.state;
            });
        } else {
            this.setState({ vendorName: [], selectedVendorPlants: [], })
        }
    };

    /**
    * @method handleState
    * @description called
    */
    handleState = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ StateName: newValue, })
        } else {
            this.setState({ StateName: [] })
        }
    };

    /**
    * @method handlePlants
    * @description Used handle Plants
    */
    handlePlants = (e) => {
        this.setState({ selectedPlants: e })
    }

    /**
    * @method handleMachineType
    * @description called
    */
    handleMachineType = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ machineType: newValue });
        } else {
            this.setState({ machineType: [], })
        }
    };

    machineTypeToggler = () => {
        this.setState({ isOpenMachineType: true })
    }

    closeMachineTypeDrawer = (e = '') => {
        this.setState({ isOpenMachineType: false }, () => {
            this.props.getMachineTypeSelectList(() => { })
        })
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
    * @method getDetail
    * @description used to get user detail
    */
    getDetail = () => {
        const { data } = this.props;
        // if (data && data.isEditFlag) {
        //     this.setState({
        //         isLoader: true,
        //         isEditFlag: true,
        //         OperationId: data.ID,
        //     })
        //     $('html, body').animate({ scrollTop: 0 }, 'slow');
        //     this.props.getOperationDataAPI(data.ID, (res) => {
        //         if (res && res.data && res.data.Data) {
        //             let Data = res.data.Data;

        //             let plantArray = [];
        //             Data && Data.Plant.map((item) => {
        //                 plantArray.push({ Text: item.PlantName, Value: item.PlantId })
        //                 return plantArray;
        //             })

        //             let technologyArray = [];
        //             Data && Data.Technology.map((item) => {
        //                 technologyArray.push({ Text: item.Technology, Value: item.TechnologyId })
        //                 return technologyArray;
        //             })

        //             let vendorPlantArray = [];
        //             Data && Data.VendorPlant.map((item) => {
        //                 vendorPlantArray.push({ Text: item.PlantName, Value: item.PlantId })
        //                 return vendorPlantArray;
        //             })

        //             setTimeout(() => {
        //                 const { vendorWithVendorCodeSelectList, UOMSelectList } = this.props;

        //                 const vendorObj = vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.find(item => item.Value == Data.VendorId)
        //                 const UOMObj = UOMSelectList && UOMSelectList.find(item => item.Value == Data.UnitOfMeasurementId)

        //                 this.setState({
        //                     isEditFlag: true,
        //                     isLoader: false,
        //                     IsVendor: Data.IsVendor,
        //                     selectedTechnology: technologyArray,
        //                     selectedPlants: plantArray,
        //                     vendorName: vendorObj && vendorObj != undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
        //                     selectedVendorPlants: vendorPlantArray,
        //                     UOM: UOMObj && UOMObj != undefined ? { label: UOMObj.Text, value: UOMObj.Value } : [],
        //                     isSurfaceTreatment: Data.IsSurfaceTreatmentOperation,
        //                     remarks: Data.Remark,
        //                     files: Data.Attachements,
        //                 })
        //             }, 500)

        //         }
        //     })
        // }
    }

    gridTableHandler = () => {
        const { StateName, rateGrid, } = this.state;
        if (StateName.length == 0) {
            toastr.warning('Fields should not be empty');
            return false;
        }
        const { fieldsObj } = this.props;
        const Rate = fieldsObj && fieldsObj != undefined ? fieldsObj : 0;
        const tempArray = [];

        tempArray.push(...rateGrid, {
            StateLabel: StateName ? StateName.label : '',
            StateId: StateName ? StateName.value : '',
            Rate: Rate,
        })

        this.setState({
            rateGrid: tempArray,
            StateName: [],
        }, () => this.props.change('Rate', 0));

    }

    /**
    * @method updateGrid
    * @description Used to handle update grid
    */
    updateGrid = () => {
        const { StateName, rateGrid, rateGridEditIndex } = this.state;
        const { fieldsObj } = this.props;
        const Rate = fieldsObj && fieldsObj != undefined ? fieldsObj : 0;
        let tempArray = [];

        let tempData = rateGrid[rateGridEditIndex];
        tempData = {
            StateLabel: StateName.label,
            StateId: StateName.value,
            Rate: Rate,
        }

        tempArray = Object.assign([...rateGrid], { [rateGridEditIndex]: tempData })

        this.setState({
            rateGrid: tempArray,
            StateName: [],
            rateGridEditIndex: '',
            isEditIndex: false,
        }, () => this.props.change('Rate', 0));
    };

    /**
    * @method resetGridData
    * @description Used to handle resetGridData
    */
    resetGridData = () => {
        this.setState({
            StateName: [],
            processGridEditIndex: '',
            isEditIndex: false,
        }, () => this.props.change('Rate', 0));
    };

    /**
    * @method editGridItemDetails
    * @description used to Edit grid data
    */
    editGridItemDetails = (index) => {
        const { rateGrid } = this.state;
        const tempData = rateGrid[index];

        this.setState({
            rateGridEditIndex: index,
            isEditIndex: true,
            StateName: { label: tempData.StateLabel, value: tempData.StateId },
        }, () => this.props.change('Rate', tempData.Rate))
    }

    /**
    * @method deleteGridItem
    * @description DELETE GRID ITEM
    */
    deleteGridItem = (index) => {
        const { rateGrid } = this.state;

        let tempData = rateGrid.filter((item, i) => {
            if (i == index) {
                return false;
            }
            return true;
        });

        this.setState({
            rateGrid: tempData
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            selectedPlants: [],
            vendorName: [],
            isEditFlag: false,
        })
        //this.props.getOperationDataAPI('', () => { })
        this.props.hideForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { IsVendor, selectedPlants, vendorName, files, LabourId } = this.state;
        const userDetail = userDetails()

        let plantArray = [];
        selectedPlants && selectedPlants.map((item) => {
            plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
            return plantArray;
        })

        /** Update existing detail of supplier master **/
        if (this.state.isEditFlag) {

            let updateData = {

            }

            // this.props.updateOperationAPI(updateData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_LABOUR_SUCCESS);
            //         this.cancel()
            //     }
            // });

        } else {/** Add new detail for creating operation master **/

            let formData = {

            }

            // this.props.createOperationsAPI(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.LABOUR_ADDED_SUCCESS);
            //         this.cancel();
            //     }
            // });
        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset } = this.props;
        const { isEditFlag, isOpenMachineType, } = this.state;
        return (
            <div>
                {/* {isLoader && <Loader />} */}
                <div className="login-container signup-form">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="shadow-lgg login-formg">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-heading mb-0">
                                            <h2>{this.state.isEditFlag ? 'Update Labour' : 'Add Labour'}</h2>
                                        </div>
                                    </div>
                                </div>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col md="4" className="switch mb15">
                                            <label className="switch-level">
                                                <div className={'left-title'}>Employed</div>
                                                <Switch
                                                    onChange={this.onPressEmployeeTerms}
                                                    checked={this.state.IsEmployeContractual}
                                                    id="normal-switch"
                                                    disabled={isEditFlag ? true : false}
                                                    background="#4DC771"
                                                    onColor="#4DC771"
                                                    onHandleColor="#ffffff"
                                                    offColor="#4DC771"
                                                    id="normal-switch"
                                                    uncheckedIcon={false}
                                                    checkedIcon={false}
                                                    height={20}
                                                    width={46}
                                                />
                                                <div className={'right-title'}>Contractual</div>
                                            </label>
                                        </Col>
                                        <Col md="4" className="switch mb15">
                                            <label className="switch-level">
                                                <div className={'left-title'}>Zero Based</div>
                                                <Switch
                                                    onChange={this.onPressVendor}
                                                    checked={this.state.IsVendor}
                                                    id="normal-switch"
                                                    disabled={true}
                                                    background="#4DC771"
                                                    onColor="#4DC771"
                                                    onHandleColor="#ffffff"
                                                    offColor="#4DC771"
                                                    id="normal-switch"
                                                    uncheckedIcon={false}
                                                    checkedIcon={false}
                                                    height={20}
                                                    width={46}
                                                />
                                                <div className={'right-title'}>Vendor Based</div>
                                            </label>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="12" className="filter-block">
                                            <div className=" flex-fills mb-2">
                                                <h5>{'Vendor:'}</h5>
                                            </div>
                                        </Col>
                                        {this.state.IsEmployeContractual &&
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            name="VendorName"
                                                            type="text"
                                                            label="Vendor Name"
                                                            component={searchableSelect}
                                                            placeholder={'--select--'}
                                                            options={this.renderListing('VendorNameList')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.vendorName == null || this.state.vendorName.length == 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleVendorName}
                                                            valueDescription={this.state.vendorName}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>}
                                        <Col md="3">
                                            <Field
                                                name="state"
                                                type="text"
                                                label="State"
                                                component={searchableSelect}
                                                placeholder={'--- Select ---'}
                                                options={this.renderListing('state')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={(this.state.StateName == null || this.state.StateName.length == 0) ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleState}
                                                valueDescription={this.state.StateName}
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="3">
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
                                    </Row>

                                    <Row>
                                        <Col md="12" className="filter-block">
                                            <div className=" flex-fills mb-2">
                                                <h5>{'Rate Per Person:'}</h5>
                                            </div>
                                        </Col>

                                        <Col md="3">
                                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                <div className="fullinput-icon">
                                                    <Field
                                                        name="MachineType"
                                                        type="text"
                                                        label="Machine Type"
                                                        component={searchableSelect}
                                                        placeholder={'--select--'}
                                                        options={this.renderListing('MachineTypeList')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.machineType == null || this.state.machineType.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleMachineType}
                                                        valueDescription={this.state.machineType}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </div>
                                                <div
                                                    onClick={this.machineTypeToggler}
                                                    className={'plus-icon-square mt30 mr15 right'}>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md="3">
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
                                        <Col md="3">
                                            <Field
                                                label={`Rate Per Person/Annum (INR)`}
                                                name={"MachineName"}
                                                type="text"
                                                placeholder={'Enter'}
                                                validate={[required, number, decimalLength2]}
                                                component={renderText}
                                                required={true}
                                                disabled={isEditFlag ? true : false}
                                                className=" "
                                                customClassName="withBorder"
                                            />
                                        </Col>

                                        <Col md="3">
                                            <div>
                                                {this.state.isEditIndex ?
                                                    <>
                                                        <button
                                                            type="button"
                                                            className={'btn btn-primary mt30 pull-left mr5'}
                                                            onClick={this.updateGrid}
                                                        >Update</button>

                                                        <button
                                                            type="button"
                                                            className={'cancel-btn mt30 pull-left'}
                                                            onClick={this.resetGridData}
                                                        >Cancel</button>
                                                    </>
                                                    :
                                                    <button
                                                        type="button"
                                                        className={'user-btn mt30 pull-left'}
                                                        onClick={this.gridTableHandler}>
                                                        <div className={'plus'}></div>ADD</button>}

                                            </div>
                                        </Col>

                                    </Row>

                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-right bluefooter-butn">
                                            <button
                                                type={'button'}
                                                className="reset mr15 cancel-btn"
                                                onClick={this.cancel} >
                                                <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                                            </button>
                                            <button
                                                type="submit"
                                                className="submit-button mr5 save-btn" >
                                                <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                                {isEditFlag ? 'Update' : 'Save'}
                                            </button>
                                        </div>
                                    </Row>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {isOpenMachineType && <AddMachineTypeDrawer
                    isOpen={isOpenMachineType}
                    closeDrawer={this.closeMachineTypeDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { comman, supplier, machine, } = state;
    const { plantList, plantSelectList, filterPlantList, labourTypeSelectList, } = comman;
    const { vendorWithVendorCodeSelectList } = supplier;
    const { machineTypeSelectList, } = machine;

    let initialValues = {};
    // if (operationData && operationData !== undefined) {
    //     initialValues = {
    //         OperationName: operationData.OperationName,
    //     }
    // }

    return {
        plantSelectList, plantList,
        filterPlantList, vendorWithVendorCodeSelectList, machineTypeSelectList, labourTypeSelectList, initialValues
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getMachineTypeSelectList,
    getLabourTypeSelectList,
})(reduxForm({
    form: 'AddLabour',
    enableReinitialize: true,
})(AddLabour));

