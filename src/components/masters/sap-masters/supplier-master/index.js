import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Button, Table } from 'reactstrap';
import AddSupplier from './AddSupplier';
import { getSupplierDetailAPI, deleteSupplierAPI } from '../../../../actions/master/Supplier';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../helper';
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
        //this.props.getSupplierDetailAPI(res => { });
    }

    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({ isOpen: true, isEditFlag: false })
    }

    /**
    * @method closeDrawer
    * @description  used to cancel filter form
    */
    closeDrawer = (e = '') => {
        this.setState({ isOpen: false }, () => {
            //this.getSpecificationListData('', '');
        })
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
        return toastr.confirm(`Are you sure you want to delete this supplier?`, toastrConfirmOptions);
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
        data && data.map((el, i) => {
            return plants.push(el.PlantName)
        })
        return plants.join()
    }

    /**
    * @name onSubmit
    * @param values
    * @desc Submit the signup form values.
    * @returns {{}}
    */
    onSubmit = (values) => {
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, supplierId } = this.state;
        const { handleSubmit } = this.props;
        return (
            <Container>
                {/* {this.props.loading && <Loader/>} */}
                <form onSubmit={handleSubmit(this.onSubmit)} noValidate>
                    <Row>
                        <Col md="6">
                            <h3>{`Vendor`}</h3>
                        </Col>
                        <Col md="6">
                            <button
                                type={'button'}
                                className={'user-btn'}
                                onClick={this.openModel}>
                                <div className={'plus'}></div>{`ADD VENDOR`}</button>
                        </Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col md="2" className="mt25">
                            <h4>{`Filter By:`}</h4>
                        </Col>
                    </Row>
                </form>
                <hr />
                <Row>
                    <Col>
                        <Table className="table table-striped" size={'sm'} hover bordered>
                            {this.props.supplierDetail && this.props.supplierDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.CODE}`}</th>
                                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.EMAIL}`}</th>
                                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.DESCRIPTION}`}</th>
                                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.TYPE}`}</th>
                                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.CITY}`}</th>
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
                                                <td >{item.SupplierName}</td>
                                                <td>{item.SupplierCode}</td>
                                                <td>{item.SupplierEmail}</td>
                                                <td>{item.Description}</td>
                                                <td>{item.SupplierType}</td>
                                                <td>{item.CityName}</td>
                                                <td>{item.SupplierNameWithCode}</td>
                                                <td>{this.associatedPlantsHandler(item.AssociatedPlants)}</td>
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editDetails(item.SupplierId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteBOP(item.SupplierId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.supplierDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {isOpen && (
                    <AddSupplier
                        isOpen={isOpen}
                        closeDrawer={this.closeDrawer}
                        isEditFlag={isEditFlag}
                        ID={supplierId}
                        anchor={'right'}
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

export default connect(mapStateToProps, {
    getSupplierDetailAPI,
    deleteSupplierAPI
})(reduxForm({
    form: 'SupplierMaster',
    enableReinitialize: true,
})(SupplierMaster));