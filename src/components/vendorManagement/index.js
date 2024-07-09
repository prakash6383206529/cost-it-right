import React, { useState } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import InitiateUnblocking from './InitiateUnblocking';
import CommonApproval from '../masters/material-master/CommonApproval';
import { ONBOARDINGID } from '../../config/constants';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom';
const VendorManagement = () => {
    const [activeTab, setActiveTab] = useState("1");
    const location = useLocation();
    const history = useHistory()
    const currentState = location.state || {};
    const toggle = (tab) => {
        setTimeout(() => {
            setActiveTab(tab);
        }, 200);
        if (Number(tab) === 1) {
            const updatedState = {
                ...currentState,
                vendorId: null,
                plantId: null
            }
            history.replace({ ...location, state: updatedState });
        }
    }


    return (
        <>
            <div className="user-page container-fluid costing-main-container">
                <div>
                    <Nav tabs className="subtabs mt-0 mb-3">
                        {/* <NavItem>
                            <NavLink
                                // to="/vendor-classification"
                                className={classnames({ active: activeTab === "1" })}
                                onClick={() => setActiveTab("1")}
                            >
                                Supplier Classification Status
                            </NavLink>
                        </NavItem> */}
                        {/* <NavItem>
                            <NavLink
                                to="/lps-rating"
                                className={classnames({ active: activeTab === "2" })}
                                onClick={() => setActiveTab("2")}
                            >
                                LPS Rating Status
                            </NavLink>
                        </NavItem> */}

                        <NavItem>
                            <NavLink
                                to="/vendor-classification"
                                className={classnames({ active: activeTab === "1" })}
                                onClick={() => toggle("1")}
                            >
                                Initiate Unblocking
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                to="/supplier-approval-summary"
                                className={classnames({ active: activeTab === "2" })}
                                onClick={() => toggle("2")}
                            >
                                Approval Status
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>

                        {/* {Number(activeTab) === 1 &&
                            <TabPane tabId="1">
                                <VendorClassificationListing
                                    toggle={toggle}


                                />
                            </TabPane>}

                        {Number(activeTab) === 2 &&
                            <TabPane tabId="2">
                                <LpsRatingListing
                                    toggle={toggle}

                                />
                            </TabPane>} */}

                        {
                            Number(activeTab) === 1 &&
                            <TabPane tabId="1">
                                <InitiateUnblocking
                                    toggle={toggle}
                                />
                            </TabPane>
                        }
                        {
                            Number(activeTab) === 2 &&
                            <TabPane tabId="2">
                                <CommonApproval
                                    MasterId={0}
                                    OnboardingApprovalId={ONBOARDINGID}
                                    toggle={toggle}
                                    hidesendBtn={true}
                                />
                            </TabPane>
                        }
                    </TabContent>

                </div>
            </div >
        </>);
};

export default VendorManagement;
