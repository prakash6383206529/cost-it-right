import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Table, Button } from 'reactstrap';
import { getRowMaterialDataAPI, deleteRMSpecificationAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { MESSAGES } from '../../../../../config/message';
import { toastr } from 'react-redux-toastr';

class RMSpecificationDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
    componentDidMount() {
        this.props.getRowMaterialDataAPI(res => { });
    }

    /**
    * @method editItemDetails
    * @description edit RM Specification
    */
    editItemDetails = (Id) => {
        this.props.editRMSpecificationHandler(Id);
    }

    /**
    * @method deleteItem
    * @description confirm delete RM Specification
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.SPECIFICATION_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete RM Specification
    */
    confirmDelete = (ID) => {
        this.props.deleteRMSpecificationAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_SPECIFICATION_SUCCESS);
                this.props.getRowMaterialDataAPI(res => { });
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <div>
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        {/* <hr /> */}
                        <Table className="table table-striped" size={'sm'} hover bordered>
                            {this.props.rmSpecificationDetail && this.props.rmSpecificationDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.GRADE}`}</th>
                                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.SPECIFICATION}`}</th>
                                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.DESCRIPTION}`}</th>
                                        <th>{`${CONSTANT.DATE}`}</th>
                                        <th>{``}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.rmSpecificationDetail && this.props.rmSpecificationDetail.length > 0 &&
                                    this.props.rmSpecificationDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{item.GradeName}</td>
                                                <td >{item.Specification}</td>
                                                <td>{item.Description}</td>
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                <td>
                                                    <Button className="black-btn" onClick={() => this.editItemDetails(item.SpecificationId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deleteItem(item.SpecificationId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.rmSpecificationDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material }) {
    const { rmSpecificationDetail } = material;
    return { rmSpecificationDetail }
}

export default connect(
    mapStateToProps, {
    getRowMaterialDataAPI,
    deleteRMSpecificationAPI,
}
)(RMSpecificationDetail);

