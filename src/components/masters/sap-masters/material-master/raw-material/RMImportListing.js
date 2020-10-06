import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
    deleteRawMaterialAPI, getRMImportDataList, getRawMaterialNameChild,
    getGradeSelectList, getRMGradeSelectListByRawMaterial,
    getRawMaterialFilterSelectList,
    getGradeFilterByRawMaterialSelectList,
    getVendorFilterByRawMaterialSelectList,
    getRawMaterialFilterByGradeSelectList,
    getVendorFilterByGradeSelectList,
    getRawMaterialFilterByVendorSelectList,
    getGradeFilterByVendorSelectList,
} from '../../../../../actions/master/Material';
import { required } from "../../../../../helper/validation";
import { getSupplierList } from '../../../../../actions/master/Comman';
import { searchableSelect } from "../../../../layout/FormInputs";
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import NoContentFound from '../../../../common/NoContentFound';
import { MESSAGES } from '../../../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import moment from 'moment';
import BulkUpload from '../../../../massUpload/BulkUpload';

class RMImportListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
            RawMaterial: [],
            RMGrade: [],
            vendorName: [],
            value: { min: 0, max: 0 },
            maxRange: 0,
            isBulkUpload: false,
        }
    }

    UNSAFE_componentWillMount() {
        this.getInitialRange()
    }

    /**
    * @method getInitialRange
    * @description GET INTIAL RANGE OF MIN AND MAX VALUES FOR SLIDER
    */
    getInitialRange = () => {
        const { value } = this.state;
        const filterData = {
            material_id: null,
            grade_id: null,
            vendor_id: null,
            net_landed_min_range: value.min,
            net_landed_max_range: value.max,
        }
        this.props.getRMImportDataList(filterData, (res) => {
            if (res && res.status === 200) {
                let DynamicData = res.data.DynamicData;
                this.setState({ value: { min: 0, max: DynamicData.MaxRange }, })
            }
        })
    }


    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        //this.props.onRef(this)
        this.props.getRawMaterialNameChild(() => { })
        this.props.getGradeSelectList(() => { })
        this.props.getSupplierList(() => { })

        this.props.getRawMaterialFilterSelectList(() => { })

        this.getDataList()
    }

    // Get updated Table data list after any action performed.
    getUpdatedData = () => {
        this.getDataList()
    }

    getDataList = (materialId = null, gradeId = null, vendorId = null) => {
        const { value } = this.state;
        const filterData = {
            material_id: materialId,
            grade_id: gradeId,
            vendor_id: vendorId,
            net_landed_min_range: value.min,
            net_landed_max_range: value.max,
        }
        this.props.getRMImportDataList(filterData, (res) => {
            if (res && res.status === 200) {
                let Data = res.data.DataList;
                let DynamicData = res.data.DynamicData;
                this.setState({
                    tableData: Data,
                    maxRange: DynamicData.MaxRange,
                })
            } else if (res && res.response && res.response.status === 412) {
                this.setState({ tableData: [], maxRange: 0, })
            } else {
                this.setState({ tableData: [], maxRange: 0, })
            }
        })
    }

    /**
    * @method editItemDetails
    * @description edit material type
    */
    editItemDetails = (Id, rowData) => {
        let data = {
            isEditFlag: true,
            Id: Id,
            IsVendor: rowData.CostingHead,
        }
        this.props.getDetails(data);
    }

    /**
    * @method deleteItem
    * @description confirm delete Raw Material details
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    confirmDelete = (ID) => {
        this.props.deleteRawMaterialAPI(ID, (res) => {
            if (res.status === 417 && res.data.Result === false) {
                toastr.warning(res.data.Message)
                //toastr.warning('The specification is associated in the system. Please remove the association to delete')
            } else if (res && res.data && res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
                this.getDataList(null, null, null)
            }
        });
    }

    /**
    * @method renderPaginationShowsTotal
    * @description Pagination
    */
    renderPaginationShowsTotal(start, to, total) {
        return (
            <p style={{ color: 'blue' }}>
                Showing {start} of {to} entries.
            </p>
        );
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        const { EditAccessibility, DeleteAccessibility } = this.props;
        return (
            <>
                {EditAccessibility && <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell, row)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return cell ? 'VBC' : 'ZBC';
    }

    /**
    * @method indexFormatter
    * @description Renders serial number
    */
    indexFormatter = (cell, row, enumObject, rowIndex) => {
        const { table } = this.refs;
        let currentPage = table && table.state && table.state.currPage ? table.state.currPage : '';
        let sizePerPage = table && table.state && table.state.sizePerPage ? table.state.sizePerPage : '';
        let serialNumber = '';
        if (currentPage === 1) {
            serialNumber = rowIndex + 1;
        } else {
            serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
        }
        return serialNumber;
    }

    renderSerialNumber = () => {
        return <>Sr. <br />No. </>
    }

    renderCostingHead = () => {
        return <>Costing <br />Head </>
    }

    renderRawMaterial = () => {
        return <>Raw <br />Material </>
    }

    renderRMGrade = () => {
        return <>RM <br />Grade </>
    }

    renderRMSpec = () => {
        return <>RM <br />Spec </>
    }

    renderVendorLocation = () => {
        return <>Vendor <br />Location </>
    }

    renderBasicRate = () => {
        return <>Basic <br />Rate(INR) </>
    }

    renderScrapRate = () => {
        return <>Scrap <br />Rate(INR) </>
    }

    renderNetCost = () => {
        return <>Net Landed <br />Cost(INR) </>
    }

    renderEffectiveDate = () => {
        return <>Effective <br />Date</>
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { filterRMSelectList, } = this.props;
        const temp = [];
        if (label === 'material') {
            filterRMSelectList && filterRMSelectList.RawMaterials && filterRMSelectList.RawMaterials.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'grade') {
            filterRMSelectList && filterRMSelectList.Grades && filterRMSelectList.Grades.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            filterRMSelectList && filterRMSelectList.Vendors && filterRMSelectList.Vendors.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
    * @method handleRMChange
    * @description  used to handle row material selection
    */
    handleRMChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ RawMaterial: newValue, RMGrade: [] }, () => {
                const { RawMaterial } = this.state;
                this.props.getGradeFilterByRawMaterialSelectList(RawMaterial.value, res => { })
                this.props.getVendorFilterByRawMaterialSelectList(RawMaterial.value, res => { })

            });
        } else {
            this.setState({ RawMaterial: [], RMGrade: [] }, () => {
                this.props.getGradeSelectList(res => { });
            });

        }
    }

    /**
    * @method handleGradeChange
    * @description  used to handle row material grade selection
    */
    handleGradeChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ RMGrade: newValue }, () => {
                const { RMGrade } = this.state;
                this.props.getRawMaterialFilterByGradeSelectList(RMGrade.value, () => { })
                this.props.getVendorFilterByGradeSelectList(RMGrade.value, () => { })
            })
        } else {
            this.setState({ RMGrade: [], })
        }
    }

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue }, () => {
                const { vendorName } = this.state;
                this.props.getRawMaterialFilterByVendorSelectList(vendorName.value, () => { })
                this.props.getGradeFilterByVendorSelectList(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [] })
        }
    };

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { RawMaterial, RMGrade, vendorName } = this.state;
        const RMid = RawMaterial ? RawMaterial.value : null;
        const RMGradeid = RMGrade ? RMGrade.value : null;
        const Vendorid = vendorName ? vendorName.value : null;

        this.getDataList(RMid, RMGradeid, Vendorid)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            RawMaterial: [],
            RMGrade: [],
            vendorName: [],
            value: { min: 0, max: 0 },
        }, () => {
            this.getInitialRange()
            this.getDataList()
            this.props.getRawMaterialFilterSelectList(() => { })
        })

    }

    formToggle = () => {
        this.props.formToggle()
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getInitialRange()
            this.getDataList()
        })
    }

    /**
    * @method densityAlert
    * @description confirm Redirection to Material tab.
    */
    densityAlert = () => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDensity()
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`Recently Created Material's Density is not created, Do you want to create?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDensity
    * @description confirm density popup.
    */
    confirmDensity = () => {
        this.props.toggle('4')
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
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility } = this.props;
        const { isBulkUpload, } = this.state;
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 2,
        };

        return (
            <div>
                {this.props.loading && <Loader />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-30">
                        <Col md="9" className="filter-block ">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    <Field
                                        name="RawMaterialId"
                                        type="text"
                                        label={''}
                                        component={searchableSelect}
                                        placeholder={'Raw Material'}
                                        isClearable={false}
                                        options={this.renderListing('material')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.RawMaterial == null || this.state.RawMaterial.length === 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleRMChange}
                                        valueDescription={this.state.RawMaterial}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="RawMaterialGradeId"
                                        type="text"
                                        label={''}
                                        component={searchableSelect}
                                        placeholder={'RM Grade'}
                                        isClearable={false}
                                        options={this.renderListing('grade')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.RMGrade == null || this.state.RMGrade.length === 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleGradeChange}
                                        valueDescription={this.state.RMGrade}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="VendorId"
                                        type="text"
                                        label={''}
                                        component={searchableSelect}
                                        placeholder={'-Vendor-'}
                                        isClearable={false}
                                        options={this.renderListing('VendorNameList')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.vendorName == null || this.state.vendorName.length === 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleVendorName}
                                        valueDescription={this.state.vendorName}
                                    />
                                </div>
                                <div className="flex-fill sliderange">
                                    <InputRange
                                        maxValue={this.state.maxRange}
                                        minValue={0}
                                        value={this.state.value}
                                        onChange={value => this.setState({ value })} />
                                </div>

                                <div className="flex-fill">
                                    <button
                                        type="button"
                                        //disabled={pristine || submitting}
                                        onClick={this.resetFilter}
                                        className="reset mr10"
                                    >
                                        {'Reset'}
                                    </button>

                                    <button
                                        type="button"
                                        //disabled={pristine || submitting}
                                        onClick={this.filterList}
                                        className="apply mr5"
                                    >
                                        {'Apply'}
                                    </button>
                                </div>
                            </div>
                        </Col>
                        <Col md="3" className="search-user-block">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    {BulkUploadAccessibility && <button
                                        type="button"
                                        className={'user-btn mr5'}
                                        onClick={this.bulkToggle}>
                                        <div className={'upload'}></div>Bulk Upload</button>}
                                    {AddAccessibility && <button
                                        type="button"
                                        className={'user-btn'}
                                        onClick={this.formToggle}>
                                        <div className={'plus'}></div>ADD</button>}
                                </div>
                            </div>
                        </Col>
                    </Row>

                </form>
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.state.tableData}
                            striped={false}
                            bordered={false}
                            hover={true}
                            options={options}
                            search
                            // exportCSV
                            ignoreSinglePage
                            ref={'table'}
                            pagination>
                            {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                            <TableHeaderColumn dataField="CostingHead" width={100} columnTitle={true} dataAlign="center" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="RawMaterial" width={100} columnTitle={true} dataAlign="center" >{this.renderRawMaterial()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMGrade" width={70} columnTitle={true} dataAlign="center" >{this.renderRMGrade()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="RMSpec" >{this.renderRMSpec()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="Category" >Category</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="VendorName" >Vendor</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="VendorLocation" >{this.renderVendorLocation()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="UOM" >UOM</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="BasicRate" >{this.renderBasicRate()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="ScrapRate" >{this.renderScrapRate()}</TableHeaderColumn>
                            <TableHeaderColumn width={120} columnTitle={true} dataAlign="center" dataField="NetLandedCost" >{this.renderNetCost()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="EffectiveDate" dataFormat={this.effectiveDateFormatter} >{this.renderEffectiveDate()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} dataField="RawMaterialId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </Col>
                </Row>
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    densityAlert={this.densityAlert}
                    fileName={'RMImport'}
                    isZBCVBCTemplate={true}
                    messageLabel={'RM Import'}
                    anchor={'right'}
                />}
            </div >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material, comman, }) {
    const { rawMaterialNameSelectList, gradeSelectList, filterRMSelectList } = material;
    const { supplierSelectList, } = comman;
    return { supplierSelectList, rawMaterialNameSelectList, gradeSelectList, filterRMSelectList, }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    deleteRawMaterialAPI,
    getRMImportDataList,
    getRawMaterialNameChild,
    getGradeSelectList,
    getRMGradeSelectListByRawMaterial,
    getSupplierList,
    getRawMaterialFilterSelectList,
    getGradeFilterByRawMaterialSelectList,
    getVendorFilterByRawMaterialSelectList,
    getRawMaterialFilterByGradeSelectList,
    getVendorFilterByGradeSelectList,
    getRawMaterialFilterByVendorSelectList,
    getGradeFilterByVendorSelectList,
})(reduxForm({
    form: 'RMImportListing',
    enableReinitialize: true,
})(RMImportListing));