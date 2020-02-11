import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import { getRowMaterialDataAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';

class RMGradeDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
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
                <Row>
                    <Col>
                        {/* <hr /> */}
                        <Table className="table table-striped" hover bordered>
                            {this.props.rowMaterialGradeDetail && this.props.rowMaterialGradeDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.GRADE}`}</th>
                                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.TYPE}`}</th>
                                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.DESCRIPTION}`}</th>
                                        <th>{`${CONSTANT.DATE}`}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.rowMaterialGradeDetail && this.props.rowMaterialGradeDetail.length > 0 &&
                                    this.props.rowMaterialGradeDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.Grade}</td>
                                                <td>{item.RawMaterialName}</td>
                                                <td>{item.Description}</td>
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                            </tr>
                                        )
                                    })}
                                {this.props.rowMaterialGradeDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
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
    const { rowMaterialGradeDetail } = material;
    return { rowMaterialGradeDetail }
}


export default connect(
    mapStateToProps, { getRowMaterialDataAPI }
)(RMGradeDetail);

