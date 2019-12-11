import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddSupplier from './AddSupplier';
import { getSupplierDetailAPI, deleteSupplierAPI } from '../../../../actions/master/Supplier';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import NoContentFound from '../../../common/NoContentFound';

class SupplierMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getSupplierDetailAPI(res => { });
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
        this.setState({ isOpen: false }, () => {
            this.props.getSupplierDetailAPI(res => { });
        });
    }

    /**
    * @method editDetails
    * @description confirm delete bop
    */
    editDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            supplierId: Id,
        })
    }

    /**
    * @method delete 
    * @description confirm delete bop
    */
    deleteBOP = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE} this supplier ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete bought out part
    */
    confirmDelete = (Id) => {
        this.props.deleteSupplierAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_SUPPLIER_SUCCESS);
                this.props.getSupplierDetailAPI(res => { });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        });
    }

    /**
    * @method associatedPlantsHandler
    * @description Associated plant with supplier
    */
    associatedPlantsHandler = (data) => {
        let plants = []
        data.map((el, i) => {
            return plants.push(el.PlantName)
        })
        return plants.join()
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, supplierId } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.SUPPLIER} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.SUPPLIER} `}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.SUPPLIER} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                    <Table className="table table-striped" bordered>
                        {this.props.supplierDetail && this.props.supplierDetail.length > 0 &&
                            <thead>
                                <tr>
                                    <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.CODE}`}</th>
                                    <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}</th>
                                    <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.EMAIL}`}</th>
                                    <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.TYPE}`}</th>
                                    <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.CITY}`}</th>
                                    <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.DESCRIPTION}`}</th>
                                    <th>{`${CONSTANT.SUPPLIER} name with code`}</th>
                                    <th>{`Associated Plants`}</th>
                                    <th>{`${CONSTANT.DATE}`}</th>
                                    <th></th>
                                </tr>
                            </thead>}
                        <tbody >
                            {this.props.supplierDetail && this.props.supplierDetail.length > 0 &&
                                this.props.supplierDetail.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{item.SupplierCode}</td>
                                            <td >{item.SupplierName}</td>
                                            <td>{item.SupplierEmail}</td>
                                            <td>{item.SupplierType}</td>
                                            <td>{item.CityName}</td>
                                            <td>{item.Description}</td>
                                            <td>{item.SupplierNameWithCode}</td>
                                            <td>{this.associatedPlantsHandler(item.AssociatedPlants)}</td>
                                            <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                            <div>
                                                <Button className="btn btn-secondary" onClick={() => this.editDetails(item.SupplierId)}><i className="fas fa-pencil-alt"></i></Button>
                                                <Button className="btn btn-danger" onClick={() => this.deleteBOP(item.SupplierId)}><i className="far fa-trash-alt"></i></Button>
                                            </div>
                                        </tr>
                                    )
                                })}
                            {this.props.supplierDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                        </tbody>
                    </Table>
                </Col>
                {isOpen && (
                    <AddSupplier
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        supplierId={supplierId}
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
function mapStateToProps({ supplier }) {
    const { supplierDetail, loading } = supplier;
    return { supplierDetail, loading }
}

export default connect(
    mapStateToProps, { getSupplierDetailAPI, deleteSupplierAPI }
)(SupplierMaster);

