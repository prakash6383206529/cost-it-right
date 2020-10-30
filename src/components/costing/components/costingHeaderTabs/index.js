import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import TabRMCC from './TabRMCC';

function CostingHeaderTabs(props) {

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

  const dispatch = useDispatch();

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Nav tabs className="subtabs">
            <NavItem>
              <NavLink className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                RM + CC
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                Surface Treatment
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('3'); }}>
                Overheads & Profits
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('4'); }}>
                Tool Cost
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('5'); }}>
                Discount & Other Cost
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            {activeTab === '1' &&
              <TabPane tabId="1">
                <TabRMCC costData={props.costData} />
              </TabPane>}
            {activeTab === '2' &&
              <TabPane tabId="2">
                {'Surface Treatment'}
              </TabPane>}
            {activeTab === '3' &&
              <TabPane tabId="3">
                {'Overheads & Profit'}
              </TabPane>}
            {activeTab === '4' &&
              <TabPane tabId="4">
                {'Tool Cost'}
              </TabPane>}
            {activeTab === '5' &&
              <TabPane tabId="5">
                {'Discount & Other Cost'}
              </TabPane>}
          </TabContent>
        </div>
      </div >
    </ >
  );
}

//export default connect()(CostingHeaderTabs);
const CostingHeads = connect()(CostingHeaderTabs);
export default CostingHeads;