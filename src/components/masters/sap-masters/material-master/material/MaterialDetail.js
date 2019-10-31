import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Table } from 'reactstrap';
import { getMaterialDetailAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../../helper';

class MaterialDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getMaterialDetailAPI(res => {});
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <Container className="top-margin">
            {this.props.loading && <Loader/>}
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.MATERIAL_MASTER} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                <hr/>
                <Table className="table table-striped" bordered>
                    <thead>
                        <tr>
                        <th>{`${CONSTANT.TECHNOLOGY}`}</th>
                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.GRADE}`}</th>
                        <th>{`${CONSTANT.SPECIFICATION}`}</th>
                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.NAME}` }</th>
                        <th>{`${CONSTANT.SOURCE} ${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.SOURCE} ${CONSTANT.SUPPLIER} ${CONSTANT.LOCATION}`}</th>
                        <th>{`${CONSTANT.DESTINATION} ${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}</th> 
                        <th>{`${CONSTANT.DESTINATION} ${CONSTANT.SUPPLIER} ${CONSTANT.LOCATION}`}</th> 
                        <th>{` ${CONSTANT.UOM}`}</th>
                        <th>{` ${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.BASIC} ${CONSTANT.RATE}`}</th>
                        <th>{`${CONSTANT.QUANTITY}`}</th> 
                        <th>{`${CONSTANT.SCRAP} ${CONSTANT.RATE}`}</th>
                        <th>{` ${CONSTANT.NLC}`}</th>
                        <th>{`${CONSTANT.REMARK} `}</th>
                        <th>{`${CONSTANT.DATE}`}</th>
                        </tr>
                    </thead>
                    <tbody > 
                        {this.props.rmDetail && this.props.rmDetail.length > 0 &&
                            this.props.rmDetail.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{item.TechnologyName }</td>
                                        <td >{item.RawMaterialName}</td>
                                        <td>{item.GradeName}</td> 
                                        <td>{item.SpecificationName }</td>
                                        <td >{item.CategoryName}</td>
                                        <td>{item.SourceSupplierName }</td>
                                        <td>{item.SourceSupplierLocation}</td> 
                                        <td>{item.DestinationSupplierName }</td>
                                        <td>{item.DestinationSupplierLocation}</td> 
                                        <td>{item.UnitOfMeasurementName}</td> 
                                        <td>{item.PlantName }</td>
                                        <td >{item.BasicRate}</td>
                                        <td>{item.Quantity}</td> 
                                        <td>{item.ScrapRate }</td>
                                        <td >{item.NetLandedCost}</td>
                                        <td>{item.Remark}</td> 
                                        <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                    </tr>
                                )
                            })}
                    </tbody> 
                </Table>
                </Col>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material}) {
    const { rmDetail } = material;
    return { rmDetail }
}


export default connect(
    mapStateToProps, {getMaterialDetailAPI}
)(MaterialDetail);

