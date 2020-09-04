import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../../layout/FormInputs";
import { required } from "../../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { getAllReasonAPI, deleteReasonAPI, activeInactiveReasonStatus, } from '../../../../actions/master/ReasonMaster';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import AddReason from './AddReason';
import { REASON } from '../../../../config/constants';
import { checkPermission } from '../../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../../helper/auth';
import { getLeftMenu, } from '../../../../actions/auth/AuthActions';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class ReasonListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpenDrawer: false,
            ID: '',
            tableData: [],
            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
        }
    }

    componentDidMount() {
        let ModuleId = reactLocalStorage.get('ModuleId');
        this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
            const { leftMenuData } = this.props;
            if (leftMenuData != undefined) {
                let Data = leftMenuData;
                const accessData = Data && Data.find(el => el.PageName == REASON)
                const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

                if (permmisionData != undefined) {
                    this.setState({
                        ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                        AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                        EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                        DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    })
                }
            }
        })

        this.getTableListData()
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData()
    }

	/**
	* @method getTableListData
	* @description Get user list data
	*/
    getTableListData = () => {
        this.props.getAllReasonAPI(res => {
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
	* @method editItemDetails
	* @description confirm edit item
	*/
    editItemDetails = (Id) => {
        this.setState({ isEditFlag: true, isOpenDrawer: true, ID: Id })
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
        return toastr.confirm(MESSAGES.REASON_DELETE_ALERT, toastrConfirmOptions);
    }

	/**
	* @method confirmDeleteItem
	* @description confirm delete item
	*/
    confirmDeleteItem = (ID) => {
        this.props.deleteReasonAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_REASON_SUCCESSFULLY);
                this.getTableListData()
            }
        });
    }

	/**
	* @method buttonFormatter
	* @description Renders buttons
	*/
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        const { EditAccessibility } = this.state;
        return (
            <>
                {EditAccessibility && <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} />}
                {/* <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} /> */}
            </>
        )
    }

	/**
	* @method statusButtonFormatter
	* @description Renders buttons
	*/
    statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
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
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.ReasonId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the Reason.
        }
        this.props.activeInactiveReasonStatus(data, res => {
            if (res && res.data && res.data.Result) {
                // if (cell == true) {
                //     toastr.success(MESSAGES.REASON_INACTIVE_SUCCESSFULLY)
                // } else {
                //     toastr.success(MESSAGES.REASON_ACTIVE_SUCCESSFULLY)
                // }
                this.getTableListData()
            }
        })
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

    formToggle = () => {
        this.setState({ isOpenDrawer: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({
            isOpenDrawer: false,
            isEditFlag: false,
            ID: '',
        }, () => {
            this.getTableListData()
        })
    }

	/**
	* @method render
	* @description Renders the component
	*/
    render() {
        const { handleSubmit, pristine, submitting, } = this.props;
        const { isEditFlag, isOpenDrawer, AddAccessibility, } = this.state;
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
                <Col md="12" className="search-user-block">
                    <div class="col-sm-4"><h3>Reason</h3></div>
                    <hr />
                    <div className="d-flex justify-content-end bd-highlight w100 mb15">
                        <div>
                            {AddAccessibility && <button
                                type="button"
                                className={'user-btn'}
                                onClick={this.formToggle}>
                                <div className={'plus'}></div>ADD REASON</button>}
                        </div>
                    </div>
                </Col>
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
                    {/* <TableHeaderColumn dataField="Sr. No." width={'70'} csvHeader='Full-Name' dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn> */}
                    <TableHeaderColumn dataField="Reason" dataAlign="center" dataSort={true}>Reason</TableHeaderColumn>
                    <TableHeaderColumn dataField="IsActive" export={false} dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn>
                    <TableHeaderColumn className="action" dataField="ReasonId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                </BootstrapTable>
                {isOpenDrawer && <AddReason
                    isOpen={isOpenDrawer}
                    closeDrawer={this.closeVendorDrawer}
                    isEditFlag={isEditFlag}
                    ID={this.state.ID}
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
function mapStateToProps({ reason, auth }) {
    const { loading, } = reason;
    const { leftMenuData } = auth;
    return { loading, leftMenuData };
}


/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
    getAllReasonAPI,
    deleteReasonAPI,
    activeInactiveReasonStatus,
    getLeftMenu,
})(reduxForm({
    form: 'ReasonListing',
    onSubmitFail: errors => {
        //console.log('Register errors', errors)
        focusOnError(errors);
    },
    enableReinitialize: true,
})(ReasonListing));
