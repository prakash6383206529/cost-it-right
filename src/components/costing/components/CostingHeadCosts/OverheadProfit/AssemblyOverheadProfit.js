import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../../helper';
import { getOverheadProfitTabData, saveAssemblyOverheadProfitTab } from '../../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../../CostingDetailStepTwo';
import OverheadProfit from '.';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';

function AssemblyOverheadProfit(props) {
  const { children, item, index } = props;

  const costData = useContext(costingInfoContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate } = useSelector(state => state.costing)

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
      "CostingNumber": costData.CostingNumber,
      "NetOverheadAndProfitCost": checkForNull(item.CostingPartDetails.OverheadCost) +
        checkForNull(item.CostingPartDetails.ProfitCost) +
        checkForNull(item.CostingPartDetails.RejectionCost) +
        checkForNull(item.CostingPartDetails.ICCCost) +
        checkForNull(item.CostingPartDetails.PaymentTermCost),
      "CostingPartDetails": {
        ...item.CostingPartDetails,
        NetOverheadAndProfitCost: checkForNull(item.CostingPartDetails.OverheadCost) + checkForNull(item.CostingPartDetails.RejectionCost) + checkForNull(item.CostingPartDetails.ProfitCost) + checkForNull(item.CostingPartDetails.ICCCost) + checkForNull(item.CostingPartDetails.PaymentTermCost),
      },
      "EffectiveDate": CostingEffectiveDate,
      "TotalCost": netPOPrice,
    }
    dispatch(saveAssemblyOverheadProfitTab(reqData, res => {
      if (res.data.Result) {
        toastr.success(MESSAGES.OVERHEAD_PROFIT_COSTING_SAVE_SUCCESS);
      }
    }))
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr className="accordian-row" onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
        <td>
          <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
            {item && item.PartNumber}-{item && item.BOMLevel}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
          </span>
        </td>
        <td>{item && item.PartType}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.OverheadCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.OverheadCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.ProfitCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.ProfitCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.RejectionCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.RejectionCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.ICCCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.ICCCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td className="costing-border-right">{item.CostingPartDetails && item.CostingPartDetails.PaymentTermCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.PaymentTermCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
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