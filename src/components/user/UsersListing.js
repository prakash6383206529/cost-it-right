import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import {
    getAllUserDataAPI, deleteUser, getAllDepartmentAPI,
    getAllRoleAPI, activeInactiveUser,
} from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import { loggedInUserId } from '../../helper/auth';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class UsersListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            RoleId: '',
            userData: [],
            departmentType: {},
            roleType: {},
        }
    }

    componentDidMount() {
        this.getUsersListData();

        // Get department listing
        this.props.getAllDepartmentAPI((res) => {
            if (res && res.data && res.data.DataList) {
                const { departmentType } = this.state;
                let Data = res.data.DataList;
                let obj = {}
                Data && Data.map((el, i) => {
                    obj[el.DepartmentId] = el.DepartmentName
                })
                this.setState({
                    departmentType: obj,
                })
            }
        })

        // Get roles listing
        this.props.getAllRoleAPI((res) => {
            if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                let obj = {}
                Data && Data.map((el, i) => {
                    obj[el.RoleId] = el.RoleName
                })
                this.setState({
                    roleType: obj,
                })
            }
        })
        this.props.onRef(this)
    }

    // Get updated user list after any action performed.
    getUpdatedData = () => {
        this.getUsersListData()
    }

    /**
    * @method getUsersListData
    * @description Get user list data
    */
    getUsersListData = () => {
        let data = {
            Id: '',
            PageSize: 0,
            LastIndex: 0,
            Expression: {}
        }
        this.props.getAllUserDataAPI(data, res => {
            if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    userData: Data,
                })
            }
        });
    }

    /**
    * @method editItemDetails
    * @description confirm edit item
    */
    editItemDetails = (Id) => {
        let requestData = {
            isEditFlag: true,
            UserId: Id,
        }
        this.props.getUserDetail(requestData)
    }

    /**
    * @method deleteItem
    * @description confirm delete part
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.USER_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete user item
    */
    confirmDeleteItem = (UserId) => {
        this.props.deleteUser(UserId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_USER_SUCCESSFULLY);
                this.getUsersListData();
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
                <Button className="btn btn-secondary" onClick={() => this.editItemDetails(cell)}><i className="fas fa-pencil-alt"></i></Button>
                {/* <Button className="btn btn-danger" onClick={() => this.deleteItem(cell)}><i className="far fa-trash-alt"></i></Button> */}
            </>
        )
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.UserId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        this.props.activeInactiveUser(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell == true) {
                    toastr.success(MESSAGES.USER_INACTIVE_SUCCESSFULLY)
                } else {
                    toastr.success(MESSAGES.USER_ACTIVE_SUCCESSFULLY)
                }
                this.getUsersListData()
            }
        })
    }

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
                        id="normal-switch"
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
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, editIndex, PartId, departmentType, roleType } = this.state;
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            exportCSVText: 'Download Excel',
            onExportToCSV: this.onExportToCSV,
            //paginationShowsTotal: true,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 2,
        };

        return (
            <>
                {/* {this.props.loading && <Loader />} */}
                <Row>
                    <Col>
                        <h3>{`List of Users`}</h3>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.state.userData}
                            striped={true}
                            hover={true}
                            options={options}
                            search
                            exportCSV
                            ignoreSinglePage
                            ref={'table'}
                            pagination>
                            <TableHeaderColumn dataField="" csvHeader='Full-Name' dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn>
                            <TableHeaderColumn dataField="FullName" csvHeader='Full-Name' dataAlign="center" dataSort={true}>Name</TableHeaderColumn>
                            <TableHeaderColumn dataField="UserName" dataSort={true}>User name</TableHeaderColumn>
                            <TableHeaderColumn dataField="Email" dataSort={true}>Email Id</TableHeaderColumn>
                            <TableHeaderColumn dataField="Mobile" dataSort={false}>Mobile No</TableHeaderColumn>
                            <TableHeaderColumn dataField="PhoneNumber" dataSort={false}>Phone Number</TableHeaderColumn>

                            <TableHeaderColumn dataField='DepartmentName' export hidden>Product Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='DepartmentId' export={false} filterFormatted dataFormat={enumFormatter} formatExtraData={departmentType}
                                filter={{ type: 'SelectFilter', options: departmentType }}>Department</TableHeaderColumn>
                            <TableHeaderColumn dataField='RoleName' export hidden>Role Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='RoleId' export={false} filterFormatted dataFormat={enumFormatter} formatExtraData={roleType}
                                filter={{ type: 'SelectFilter', options: roleType }}>Role</TableHeaderColumn>
                            <TableHeaderColumn dataField="IsActive" export={false} dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn>
                            <TableHeaderColumn dataField="UserId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

                        </BootstrapTable>
                    </Col>
                </Row>
                {/* <Row>
                    <Col>
                        <Table className="table table-striped" size="sm" hover bordered>
                            {this.props.userDataList && this.props.userDataList.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`Name`}</th>
                                        <th>{`Username`}</th>
                                        <th>{`Role`}</th>
                                        <th>{`Department`}</th>
                                        <th>{`Level`}</th>
                                        <th>{''}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.userDataList && this.props.userDataList.length > 0 &&
                                    this.props.userDataList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.FullName}</td>
                                                <td >{item.UserName}</td>
                                                <td >{item.RoleName}</td>
                                                <td>{item.DepartmentName}</td>
                                                <td>{item.LevelName}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editItemDetails(item.UserId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(item.UserId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.userDataList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row> */}
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
    const { userDataList, loading } = auth;

    return { userDataList, loading };
}

export default connect(mapStateToProps,
    {
        getAllUserDataAPI,
        deleteUser,
        getAllDepartmentAPI,
        getAllRoleAPI,
        activeInactiveUser,
    })(UsersListing);

