import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Table, Button } from 'reactstrap';
import { getRowMaterialDataAPI, deleteRawMaterialAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { MESSAGES } from '../../../../../config/message';
import { toastr } from 'react-redux-toastr';

class RMDetail extends Component {
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
    * @description edit Raw Material
    */
    editItemDetails = (Id) => {
        this.props.editRawMaterialHandler(Id);
    }

    /**
    * @method deleteItem
    * @description confirm delete Raw Material
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.MATERIAL_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material
    */
    confirmDelete = (ID) => {
        this.props.deleteRawMaterialAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_MATERIAL_SUCCESS);
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
                            {this.props.rowMaterialDetail && this.props.rowMaterialDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`Raw Material Name`}</th>
                                        <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.DESCRIPTION}`}</th>
                                        <th>{`${CONSTANT.DATE}`}</th>
                                        <th>{``}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.rowMaterialDetail && this.props.rowMaterialDetail.length > 0 &&
                                    this.props.rowMaterialDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.RawMaterialName}</td>
                                                <td>{item.PlantName}</td>
                                                <td>{item.Description}</td>
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                <td>
                                                    <Button className="black-btn" onClick={() => this.editItemDetails(item.RawMaterialId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deleteItem(item.RawMaterialId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.rowMaterialDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
    const { rowMaterialDetail } = material;
    return { rowMaterialDetail }
}


export default connect(
    mapStateToProps, {
    getRowMaterialDataAPI,
    deleteRawMaterialAPI,
}
)(RMDetail);

