import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Table } from 'reactstrap';
import { getRowMaterialDataAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../../helper';

class RMDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getRowMaterialDataAPI(res => {});
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
                        <h5>{`${CONSTANT.MATERIAL} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                <hr/>
                <Table className="table table-striped" bordered>
                    <thead>
                        <tr>
                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.TYPE}`}</th>
                        <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th> 
                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.DESCRIPTION}`}</th>
                        <th>{`${CONSTANT.DATE}`}</th>
                        </tr>
                    </thead>
                    <tbody > 
                        {this.props.rowMaterialDetail && this.props.rowMaterialDetail.length > 0 &&
                            this.props.rowMaterialDetail.map((item, index) => {
                                return (
                                    <tr key= {index}>
                                        <td >{item.RawMaterialName}</td>
                                        <td>{item.PlantName}</td> 
                                        <td>{item.Description }</td>
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
function mapStateToProps({ material }) {
    const { rowMaterialDetail } = material;
    return { rowMaterialDetail }
}


export default connect(
    mapStateToProps, {getRowMaterialDataAPI}
)(RMDetail);

