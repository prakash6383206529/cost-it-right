import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input, Table } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText, renderNumberInputField, renderSelectField } from "../../layout/FormInputs";
import { getMHRCostingList, addMHRForProcess, getCostingDetailsById } from '../../../actions/costing/CostWorking';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message'
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';

class AddMHRCosting extends Component {
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
        this.props.getMHRCostingList(supplierId, res => { });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    addMHRHandler = (item) => {
        const { costingId, supplierId } = this.props;
        this.props.setRowData(item)
        this.toggleModel()
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { getMHRCostingListData } = this.props;

        return (
            <Container>
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{'MHR Details'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <div className={'create-costing-grid'}>
                                <Table className="table table-striped" bordered>
                                    <thead>
                                        <tr>
                                            <th>{``}</th>
                                            <th>{`Technology`}</th>
                                            <th>{`Supplier Code`}</th>
                                            <th>{`Supplier Name`}</th>
                                            <th>{`Machine No.`}</th>
                                            <th>{`Description`}</th>
                                            <th>{`Machine Capacity`}</th>
                                            <th>{`Machine Rate`}</th>
                                            <th>{`UOM`}</th>
                                            <th>{`Initiator`}</th>
                                            <th>{`Created On`}</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {getMHRCostingListData && getMHRCostingListData.map((item, index) => {
                                            return (
                                                <tr row={index} >
                                                    <td><div onClick={() => this.addMHRHandler(item)}>{'Add'}</div></td>
                                                    <td>{item.TechnologyName}</td>
                                                    <td>{'N/A'}</td> { /** TODO Supplier code need to add */}
                                                    <td>{item.SupplierName}</td>
                                                    <td>{item.MachineNumber}</td>
                                                    <td>{item.Description}</td>
                                                    <td>{item.MachineTonnage}</td>
                                                    <td>{item.BasicMachineRate}</td>
                                                    <td>{item.UnitOfMeasurementName}</td>
                                                    <td>{item.CreatedBy}</td>
                                                    <td>{item.CreatedDate}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                    {this.props.getMHRCostingListData === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
    const { getMHRCostingListData } = costWorking;

    return { getMHRCostingListData };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getMHRCostingList,
    addMHRForProcess,
    getCostingDetailsById
})(reduxForm({
    form: 'AddMHRCosting',
    enableReinitialize: true,
})(AddMHRCosting));
