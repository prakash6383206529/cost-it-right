import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import UserRegistration from './UserRegistration';
import Role from './Role';
import Department from './Department';
import Level from './Level';
import LevelUser from './LevelUser';
import LevelTechnology from './LevelTechnology';
import PermissionsUserWise from './PermissionsUserWise';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import classnames from 'classnames';


class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: '1'
        }
    }

    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({ isOpen: true })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({ isOpen: false })
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
                                Add User
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                Add Role
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                Add Department
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                                Add Level
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '5' })} onClick={() => { this.toggle('5'); }}>
                                Level User's
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '6' })} onClick={() => { this.toggle('6'); }}>
                                Level Technology
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '7' })} onClick={() => { this.toggle('7'); }}>
                                User Wise Permissions
                                </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        {this.state.activeTab === '1' && <TabPane tabId="1">
                            <UserRegistration
                                toggle={this.toggle} />
                        </TabPane>}
                        {this.state.activeTab === '2' && <TabPane tabId="2">
                            <Role
                                toggle={this.toggle} />
                        </TabPane>}
                        {this.state.activeTab === '3' && <TabPane tabId="3">
                            <Department
                                toggle={this.toggle} />
                        </TabPane>}
                        {this.state.activeTab === '4' && <TabPane tabId="4">
                            <Level
                                toggle={this.toggle} />
                        </TabPane>}
                        {this.state.activeTab === '5' && <TabPane tabId="5">
                            <LevelUser
                                toggle={this.toggle} />
                        </TabPane>}
                        {this.state.activeTab === '6' && <TabPane tabId="6">
                            <LevelTechnology
                                toggle={this.toggle} />
                        </TabPane>}
                        {this.state.activeTab === '7' && <TabPane tabId="7">
                            <PermissionsUserWise
                                toggle={this.toggle} />
                        </TabPane>}
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
)(User);

