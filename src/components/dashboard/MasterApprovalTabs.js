import React, { useEffect, useState } from "react";
import { Nav, NavItem, NavLink, TabPane, TabContent } from "reactstrap";
import classnames from 'classnames';
import { APPROVED, PENDING, REJECTED, WAITING_FOR_APPROVAL } from "../../config/constants";
import CommonApproval from "../masters/material-master/CommonApproval";
import { useSelector } from "react-redux";

const MasterApprovalTabs = (props) => {

    const [activeTab, setActiveTab] = useState('1')
    const dashboardTabLock = useSelector(state => state.comman.dashboardTabLock)
    const [changeTab, setChangeTab] = useState(false)

    useEffect(() => {
        setChangeTab(true)
        setTimeout(() => {
            setChangeTab(false)
        }, 10);
    }, [props.MasterId])
    /**
* @method toggle
* @description toggling the tabs
*/
    const toggle = (tab) => {
        if (activeTab !== tab) {
            // dispatch(resetStatePagination())
            setActiveTab(tab)
        }
    }


    return (!changeTab ? <>
        <Nav tabs className="subtabs mt-0 p-relative">
            {dashboardTabLock && <div className="disabled-overflow min-width"></div>}
            <NavItem>
                <NavLink id={`dashboard_Masters_Pending_Approval`} className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                    Pending For Approval
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink id={`dashboard_Masters_Awaiting_Approval`} className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                    Awaiting Approval
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink id={`dashboard_Masters_Rejected`} className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('3'); }}>
                    Rejected
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink id={`dashboard_Masters_Approved`} className={classnames({ active: activeTab === '4' })} onClick={() => { toggle('4'); }}>
                    Approved
                </NavLink>
            </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
            {activeTab === '1' &&
                <TabPane tabId="1">
                    <CommonApproval isApproval={true} MasterId={props.MasterId} isPageNoChange={props.isPageNoChange} status={PENDING} hidesendBtn={false} isDashboard={true} delegation={props.delegation}/>
                </TabPane>}
            {activeTab === '2' &&
                <TabPane tabId="2">
                    <CommonApproval isApproval={true} MasterId={props.MasterId} isPageNoChange={props.isPageNoChange} status={WAITING_FOR_APPROVAL} hidesendBtn={true} isDashboard={true} delegation={props.delegation}/>
                </TabPane>}
            {activeTab === '3' &&
                <TabPane tabId="3">
                    <CommonApproval isApproval={true} MasterId={props.MasterId} isPageNoChange={props.isPageNoChange} status={REJECTED} hidesendBtn={true} isDashboard={true} delegation={props.delegation}/>
                </TabPane>}
            {activeTab === '4' &&
                <TabPane tabId="4">
                    <CommonApproval isApproval={true} MasterId={props.MasterId} isPageNoChange={props.isPageNoChange} status={APPROVED} hidesendBtn={true} isDashboard={true} delegation={props.delegation}/>
                </TabPane>}
        </TabContent>
    </> : <> </>
    )
}

export default MasterApprovalTabs;
