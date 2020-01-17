import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import { getAllLevelAPI, deleteUserLevelAPI } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';

class LevelsListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getAllLevelAPI(res => { });
    }

    /**
     * @method editItemDetails
     * @description confirm edit item
     */
    editItemDetails = (index, Id) => {
        let requestData = {
            isEditFlag: true,
            LevelId: Id,
        }
        this.props.getLevelDetail(requestData)
    }

    /**
    * @method deleteItem
    * @description confirm delete level
    */
    deleteItem = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.LEVEL_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete level item
    */
    confirmDeleteItem = (LevelId) => {
        this.props.deleteUserLevelAPI(LevelId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_LEVEL_SUCCESSFULLY);
                this.props.getAllLevelAPI(res => { });
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
                        <h3>{`List of Levels`}</h3>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Table className="table table-striped" bordered>
                            {this.props.levelList && this.props.levelList.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`Level`}</th>
                                        <th>{`Description`}</th>
                                        <th>{'Sequence'}</th>
                                        <th>{''}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.levelList && this.props.levelList.length > 0 &&
                                    this.props.levelList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.LevelName}</td>
                                                <td>{item.Description}</td>
                                                <td>{item.Sequence}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editItemDetails(index, item.LevelId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(index, item.LevelId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.levelList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
    const { levelList, loading } = auth;

    return { levelList, loading };
}


export default connect(mapStateToProps,
    {
        getAllLevelAPI,
        deleteUserLevelAPI,
    })(LevelsListing);

