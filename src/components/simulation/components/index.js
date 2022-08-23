import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';

import { reactLocalStorage } from 'reactjs-localstorage';
import { useHistory } from "react-router-dom";
import Simulation from './Simulation';
import SimulationApprovalListing from './SimulationApprovalListing';



function SimulationTab(props) {
    const { location } = props;
    let history = useHistory();
    const [activeTab, setActiveTab] = useState('1');

    /**
    * @method toggle
    * @description toggling the tabs
    */
    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    }

    useEffect(() => {
        if (reactLocalStorage.get('location') === '/simulation-history' || JSON.parse(localStorage.getItem('simulationAddPermission'))?.length === 0) {
            toggle("2");
        }
        else {
            toggle("1");
        }
    }, [])



    /**
    * @method render
    * @description Renders the component
    */
    return (
        <>
            <div className="user-page container-fluid">
                <div>
                    <h1>Simulation</h1>
                    <Nav tabs className="subtabs mt-0">
                        {(JSON.parse(localStorage.getItem('simulationAddPermission')))?.length !== 0 && <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === "1" })}
                                onClick={() => {
                                    toggle("1");
                                    history.push("/simulation");
                                }}
                            >
                                Simulation
                            </NavLink>
                        </NavItem>}
                        {(JSON.parse(localStorage.getItem('simulationViewPermission')))?.length !== 0 && <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === "2" })}
                                onClick={() => {
                                    toggle("2");
                                    history.push("/simulation-history");
                                }}
                            >
                                Simulation History
                            </NavLink>
                        </NavItem>}
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                            <Simulation isFromApprovalListing={location?.state?.isFromApprovalListing} approvalProcessId={location?.state?.approvalProcessId} master={location?.state?.master} statusForLinkedToken={location?.state?.statusForLinkedToken} />
                        </TabPane>
                        <TabPane tabId="2">
                            <SimulationApprovalListing />
                        </TabPane>
                    </TabContent>
                </div>
            </div>
        </>
    );
}

const SimulationForm = connect()(SimulationTab);
export default SimulationForm;