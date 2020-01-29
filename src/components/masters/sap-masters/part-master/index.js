import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddPart from './AddPart';
import { getAllPartsAPI, deletePartsAPI } from '../../../../actions/master/Part';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';

class PartMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getAllPartsAPI(res => { });
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
        this.setState({ isOpen: false })
    }

    /**
    * @method editPartDetails
    * @description confirm delete part
    */
    editPartDetails = (index, Id) => {
        console.log('Id: ', Id);
        this.setState({
            isEditFlag: true,
            isOpen: true,
            PartId: Id,
            editIndex: index,
        })
    }

    /**
    * @method deletePart
    * @description confirm delete part
    */
    deletePart = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeletePart(index, Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`Are you sure you want to delete This part ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeletePart
    * @description confirm delete part
    */
    confirmDeletePart = (index, PartId) => {
        this.props.deletePartsAPI(PartId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.PART_DELETE_SUCCESS);
                this.props.getAllPartsAPI(res => { });
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
        const { isOpen, isEditFlag, editIndex, PartId } = this.state;
        return (
            <Container className="top-margin">
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.PART} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.PART} `}</Button>
                    </Col>
                </Row>
                <hr />
                {/* <Row>
                    <Col>
                        <h5>{`${CONSTANT.PART} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row> */}
                <Col>
                    <Table className="table table-striped" bordered>
                        {this.props.partsListing && this.props.partsListing.length > 0 &&
                            <thead>
                                <tr>
                                    {/* <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th> */}
                                    <th>{`${CONSTANT.PART} ${CONSTANT.NUMBER}`}</th>
                                    <th>{`${CONSTANT.PART} ${CONSTANT.NAME}`}</th>
                                    {/* <th>{`${CONSTANT.PART} ${CONSTANT.TYPE}`}</th> */}
                                    <th>{`${CONSTANT.PART} ${CONSTANT.GROUPCODE}`}</th>
                                    <th>{`${CONSTANT.UOM}`}</th>
                                    <th>{`Is Assembly`}</th>
                                    <th>{`${CONSTANT.PART} ${CONSTANT.DESCRIPTION}`}</th>
                                    <th></th>
                                </tr>
                            </thead>}
                        <tbody >
                            {this.props.partsListing && this.props.partsListing.length > 0 &&
                                this.props.partsListing.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            {/* <td >{item.PlantName}</td> */}
                                            <td>{item.PartNumber}</td>
                                            <td>{item.PartNumber}</td>
                                            {/* <td>{item.MaterialTypeName}</td> */}
                                            <td>{item.MaterialGroupCode}</td>
                                            <td>{item.UnitOfMeasurementName}</td>
                                            <td>{item.IsAssembly ? 'true' : 'false'}</td>
                                            <td>{item.PartDescription}</td>
                                            <div>
                                                <Button className="btn btn-secondary" onClick={() => this.editPartDetails(index, item.PartId)}><i className="fas fa-pencil-alt"></i></Button>
                                                <Button className="btn btn-danger" onClick={() => this.deletePart(index, item.PartId)}><i className="far fa-trash-alt"></i></Button>
                                            </div>
                                        </tr>
                                    )
                                })}
                            {this.props.partsListing === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                        </tbody>
                    </Table>
                </Col>
                {isOpen && (
                    <AddPart
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        editIndex={editIndex}
                        partId={PartId}
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
function mapStateToProps({ part }) {
    const { partsListing, loading } = part;
    return { partsListing, loading }
}


export default connect(
    mapStateToProps, { getAllPartsAPI, deletePartsAPI }
)(PartMaster);

