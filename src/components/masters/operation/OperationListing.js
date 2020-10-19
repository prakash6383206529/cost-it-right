import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { required } from "../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import {
    getOperationsDataList, deleteOperationAPI, getOperationSelectList,
    getVendorWithVendorCodeSelectList, getTechnologySelectList,
    getVendorListByTechnology,
    getOperationListByTechnology,
    getTechnologyListByOperation,
    getVendorListByOperation,
    getTechnologyListByVendor,
    getOperationListByVendor,
} from '../sap-masters/actions/OtherOperation';
import Switch from "react-switch";
import AddOperation from './AddOperation';
import BulkUpload from '../../massUpload/BulkUpload';
import { OPERATION } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { costingHeadObj } from '../../../config/masterData';


class OperationListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],

            costingHead: [],
            selectedTechnology: [],
            vendorName: [],
            operationName: [],

            data: { isEditFlag: false, ID: '' },
            toggleForm: false,
            isBulkUpload: false,

            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            BulkUploadAccessibility: false,
        }
    }

    componentDidMount() {

        let ModuleId = reactLocalStorage.get('ModuleId');
        this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
            const { leftMenuData } = this.props;
            if (leftMenuData !== undefined) {
                let Data = leftMenuData;
                const accessData = Data && Data.find(el => el.PageName === OPERATION)
                const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

                if (permmisionData !== undefined) {
                    this.setState({
                        ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                        AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                        EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                        DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                        BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
                    })
                }
            }
        })

        this.props.getTechnologySelectList(() => { })
        this.props.getOperationSelectList(() => { })
        this.props.getVendorWithVendorCodeSelectList()
        this.getTableListData(null, null, null, null)
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData(null, null, null, null)
    }

    /**
    * @method getTableListData
    * @description Get user list data
    */
    getTableListData = (operation_for = null, operation_Name_id = null, technology_id = null, vendor_id = null) => {
        let filterData = {
            operation_for: operation_for,
            operation_Name_id: operation_Name_id,
            technology_id: technology_id,
            vendor_id: vendor_id,
        }
        this.props.getOperationsDataList(filterData, res => {
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    tableData: Data,
                })
            } else {

            }
        });
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { filterOperation } = this.props;
        const temp = [];

        if (label === 'technology') {
            filterOperation && filterOperation.technology && filterOperation.technology.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'costingHead') {
            return costingHeadObj;
        }

        if (label === 'OperationNameList') {
            filterOperation && filterOperation.operations && filterOperation.operations.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'VendorList') {
            filterOperation && filterOperation.vendors && filterOperation.vendors.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
    }

    /**
    * @method editItemDetails
    * @description confirm edit item
    */
    editItemDetails = (Id) => {
        this.setState({
            data: { isEditFlag: true, ID: Id },
            toggleForm: true,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete Item.
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(MESSAGES.OPERATION_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteOperationAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_OPERATION_SUCCESS);
                this.getTableListData(null, null, null, null)
            }
        });
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        const { EditAccessibility, DeleteAccessibility } = this.state;
        return (
            <>
                {EditAccessibility && <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.VendorId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        // this.props.activeInactiveVendorStatus(data, res => {
        //     if (res && res.data && res.data.Result) {
        //         if (cell == true) {
        //             toastr.success(MESSAGES.VENDOR_INACTIVE_SUCCESSFULLY)
        //         } else {
        //             toastr.success(MESSAGES.VENDOR_ACTIVE_SUCCESSFULLY)
        //         }
        //         this.getTableListData(null, null, null, null)
        //     }
        // })
    }

    /**
    * @method handleHeadChange
    * @description called
    */
    handleHeadChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ costingHead: newValue, });
        } else {
            this.setState({ costingHead: [], })
        }
    };

    /**
    * @method handleTechnology
    * @description called
    */
    handleTechnology = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ selectedTechnology: newValue, }, () => {
                const { selectedTechnology } = this.state;
                this.props.getVendorListByTechnology(selectedTechnology.value, () => { })
                this.props.getOperationListByTechnology(selectedTechnology.value, () => { })
            });
        } else {
            this.setState({ selectedTechnology: [], })
            this.props.getOperationSelectList(() => { })
            this.props.getVendorWithVendorCodeSelectList()
        }
    };

    /**
    * @method handleOperationName
    * @description called
    */
    handleOperationName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ operationName: newValue }, () => {
                const { operationName } = this.state;
                this.props.getTechnologyListByOperation(operationName.value, () => { })
                this.props.getVendorListByOperation(operationName.value, () => { })
            });
        } else {
            this.setState({ operationName: [] })
            this.props.getTechnologySelectList(() => { })
            this.props.getVendorWithVendorCodeSelectList()
        }
    };

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue }, () => {
                const { vendorName } = this.state;
                this.props.getTechnologyListByVendor(vendorName.value, () => { })
                this.props.getOperationListByVendor(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [] })
            this.props.getTechnologySelectList(() => { })
            this.props.getOperationSelectList(() => { })
        }
    };

    /**
    * @method handleVendorType
    * @description Used to handle vendor type
    */
    handleVendorType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorType: newValue, vendorName: [], });
        } else {
            this.setState({ vendorType: [], vendorName: [] })
        }
    };


    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <label htmlFor="normal-switch">
                    {/* <span>Switch with default style</span> */}
                    <Switch
                        onChange={() => this.handleChange(cell, row, enumObject, rowIndex)}
                        checked={cell}
                        background="#ff6600"
                        onColor="#4DC771"
                        onHandleColor="#ffffff"
                        offColor="#FC5774"
                        id="normal-switch"
                        height={24}
                    />
                </label>
            </>
        )
    }


    /**
    * @method indexFormatter
    * @description Renders serial number
    */
    indexFormatter = (cell, row, enumObject, rowIndex) => {
        let currentPage = this.refs.table.state.currPage;
        let sizePerPage = this.refs.table.state.sizePerPage;
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
    renderOperationName = () => {
        return <>Operation <br />Name </>
    }
    renderOperationCode = () => {
        return <>Operation <br />Code </>
    }
    renderVendorName = () => {
        return <>Vendor <br />Name </>
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return cell ? 'Vendor Based' : 'Zero Based';
    }

    onExportToCSV = (row) => {
        // ...
        return this.state.userData; // must return the data which you want to be exported
    }

    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { costingHead, selectedTechnology, vendorName, operationName, } = this.state;
        const costingHeadTemp = costingHead ? costingHead.value : null;
        const operationNameTemp = operationName ? operationName.value : null;
        const technologyTemp = selectedTechnology ? selectedTechnology.value : null;
        const vendorNameTemp = vendorName ? vendorName.value : null;
        this.getTableListData(costingHeadTemp, operationNameTemp, technologyTemp, vendorNameTemp)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            costingHead: [],
            vendorName: [],
            selectedTechnology: [],
            operationName: [],
        }, () => {
            this.props.getTechnologySelectList(() => { })
            this.props.getOperationSelectList(() => { })
            this.props.getVendorWithVendorCodeSelectList()
            this.getTableListData(null, null, null, null)
        })
    }

    formToggle = () => {
        this.setState({ toggleForm: true })
    }

    hideForm = () => {
        this.setState({
            toggleForm: false,
            data: { isEditFlag: false, ID: '' }
        }, () => {
            this.getTableListData(null, null, null, null)
        })
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getTableListData(null, null, null, null)
        })
    }

    /**
    * @name onSubmit
    * @param values
    * @desc Submit the signup form values.
    * @returns {{}}
    */
    onSubmit(values) {
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, } = this.props;
        const { toggleForm, data, isBulkUpload, AddAccessibility, BulkUploadAccessibility } = this.state;

        if (toggleForm) {
            return (
                <AddOperation
                    hideForm={this.hideForm}
                    data={data}
                />
            )
        }
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            //exportCSVText: 'Download Excel',
            //onExportToCSV: this.onExportToCSV,
            //paginationShowsTotal: true,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 5,
        };

        return (
            <>
                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <div class="col-sm-4"><h3>Operation</h3></div>
                    <hr />
                    <Row className="pt-30">
                        <Col md="9" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    <Field
                                        name="costingHead"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Costing Head-'}
                                        isClearable={false}
                                        options={this.renderListing('costingHead')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.costingHead == null || this.state.costingHead.length === 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleHeadChange}
                                        valueDescription={this.state.costingHead}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="technology"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-technology-'}
                                        isClearable={false}
                                        options={this.renderListing('technology')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.selectedTechnology == null || this.state.selectedTechnology.length === 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleTechnology}
                                        valueDescription={this.state.selectedTechnology}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="operationName"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-operation-'}
                                        isClearable={false}
                                        options={this.renderListing('OperationNameList')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.operationName == null || this.state.operationName.length === 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleOperationName}
                                        valueDescription={this.state.operationName}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="vendorName"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-vendors-'}
                                        isClearable={false}
                                        options={this.renderListing('VendorList')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.vendorName == null || this.state.vendorName.length === 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleVendorName}
                                        valueDescription={this.state.vendorName}
                                    />
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
                <BootstrapTable
                    data={this.state.tableData}
                    striped={false}
                    hover={false}
                    bordered={false}
                    options={options}
                    search
                    // exportCSV
                    //ignoreSinglePage
                    ref={'table'}
                    trClassName={'userlisting-row'}
                    tableHeaderClass='my-custom-header'
                    pagination>
                    {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                    <TableHeaderColumn dataField="CostingHead" columnTitle={true} dataAlign="center" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="Technology" width={150} columnTitle={true} dataAlign="center" >{'Technology'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="OperationName" columnTitle={true} dataAlign="center" >{this.renderOperationName()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="OperationCode" columnTitle={true} dataAlign="center" >{this.renderOperationCode()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="Plants" width={150} columnTitle={true} dataAlign="center" >{'Plant'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorName" columnTitle={true} dataAlign="center" >{this.renderVendorName()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="UnitOfMeasurement" columnTitle={true} dataAlign="center" >{'UOM'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="Rate" width={100} columnTitle={true} dataAlign="center" >{'Rate'}</TableHeaderColumn>
                    {/* <TableHeaderColumn dataField="IsActive" width={100} columnTitle={true} dataAlign="center" dataFormat={this.statusButtonFormatter}>{'Status'}</TableHeaderColumn> */}
                    <TableHeaderColumn className="action" dataField="OperationId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                </BootstrapTable>
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'Operation'}
                    isZBCVBCTemplate={true}
                    messageLabel={'Operation'}
                    anchor={'right'}
                />}
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ otherOperation, auth }) {
    const { loading, filterOperation } = otherOperation;
    const { leftMenuData } = auth;
    return { loading, filterOperation, leftMenuData };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getTechnologySelectList,
    getOperationsDataList,
    deleteOperationAPI,
    getVendorWithVendorCodeSelectList,
    getOperationSelectList,
    getVendorListByTechnology,
    getOperationListByTechnology,
    getTechnologyListByOperation,
    getVendorListByOperation,
    getTechnologyListByVendor,
    getOperationListByVendor,
    getLeftMenu,
})(reduxForm({
    form: 'OperationListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(OperationListing));
