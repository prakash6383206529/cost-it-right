import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { getRMCCTabData, } from '../../../actions/Costing';

import { checkForDecimalAndNull, } from '../../../../../helper';
import AddAssemblyOperation from '../../Drawers/AddAssemblyOperation';
import PartSurfaceTreatment from './PartSurfaceTreatment';
import SurfaceTreatment from '.';

function AssemblySurfaceTreatment(props) {
  const { children, item, index } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);
  const [IsDrawerOpen, setDrawerOpen] = useState(false)

  const costData = useContext(costingInfoContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const dispatch = useDispatch()

  const toggle = (BOMLevel, PartNumber) => {
    setIsOpen(!IsOpen)
    setCount(Count + 1)
    const Params = {
      index: props.index,
      BOMLevel: BOMLevel,
      PartNumber: PartNumber,
    }
    props.toggleAssembly(Params)
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
      setSurfaceCost={props.setSurfaceCost}
      setTransportationCost={props.setTransportationCost}
    />
  })

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr>
        <div style={{ display: 'contents' }} onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
          <td>
            <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
              {item && item.PartNumber}-{item && item.BOMLevel}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
            </span>
          </td>
          <td>{item && item.PartType}</td>
          <td>{item.CostingPartDetails.SurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentCost, 2) : 0}</td>
          <td>{item.CostingPartDetails.TransportationCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TransportationCost, 2) : 0}</td>
          <td>{item.CostingPartDetails.NetSurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.NetSurfaceTreatmentCost, 2) : 0}</td>

          {/* <td>
            {item.CostingPartDetails && item.CostingPartDetails.TotalConversionCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalConversionCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}
            {
              item.CostingPartDetails && item.CostingPartDetails.CostingOperationCostResponse ?
                <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                  <span class="tooltiptext">
                    {`Assembly's Conversion Cost:- ${item.CostingPartDetails.TotalOperationCostPerAssembly}`}
                    <br></br>
                    {`Child Parts Conversion Cost:- ${item.CostingPartDetails.TotalConversionCost - item.CostingPartDetails.TotalOperationCostPerAssembly}`}
                  </span>
                </div> : ''
            }
          </td> */}
        </div>
        <td>
          <button
            type="button"
            className={'user-btn'}
            onClick={DrawerToggle}>
            <div className={'plus'}></div>Add Surface Treatment</button>
        </td>
      </tr>

      {/* {IsOpen && nestedPartComponent} */}
      {item.IsOpen && nestedPartComponent}

      {/* {IsOpen && nestedAssembly} */}
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
        //setSurfaceCost={props.setSurfaceCost}
        //setTransportationCost={props.setTransportationCost}
        setAssemblySurfaceCost={props.setAssemblySurfaceCost}
        setAssemblyTransportationCost={props.setAssemblyTransportationCost}
        IsAssemblyCalculation={true}
      />}
    </ >
  );
}

export default AssemblySurfaceTreatment;