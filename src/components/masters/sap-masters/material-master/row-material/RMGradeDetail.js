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



class RMGradeDetail extends Component {
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
                        <h5>{`${CONSTANT.MATERIAL} ${CONSTANT.GRADE} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                <hr/>
                <Table className="table table-striped" bordered>
                    <thead>
                        <tr>
                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.GRADE}`}</th>
                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.TYPE}`}</th> 
                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.DESCRIPTION}`}</th>
                        <th>{`${CONSTANT.DATE}`}</th>
                        </tr>
                    </thead>
                    <tbody > 
                        {this.props.rowMaterialGradeDetail && this.props.rowMaterialGradeDetail.length > 0 &&
                            this.props.rowMaterialGradeDetail.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td >{item.Grade}</td>
                                        <td>{item.RawMaterialName}</td> 
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
function mapStateToProps({ material}) {
    const { rowMaterialGradeDetail } = material;
    return { rowMaterialGradeDetail }
}


export default connect(
    mapStateToProps, {getRowMaterialDataAPI}
)(RMGradeDetail);

