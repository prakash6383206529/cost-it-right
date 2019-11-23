import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddBOM from './AddBOM';
import { getAllBOMAPI, deleteBOMAPI } from '../../../../actions/master/BillOfMaterial';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';

class BOMMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            BOMId: ''
        }
    }

    /**
     * @method componentDidMount
     * @description  Called before rendering the component
     */
    componentDidMount() {
        this.props.getAllBOMAPI(res => { });
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
    * @method editItem
    * @description confirm delete item
    */
    editItem = (index, Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            BOMId: Id,
            editIndex: index,
        })
    }

    /**
        * @method deleteItem
        * @description confirm delete item
        */
    deleteItem = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeletePart(index, Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`Are you sure you want to delete This BOM ?`, toastrConfirmOptions);
    }

    /**
        * @method confirmDeleteBOM
        * @description confirm delete BOM
        */
    confirmDeletePart = (index, BomId) => {
        this.props.deleteBOMAPI(BomId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.BOM_DELETE_SUCCESS);
                this.props.getAllBOMAPI(res => { });
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
        const { isOpen } = this.state;
        return (
            <Container className="top-margin">
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.BOM} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.BOM} `}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.BOM} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`} </h5>
                    </Col>
                </Row>
                <Col>
                    <Table className="table table-striped" bordered>
                        {this.props.BOMListing && this.props.BOMListing.length > 0 &&
                            <thead>
                                <tr>
                                    <th>{`BOM Number`}</th>
                                    {/* <th>{`${CONSTANT.BOM} ${CONSTANT.CODE}`}</th> */}
                                    <th>{`${CONSTANT.PART} ${CONSTANT.NUMBER}`}</th>
                                    <th>{`Material Type Name`}</th>
                                    <th>{'Material Description'}</th>
                                    <th>{`${CONSTANT.QUANTITY}`}</th>
                                    <th>{`Assembly ${CONSTANT.PART} ${CONSTANT.NUMBER}`}</th>
                                    <th>{`BOM Level`}</th>
                                    <th>{`Eco Number`}</th>
                                    <th>{`Revision Number`}</th>
                                    <th>{`Action`}</th>
                                </tr>
                            </thead>}
                        <tbody >
                            {this.props.BOMListing && this.props.BOMListing.length > 0 &&
                                this.props.BOMListing.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td >{item.BillNumber}</td>
                                            {/* <td>{item.BillOfMaterialCode}</td> */}
                                            <td>{item.PartNumber ? item.PartNumber : 'N/A'}</td>
                                            <td>{item.MaterialTypeName}</td>
                                            <td>{item.MaterialDescription}</td>
                                            <td>{item.Quantity}</td>
                                            <td>{item.AssemblyPartNumberMark}</td>
                                            <td>{item.BOMLevel}</td>
                                            <td>{item.EcoNumber}</td>
                                            <td>{item.RevisionNumber}</td>
                                            <td>
                                                <Button className="btn btn-secondary" onClick={() => this.editItem(index, item.BillOfMaterialId)}><i className="fas fa-pencil-alt"></i></Button>
                                                <Button className="btn btn-danger" onClick={() => this.deleteItem(index, item.BillOfMaterialId)}><i className="far fa-trash-alt"></i></Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            {this.props.BOMListing === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                        </tbody>
                    </Table>
                </Col>
                {isOpen && (
                    <AddBOM
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                    />
                )}
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ billOfMaterial }) {
    const { BOMListing, loading } = billOfMaterial;;
    return { BOMListing, loading }
}


export default connect(
    mapStateToProps, {
    getAllBOMAPI,
    deleteBOMAPI
}
)(BOMMaster);

