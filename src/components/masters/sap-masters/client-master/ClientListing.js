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
import { getClientDataList, deleteClient } from '../../../../actions/master/Client';
import { } from '../../../../actions/master/Comman';
import Switch from "react-switch";
import { loggedInUserId } from '../../../../helper/auth';
import { Years, Months } from '../../../../config/masterData';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class ClientListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {

    }

    componentDidMount() {
        this.getTableListData(null, null)
        this.props.onRef(this)
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData(null, null)
    }

	/**
	* @method getTableListData
	* @description Get user list data
	*/
    getTableListData = (clientName = null, companyName = null) => {
        let filterData = {
            clientName: clientName,
            companyName: companyName,
        }
        this.props.getClientDataList(filterData, res => {
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
        const { } = this.props;
        const temp = [];

        // if (label === 'VendorList') {
        //     vendorListByVendorType && vendorListByVendorType.map(item => {
        //         if (item.Value == 0) return false;
        //         temp.push({ label: item.Text, value: item.Value })
        //     });
        //     return temp;
        // }

    }

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
        return toastr.confirm(MESSAGES.CLIENT_DELETE_ALERT, toastrConfirmOptions);
    }

	/**
	* @method confirmDeleteItem
	* @description confirm delete item
	*/
    confirmDeleteItem = (ID) => {
        this.props.deleteClient(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_CLIENT_SUCCESS);
                this.getTableListData(null, null)
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
        // this.props.activeInactiveVendorStatus(data, res => {
        //     if (res && res.data && res.data.Result) {
        //         if (cell == true) {
        //             toastr.success(MESSAGES.VENDOR_INACTIVE_SUCCESSFULLY)
        //         } else {
        //             toastr.success(MESSAGES.VENDOR_ACTIVE_SUCCESSFULLY)
        //         }
        //         this.getTableListData(null, null)
        //     }
        // })
    }

    /**
    * @method handlePlant
    * @description called
    */
    handlePlant = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ plant: newValue });
        } else {
            this.setState({ plant: [] })
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

    renderSerialNumber = () => {
        return <>Sr. <br />No. </>
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
        // const { costingHead, year, month, vendorName, plant } = this.state;
        // const costingHeadTemp = costingHead ? costingHead.value : null;
        // const yearTemp = year ? year.value : null;
        // const monthTemp = month ? month.value : null;
        // const vendorNameTemp = vendorName ? vendorName.value : null;
        // const plantTemp = plant ? plant.value : null;
        // this.getTableListData(costingHeadTemp, yearTemp)
    }

	/**
	* @method resetFilter
	* @description Reset user filter
	*/
    resetFilter = () => {
        this.setState({
            costingHead: [],
            year: [],
            month: [],
            vendorName: [],
            plant: [],
        }, () => {
            this.getTableListData(null, null)
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
                        <Col md="10" className="filter-block">
                            {/* <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    <Field
                                        name="year"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Select-'}
                                        options={this.renderListing('year')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.year == null || this.state.year.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleYear}
                                        valueDescription={this.state.year}
                                    //disabled={isEditFlag ? true : false}
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
                            </div> */}
                        </Col>
                        <Col md="2" className="search-user-block">
                            <div className="d-flex justify-content-end bd-highlight">
                                <div>
                                    {!this.props.isShowForm &&
                                        <button
                                            type="button"
                                            className={'user-btn'}
                                            onClick={this.formToggle}>
                                            <div className={'plus'}></div>ADD</button>
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
                    <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="ClientName" dataAlign="center" >{'Client Name'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="ClientEmailId" dataAlign="center" >{'Email Id'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="PhoneNumber" dataAlign="center" >{'Phone Number'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="MobileNumber" dataAlign="center" >{'Mobile No.'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="Country" dataAlign="center" >{'Country'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="State" dataAlign="center" >{'State'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="City" dataAlign="center" >{'City'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="ZipCode" dataAlign="center" >{'ZipCode'}</TableHeaderColumn>
                    <TableHeaderColumn className="action" dataField="VolumeId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
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
function mapStateToProps({ comman }) {
    const { loading, } = comman;

    return { loading, };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getClientDataList,
    deleteClient,
})(reduxForm({
    form: 'ClientListing',
    onSubmitFail: errors => {
        //console.log('Register errors', errors)
        focusOnError(errors);
    },
    enableReinitialize: true,
})(ClientListing));
