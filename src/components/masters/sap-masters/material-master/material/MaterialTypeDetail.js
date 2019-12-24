import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import { getMaterialDetailAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';

class MaterialTypeDetail extends Component {
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
        this.props.getMaterialDetailAPI(res => { });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <div>
                {/* {this.props.loading && <Loader/>} */}
                {/* <Row>
                    <Col>
                        <h5>{`${CONSTANT.MATERIAL_MASTER} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row> */}
                <Col>
                    {/* <hr /> */}
                    <Table className="table table-striped" bordered>
                        {this.props.rmTypeDetail && this.props.rmTypeDetail.length > 0 &&
                            <thead>
                                <tr>
                                    <th>{`${CONSTANT.MATERIAL} ${CONSTANT.TYPE}`}</th>
                                    <th>{`${CONSTANT.DESCRIPTION}`}</th>
                                    <th>{`${CONSTANT.DATE}`}</th>
                                </tr>
                            </thead>}
                        <tbody >
                            {this.props.rmTypeDetail && this.props.rmTypeDetail.length > 0 &&
                                this.props.rmTypeDetail.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td >{item.MaterialType}</td>
                                            <td>{item.Description}</td>
                                            <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                        </tr>
                                    )
                                })}
                            {this.props.rmTypeDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
    const { rmTypeDetail } = material;
    return { rmTypeDetail }
}


export default connect(
    mapStateToProps, { getMaterialDetailAPI }
)(MaterialTypeDetail);

