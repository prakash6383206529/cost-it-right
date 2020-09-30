import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddBOPDomestic from './AddBOPDomestic';
import AddBOPImport from './AddBOPImport';
import BOPDomesticListing from './BOPDomesticListing';
import BOPImportListing from './BOPImportListing';

class BOPMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isBOPDomesticForm: false,
            isBOPImportForm: false,
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

    /**
    * @method displayDomesticForm
    * @description DISPLAY BOP DOMESTIC FORM
    */
    displayDomesticForm = () => {
        this.setState({ isBOPDomesticForm: true, isBOPImportForm: false, data: {} })
    }

    /**
    * @method displayImportForm
    * @description DISPLAY BOP IMPORT FORM
    */
    displayImportForm = () => {
        this.setState({ isBOPDomesticForm: false, isBOPImportForm: true, data: {} })
    }

    /**
    * @method hideForm
    * @description HIDE DOMESTIC AND IMPORT FORMS
    */
    hideForm = () => {
        this.setState({ isBOPDomesticForm: false, isBOPImportForm: false, data: {} })
    }

    /**
    * @method getDetails
    * @description GET DETAILS FOR DEOMESTIC FORM
    */
    getDetails = (data) => {
        this.setState({ isBOPDomesticForm: true, data: data })
    }

    /**
    * @method getImportDetails
    * @description GET DETAILS FOR IMPORT FORM
    */
    getImportDetails = (data) => {
        this.setState({ isBOPImportForm: true, data: data })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isBOPDomesticForm, isBOPImportForm, data, } = this.state;

        if (isBOPDomesticForm === true) {
            return <AddBOPDomestic
                data={data}
                hideForm={this.hideForm}
            />
        }

        if (isBOPImportForm === true) {
            return <AddBOPImport
                data={data}
                hideForm={this.hideForm}
            />
        }

        return (
            <>
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col sm="4">
                        <h3>{`BOP Master`}</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Nav tabs className="subtabs">
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                    Manage BOP (Domestic)
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    Manage BOP (Import)
                                </NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab={this.state.activeTab}>

                            {this.state.activeTab == 1 &&
                                <TabPane tabId="1">
                                    <BOPDomesticListing
                                        displayForm={this.displayDomesticForm}
                                        getDetails={this.getDetails}
                                    />
                                </TabPane>}

                            {this.state.activeTab == 2 &&
                                <TabPane tabId="2">
                                    <BOPImportListing
                                        displayForm={this.displayImportForm}
                                        getDetails={this.getImportDetails}
                                    />
                                </TabPane>}
                        </TabContent>

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
function mapStateToProps({ boughtOutparts }) {
    const { BOPListing, loading } = boughtOutparts;;
    return { BOPListing, loading }
}


export default connect(
    mapStateToProps, {
}
)(BOPMaster);

