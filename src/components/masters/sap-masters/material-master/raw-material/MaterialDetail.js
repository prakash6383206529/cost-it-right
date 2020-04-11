import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Table, Button } from 'reactstrap';
import { getMaterialDetailAPI, deleteRawMaterialDetailAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { MESSAGES } from '../../../../../config/message';
import { toastr } from 'react-redux-toastr';

class MaterialDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const data = {
            PageSize: 0,
            LastIndex: 0,
            TechnologyId: '',
            DestinationSupplierId: '',
            PlantId: '',
        }
        this.props.getMaterialDetailAPI(data, res => { });
    }

    /**
    * @method editItemDetails
    * @description edit material type
    */
    editItemDetails = (Id) => {
        this.props.editRawMaterialDetailsHandler(Id);
    }

    /**
    * @method deleteItem
    * @description confirm delete Raw Material details
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    confirmDelete = (ID) => {
        this.props.deleteRawMaterialDetailAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
                this.props.getMaterialDetailAPI(res => { });
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <div>
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        {/* <hr /> */}
                        <Table className="table table-striped" size={'sm'} hover bordered>
                            {this.props.rmDetail && this.props.rmDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${CONSTANT.TECHNOLOGY}`}</th>
                                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.GRADE}`}</th>
                                        <th>{`${CONSTANT.SPECIFICATION}`}</th>
                                        {/* <th>{`${CONSTANT.CATEGORY} ${CONSTANT.NAME}`}</th> */}
                                        <th>{`${CONSTANT.SOURCE} ${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.SOURCE} ${CONSTANT.SUPPLIER} ${CONSTANT.LOCATION}`}</th>
                                        <th>{`${CONSTANT.DESTINATION} ${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.DESTINATION} ${CONSTANT.SUPPLIER} ${CONSTANT.LOCATION}`}</th>
                                        <th>{` ${CONSTANT.UOM}`}</th>
                                        {/* <th>{` ${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th> */}
                                        <th>{`${CONSTANT.BASIC} ${CONSTANT.RATE}`}</th>
                                        <th>{`Piece`}</th>
                                        <th>{`${CONSTANT.SCRAP} ${CONSTANT.RATE}`}</th>
                                        <th>{` ${CONSTANT.NLC}`}</th>
                                        <th>{`${CONSTANT.REMARK} `}</th>
                                        <th>{`${CONSTANT.DATE}`}</th>
                                        <th>{``}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.rmDetail && this.props.rmDetail.length > 0 &&
                                    this.props.rmDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{item.TechnologyName}</td>
                                                <td >{item.RawMaterialName}</td>
                                                <td>{item.RawMaterialGradeName}</td>
                                                <td>{item.RawMaterialSpecificationName}</td>
                                                {/* <td >{item.CategoryName}</td> */}
                                                <td>{item.SourceSupplierName}</td>
                                                <td>{item.SourceSupplierLocation}</td>
                                                <td>{item.DestinationSupplierName}</td>
                                                <td>{item.DestinationSupplierLocation}</td>
                                                <td>{item.UnitOfMeasurementName}</td>
                                                {/* <td>{item.PlantName}</td> */}
                                                <td >{item.BasicRate}</td>
                                                <td>{item.Quantity}</td>
                                                <td>{item.ScrapRate}</td>
                                                <td >{item.NetLandedCost}</td>
                                                <td>{item.Remark}</td>
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                <td>
                                                    <Button className="black-btn" onClick={() => this.editItemDetails(item.RawMaterialDetailsId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deleteItem(item.RawMaterialDetailsId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.rmDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material }) {
    const { rmDetail } = material;
    return { rmDetail }
}

export default connect(
    mapStateToProps, {
    getMaterialDetailAPI,
    deleteRawMaterialDetailAPI,
}
)(MaterialDetail);

