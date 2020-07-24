import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import classnames from 'classnames';
import AddAssemblyPart from './AddAssemblyPart';
import AddIndivisualPart from './AddIndivisualPart';

class PartMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: '1'
        }
    }

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

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { } = this.state;
        return (
            <>
                <Container className="user-page p-0">
                    {/* {this.props.loading && <Loader/>} */}
                    <div>
                        <h1>Part Master</h1>
                        <Nav tabs className="subtabs">
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                    Manage Assembly Part
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    Manage Indivisual Component/Part
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            {this.state.activeTab === '1' &&
                                <TabPane tabId="1">
                                    <AddAssemblyPart />
                                </TabPane>}
                            {this.state.activeTab === '2' &&
                                <TabPane tabId="2">
                                    <AddIndivisualPart />
                                </TabPane>}
                        </TabContent>
                    </div>
                </Container >
            </ >
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
)(PartMaster);

