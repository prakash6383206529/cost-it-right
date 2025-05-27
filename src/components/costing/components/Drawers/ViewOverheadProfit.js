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
import IccCalculator from '../CostingHeadCosts/OverheadProfit/IccCalculator'
function ViewOverheadProfit(props) {
  const { overheadData, profitData, rejectAndModelType, iccPaymentData, isPDFShow, viewRejectionRecovery } = props
  console.log(iccPaymentData, 'iccPaymentData')
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
  const [state, setState] = useState({
    openWeightCalculator: false
  })

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
  const toggleWeightCalculator = () => {
    setState({
      openWeightCalculator: !state.openWeightCalculator
    })
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
  const modelShowDataForIcc = () => {
    return <>
      <Row>
        <Col md="12">
          <div className="left-border">{"ICC:"}</div>
        </Col>
      </Row>
      <Row>
        <Col md="3">
          <TextFieldHookForm
            label="Model Type for ICC"
            name={"modeltypeForIcc"}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            handleChange={() => { }}
            defaultValue={iccPaymentData?.ICCApplicabilityDetail?.ICCModelType}
            className=""
            customClassName={"withBorder"}
            disabled={true}
          />
        </Col>
        <Col md="3">
          <TextFieldHookForm
            label="ICC Method"
            name={"iccMethod"}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            handleChange={() => { }}
            defaultValue={iccPaymentData?.ICCApplicabilityDetail?.ICCMethod}
            className=""
            customClassName={"withBorder"}
            disabled={true}
          />
        </Col>
        <Col md="3" className="st-operation mt-4 pt-2">
          <label id="AddInterestRate_ApplyPartCheckbox"
            className={`custom-checkbox disabled`}
            onChange={() => { }}
          >
            Apply Inventory Days
            <input
              type="checkbox"
              checked={iccPaymentData?.ICCApplicabilityDetail?.IsApplyInventoryDay}
              disabled={true}
            />
            <span className="before-box" checked={iccPaymentData?.ICCApplicabilityDetail?.IsApplyInventoryDay} />
          </label>
        </Col>
        <Col md="3">
          <TextFieldHookForm
            label="Credit Based Annual ICC (%)"
            name={"creditBasedAnnualIcc"}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            handleChange={() => { }}
            defaultValue={iccPaymentData?.ICCApplicabilityDetail?.CreditBasedAnnualICCPercent}
            className=""
            customClassName={"withBorder"}
            disabled={true}
          />
        </Col>
        {iccPaymentData?.ICCApplicabilityDetail?.ICCMethod === 'Credit Based' &&
          <>
            <Col md="3">
              <span className="head-text">Calculator ICC</span>
              <div>
                <button
                  id={`calculatorIcc`}
                  className={`CalculatorIcon cr-cl-icon calculatorIcc`}
                  type={'button'}
                  onClick={() => toggleWeightCalculator()}
                  disabled={false}
                />
              </div>
            </Col>
            <Col md="3">
              <TextFieldHookForm
                name="totalIccPayable"
                label="ICC Payable To Supplier"
                Controller={Controller}
                control={control}
                register={register}
                placeholder="-"
                mandatory={false}
                handleChange={() => { }}
                disabled={true}
                defaultValue={checkForDecimalAndNull(iccPaymentData?.ICCApplicabilityDetail?.ICCPayableToSupplierCost, initialConfiguration?.NoOfDecimalForPrice)}
              />
            </Col>
            <Col md="3">
              <TextFieldHookForm
                name="totalIccReceivable"
                label="ICC Receivable From Supplier"
                Controller={Controller}
                control={control}
                register={register}
                placeholder="-"
                mandatory={false}
                handleChange={() => { }}
                disabled={true}
                defaultValue={checkForDecimalAndNull(iccPaymentData?.ICCApplicabilityDetail?.ICCReceivableFromSupplierCost, initialConfiguration?.NoOfDecimalForPrice)}
              />
            </Col>
            <Col md="3">
              <TextFieldHookForm
                name="totalIccNetCost"
                label="ICC Net Cost"
                Controller={Controller}
                control={control}
                register={register}
                placeholder="-"
                mandatory={false}
                handleChange={() => { }}
                disabled={true}
                defaultValue={checkForDecimalAndNull(iccPaymentData?.NetICC, initialConfiguration?.NoOfDecimalForPrice)}
              />
            </Col>
          </>
        }
      </Row>
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
                {getConfigurationKey().IsRejectionRecoveryApplicable && <th>{`Rejection Recovery Cost`}</th>}
                <th>{`Net Rejection`}</th>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                <th>{`Remark`}</th>
              </tr>
            </thead>
            <tbody>
              {
                ((!rejectData?.CostingRejectionApplicabilityDetails?.length)) ?
                  <tr>
                    <td colSpan={8}>
                      <NoContentFound title={EMPTY_DATA} />
                    </td>
                  </tr> :
                  rejectData.CostingRejectionApplicabilityDetails.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Applicability || '-'}</td>
                      <td> {item?.Applicability !== 'Fixed'
                        ? item?.Percentage : '-'}
                      </td>
                      <td>
                        {item?.Applicability === 'Fixed' ? '-' : checkForDecimalAndNull(item?.Cost, initialConfiguration?.NoOfDecimalForPrice) ?? '-'}
                      </td>
                      <td>
                        {item?.TotalCost !== null && item?.TotalCost !== undefined
                          ? checkForDecimalAndNull(item.TotalCost, initialConfiguration?.NoOfDecimalForPrice)
                          : '-'}
                      </td>
                      <td> {item?.CostingRejectionRecoveryDetails?.RejectionRecoveryNetCost !== null && item?.CostingRejectionRecoveryDetails?.RejectionRecoveryNetCost !== undefined
                        ? checkForDecimalAndNull(item?.CostingRejectionRecoveryDetails?.RejectionRecoveryNetCost, initialConfiguration?.NoOfDecimalForPrice)
                        : '-'}</td>
                      <td> {item?.NetCost !== null && item?.NetCost !== undefined ? checkForDecimalAndNull(item.NetCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}
                      </td>
                      {initialConfiguration?.IsShowCRMHead && (
                        <td>{rejectData?.RejectionCRMHead || '-'}</td>
                      )}
                      <td>{rejectData?.Remark || '-'}</td>
                    </tr>
                  ))
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
  const closeCalculator = () => {
    setState(prev => ({ ...prev, openWeightCalculator: false }))
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
                  {modelShowDataForIcc()}
                  {iccPaymentData?.ICCApplicabilityDetail?.ICCMethod !== "Credit Based" && iccTableData()}
                </div>

                <br />
                <div>
                  {/* //COMMENTED CODE DUE TO PAGE BLANK, ONCE FIXED IT BY ADITI IT WILL BE UNCOMMENT */}
                  {/* {paymentTableData()} */}
                </div>

              </div>
              {state.openWeightCalculator && <IccCalculator
                        anchor={`right`}
                        isOpen={state.openWeightCalculator}
                        closeCalculator={closeCalculator}
                        CostingViewMode={true}
                        iccInterestRateId={iccPaymentData?.ICCApplicabilityDetail?.InterestRateId}
                    />}
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
