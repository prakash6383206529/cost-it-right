import React, { useState } from "react"
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import NFRApprovalListing from "./NFRApprovalLisitng";
import NfrListing from "./NfrListing";
import classnames from 'classnames';

function NfrTabs(props) {
    const [activeTab, setActiveTab] = useState('1');
    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }

    }
    return (
        <>
            <div className="user-page container-fluid costing-main-container">
                <div>
                    <Nav tabs className="subtabs mt-0 mb-3">
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === "1" })}
                                onClick={() => {
                                    toggle("1");
                                }}
                            >
                                NFR Listing
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === "2" })}
                                onClick={() => {
                                    toggle("2");
                                }}
                            >
                                NFR Approval
                            </NavLink>
                        </NavItem>

                    </Nav>
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                            <NfrListing />
                        </TabPane>

                        <TabPane tabId="2">
                            <NFRApprovalListing />
                        </TabPane>
                    </TabContent>
                </div>
            </div>
        </>
    )
}
export default NfrTabs