import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSurfaceTreatmentTabData, } from '../../../actions/Costing';
import { costingInfoContext, IsNFRContext } from '../../CostingDetailStepTwo';
import SurfaceTreatment from '.';
import { checkForDecimalAndNull } from '../../../../../helper';
import { ViewCostingContext } from '../../CostingDetails';
import { EMPTY_GUID } from '../../../../../config/constants';

function PartSurfaceTreatment(props) {

  const { item, index } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);
  const [IsDrawerOpen, setDrawerOpen] = useState(false)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const isDisable = useContext(IsNFRContext)
  const dispatch = useDispatch()

  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const toggle = (BOMLevel, PartNumber) => {
    setIsOpen(!IsOpen)
    setCount(Count + 1)
    const Params = {
      index: props.index,
      BOMLevel: BOMLevel,
      PartNumber: PartNumber,
    }
    setTimeout(() => {
      if (Object.keys(costData).length > 0) {
        const data = {
          CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
          PartId: item.PartId,
          AssemCostingId: item.AssemblyCostingId,
          SubAsmCostingId: (props.subAssembId !== null && props.subAssembId !== undefined) ? props.subAssembId : item?.SubAssemblyCostingId,
          isComponentCosting: costData?.PartType === "Component" ? true : false
        }
        dispatch(getSurfaceTreatmentTabData(data, false, (res) => {
          if (res && res.data && res.data.Result) {
            let Data = res.data.DataList[0]?.CostingPartDetails;
            DrawerToggle()
            props.setPartDetails(Params, Data, item)
          }
        }))
      }
    }, 500)
  }

  /**
* @method DrawerToggle
* @description TOGGLE DRAWER
*/
  const DrawerToggle = () => {
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    setDrawerOpen(false)
    item.CostingPartDetails.SurfaceTreatmentDetails = []
    item.CostingPartDetails.TransportationDetails = []
  }
  // 


  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>
      <tr>
        <div className="accordian-row" style={{ display: 'contents' }}>
          <td>
            <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
              {item && item.PartNumber}
            </span>
          </td>
          <td>{item && item.BOMLevel}</td>
          <td>{item && item.PartType}</td>
          <td>{item?.CostingPartDetails?.SurfaceTreatmentCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.SurfaceTreatmentCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
          <td>{item?.CostingPartDetails?.HangerCostPerPart !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.HangerCostPerPart, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
          <td>{item?.CostingPartDetails?.TotalPaintCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalPaintCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
          <td>{item?.CostingPartDetails?.TransportationCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TransportationCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
          <td>{item?.Quantity}</td>
          <td>{item?.CostingPartDetails?.NetSurfaceTreatmentCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.NetSurfaceTreatmentCost * item.Quantity, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
        </div>
        <td width={"0"}>
          <div className='d-flex justify-content-end align-items-center'>
            {!CostingViewMode && !isDisable && (item?.CostingPartDetails?.NetSurfaceTreatmentCost !== 0) ?

              <button
                type="button"
                id="costing_surface_treatment_btn"
                className={'user-btn surface-treatment-btn'}
                //onClick={DrawerToggle}
                onClick={() => toggle(item.BOMLevel, item.PartNumber)}
              >
                <div className={'fa fa-eye pr-1'}></div> Surface T.</button>
              :
              <button
                type="button"
                id="costing_surface_treatment_btn"
                className={'user-btn surface-treatment-btn'}
                //onClick={DrawerToggle}
                onClick={() => toggle(item.BOMLevel, item.PartNumber)}
              >
                <div className={`${(CostingViewMode || IsLocked || isDisable) ? 'fa fa-eye pr-1' : 'plus'}`}></div>Surface T.</button>
            }
            <div /* id="lock_icon"  */ className={`lock-width ${(item.IsLocked || item.IsPartLocked) ? 'lock_icon tooltip-n' : ''}`}>{(item.IsLocked || item.IsPartLocked) && <span class="tooltiptext">{`${item.IsLocked ? "Child parts costing are coming from individual costing, please edit there if want to change costing" : "This part is already present at multiple level in this BOM. Please go to the lowest level to enter the data."}`}</span>}</div>
          </div>
        </td>
        {/*WHEN COSTING OF THAT PART IS  APPROVED SO COSTING COMES AUTOMATICALLY FROM BACKEND AND THIS KEY WILL COME TRUE (WORK LIKE VIEW MODE)*/}
      </tr>

      {IsDrawerOpen && <SurfaceTreatment
        isOpen={IsDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        item={item}
        surfaceData={item?.CostingPartDetails?.SurfaceTreatmentDetails}
        transportationData={item?.CostingPartDetails?.TransportationDetails}
        setSurfaceCost={props.setSurfaceCost}
        setTransportationCost={props.setTransportationCost}
        IsAssemblyCalculation={props.IsAssemblyCalculation}
        setAssemblySurfaceCost={props.setAssemblySurfaceCost}
        setAssemblyTransportationCost={props.setAssemblyTransportationCost}
        setSurfaceTreatmentCostAssemblyTechnology={props.setSurfaceTreatmentCostAssemblyTechnology}
        index={index}
      />}

    </ >
  );
}

export default PartSurfaceTreatment
