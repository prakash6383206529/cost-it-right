import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { getSurfaceTreatmentTabData } from '../../../actions/Costing';
import { checkForDecimalAndNull, checkForNull, } from '../../../../../helper';
import PartSurfaceTreatment from './PartSurfaceTreatment';
import SurfaceTreatment from '.';
import { SelectedCostingDetail, ViewCostingContext } from '../../CostingDetails';
import _ from 'lodash'
import { EMPTY_GUID } from '../../../../../config/constants';

function AssemblySurfaceTreatment(props) {

  const { children, item, index } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);
  const [IsDrawerOpen, setDrawerOpen] = useState(false)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const selectedCostingDetail = useContext(SelectedCostingDetail);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const dispatch = useDispatch()

  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  const toggle = (BOMLevel, PartNumber, IsCollapse) => {

    setIsOpen(!IsOpen)
    setCount(Count + 1)
    const Params = {
      index: props.index,
      BOMLevel: BOMLevel,
      PartNumber: PartNumber,
      IsCollapse
    }
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
        AssemCostingId: item.AssemblyCostingId,
        SubAsmCostingId: (props.subAssembId !== null && props.subAssembId !== undefined) ? props.subAssembId : item?.SubAssemblyCostingId,
        isComponentCosting: costData?.PartType === "Component" ? true : false
      }
      dispatch(getSurfaceTreatmentTabData(data, false, (res) => { // TODO TO CHECK TRUE CONVERTED TO FALSE

        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0];
          const ChangedLevel = parseInt(BOMLevel.substr(1, BOMLevel.length - 1)) + 1;
          // props.toggleAssembly(Params, Data)
          let array = [];
          array = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))
          Data.CostingChildPartDetails && Data.CostingChildPartDetails.map(item => {
            item.BOMLevel = "L" + ChangedLevel;
            array.push(item)
            return null
          })
          let uniqueArary = _.uniqBy(array, v => JSON.stringify([v.PartNumber, v.AssemblyPartNumber]))
          sessionStorage.setItem('surfaceCostingArray', JSON.stringify(_.cloneDeep(uniqueArary)));
          props.toggleAssembly(Params, _.cloneDeep(Data))

          if (IsCollapse === false) {
            DrawerToggle()
          }
        }
      }))
    } else {
      props.toggleAssembly(Params)
    }
  }

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {

    // if (item.IsOpen === false) {
    toggle(item.BOMLevel, item.PartNumber, true)
    // }

    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    setDrawerOpen(false)
  }

  const nestedPartComponent = children && children.map(el => {
    if (el.PartType === 'Part') {
      return <PartSurfaceTreatment
        index={index}
        item={el}
        setPartDetails={props.setPartDetails}
        setSurfaceCost={props.setSurfaceCost}
        setTransportationCost={props.setTransportationCost}
        setAssemblySurfaceCost={props.setAssemblySurfaceCost}
        setAssemblyTransportationCost={props.setAssemblyTransportationCost}
        IsAssemblyCalculation={true}
      // subAssembId={item?.SubAssemblyCostingId}
      />
    }
    return null
  })

  const nestedAssembly = children && children.map(el => {
    if (el.PartType !== 'Sub Assembly') return false;
    return <AssemblySurfaceTreatment
      index={index}
      item={el}
      children={el.CostingChildPartDetails}
      toggleAssembly={props.toggleAssembly}
      setPartDetails={props.setPartDetails}
      setSurfaceCost={props.setSurfaceCost}
      setTransportationCost={props.setTransportationCost}
      setAssemblySurfaceCost={props.setAssemblySurfaceCost}
      setAssemblyTransportationCost={props.setAssemblyTransportationCost}
      IsAssemblyCalculation={true}
    // subAssembId={item?.SubAssemblyCostingId}
    />
  })


  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr>
        <div className="accordian-row" style={{ display: 'contents' }}
        >
          <td className='part-overflow'
            onClick={() => { toggle(item.BOMLevel, item.PartNumber, true) }} // UNCOMMENT IT WHEN CHILD PART SURFACE TREATMENT START 
          >
            <span className={`part-name ${item && item.BOMLevel}`} title={item && item.PartNumber}>
              {item && item.PartNumber}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
            </span>
          </td>
          <td>{item && item.BOMLevel}</td>
          <td>{item && item.PartType}</td>
          <td>{item?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice) : 0}
            {
              item?.CostingPartDetails && (item?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity !== null && item?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity !== 0) ?
                <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon st-tooltip"></i>
                  <span class="tooltiptext text-right">
                    {`Assembly's Surface Treatment Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly, initialConfiguration?.NoOfDecimalForPrice)}`}
                    <br></br>
                    {`Sub Assembly's Surface Treatment Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly, initialConfiguration?.NoOfDecimalForPrice)}`}
                    <br></br>
                    {`Child Parts Surface Treatment Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent, initialConfiguration?.NoOfDecimalForPrice)}`}
                  </span>
                </div> : ''
            }
          </td>
          <td>{item?.CostingPartDetails?.HangerCostPerPartWithQuantity !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.HangerCostPerPartWithQuantity, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
          <td>{item?.CostingPartDetails?.TotalPaintCostWithQuantity !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalPaintCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
          <td>{item?.CostingPartDetails?.TotalTransportationCostWithQuantity !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalTransportationCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice) : 0}
            {
              item?.CostingPartDetails && (item?.CostingPartDetails?.TotalTransportationCostWithQuantity !== null && item?.CostingPartDetails?.TotalTransportationCostWithQuantity !== 0) ?
                <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                  <span class="tooltiptext max225">
                    {`Assembly's Extra Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.TotalTransportationCostPerAssembly, initialConfiguration?.NoOfDecimalForPrice)}`}
                    <br></br>
                    {`Sub Assembly's Extra Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.TotalTransportationCostPerSubAssembly, initialConfiguration?.NoOfDecimalForPrice)}`}
                    <br></br>
                    {`Child Parts Extra Cost:- ${checkForDecimalAndNull(item?.CostingPartDetails?.TotalTransportationCostComponent, initialConfiguration?.NoOfDecimalForPrice)}`}
                  </span>
                </div> : ''
            }
          </td>
          <td>{checkForNull(item?.Quantity)}</td>
          <td>
            {item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys, initialConfiguration?.NoOfDecimalForPrice) : 0}
          </td>
        </div>
        <td>
          <div className='d-flex align-items-center justify-content-end'>
            {!CostingViewMode && (item?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly !== 0 || item?.CostingPartDetails?.TotalTransportationCostPerAssembly !== 0) ?
              <button
                id="costing_surface_treatment_btn"
                type="button"
                className={'user-btn surface-treatment-btn'}
                //onClick={DrawerToggle}
                onClick={() => {
                  //toggle(item.BOMLevel, item.PartNumber, false)
                  DrawerToggle()
                }}
              >
                <div className={'fa fa-eye pr-1'}></div>Surface T.</button>
              :

              <button
                type="button"
                id="costing_surface_treatment_btn"
                className={'user-btn surface-treatment-btn'}
                //onClick={DrawerToggle}
                onClick={() => {
                  //  toggle(item.BOMLevel, item.PartNumber, false)
                  DrawerToggle()
                }}
              >
                <div className={`${(CostingViewMode || IsLocked) ? 'fa fa-eye pr-1' : 'plus'}`}></div> Surface T.</button>
            }
            <div /* id="lock_icon"  */ className={`lock-width ${(item.IsLocked || item.IsPartLocked) ? 'lock_icon tooltip-n' : ''}`}>{(item.IsLocked || item.IsPartLocked) && <span class="tooltiptext">{`${item.IsLocked ? "Child parts costing are coming from individual costing, please edit there if want to change costing" : "This part is already present at multiple level in this BOM. Please go to the lowest level to enter the data."}`}</span>}</div>
          </div>
        </td>
        {/*WHEN COSTING OF THAT PART IS  APPROVED SO COSTING COMES AUTOMATICALLY FROM BACKEND AND THIS KEY WILL COME TRUE (WORK LIKE VIEW MODE)*/}

      </tr>

      {item.IsOpen && nestedPartComponent}

      {item.IsOpen && nestedAssembly}



      {IsDrawerOpen && <SurfaceTreatment
        isOpen={IsDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        item={item}
        surfaceData={item?.CostingPartDetails?.SurfaceTreatmentDetails}
        transportationData={item?.CostingPartDetails?.TransportationDetails}
        setAssemblySurfaceCost={props.setAssemblySurfaceCost}
        setAssemblyTransportationCost={props.setAssemblyTransportationCost}
        IsAssemblyCalculation={true}
        activeTab={props.activeTab}
        index={index}
      />}

    </ >
  );
}

export default AssemblySurfaceTreatment;