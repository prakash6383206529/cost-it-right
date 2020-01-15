import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import { getAllDepartmentAPI } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';

class DepartmentsListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getAllDepartmentAPI(res => { });
    }

    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({ isOpen: true, isEditFlag: false })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({ isOpen: false })
    }

    /**
    * @method editPartDetails
    * @description confirm delete part
    */
    editPartDetails = (index, Id) => {
        console.log('Id: ', Id);
        this.setState({
            isEditFlag: true,
            isOpen: true,
            PartId: Id,
        })
    }

    /**
    * @method deletePart
    * @description confirm delete part
    */
    deletePart = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeletePart(index, Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`Are you sure you want to delete This part ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeletePart
    * @description confirm delete part
    */
    confirmDeletePart = (index, PartId) => {
        this.props.deletePartsAPI(PartId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.PART_DELETE_SUCCESS);
                this.props.getAllPartsAPI(res => { });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
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
                        <h3>{`List of Departments`}</h3>
                    </Col>
                </Row>
                <hr />
                <Col>
                    <Table className="table table-striped" bordered>
                        {this.props.departmentList && this.props.departmentList.length > 0 &&
                            <thead>
                                <tr>
                                    <th>{`Department`}</th>
                                    <th>{`Description`}</th>
                                    <th>{''}</th>
                                </tr>
                            </thead>}
                        <tbody >
                            {this.props.departmentList && this.props.departmentList.length > 0 &&
                                this.props.departmentList.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td >{item.DepartmentName}</td>
                                            <td>{item.Description}</td>
                                            <div>
                                                <Button className="btn btn-secondary" onClick={() => this.editPartDetails(index, item.DepartmentId)}><i className="fas fa-pencil-alt"></i></Button>
                                                <Button className="btn btn-danger" onClick={() => this.deletePart(index, item.DepartmentId)}><i className="far fa-trash-alt"></i></Button>
                                            </div>
                                        </tr>
                                    )
                                })}
                            {this.props.departmentList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
    const { departmentList, loading } = auth;

    return { departmentList, loading };
}


export default connect(mapStateToProps,
    {
        getAllDepartmentAPI
    })(DepartmentsListing);

