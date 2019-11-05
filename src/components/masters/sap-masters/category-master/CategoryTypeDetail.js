import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Table
} from 'reactstrap';
import { getCategoryDataAPI } from '../../../../actions/master/Category';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant'

class CategoryTypeDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

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
                {/* <Container className="top-margin"> */}
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.CATEGORY}  ${CONSTANT.TYPE} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                    <hr />
                    <Table className="table table-striped" bordered>
                        <thead>
                            <tr>
                                <th>{`${CONSTANT.CATEGORY} ${CONSTANT.TYPE}`}</th>
                                <th>{`${CONSTANT.CATEGORY} ${CONSTANT.DESCRIPTION}`}</th>
                            </tr>
                        </thead>
                        <tbody >
                            {this.props.categoryTypeDetail && this.props.categoryTypeDetail.length > 0 &&
                                this.props.categoryTypeDetail.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{item.CategoryType}</td>
                                            <td>{item.Description}</td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </Table>
                </Col>
                {/* </Container > */}
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
    const { categoryTypeDetail } = category;
    return { categoryTypeDetail }
}


export default connect(
    mapStateToProps, { getCategoryDataAPI }
)(CategoryTypeDetail);

