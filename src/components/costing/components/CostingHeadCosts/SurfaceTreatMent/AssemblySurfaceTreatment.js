import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { getSurfaceTreatmentTabData } from '../../../actions/Costing';
import { checkForDecimalAndNull, checkForNull, } from '../../../../../helper';
import PartSurfaceTreatment from './PartSurfaceTreatment';
import SurfaceTreatment from '.';
import { ViewCostingContext } from '../../CostingDetails';
import _ from 'lodash'

function AssemblySurfaceTreatment(props) {
  const { children, item, index } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);
  const [IsDrawerOpen, setDrawerOpen] = useState(false)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const dispatch = useDispatch()

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
        AssemCostingId: costData.CostingId
      }
      dispatch(getSurfaceTreatmentTabData(data, true, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0];
          props.toggleAssembly(Params, Data)
          let array = [];
          array = JSON.parse(localStorage.getItem('surfaceCostingArray'))
          Data.CostingChildPartDetails && Data.CostingChildPartDetails.map(item => {
            array.push(item)
          })
          let uniqueArary = _.uniqBy(array, v => JSON.stringify([v.PartNumber, v.AssemblyPartNumber]))
          localStorage.setItem('surfaceCostingArray', JSON.stringify(uniqueArary));
          // props.toggleAssembly(BOMLevel, PartNumber, Data)

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
      />
    }
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
          onClick={() => { toggle(item.BOMLevel, item.PartNumber, true) }} // UNCOMMENT IT WHEN CHILD PART SURFACE TREATMENT START
        >

          <td>
            <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
              {item && item.PartNumber}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
            </span>
          </td>
          <td>{item && item.BOMLevel}</td>
          <td>{item && item.PartType}</td>
          <td>{item.CostingPartDetails.SurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}
            {
              item.CostingPartDetails && (item.CostingPartDetails.SurfaceTreatmentCost !== null && item.CostingPartDetails.SurfaceTreatmentCost !== 0) ?
                <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                  <span class="tooltiptext">
                    {`Assembly's Surface Treatment Cost:- ${checkForDecimalAndNull(item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly, initialConfiguration.NoOfDecimalForPrice)}`}
                    <br></br>
                    {`Sub Assembly's Surface Treatment Cost:- ${checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentCostPerSubAssembly, initialConfiguration.NoOfDecimalForPrice)}`}
                    <br></br>
                    {`Child Parts Surface Treatment Cost:- ${checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentPerPart)}`}
                  </span>
                </div> : ''
            }
          </td>
          <td>{item.CostingPartDetails.TransportationCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TransportationCost, initialConfiguration.NoOfDecimalForPrice) : 0}
            {
              item.CostingPartDetails && (item.CostingPartDetails.TransportationCost !== null && item.CostingPartDetails.TransportationCost !== 0) ?
                <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                  <span class="tooltiptext">
                    {`Assembly's Extra Cost:- ${checkForDecimalAndNull(item.CostingPartDetails.TransportationCostPerAssembly, initialConfiguration.NoOfDecimalForPrice)}`}
                    <br></br>
                    {`Sub Assembly's Extra Cost:- ${checkForDecimalAndNull(item.CostingPartDetails.TransportationCostPerSubAssembly, initialConfiguration.NoOfDecimalForPrice)}`}
                    <br></br>
                    {`Child Parts Extra Cost:- ${checkForDecimalAndNull(item.CostingPartDetails.TransportationCostPerPart)}`}
                  </span>
                </div> : ''
            }
          </td>
          <td>{checkForNull(item?.Quantity ? item.Quantity : 3)}</td>
          <td>
            {item.CostingPartDetails.NetSurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}
          </td>
        </div>
        <td>
          {!CostingViewMode && (item.CostingPartDetails.NetSurfaceTreatmentCost !== 0) ?
            <button
              type="button"
              className={'user-btn surface-treatment-btn'}
              //onClick={DrawerToggle}
              onClick={() => {
                //toggle(item.BOMLevel, item.PartNumber, false)
                DrawerToggle()
              }}
            >
              <div className={'fa fa-eye pr-1'}></div>Surface T</button>
            :
            <button
              type="button"
              className={'user-btn surface-treatment-btn'}
              //onClick={DrawerToggle}
              onClick={() => {
                //  toggle(item.BOMLevel, item.PartNumber, false)
                DrawerToggle()
              }}
            >
              <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div> Surface T.</button>
          }
        </td>
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
        surfaceData={item.CostingPartDetails.SurfaceTreatmentDetails}
        transportationData={item.CostingPartDetails.TransportationDetails}
        setAssemblySurfaceCost={props.setAssemblySurfaceCost}
        setAssemblyTransportationCost={props.setAssemblyTransportationCost}
        IsAssemblyCalculation={true}
      />}

    </ >
  );
}

export default AssemblySurfaceTreatment;