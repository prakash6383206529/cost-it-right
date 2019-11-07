import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Table
} from 'reactstrap';
import { getRowMaterialDataAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../../helper';

class RMSpecificationDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getRowMaterialDataAPI(res => { });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <div>
                {this.props.loading && <Loader />}
                {/* <Row>
                    <Col>
                        <h5>{`${CONSTANT.SPECIFICATION} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row> */}
                <Col>
                    <hr />
                    <Table className="table table-striped" bordered>
                        <thead>
                            <tr>
                                <th>{`${CONSTANT.MATERIAL} ${CONSTANT.GRADE}`}</th>
                                <th>{`${CONSTANT.MATERIAL} ${CONSTANT.SPECIFICATION}`}</th>
                                <th>{`${CONSTANT.MATERIAL} ${CONSTANT.DESCRIPTION}`}</th>
                                <th>{`${CONSTANT.DATE}`}</th>
                            </tr>
                        </thead>
                        <tbody >
                            {this.props.rmSpecificationDetail && this.props.rmSpecificationDetail.length > 0 &&
                                this.props.rmSpecificationDetail.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{item.GradeName}</td>
                                            <td >{item.Specification}</td>
                                            <td>{item.Description}</td>
                                            <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </Table>
                </Col>
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material }) {
    const { rmSpecificationDetail } = material;
    return { rmSpecificationDetail }
}


export default connect(
    mapStateToProps, { getRowMaterialDataAPI }
)(RMSpecificationDetail);

