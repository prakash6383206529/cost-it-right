import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Row, Col, Table
} from 'reactstrap';
import { getCategoryDataAPI } from '../../../../actions/master/Category';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { MESSAGES } from '../../../../config/message';

class CategoryDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        this.props.getCategoryDataAPI(res => { });
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
                        <Table className="table table-striped" bordered>
                            {this.props.categoryDetail && this.props.categoryDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.TYPE}`}</th>
                                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.DESCRIPTION}`}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.categoryDetail && this.props.categoryDetail.length > 0 &&
                                    this.props.categoryDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.Category}</td>
                                                <td>{item.CategoryType}</td>
                                                <td>{item.Description}</td>
                                            </tr>
                                        )
                                    })}
                                {this.props.categoryDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
function mapStateToProps({ category }) {
    const { categoryDetail } = category;
    return { categoryDetail }
}

export default connect(
    mapStateToProps, { getCategoryDataAPI }
)(CategoryDetail);

