import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';

import { reactLocalStorage } from 'reactjs-localstorage';
import { useHistory } from "react-router-dom";
import Simulation from './Simulation';
import SimulationApprovalListing from './SimulationApprovalListing';
import { useSelector } from 'react-redux';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
export const simulationContext = React.createContext();


function SimulationTab(props) {
    const { location } = props;
    let history = useHistory();
    const [activeTab, setActiveTab] = useState('1');
    const [showEditMaster, setShowEditMaster] = useState(false);
    const [showverifyPage, setShowverifyPage] = useState(false);
    const [costingDrawerPage, setDrawerCostingPage] = useState(false)
    const { t } = useTranslation("Simulation")

    const [showCompressedColumns, setShowCompressedColumns] = useState(false)
    const [showTour, setShowTour] = useState(false)
    const [render, setRender] = useState(false)
    const { selectedMasterForSimulation, simulationApplicability, selectedTechnologyForSimulation, isMasterAssociatedWithCosting, selectedVendorForSimulation } = useSelector(state => state.simulation)
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
   * @method toggleExtraData
   * @description Used to handle extra data
   */
    const toggleExtraData = useCallback((showTour) => {
        setRender(true)
        setTimeout(() => {
            setShowCompressedColumns(showTour)
            setRender(false)
            setShowTour(showTour)
        }, 100);
    }, []);

    /**
    * @method handleEditMasterPage
    * @description Used to handle simulation edit and verify page
    */
    const handleEditMasterPage = (showEditTable, showverifyPage, costingPagevalue) => {

        setShowEditMaster(showEditTable)
        setShowverifyPage(showverifyPage)
        setDrawerCostingPage(costingPagevalue)
    }


    /**
    * @method render
    * @description Renders the component
    */
    return (
        <>
            <div className="user-page container-fluid">
                <div>
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
                        {activeTab === "1" && <TourWrapper
                            buttonSpecificProp={{ id: "Simulation_Tour", onClick: toggleExtraData }}
                            stepsSpecificProp={{
                                steps: Steps(t, { activeTab, simulationApplicability, selectedMasterForSimulation, selectedTechnologyForSimulation, isMasterAssociatedWithCosting, selectedVendorForSimulation, showEditMaster, showverifyPage, costingDrawerPage }).SIMULATION
                            }} />}
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        <simulationContext.Provider
                            value={{ showverifyPage, showEditMaster, costingDrawerPage, handleEditMasterPage, showCompressedColumns, render, showTour }}>
                            {activeTab === "1" && <TabPane tabId="1">
                                <Simulation activeTab={activeTab} isFromApprovalListing={location?.state?.isFromApprovalListing} approvalProcessId={location?.state?.approvalProcessId} master={location?.state?.master} preserveData={location?.state?.preserveData} statusForLinkedToken={location?.state?.statusForLinkedToken} approvalTypeId={location?.state?.approvalTypeId} DepartmentId={location?.state?.DepartmentId} handleEditMasterPage={handleEditMasterPage} showverifyPage={showverifyPage} render={render} showCompressedColumns={showCompressedColumns} />
                            </TabPane>}
                            {activeTab === "2" && <TabPane tabId="2">
                                <SimulationApprovalListing activeTab={activeTab} />
                            </TabPane>}
                        </simulationContext.Provider>

                    </TabContent>
                </div>
            </div>
        </>
    );
}

const SimulationForm = connect()(SimulationTab);
export default SimulationForm;