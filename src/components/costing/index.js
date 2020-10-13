import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';

class Costing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            activeTab: '1',
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
            this.setState({ activeTab: tab });
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <>
                <div className="user-page p-0">
                    {/* {this.props.loading && <Loader/>} */}
                    <div>
                        <h1>Costing</h1>
                        <Nav tabs className="subtabs">
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                    Costing Details
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    Costing Summary
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            {this.state.activeTab === '1' &&
                                <TabPane tabId="1">
                                    {'AA'}
                                </TabPane>}
                            {this.state.activeTab === '2' &&
                                <TabPane tabId="2">
                                    {'BB'}
                                </TabPane>}
                        </TabContent>
                    </div>
                </div >
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman }) {
    const { plantList } = comman;
    return { plantList }
}


export default connect(mapStateToProps, {

}
)(reduxForm({
    form: 'CostingForm',
    enableReinitialize: true,
})(Costing));

