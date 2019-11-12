import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input, Table } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText, renderNumberInputField, renderSelectField } from "../../layout/FormInputs";
import { getRawMaterialListBySupplierId, addCostingRawMaterial } from '../../../actions/costing/CostWorking';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message'
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';

class AddRawMaterialCosting extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentDidMount() {
        const { supplierId } = this.props;
        this.props.getRawMaterialListBySupplierId(supplierId, res => { });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
   * @method onSubmit
   * @description Used to Submit the form
   */
    onSubmit = (values) => {
        console.log('value', values);

        /** Update detail of the existing UOM  */
        // if (this.props.isEditFlag) {
        //     const { uomId } = this.props;
        //     this.setState({ isSubmitted: true });
        //     let formData = {
        //         Name: values.Name,
        //         Title: values.Title,
        //         Description: values.Description,
        //         Id: uomId,
        //         IsActive: true,
        //     }
        //     this.props.updateUnitOfMeasurementAPI(uomId, formData, (res) => {
        //         if (res.data.Result) {
        //             toastr.success(MESSAGES.UPDATE_UOM_SUCESS);
        //             this.toggleModel();
        //             this.props.getUnitOfMeasurementAPI(res => { });
        //         } else {
        //             toastr.error(MESSAGES.SOME_ERROR);
        //         }
        //     });
        // } else {
        //      /** Add detail for creating new UOM  */
        //     this.props.createWeightCalculationCosting(values, (res) => {
        //         if (res.data.Result === true) {
        //             toastr.success(MESSAGES.UOM_ADD_SUCCESS);
        //             this.toggleModel();
        //             this.props.getUnitOfMeasurementAPI(res => { });
        //         } else {
        //             toastr.error(res.data.message);
        //         }
        //     });
        // }
    }

    rawMaterialHandler = (item) => {
        const requestData = {
            CostingId: this.props.costingId,
            RawMaterialDetailId: item.RawMaterialDetailsId,
            RawMaterialName: item.RawMaterialName,
            GrandTotal: item.BasicRate * item.Quantity,
            RawMaterialRate: item.BasicRate,
            RawMaterialScrapRate: item.ScrapRate,
            CreatedBy: ""
        }
        this.props.addCostingRawMaterial(requestData, res => {
            //this.toggleModel()
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset, rmListData } = this.props;
        const { weightType } = this.state;

        return (
            <Container>
                <Modal size={'xl'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Raw Material Costing' : 'Raw Material Costing'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <div className={'create-costing-grid'}>
                                <Table className="table table-striped" bordered>
                                    <thead>
                                        <tr>
                                            <th>{`RM`}</th>
                                            <th>{`UOM`}</th>
                                            <th>{`RM Grade`}</th>
                                            <th>{`RM Specification`}</th>
                                            <th>{`Category`}</th>
                                            <th>{`RM Source`}</th>
                                            <th>{`RM Source Location`}</th>
                                            <th>{`Destination Supplier`}</th>
                                            <th>{`Destination Supplier Location`}</th>
                                            <th>{`Basic Rate`}</th>
                                            <th>{`RM Type`}</th>
                                            <th>{`Net Landed Cost`}</th>
                                            <th>{`Scrap Rate`}</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {rmListData && rmListData.map((item, index) => {
                                            const { RawMaterialDetailsId } = item;
                                            return (
                                                <tr index={index} >
                                                    <td><div onClick={() => this.rawMaterialHandler(item)}>{item.RawMaterialName}</div></td>
                                                    <td>{item.UnitOfMeasurementName}</td>
                                                    <td>{item.GradeName}</td>
                                                    <td>{item.SpecificationName}</td>
                                                    <td>{item.CategoryName}</td>
                                                    <td>{item.SourceSupplierName}</td>
                                                    <td>{item.SourceSupplierLocation}</td>
                                                    <td>{item.DestinationSupplierName}</td>
                                                    <td>{item.DestinationSupplierLocation}</td>
                                                    <td>{item.BasicRate}</td>
                                                    <td>{'Domestic'}</td>
                                                    <td>{item.NetLandedCost}</td>
                                                    <td>{item.ScrapRate}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                    {this.props.rmListData === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                </Table>
                            </div>
                        </Row>
                    </ModalBody>
                </Modal>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ costWorking, state }) {
    const { rmListData } = costWorking;

    return { rmListData };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getRawMaterialListBySupplierId,
    addCostingRawMaterial
})(reduxForm({
    form: 'AddRawMaterialCosting',
    enableReinitialize: true,
})(AddRawMaterialCosting));
