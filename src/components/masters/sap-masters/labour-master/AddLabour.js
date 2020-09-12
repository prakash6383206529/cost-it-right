import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Table } from 'reactstrap';
import { required, number, upper, maxLength100, getVendorCode, decimalLength2, checkForNull } from "../../../../helper/validation";
import {
    renderText, renderMultiSelectField, searchableSelect, renderNumberInputField, renderTextAreaField
} from "../../../layout/FormInputs";
import { getFuelComboData, getPlantListByState, } from '../../../../actions/master/Fuel';
import { createLabour, getLabourData, updateLabour, labourTypeVendorSelectList, getLabourTypeByMachineTypeSelectList } from '../../../../actions/master/Labour';
import { getMachineTypeSelectList, } from '../../../../actions/master/MachineMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId, userDetails } from "../../../../helper/auth";
import Switch from "react-switch";
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { reactLocalStorage } from "reactjs-localstorage";
import AddMachineTypeDrawer from '../machine-master/AddMachineTypeDrawer';
import NoContentFound from '../../../common/NoContentFound';
import moment from 'moment';
const selector = formValueSelector('AddLabour');

class AddLabour extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            LabourDetailId: '',

            IsEmployeContractual: false,
            IsVendor: false,

            vendorName: [],
            StateName: [],
            selectedPlants: [],

            gridTable: [],
            machineType: [],
            labourType: [],
            effectiveDate: '',

            isOpenMachineType: false,
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
        this.props.getFuelComboData(() => { })
        this.props.getPlantListByState('', () => { })
        this.props.getMachineTypeSelectList(() => { })
        this.props.labourTypeVendorSelectList(() => { })
        this.props.getLabourTypeByMachineTypeSelectList('', () => { })
        this.getDetail()

    }

    componentDidUpdate(prevProps) {

    }

    /**
    * @method getDetail
    * @description used to get user detail
    */
    getDetail = () => {
        const { data } = this.props;
        if (data && data.isEditFlag) {
            this.setState({
                isLoader: true,
                isEditFlag: true,
                LabourId: data.ID,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getLabourData(data.ID, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;

                    let plantArray = Data && Data.Plants.map((item) => ({ label: item.PlantName, value: item.PlantId }))
                    this.props.getPlantListByState(Data.StateId, () => { })

                    setTimeout(() => {
                        const { fuelComboSelectList, VendorLabourTypeSelectList, plantSelectList } = this.props;
                        let stateObj = fuelComboSelectList && fuelComboSelectList.States.find(el => el.Value == Data.StateId)
                        const vendorObj = VendorLabourTypeSelectList && VendorLabourTypeSelectList.find(item => item.Value == Data.VendorId)
                        const plantObj = plantSelectList && plantSelectList.find(item => item.Value == Data.Plants[0].PlantId)

                        let GridArray = Data && Data.LabourDetails.map((item) => {
                            return {
                                LabourDetailId: item.LabourDetailId,
                                MachineTypeId: item.MachineTypeId,
                                MachineType: item.MachineType,
                                LabourTypeId: item.LabourTypeId,
                                LabourType: item.LabourType,
                                EffectiveDate: moment(item.EffectiveDate)._d,
                                LabourRate: item.LabourRate,
                            }
                        })

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            IsVendor: Data.IsVendor,
                            IsEmployeContractual: Data.IsContractBase,
                            vendorName: Data.IsContractBase ? (vendorObj && vendorObj != undefined ? { label: vendorObj.Text, value: vendorObj.Value } : []) : [],
                            StateName: stateObj && stateObj != undefined ? { label: stateObj.Text, value: stateObj.Value } : [],
                            selectedPlants: plantObj && plantObj != undefined ? { label: plantObj.Text, value: plantObj.Value } : [],
                            gridTable: GridArray,
                        })
                    }, 500)

                }
            })
        } else {
            this.props.getLabourData('', () => { })
        }
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { plantSelectList, VendorLabourTypeSelectList, fuelComboSelectList, machineTypeSelectList,
            labourTypeByMachineTypeSelectList, } = this.props;
        const temp = [];

        if (label === 'state') {
            fuelComboSelectList && fuelComboSelectList.States && fuelComboSelectList.States.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            VendorLabourTypeSelectList && VendorLabourTypeSelectList.map(item => {
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
            labourTypeByMachineTypeSelectList && labourTypeByMachineTypeSelectList.map(item => {
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
            this.setState({ StateName: newValue, }, () => {
                const { StateName } = this.state;
                this.props.getPlantListByState(StateName.value, () => { })
            })
        } else {
            this.setState({ StateName: [] })
            this.props.getPlantListByState('', () => { })
        }
    };

    /**
    * @method handlePlants
    * @description called
    */
    handlePlants = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ selectedPlants: newValue, })
        } else {
            this.setState({ selectedPlants: [] })
        }
    };

    /**
    * @method handleMachineType
    * @description called
    */
    handleMachineType = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ machineType: newValue }, () => {
                const { machineType } = this.state;
                this.props.getLabourTypeByMachineTypeSelectList(machineType.value, () => { })
            });
        } else {
            this.setState({ machineType: [], })
            this.props.getLabourTypeByMachineTypeSelectList('', () => { })
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
   * @method handleChange
   * @description Handle Effective Date
   */
    handleEffectiveDateChange = (date) => {
        this.setState({
            effectiveDate: date,
        });
    };

    gridHandler = () => {
        const { machineType, labourType, gridTable, effectiveDate } = this.state;
        const { fieldsObj } = this.props;

        if (machineType.length == 0 || labourType.length == 0) {
            toastr.warning('Fields should not be empty');
            return false;
        }

        //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
        const isExist = gridTable.findIndex(el => (el.MachineTypeId == machineType.value && el.LabourTypeId == labourType.value))
        if (isExist != -1) {
            toastr.warning('Already added, Please check the values.')
            return false;
        }

        const LabourRate = fieldsObj && fieldsObj != undefined ? checkForNull(fieldsObj) : 0;
        const tempArray = [];

        tempArray.push(...gridTable, {
            LabourDetailId: '',
            MachineTypeId: machineType.value,
            MachineType: machineType.label,
            LabourTypeId: labourType.value,
            LabourType: labourType.label,
            EffectiveDate: effectiveDate,
            LabourRate: LabourRate,
        })

        this.setState({
            gridTable: tempArray,
            machineType: [],
            labourType: [],
            effectiveDate: new Date(),
        }, () => this.props.change('LabourRate', 0));

    }

    /**
    * @method updateGrid
    * @description Used to handle update grid
    */
    updateGrid = () => {
        const { machineType, labourType, gridTable, effectiveDate, gridEditIndex } = this.state;
        const { fieldsObj } = this.props;
        const LabourRate = fieldsObj && fieldsObj != undefined ? checkForNull(fieldsObj) : 0;

        //CONDITION TO SKIP DUPLICATE ENTRY IN GRID
        let skipEditedItem = gridTable.filter((el, i) => {
            if (i == gridEditIndex) return false;
            return true;
        })

        //CONDITION TO CHECK DUPLICATE ENTRY EXCEPT EDITED RECORD
        const isExist = skipEditedItem.findIndex(el => (el.MachineTypeId == machineType.value && el.LabourTypeId == labourType.value))
        if (isExist != -1) {
            toastr.warning('Already added, Please check the values.')
            return false;
        }

        let tempArray = [];

        let tempData = gridTable[gridEditIndex];
        tempData = {
            MachineTypeId: machineType.value,
            MachineType: machineType.label,
            LabourTypeId: labourType.value,
            LabourType: labourType.label,
            EffectiveDate: effectiveDate,
            LabourRate: LabourRate,
        }

        tempArray = Object.assign([...gridTable], { [gridEditIndex]: tempData })

        this.setState({
            gridTable: tempArray,
            machineType: [],
            labourType: [],
            gridEditIndex: '',
            isEditIndex: false,
        }, () => this.props.change('LabourRate', 0));
    };

    /**
    * @method resetGridData
    * @description Used to handle resetGridData
    */
    resetGridData = () => {
        this.setState({
            machineType: [],
            labourType: [],
            gridEditIndex: '',
            isEditIndex: false,
        }, () => this.props.change('LabourRate', 0));
    };

    /**
    * @method editGridItemDetails
    * @description used to Edit grid data
    */
    editGridItemDetails = (index) => {
        const { gridTable } = this.state;
        const tempData = gridTable[index];

        this.props.getLabourTypeByMachineTypeSelectList(tempData.MachineTypeId, () => {
            this.setState({
                labourType: { label: tempData.LabourType, value: tempData.LabourTypeId },
            })
        })

        this.setState({
            gridEditIndex: index,
            isEditIndex: true,
            machineType: { label: tempData.MachineType, value: tempData.MachineTypeId },
            effectiveDate: tempData.EffectiveDate,
        }, () => this.props.change('LabourRate', tempData.LabourRate))

    }

    /**
    * @method deleteGridItem
    * @description DELETE GRID ITEM
    */
    deleteGridItem = (index) => {
        const { gridTable } = this.state;

        let tempData = gridTable.filter((item, i) => {
            if (i == index) return false;
            return true;
        });

        this.setState({ gridTable: tempData })
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
            IsEmployeContractual: true,
        })
        this.props.getLabourData('', () => { })
        this.props.hideForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { IsEmployeContractual, IsVendor, StateName, selectedPlants, vendorName, LabourId,
            gridTable, } = this.state;
        const userDetail = userDetails()

        if (gridTable && gridTable.length == 0) {
            toastr.warning('Labour Rate entry required.');
            return false;
        }

        /** Update existing detail of supplier master **/
        if (this.state.isEditFlag) {

            let updateData = {
                LabourId: LabourId,
                IsContractBase: IsEmployeContractual,
                IsVendor: IsVendor,
                VendorId: IsEmployeContractual ? vendorName.value : '',
                StateId: StateName.value,
                LoggedInUserId: loggedInUserId(),
                LabourDetails: gridTable,
                Plants: [{ PlantId: selectedPlants.value, PlantName: selectedPlants.label }],
            }

            this.props.updateLabour(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_LABOUR_SUCCESS);
                    this.cancel()
                }
            });

        } else {/** Add new detail for creating operation master **/

            let formData = {
                IsContractBase: IsEmployeContractual,
                IsVendor: IsVendor,
                VendorId: IsEmployeContractual ? vendorName.value : '',
                StateId: StateName.value,
                LabourDetails: gridTable,
                Plants: [{ PlantId: selectedPlants.value, PlantName: selectedPlants.label }],
                LoggedInUserId: loggedInUserId(),
            }

            this.props.createLabour(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.LABOUR_ADDED_SUCCESS);
                    this.cancel();
                }
            });
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
                                                    offColor="#A9A9A9"
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
                                                disabled={isEditFlag ? true : false}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                name="Plant"
                                                type="text"
                                                label="Plant"
                                                component={searchableSelect}
                                                placeholder={'--- Select ---'}
                                                options={this.renderListing('plant')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={(this.state.selectedPlants == null || this.state.selectedPlants.length == 0) ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handlePlants}
                                                valueDescription={this.state.selectedPlants}
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
                                                        //validate={(this.state.machineType == null || this.state.machineType.length == 0) ? [required] : []}
                                                        //required={true}
                                                        handleChangeDescription={this.handleMachineType}
                                                        valueDescription={this.state.machineType}
                                                        disabled={false}
                                                    />
                                                </div>
                                                {!isEditFlag && <div
                                                    onClick={this.machineTypeToggler}
                                                    className={'plus-icon-square mr15 right'}>
                                                </div>}
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
                                                //validate={(this.state.labourType == null || this.state.labourType.length == 0) ? [required] : []}
                                                //required={true}
                                                handleChangeDescription={this.labourHandler}
                                                valueDescription={this.state.labourType}
                                            />
                                        </Col>
                                        <Col md="2">
                                            <Field
                                                label={`Rate Per Person/Annum (INR)`}
                                                name={"LabourRate"}
                                                type="text"
                                                placeholder={'Enter'}
                                                validate={[number, decimalLength2]}
                                                component={renderText}
                                                //required={true}
                                                disabled={false}
                                                className=" "
                                                customClassName="withBorder"
                                            />
                                        </Col>
                                        <Col md="2">
                                            <div className="form-group">
                                                <label>
                                                    Effective Date
                                                    {/* <span className="asterisk-required">*</span> */}
                                                </label>
                                                <div className="inputbox date-section">
                                                    <DatePicker
                                                        name="EffectiveDate"
                                                        selected={this.state.effectiveDate}
                                                        onChange={this.handleEffectiveDateChange}
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dateFormat="dd/MM/yyyy"
                                                        //maxDate={new Date()}
                                                        dropdownMode="select"
                                                        placeholderText="Select date"
                                                        className="withBorder"
                                                        autoComplete={'off'}
                                                        disabledKeyboardNavigation
                                                        onChangeRaw={(e) => e.preventDefault()}
                                                        disabled={false}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md="2">
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
                                                        onClick={this.gridHandler}>
                                                        <div className={'plus'}></div>ADD</button>}

                                            </div>
                                        </Col>
                                        <Col md="12">
                                            <Table className="table" size="sm" >
                                                <thead>
                                                    <tr>
                                                        <th>{`Machine Type`}</th>
                                                        <th>{`Labour Type`}</th>
                                                        <th>{`Rate Per Person/Annum(INR)`}</th>
                                                        <th>{`Effective Date`}</th>
                                                        <th>{`Action`}</th>
                                                    </tr>
                                                </thead>
                                                <tbody >
                                                    {
                                                        this.state.gridTable &&
                                                        this.state.gridTable.map((item, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{item.MachineType}</td>
                                                                    <td>{item.LabourType}</td>
                                                                    <td>{item.LabourRate}</td>
                                                                    <td>{moment(item.EffectiveDate).format('DD/MM/YYYY')}</td>
                                                                    <td>
                                                                        <button className="Edit mr5" type={'button'} onClick={() => this.editGridItemDetails(index)} />
                                                                        <button className="Delete" type={'button'} onClick={() => this.deleteGridItem(index)} />
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                    {this.state.gridTable.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                                </tbody>
                                            </Table>
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
    const fieldsObj = selector(state, 'LabourRate');
    const { supplier, machine, fuel, labour } = state;
    const { VendorLabourTypeSelectList, labourTypeByMachineTypeSelectList } = labour;
    const { vendorWithVendorCodeSelectList } = supplier;
    const { machineTypeSelectList, } = machine;
    const { fuelComboSelectList, plantSelectList, } = fuel;
    let initialValues = {};

    return {
        fuelComboSelectList, plantSelectList, vendorWithVendorCodeSelectList,
        machineTypeSelectList, labourTypeByMachineTypeSelectList, VendorLabourTypeSelectList, fieldsObj, initialValues,
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createLabour,
    getLabourData,
    updateLabour,
    getMachineTypeSelectList,
    getLabourTypeByMachineTypeSelectList,
    getFuelComboData,
    getPlantListByState,
    labourTypeVendorSelectList,
})(reduxForm({
    form: 'AddLabour',
    enableReinitialize: true,
})(AddLabour));

