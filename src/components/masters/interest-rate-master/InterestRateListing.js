import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { getInterestRateDataList, deleteInterestRate, getPaymentTermsAppliSelectList, getICCAppliSelectList, } from '../actions/InterestRateMaster';
import { getVendorListByVendorType, } from '../actions/Material';
import Switch from "react-switch";
import moment from 'moment';
import AddInterestRate from './AddInterestRate';
import BulkUpload from '../../massUpload/BulkUpload';
import { INTEREST_RATE } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';

class InterestRateListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],

            vendorName: [],
            ICCApplicability: [],
            PaymentTermsApplicability: [],

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
                const accessData = Data && Data.find(el => el.PageName === INTEREST_RATE)
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

        this.props.getVendorListByVendorType(true, () => { })
        this.props.getICCAppliSelectList(() => { })
        this.props.getPaymentTermsAppliSelectList(() => { })
        this.getTableListData()
    }

    /**
    * @method getTableListData
    * @description Get list data
    */
    getTableListData = (vendor = '', icc_applicability = '', payment_term_applicability = '') => {
        let filterData = {
            vendor: vendor,
            icc_applicability: icc_applicability,
            payment_term_applicability: payment_term_applicability,
        }
        this.props.getInterestRateDataList(filterData, res => {
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({ tableData: Data, })
            } else {
                this.setState({ tableData: [], })
            }
        });
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { vendorListByVendorType, paymentTermsSelectList, iccApplicabilitySelectList, } = this.props;
        const temp = [];

        if (label === 'costingHead') {
            let tempObj = [
                { label: 'ZBC', value: 'ZBC' },
                { label: 'VBC', value: 'VBC' },
            ]
            return tempObj;
        }

        if (label === 'VendorList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'ICC') {
            iccApplicabilitySelectList && iccApplicabilitySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'PaymentTerms') {
            paymentTermsSelectList && paymentTermsSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
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
        return toastr.confirm(MESSAGES.INTEREST_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteInterestRate(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_INTEREST_RATE_SUCCESS);
                this.getTableListData()
            }
        });
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
    * @method handleICCApplicability
    * @description called
    */
    handleICCApplicability = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ ICCApplicability: newValue, });
        } else {
            this.setState({ ICCApplicability: [], })
        }
    };

    /**
    * @method handlePaymentApplicability
    * @description called
    */
    handlePaymentApplicability = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ PaymentTermsApplicability: newValue, });
        } else {
            this.setState({ PaymentTermsApplicability: [], })
        }
    };

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue });
        } else {
            this.setState({ vendorName: [] })
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
        return <>Costing Head </>
    }

    renderVendorName = () => {
        return <>Vendor <br />Name </>
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        console.log(cell, "Cell");
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
        const { vendorName, ICCApplicability, PaymentTermsApplicability, } = this.state;

        const vendorTemp = vendorName ? vendorName.value : '';
        const iccTemp = ICCApplicability ? ICCApplicability.value : '';
        const paymentTemp = PaymentTermsApplicability ? PaymentTermsApplicability.value : '';

        this.getTableListData(vendorTemp, iccTemp, paymentTemp)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            vendorName: [],
            ICCApplicability: [],
            PaymentTermsApplicability: [],
        }, () => {
            this.getTableListData()
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
            this.getTableListData()
        })
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getTableListData()
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
                <AddInterestRate
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
                    <div class="col-sm-4"><h3>Interest Rate</h3></div>
                    <hr />
                    <Row className="pt-30">
                        <Col md="9" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    <Field
                                        name="vendorName"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Vendors-'}
                                        isClearable={false}
                                        options={this.renderListing('VendorList')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={(this.state.vendorName == null || this.state.vendorName.length === 0) ? [required] : []}
                                        //required={true}
                                        handleChangeDescription={this.handleVendorName}
                                        valueDescription={this.state.vendorName}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="ICCApplicability"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'--ICC Applicability--'}
                                        isClearable={false}
                                        options={this.renderListing('ICC')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={(this.state.ICCApplicability == null || this.state.ICCApplicability.length === 0) ? [required] : []}
                                        //required={true}
                                        handleChangeDescription={this.handleICCApplicability}
                                        valueDescription={this.state.ICCApplicability}
                                        disabled={false}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="PaymentTermsApplicability"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'--Payment Applicability--'}
                                        isClearable={false}
                                        options={this.renderListing('PaymentTerms')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={(this.state.PaymentTermsApplicability == null || this.state.PaymentTermsApplicability.length === 0) ? [required] : []}
                                        //required={true}
                                        handleChangeDescription={this.handlePaymentApplicability}
                                        valueDescription={this.state.PaymentTermsApplicability}
                                        disabled={false}
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
                    data={this.props.interestRateDataList}
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
                    <TableHeaderColumn dataField="IsVendor" columnTitle={true} dataAlign="center" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorName" columnTitle={true} dataAlign="center" dataSort={true} >{'Vendor Name'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="ICCApplicability" columnTitle={true} dataAlign="center" >{'ICC Applicability'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="ICCPercent" columnTitle={true} dataAlign="center" >{'Annual ICC (%)'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="PaymentTermApplicability" columnTitle={true} dataAlign="center" >{'Payment Term Applicability'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="RepaymentPeriod" columnTitle={true} dataAlign="center" >{'Repayment Period (Days)'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="PaymentTermPercent" columnTitle={true} dataAlign="center" >{'Payment Term Interest Rate (%) '}</TableHeaderColumn>
                    <TableHeaderColumn dataField="EffectiveDate" columnTitle={true} dataAlign="center" dataFormat={this.effectiveDateFormatter} >{'Effective Date'}</TableHeaderColumn>
                    <TableHeaderColumn searchable={false} className="action" dataField="VendorInterestRateId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                </BootstrapTable>
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'InterestRate'}
                    isZBCVBCTemplate={true}
                    messageLabel={'Interest Rate'}
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
function mapStateToProps({ material, auth, interestRate }) {
    const { leftMenuData } = auth;
    const { vendorListByVendorType } = material;
    const { paymentTermsSelectList, iccApplicabilitySelectList, interestRateDataList } = interestRate;
    return { vendorListByVendorType, paymentTermsSelectList, iccApplicabilitySelectList, leftMenuData, interestRateDataList };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getInterestRateDataList,
    deleteInterestRate,
    getVendorListByVendorType,
    getPaymentTermsAppliSelectList,
    getICCAppliSelectList,
    getLeftMenu,
})(reduxForm({
    form: 'InterestRateListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(InterestRateListing));
