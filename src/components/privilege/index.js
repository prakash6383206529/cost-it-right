import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import PrivilegePage from './PrivilegePage';
import PrivilegePageRoleWise from './PrivilegePageRoleWise';
import PrivilegePageUserWise from './PrivilegePageUserWise';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import classnames from 'classnames';

class Privilege extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
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
        const { isOpen } = this.state;
        return (
            <Container className="user-page">
                {/* {this.props.loading && <Loader/>} */}
                <div>
                    <Nav tabs className="subtabs">
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                Privilege Page
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                Permissions Role Wise
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                Permissions User Wise
                                </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            <PrivilegePage
                                toggle={this.toggle} />
                        </TabPane>
                        <TabPane tabId="2">
                            <PrivilegePageRoleWise
                                toggle={this.toggle} />
                        </TabPane>
                        <TabPane tabId="3">
                            <PrivilegePageUserWise
                                toggle={this.toggle} />
                        </TabPane>
                    </TabContent>
                </div>
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
}


export default connect(
    mapStateToProps, {}
)(Privilege);

