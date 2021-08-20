import React, { useState, useEffect } from 'react';
import { connect, useDispatch, } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import CostingDetails from './CostingDetails';
import CostingSummary from './CostingSummary';
import { storePartNumber } from '../actions/Costing';
import { reactLocalStorage } from 'reactjs-localstorage';
import { useHistory } from "react-router-dom";

function Costing(props) {

  let history = useHistory();
  const [activeTab, setActiveTab] = useState('1');
  const [partInfoStepTwo, setPartInfo] = useState({});
  const [costingData, setCostingData] = useState({});

  /**
  * @method toggle
  * @description toggling the tabs
  */
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  }

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(storePartNumber(''))
    if (reactLocalStorage.get('location') === '/costing-summary') {
      toggle("2");
    } else {
      toggle("1");
    }
  }, [])

  const showDetail = (partInfo, costingInfo) => {
    setPartInfo(partInfo)
    setCostingData(costingInfo)
    toggle("1");
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page container-fluid">
        {/* {this.props.loading && <Loader/>} */}
        <div>
          <h1>Costing</h1>
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
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <CostingDetails
                partInfoStepTwo={partInfoStepTwo}
                costingData={costingData}
                toggle={toggle}
              />
            </TabPane>
            <TabPane tabId="2">
              <CostingSummary activeTab={activeTab} showDetail={showDetail} />
            </TabPane>
          </TabContent>
        </div>
      </div>
    </>
  );
}

const CostingForm = connect()(Costing);
export default CostingForm;