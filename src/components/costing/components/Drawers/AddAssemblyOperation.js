import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { costingInfoContext } from '../CostingDetailStepTwo';
import Drawer from '@material-ui/core/Drawer';
import Switch from "react-switch";
import { saveAssemblyCostingRMCCTab } from '../../actions/Costing';
import OperationCost from '../CostingHeadCosts/Part/OperationCost';
import ToolCost from '../CostingHeadCosts/Part/ToolCost';
import { loggedInUserId, checkForDecimalAndNull } from '../../../../helper';

function AddAssemblyOperation(props) {
  const { item, } = props;

  const [IsOpenTool, setIsOpenTool] = useState(false);

  const dispatch = useDispatch()

  const { CostingEffectiveDate } = useSelector(state => state.costing)

  const costData = useContext(costingInfoContext)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  /**
  * @method toggleDrawer
  * @description TOGGLE DRAWER
  */
  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('')
  };

  /**
* @method onToolToggle
* @description TOOL COST TOGGLE
*/
  const onToolToggle = () => {
    setIsOpenTool(!IsOpenTool)
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer()
  }

  const onSubmit = data => {
    toggleDrawer('')
  }


  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = () => {
    let requestData = {
      "CostingId": item.CostingId,
      "CostingNumber": item.CostingNumber,
      "CostingDetailId": "00000000-0000-0000-0000-000000000000",
      "PartId": item.PartId,
      "PartNumber": item.PartNumber,
      "PartTypeId": item.PartTypeId,
      "Type": item.PartType,

      "PlantId": costData.PlantId,
      "VendorId": costData.VendorId,
      "VendorCode": costData.VendorCode,
      "VendorPlantId": costData.VendorPlantId,
      "TechnologyName": item.Technology,
      "TechnologyId": item.TechnologyId,
      "TypeOfCosting": costData.VendorType,
      "PlantCode": costData.PlantCode,
      "PlantName": costData.PlantName,
      "Version": item.Version,
      "ShareOfBusinessPercent": item.ShareOfBusinessPercent,

      "NetRawMaterialsCost": item.CostingPartDetails.TotalRawMaterialsCost,
      "NetBoughtOutPartCost": item.CostingPartDetails.TotalBoughtOutPartCost,
      "NetConversionCost": item.CostingPartDetails.TotalConversionCost,
      "TotalProcessCost": item.CostingPartDetails.TotalProcessCost,
      "TotalOperationCost": item.CostingPartDetails.TotalOperationCost,
      "NetTotalRMBOPCC": item.CostingPartDetails.TotalCalculatedRMBOPCCCost,
      "TotalCost": item.CostingPartDetails.TotalCalculatedRMBOPCCCost,
      "LoggedInUserId": loggedInUserId(),
      "EffectiveDate": CostingEffectiveDate,

      "IsSubAssemblyComponentPart": costData.IsAssemblyPart,
      "NetOperationCostPerAssembly": item.CostingPartDetails.TotalOperationCostPerAssembly,
      "NetToolCostPerAssembly": item.CostingPartDetails.TotalToolCostPerAssembly,
      "CostingPartDetails": {
        "CostingId": item.CostingId,
        "CostingNumber": item.CostingNumber,
        "CostingDetailId": "00000000-0000-0000-0000-000000000000",
        "PartId": item.PartId,
        "PartNumber": item.PartNumber,
        "PartName": item.PartName,
        "PartTypeId": item.PartTypeId,
        "Type": item.PartType,

        "TotalRawMaterialsCost": item.CostingPartDetails.TotalRawMaterialsCost,
        "TotalBoughtOutPartCost": item.CostingPartDetails.TotalBoughtOutPartCost,
        "TotalConversionCost": item.CostingPartDetails.TotalConversionCost,
        "TotalCalculatedRMBOPCCCost": item.CostingPartDetails.TotalCalculatedRMBOPCCCost,

        "TotalRawMaterialsCostWithQuantity": item.CostingPartDetails.TotalRawMaterialsCostWithQuantity,
        "TotalBoughtOutPartCostWithQuantity": item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity,
        "TotalConversionCostWithQuantity": item.CostingPartDetails.TotalConversionCostWithQuantity,
        "TotalCalculatedRMBOPCCCostWithQuantity": item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity,

        "Quantity": item.CostingPartDetails.Quantity,
        "IsOpen": true,
        "IsShowToolCost": item.CostingPartDetails.IsShowToolCost === null ? true : true,
        "TotalOperationCostPerAssembly": item.CostingPartDetails.TotalOperationCostPerAssembly,
        "TotalToolCostPerAssembly": item.CostingPartDetails.TotalToolCostPerAssembly,
        "AssemblyCostingOperationCostRequest": item.CostingPartDetails.CostingOperationCostResponse,
        "AssemblyCostingToolsCostRequest": item.CostingPartDetails.CostingToolCostResponse,
      }
    }

    dispatch(saveAssemblyCostingRMCCTab(requestData, res => {
      props.closeDrawer('')
    }))
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer className="bottom-drawer" anchor='bottom' open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <div className="container-fluid add-operation-drawer">
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading sticky-top-0">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Add Assembly Operation Cost'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <Row className="mb-3 pt-3">
              <Col>
                <div className="user-page p-0">
                  <div className="cr-process-costwrap">
                    <Row className="cr-innertool-cost">

                      <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.TotalOperationCostPerAssembly !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalOperationCostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
                      {/* <Col md="3" className="cr-costlabel text-center"><span className="d-inline-block align-middle">{`Tool Cost: ${item.CostingPartDetails && item.CostingPartDetails.TotalToolCostPerAssembly !== null ? item.CostingPartDetails.TotalToolCostPerAssembly : 0}`}</span></Col> */}
                      <Col md="3" className="cr-costlabel text-center"><span className="d-inline-block align-middle">{``}</span></Col>
                      <Col md="3" className="cr-costlabel text-center"><span className="d-inline-block align-middle">{`Net Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.GrandTotalCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalOperationCostPerAssembly + item.CostingPartDetails.TotalToolCostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>

                      <Col md="3" className="switch cr-costlabel text-right">
                        {/* <label className="switch-level d-inline-flex w-auto mb-0">
                          <div className={'left-title'}>{''}</div>
                          <Switch
                            onChange={onToolToggle}
                            checked={IsOpenTool}
                            id="normal-switch"
                            disabled={false}
                            background="#4DC771"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#CCC"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={20}
                            width={46}
                          />
                          <div className={'right-title'}>Show Tool Cost</div>
                        </label> */}
                      </Col>
                    </Row>


                    <OperationCost
                      data={item.CostingPartDetails !== undefined ? item.CostingPartDetails.CostingOperationCostResponse : []}
                      setAssemblyOperationCost={props.setAssemblyOperationCost}
                      item={props.item}
                      IsAssemblyCalculation={true}
                    />


                    {IsOpenTool && <>
                      <div className="pt-2"></div>
                      <ToolCost
                        data={item.CostingPartDetails !== undefined ? item.CostingPartDetails.CostingToolCostResponse : []}
                        setAssemblyToolCost={props.setAssemblyToolCost}
                        item={props.item}
                        IsAssemblyCalculation={true}
                      /></>}

                  </div>
                </div>
              </Col>
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right">
                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cancel-icon'}></div> {'Cancel'}
                </button>
                <button
                  type={'button'}
                  className="submit-button mr15 save-btn"
                  onClick={saveData} >
                  <div className={'save-icon'}></div>
                  {'SAVE'}
                </button>
              </div>
            </Row>

          </div>
        </div>
      </Drawer>
    </div>
  );
}

//export default React.memo(AddAssemblyOperation);
export default AddAssemblyOperation;