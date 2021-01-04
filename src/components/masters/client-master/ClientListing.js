import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, } from "../../layout/FormInputs";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { getClientDataList, deleteClient } from '../actions/Client';
import AddClientDrawer from './AddClientDrawer';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { CLIENT } from '../../../config/constants';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class ClientListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpenVendor: false,
            tableData: [],
            ID: '',

            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
        }
    }

    componentDidMount() {
        this.getTableListData(null, null)

        let ModuleId = reactLocalStorage.get('ModuleId');
        this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
            const { leftMenuData } = this.props;
            if (leftMenuData !== undefined) {
                let Data = leftMenuData;
                const accessData = Data && Data.find(el => el.PageName === CLIENT)
                const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

                if (permmisionData !== undefined) {
                    this.setState({
                        AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                        EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                        DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    })
                }
            }
        })
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
        const { EditAccessibility, DeleteAccessibility } = this.state;
        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cell)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    /**
    * @method handlePlant
    * @description called
    */
    handlePlant = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ plant: newValue });
        } else {
            this.setState({ plant: [] })
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

    renderSerialNumber = () => {
        return <>Sr. <br />No. </>
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
    * @description Filter DATALIST
    */
    filterList = () => {
        this.getTableListData(null, null)
    }

    /**
    * @method resetFilter
    * @description RESET FILTERS
    */
    resetFilter = () => {
        this.getTableListData(null, null)
    }

    formToggle = () => {
        this.setState({ isOpenVendor: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({
            isOpenVendor: false,
            isEditFlag: false,
            ID: '',
        }, () => {
            this.getTableListData(null, null)
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
        const { isOpenVendor, isEditFlag, AddAccessibility, } = this.state;
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
                    <div class="col-sm-4"><h3>Client</h3></div>
                    <hr />
                    <Row className="pt-30">
                        <Col md="10" className="filter-block">
                        </Col>
                        <Col md="2" className="search-user-block">
                            <div className="d-flex justify-content-end bd-highlight">
                                {AddAccessibility && <button
                                    type="button"
                                    className={'user-btn'}
                                    onClick={this.formToggle}>
                                    <div className={'plus'}></div>ADD</button>}
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
                    tableHeaderClass='my-custom-header client-table'
                    className={'client-table'}
                    pagination>
                    <TableHeaderColumn dataField="CompanyName" dataAlign="center" >{'Company'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="ClientName" dataAlign="center" >{'Client Name'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="ClientEmailId" dataAlign="center" >{'Email Id'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="CountryName" dataAlign="center" >{'Country'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="StateName" dataAlign="center" >{'State'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="CityName" dataAlign="center" >{'City'}</TableHeaderColumn>
                    <TableHeaderColumn className="action" dataField="ClientId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                </BootstrapTable>
                {isOpenVendor && <AddClientDrawer
                    isOpen={isOpenVendor}
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
function mapStateToProps({ comman, auth }) {
    const { loading, } = comman;
    const { leftMenuData } = auth;
    return { loading, leftMenuData, };
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
    getLeftMenu,
})(reduxForm({
    form: 'ClientListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(ClientListing));
