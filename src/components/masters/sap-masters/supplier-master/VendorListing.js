import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Button, Table } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../../layout/FormInputs";
import { required } from "../../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import {
    getSupplierDataList, activeInactiveVendorStatus, deleteSupplierAPI,
    getVendorTypesSelectList, getVendorsByVendorTypeID,
} from '../../../../actions/master/Supplier';
import { fetchCountryDataAPI, } from '../../../../actions/master/Comman';
import Switch from "react-switch";
import { loggedInUserId } from '../../../../helper/auth';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class VendorListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],
            vendorType: [],
            vendorName: [],
            country: [],
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {
        this.props.getVendorTypesSelectList()
        this.props.fetchCountryDataAPI(() => { })
    }

    componentDidMount() {
        this.getTableListData(null, null, null)
        this.props.onRef(this)
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData(null, null, null)
    }

	/**
	* @method getTableListData
	* @description Get user list data
	*/
    getTableListData = (vendorType = null, vendorName = null, country = null) => {
        let filterData = {
            vendor_type: vendorType,
            vendor_name: vendorName,
            country: country,
        }
        this.props.getSupplierDataList(filterData, res => {
            if (res.status == 204 && res.data == '') {
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
        const { countryList, vendorTypeList } = this.props;
        const { vendorList } = this.state;
        const temp = [];
        if (label === 'country') {
            countryList && countryList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'vendorType') {
            vendorTypeList && vendorTypeList.map((item, i) => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'vendorList') {
            vendorList && vendorList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
    }


	/**
     * @method roleHandler
     * @description Used to handle 
     */
    // roleHandler = (newValue, actionMeta) => {
    //     this.setState({ role: newValue });
    // };

	/**
	* @method editItemDetails
	* @description confirm edit item
	*/
    editItemDetails = (Id) => {
        let requestData = {
            isEditFlag: true,
            ID: Id,
        }
        this.props.getDetail(requestData)
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
        return toastr.confirm(`Are you sure you want to delete this supplier?`, toastrConfirmOptions);
    }

	/**
	* @method confirmDeleteItem
	* @description confirm delete item
	*/
    confirmDeleteItem = (ID) => {
        this.props.deleteSupplierAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_SUPPLIER_SUCCESS);
                this.getTableListData(null, null, null)
            }
        });
    }

	/**
	* @method buttonFormatter
	* @description Renders buttons
	*/
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} />
                <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />
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
                this.getTableListData(null, null, null)
            }
        })
    }

    /**
    * @method handleVendorType
    * @description Used to handle vendor type
    */
    handleVendorType = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorType: newValue, vendorName: [], }, () => {
                const { vendorType } = this.state;
                this.props.getVendorsByVendorTypeID(vendorType.value, (res) => {
                    if (res && res.data && res.data.SelectList) {
                        let Data = res.data.SelectList;
                        this.setState({ vendorList: Data })
                    }
                })
            });
        } else {
            this.setState({ vendorType: [], vendorName: [] })
        }
    };

    /**
    * @method handleVendorName
    * @description Used to handle vendor name
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorName: newValue, });
        } else {
            this.setState({ vendorName: [], })
        }
    };

    /**
    * @method countryHandler
    * @description Used to handle country
    */
    countryHandler = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ country: newValue, }, () => {
                const { country } = this.state;
            });
        } else {
            this.setState({ country: [], })
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
        if (currentPage == 1) {
            serialNumber = rowIndex + 1;
        } else {
            serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
        }
        return serialNumber;
    }

    onExportToCSV = (row) => {
        console.log('row', row)
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
            this.getTableListData(null, null, null)
        })
    }

    formToggle = () => {
        this.props.formToggle()
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
        const { handleSubmit, pristine, submitting, } = this.props;
        const { isOpen, isEditFlag } = this.state;
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
                    <Row className="pt-30">
                        <Col md="9" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    <Field
                                        name="VendorType"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'Vendor Type'}
                                        options={this.renderListing('vendorType')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.vendorType == null || this.state.vendorType.length == 0) ? [required] : []}
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
                                        placeholder={'Vendor Name'}
                                        options={this.renderListing('vendorList')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.vendorName == null || this.state.vendorName.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleVendorName}
                                        valueDescription={this.state.vendorName}
                                        disabled={this.state.isEditFlag ? true : false}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="CountryId"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'Country'}
                                        options={this.renderListing('country')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.country == null || this.state.country.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.countryHandler}
                                        valueDescription={this.state.country}
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
                                        <button
                                            type="button"
                                            className={'user-btn'}
                                            onClick={this.formToggle}>
                                            <div className={'plus'}></div>ADD VENDOR</button>
                                    }
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
                    <TableHeaderColumn dataField="Sr. No." width={'70'} csvHeader='Full-Name' dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorType" dataAlign="center" dataSort={true}>Vendor Type</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorName" dataAlign="center" dataSort={true}>Vendor Name</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorCode" dataAlign="center" dataSort={true}>Vendor Code</TableHeaderColumn>
                    <TableHeaderColumn dataField="Country" dataAlign="center" dataSort={true}>Country</TableHeaderColumn>
                    <TableHeaderColumn dataField="State" dataAlign="center" dataSort={true}>State</TableHeaderColumn>
                    <TableHeaderColumn dataField="City" dataAlign="center" dataSort={true}>City</TableHeaderColumn>
                    <TableHeaderColumn dataField="IsActive" export={false} dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn>
                    <TableHeaderColumn className="action" dataField="VendorId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

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
function mapStateToProps({ comman, supplier }) {
    const { loading, vendorTypeList } = supplier;
    const { countryList } = comman;

    return { loading, vendorTypeList, countryList };
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
})(reduxForm({
    form: 'VendorListing',
    onSubmitFail: errors => {
        //console.log('Register errors', errors)
        focusOnError(errors);
    },
    enableReinitialize: true,
})(VendorListing));
