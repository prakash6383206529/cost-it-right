import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input, Table } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText, renderNumberInputField, renderSelectField } from "../../layout/FormInputs";
import { getBoughtOutPartList, addCostingBoughtOutPart, getCostingDetailsById } from '../../../actions/costing/CostWorking';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message'
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';

class AddBOPCosting extends Component {
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
        const { supplierId, costingId } = this.props;
        this.props.getBoughtOutPartList(supplierId, res => { });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    bopHandler = (item) => {
        const { isRMEditFlag, costingId, PartId, PartNumber } = this.props;
        const requestData = {
            CostingId: costingId,
            BoughtOutPartId: item.BoughtOutPartId,
            GrandTotal: item.BasicRate * item.Quantity,
            BoughtOutParRate: item.BasicRate,
            AssyBoughtOutParRate: item.BasicRate,
            PartId: PartId,
            PartNumber: PartNumber,
            CreatedBy: ""
        }

        this.props.addCostingBoughtOutPart(requestData, res => {
            this.props.getCostingDetailsById(costingId, true, res => {
                // this.setState({
                //     isCollapes: true,
                //     isEditFlag: true,
                //     isNewCostingFlag: false
                // })
                this.toggleModel()
            })
        })
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { bopListData } = this.props;

        return (
            <Container>
                <Modal size={'xl'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{'BOP Costing'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <div className={'create-costing-grid'}>
                                <Table className="table table-striped" bordered>
                                    <thead>
                                        <tr>
                                            <th>{`Supplier Part No.`}</th>
                                            <th>{`Category`}</th>
                                            <th>{`Specification`}</th>
                                            <th>{`Material`}</th>
                                            <th>{`Source`}</th>
                                            <th>{`RM Source Location`}</th>
                                            <th>{`Supplier Destination`}</th>
                                            <th>{`Basic Rate`}</th>
                                            <th>{`Net Landed Cost`}</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {bopListData && bopListData.map((item, index) => {
                                            return (
                                                <tr row={index} >
                                                    <td><div onClick={() => this.bopHandler(item)}>{item && item.PartNumber ? item.PartNumber : 'N/A'}</div></td>
                                                    <td>{item.CategoryName}</td>
                                                    <td>{item.Specification}</td>
                                                    <td>{item.MaterialTypeName}</td>
                                                    <td>{item.SourceSupplierName}</td>
                                                    <td>{item.SourceSupplierLocation}</td>
                                                    <td>{item.DestinationSupplierLocation}</td>
                                                    <td>{item.BasicRate}</td>
                                                    <td>{item.NetLandedCost}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                    {this.props.bopListData === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
    const { bopListData } = costWorking;

    return { bopListData };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getBoughtOutPartList,
    addCostingBoughtOutPart,
    getCostingDetailsById
})(reduxForm({
    form: 'AddBOPCosting',
    enableReinitialize: true,
})(AddBOPCosting));
