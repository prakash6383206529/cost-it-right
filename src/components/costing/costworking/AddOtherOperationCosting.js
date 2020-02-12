import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input, Table } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText, renderNumberInputField, renderSelectField } from "../../layout/FormInputs";
import { addCostingUnitOtherOperationData, getOtherOperationList, getCostingDetailsById } from '../../../actions/costing/CostWorking';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message'
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { loggedInUserId } from "../../../helper/auth";

class AddOtherOperationCosting extends Component {
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
        this.props.getOtherOperationList(supplierId, res => { });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    otherOperationHandler = (item) => {
        const { costingId, selectedIndex } = this.props;

        this.props.setOtherOperationRowData(item)
        this.toggleModel()
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { otherOperationListData } = this.props;

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
                                            <th>{`Process Code`}</th>
                                            <th>{`Supplier`}</th>
                                            <th>{`Process Operation`}</th>
                                            <th>{`UOM`}</th>
                                            <th>{`Technology`}</th>
                                            <th>{`Rate`}</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {otherOperationListData && otherOperationListData.map((item, index) => {
                                            return (
                                                <tr row={index} >
                                                    <td><button type={'button'} onClick={() => this.otherOperationHandler(item)}>{'Add'}</button></td>
                                                    <td>{item.OperationCode}</td>
                                                    <td>{item.SupplierName}</td>
                                                    <td>{item.OtherOperationName}</td>
                                                    <td>{item.UnitOfMeasurementName}</td>
                                                    <td>{item.TechnologyName}</td>
                                                    <td>{item.Rate}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                    {this.props.otherOperationListData === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
    const { otherOperationListData } = costWorking;

    return { otherOperationListData };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getOtherOperationList,
    addCostingUnitOtherOperationData,
    getCostingDetailsById
})(reduxForm({
    form: 'AddOtherOperationCosting',
    enableReinitialize: true,
})(AddOtherOperationCosting));
