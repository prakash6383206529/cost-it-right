import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import LPSRating from './LpsRating';
import VendorClassification from './VendorClassification';
import ApprovalListing from './ApprovalListing';
import InitiateUnblocking from './InitiateUnblocking';

const VendorManagement = () => {
    const [activeTab, setActiveTab] = useState("1");

    const toggle = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    return (
        <Container fluid>
            <div>



                <Nav tabs className="subtabs mt-0 mb-3">
                    <NavItem>
                        <NavLink
                            // to="/vendor-classification"
                            className={classnames({ active: activeTab === "1" })}
                            onClick={() => setActiveTab("1")}
                        >
                            Vendor Classification Status
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            to="/lps-rating"
                            className={classnames({ active: activeTab === "2" })}
                            onClick={() => setActiveTab("2")}
                        >
                            LPS Rating Status
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink
                            to="/initiate-unblocking"
                            className={classnames({ active: activeTab === "3" })}
                            onClick={() => setActiveTab("3")}
                        >
                            Initiate Unblocking
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            to="/supplier-management/approval-listing"
                            className={classnames({ active: activeTab === "4" })}
                            onClick={() => setActiveTab("4")}
                        >
                            Approval Status
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>

                    {Number(activeTab) === 1 &&
                        <TabPane tabId="1">
                            <VendorClassification
                                toggle={toggle}


                            />
                        </TabPane>}

                    {Number(activeTab) === 2 &&
                        <TabPane tabId="2">
                            <LPSRating
                                toggle={toggle}

                            />
                        </TabPane>}

                    {
                        Number(activeTab) === 3 &&
                        <TabPane tabId="3">
                            <InitiateUnblocking
                                toggle={toggle}
                            />
                        </TabPane>
                    }
                    {
                        Number(activeTab) === 4 &&
                        <TabPane tabId="4">
                            <ApprovalListing
                                toggle={toggle}
                            />
                        </TabPane>
                    }



                </TabContent>

            </div>
        </Container>
    );
};

export default VendorManagement;
