import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Table } from 'reactstrap';
import { getRowMaterialDataAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';

class RMDetail extends Component {
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
                        <Table className="table table-striped" bordered>
                            {this.props.rowMaterialDetail && this.props.rowMaterialDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`Raw Material Name`}</th>
                                        <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.DESCRIPTION}`}</th>
                                        <th>{`${CONSTANT.DATE}`}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.rowMaterialDetail && this.props.rowMaterialDetail.length > 0 &&
                                    this.props.rowMaterialDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.RawMaterialName}</td>
                                                <td>{item.PlantName}</td>
                                                <td>{item.Description}</td>
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                            </tr>
                                        )
                                    })}
                                {this.props.rowMaterialDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
    const { rowMaterialDetail } = material;
    return { rowMaterialDetail }
}


export default connect(
    mapStateToProps, { getRowMaterialDataAPI }
)(RMDetail);

