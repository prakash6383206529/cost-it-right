import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddAssemblyPart from './AddAssemblyPart';
import AddIndivisualPart from './AddIndivisualPart';
import AssemblyPartListing from './AssemblyPartListing';

class PartMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: '1',
            isAddBOMForm: false,
            getDetails: {},
        }
    }

    componentDidMount() {

    }

    displayForm = () => {
        this.setState({ isAddBOMForm: true, })
    }

    hideForm = () => {
        this.setState({ isAddBOMForm: false, })
    }

    getDetails = (data) => {
        this.setState({ getDetails: data })
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
        const { isAddBOMForm } = this.state;

        if (isAddBOMForm === true) {
            return <AddAssemblyPart
                hideForm={this.hideForm}
                getDetails={this.state.getDetails}
            />
        }

        return (
            <>
                <div className="user-page p-0">
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
                                    Manage Individual Component/Part
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            {this.state.activeTab === '1' &&
                                <TabPane tabId="1">
                                    <AssemblyPartListing
                                        displayForm={this.displayForm}
                                        getDetails={this.getDetails}
                                    />
                                </TabPane>}
                            {this.state.activeTab === '2' &&
                                <TabPane tabId="2">
                                    <AddIndivisualPart />
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
function mapStateToProps({ }) {

    return {}
}


export default connect(
    mapStateToProps, {

}
)(PartMaster);

