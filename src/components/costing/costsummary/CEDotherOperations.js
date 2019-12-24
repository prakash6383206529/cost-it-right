import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input, Table } from 'reactstrap';
import { getCEDOtherOperationBySupplierID } from '../../../actions/master/OtherOperation';
import { setRowDataCEDOtherOps } from '../../../actions/costing/costing';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';


class CEDotherOperations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        console.log("dfsdfsdfsdfsdf");
        const { supplierIdForCEDOtherOps } = this.props;
        this.props.getCEDOtherOperationBySupplierID(supplierIdForCEDOtherOps, () => { });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancelCEDotherOps();
    }

    /**
    * @method setRowItem
    * @description Used to set row item in CED cost summary
    */
    setRowItem = (item) => {
        const { supplierColumn } = this.props;
        this.props.setRowDataCEDOtherOps(supplierColumn, item, () => {
            this.toggleModel()
        })
    }
    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, editIndex, uomId } = this.state;
        return (
            <Container>
                <Modal size={'xl'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{'CED Other Opration Details'}</ModalHeader>
                    <ModalBody>
                        <Table className="table table-striped" bordered>
                            {this.props.cedOtherOperationListBySupplier && this.props.cedOtherOperationListBySupplier.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{''}</th>
                                        <th>Supplier Code</th>
                                        <th>Supplier Name</th>
                                        <th>Process</th>
                                        <th>Operation Rate</th>
                                        <th>UOM</th>
                                        <th>Trans. Rate</th>
                                        <th>Trans. UOM</th>
                                        <th>Overhead/Profit(%)</th>
                                        {/* <th>Initiator</th>
                                        <th>Created On</th> */}
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.cedOtherOperationListBySupplier && this.props.cedOtherOperationListBySupplier.length > 0 &&
                                    this.props.cedOtherOperationListBySupplier.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td><button type="button" onClick={() => this.setRowItem(item)}>Add</button></td>
                                                <td >{item.SupplierCode}</td>
                                                <td>{item.SupplierName}</td>
                                                <td>{item.OperationName}</td>
                                                <td>{item.OperationRate}</td>
                                                <td>{item.UnitOfMeasurementName}</td>
                                                <td>{item.TrasnportationRate}</td>
                                                <td>{item.TrasnportationUOMName}</td>
                                                <td>{item.OverheadProfit}</td>
                                                {/* <td>{item.CreatedBy}</td>
                                                <td>{''}</td> */}
                                            </tr>
                                        )
                                    })}
                                {this.props.cedOtherOperationListBySupplier === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
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
function mapStateToProps({ otherOperation }) {
    const { cedOtherOperationListBySupplier, loading } = otherOperation;
    return { cedOtherOperationListBySupplier, loading }
}


export default connect(
    mapStateToProps, { getCEDOtherOperationBySupplierID, setRowDataCEDOtherOps }
)(CEDotherOperations);

