import React, { useContext, useState, useEffect } from 'react';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { getBOPData, } from '../../../actions/Costing';
import { useDispatch, useSelector } from 'react-redux';

function BoughtOutPart(props) {
  const { children, item } = props;

  const dispatch = useDispatch()
  const [IsOpen, setIsOpen] = useState(false);

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
        //PlantId: costData.PlantId,
      }
      setTimeout(() => {
        dispatch(getBOPData(data, (res) => {
          if (res && res.data && res.data.Result) {
            // let Data = res.data.DataList[0].CostingPartDetails;
            // props.setPartDetails(BOMLevel, PartNumber, Data)
          }
        }))
      }, 500)
    }
  }, [])

  const toggle = () => {
    setIsOpen(!IsOpen)
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr>
        <td>
          <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
            {item && item.PartNumber}-{item && item.BOMLevel}
            {/* <div className={`${IsOpen ? 'Open' : 'Close'}`}></div> */}
          </span>
        </td>
        <td>{item && item.PartType}</td>
        <td>{''}</td>
        <td>{0}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>{0}</td>
        <td>{''}</td>
      </tr>
    </ >
  );
}

export default BoughtOutPart;