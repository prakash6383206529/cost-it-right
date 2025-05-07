import React, { useState, useEffect } from 'react'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA, WACTypeId } from '../../../../config/constants'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useForm, Controller } from 'react-hook-form';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { checkForDecimalAndNull, getConfigurationKey, showBopLabel } from '../../../../helper'
import { useSelector } from 'react-redux'
import TooltipCustom from '../../../common/Tooltip'
import { IdForMultiTechnology } from '../../../../config/masterData'
function ViewOverheadProfit(props) {
  const { overheadData, profitData, rejectAndModelType, iccPaymentData, isPDFShow, viewRejectionRecovery } = props
  const { rejectData, modelType, isRmCutOffApplicable, rawMaterialCostWithCutOff, isIncludeToolCostWithOverheadAndProfit, isIncludeSurfaceTreatmentWithRejection, isIncludeSurfaceTreatmentWithOverheadAndProfit, isIncludeOverheadAndProfitInICC, isIncludeToolCostInCCForICC } = rejectAndModelType;
  const showTooltipForOH = [isRmCutOffApplicable, isIncludeToolCostWithOverheadAndProfit, isIncludeSurfaceTreatmentWithOverheadAndProfit]
  const showToolTipForICC = [isIncludeOverheadAndProfitInICC, isIncludeToolCostInCCForICC]

  const { register, control } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const [viewOverheadData, setViewOverheadData] = useState(overheadData)
  const [viewProfitData, setViewProfitData] = useState(profitData)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { viewCostingDetailData } = useSelector((state) => state.costing)
  const partType = IdForMultiTechnology?.includes(String(viewCostingDetailData[0]?.technologyId) || String(viewCostingDetailData[0]?.costingTypeId) === WACTypeId)       //CHECK IF MULTIPLE TECHNOLOGY DATA IN SUMMARY

  useEffect(() => {
    setViewOverheadData(overheadData)
    setViewProfitData(profitData)
  }, [])
  /**
  * @method toggleDrawer
  * @description closing drawer
  */
  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }

  const overheadAndProfitTooltipText = 
  `
    ${isRmCutOffApplicable ? `RM Cut Off Price ${checkForDecimalAndNull(rawMaterialCostWithCutOff, initialConfiguration?.NoOfDecimalForPrice)} is Applied` : ''}
    ${isIncludeToolCostWithOverheadAndProfit ? 'Tool Cost Included' : ''}
    ${isIncludeSurfaceTreatmentWithOverheadAndProfit ? 'Surface Treatment Cost Included' : ''}
  `.trim();
  

  const iccToolTipText =
  
 ` ${isIncludeToolCostInCCForICC ? 'Tool Cost Included' : ''}
  ${isIncludeOverheadAndProfitInICC ? 'Overhead and Profit Included' : ''}`.trim()
  const modelShowData = () => {
    return <>
      <div className="input-group form-group col-md-4 input-withouticon pdf-download pl-0">
        <TextFieldHookForm
          label="Model Type for Overhead/Profit"
          name={"modeltype"}
          Controller={Controller}
          control={control}
          register={register}
          mandatory={false}
          handleChange={() => { }}
          //defaultValue={`${viewRM[0].RMName}`}
          defaultValue={modelType}
          className=""
          customClassName={"withBorder"}
          //errors={errors.ECNNumber}
          disabled={true}
        />
      </div>
    </>
  }
  const overheadTableData = () => {
    return <>
      <Row>
        <Col md="12">
          <div className="left-border">{"Overheads:"}</div>
        </Col>
      </Row>
      <Row>
        {/* OVERHEAD RENDERING */}
        <Col md="12">
          <Table className="table cr-brdr-main add-min-width" size="sm">
            <thead>
              <tr>
                <th>{`Overhead On`}</th>
                <th>{'Percentage (%)'}</th>
                <th>{'Cost (Applicability)'}</th>
                <th>{`Overhead`}</th>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                <th>{`Remark`}</th>
              </tr>
            </thead>
            <tbody>
              {overheadData?.CostingApplicabilityDetails?.map(item => (
                <tr key={item.ApplicabilityDetailsId}>
                  <td>{item.Applicability}</td>
                  <td>
                    {item.Percentage ? checkForDecimalAndNull(item.Percentage, initialConfiguration?.NoOfDecimalForPrice) : "-"}
                  </td>
                  <td>
                    {item.Cost ? checkForDecimalAndNull(item.Cost, initialConfiguration?.NoOfDecimalForPrice) : "-"}
                  </td>
                  <td>
                    {item.TotalCost ? checkForDecimalAndNull(item.TotalCost, initialConfiguration?.NoOfDecimalForPrice) : "-"}
                  </td>
                  {initialConfiguration?.IsShowCRMHead && <td>{overheadData.OverheadCRMHead || '-'}</td>}
                  <td>{overheadData.Remark || '-'}</td>
                </tr>
              ))}
              {!overheadData?.CostingApplicabilityDetails?.length && (
                <tr>
                  <td colSpan={12}>
                    <NoContentFound title={EMPTY_DATA} />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  }
  const profitTableData = () => {
    return <>
      <Row>
        <Col md="8">
          <div className="left-border">{"Profits:"}</div>
        </Col>
      </Row>
      <Row>
        {/*PROFIT RENDERING */}

        <Col md="12">
          <Table className="table cr-brdr-main add-min-width" size="sm">
            <thead>
              <tr>
                <th>{`Profit On`}</th>
                <th>{'Percentage (%)'}</th>
                <th>{'Cost (Applicability)'}</th>
                <th>{`Profit`}</th>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                <th>{`Remark`}</th>
              </tr>
            </thead>
            <tbody>
              {profitData?.CostingApplicabilityDetails?.map(item => (
                <tr key={item.ApplicabilityDetailsId}>
                  <td>{item.Applicability}</td>
                  <td>
                    {item.Percentage ? checkForDecimalAndNull(item.Percentage, initialConfiguration?.NoOfDecimalForPrice) : "-"}
                  </td>
                  <td>
                    {item.Cost ? checkForDecimalAndNull(item.Cost, initialConfiguration?.NoOfDecimalForPrice) : "-"}
                  </td>
                  <td>
                    {item.TotalCost ? checkForDecimalAndNull(item.TotalCost, initialConfiguration?.NoOfDecimalForPrice) : "-"}
                  </td>
                  {initialConfiguration?.IsShowCRMHead && <td>{profitData.ProfitCRMHead || '-'}</td>}
                  <td>{profitData.Remark || '-'}</td>
                </tr>
              ))}
              {!profitData?.CostingApplicabilityDetails?.length && (
                <tr>
                  <td colSpan={12}>
                    <NoContentFound title={EMPTY_DATA} />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  }
  const rejectTableData = () => {
    return <>
      <Row>
        <Col md="10">
          <div className="left-border">{"Rejection:"}</div>
        </Col>
      </Row>
      <Row>
        {/*REJECTION RENDERING */}

        <Col md="12">
          <Table className="table cr-brdr-main" size="sm">
            <thead>
              <tr>

                <th>{`Applicability`}</th>
                <th>{`Rejection ${rejectData?.RejectionApplicability === 'Fixed' ? '' : '(%)'}`}</th>
                <th><div className='w-fit'>Cost (Applicability){isIncludeSurfaceTreatmentWithRejection && rejectData.RejectionApplicability?.includes('CC') && !isPDFShow && <TooltipCustom width="250px" customClass="mt-1 ml-1" id="rejection-table" tooltipText={'Surface Treatment Cost Included'} />}</div></th>
                <th>{`Rejection`}</th>
                <th>{`Net Rejection`}</th>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                <th>{`Remark`}</th>
              </tr>
            </thead>
            <tbody>
              {
                (rejectData.RejectionApplicability === null) ?
                  <tr>
                    <td colSpan={8}>
                      <NoContentFound title={EMPTY_DATA} />
                    </td>
                  </tr> :
                  <tr>
                    <td>{rejectData.RejectionApplicability ? rejectData.RejectionApplicability : '-'}</td>
                    <td>{rejectData.RejectionApplicability === "Fixed" ? rejectData.RejectionCost : rejectData.RejectionPercentage ? checkForDecimalAndNull(rejectData.RejectionPercentage, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    <td>{rejectData.RejectionApplicability === "Fixed" ? '-' : rejectData.RejectionCost ? checkForDecimalAndNull(rejectData.RejectionCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    <td>{rejectData.NetCost ? checkForDecimalAndNull(rejectData.NetCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    <td>{rejectData.RejectionTotalCost ? checkForDecimalAndNull(rejectData.RejectionTotalCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    {initialConfiguration?.IsShowCRMHead && <td>{rejectData.RejectionCRMHead}</td>}
                    <td>{rejectData.Remark ? rejectData.Remark : "-"}</td>
                  </tr>
              }
            </tbody>
          </Table>
        </Col>
      </Row></>
  }
  const rejectRecoveryTableData = () => {
    return <>
      <Row>
        <Col md="10">
          <div className="left-border">{"Rejection Recovery:"}</div>
        </Col>
      </Row>
      <Row>
        {/*REJECTION RENDERING */}

        <Col md="12">
          <Table className="table cr-brdr-main " size="sm">
            <thead>
              <tr>

                <th>Applicability</th>
                <th>Recovery Percentage</th>
                <th>Effective Recovery Percentage</th>
                <th>Rejection Applicability Cost</th>
                <th>Rejection Recovery Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{viewRejectionRecovery?.ApplicabilityType}</td>
                <td>{viewRejectionRecovery?.Value ? checkForDecimalAndNull(viewRejectionRecovery?.Value, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                <td>{viewRejectionRecovery?.EffectiveRecoveryPercentage ? checkForDecimalAndNull(viewRejectionRecovery?.EffectiveRecoveryPercentage, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                <td>{viewRejectionRecovery?.ApplicabilityCost ? checkForDecimalAndNull(viewRejectionRecovery?.ApplicabilityCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                <td>{viewRejectionRecovery?.RejectionRecoveryNetCost ? checkForDecimalAndNull(viewRejectionRecovery?.RejectionRecoveryNetCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row></>
  }
  const iccTableData = () => {
    return <>
      <Row>
        <Col md="12">
          <div className="left-border">{"ICC:"}</div>
        </Col>
      </Row>
      <Row>
        {/*REJECTION RENDERING */}

        <Col md="12">
          <Table className="table cr-brdr-main add-min-width" size="sm">
            <thead>
              <tr>

                <th>{`Applicability`}</th>
                <th>{`Interest Rate ${iccPaymentData.ICCApplicabilityDetail.ICCApplicability === 'Fixed' ? '' : '(%)'}`}</th>
                <th><div className='w-fit'>Cost (Applicability){showToolTipForICC.includes(true) && iccPaymentData?.ICCApplicabilityDetail?.ICCApplicability?.includes('CC') && !isPDFShow && <TooltipCustom width="250px" customClass="mt-1 ml-1" id="icc-table" tooltipText={iccToolTipText} />}</div></th>
                <th><div className='w-fit'>Net ICC  {!isPDFShow && getConfigurationKey().IsShowRmcAndNetWeightToggleForIcc && (iccPaymentData?.ICCApplicabilityDetail?.IsICCCalculationOnNetWeight || iccPaymentData?.ICCApplicabilityDetail?.ICCApplicability?.includes('RM')) && <TooltipCustom customClass="mt-1 ml-1" id="icc-rm-applicable" tooltipText={iccPaymentData?.ICCApplicabilityDetail?.IsICCCalculationOnNetWeight ? "ICC Calculation on Net Weight" : "ICC Calculation on RMC"} />}</div></th>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                <th>{`Remark`}</th>
              </tr>
            </thead>
            <tbody>
              {
                (iccPaymentData.ICCApplicabilityDetail.ICCApplicability === null) ?
                  <tr>
                    <td colSpan={8}>
                      <NoContentFound title={EMPTY_DATA} />
                    </td>
                  </tr> :
                  <tr>
                    <td>{iccPaymentData.ICCApplicabilityDetail ? iccPaymentData.ICCApplicabilityDetail.ICCApplicability : '-'}</td>
                    <td>{iccPaymentData.ICCApplicabilityDetail.InterestRate ? checkForDecimalAndNull(iccPaymentData.ICCApplicabilityDetail.InterestRate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                    <td>{iccPaymentData.ICCApplicabilityDetail.CostApplicability ? checkForDecimalAndNull(iccPaymentData.ICCApplicabilityDetail.CostApplicability, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                    <td><div className='w-fit'>{iccPaymentData?.NetICC ? checkForDecimalAndNull(iccPaymentData?.NetICC, initialConfiguration?.NoOfDecimalForPrice) : '-'}</div></td>
                    {initialConfiguration?.IsShowCRMHead && <td>{iccPaymentData?.ICCApplicabilityDetail?.ICCCRMHead}</td>}
                    <td>{iccPaymentData.ICCApplicabilityDetail.Remark ? iccPaymentData.ICCApplicabilityDetail.Remark : '-'}</td>
                  </tr>
              }

            </tbody>
          </Table>
        </Col>

      </Row></>
  }
  const paymentTableData = () => {
    return <>
      <Row>
        <Col md="12">
          <div className="left-border">{"Payment Terms:"}</div>
        </Col>
      </Row>
      <Row>
        {/*REJECTION RENDERING */}

        <Col md="12">
          <Table className="table cr-brdr-main add-min-width" size="sm">
            <thead>
              <tr>

                <th>{`Applicability`}</th>
                <th>{`Repayment Period (No. of days)`}</th>
                <th>{`Interest Rate ${iccPaymentData.PaymentTermDetail?.PaymentTermApplicability === 'Fixed' ? '' : '(%)'}`}</th>
                <th>{`Cost`}</th>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                <th>{`Remark`}</th>
              </tr>
            </thead>
            <tbody>
              {
                (iccPaymentData.PaymentTermDetail?.PaymentTermApplicability === null) ?
                  <tr>
                    <td colSpan={8}>
                      <NoContentFound title={EMPTY_DATA} />
                    </td>
                  </tr> :
                  <tr>
                    <td>{iccPaymentData.PaymentTermDetail?.PaymentTermApplicability ? iccPaymentData.PaymentTermDetail?.PaymentTermApplicability : '-'}</td>
                    <td>{iccPaymentData.PaymentTermDetail?.PaymentTermApplicability === 'Fixed' ? '-' : iccPaymentData.PaymentTermDetail.RepaymentPeriod ? checkForDecimalAndNull(iccPaymentData.PaymentTermDetail.RepaymentPeriod, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    <td>{iccPaymentData.PaymentTermDetail.InterestRate ? checkForDecimalAndNull(iccPaymentData.PaymentTermDetail.InterestRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    <td>{iccPaymentData.PaymentTermDetail.NetCost ? checkForDecimalAndNull(iccPaymentData.PaymentTermDetail.NetCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    {initialConfiguration?.IsShowCRMHead && <td>{iccPaymentData.PaymentTermDetail.PaymentTermCRMHead}</td>}
                    <td>{iccPaymentData.PaymentTermDetail.Remark ? iccPaymentData.PaymentTermDetail.Remark : '-'}</td>
                  </tr>
              }

            </tbody>
          </Table>
        </Col>
      </Row></>
  }

  return (
    <>
      {!isPDFShow ?
        <Drawer
          anchor={props.anchor}
          open={props.isOpen}
        // onClose={(e) => toggleDrawer(e)}
        >
          <Container>
            <div className={"drawer-wrapper drawer-1500px"}>
              <Row className="drawer-heading">
                <Col>
                  <div className={"header-wrapper left"}>
                    <h3>{"View Overhead & Profit Cost:"}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={"close-button right"}
                  ></div>
                </Col>
              </Row>

              {modelShowData()}
              <div
              // className="cr-process-costwrap"
              >
                <>
                  {overheadTableData()}</>
                <br />
                <div>
                  {profitTableData()}
                </div>
                <br />
                <div>
                  {rejectTableData()}
                </div>
                <br />
                <div>
                  {viewRejectionRecovery && rejectRecoveryTableData()}
                </div>
                <br />
                <div>
                  {/* //COMMENTED CODE DUE TO PAGE BLANK, ONCE FIXED IT BY ADITI IT WILL BE UNCOMMENT */}
                  {iccTableData()}
                </div>

                <br />
                <div>
                  {/* //COMMENTED CODE DUE TO PAGE BLANK, ONCE FIXED IT BY ADITI IT WILL BE UNCOMMENT */}
                  {/* {paymentTableData()} */}
                </div>

              </div>
            </div>
          </Container>
        </Drawer> : <>
          {(viewOverheadData?.CostingApplicabilityDetails?.length > 0 || viewProfitData?.CostingApplicabilityDetails?.length > 0) && modelShowData()}
          <div>
            {viewOverheadData?.CostingApplicabilityDetails?.length > 0 && overheadTableData()}
          </div>
          <div>
            {viewProfitData?.CostingApplicabilityDetails?.length > 0 ? profitTableData() : ""}
          </div>
          {rejectData.RejectionApplicability != null && rejectTableData()}
          {/* //COMMENTED CODE DUE TO PAGE BLANK, ONCE FIXED IT BY ADITI IT WILL BE UNCOMMENT */}
          {/* {iccPaymentData.ICCApplicabilityDetail.ICCApplicability != null && iccTableData()} */}
          {/* {iccPaymentData.PaymentTermDetail?.PaymentTermApplicability != null && paymentTableData()} */}
          {viewRejectionRecovery && rejectRecoveryTableData()}
        </>

      }
    </>
  );
}

export default React.memo(ViewOverheadProfit)
