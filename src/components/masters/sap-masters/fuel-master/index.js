import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import classnames from 'classnames';

import { getRowMaterialDataAPI } from '../../../../actions/master/Material';
import AddFuel from './AddFuel';
import AddPower from './AddPower';
import FuelListing from './FuelListing';
import PowerListing from './PowerListing';

class FuelMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Id: '',
            activeTab: '1',

            isFuelForm: false,
            isPowerForm: false,
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

    displayFuelForm = () => {
        this.setState({ isFuelForm: true, })
    }

    displayPowerForm = () => {
        this.setState({ isPowerForm: true, })
    }

    hideForm = () => {
        this.setState({ isFuelForm: false, isPowerForm: false, data: {} })
    }

    getDetails = (data) => {
        this.setState({ isFuelForm: true, data: data })
    }

    getDetailsPower = (data) => {
        this.setState({ isPowerForm: true, data: data })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isFuelForm, isPowerForm, data } = this.state;

        if (isFuelForm === true) {
            return <AddFuel
                data={data}
                hideForm={this.hideForm}
            />
        }

        if (isPowerForm === true) {
            return <AddPower
                data={data}
                hideForm={this.hideForm}
            />
        }

        return (
            <Container>
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col sm="4">
                        <h3>{`Fuel & Power Master`}</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <div>
                            <Nav tabs className="subtabs">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Manage Fuel
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage Power
                                </NavLink>
                                </NavItem>

                            </Nav>

                            <TabContent activeTab={this.state.activeTab}>

                                {this.state.activeTab == 1 &&
                                    <TabPane tabId="1">
                                        <FuelListing
                                            formToggle={this.displayFuelForm}
                                            getDetails={this.getDetails}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 2 &&
                                    <TabPane tabId="2">
                                        <PowerListing
                                            formToggle={this.displayPowerForm}
                                            getDetails={this.getDetailsPower}
                                        />
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
    // const { partsListing ,loading } = part;
    // console.log('partsListing: ', partsListing);
    // return { partsListing, loading }
}


export default connect(
    mapStateToProps, { getRowMaterialDataAPI }
)(FuelMaster);

