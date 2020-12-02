import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import TabRMCC from './TabRMCC';
import TabSurfaceTreatment from './TabSurfaceTreatment';
import TabOverheadProfit from './TabOverheadProfit';
import TabPackagingFreight from './TabPackagingFreight';
import TabDiscountOther from './TabDiscountOther';
import TabToolCost from './TabToolCost';

function CostingHeaderTabs(props) {

  const { netPOPrice } = props;
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
          <Nav tabs className="subtabs cr-subtabs-head">
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
              <NavLink className={classnames({ active: activeTab === '4' })} onClick={() => { toggle('4'); }}>
                Packaging & Freight
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: activeTab === '5' })} onClick={() => { toggle('5'); }}>
                Tool Cost
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: activeTab === '6' })} onClick={() => { toggle('6'); }}>
                Discount & Other Cost
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <TabRMCC
                netPOPrice={netPOPrice}
                setHeaderCost={props.setHeaderCost}
                activeTab={activeTab}
              />
            </TabPane>
            <TabPane tabId="2">
              <TabSurfaceTreatment
                netPOPrice={netPOPrice}
                setHeaderCost={props.setHeaderCostSurfaceTab}
                activeTab={activeTab}
              />
            </TabPane>
            <TabPane tabId="3">
              <TabOverheadProfit
                netPOPrice={netPOPrice}
                activeTab={activeTab}
                setHeaderCost={props.setHeaderOverheadProfitCostTab}
                headCostRMCCBOPData={props.headCostRMCCBOPData}
              />
            </TabPane>
            <TabPane tabId="4">
              <TabPackagingFreight
                netPOPrice={netPOPrice}
                activeTab={activeTab}
                setHeaderCost={props.setHeaderPackageFreightTab}
              />
            </TabPane>
            <TabPane tabId="5">
              <TabToolCost />
            </TabPane>
            <TabPane tabId="6">
              <TabDiscountOther
                netPOPrice={netPOPrice}
              />
            </TabPane>
          </TabContent>
        </div>
      </div >
    </ >
  );
}

//export default connect()(CostingHeaderTabs);
const CostingHeads = connect()(CostingHeaderTabs);
export default CostingHeads;