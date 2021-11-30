import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { getSurfaceTreatmentTabData } from '../../../actions/Costing';
import { checkForDecimalAndNull, } from '../../../../../helper';
import PartSurfaceTreatment from './PartSurfaceTreatment';
import SurfaceTreatment from '.';
import { ViewCostingContext } from '../../CostingDetails';

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
      }
      dispatch(getSurfaceTreatmentTabData(data, false, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0];
          props.toggleAssembly(Params, Data)
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
    />
  })

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr>
        <div className="accordian-row" style={{ display: 'contents' }} onClick={() => {
          toggle(item.BOMLevel, item.PartNumber, true)
        }}>
          <td>
            <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
              {item && item.PartNumber}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
            </span>
          </td>
          <td>{item && item.BOMLevel}</td>
          <td>{item && item.PartType}</td>
          <td>{item.CostingPartDetails.SurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
          <td>{item.CostingPartDetails.TransportationCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TransportationCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
          <td>
            {item.CostingPartDetails.NetSurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}
            {/* {
              item.CostingPartDetails && (item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly !== null) ?
                <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                  <span class="tooltiptext">
                    {`Assembly's Surface Treatment Cost:- ${item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly + item.CostingPartDetails.TotalTransportationCostPerAssembly}`}
                    <br></br>
                    {`Child Parts Surface Treatment Cost:- ${item.CostingPartDetails.NetSurfaceTreatmentCost - (item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly + item.CostingPartDetails.TotalTransportationCostPerAssembly)}`}
                  </span>
                </div> : ''
            } */}
          </td>
        </div>
        <td>
          {!CostingViewMode && ((item.CostingPartDetails.NetSurfaceTreatmentCost !== 0) ?
            <button
              type="button"
              className={'user-btn surface-treatment-btn'}
              //onClick={DrawerToggle}
              onClick={() => {
                toggle(item.BOMLevel, item.PartNumber, false)
                // DrawerToggle()
              }}
            >
              <div className={'fa fa-eye pr-1'}></div>View Surface Treatment</button>
            :
            <button
              type="button"
              className={'user-btn surface-treatment-btn'}
              //onClick={DrawerToggle}
              onClick={() => {
                toggle(item.BOMLevel, item.PartNumber, false)
                // DrawerToggle()
              }}
            >
              <div className={'plus'}></div>Add Surface Treatment</button>)
          }
        </td>
      </tr>

      {/* {item.IsOpen && nestedPartComponent} */}

      {/* {item.IsOpen && nestedAssembly} */}

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