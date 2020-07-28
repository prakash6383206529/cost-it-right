import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import classnames from 'classnames';
import MachineRateListing from './MachineRateListing';
import AddMachineRate from './AddMachineRate';

class MachineMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isMachineRateForm: false,
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

    displayForm = () => {
        this.setState({ isMachineRateForm: true })
    }

    hideForm = () => {
        this.setState({ isMachineRateForm: false })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isMachineRateForm } = this.state;

        if (isMachineRateForm === true) {
            return <AddMachineRate
                hideForm={this.hideForm}
            />
        }

        return (
            <Container>
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col sm="4">
                        <h3>{`Machine Master`}</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <div>
                            <Nav tabs className="subtabs">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Machine Rate
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage Process
                                </NavLink>
                                </NavItem>
                            </Nav>

                            <TabContent activeTab={this.state.activeTab}>

                                {this.state.activeTab == 1 &&
                                    <TabPane tabId="1">
                                        <MachineRateListing
                                            displayForm={this.displayForm}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 2 &&
                                    <TabPane tabId="2">
                                        {/* <AddBOPImport /> */}
                                    </TabPane>}
                            </TabContent>
                        </div>
                    </Col>
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
    mapStateToProps, {
}
)(MachineMaster);

