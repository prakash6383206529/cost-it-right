import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import classnames from 'classnames';
import MachineRateListing from './MachineRateListing';
import AddMachineRate from './AddMachineRate';
import AddMoreDetails from './AddMoreDetails';

class MachineMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isMachineRateForm: false,
            isAddMoreDetails: false,
            data: {},
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
        this.setState({
            isMachineRateForm: true,
            isAddMoreDetails: false,
        })
    }

    hideForm = () => {
        this.setState({ isMachineRateForm: false })
    }

    setData = (data) => {
        this.setState({ data: data })
    }

    displayMoreDetailsForm = () => {
        this.setState({
            isAddMoreDetails: true,
            isMachineRateForm: false,
        })
    }

    hideMoreDetailsForm = () => {
        this.setState({
            isAddMoreDetails: false,
            isMachineRateForm: true,
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isMachineRateForm, isAddMoreDetails } = this.state;

        if (isMachineRateForm === true) {
            return <AddMachineRate
                setData={this.setData}
                hideForm={this.hideForm}
                displayMoreDetailsForm={this.displayMoreDetailsForm}
            />
        }

        if (isAddMoreDetails === true) {
            return <AddMoreDetails
                data={this.state.data}
                hideMoreDetailsForm={this.hideMoreDetailsForm}
            />
        }

        return (
            <>
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
            </>
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

