import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import classnames from 'classnames';
import AddOverhead from './AddOverhead';
import AddProfit from './AddProfit';
import OverheadListing from './OverheadListing';
import ProfitListing from './ProfitListing';

class OverheadProfit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isOverheadForm: false,
            isProfitForm: false,
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

    displayOverheadForm = () => {
        this.setState({ isOverheadForm: true, isProfitForm: false, })
    }

    displayProfitForm = () => {
        this.setState({ isProfitForm: true, isOverheadForm: false, })
    }

    hideForm = () => {
        this.setState({ isOverheadForm: false, isProfitForm: false, data: {} })
    }

    getOverHeadDetails = (data) => {
        this.setState({ isOverheadForm: true, data: data })
    }

    getProfitDetails = (data) => {
        this.setState({ isProfitForm: true, data: data })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, isOverheadForm, isProfitForm, data } = this.state;

        if (isOverheadForm == true) {
            return <AddOverhead
                data={data}
                hideForm={this.hideForm}
            />
        }

        if (isProfitForm == true) {
            return <AddProfit
                data={data}
                hideForm={this.hideForm}
            />
        }

        return (
            <>
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col sm="4">
                        <h3>{`Overhead & Profit Master`}</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <div>
                            <Nav tabs className="subtabs">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Manage Overhead
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage Profits
                                </NavLink>
                                </NavItem>
                            </Nav>

                            <TabContent activeTab={this.state.activeTab}>

                                {this.state.activeTab == 1 &&
                                    <TabPane tabId="1">
                                        <OverheadListing
                                            formToggle={this.displayOverheadForm}
                                            getDetails={this.getOverHeadDetails}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 2 &&
                                    <TabPane tabId="2">
                                        <ProfitListing
                                            formToggle={this.displayProfitForm}
                                            getDetails={this.getProfitDetails}
                                        />
                                    </TabPane>}
                            </TabContent>
                        </div>
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
function mapStateToProps({ overheadProfit }) {
    const { loading } = overheadProfit;
    return { loading }
}


export default connect(mapStateToProps, {

})(OverheadProfit);

