import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { required } from "../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import $ from 'jquery';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import {
    getSupplierDataList, activeInactiveVendorStatus, deleteSupplierAPI,
    getVendorTypesSelectList, getVendorsByVendorTypeID, getAllVendorSelectList,
    getVendorTypeByVendorSelectList
} from '../actions/Supplier';
import { fetchCountryDataAPI, } from '../../../actions/Common';
import Switch from "react-switch";
import BulkUpload from '../../massUpload/BulkUpload';
import AddVendorDrawer from './AddVendorDrawer';

import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { VENDOR } from '../../../config/constants';
import { loggedInUserId } from '../../../helper';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class VendorListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpenVendor: false,
            ID: '',
            shown:false,
            isBulkUpload: false,
            tableData: [],
            vendorType: [],
            vendorName: [],
            country: [],

            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            ViewAccessibility: false,
            DownloadAccessibility: false,
            BulkUploadAccessibility: false,
            ActivateAccessibility: false,

        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    UNSAFE_componentWillMount() {
        this.props.getVendorTypesSelectList()
        this.props.getAllVendorSelectList()
        this.props.fetchCountryDataAPI(() => { })
    }

    componentDidMount() {
        this.getTableListData(null, null, null)

        let ModuleId = reactLocalStorage.get('ModuleId');
        this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
            const { leftMenuData } = this.props;
            if (leftMenuData !== undefined) {
                let Data = leftMenuData;
                const accessData = Data && Data.find(el => el.PageName === VENDOR)
                const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

                if (permmisionData !== undefined) {
                    this.setState({
                        ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                        AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                        EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                        DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                        DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
                        BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
                        ActivateAccessibility: permmisionData && permmisionData.Activate ? permmisionData.Activate : false,
                    })
                }
            }
        })
        //this.props.onRef(this)
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData(null, null, null)
    }

    /**
    * @method getTableListData
    * @description GET VENDOR DATA LIST
    */
    getTableListData = (vendorType = null, vendorName = null, country = null) => {
        let filterData = {
            vendor_type: vendorType,
            vendor_name: vendorName,
            country: country,
        }
        this.props.getSupplierDataList(filterData, res => {
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
        const { countryList, vendorTypeList, vendorSelectList } = this.props;

        const temp = [];
        if (label === 'country') {
            countryList && countryList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'vendorType') {
            vendorTypeList && vendorTypeList.map((item, i) => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'vendorList') {
            vendorSelectList && vendorSelectList.map(item => {
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
            isOpenVendor: true,
            isEditFlag: true,
            ID: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete Item.
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id);
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(`Are you sure you want to delete this Vendor?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteSupplierAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_SUPPLIER_SUCCESS);
                this.filterList()
                //this.getTableListData(null, null, null)
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
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cell)} />}
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
        this.props.activeInactiveVendorStatus(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell == true) {
                    toastr.success(MESSAGES.VENDOR_INACTIVE_SUCCESSFULLY)
                } else {
                    toastr.success(MESSAGES.VENDOR_ACTIVE_SUCCESSFULLY)
                }
                //this.getTableListData(null, null, null)
                this.filterList()
            }
        })
    }

    /**
    * @method handleVendorType
    * @description Used to handle vendor type
    */
    handleVendorType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorType: newValue, }, () => {
                const { vendorType } = this.state;
                this.props.getVendorsByVendorTypeID(vendorType.value, (res) => { })
            });
        } else {
            this.setState({ vendorType: [], }, () => {
                this.props.getAllVendorSelectList()
            })
        }
    };

    /**
    * @method handleVendorName
    * @description Used to handle vendor name
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue, }, () => {
                const { vendorName } = this.state;
                this.props.getVendorTypeByVendorSelectList(vendorName.value)
            });
        } else {
            this.setState({ vendorName: [], })
        }
    };

    /**
    * @method countryHandler
    * @description Used to handle country
    */
    countryHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ country: newValue, });
        } else {
            this.setState({ country: [], })
        }
    };

    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
        const { ActivateAccessibility } = this.state;
        if (ActivateAccessibility) {
            return (
                <>
                    <label htmlFor="normal-switch">
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
        } else {
            return (
                <>
                    {
                        cell ?
                            <div className={'Activated'}> {'Active'}</div>
                            :
                            <div className={'Deactivated'}>{'Deactive'}</div>
                    }
                </>
            )
        }
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

    onExportToCSV = (row) => {
        return this.state.userData; // must return the data which you want to be exported
    }

    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    bulkToggle = () => {
        $("html,body").animate({ scrollTop: 0 }, "slow");
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getTableListData(null, null, null)
        })
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { vendorType, vendorName, country } = this.state;
        const vType = vendorType && vendorType != null ? vendorType.value : null;
        const vName = vendorName && vendorName != null ? vendorName.value : null;
        const Country = country && country != null ? country.value : null;
        this.getTableListData(vType, vName, Country)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            vendorType: [],
            vendorName: [],
            country: [],
        }, () => {
            this.props.getVendorTypesSelectList()
            this.props.getAllVendorSelectList()
            this.getTableListData(null, null, null)
        })
    }

    formToggle = () => {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        this.setState({ isOpenVendor: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({
            isOpenVendor: false,
            isEditFlag: false,
            ID: '',
        }, () => {
            this.filterList()
            // this.getTableListData(null, null, null)
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
        const { isOpenVendor, isEditFlag, isBulkUpload, AddAccessibility, BulkUploadAccessibility } = this.state;
        const options = {
            clearSearch: true,
            noDataText: (this.props.supplierDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            //exportCSVText: 'Download Excel',
            //onExportToCSV: this.onExportToCSV,
            //paginationShowsTotal: true,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,

        };

        return (
            <div className="container-fluid">
                {/* {this.props.loading && <Loader />} */}
                <form
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                    noValidate
                    className="mr15"
                >
                    <Row>
                        <Col md="12">
                            <h1 className="mb-0">Vendor Master</h1>
                        </Col>
                    </Row>
                    <Row className="pt-4 px-15 blue-before">
                        {this.state.shown && (
                            <Col md="12" lg="8" className="filter-block">
                                <div className="d-inline-flex justify-content-start align-items-top w100">
                                    <div className="flex-fills">
                                        <h5>{`Filter By:`}</h5>
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="VendorType"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Vendor Type"}
                                            options={this.renderListing("vendorType")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={
                                                this.state.vendorType == null ||
                                                    this.state.vendorType.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={this.handleVendorType}
                                            valueDescription={this.state.vendorType}
                                            disabled={this.state.isEditFlag ? true : false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="Vendors"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Vendor Name"}
                                            options={this.renderListing("vendorList")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={
                                                this.state.vendorName == null ||
                                                    this.state.vendorName.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={this.handleVendorName}
                                            valueDescription={this.state.vendorName}
                                            disabled={this.state.isEditFlag ? true : false}
                                        />
                                    </div>

                                    <div className="flex-fill">
                                        <button
                                            type="button"
                                            //disabled={pristine || submitting}
                                            onClick={this.resetFilter}
                                            className="reset mr10"
                                        >
                                            {"Reset"}
                                        </button>
                                        <button
                                            type="button"
                                            //disabled={pristine || submitting}
                                            onClick={this.filterList}
                                            className="user-btn mr5"
                                        >
                                            {"Apply"}
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        )}
                        <Col md="6" lg="6" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    {this.state.shown ? (
                                        <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                            <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                                    ) : (
                                            <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                                        )}
                                    {BulkUploadAccessibility && (
                                        <button
                                            type="button"
                                            className={"user-btn mr5"}
                                            onClick={this.bulkToggle}
                                        >
                                            <div className={"upload"}></div>Bulk Upload
                                        </button>
                                    )}
                                    {AddAccessibility && (
                                        <button
                                            type="button"
                                            className={"user-btn"}
                                            onClick={this.formToggle}
                                        >
                                            <div className={"plus"}></div>ADD
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </form>
                <BootstrapTable
                    data={this.props.supplierDataList}
                    striped={false}
                    hover={false}
                    bordered={false}
                    options={options}
                    className={"mr15 pr15"}
                    search
                    // exportCSV
                    //ignoreSinglePage
                    ref={"table"}
                    trClassName={"userlisting-row"}
                    tableHeaderClass="my-custom-header"
                    pagination
                >
                    <TableHeaderColumn dataField="VendorType" dataAlign="left" dataSort={true} >Vendor Type</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorName" dataAlign="left" dataSort={true}>Vendor Name</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorCode" dataAlign="left" dataSort={true}> Vendor Code </TableHeaderColumn>
                    <TableHeaderColumn dataField="Country" dataAlign="left" dataSort={true}>Country</TableHeaderColumn>
                    <TableHeaderColumn dataField="State" dataAlign="left" dataSort={true}> State </TableHeaderColumn>
                    <TableHeaderColumn dataField="City" dataAlign="left" dataSort={true}>City</TableHeaderColumn>
                    <TableHeaderColumn dataField="IsActive" export={false} dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn>
                    <TableHeaderColumn dataAlign="right" className="action" dataField="VendorId" export={false} isKey={true} dataFormat={this.buttonFormatter}> Actions </TableHeaderColumn>
                </BootstrapTable>
                {isBulkUpload && (
                    <BulkUpload
                        isOpen={isBulkUpload}
                        closeDrawer={this.closeBulkUploadDrawer}
                        isEditFlag={false}
                        isZBCVBCTemplate={false}
                        fileName={"Vendor"}
                        messageLabel={"Vendor"}
                        anchor={"right"}
                    />
                )}
                {isOpenVendor && (
                    <AddVendorDrawer
                        isOpen={isOpenVendor}
                        closeDrawer={this.closeVendorDrawer}
                        isEditFlag={isEditFlag}
                        isRM={false}
                        ID={this.state.ID}
                        anchor={"right"}
                    />
                )}
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, supplier, auth, }) {
    const { loading, vendorTypeList, vendorSelectList, vendorTypeByVendorSelectList, supplierDataList } = supplier;
    const { countryList } = comman;
    const { leftMenuData } = auth;

    return { loading, vendorTypeList, countryList, leftMenuData, vendorSelectList, vendorTypeByVendorSelectList, supplierDataList };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
    getSupplierDataList,
    activeInactiveVendorStatus,
    deleteSupplierAPI,
    getVendorTypesSelectList,
    fetchCountryDataAPI,
    getVendorsByVendorTypeID,
    getLeftMenu,
    getAllVendorSelectList,
    getVendorTypeByVendorSelectList
})(reduxForm({
    form: 'VendorListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(VendorListing));
