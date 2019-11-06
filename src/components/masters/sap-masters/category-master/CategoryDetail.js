import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Table
} from 'reactstrap';
import { getCategoryDataAPI } from '../../../../actions/master/Category';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant'

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
                        <h5>{`${CONSTANT.CATEGORY} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                    <hr />
                    <Table className="table table-striped" bordered>
                        <thead>
                            <tr>
                                <th>{`${CONSTANT.CATEGORY} ${CONSTANT.NAME}`}</th>
                                <th>{`${CONSTANT.CATEGORY} ${CONSTANT.TYPE}`}</th>
                                <th>{`${CONSTANT.CATEGORY} ${CONSTANT.DESCRIPTION}`}</th>
                            </tr>
                        </thead>
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
function mapStateToProps({ category }) {
    const { categoryDetail, categoryTypeDetail } = category;
    return { categoryDetail, categoryTypeDetail }
}


export default connect(
    mapStateToProps, { getCategoryDataAPI }
)(CategoryDetail);

