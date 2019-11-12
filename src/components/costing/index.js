import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from 'reactstrap';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import classnames from 'classnames';
import CostSummary from './costsummary';
import CostWorking from './costworking';
import { getCostingBySupplier } from '../../actions/costing/CostWorking'


class Costing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            activeTab: '1',
            supplierId: ''
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {

    }

    /**
   * @method toggle
   * @description toggling the tabs
   */
    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    supplierCosting = (supplierId) => {
        console.log('%c 🦑 supplierId: ', 'font-size:20px;background-color: #B03734;color:#fff;', supplierId);
        this.setState({
            activeTab: '2',
            supplierId: 'd883225e-586c-4b4a-84d1-3759764afbb3'
        });
        this.props.getCostingBySupplier(supplierId, (res) => {console.log('res', res) })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, supplierId } = this.state;
        return (
            <Container>
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.COSTING} Summary`}</h3>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Nav tabs className="subtabs">
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                Cost Summary
                                </NavLink>
                        </NavItem>

                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                Cost Working
                                </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            <Col>
                                <CostSummary
                                    supplierCosting={this.supplierCosting} />
                            </Col>
                        </TabPane>
                        <TabPane tabId="2">
                            <CostWorking
                                supplierId={supplierId} />
                        </TabPane>
                    </TabContent>

                </Row>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ }) {
    return {}
}


export default connect(
    mapStateToProps, { getCostingBySupplier }
)(Costing);

