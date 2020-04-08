import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import { getAllDepartmentAPI, deleteDepartmentAPI } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class DepartmentsListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
        }
    }

    componentDidMount() {
        this.getDepartmentListData();
        this.props.onRef(this)
    }

    getDepartmentListData = () => {
        this.props.getAllDepartmentAPI(res => {
            if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    tableData: Data,
                })
            }
        });
    }

    /**
    * @method getUpdatedData
    * @description get updated data after updatesuccess
    */
    getUpdatedData = () => {
        this.getDepartmentListData()
    }

    /**
    * @method editItemDetails
    * @description confirm edit item
    */
    editItemDetails = (Id) => {
        let requestData = {
            isEditFlag: true,
            DepartmentId: Id,
        }
        this.props.getDepartmentDetail(requestData)
    }

    /**
    * @method deleteItem
    * @description confirm delete Department
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.DEPARTMENT_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete Department item
    */
    confirmDeleteItem = (DepartmentId) => {
        this.props.deleteDepartmentAPI(DepartmentId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_DEPARTMENT_SUCCESSFULLY);
                this.getDepartmentListData();
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

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, editIndex, PartId } = this.state;
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        };
        return (
            <>
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`List of Departments`}</h3>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.state.tableData}
                            striped={true}
                            hover={true}
                            options={options}
                            search
                            ignoreSinglePage
                            pagination>
                            <TableHeaderColumn dataField="DepartmentName" isKey={true} dataAlign="center" dataSort={true}>Department</TableHeaderColumn>
                            <TableHeaderColumn dataField="DepartmentId" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </Col>
                </Row>
                {/* <Row>
                    <Col>
                        <Table className="table table-striped" bordered>
                            {this.props.departmentList && this.props.departmentList.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`Department`}</th>
                                        <th>{''}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.departmentList && this.props.departmentList.length > 0 &&
                                    this.props.departmentList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.DepartmentName}</td>
                                                <div>
                                                    <Button className="btn btn-secondary" onClick={() => this.editItemDetails(index, item.DepartmentId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(index, item.DepartmentId)}><i className="far fa-trash-alt"></i></Button>
                                                </div>
                                            </tr>
                                        )
                                    })}
                                {this.props.departmentList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
    const { departmentList, loading } = auth;

    return { departmentList, loading };
}


export default connect(mapStateToProps,
    {
        getAllDepartmentAPI,
        deleteDepartmentAPI,

    })(DepartmentsListing);

