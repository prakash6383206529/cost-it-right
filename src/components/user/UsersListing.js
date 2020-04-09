import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import {
    getAllUserDataAPI, deleteUser, getAllDepartmentAPI,
    getAllRoleAPI
} from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

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

    getUpdatedData = () => {
        this.getUsersListData()
    }

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
                <Button className="btn btn-danger" onClick={() => this.deleteItem(cell)}><i className="far fa-trash-alt"></i></Button>
            </>
        )
    }

    onExportToCSV = (row) => {
        console.log('row', row)
        // ...
        return this.state.userData; // must return the data which you want to be exported
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
                            pagination>
                            <TableHeaderColumn dataField="FullName" csvHeader='Full-Name' isKey={true} dataAlign="center" dataSort={true}>Name</TableHeaderColumn>
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
                            <TableHeaderColumn dataField="UserId" export={false} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

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
    })(UsersListing);

