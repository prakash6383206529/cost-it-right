import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table } from 'reactstrap';
import AddBOP from './AddBOP';
import { getAllBOPAPI } from '../../../../actions/master/BoughtOutParts';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';


class BOPMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getAllBOPAPI(res => {});
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
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen } = this.state;
        return (
            <Container className="top-margin">
            {this.props.loading && <Loader/>}
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
                <Table  className="table table-striped" bordered>
                    <thead>
                        <tr>
                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.TYPE}`}</th>
                        <th>{`${CONSTANT.UOM}`}</th> 
                        <th>{`${CONSTANT.PART} ${CONSTANT.NUMBER}`}</th>
                        <th>{`${CONSTANT.TECHNOLOGY}`}</th>
                        <th>{`${CONSTANT.CATEGORY}` }</th>
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
                        <th>{` ${CONSTANT.SPECIFICATION}`}</th>
                        <th>{`${CONSTANT.DATE}`}</th>
                        </tr>
                    </thead>
                    <tbody > 
                    {this.props.BOPListing && this.props.BOPListing.length > 0 &&
                        this.props.BOPListing.map((item, index) => {
                            return (
                                <tr >
                                    <td >{item.MaterialTypeName}</td>
                                    <td>{item.UnitOfMeasurementName}</td> 
                                    <td>{item.PartNumber}</td> 
                                    <td>{item.TechnologyName}</td>
                                    <td>{item.CategoryName}</td> 
                                    <td>{item.SourceSupplierName}</td>
                                    <td>{item.SourceSupplierLocation}</td> 
                                    <td>{item.DestinationSupplierName}</td>
                                    <td>{item.DestinationSupplierLocation}</td>
                                    <td>{item.PlantName}</td>
                                    <td>{item.PartName}</td>
                                    <td>{item.BasicRate}</td>
                                    <td>{item.Quantity}</td>
                                    <td>{item.NetLandedCost}</td>
                                    <td>{item.Specification}</td>
                                    <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                    <div> 
                                    </div>
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
    const { BOPListing } = boughtOutparts;;
    console.log('BOPListing: ', BOPListing);
    return { BOPListing }
}


export default connect(
    mapStateToProps, { getAllBOPAPI }
)(BOPMaster);

