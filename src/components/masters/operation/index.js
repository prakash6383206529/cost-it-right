import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import OperationInsights from './OperationInsights';
import OperationListing from './OperationListing';
import AddOperation from './AddOperation';

class OperationsMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Id: '',
            activeTab: '2',
            isOperation: false,

            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            BulkUploadAccessibility: false,
            DownloadAccessibility: false,

            data: {},
        }
    }

    displayOperationForm = () => {
        this.setState({ isOperation: true, data: { isEditFlag: false } })
    }

    hideForm = () => {
        this.setState({ isOperation: false, data: {} })
    }

    getDetails = (data) => {
        this.setState({ isOperation: true, data: data })
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
        const { isOperation, data } = this.state;

        if (isOperation === true) {
            return <AddOperation
                data={data}
                hideForm={this.hideForm}
            />
        }

        return (
            <>
                <div className="container-fluid">
                    {/* {this.props.loading && <Loader/>} */}
                    <Row>
                        <Col sm="4">
                            <h1>{`Operation Master`}</h1>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div>
                                <Nav tabs className="subtabs mt-0">

                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>Manage Operation</NavLink>
                                    </NavItem>

                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>Approval Status</NavLink>
                                    </NavItem>

                                </Nav>

                                <TabContent activeTab={this.state.activeTab}>



                                    {this.state.activeTab == 1 &&
                                        <TabPane tabId="1">
                                            <OperationListing
                                                formToggle={this.displayOperationForm}
                                                getDetails={this.getDetails}
                                                AddAccessibility={this.state.AddAccessibility}
                                                EditAccessibility={this.state.EditAccessibility}
                                                DeleteAccessibility={this.state.DeleteAccessibility}
                                                BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                                DownloadAccessibility={this.state.DownloadAccessibility}
                                            />
                                        </TabPane>}


                                    {this.state.activeTab == 2 &&
                                        <TabPane tabId="2">
                                            <OperationApproval
                                                AddAccessibility={this.state.AddAccessibility}
                                                EditAccessibility={this.state.EditAccessibility}
                                                DeleteAccessibility={this.state.DeleteAccessibility}
                                                DownloadAccessibility={this.state.DownloadAccessibility}
                                            />
                                        </TabPane>}

                                </TabContent>
                            </div>
                        </Col>
                    </Row>
                </div>
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
    const { leftMenuData, loading, topAndLeftMenuData } = auth;
    return { leftMenuData, loading, topAndLeftMenuData }
}


export default connect(
    mapStateToProps, {
    getLeftMenu
}
)(OperationsMaster);

