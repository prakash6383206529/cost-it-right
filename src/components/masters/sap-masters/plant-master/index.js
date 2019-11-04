import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table } from 'reactstrap';
import AddPlant from './AddPlant';
import { getPlantDataAPI } from '../../../../actions/master/Plant';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant'

class PlantMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getPlantDataAPI(res => {});
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
            this.props.getPlantDataAPI(res => {});
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen } = this.state;
        return (
            <Container className="top-margin">
            {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.PLANT} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.PLANT} `}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.PLANT} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                <Table className="table table-striped" bordered>
                    <thead>
                        <tr>
                        <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.PLANT} ${CONSTANT.TITLE}`}</th> 
                        <th>{`Unit ${CONSTANT.NUMBER}`}</th>
                        <th>{`${CONSTANT.ADDRESS}`}</th>
                        <th>{`${CONSTANT.CITY}`}</th>
                        </tr>
                    </thead>
                    <tbody > 
                        {this.props.plantDetail && this.props.plantDetail.length > 0 &&
                            this.props.plantDetail.map((item, index) => {
                            return (                                       
                                <tr key={index}>
                                    <td >{item.PlantName}</td>
                                    <td>{item.PlantTitle}</td> 
                                    <td>{item.UnitNumber}</td>
                                    <td>{item.Address}</td> 
                                    <td>{item.CityId}</td> 
                                </tr>
                            )
                        })}
                    </tbody>  
                </Table> 
                </Col>
                {isOpen && (
                    <AddPlant
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
function mapStateToProps({ plant }) {
    const { plantDetail ,loading } = plant;
    console.log('plantDetail: ', plantDetail);
    return { plantDetail, loading }
}


export default connect(
    mapStateToProps, { getPlantDataAPI }
)(PlantMaster);

