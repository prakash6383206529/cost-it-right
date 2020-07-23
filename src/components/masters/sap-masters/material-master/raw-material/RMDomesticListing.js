import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, Table, Button } from 'reactstrap';
import {
    deleteRawMaterialAPI, getRMDomesticDataList, getRawMaterialNameChild,
    getGradeListByRawMaterialNameChild,
} from '../../../../../actions/master/Material';
import { required } from "../../../../../helper/validation";
import { getSupplierList } from '../../../../../actions/master/Comman';
import { searchableSelect } from "../../../../layout/FormInputs";
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { MESSAGES } from '../../../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css'
import moment from 'moment';
import DomesticBulkUpload from './DomesticBulkUpload';

class RMDomesticListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
            RawMaterial: [],
            RMGrade: [],
            vendorName: [],
            value: { min: 10, max: 150 },
            isBulkUpload: false,
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.onRef(this)
        this.props.getRawMaterialNameChild(() => { })
        this.props.getSupplierList(() => { })
        this.getDataList(null, null, null)
    }

    // Get updated Table data list after any action performed.
    getUpdatedData = () => {
        this.getDataList(null, null, null)
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
        this.props.getRMDomesticDataList(filterData, (res) => {
            if (res && res.status == 200) {
                let Data = res.data.DataList;
                this.setState({ tableData: Data })
            } else if (res && res.response && res.response.status == 412) {
                this.setState({ tableData: [] })
            } else {
                this.setState({ tableData: [] })
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
            if (res.data.Result === true) {
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
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell, row)} />
                <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />
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
        if (currentPage == 1) {
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

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    renderEffectiveDate = () => {
        return <>Effective <br />Date</>
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { gradeSelectListByRMID, rawMaterialNameSelectList, supplierSelectList } = this.props;
        const temp = [];
        if (label === 'material') {
            rawMaterialNameSelectList && rawMaterialNameSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'grade') {
            gradeSelectListByRMID && gradeSelectListByRMID.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            supplierSelectList && supplierSelectList.map(item => {
                if (item.Value == 0) return false;
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
        if (newValue && newValue != '') {

            this.setState({ RawMaterial: newValue }, () => {
                const { RawMaterial } = this.state;
                this.props.getGradeListByRawMaterialNameChild(RawMaterial.value, res => { })
            });

        } else {

            this.setState({
                RMGrade: [],
                RawMaterial: [],
            });

        }
    }

    /**
    * @method handleGradeChange
    * @description  used to handle row material grade selection
    */
    handleGradeChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RMGrade: newValue })
        } else {
            this.setState({ RMGrade: [], })
        }
    }

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorName: newValue });
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
            value: { min: 10, max: 150 },
        }, () => {
            this.getDataList(null, null, null)
        })

    }

    formToggle = () => {
        this.props.formToggle()
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false })
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
        const { handleSubmit } = this.props;
        const { isBulkUpload } = this.state;
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
                        <Col md="9" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    <Field
                                        name="RawMaterialId"
                                        type="text"
                                        label={''}
                                        component={searchableSelect}
                                        placeholder={'Raw Material'}
                                        options={this.renderListing('material')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.RawMaterial == null || this.state.RawMaterial.length == 0) ? [required] : []}
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
                                        options={this.renderListing('grade')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.RMGrade == null || this.state.RMGrade.length == 0) ? [required] : []}
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
                                        placeholder={'Vendor Name'}
                                        options={this.renderListing('VendorNameList')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.vendorName == null || this.state.vendorName.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleVendorName}
                                        valueDescription={this.state.vendorName}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <InputRange
                                        maxValue={500}
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
                                    {!this.props.isShowForm &&
                                        <>
                                            <button
                                                type="button"
                                                className={'user-btn mr5'}
                                                onClick={this.bulkToggle}>
                                                <div className={'plus'}></div>Bulk Upload</button>
                                            <button
                                                type="button"
                                                className={'user-btn'}
                                                onClick={this.formToggle}>
                                                <div className={'plus'}></div>ADD</button>
                                        </>
                                    }
                                </div>
                            </div>
                        </Col>
                    </Row>

                </form>
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.state.tableData}
                            striped={true}
                            hover={true}
                            options={options}
                            search
                            // exportCSV
                            ignoreSinglePage
                            ref={'table'}
                            pagination>
                            <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn>
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
                {isBulkUpload && <DomesticBulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    ID={''}
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
function mapStateToProps({ material, comman }) {
    const { rawMaterialNameSelectList, gradeSelectListByRMID } = material;
    const { supplierSelectList, } = comman;
    return { supplierSelectList, rawMaterialNameSelectList, gradeSelectListByRMID }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    deleteRawMaterialAPI,
    getRMDomesticDataList,
    getRawMaterialNameChild,
    getGradeListByRawMaterialNameChild,
    getSupplierList,
})(reduxForm({
    form: 'RMDomesticListing',
    enableReinitialize: true,
})(RMDomesticListing));