import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSurfaceTreatmentTabData, } from '../../../actions/Costing';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import SurfaceTreatment from '.';
import { checkForDecimalAndNull } from '../../../../../helper';
import { ViewCostingContext } from '../../CostingDetails';

function PartSurfaceTreatment(props) {
  
  const { item } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);
  const [IsDrawerOpen, setDrawerOpen] = useState(false)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const dispatch = useDispatch()

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
        }
        dispatch(getSurfaceTreatmentTabData(data, false, (res) => {
          if (res && res.data && res.data.Result) {
            let Data = res.data.DataList[0].CostingPartDetails;
            DrawerToggle()
            props.setPartDetails(Params, Data)
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
          <td>{item.CostingPartDetails.SurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
          <td>{item.CostingPartDetails.TransportationCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TransportationCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
          <td>{item.CostingPartDetails.NetSurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        </div>
        <td>
          {!CostingViewMode && ((item.CostingPartDetails.NetSurfaceTreatmentCost !== 0) ?

            <button
              type="button"
              className={'user-btn surface-treatment-btn'}
              //onClick={DrawerToggle}
              onClick={() => toggle(item.BOMLevel, item.PartNumber)}
            >
              <div className={'fa fa-eye pr-1'}></div>View Surface Treatment</button>
            :
            <button
              type="button"
              className={'user-btn surface-treatment-btn'}
              //onClick={DrawerToggle}
              onClick={() => toggle(item.BOMLevel, item.PartNumber)}
            >
              <div className={'plus'}></div>Add Surface Treatment</button>)
          }
        </td>
      </tr>

      {IsDrawerOpen && <SurfaceTreatment
        isOpen={IsDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        item={item}
        surfaceData={item.CostingPartDetails.SurfaceTreatmentDetails}
        transportationData={item.CostingPartDetails.TransportationDetails}
        setSurfaceCost={props.setSurfaceCost}
        setTransportationCost={props.setTransportationCost}
        IsAssemblyCalculation={false}
      />}

    </ >
  );
}

export default PartSurfaceTreatment
