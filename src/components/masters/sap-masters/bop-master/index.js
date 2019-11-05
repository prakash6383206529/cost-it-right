import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddBOP from './AddBOP';
import { getAllBOPAPI, deleteBOPAPI } from '../../../../actions/master/BoughtOutParts';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';

class BOPMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {
        this.props.getAllBOPAPI(res => { });
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
            this.props.getAllBOPAPI(res => { });
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
            bopId: Id,
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
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE} BOP ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete bought out part
    */
    confirmDelete = (Id) => {
        this.props.deleteBOPAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_BOP_SUCCESS);
                this.props.getAllBOPAPI(res => { });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, bopId } = this.state;
        return (
            <Container className="top-margin">
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.BOP} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.BOPP} `}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.BOPP} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`} </h5>
                    </Col>
                </Row>
                <Col>
                    <Table className="table table-striped" bordered>
                        <thead>
                            <tr>
                                <th>{`${CONSTANT.TECHNOLOGY}`}</th>
                                <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.PART} ${CONSTANT.NUMBER}`}</th>
                                <th>{`${CONSTANT.CATEGORY}`}</th>
                                <th>{` ${CONSTANT.SPECIFICATION}`}</th>
                                <th>{`${CONSTANT.MATERIAL} ${CONSTANT.TYPE}`}</th>
                                <th>{`${CONSTANT.UOM}`}</th>
                                <th>{`${CONSTANT.SOURCE} ${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}</th>
                                <th>{`${CONSTANT.SOURCE} ${CONSTANT.SUPPLIER} ${CONSTANT.LOCATION}`}</th>
                                <th>{`${CONSTANT.DESTINATION} ${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}</th>
                                <th>{`${CONSTANT.DESTINATION} ${CONSTANT.SUPPLIER} ${CONSTANT.LOCATION}`}</th>
                                <th>{` ${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                                <th>{` ${CONSTANT.PART} ${CONSTANT.NAME}`}</th>
                                {/* <th>{`${CONSTANT.REVISION} ${CONSTANT.NUMBER}`}</th> */}
                                <th>{`Basic Rate`}</th>
                                <th>{`${CONSTANT.QUANTITY} `}</th>
                                <th>{` Net Landed Cost`}</th>
                                <th>{`${CONSTANT.DATE}`}</th>
                                <th>{}</th>
                                {/* <th>{}</th> */}
                            </tr>
                        </thead>
                        <tbody >
                            {this.props.BOPListing && this.props.BOPListing.length > 0 &&
                                this.props.BOPListing.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{item.TechnologyName}</td>
                                            <td>{item.PartNumber}</td>
                                            <td>{item.CategoryName}</td>
                                            <td>{item.Specification}</td>
                                            <td >{item.MaterialTypeName}</td>
                                            <td>{item.UnitOfMeasurementName}</td>
                                            <td>{item.SourceSupplierName}</td>
                                            <td>{item.SourceSupplierLocation}</td>
                                            <td>{item.DestinationSupplierName}</td>
                                            <td>{item.DestinationSupplierLocation}</td>
                                            <td>{item.PlantName}</td>
                                            <td>{item.PartName}</td>
                                            <td>{item.BasicRate}</td>
                                            <td>{item.Quantity}</td>
                                            <td>{item.NetLandedCost}</td>
                                            <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                            <td>
                                                <Button className="btn btn-secondary" onClick={() => this.editDetails(item.BopId)}><i className="fas fa-pencil-alt"></i></Button>
                                                <Button className="btn btn-danger" onClick={() => this.deleteBOP(item.BopId)}><i className="far fa-trash-alt"></i></Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </Table>
                </Col>
                {isOpen && (
                    <AddBOP
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        bopId={bopId}
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
function mapStateToProps({ boughtOutparts }) {
    const { BOPListing, loading } = boughtOutparts;;
    return { BOPListing, loading }
}


export default connect(
    mapStateToProps, { getAllBOPAPI, deleteBOPAPI }
)(BOPMaster);

