import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, number, } from "../../../../helper/validation";
import { renderText, renderMultiSelectField, searchableSelect, } from "../../../layout/FormInputs";
import { getVendorListByVendorType, } from '../../../../actions/master/Material';
import { createVolume, updateVolume, getVolumeData, getFinancialYearSelectList, } from '../../../../actions/master/Volume';
import { getPlantSelectListByType, getPlantBySupplier, } from '../../../../actions/master/Comman';
import { getPartSelectList } from '../../../../actions/master/Part';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from "../../../../helper/auth";
import Switch from "react-switch";
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import $ from 'jquery';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import { ZBC } from '../../../../config/constants';

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
            part: [],

            year: [],
            tableData: initialTableData,

            isEditFlag: false,
            isShowForm: false,
            VolumeId: '',
        }
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        this.props.getPlantSelectListByType(ZBC, () => { })
        this.props.getVendorListByVendorType(true, () => { })
        this.props.getFinancialYearSelectList(() => { })
        this.props.getPartSelectList(() => { })
        this.getDetail()
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { plantSelectList, vendorListByVendorType, filterPlantList, financialYearSelectList,
            partSelectList, } = this.props;
        const temp = [];

        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'yearList') {
            financialYearSelectList && financialYearSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'PartList') {
            partSelectList && partSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorPlant') {
            filterPlantList && filterPlantList.map(item => {
                if (item.Value === '0') return false;
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
        this.setState({ IsVendor: !this.state.IsVendor, });
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
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue, selectedVendorPlants: [] }, () => {
                const { vendorName } = this.state;
                this.props.getPlantBySupplier(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [], selectedVendorPlants: [], })
        }
    };

    /**
    * @method handlePart
    * @description called
    */
    handlePart = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ part: newValue, });
        } else {
            this.setState({ part: [], })
        }
    };

    vendorToggler = () => {
        this.setState({ isOpenVendor: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({ isOpenVendor: false }, () => {
            this.props.getVendorListByVendorType(true, () => { })
        })
    }

    /**
    * @method handleFinancialYear
    * @description called
    */
    handleFinancialYear = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ year: newValue, });
        } else {
            this.setState({ year: [], })
        }
    };


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
            if (item.VolumeApprovedDetailId === ID) {
                return { ...item, BudgetedQuantity: 0, ApprovedQuantity: 0, }
            }
            return item;
        })
        this.setState({ tableData: filterData })
    }

    /**
    * @method getDetail
    * @description USED TO GET VOLUME DETAIL
    */
    getDetail = () => {
        const { data } = this.props;
        if (data && data.isEditFlag) {
            this.setState({
                isLoader: true,
                isEditFlag: false,
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
                            if (el.Month === item.Month) {
                                tableArray.push({
                                    VolumeApprovedDetailId: item.VolumeApprovedDetailId,
                                    VolumeBudgetedDetailId: el.VolumeBudgetedDetailId,
                                    Month: item.Month,
                                    BudgetedQuantity: el.BudgetedQuantity,
                                    ApprovedQuantity: item.ApprovedQuantity,
                                    Sequence: el.Sequence,
                                })
                                return tableArray.sort();
                            }
                        })
                    })

                    setTimeout(() => {
                        const { vendorListByVendorType, financialYearSelectList, partSelectList } = this.props;
                        const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value === Data.VendorId)
                        const yearObj = financialYearSelectList && financialYearSelectList.find(item => item.Text === Data.Year)
                        const partObj = partSelectList && partSelectList.find(item => item.Value === Data.PartId)

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            selectedPlants: plantArray,
                            //selectedVendorPlants: vendorPlantArray,
                            selectedVendorPlants: [],
                            vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
                            year: yearObj && yearObj !== undefined ? { label: yearObj.Text, value: yearObj.Value } : [],
                            part: partObj && partObj !== undefined ? { label: partObj.Text, value: partObj.Value } : [],
                            tableData: tableArray.sort((a, b) => a.Sequence - b.Sequence),
                        })
                    }, 500)

                }
            })
        } else {
            this.props.getVolumeData('', () => { })
        }
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
            selectedVendorPlants: [],
            tableData: [],
            isEditFlag: false,
        })
        this.props.getVolumeData('', () => { })
        this.props.hideForm();
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { IsVendor, selectedPlants, vendorName, selectedVendorPlants, part, year, tableData, VolumeId } = this.state;

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
                    this.cancel()
                }
            });

        } else {/** Add new detail for creating supplier master **/

            let formData = {
                IsVendor: IsVendor,
                VendorId: vendorName.value,
                PartId: part.value,
                PartNumber: part.label,
                OldPartNumber: '',
                Year: year.label,
                VolumeApprovedDetails: approvedArray,
                VolumeBudgetedDetails: budgetArray,
                Plant: !IsVendor ? plantArray : [],
                //VendorPlant: vendorPlants,
                VendorPlant: [],
                LoggedInUserId: loggedInUserId(),
                IsActive: true
            }
            this.props.createVolume(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.VOLUME_ADD_SUCCESS);
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
        const { handleSubmit, } = this.props;
        const { isEditFlag, isOpenVendor, } = this.state;

        const cellEditProp = {
            mode: 'click',
            blurToSave: true,
        };

        return (
            <>
                {/* {isLoader && <Loader />} */}
                <div className="login-container signup-form">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="shadow-lgg login-formg">
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
                                            <label className="switch-level">
                                                <div className={'left-title'}>Zero Based</div>
                                                <Switch
                                                    onChange={this.onPressVendor}
                                                    checked={this.state.IsVendor}
                                                    id="normal-switch"
                                                    disabled={isEditFlag ? true : false}
                                                    background="#4DC771"
                                                    onColor="#4DC771"
                                                    onHandleColor="#ffffff"
                                                    offColor="#4DC771"
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
                                        {!this.state.IsVendor &&
                                            <Col md="3">
                                                <Field
                                                    label="Plant"
                                                    name="Plant"
                                                    placeholder="--Select--"
                                                    selection={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [] : this.state.selectedPlants}
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
                                                        validate={(this.state.vendorName == null || this.state.vendorName.length === 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleVendorName}
                                                        valueDescription={this.state.vendorName}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </div>
                                                <div
                                                    onClick={this.vendorToggler}
                                                    className={'plus-icon-square mr15 right'}>
                                                </div>
                                            </div>
                                        </Col>
                                        {/* <Col md="3">
                                            <Field
                                                label="Vendor Plant"
                                                name="VendorPlant"
                                                placeholder="--- Plant ---"
                                                selection={(this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0) ? [] : this.state.selectedVendorPlants}
                                                options={this.renderListing('VendorPlant')}
                                                selectionChanged={this.handleVendorPlant}
                                                optionValue={option => option.Value}
                                                optionLabel={option => option.Text}
                                                component={renderMultiSelectField}
                                                mendatory={true}
                                                className="multiselect-with-border"
                                                disabled={isEditFlag ? true : false}
                                            />
                                        </Col> */}
                                        <Col md="3">
                                            <Field
                                                name="PartNumber"
                                                type="text"
                                                label="Part No."
                                                component={searchableSelect}
                                                placeholder={'--select--'}
                                                options={this.renderListing('PartList')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={(this.state.part == null || this.state.part.length === 0) ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handlePart}
                                                valueDescription={this.state.part}
                                                disabled={isEditFlag ? true : false}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                name="FinancialYear"
                                                type="text"
                                                label="Year"
                                                component={searchableSelect}
                                                placeholder={'--select--'}
                                                options={this.renderListing('yearList')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={(this.state.year == null || this.state.year.length === 0) ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleFinancialYear}
                                                valueDescription={this.state.year}
                                                disabled={isEditFlag ? true : false}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="12">
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
                        </div>}
                </div>
                    {isOpenVendor && <AddVendorDrawer
                        isOpen={isOpenVendor}
                        closeDrawer={this.closeVendorDrawer}
                        isEditFlag={false}
                        ID={''}
                        anchor={'right'}
                    />}
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
function mapStateToProps({ comman, volume, material, part }) {
    const { plantSelectList, filterPlantList, } = comman;
    const { volumeData, financialYearSelectList } = volume;
    const { vendorListByVendorType } = material;
    const { partSelectList } = part;

    let initialValues = {};
    if (volumeData && volumeData !== undefined) {
        initialValues = {
            PartNumber: volumeData.PartNumber,
            PartName: volumeData.PartName,
        }
    }

    return {
        plantSelectList, vendorListByVendorType, filterPlantList, volumeData, financialYearSelectList,
        partSelectList, initialValues,
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getPlantSelectListByType,
    getVendorListByVendorType,
    getPlantBySupplier,
    createVolume,
    updateVolume,
    getVolumeData,
    getFinancialYearSelectList,
    getPartSelectList,
})(reduxForm({
    form: 'AddVolume',
    enableReinitialize: true,
})(AddVolume));

