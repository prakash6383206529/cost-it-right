import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required, number, upper, maxLength100 } from "../../../../helper/validation";
import {
    renderText, renderMultiSelectField, searchableSelect, renderNumberInputField, renderTextAreaField
} from "../../../layout/FormInputs";
import { getVendorListByVendorType, } from '../../../../actions/master/Material';
import { createVolume, updateVolume, getVolumeData, } from '../../../../actions/master/Volume';
import { getPlantSelectList, getPlantBySupplier, } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../helper/auth";
import VolumeListing from './VolumeListing';
import Switch from "react-switch";
import YearPicker from "react-year-picker";
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import $ from 'jquery';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { monthSequence } from '../../../../config/masterData';

const initialTableData = [
    { VolumeDetailId: 0, Month: 'April', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 1, Month: 'May', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 2, Month: 'June', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 3, Month: 'July', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 4, Month: 'August', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 5, Month: 'September', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 6, Month: 'October', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 7, Month: 'November', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 8, Month: 'December', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 9, Month: 'January', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 10, Month: 'February', BudgetedQuantity: 0, ApprovedQuantity: 0 },
    { VolumeDetailId: 11, Month: 'March', BudgetedQuantity: 0, ApprovedQuantity: 0 },
]
class AddVolume extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            IsVendor: false,
            selectedPlants: [],
            vendorName: [],
            selectedVendorPlants: [],

            year: new Date('2020'),
            tableData: initialTableData,

            isEditFlag: false,
            isShowForm: false,
            VolumeId: '',
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
        this.props.getVendorListByVendorType(true, () => { })
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { technologySelectList, plantSelectList, vendorListByVendorType, filterPlantList,
            UOMSelectList, } = this.props;
        const temp = [];

        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorPlant') {
            filterPlantList && filterPlantList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }

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
        }, () => {
            // const { IsVendor } = this.state;
            // this.props.getVendorListByVendorType(IsVendor, () => { })
        });
    }

    /**
    * @method handlePlants
    * @description Used handle Plants
    */
    handlePlants = (e) => {
        this.setState({ selectedPlants: e })
    }

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorName: newValue, selectedVendorPlants: [] }, () => {
                const { vendorName } = this.state;
                this.props.getPlantBySupplier(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [], selectedVendorPlants: [], })
        }
    };

    vendorToggler = () => {
        this.setState({ isOpenVendor: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({ isOpenVendor: false }, () => {
            const { IsVendor } = this.state;
            this.props.getVendorListByVendorType(true, () => { })
        })
    }


    /**
    * @method handleVendorPlant
    * @description called
    */
    handleVendorPlant = (e) => {
        this.setState({ selectedVendorPlants: e })
    };

    setStartDate = (date) => {
        this.setState({ year: date })
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                {/* <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} /> */}
                <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell, rowIndex)} />
            </>
        )
    }

    editItemDetails = (ID) => {

    }

    deleteItem = (ID, index) => {
        const { tableData } = this.state;
        // let filterData = tableData.filter(item => {
        //     if (item.Month == ID) return false;
        //     return true;
        // })
        let filterData = tableData.map(item => {
            if (item.VolumeApprovedDetailId == ID) {
                return { ...item, BudgetedQuantity: 0, ApprovedQuantity: 0, }
            }
            return item;
        })
        this.setState({ tableData: filterData })
    }

    showFinancialYear = () => {
        const { year } = this.state;
        const d = new Date(year);
        return year != '' ? `For Financial Year ${d.getFullYear()} - ${d.getFullYear() + 1}` : '';
    }


    /**
    * @method getDetail
    * @description used to get user detail
    */
    getDetail = (data) => {
        if (data && data.isEditFlag) {
            this.setState({
                isLoader: true,
                isEditFlag: true,
                isShowForm: true,
                VolumeId: data.ID,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getVolumeData(data.ID, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;

                    let plantArray = [];
                    Data && Data.Plant.map((item) => {
                        plantArray.push({ Text: item.PlantName, Value: item.PlantId })
                        return plantArray;
                    })

                    let vendorPlantArray = [];
                    Data && Data.VendorPlant.map((item) => {
                        vendorPlantArray.push({ Text: item.PlantName, Value: item.PlantId })
                        return vendorPlantArray;
                    })

                    let tableArray = [];
                    Data && Data.VolumeApprovedDetails.map((item, i) => {
                        Data.VolumeBudgetedDetails.map(el => {
                            if (el.Month == item.Month) {
                                tableArray.push({
                                    VolumeApprovedDetailId: item.VolumeApprovedDetailId,
                                    VolumeBudgetedDetailId: el.VolumeBudgetedDetailId,
                                    Month: item.Month,
                                    BudgetedQuantity: el.BudgetedQuantity,
                                    ApprovedQuantity: item.ApprovedQuantity,
                                })
                                return tableArray.sort();
                            }
                        })
                    })

                    setTimeout(() => {
                        const { vendorListByVendorType, } = this.props;
                        const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value == Data.VendorId)

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            selectedPlants: plantArray,
                            selectedVendorPlants: vendorPlantArray,
                            vendorName: { label: vendorObj.Text, value: vendorObj.Value },
                            year: new Date(Data.Year),
                            tableData: tableArray,
                        })
                    }, 500)

                }
            })
        }
    }

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    clearForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            selectedPlants: [],
            vendorName: [],
            selectedVendorPlants: [],
            isShowForm: false,
            isEditFlag: false,
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.clearForm();
        this.props.getVolumeData('', () => { })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { IsVendor, selectedPlants, vendorName, selectedVendorPlants, year, tableData,
            VolumeId } = this.state;
        const { reset } = this.props;

        let plantArray = [];
        selectedPlants && selectedPlants.map((item) => {
            plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
            return plantArray;
        })

        let vendorPlants = [];
        selectedVendorPlants && selectedVendorPlants.map((item) => {
            vendorPlants.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
            return vendorPlants;
        })

        let budgetArray = [];
        tableData && tableData.map((item) => {
            budgetArray.push({ Month: item.Month, BudgetedQuantity: item.BudgetedQuantity, VolumeDetailId: item.VolumeDetailId })
            return budgetArray;
        })

        let approvedArray = [];
        tableData && tableData.map((item) => {
            approvedArray.push({ Month: item.Month, ApprovedQuantity: item.ApprovedQuantity, VolumeDetailId: item.VolumeDetailId })
            return approvedArray;
        })

        let updateBudgetArray = [];
        tableData && tableData.map((item) => {
            updateBudgetArray.push({
                VolumeBudgetedDetailId: item.VolumeBudgetedDetailId,
                Month: item.Month,
                BudgetedQuantity: item.BudgetedQuantity,
                Sequence: 0,
            })
            return updateBudgetArray;
        })

        let updateApproveArray = [];
        tableData && tableData.map((item) => {
            updateApproveArray.push({
                VolumeApprovedDetailId: item.VolumeApprovedDetailId,
                Month: item.Month,
                ApprovedQuantity: item.ApprovedQuantity,
                Sequence: 0,
            })
            return updateApproveArray;
        })

        /** Update existing detail of supplier master **/
        if (this.state.isEditFlag) {
            let updateData = {
                VolumeId: VolumeId,
                LoggedInUserId: loggedInUserId(),
                VolumeApprovedDetails: updateApproveArray,
                VolumeBudgetedDetails: updateBudgetArray,
            }

            this.props.updateVolume(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.VOLUME_UPDATE_SUCCESS);
                    this.clearForm()
                    this.child.getUpdatedData();
                }
            });

        } else {/** Add new detail for creating supplier master **/

            let formData = {
                IsVendor: IsVendor,
                VendorId: vendorName.value,
                PartNumber: values.PartNumber,
                //OldPartNumber: values.OldPartNumber,
                PartName: values.PartName,
                Year: new Date(year).getFullYear(),
                VolumeApprovedDetails: approvedArray,
                VolumeBudgetedDetails: budgetArray,
                Plant: !IsVendor ? plantArray : [],
                VendorPlant: vendorPlants,
                LoggedInUserId: loggedInUserId(),
                IsActive: true
            }
            this.props.createVolume(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.VOLUME_ADD_SUCCESS);
                    this.clearForm();
                    this.child.getUpdatedData();
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
        const { isEditFlag, isOpenVendor, isOpenUOM } = this.state;

        const cellEditProp = {
            mode: 'click',
            blurToSave: true
        };

        return (
            <div>
                {/* {isLoader && <Loader />} */}
                <div className="login-container signup-form">
                    <div className="row">
                        {this.state.isShowForm &&
                            <div className="col-md-12">
                                <div className="shadow-lgg login-formg pt-30">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-heading mb-0">
                                                <h2>{this.state.isEditFlag ? 'Update Volume' : 'Add Volume'}</h2>
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
                                                <label>
                                                    <div className={'left-title'}>Zero Based</div>
                                                    <Switch
                                                        onChange={this.onPressVendor}
                                                        checked={this.state.IsVendor}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    <div className={'right-title'}>Vendor Based</div>
                                                </label>
                                            </Col>
                                        </Row>

                                        <Row>
                                            {!this.state.IsVendor &&
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
                                                </Col>}
                                            <Col md="2">
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
                                            </Col>
                                            <Col md="1">
                                                <div
                                                    onClick={this.vendorToggler}
                                                    className={'plus-icon-square mt30 mr15 right'}>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Vendor Code`}
                                                    name={"VendorCode"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderText}
                                                    //onChange={this.handleBasicRate}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label="Vendor Plant"
                                                    name="VendorPlant"
                                                    placeholder="--- Plant ---"
                                                    selection={(this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length == 0) ? [] : this.state.selectedVendorPlants}
                                                    options={this.renderListing('VendorPlant')}
                                                    selectionChanged={this.handleVendorPlant}
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
                                            <Col md="3">
                                                <Field
                                                    label={`Part No.`}
                                                    name={"PartNumber"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderText}
                                                    //onChange={this.handleBasicRate}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Part Name`}
                                                    name={"PartName"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderText}
                                                    //onChange={this.handleBasicRate}
                                                    //required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="3">
                                                <div className="form-group">
                                                    <label>
                                                        Year
                                                    <span className="asterisk-required">*</span>
                                                    </label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            selected={this.state.year}
                                                            onChange={this.setStartDate}
                                                            showYearPicker
                                                            dateFormat="yyyy"
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="12">
                                                {this.showFinancialYear()}
                                                <BootstrapTable data={this.state.tableData} cellEdit={cellEditProp}>
                                                    <TableHeaderColumn dataField='Month' editable={false}>Month</TableHeaderColumn>
                                                    <TableHeaderColumn dataField='BudgetedQuantity'>Budgeted Qty</TableHeaderColumn>
                                                    <TableHeaderColumn dataField='ApprovedQuantity'>Approved Qty</TableHeaderColumn>
                                                    <TableHeaderColumn dataField='VolumeApprovedDetailId' hidden>Volume Approv Id</TableHeaderColumn>
                                                    <TableHeaderColumn dataField='VolumeBudgetedDetailId' hidden>Vol Budget Id</TableHeaderColumn>
                                                    <TableHeaderColumn className="action" dataField="VolumeApprovedDetailId" isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                                                </BootstrapTable>
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
                                                        value={this.state.isEditFlag ? 'Update' : 'Save'}
                                                        className="submit-button mr5 save-btn"
                                                    />
                                                </div>
                                            </div>
                                        </Row>
                                    </form>
                                </div>
                            </div>}
                    </div>
                </div>
                <VolumeListing
                    onRef={ref => (this.child = ref)}
                    getDetail={this.getDetail}
                    formToggle={this.formToggle}
                    isShowForm={this.state.isShowForm}
                />
                {isOpenVendor && <AddVendorDrawer
                    isOpen={isOpenVendor}
                    closeDrawer={this.closeVendorDrawer}
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
function mapStateToProps({ comman, volume, material, }) {
    const { plantList, plantSelectList, filterPlantList, } = comman;
    const { volumeData } = volume;
    const { vendorListByVendorType } = material;

    let initialValues = {};
    if (volumeData && volumeData !== undefined) {
        initialValues = {
            PartNumber: volumeData.PartNumber,
            PartName: volumeData.PartName,
        }
    }

    return {
        plantSelectList, vendorListByVendorType, plantList, filterPlantList, volumeData,
        initialValues,
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getPlantSelectList,
    getVendorListByVendorType,
    getPlantBySupplier,
    createVolume,
    updateVolume,
    getVolumeData,
})(reduxForm({
    form: 'AddVolume',
    enableReinitialize: true,
})(AddVolume));

