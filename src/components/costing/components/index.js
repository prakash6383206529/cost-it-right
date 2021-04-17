import React, { useState, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import CostingDetails from './CostingDetails';
import CostingSummaryTable from './CostingSummaryTable';
import CostingSummary from './CostingSummary';
import { storePartNumber } from '../actions/Costing';
import { reactLocalStorage } from 'reactjs-localstorage';
import { useHistory } from "react-router-dom";

function Costing(props) {

  let history = useHistory();
  const [activeTab, setActiveTab] = useState('1');
  const [hideRow, setHideRow] = useState(false)
  const [partInfoStepTwo, setPartInfo] = useState({});
  const [costingData, setCostingData] = useState({});
  const partNumber = useSelector(state => state.costing.partNo);

  /**
  * @method toggle
  * @description toggling the tabs
  */
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      // history.push('/costing')
    }
  }

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(storePartNumber(''))
    if (reactLocalStorage.get('location') === '/costing-summary') {
      //setActiveTab("2")
      toggle("2");
    } else {
      //setActiveTab("1")
      toggle("1");
    }
  }, [])

  const showDetail = (partInfo, costingInfo) => {
    setPartInfo(partInfo)
    setCostingData(costingInfo)
    toggle("1");
    // history.push("/costing");
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
            {/* <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "3" })}
                  onClick={() => {
                    toggle("3");
                  }}
                >
                  Insights
                </NavLink>
              </NavItem> */}
          </Nav>
          <TabContent activeTab={activeTab}>
            {/* {activeTab === "1" && ( */}
            <TabPane tabId="1">
              <CostingDetails
                partInfoStepTwo={partInfoStepTwo}
                costingData={costingData}
                toggle={toggle}
              />
            </TabPane>
            {/* )} */}
            {/* {activeTab === "2" && ( */}
            <TabPane tabId="2">
              <CostingSummary activeTab={activeTab} showDetail={showDetail} />
              {
                // <CostingSummaryTable />
              }
              {/* {partNumber !== "" && <CostingSummaryTable hideUpperRow={(value) => hideUpperRow(value)} />} */}
            </TabPane>
            {/* )} */}
            {/* {activeTab === "3" && <TabPane tabId="3">{"Insights"}</TabPane>} */}
          </TabContent>
        </div>
      </div>
    </>
  );
}

const CostingForm = connect()(Costing);
export default CostingForm;