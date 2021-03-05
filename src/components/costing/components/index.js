import React, { useState, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import CostingDetails from './CostingDetails';
import CostingSummaryTable from './CostingSummaryTable';
import CostingSummary from './CostingSummary';
import { storePartNumber } from '../actions/Costing';

function Costing(props) {

  const [activeTab, setActiveTab] = useState('1');
  const partNumber = useSelector(state => state.costing.partNo);

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
  }, [])

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
              <CostingDetails />
            </TabPane>
            {/* )} */}
            {/* {activeTab === "2" && ( */}
            <TabPane tabId="2">
              <CostingSummary />
              {
                // <CostingSummaryTable />
              }
              {partNumber !== "" && <CostingSummaryTable />}
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