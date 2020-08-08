import React, { Component } from 'react';
import { connect } from 'react-redux';

import AddRMDomestic from './AddRMDomestic';
import RMListing from './RMListing';
import SpecificationListing from './SpecificationListing';

import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import classnames from 'classnames';

import { getRowMaterialDataAPI } from '../../../../../actions/master/Material';
import AddRMImport from './AddRMImport';
import RMDomesticListing from './RMDomesticListing';
import RMImportListing from './RMImportListing';

class RowMaterialMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isRMOpen: false,
            isOpen: false,
            isEditFlag: false,
            Id: '',
            activeTab: '1',

            isRMDomesticForm: false,
            isRMImportForm: false,
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

    displayDomesticForm = () => {
        this.setState({ isRMDomesticForm: true, })
    }

    displayImportForm = () => {
        this.setState({ isRMImportForm: true, })
    }

    hideForm = () => {
        this.setState({ isRMDomesticForm: false, isRMImportForm: false, data: {} })
    }

    getDetails = (data) => {
        this.setState({ isRMDomesticForm: true, data: data })
    }

    getDetailsImport = (data) => {
        this.setState({ isRMImportForm: true, data: data })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isRMDomesticForm, isRMImportForm, data } = this.state;

        if (isRMDomesticForm === true) {
            return <AddRMDomestic
                data={data}
                hideForm={this.hideForm}
            />
        }

        if (isRMImportForm === true) {
            return <AddRMImport
                data={data}
                hideForm={this.hideForm}
            />
        }

        return (
            <Container fluid>
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col sm="4">
                        <h1>{`${CONSTANT.MATERIAL} ${CONSTANT.MASTER}`}</h1>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <div>
                            <Nav tabs className="subtabs">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Manage Raw Material (Domestic)
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage Raw Material (Import)
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                        Manage Specification
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                                        Manage Material
                                </NavLink>
                                </NavItem>
                            </Nav>

                            <TabContent activeTab={this.state.activeTab}>

                                {this.state.activeTab == 1 &&
                                    <TabPane tabId="1">
                                        <RMDomesticListing
                                            formToggle={this.displayDomesticForm}
                                            getDetails={this.getDetails}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 2 &&
                                    <TabPane tabId="2">
                                        <RMImportListing
                                            formToggle={this.displayImportForm}
                                            getDetails={this.getDetailsImport}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 3 &&
                                    <TabPane tabId="3">
                                        <SpecificationListing />
                                    </TabPane>}

                                {this.state.activeTab == 4 &&
                                    <TabPane tabId="4">
                                        <RMListing />
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
)(RowMaterialMaster);

