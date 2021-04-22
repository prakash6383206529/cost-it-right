import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../../helper';
import { getOverheadProfitTabData, saveComponentOverheadProfitTab, setComponentOverheadItemData } from '../../../actions/Costing';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import OverheadProfit from '.';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';

function PartOverheadProfit(props) {
  const { item } = props;

  const [Count, setCount] = useState(0);
  const [IsOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch()
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const costData = useContext(costingInfoContext);

  const toggle = (BOMLevel, PartNumber) => {
    const Params = {
      index: props.index,
      BOMLevel: BOMLevel,
      PartNumber: PartNumber,
    }
    setIsOpen(!IsOpen)
    setCount(Count + 1)
    setTimeout(() => {
      if (Object.keys(costData).length > 0) {
        const data = {
          CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
          PartId: item.PartId,
        }
        dispatch(getOverheadProfitTabData(data, false, (res) => {
          if (res && res.data && res.data.Result) {
            let Data = res.data.DataList[0].CostingPartDetails;
            props.setPartDetails(Params, Data)
          }
        }))
      }
    }, 500)
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => { }

  /**
  * @method SAVE API CALL WHEN COMPONENT CLOSED
  * @description Used to Submit the form
  */
  useEffect(() => {
    if (item.IsOpen === false && Count > 1) { }
  }, [item.IsOpen])

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
      //"IsIncludeSurfaceTreatmentWithOverheadAndProfit": props.IsIncludeSurfaceTreatment,
      "NetOverheadAndProfitCost": checkForNull(item.CostingPartDetails.OverheadCost) +
        checkForNull(item.CostingPartDetails.ProfitCost) +
        checkForNull(item.CostingPartDetails.RejectionCost) +
        checkForNull(item.CostingPartDetails.ICCCost) +
        checkForNull(item.CostingPartDetails.PaymentTermCost),
      "CostingPartDetails": item.CostingPartDetails
    }
    dispatch(saveComponentOverheadProfitTab(reqData, res => {
      if (res.data.Result) {
        toastr.success(MESSAGES.OVERHEAD_PROFIT_COSTING_SAVE_SUCCESS);
      }
    }))
  }

  useEffect(() => {
    dispatch(setComponentOverheadItemData(item, () => { }))
  }, [IsOpen])

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

    </ >
  );
}

export default PartOverheadProfit;