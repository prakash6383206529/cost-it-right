import React, { useState } from "react";
import { Nav, NavItem, NavLink, TabPane, TabContent } from "reactstrap";
import classnames from 'classnames';
import SimulationApprovalListing from "../simulation/components/SimulationApprovalListing";
import { APPROVED, PENDING, REJECTED, WAITING_FOR_APPROVAL } from "../../config/constants";
import ApprovalListing from "../costing/components/approval/ApprovalListing";
import { useSelector } from "react-redux";
import { MESSAGES } from "../../config/message";

const Tabs = (props) => {

    const [activeTab, setActiveTab] = useState('1')
    const dashboardTabLock = useSelector(state => state.comman.dashboardTabLock)

    /**
* @method toggle
* @description toggling the tabs
*/
    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab)
        }
    }

    return (
        <>
            <Nav tabs className="subtabs mt-0 p-relative">
                {dashboardTabLock && <div title={MESSAGES.LOADING_MESSAGE} className="disabled-overflow min-width"></div>}
                <NavItem>
                    <NavLink id={`dashboard_${props.module}_Pending_For_Approval`} className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                        Pending For Approval
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink id={`dashboard_${props.module}_Awaiting_Approval`} className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                        Awaiting Approval
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink id={`dashboard_${props.module}_Rejected`} className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('3'); }}>
                        Rejected
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink id={`dashboard_${props.module}_Approved`} className={classnames({ active: activeTab === '4' })} onClick={() => { toggle('4'); }}>
                        Approved
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                {activeTab === '1' &&
                    <TabPane tabId="1">
                        {props.costing ? <ApprovalListing isApproval={true} closeDashboard={props.closeDashboard} isDashboard={true} isPageNoChange={props.isPageNoChange} status={PENDING} hidesendBtn={false} delegation={props.delegation} />
                            : <SimulationApprovalListing isSmApprovalListing={true} isDashboard={true} isPageNoChange={props.isPageNoChange} status={PENDING} hidesendBtn={false} delegation={props.delegation} />
                        }
                    </TabPane>}
                {activeTab === '2' &&
                    <TabPane tabId="2">
                        {props.costing ? <ApprovalListing isApproval={true} closeDashboard={props.closeDashboard} isDashboard={true} isPageNoChange={props.isPageNoChange} status={WAITING_FOR_APPROVAL} hidesendBtn={true} delegation={props.delegation} />
                            : <SimulationApprovalListing isSmApprovalListing={true} isDashboard={true} isPageNoChange={props.isPageNoChange} status={WAITING_FOR_APPROVAL} hidesendBtn={true} delegation={props.delegation} />
                        }
                    </TabPane>}
                {activeTab === '3' &&
                    <TabPane tabId="3">
                        {props.costing ? <ApprovalListing isApproval={true} closeDashboard={props.closeDashboard} isDashboard={true} isPageNoChange={props.isPageNoChange} status={REJECTED} hidesendBtn={true} delegation={props.delegation} />
                            : <SimulationApprovalListing isSmApprovalListing={true} isDashboard={true} isPageNoChange={props.isPageNoChange} status={REJECTED} hidesendBtn={true} delegation={props.delegation} />
                        }
                    </TabPane>}
                {activeTab === '4' &&
                    <TabPane tabId="4">
                        {props.costing ? <ApprovalListing isApproval={true} closeDashboard={props.closeDashboard} isDashboard={true} isPageNoChange={props.isPageNoChange} status={APPROVED} hidesendBtn={true} delegation={props.delegation} />
                            : <SimulationApprovalListing isSmApprovalListing={true} isDashboard={true} isPageNoChange={props.isPageNoChange} status={APPROVED} hidesendBtn={true} delegation={props.delegation} />
                        }
                    </TabPane>}
            </TabContent>
        </>
    )
}

export default Tabs;
