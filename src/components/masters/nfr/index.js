import React, { useState } from "react"
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import NFRApprovalListing from "./NFRApprovalListing";
import NfrListing from "./NfrListing";
import classnames from 'classnames';
import { reactLocalStorage } from "reactjs-localstorage";
import { useDispatch } from "react-redux";
import { fetchNfrDetailFromSap } from "./actions/nfr";
import Toaster from "../../common/Toaster";

function NfrTabs(props) {
    const [activeTab, setActiveTab] = useState('1');
    const [isFromDiscount, setisFromDiscount] = useState(reactLocalStorage.getObject("isFromDiscountObj"));
    const [showAddNFRDrawer, setShowAddNFRDrawer] = useState(false);

    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }

    }


    const changeIsFromDiscount = (value) => {
        setisFromDiscount(value)
    }

    const openAddNFRDrawer = (isOpen) => {
        setShowAddNFRDrawer(isOpen)
    }

    return (
        <>
            <div className="user-page container-fluid costing-main-container">
                <div>
                    {!showAddNFRDrawer && (
                        <Nav tabs className="subtabs mt-0 mb-3">
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "1" })}
                                    onClick={() => {
                                        toggle("1");
                                    }}
                                >
                                    Customer RFQ Listing
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "2" })}
                                    onClick={() => {
                                        toggle("2");
                                    }}
                                >
                                    Customer RFQ Approval
                                </NavLink>
                            </NavItem>
                        </Nav>
                    )}
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                            {activeTab === '1' && <NfrListing 
                                isFromDiscount={isFromDiscount} 
                                changeIsFromDiscount={changeIsFromDiscount} 
                                activeTab={activeTab}
                                showAddNFRDrawer={showAddNFRDrawer}
                                openAddNFRDrawer={openAddNFRDrawer}
                            />}
                        </TabPane>

                        <TabPane tabId="2">
                            {activeTab === '2' && <NFRApprovalListing activeTab={activeTab} />}
                        </TabPane>
                    </TabContent>
                </div>
            </div>
        </>
    )
}
export default NfrTabs