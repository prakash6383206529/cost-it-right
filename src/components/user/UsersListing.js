import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import { getAllUserDataAPI, deleteUser } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';

class UsersListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            RoleId: '',
        }
    }

    componentDidMount() {
        let data = {
            Id: '',
            PageSize: 0,
            LastIndex: 0,
            Expression: {}
        }
        this.props.getAllUserDataAPI(data, res => { });
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
                let data = {
                    Id: '',
                    PageSize: 0,
                    LastIndex: 0,
                    Expression: {}
                }
                this.props.getAllUserDataAPI(data, res => { });
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, editIndex, PartId } = this.state;
        return (
            <Container className="listing">
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`List of Roles`}</h3>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Table className="table table-striped" size="sm" bordered>
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
                </Row>
            </Container >
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
    })(UsersListing);

