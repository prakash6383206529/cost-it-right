import React, { useState, useContext, useEffect } from 'react';
import { connect, } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import TabRMCC from './TabRMCC';
import TabSurfaceTreatment from './TabSurfaceTreatment';
import TabOverheadProfit from './TabOverheadProfit';
import TabPackagingFreight from './TabPackagingFreight';
import TabDiscountOther from './TabDiscountOther';
import TabToolCost from './TabToolCost';
import { costingInfoContext } from '../CostingDetailStepTwo';
import BOMViewer from '../../../masters/part-master/BOMViewer';
import {
  saveComponentCostingRMCCTab, saveComponentOverheadProfitTab, setComponentOverheadItemData,
  saveCostingPackageFreightTab, setComponentPackageFreightItemData, saveToolTab, setComponentToolItemData,
  saveDiscountOtherCostTab, setComponentDiscountOtherItemData,
} from '../../actions/Costing';
import { checkForNull, loggedInUserId } from '../../../../helper';
import { LEVEL1 } from '../../../../helper/AllConastant';
import { ViewCostingContext } from '../CostingDetails';

function CostingHeaderTabs(props) {

  const dispatch = useDispatch()

  const { netPOPrice } = props;
  const [activeTab, setActiveTab] = useState('1');
  const [IsOpenViewHirarchy, setIsOpenViewHirarchy] = useState(false);
  const [IsCalledAPI, setIsCalledAPI] = useState(true);

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);

  const ComponentItemData = useSelector(state => state.costing.ComponentItemData)
  const ComponentItemOverheadData = useSelector(state => state.costing.ComponentItemOverheadData)
  const ComponentItemPackageFreightData = useSelector(state => state.costing.ComponentItemPackageFreightData)
  const ComponentItemToolData = useSelector(state => state.costing.ComponentItemToolData)
  const ComponentItemDiscountData = useSelector(state => state.costing.ComponentItemDiscountData)
  const IsIncludedSurfaceInOverheadProfit = useSelector(state => state.costing.IsIncludedSurfaceInOverheadProfit)

  useEffect(() => {

    // CALLED WHEN OTHER TAB CLICKED WITHOUT SAVING TO RMCC CURRENT TAB.
    if (!CostingViewMode && ComponentItemData !== undefined && ComponentItemData.IsOpen !== false && activeTab !== '1' && IsCalledAPI) {
      let requestData = {
        "NetRawMaterialsCost": ComponentItemData.CostingPartDetails.TotalRawMaterialsCost,
        "NetBoughtOutPartCost": ComponentItemData.CostingPartDetails.TotalBoughtOutPartCost,
        "NetConversionCost": ComponentItemData.CostingPartDetails.TotalConversionCost,
        "NetOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal : 0,
        "NetProcessCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal : 0,
        "NetToolsCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.ToolsCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.ToolsCostTotal : 0,
        "NetTotalRMBOPCC": ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost,
        "TotalCost": ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost,
        "LoggedInUserId": loggedInUserId(),

        "IsSubAssemblyComponentPart": costData.IsAssemblyPart,
        "CostingId": ComponentItemData.CostingId,
        "PartId": ComponentItemData.PartId,          //ROOT ID
        "CostingNumber": costData.CostingNumber,     //ROOT    
        "PartNumber": ComponentItemData.PartNumber,  //ROOT

        "AssemblyCostingId": ComponentItemData.BOMLevel === LEVEL1 ? costData.CostingId : ComponentItemData.AssemblyCostingId,                  //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyCostingNumber": ComponentItemData.BOMLevel === LEVEL1 ? costData.CostingNumber : ComponentItemData.AssemblyCostingNumber,      //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyPartId": ComponentItemData.BOMLevel === LEVEL1 ? ComponentItemData.PartId : ComponentItemData.AssemblyPartId,                  //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyPartNumber": ComponentItemData.BOMLevel === LEVEL1 ? ComponentItemData.PartNumber : ComponentItemData.AssemblyPartNumber,      //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID

        "PlantId": costData.PlantId,
        "VendorId": costData.VendorId,
        "VendorCode": costData.VendorCode,
        "VendorPlantId": costData.VendorPlantId,
        "TechnologyId": ComponentItemData.TechnologyId,
        "Technology": ComponentItemData.Technology,
        "TypeOfCosting": costData.VendorType,
        "PlantCode": costData.PlantCode,
        "Version": ComponentItemData.Version,
        "ShareOfBusinessPercent": ComponentItemData.ShareOfBusinessPercent,
        CostingPartDetails: ComponentItemData.CostingPartDetails,
      }
      dispatch(saveComponentCostingRMCCTab(requestData, res => {
        setIsCalledAPI(false)
        InjectDiscountAPICall()
      }))
    }

    // USED FOR OVERHEAD AND PROFIT WHEN CLICKED ON OTHER TABS WITHOUT SAVING
    if (!CostingViewMode && Object.keys(ComponentItemOverheadData).length > 0 && ComponentItemOverheadData.IsOpen !== false && activeTab !== '3') {
      let reqData = {
        "CostingId": ComponentItemOverheadData.CostingId,
        "IsIncludeSurfaceTreatmentWithOverheadAndProfit": IsIncludedSurfaceInOverheadProfit,
        "LoggedInUserId": loggedInUserId(),
        "IsSurfaceTreatmentApplicable": true,
        "IsApplicableForChildParts": false,
        "CostingNumber": costData.CostingNumber,
        "NetOverheadAndProfitCost": checkForNull(ComponentItemOverheadData.CostingPartDetails.OverheadCost) +
          checkForNull(ComponentItemOverheadData.CostingPartDetails.ProfitCost) +
          checkForNull(ComponentItemOverheadData.CostingPartDetails.RejectionCost) +
          checkForNull(ComponentItemOverheadData.CostingPartDetails.ICCCost) +
          checkForNull(ComponentItemOverheadData.CostingPartDetails.PaymentTermCost),
        "CostingPartDetails": ComponentItemOverheadData.CostingPartDetails
      }
      dispatch(saveComponentOverheadProfitTab(reqData, res => {
        dispatch(setComponentOverheadItemData({}, () => { }))
        InjectDiscountAPICall()
      }))
    }

    // USED FOR PACKAGE AND FREIGHT WHEN CLICKED ON OTHER TABS WITHOUT SAVING
    if (!CostingViewMode && Object.keys(ComponentItemPackageFreightData).length > 0 && ComponentItemPackageFreightData.IsChanged === true && activeTab !== '4') {
      const data = {
        "CostingId": costData.CostingId,
        "PartId": costData.PartId,
        "PartNumber": costData.PartNumber,
        "NetPOPrice": props.netPOPrice,
        "LoggedInUserId": loggedInUserId(),
        "CostingNumber": costData.CostingNumber,
        "NetPackagingAndFreight": ComponentItemPackageFreightData.NetPackagingAndFreight,
        "CostingPartDetails": ComponentItemPackageFreightData.CostingPartDetails
      }
      dispatch(saveCostingPackageFreightTab(data, res => {
        dispatch(setComponentPackageFreightItemData({}, () => { }))
        InjectDiscountAPICall()
      }))
    }

    // USED FOR TOOL TAB WHEN CLICKED ON OTHER TABS WITHOUT SAVING
    if (!CostingViewMode && Object.keys(ComponentItemToolData).length > 0 && ComponentItemToolData.IsChanged === true && activeTab !== '5') {
      const data = {
        "IsToolCostProcessWise": false,
        "CostingId": costData.CostingId,
        "PartId": costData.PartId,
        "LoggedInUserId": loggedInUserId(),
        "CostingNumber": costData.CostingNumber,
        "ToolCost": ComponentItemToolData.TotalToolCost,
        "CostingPartDetails": ComponentItemToolData.CostingPartDetails
      }
      dispatch(saveToolTab(data, res => {
        dispatch(setComponentToolItemData({}, () => { }))
        InjectDiscountAPICall()
      }))
    }

    // USED FOR SAVE OTHER DISCOUNT WHEN CLICKED ON OTHER TABS WITHOUT SAVING
    InjectDiscountAPICall()

  }, [activeTab])

  const InjectDiscountAPICall = () => {
    if (!CostingViewMode && Object.keys(ComponentItemDiscountData).length > 0 && ComponentItemDiscountData.IsChanged === true && activeTab !== '6') {
      dispatch(saveDiscountOtherCostTab(ComponentItemDiscountData, res => {
        dispatch(setComponentDiscountOtherItemData({}, () => { }))
      }))
    }
  }

  /**
  * @method toggle
  * @description toggling the tabs
  */
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);

      if (tab === '1') {
        setIsCalledAPI(true)
      }

    }
  }

  /**
* @method closeVisualDrawer
* @description CLOSE VISUAL AD DRAWER
*/
  const closeVisualDrawer = () => {
    setIsOpenViewHirarchy(false)
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">

        {costData.IsAssemblyPart &&
          <div className="text-right w-100">
            <button
              type="button"
              onClick={() => setIsOpenViewHirarchy(true)}
              class="btn-primary btn btn-lg mt-2">
              <img src={require("../../../../assests/images/hirarchy-icon.svg")} alt="hirarchy-icon.jpg" />
              <span>View BOM</span>
            </button>
          </div>}

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
                backBtn={props.backBtn}
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
              <TabToolCost
                netPOPrice={netPOPrice}
                activeTab={activeTab}
                setHeaderCost={props.setHeaderCostToolTab}
              />
            </TabPane>
            <TabPane tabId="6">
              <TabDiscountOther
                netPOPrice={netPOPrice}
                activeTab={activeTab}
                setHeaderCost={props.setHeaderDiscountTab}
                DiscountTabData={props.DiscountTabData}
                toggle={props.toggle}
              />
            </TabPane>
          </TabContent>
        </div>
      </div >
      {IsOpenViewHirarchy && <BOMViewer
        isOpen={IsOpenViewHirarchy}
        closeDrawer={closeVisualDrawer}
        isEditFlag={true}
        PartId={costData.PartId}
        anchor={'right'}
        isFromVishualAd={true}
        NewAddedLevelOneChilds={[]}
      />}
    </ >
  );
}

//export default connect()(CostingHeaderTabs);
const CostingHeads = connect()(CostingHeaderTabs);
export default CostingHeads;