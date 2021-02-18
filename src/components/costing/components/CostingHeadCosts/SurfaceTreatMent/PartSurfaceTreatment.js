import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SurfaceTreatment from '.';
import { checkForDecimalAndNull } from '../../../../../helper';

function PartSurfaceTreatment(props) {
  const { item } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);
  const [IsDrawerOpen, setDrawerOpen] = useState(false)

  const toggle = (BOMLevel, PartNumber) => {
    setIsOpen(!IsOpen)
    setCount(Count + 1)
    props.setPartDetails(BOMLevel, PartNumber)
    // setTimeout(() => {
    //   if (Object.keys(costData).length > 0) {
    //     const data = {
    //       CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
    //       PartId: item.PartId,
    //       //PlantId: costData.PlantId,
    //     }
    //     // dispatch(getRMCCTabData(data, false, (res) => {
    //     //   if (res && res.data && res.data.Result) {
    //     //     let Data = res.data.DataList[0].CostingPartDetails;
    //     //     props.setPartDetails(BOMLevel, PartNumber, Data)
    //     //   }
    //     // }))
    //   }
    // }, 500)
  }

  useEffect(() => {


  })

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

  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>
      <tr onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
        <div style={{ display: 'contents' }} onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
          <td>
            <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
              {item && item.PartNumber}-{item && item.BOMLevel}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
            </span>
          </td>
          <td>{item && item.CostingPartDetails.PartType}</td>
          <td>{item.CostingPartDetails.SurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentCost, 2) : 0}</td>
          <td>{item.CostingPartDetails.TransportationCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TransportationCost, 2) : 0}</td>
          <td>{item.CostingPartDetails.NetSurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.NetSurfaceTreatmentCost, 2) : 0}</td>
        </div>
        <td>
          <button
            type="button"
            className={'user-btn'}
            onClick={DrawerToggle}>
            <div className={'plus'}></div>Add Surface Treatment</button>
        </td>
      </tr>

      {IsDrawerOpen && <SurfaceTreatment
        isOpen={IsDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        item={item}
      //surfaceData={item.SurfaceTreatmentDetails}
      //transportationData={item.TransportationDetails}
      />}

    </ >
  );
}

export default PartSurfaceTreatment
