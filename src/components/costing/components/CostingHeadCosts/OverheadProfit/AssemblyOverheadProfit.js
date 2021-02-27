import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { toastr } from 'react-redux-toastr';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import { getOverheadProfitTabData } from '../../../actions/Costing';
import { costingInfoContext } from '../../CostingDetailStepTwo';

function AssemblyOverheadProfit(props) {
  const { children, item, index } = props;

  const costData = useContext(costingInfoContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const dispatch = useDispatch()

  const toggle = (BOMLevel, PartNumber, IsCollapse) => {
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
      dispatch(getOverheadProfitTabData(data, false, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0];
          props.toggleAssembly(Params, Data)
        }
      }))
    } else {
      props.toggleAssembly(Params)
    }
  }

  const nestedAssembly = children && children.map(el => {
    if (el.PartType !== 'Sub Assembly') return false;
    return <AssemblyOverheadProfit
      index={index}
      item={el}
      children={el.CostingChildPartDetails}
      toggleAssembly={props.toggleAssembly}
      OverheadCost={props.OverheadCost}
      ProfitCost={props.ProfitCost}
      setOverheadDetail={props.setOverheadDetail}
      setProfitDetail={props.setProfitDetail}
      setRejectionDetail={props.setRejectionDetail}
      setICCDetail={props.setICCDetail}
      setPaymentTermsDetail={props.setPaymentTermsDetail}
      saveCosting={props.saveCosting}
    />
  })

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {
    props.saveCosting()
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
        <td>
          <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
            {item && item.PartNumber}-{item && item.BOMLevel}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
          </span>
        </td>
        <td>{item && item.PartType}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.OverheadNetCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.OverheadNetCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.ProfitNetCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.ProfitNetCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.RejectionNetCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.RejectionNetCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.ICCCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.ICCCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.PaymentTermCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.PaymentTermCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
      </tr>

      {/* {IsOpen && nestedAssembly} */}
      {item.IsOpen && nestedAssembly}

    </ >
  );
}

export default AssemblyOverheadProfit;