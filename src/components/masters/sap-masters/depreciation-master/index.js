import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddDepreciation from './AddDepreciation';
import { getDepreciationDataAPI } from '../../../../actions/master/MHRMaster';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';
import NoContentFound from '../../../common/NoContentFound';
import { MESSAGES } from '../../../../config/message';

class DepreciationMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        this.props.getDepreciationDataAPI(res => { });
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
            this.props.getDepreciationDataAPI(res => { });
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader />} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.DEPRECIATION} ${CONSTANT.MASTER} `}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.DEPRECIATION}`}</Button>
                    </Col>
                </Row>

                <hr />
                <Row>
                    <Col>
                        <div>
                            <Table className="table table-striped" bordered>
                                {this.props.depreciationDetail && this.props.depreciationDetail.length > 0 &&
                                    <thead>
                                        <tr>
                                            <th>{`${CONSTANT.DEPRECIATION} ${CONSTANT.TYPE}`}</th>
                                            <th>{`${CONSTANT.SHIFT}`}</th>
                                            <th>{`${CONSTANT.DEPRECIATION} ${CONSTANT.RATE}`}</th>
                                            <th>{`${CONSTANT.DATE}`}</th>
                                        </tr>
                                    </thead>}
                                <tbody >
                                    {this.props.depreciationDetail && this.props.depreciationDetail.length > 0 &&
                                        this.props.depreciationDetail.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td >{item.DepreciationType}</td>
                                                    <td>{item.Shift}</td>
                                                    <td>{item.DepreciationRate}</td>
                                                    <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                </tr>
                                            )
                                        })}
                                    {this.props.depreciationDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
                {isOpen && (
                    <AddDepreciation
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
function mapStateToProps({ MHRReducer }) {
    const { depreciationDetail, loading } = MHRReducer;
    return { depreciationDetail, loading }
}

export default connect(
    mapStateToProps, { getDepreciationDataAPI }
)(DepreciationMaster);

