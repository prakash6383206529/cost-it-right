import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkForDecimalAndNull, loggedInUserId, } from '../../../../../helper';
import { getOverheadProfitTabData, saveAssemblyOverheadProfitTab } from '../../../actions/Costing';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import OverheadProfit from '.';

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
  const onSubmit = (values) => { }


  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const saveCosting = (values) => {
    let reqData = {
      "CostingId": item.CostingId,
      "LoggedInUserId": loggedInUserId(),
      "IsSurfaceTreatmentApplicable": true,
      "IsApplicableForChildParts": false,
      "CostingPartDetails": item.CostingPartDetails,
    }
    dispatch(saveAssemblyOverheadProfitTab(reqData, res => {
      console.log('saveAssemblyOverheadProfitTab: ', res);
    }))
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
        <td>{item.CostingPartDetails && item.CostingPartDetails.OverheadCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.OverheadCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.ProfitCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.ProfitCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.RejectionCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.RejectionCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.ICCCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.ICCCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td className="costing-border-right">{item.CostingPartDetails && item.CostingPartDetails.PaymentTermCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.PaymentTermCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
      </tr>
      {item.IsOpen && <tr>
        <td colSpan={8} className="cr-innerwrap-td">
          <div className="user-page p-0">
            <div>
              <OverheadProfit
                index={props.index}
                data={item}
                OverheadCost={props.OverheadCost}
                ProfitCost={props.ProfitCost}
                setOverheadDetail={props.setOverheadDetail}
                setProfitDetail={props.setProfitDetail}
                setRejectionDetail={props.setRejectionDetail}
                setICCDetail={props.setICCDetail}
                setPaymentTermsDetail={props.setPaymentTermsDetail}
                saveCosting={saveCosting}
              />
            </div>
          </div >
        </td>
      </tr>}

      {/* {item.IsOpen && nestedAssembly} */}

    </ >
  );
}

export default AssemblyOverheadProfit;