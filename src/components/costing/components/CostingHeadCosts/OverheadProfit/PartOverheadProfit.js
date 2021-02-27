import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import { fetchModelTypeAPI, fetchCostingHeadsAPI, getICCAppliSelectList, getPaymentTermsAppliSelectList } from '../../../../../actions/Common';
import { getOverheadProfitTabData } from '../../../actions/Costing';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import Switch from "react-switch";
import OverheadProfit from '.';

function PartOverheadProfit(props) {
  const { item } = props;

  const dispatch = useDispatch()
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const costData = useContext(costingInfoContext);

  const toggle = (BOMLevel, PartNumber) => {
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
          //PlantId: costData.PlantId,
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
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalRawMaterialsCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalRawMaterialsCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalBoughtOutPartCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalBoughtOutPartCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalConversionCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalConversionCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        {/* <td>{item.CostingPartDetails && item.CostingPartDetails.Quantity !== undefined ? checkForNull(item.CostingPartDetails.Quantity) : 1}</td> */}
        <td>{1}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{''}</td>
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
                saveCosting={props.saveCosting}
              />
            </div>
          </div >
        </td>
      </tr>}

    </ >
  );
}

export default PartOverheadProfit;