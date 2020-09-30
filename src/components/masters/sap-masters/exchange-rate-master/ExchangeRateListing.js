import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../../layout/FormInputs";
import { required } from "../../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { getExchangeRateDataList, deleteExchangeRate, getCurrencySelectList } from '../../../../actions/master/ExchangeRateMaster';
import AddExchangeRate from './AddExchangeRate';
import { EXCHANGE_RATE } from '../../../../config/constants';
import { checkPermission } from '../../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../../helper/auth';
import { getLeftMenu, } from '../../../../actions/auth/AuthActions';
import moment from 'moment';

class ExchangeRateListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],
            currency: [],
            toggleForm: false,

            data: { isEditFlag: false, ID: '' },

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
                const accessData = Data && Data.find(el => el.PageName === EXCHANGE_RATE)
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
        this.props.getCurrencySelectList(() => { })
        this.getTableListData()
    }

    /**
    * @method getTableListData
    * @description Get list data
    */
    getTableListData = (currencyId = '') => {
        let filterData = {
            currencyId: currencyId,
        }
        this.props.getExchangeRateDataList(filterData, res => {
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
        const { currencySelectList } = this.props;
        const temp = [];
        if (label === 'currency') {
            currencySelectList && currencySelectList.map(item => {
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
        return toastr.confirm(MESSAGES.EXCHANGE_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteExchangeRate(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_EXCHANGE_SUCCESS);
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
                {EditAccessibility && <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    /**
    * @method handleCurrency
    * @description called
    */
    handleCurrency = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ currency: newValue, });
        } else {
            this.setState({ currency: [], })
        }
    };

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
        return (
            <p style={{ color: 'blue' }}>
                Showing {start} of {to} entries.
            </p>
        );
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { currency, } = this.state;
        const currencyTemp = currency ? currency.value : null;
        this.getTableListData(currencyTemp)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            currency: [],
        }, () => {
            this.getTableListData()
        })
    }

    formToggle = () => {
        this.setState({ toggleForm: true })
    }

    hideForm = () => {
        this.setState({
            currency: [],
            data: { isEditFlag: false, ID: '' },
            toggleForm: false,
        }, () => {
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
        const { toggleForm, data, AddAccessibility, } = this.state;

        if (toggleForm) {
            return (
                <AddExchangeRate
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
            paginationSize: 2,
        };

        return (
            <>
                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <div class="col-sm-4"><h3>Exchange Rate Master</h3></div>
                    <hr />
                    <Row className="pt-30">
                        <Col md="9" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    <Field
                                        name="Currency"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'--Select Currency--'}
                                        options={this.renderListing('currency')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.currency == null || this.state.currency.length === 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleCurrency}
                                        valueDescription={this.state.currency}
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
                    bordered={false}
                    hover={true}
                    options={options}
                    search
                    // exportCSV
                    ignoreSinglePage
                    ref={'table'}
                    trClassName={'userlisting-row'}
                    tableHeaderClass='my-custom-header'
                    pagination>
                    <TableHeaderColumn dataField="Currency" columnTitle={true} dataAlign="center" dataSort={true} >{'Currency'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="CurrencyExchangeRate" width={150} columnTitle={true} dataAlign="center" >{'Exchange Rate(INR)'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="BankRate" columnTitle={true} dataAlign="center" >{'Bank Rate(INR)'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="BankCommissionPercentage" columnTitle={true} dataAlign="center" >{'Bank Commission %'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="CustomRate" width={150} columnTitle={true} dataAlign="center" >{'Custom Rate(INR)'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="EffectiveDate" columnTitle={true} dataAlign="center" dataFormat={this.effectiveDateFormatter} >{'Effective Date'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="DateOfModification" columnTitle={true} dataAlign="center" dataFormat={this.effectiveDateFormatter} >{'Date of Modification'}</TableHeaderColumn>
                    <TableHeaderColumn className="action" dataField="ExchangeRateId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                </BootstrapTable>
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ exchangeRate, auth }) {
    const { currencySelectList } = exchangeRate;
    const { leftMenuData } = auth;
    return { leftMenuData, currencySelectList };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getExchangeRateDataList,
    deleteExchangeRate,
    getCurrencySelectList,
    getLeftMenu,
})(reduxForm({
    form: 'ExchangeRateListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(ExchangeRateListing));
