import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table } from 'reactstrap';
import AddUOM from './AddUOM';
import { getUnitOfMeasurementAPI, deleteUnitOfMeasurementAPI } from '../../../../actions/unitOfMeasurment';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'


class UOMMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getUnitOfMeasurementAPI(res => {});
    }
    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({ isOpen: true })
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
    editPartDetails = (index) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            editIndex: index,
        })
    }
    
    /**
    * @method deletePart
    * @description confirm delete part
    */
    deletePart = (index) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteUOM(index)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`Are you sure you want to delete This part ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteUOM
    * @description confirm delete unit of measurement
    */
   confirmDeleteUOM = (index, Id) => {
        this.props.deleteUnitOfMeasurementAPI(index,Id, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.PART_DELETE_SUCCESS);
                this.props.getUnitOfMeasurementAPI(res => {});
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
        const { isOpen, isEditFlag,editIndex } = this.state;
        return (
            <Container className="top-margin">
                <Row>
                    <Col>
                        <h3>Unit of Measurement Master </h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>Add UOM</Button>
                    </Col>
                </Row>
                
                <hr />
                <Row>
                    <Col>
                        <h5>Unit Of Measurement Master Details </h5>
                    </Col>
                </Row>
                <Col>
                {/* <Table>
                    <thead>
                        <tr>
                        <th>UOM Name</th>
                        <th>UOM Title</th> 
                        <th>UOM Description</th>
                        <th>UOM Created By</th>
                        </tr>
                    </thead> */}
                {this.props.unitOfMeasurementList && this.props.unitOfMeasurementList.length > 0 &&
                    this.props.unitOfMeasurementList.map((item, index) => {
                        return (
                        <div key={index}> 
                        <Table>
                            <thead>
                                <tr>
                                <th>UOM Name</th>
                                <th>UOM Title</th> 
                                <th>UOM Description</th>
                                <th>UOM Created By</th>
                                </tr>
                            </thead>
                            <tbody > 
                                <tr >
                                    <td >{item.Name}</td>
                                    <td>{item.Title}</td> 
                                    <td>{item.Description}</td>
                                    <td>{item.CreatedBy}</td>
                                    <div>
                                        <Button className="black-btn" onClick={() => this.editPartDetails(index, )}><i className="fas fa-pencil-alt"></i></Button> 
                                        <Button className="black-btn" onClick={() => this.deletePart(index,this.props.unitOfMeasurementList.Id)}><i className="far fa-trash-alt"></i></Button>
                                    </div>
                                </tr>
                            </tbody>  
                        </Table> 
                        </div>
                        )
                    })}
                    {/* </Table> */}
                </Col>
                {isOpen && (
                    <AddUOM
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        editIndex={editIndex}
                        partDetails={this.props.partsListing}
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
function mapStateToProps({ unitOfMeasrement }) {
    const {unitOfMeasurementList} = unitOfMeasrement;
    return { unitOfMeasurementList}
}


export default connect(
    mapStateToProps, { getUnitOfMeasurementAPI, deleteUnitOfMeasurementAPI}
)(UOMMaster);

