import React, { useEffect, useState } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { Controller, useForm, } from 'react-hook-form'
import { useDispatch, useSelector, } from 'react-redux'
import NpvCost from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/NpvCost'
import ConditionCosting from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/ConditionCosting'
import HeaderTitle from '../../common/HeaderTitle'
import LoaderCustom from '../../common/LoaderCustom'
import YOYCost from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/YOYCost'
import NoContentFound from '../../common/NoContentFound'
import { EMPTY_DATA } from '../../../config/constants'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../helper'
import { reactLocalStorage } from 'reactjs-localstorage'
import { TextFieldHookForm } from '../../layout/HookFormInputs'
import TooltipCustom from '../../common/Tooltip'
import IccCalculator from './CostingHeadCosts/OverheadProfit/IccCalculator'
import { setIsCalculatorExist } from '../actions/Costing'

function ViewOtherCostDrawer(props) {
    
    const { partId, vendorId, costingIndex, CostingPaymentTermDetails, npvCostData, iccPaymentData, isPDFShow, rejectAndModelType } = props
    
    const [tableData, setTableData] = useState(props.tableData)
    const [conditionTableData, seConditionTableData] = useState([])
    const [costingSummary, setCostingSummary] = useState(props.costingSummary ? props.costingSummary : false)
    const [gridData, setgridData] = useState([]);
    const [totalOtherCost, setTotalOtherCost] = useState(0);
    const [totalDiscountCost, setTotalDiscountCost] = useState(0);
    const [isLoader, setIsLoader] = useState(false)
    const [discountData, setDiscountData] = useState([])
    const [state, setState] = useState({
        openWeightCalculator: false
    })
    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { isIncludeOverheadAndProfitInICC, isIncludeToolCostInCCForICC } = rejectAndModelType;
    const showToolTipForICC = [isIncludeOverheadAndProfitInICC, isIncludeToolCostInCCForICC]
    const { register, control, setValue, getValues, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const showCurrency = (viewCostingData && viewCostingData[costingIndex]?.CostingCurrency) ? viewCostingData[costingIndex]?.CostingCurrency : reactLocalStorage.getObject("baseCurrency")
    const dispatch = useDispatch()
    useEffect(() => {
        if (props.costingSummary) {
            setIsLoader(true)
            setTableData(viewCostingData[props.npvIndex]?.CostingPartDetails?.CostingNpvResponse)
            let Data = viewCostingData[props.npvIndex]?.CostingPartDetails?.CostingConditionResponse
            let temp = []
            Data && Data.map((item) => {
                // item.ConditionPercentage = item.Percentage
                item.condition = `${item.Description} (${item.CostingConditionNumber})`
                temp.push(item)
            })
            seConditionTableData(temp)
            setIsLoader(false)

            let tempNew = []
            let totalCost = 0
            viewCostingData && viewCostingData[costingIndex]?.CostingPartDetails?.OtherCostDetails && viewCostingData[costingIndex].CostingPartDetails.OtherCostDetails.map((item) => {

                totalCost = checkForNull(totalCost) + checkForNull(item.NetCost)
                let obj = {}
                obj.OtherCostDescription = item?.Description
                obj.OtherCostApplicability = item?.ApplicabilityType
                obj.ApplicabilityCost = item?.ApplicabilityCost
                obj.PercentageOtherCost = item?.Value ? item?.Value : '-'
                obj.AnyOtherCost = item?.NetCost
                obj.CRMHead = item?.CRMHead ?? ''
                tempNew.push(obj)
            })
            setTotalOtherCost(totalCost)
            setgridData(tempNew)
            let discountTable = []
            let totalDiscountCost = 0
            viewCostingData && viewCostingData[costingIndex]?.CostingPartDetails?.DiscountCostDetails && viewCostingData[costingIndex].CostingPartDetails.DiscountCostDetails.map((item) => {
                let obj = {}
                totalDiscountCost = checkForNull(totalDiscountCost) + checkForNull(item.NetCost)
                obj.DiscountDescription = item?.Description
                obj.DiscountApplicability = item?.ApplicabilityType
                obj.dicountApplicabilityValue = item?.ApplicabilityCost
                obj.Percentage = item?.Value ? item?.Value : '-'
                obj.Value = item?.NetCost
                obj.CRMHead = item?.CRMHead ?? ''
                discountTable.push(obj)
            })
            setDiscountData(discountTable)
            setTotalDiscountCost(totalDiscountCost)
            dispatch(setIsCalculatorExist(iccPaymentData?.IsCalculatorExist))
        }

    }, [])

    const cancel = () => {
        props.closeDrawer('Close')
    }
    const iccToolTipText =

        ` ${isIncludeToolCostInCCForICC ? 'Tool Cost Included' : ''}
  ${isIncludeOverheadAndProfitInICC ? 'Overhead and Profit Included' : ''}`.trim()
    const DiscountCost = () => {
        return (<>
            <Col md="12">
                <HeaderTitle className="border-bottom"
                    title={'Discount Cost:'}
                    customClass={'underLine-title'}
                />
            </Col>
            <Col md="12">
                <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                    <thead>
                        <tr>
                            {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                            <th className='custom-max-width-220px'>{`Discount Description/Remark`}</th>
                            <th>{`Discount Applicability`}</th>
                            <th>{`Discount Applicability Cost (${showCurrency})`}</th>
                            <th>{`Percentage (%)`}</th>
                            <th>{'Value'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {discountData && discountData.map((item, index) => {
                            return (
                                <tr key={index} >
                                    {initialConfiguration?.IsShowCRMHead && <td>{item.CRMHead}</td>}
                                    <td className='custom-max-width-220px'>{item?.DiscountDescription}</td>
                                    <td>{item?.DiscountApplicability}</td>
                                    <td>{item?.dicountApplicabilityValue}</td>
                                    <td>{String(item?.DiscountApplicability) === String('Fixed') ? '-' : item.Percentage}</td>
                                    <td>{checkForDecimalAndNull(item.Value, initialConfiguration?.NoOfDecimalForPrice)}</td>
                                </tr>
                            );
                        })}
                        {discountData.length === 0 ? <tr>
                            <td colSpan={initialConfiguration?.IsShowCRMHead ? 5 : 4}> <NoContentFound title={EMPTY_DATA} /></td>
                        </tr> : <tr className='table-footer'>
                            <td className='text-right' colSpan={initialConfiguration?.IsShowCRMHead ? 5 : 4}>Total Other Cost ({showCurrency}):</td>
                            <td colSpan={2}>{checkForDecimalAndNull(totalDiscountCost, initialConfiguration?.NoOfDecimalForPrice)}</td>
                        </tr>}
                    </tbody>
                </Table>
            </Col>
        </>)
    }

    const OtherCost = () => {
        return (<>
            <Col md="12" className='mt-4'>
                <HeaderTitle className="border-bottom"
                    title={'Other Cost:'}
                    customClass={'underLine-title'}
                />
            </Col>
            <Col md="12">
                <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                    <thead>
                        <tr>
                            {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                            <th>{`Other Cost Description`}</th>
                            <th>{`Other Cost Applicability`}</th>
                            {<th>{`Cost Applicability (${showCurrency})`}</th>}
                            <th>{'Percentage (%)'}</th>
                            <th>{`Cost`}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gridData && gridData.map((item, index) => {
                            return (
                                <tr key={index} >
                                    {initialConfiguration?.IsShowCRMHead && <td>{item.CRMHead}</td>}
                                    <td>{item.OtherCostDescription}</td>
                                    <td>{item?.OtherCostApplicability}</td>
                                    <td>{checkForDecimalAndNull(item?.ApplicabilityCost, initialConfiguration?.NoOfDecimalForPrice)}</td>
                                    <td>{String(item?.OtherCostApplicability) === String('Fixed') ? '-' : item.PercentageOtherCost}</td>
                                    <td>{checkForDecimalAndNull(item.AnyOtherCost, initialConfiguration?.NoOfDecimalForPrice)}</td>
                                </tr>
                            );
                        })}
                        {gridData.length === 0 ? <tr>
                            <td colSpan={initialConfiguration?.IsShowCRMHead ? 5 : 4}> <NoContentFound title={EMPTY_DATA} /></td>
                        </tr> :
                            <tr className='table-footer'>
                                <td className='text-right' colSpan={initialConfiguration?.IsShowCRMHead ? 5 : 4}>Total Other Cost ({showCurrency}):</td>
                                <td colSpan={2}>{checkForDecimalAndNull(totalOtherCost, initialConfiguration?.NoOfDecimalForPrice)}</td>
                            </tr>}
                    </tbody>
                </Table>
            </Col>
        </>)
    }
    const toggleWeightCalculator = (index) => {
        setState({
            openWeightCalculator: !state.openWeightCalculator,
        })
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
                {iccPaymentData?.ICCApplicabilityDetail?.ICCMethod !== 'Credit Based' && <Col md="3">
                    <TextFieldHookForm
                        name="InventoryDayType"
                        label="Inventory Day Type"
                        Controller={Controller}
                        control={control}
                        register={register}
                        placeholder="-"
                        mandatory={false}
                        handleChange={() => { }}
                        errors={errors.InventoryDayType}
                        disabled={true}
                        customClassName={"withBorder"}
                        defaultValue={iccPaymentData?.ICCApplicabilityDetail?.ApplicabilityBasedInventoryDayType}
                    />
                </Col>}

                {iccPaymentData?.ICCApplicabilityDetail?.ICCMethod === 'Credit Based' &&
                    <>
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
    const iccTableData = () => {
        return <>
            <Row>
                <Col md="12">
                    <Table className="table cr-brdr-main add-min-width" size="sm">
                        <thead>
                            <tr>
                                <th>{`Applicability`}</th>
                               {iccPaymentData?.ICCApplicabilityDetail?.IsApplyInventoryDay && <th>{`No. of Days`}</th>}
                                <th>{`Interest Rate (%)`}</th>
                                <th>{`Cost (Applicability)`}</th>
                                <th>{`Total Cost`}</th>
                                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                                <th>{`Remark`}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (!iccPaymentData?.ICCApplicabilityDetail?.ICCCostingApplicabilityDetails?.length) ?
                                    <tr>
                                        <td colSpan={8}>
                                            <NoContentFound title={EMPTY_DATA} />
                                        </td>
                                    </tr> :
                                    iccPaymentData.ICCApplicabilityDetail.ICCCostingApplicabilityDetails.map((detail, index) => (
                                        <tr key={index}>
                                            <td>{detail.Applicability || '-'}</td>
                                            {iccPaymentData?.ICCApplicabilityDetail?.IsApplyInventoryDay && <td>{detail.NoOfDays || '-'}</td>}
                                            <td>{detail.Percentage ? checkForDecimalAndNull(detail.Percentage, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                                            <td>{detail.Cost ? checkForDecimalAndNull(detail.Cost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                                            <td>{detail.TotalCost ? checkForDecimalAndNull(detail.TotalCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                                            {initialConfiguration?.IsShowCRMHead && <td>{iccPaymentData?.ICCApplicabilityDetail?.ICCCRMHead || '-'}</td>}
                                            <td>{iccPaymentData.ICCApplicabilityDetail.Remark || '-'}</td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>
    }
    const paymentTableData = () => {
        return <>
            <Row Col md="12" className='mt-4'>
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
                                <th>{`Interest Rate ${CostingPaymentTermDetails?.PaymentTermDetail?.PaymentTermApplicability === 'Fixed' ? '' : '(%)'}`}</th>
                                <th>{`Cost`}</th>
                                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                                <th>{`Remark`}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (CostingPaymentTermDetails?.PaymentTermDetail?.PaymentTermApplicability === null) ?
                                    <tr>
                                        <td colSpan={8}>
                                            <NoContentFound title={EMPTY_DATA} />
                                        </td>
                                    </tr> :
                                    <tr>
                                        <td>{CostingPaymentTermDetails?.PaymentTermDetail?.PaymentTermApplicability ? CostingPaymentTermDetails?.PaymentTermDetail?.PaymentTermApplicability : '-'}</td>
                                        <td>{CostingPaymentTermDetails?.PaymentTermDetail?.PaymentTermApplicability === 'Fixed' ? '-' : CostingPaymentTermDetails?.PaymentTermDetail?.RepaymentPeriod ? checkForDecimalAndNull(CostingPaymentTermDetails?.PaymentTermDetail?.RepaymentPeriod, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                        <td>{CostingPaymentTermDetails?.PaymentTermDetail?.InterestRate ? checkForDecimalAndNull(CostingPaymentTermDetails?.PaymentTermDetail?.InterestRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                        <td>{CostingPaymentTermDetails?.PaymentTermDetail?.NetCost ? checkForDecimalAndNull(CostingPaymentTermDetails?.PaymentTermDetail?.NetCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                        {initialConfiguration?.IsShowCRMHead && <td>{CostingPaymentTermDetails?.PaymentTermDetail?.PaymentTermCRMHead}</td>}
                                        <td>{CostingPaymentTermDetails?.PaymentTermDetail?.Remark ? CostingPaymentTermDetails?.PaymentTermDetail?.Remark : '-'}</td>
                                    </tr>
                            }

                        </tbody>
                    </Table>
                </Col>
            </Row></>
    }
    const NpvCost = () => {
        return <>
            <Row Col md="12" className='mt-4'>
                <Col md="12">
                    <div className="left-border">{"NPV Cost:"}</div>
                </Col>
            </Row>
            <Row>
                {/*REJECTION RENDERING */}

                <Col md="12">
                    <Table className="table cr-brdr-main add-min-width" size="sm">
                        <thead>
                            <tr className='thead'>
                                <th>{`Type of Investment`}</th>
                                {<th>{`Percentage (%)`}</th>}
                                {<th>{`Quantity`}</th>}
                                {<th>{`Total`}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {npvCostData &&
                                npvCostData.map((item, index) => {
                                    return (

                                        <tr key={index}>
                                            <td>{item.NpvType} </td>
                                            {<td>{checkForDecimalAndNull(item.NpvPercentage, getConfigurationKey().NoOfDecimalForPrice)}</td>}
                                            {<td>{checkForDecimalAndNull(item?.NpvQuantity, getConfigurationKey().NoOfDecimalForPrice)}</td>}
                                            {<td>{checkForDecimalAndNull(item?.NpvCost, getConfigurationKey().NoOfDecimalForPrice)}</td>}

                                        </tr>

                                    )
                                })}
                            {npvCostData && npvCostData.length === 0 && (
                                <tr>
                                    <td colspan="15">
                                        <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </Table>
                </Col>
            </Row></>
    }

    const yoyCost = () => {
        return <>
            {costingSummary && props?.isRfqCosting &&
                <>
                    <Row Col md="12" className='mt-4'>
                        <Col md="12">
                            <div className="left-border">{"YOY Cost:"}</div>
                        </Col>
                    </Row>
                    <Row Col md="12">

                        <YOYCost
                            outside={true}
                            NetPOPrice={props.netPOPrice}
                            setValue={setValue}
                            getValues={getValues}
                            control={control}
                            register={register}
                            errors={errors}
                            activeTab={'6'}
                            patId={partId}
                            vendorId={vendorId}
                            hideAddButton={true}
                            quotationId={viewCostingData[costingIndex]?.QuotationId}
                            isRfqCosting={props?.isRfqCosting}
                        />
                    </Row>
                </>
            }
        </>
    }
    const closeCalculator = () => {
        setState(prev => ({ ...prev, openWeightCalculator: false }))
    }
    return (

        <div>
            {!props.isPDFShow ? <Drawer anchor={props.anchor} open={props.isOpen}
            >
                {isLoader && <LoaderCustom />}
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-820px'}>

                            <Row className="drawer-heading">
                                <Col className='pl-0'>
                                    <div className={'header-wrapper left'}>
                                        <h3>{'Discount & Other Cost'}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <div className='hidepage-size'>
                                {costingSummary && DiscountCost()}
                                {costingSummary && OtherCost()}
                                {costingSummary && modelShowDataForIcc()}
                                {costingSummary && iccPaymentData?.ICCApplicabilityDetail?.ICCMethod !== "Credit Based" && iccTableData()}
                                {costingSummary && paymentTableData()}
                                {costingSummary && npvCostData && NpvCost()}
                                {/* {initialConfiguration?.IsShowNpvCost && costingSummary &&
                                    <>
                                        <Col md="12" className='mt-4'>
                                            <HeaderTitle className="border-bottom"
                                                title={'NPV Cost'}
                                                customClass={'underLine-title'}
                                            />
                                        </Col>
                                    </>
                                }
                                {initialConfiguration?.IsShowNpvCost && costingSummary && <NpvCost showAddButton={false} tableData={tableData} hideAction={costingSummary} />} */}
                                {initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingSummary && !props?.isRfqCosting &&
                                    <div className='firefox-spaces pb-3'>
                                        <Col md="12" className={'mt-4 firefox-spaces '}>
                                            <HeaderTitle className="border-bottom firefox-spaces"
                                                title={'Costing Condition'}
                                                customClass={'underLine-title'}
                                            />
                                        </Col>
                                        <ConditionCosting hideAction={true} tableData={conditionTableData} isFromImport={true} currency={{ label: showCurrency }} />
                                    </div>}
                                {costingSummary && yoyCost()}

                            </div>
                            {state.openWeightCalculator && <IccCalculator
                                anchor={`right`}
                                isOpen={state.openWeightCalculator}
                                closeCalculator={closeCalculator}
                                CostingViewMode={true}
                                iccInterestRateId={iccPaymentData?.ICCApplicabilityDetail?.InterestRateId}
                                costingId={viewCostingData[costingIndex]?.costingId}
                                isCostingSummary={true}
                            />}
                        </div>
                    </Container>
                </div>
            </Drawer> : <>
                {gridData && gridData.length !== 0 && OtherCost()}
                {/* {tableData && tableData.length !== 0 && <>
                    <Col md="12">
                        <HeaderTitle className="border-bottom"
                            title={'NPV Cost'}
                            customClass={'underLine-title'}
                        />
                    </Col>
                    <NpvCost showAddButton={false} tableData={tableData} hideAction={costingSummary} />
                </>} */}
                {conditionTableData && conditionTableData.length !== 0 && <> <Col md="12" className={'mt25 firefox-10'}>
                    <HeaderTitle className="border-bottom"
                        title={'Costing Condition'}
                        customClass={'underLine-title'}
                    />
                </Col>
                    <ConditionCosting hideAction={true} tableData={conditionTableData} />
                </>}
            </>}
        </div >

    )
}
export default React.memo(ViewOtherCostDrawer)