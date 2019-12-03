import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input, Table } from 'reactstrap';
import { getFreightDetailAPI } from '../../../actions/master/Freight';
import { setRowDataFreight } from '../../../actions/costing/costing';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { convertISOToUtcDate } from '../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import NoContentFound from '../../common/NoContentFound';


class AddFreightModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            freightType: 2,
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        this.props.getFreightDetailAPI(res => { });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancelFreight();
    }

    /**
    * @method setRowItem
    * @description Used to set row item in CED cost summary
    */
    setRowItem = (item) => {
        const { supplierColumn } = this.props;
        item.NetAdditionalFreightCost = item.Packaging * item.PerKilogram;
        this.props.setRowDataFreight(supplierColumn, item, () => {
            this.toggleModel()
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag } = this.state;
        const { freightDetail } = this.props;
        return (
            <Container>
                <Modal size={'xl'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{'Freight Details'}</ModalHeader>
                    <ModalBody>
                        <Table className="table table-striped" bordered>
                            {freightDetail && freightDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`Add`}</th>
                                        <th>{`${CONSTANT.FREIGHT} ${CONSTANT.TYPE}`}</th>
                                        <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                                        <th>{`Supplier Name`}</th>
                                        <th>{`Per Trip Cost`}</th>
                                        <th>{`Packaging Costing Head `}</th>
                                        <th>{`Packaging cost`}</th>
                                        <th>{`Per Kilogram`}</th>
                                        <th>{`Loding Unloading Costing Heads`}</th>
                                        <th>{`LodingUnloading`}</th>
                                        <th>{`Create Date`}</th>
                                        <th>{'Status '}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {freightDetail && freightDetail.length > 0 &&
                                    freightDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                {item.FreightType === 2 && <td><button type="button" onClick={() => this.setRowItem(item)}>Add</button></td>}
                                                {item.FreightType === 2 && <td>{item.FreightType}</td>}
                                                {item.FreightType === 2 && <td>{item.PlantName}</td>}
                                                {item.FreightType === 2 && <td>{item.SupplierName}</td>}
                                                {item.FreightType === 2 && <td>{item.PerTrip}</td>}
                                                {item.FreightType === 2 && <td>{item.PackagingCostingHeadsName}</td>}
                                                {item.FreightType === 2 && <td>{item.Packaging}</td>}
                                                {item.FreightType === 2 && <td>{item.PerKilogram}</td>}
                                                {item.FreightType === 2 && <td>{item.LodingUnloadingCostingHeadsName}</td>}
                                                {item.FreightType === 2 && <td>{item.LodingUnloading}</td>}
                                                {item.FreightType === 2 && <td>{convertISOToUtcDate(item.CreatedDate)}</td>}
                                                {item.FreightType === 2 && <td>{item.IsActive ? 'Active' : 'InActive'}</td>}
                                            </tr>
                                        )
                                    })}
                                {this.props.freightDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
function mapStateToProps({ freight }) {
    const { freightDetail, loading } = freight;
    return { freightDetail, loading }
}


export default connect(
    mapStateToProps, { getFreightDetailAPI, setRowDataFreight }
)(AddFreightModal);

