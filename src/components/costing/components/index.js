import React, { useState, useEffect } from 'react';
import { connect, useDispatch, } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import CostingDetails from './CostingDetails';
import CostingSummary from './CostingSummary';
import { isDataChange, saveAssemblyNumber, saveBOMLevel, savePartNumber, setComponentDiscountOtherItemData, setCurrencySource, setDiscountErrors, setExchangeRateSourceValue, setIsBreakupBoughtOutPartCostingFromAPI, setOtherCostData, setOtherDiscountData, setOverheadProfitData, setOverheadProfitErrors, setPartNumberArrayAPICALL, setProcessGroupGrid, setRMCCErrors, setToolsErrors, storePartNumber } from '../actions/Costing';
import { reactLocalStorage } from 'reactjs-localstorage';
import { useHistory } from "react-router-dom";
import ApprovalListing from './approval/ApprovalListing';



function Costing(props) {

  let history = useHistory();
  const [activeTab, setActiveTab] = useState('1');
  const [partInfoStepTwo, setPartInfo] = useState(props?.location?.state?.isNFR ? props?.location?.state?.partInfoStepTwo : {});
  const [costingData, setCostingData] = useState(props?.location?.state?.isNFR ? props?.location?.state?.costingData : {});
  const [costingOptionsSelect, setCostingOptionsSelect] = useState({});

  /**
  * @method toggle
  * @description toggling the tabs
  */
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
    dispatch(setIsBreakupBoughtOutPartCostingFromAPI(false))
    dispatch(isDataChange(false))
    dispatch(setPartNumberArrayAPICALL([]))
    dispatch(savePartNumber(''))
    dispatch(saveBOMLevel(''))
    dispatch(saveAssemblyNumber([]))
    dispatch(setOverheadProfitData([], () => { }))
    dispatch(setRMCCErrors({}))
    dispatch(setOverheadProfitErrors({}))
    dispatch(setToolsErrors({}))
    dispatch(setDiscountErrors({}))
    dispatch(setComponentDiscountOtherItemData({}, () => { }))
    dispatch(setOtherCostData({ gridData: [], otherCostTotal: 0 }))
    dispatch(setOtherDiscountData({ gridData: [], totalCost: 0 }))
    dispatch(setCurrencySource(''))
    dispatch(setExchangeRateSourceValue(''))
  }

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(storePartNumber(''))
    if (reactLocalStorage.get('location') === '/costing-summary') {
      toggle("2");
    }
    else if (reactLocalStorage.get('location') === '/approval-listing') {
      toggle("3");
    }
    else {
      toggle("1");
    }
  }, [])

  const showDetail = (partInfo, costingInfo) => {
    setPartInfo(partInfo)
    setCostingData(costingInfo)
    if (costingInfo && Object.keys(costingInfo).length > 0) {
      // history.push('/costing')
      setTimeout(() => {

        toggle("1");
      }, 200);
    }


  }


  const setcostingOptionsSelectFromSummary = (value) => {
    let obj = {
      SubAssemblyCostingId: value?.SubAssemblyCostingId,
      AssemblyCostingId: value?.AssemblyCostingId
    }
    setCostingOptionsSelect(obj)
    dispatch(isDataChange(false))
    dispatch(setProcessGroupGrid([]))
    dispatch(savePartNumber(''))
    dispatch(saveBOMLevel(''))
    dispatch(setPartNumberArrayAPICALL([]))
    dispatch(saveAssemblyNumber([]))
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page container-fluid costing-main-container">
        {/* {this.props.loading && <Loader/>} */}
        <div>
          <Nav tabs className="subtabs mt-0">
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "1" })}
                onClick={() => {
                  toggle("1");
                  history.push("/costing");
                }}
              >
                Costing Details
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "2" })}
                onClick={() => {
                  toggle("2");
                  history.push("/costing-summary");
                }}
              >
                Costing Summary
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "3" })}
                onClick={() => {
                  toggle("3");
                  history.push("/approval-listing");
                }}
              >
                Approval Status
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            {activeTab === "1" && <TabPane tabId="1">
              <CostingDetails
                partInfoStepTwo={partInfoStepTwo}
                costingData={costingData}
                toggle={toggle}
                costingOptionsSelect={costingOptionsSelect}
                nfrData={props?.location?.state}
                isRFQViewMode={props?.location?.state?.isViewMode}
                isNFR={props?.location?.state?.isNFR}
                isViewModeCosting={props?.location?.state?.isViewMode}
              />
            </TabPane>}
            {activeTab === "2" && <TabPane tabId="2">
              <CostingSummary activeTab={activeTab} showDetail={showDetail} setcostingOptionsSelectFromSummary={setcostingOptionsSelectFromSummary} />
            </TabPane>}
            {activeTab === "3" && <TabPane tabId="3">
              <ApprovalListing activeTab={activeTab} />
            </TabPane>}
          </TabContent>
        </div>
      </div>
    </>
  );
}

const CostingForm = connect()(Costing);
export default CostingForm;