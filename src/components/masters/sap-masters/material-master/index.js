import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table } from 'reactstrap';
import AddMaterial from './AddMaterial';
//import { getAllPartsAPI, deletePartsAPI } from '../../../../actions/master/Part';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant'

class MaterialMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    // componentDidMount() {
    //     this.props.getAllPartsAPI(res => {});
    // }
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
    // editPartDetails = (index, Id) => {
    //     console.log('Id: ', Id);
    //     this.setState({
    //         isEditFlag: true,
    //         isOpen: true,
    //         PartId: Id,
    //         editIndex: index,
    //     })
    // }
    
    /**
    * @method deletePart
    * @description confirm delete part
    */
    // deletePart = (index, Id) => {
    //     const toastrConfirmOptions = {
    //         onOk: () => {
    //             this.confirmDeletePart(index,Id)
    //         },
    //         onCancel: () => console.log('CANCEL: clicked')
    //     };
    //     return toastr.confirm(`Are you sure you want to delete This part ?`, toastrConfirmOptions);
    // }

    /**
    * @method confirmDeletePart
    * @description confirm delete part
    */
    // confirmDeletePart = (index, PartId) => {
    //     this.props.deletePartsAPI(PartId, (res) => {
    //         if (res.data.Result === true) {
    //             toastr.success(MESSAGES.PART_DELETE_SUCCESS);
    //             this.props.getAllPartsAPI(res => {});
    //         } else {
    //             toastr.error(MESSAGES.SOME_ERROR);
    //         }
    //     });
        
    // }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag,editIndex, PartId } = this.state;
        return (
            <Container className="top-margin">
            {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.MATERIAL} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.MATERIAL} `}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.MATERIAL} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                {/* {this.props.partsListing && this.props.partsListing.length > 0 &&
                    this.props.partsListing.map((item, index) => {
                        return (
                        <div key={index}> 
                         <Table>
                            <thead>
                                <tr>
                                <th>{`${CONSTANT.PART} ${CONSTANT.NUMBER}`}</th>
                                <th>{`${CONSTANT.PART} ${CONSTANT.NAME}`}</th> 
                                <th>{`${CONSTANT.PART} ${CONSTANT.TYPE}`}</th>
                                <th>{`${CONSTANT.PART} ${CONSTANT.GROUPCODE}`}</th>
                                <th>{`${CONSTANT.UOM}`}t</th>
                                <th>{`${CONSTANT.PART} ${CONSTANT.DESCRIPTION}`}</th>
                                </tr>
                            </thead>
                            <tbody > 
                                <tr >
                                    <td >{item.PartNumber}</td>
                                    <td>{item.PartName}</td> 
                                    <td>{item.MaterialTypeId ? item.MaterialTypeId : 'N/A'}</td>
                                    <td>{item.MaterialGroupCode ? item.MaterialGroupCode : 'N/A'}</td> 
                                    <td>{item.UnitOfMeasurementId ? item.UnitOfMeasurementId : 'N/A'}</td> 
                                    <td>{item.PartDescription}</td>
                                    <div>
                                        <Button className="black-btn" onClick={() => this.editPartDetails(index,item.PartId)}><i className="fas fa-pencil-alt"></i></Button> 
                                        <Button className="black-btn" onClick={() => this.deletePart(index, item.PartId)}><i className="far fa-trash-alt"></i></Button>
                                    </div>
                                </tr>
                            </tbody>  
                            </Table> 
                        </div>
                        
                        )
                    })} */}
                </Col>
                {isOpen && (
                    <AddMaterial
                        isOpen={isOpen}
                        onCancel={this.onCancel}
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
function mapStateToProps({ }) {
    // const { partsListing ,loading } = part;
    // console.log('partsListing: ', partsListing);
    // return { partsListing, loading }
}


export default connect(
    mapStateToProps, null
)(MaterialMaster);

