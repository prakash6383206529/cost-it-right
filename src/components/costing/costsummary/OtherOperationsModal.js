import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input, Table } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText, renderNumberInputField, renderSelectField } from "../../layout/FormInputs";
import { getCostSummaryOtherOperation } from '../../../actions/costing/costing';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message'
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';

class OtherOperationsModal extends Component {
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
        const { supplierIdForOtherOps, supplierColumn } = this.props;
        this.props.getCostSummaryOtherOperation(supplierIdForOtherOps, res => { });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    otherOperationHandler = (item) => {
        //this.props.setOtherOperationRowData(item)
        this.toggleModel()
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { otherOperationList } = this.props;

        return (
            <Container>
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{'Other Opration Details'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <div className={'create-costing-grid'}>
                                <Table className="table table-striped" bordered>
                                    <thead>
                                        <tr>
                                            <th>{``}</th>
                                            <th>{`Assy Part No.`}</th>
                                            <th>{`Child Part No.`}</th>
                                            <th>{`Description`}</th>
                                            <th>{`Process Code`}</th>
                                            <th>{`Process Operation`}</th>
                                            <th>{`UOM`}</th>
                                            <th>{`Rate`}</th>
                                            <th>{`Quantity`}</th>
                                            <th>{`NetCost`}</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {/* {otherOperationList && otherOperationList.map((item, index) => {
                                            return (
                                                <tr row={index} >
                                                    <td><div onClick={() => this.otherOperationHandler(item)}>{'Add'}</div></td>
                                                    <td>{item.OperationCode}</td>
                                                    <td>{item.SupplierName}</td>
                                                    <td>{item.OtherOperationName}</td>
                                                    <td>{item.UnitOfMeasurementName}</td>
                                                    <td>{item.TechnologyName}</td>
                                                    <td>{item.Rate}</td>
                                                </tr>
                                            )
                                        })
                                        } */}
                                    </tbody>
                                    {/* {this.props.otherOperationList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />} */}
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
function mapStateToProps({ costing, state }) {
    const { otherOperationList } = costing;

    return { otherOperationList };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getCostSummaryOtherOperation,
})(OtherOperationsModal);
