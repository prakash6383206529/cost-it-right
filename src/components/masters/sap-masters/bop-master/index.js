import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddBOPDomestic from './AddBOPDomestic';
import AddBOPImport from './AddBOPImport';

class BOPMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1'
        }
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

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <>
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col sm="4">
                        <h3>{`BOP Master`}</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Nav tabs className="subtabs">
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                    Manage BOP (Domestic)
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    Manage BOP (Import)
                                </NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab={this.state.activeTab}>

                            {this.state.activeTab == 1 &&
                                <TabPane tabId="1">
                                    <AddBOPDomestic />
                                </TabPane>}

                            {this.state.activeTab == 2 &&
                                <TabPane tabId="2">
                                    <AddBOPImport />
                                </TabPane>}
                        </TabContent>

                    </Col>
                </Row>

            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ boughtOutparts }) {
    const { BOPListing, loading } = boughtOutparts;;
    return { BOPListing, loading }
}


export default connect(
    mapStateToProps, {
}
)(BOPMaster);

