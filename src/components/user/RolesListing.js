import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import { getAllRoleAPI } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';

class RolesListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            RoleId: '',
        }
    }

    componentDidMount() {
        this.props.getAllRoleAPI(res => { });
    }

    /**
    * @method editItemDetails
    * @description confirm edit item
    */
    editItemDetails = (index, Id) => {
        let requestData = {
            isEditFlag: true,
            RoleId: Id,
        }
        this.props.getRoleDetail(requestData)
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
                <Col>
                    <Table className="table table-striped" bordered>
                        {this.props.roleList && this.props.roleList.length > 0 &&
                            <thead>
                                <tr>
                                    <th>{`Role`}</th>
                                    <th>{`Sequence`}</th>
                                    <th>{''}</th>
                                </tr>
                            </thead>}
                        <tbody >
                            {this.props.roleList && this.props.roleList.length > 0 &&
                                this.props.roleList.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td >{item.RoleName}</td>
                                            <td>{item.Description}</td>
                                            <td>
                                                <Button className="btn btn-secondary" onClick={() => this.editItemDetails(index, item.RoleId)}><i className="fas fa-pencil-alt"></i></Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            {this.props.roleList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                        </tbody>
                    </Table>
                </Col>
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
    const { roleList, loading } = auth;

    return { roleList, loading };
}


export default connect(mapStateToProps,
    {
        getAllRoleAPI,
    })(RolesListing);

