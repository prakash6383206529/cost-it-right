import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap'
import classnames from 'classnames'
import Button from '../layout/Button';
import CostingLevelListing from './CostingLevel'
import SimulationLevelListing from './SimulationLevel'
import MasterLevelListing from './MasterLevel'
import Level from './Level';
import OnboardingLevelListing from './OnboardingLevel';
import { getConfigurationKey } from '../../helper';
import { Steps } from './TourMessages';
import TourWrapper from "../common/Tour/TourWrapper"
import { useTranslation } from 'react-i18next'

function ManageLevelTabs(props) {
    const { onRef, permissionData } = props
    const [activeTab, setActiveTab] = useState('1')
    const { t } = useTranslation("User")


    const [state, setState] = useState({
        isEditFlag: false,
        isShowForm: false,
        isShowMappingForm: false,
        levelType: '',
        // isLoader: true,
        updateApi: false,
        cancelButton: false,
        approvalTypeId: '',
        levelValue: "",
        render: false
    });
    const { isEditFlag, isShowForm, isShowMappingForm, isOpen, TechnologyId } = state;
    /**
     * @method toggle
     * @description toggling the tabs
     */
    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab)
        }
    }
    const mappingToggler = () => {
        setState(prevState => ({ ...prevState, isShowMappingForm: true, isOpen: true, isShowForm: false, }));
    };
    /**
       * @method closeDrawer
       * @description  used to cancel filter form
       */
    const closeDrawer = (e = '', levelValue = "", update = false) => {
        setState(prevState => ({
            ...prevState, isOpen: false,
            isShowMappingForm: false,
            isShowForm: false,
            isEditFlag: false,
            updateApi: update,
            cancelButton: e === 'cancel' ? true : false,
            levelValue: levelValue,
            // isLoader: false, // Set loader state to true
        }));
        // toggle(levelValue)
    };

    /**
     * @method getLevelMappingDetail
     * @description confirm edit item
     */
    const getLevelMappingDetail = (Id, levelType, approvalTypeId) => {
        let obj = {}
        obj[levelType] = approvalTypeId
        setState(prevState => ({ ...prevState, isEditFlag: true, TechnologyId: Id, isOpen: true, isShowForm: false, isShowMappingForm: true, levelType: levelType, approvalTypeId: obj }));
    };

    return (
        <Fragment>
            <Row>
                <Row className="levellisting-page mt20">
                    {/* <Col md="6" className="text-right search-user-block mb-3">

                    </Col> */}
                    <Col md="6 d-flex">
                        <h2 className="manage-level-heading d-flex">{`Highest Level of Approvals`}
                            <div className="mt-0">
                            <TourWrapper
                                buttonSpecificProp={{
                                    id: "HightestLevel_Approval_ListingTour"
                                }}
                                stepsSpecificProp={{
                                    steps: Steps(t).HIGHTEST_LEVEL_APPROVAL
                                }} />
                                </div>
                        </h2>
                        {permissionData.Add && <Button id="levelTechnologyListing_add" className={"user-btn mr5 text-right search-user-block mb-5 HighestApproval_Add "} onClick={mappingToggler} title={"Add"} icon={"plus mr-0"} />}
                    </Col>
                </Row>
                <Col className="hidepage-size"  >

                    <Nav tabs className="subtabs mt-0 " >
                        <NavItem>
                            <NavLink
                                id="levelTechnologyListing_costing"
                                className={classnames({ active: activeTab === '1' })}
                                onClick={() => {
                                    toggle('1')
                                }}
                            >
                                Costing
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                id="levelTechnologyListing_simulation"
                                className={classnames({ active: activeTab === '2' })}
                                onClick={() => {
                                    toggle('2')
                                }}
                            >
                                Simulation
                            </NavLink>
                        </NavItem>
                        {getConfigurationKey().IsMasterApprovalAppliedConfigure && <NavItem>
                            <NavLink
                                id="levelTechnologyListing_master"
                                className={classnames({ active: activeTab === '3' })}
                                onClick={() => {
                                    toggle('3')
                                }}
                            >
                                Master
                            </NavLink>
                        </NavItem>}
                        {getConfigurationKey().IsShowOnboarding && <NavItem>
                            <NavLink
                                id="levelTechnologyListing_onboarding"
                                className={classnames({ active: activeTab === '4' })}
                                onClick={() => {
                                    toggle('4')
                                }}
                            >
                                Onboarding & Management
                            </NavLink>
                        </NavItem>}
                    </Nav>
                    {isOpen && (<Level toggle={toggle} isOpen={isOpen} isShowForm={isShowForm} isShowMappingForm={isShowMappingForm} closeDrawer={closeDrawer} isEditFlag={isEditFlag} TechnologyId={TechnologyId} anchor={'right'} isEditedlevelType={state.levelType} approvalTypeId={state.approvalTypeId} levelValue={state.level} activeTab={activeTab} />)}
                    <TabContent activeTab={activeTab}>
                        {activeTab === '1' && (
                            <TabPane tabId="1">
                                <CostingLevelListing
                                    onRef={onRef}
                                    getLevelMappingDetail={getLevelMappingDetail}
                                    levelValue={state.levelValue}
                                    mappingToggler={mappingToggler}
                                    updateApi={state.updateApi}
                                    cancelButton={state.cancelButton}
                                    activeTab={activeTab}
                                    closeDrawer={closeDrawer}
                                    tab={state.levelType}
                                />
                            </TabPane>
                        )}
                        {activeTab === '2' && (
                            <TabPane tabId="2">
                                <SimulationLevelListing
                                    onRef={onRef}
                                    getLevelMappingDetail={getLevelMappingDetail}
                                    levelValue={state.levelValue}
                                    mappingToggler={mappingToggler}
                                    updateApi={state.updateApi}
                                    cancelButton={state.cancelButton}
                                    closeDrawer={closeDrawer}
                                />
                            </TabPane>
                        )}
                        {activeTab === '3' && (
                            <TabPane tabId="3">
                                <MasterLevelListing
                                    onRef={onRef}
                                    getLevelMappingDetail={getLevelMappingDetail}
                                    levelValue={state.levelValue}
                                    mappingToggler={mappingToggler}
                                    updateApi={state.updateApi}
                                    cancelButton={state.cancelButton}
                                    closeDrawer={closeDrawer}
                                    tab={state.levelValue}
                                />
                            </TabPane>
                        )}
                        {activeTab === '4' && (
                            <TabPane tabId="4">
                                <OnboardingLevelListing
                                    onRef={onRef}
                                    getLevelMappingDetail={getLevelMappingDetail}
                                    levelValue={state.levelValue}
                                    mappingToggler={mappingToggler}
                                    updateApi={state.updateApi}
                                    cancelButton={state.cancelButton}
                                    closeDrawer={closeDrawer}
                                />
                            </TabPane>
                        )}
                    </TabContent>
                </Col>
            </Row>
        </Fragment >
    )
}
export default ManageLevelTabs
