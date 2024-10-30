import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, decimalAndNumberValidationBoolean, getConfigurationKey, } from '../../../../../helper';
import { getInventoryDataByHeads, gridDataAdded, isOverheadProfitDataChange, setOverheadProfitErrors, } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import { CBCTypeId, CRMHeads, EMPTY_GUID, NFRTypeId, VBCTypeId, WACTypeId, ZBCTypeId } from '../../../../../config/constants';
import Switch from "react-switch";
import DayTime from '../../../../common/DayTimeWrapper';
import { MESSAGES } from '../../../../../config/message';
import WarningMessage from '../../../../common/WarningMessage';
import { number, percentageLimitValidation, checkWhiteSpaces, NoSignNoDecimalMessage, isNumber } from "../../../../../helper/validation";
import { reactLocalStorage } from 'reactjs-localstorage';
import Popup from 'reactjs-popup';
import { IdForMultiTechnology, REMARKMAXLENGTH } from '../../../../../config/masterData';
import Toaster from '../../../../common/Toaster';

let counter = 0;
function Icc(props) {

    const { Controller, control, register, data, setValue, getValues, errors, useWatch, CostingInterestRateDetail } = props
    const headerCosts = useContext(netHeadCostContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);

    const ICCApplicabilityDetail = CostingInterestRateDetail && CostingInterestRateDetail.ICCApplicabilityDetail !== null ? CostingInterestRateDetail.ICCApplicabilityDetail : {}
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { IsIncludedSurfaceInOverheadProfit, OverheadProfitTabData, includeOverHeadProfitIcc, includeToolCostIcc, ToolTabData } = useSelector(state => state.costing)


    const [InventoryObj, setInventoryObj] = useState(ICCApplicabilityDetail)
    const [tempInventoryObj, setTempInventoryObj] = useState(ICCApplicabilityDetail)
    const [isPartApplicability, setIsPartApplicability] = useState(false)

    const [IsInventoryApplicable, setIsInventoryApplicable] = useState(CostingInterestRateDetail && CostingInterestRateDetail.IsInventoryCarringCost ? true : false)
    const [ICCapplicability, setICCapplicability] = useState(ICCApplicabilityDetail !== undefined ? { label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability } : {})

    const [ICCInterestRateId, setICCInterestRateId] = useState(ICCApplicabilityDetail !== undefined ? ICCApplicabilityDetail.InterestRateId : '')
    const [InterestRateFixedLimit, setInterestRateFixedLimit] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isNetWeight, setIsNetWeight] = useState((ICCApplicabilityDetail?.IsICCCalculationOnNetWeight) ? (ICCApplicabilityDetail?.IsICCCalculationOnNetWeight) : false)
    const [IsShowRmcAndNetWeightToggleForIcc, setIsShowRmcAndNetWeightToggleForIcc] = useState(reactLocalStorage.getObject('InitialConfiguration')?.IsShowRmcAndNetWeightToggleForIcc)
    const [totalOverHeadAndProfit, setTotalOverHeadAndProfit] = useState((OverheadProfitTabData[0]?.CostingPartDetails?.TotalOverheadAndProfitPerAssembly) ? (OverheadProfitTabData[0]?.CostingPartDetails?.TotalOverheadAndProfitPerAssembly) : 0)
    const { CostingEffectiveDate } = useSelector(state => state.costing)

    // partType USED FOR MANAGING CONDITION IN CASE OF NORMAL COSTING AND ASSEMBLY TECHNOLOGY COSTING (TRUE FOR ASSEMBLY TECHNOLOGY)
    const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData?.CostingTypeId === WACTypeId)

    const dispatch = useDispatch()

    const interestRateValues = useWatch({
        control,
        name: ['InterestRatePercentage',],
    });

    useEffect(() => {
        if (ICCapplicability && ICCapplicability.label === 'Part Cost') {
            setIsPartApplicability(true)
        }
    }, [ICCapplicability])


    /**
     * @method onPressInventory
     * @description  USED TO HANDLE INVENTORY CHANGE
     */
    const onPressInventory = (value) => {

        setIsInventoryApplicable(!IsInventoryApplicable)

        callInventoryAPI(value)

        dispatch(gridDataAdded(true))
        dispatch(isOverheadProfitDataChange(true))
        setInterestRateFixedLimit(false)
    }


    const onPressRmc = (value) => {

        setIsNetWeight(!isNetWeight)

    }

    /**
     * @method callInventoryAPI
     * @description When we toogle on ICC to call API
    */
    const callInventoryAPI = (callAPI) => {
        if (Object.keys(costData).length > 0 && callAPI && !CostingViewMode) {
            const reqParams = {
                VendorId: (costData?.CostingTypeId === VBCTypeId || costData?.CostingTypeId === NFRTypeId) ? costData?.VendorId : EMPTY_GUID,
                costingTypeId: Number(costData?.CostingTypeId) === NFRTypeId ? VBCTypeId : Number(costData?.CostingTypeId === WACTypeId) ? ZBCTypeId : costData?.CostingTypeId,
                plantId: (getConfigurationKey()?.IsPlantRequiredForOverheadProfitInterestRate && costData?.CostingTypeId === ZBCTypeId) ? costData?.PlantId : ((getConfigurationKey()?.IsDestinationPlantConfigure && costData?.CostingTypeId === VBCTypeId) || costData?.CostingTypeId === CBCTypeId || costData?.CostingTypeId === NFRTypeId) ? costData?.DestinationPlantId : EMPTY_GUID,
                customerId: costData?.CostingTypeId === CBCTypeId ? costData?.CustomerId : EMPTY_GUID,
                effectiveDate: CostingEffectiveDate ? (DayTime(CostingEffectiveDate).format('DD/MM/YYYY')) : '',
                rawMaterialGradeId: initialConfiguration.IsShowRawMaterialInOverheadProfitAndICC ? OverheadProfitTabData[0]?.CostingPartDetails?.RawMaterialGradeId : EMPTY_GUID,
                rawMaterialChildId: initialConfiguration.IsShowRawMaterialInOverheadProfitAndICC ? OverheadProfitTabData[0]?.CostingPartDetails?.RawMaterialChildId : EMPTY_GUID,
                technologyId: null,
            }
            dispatch(getInventoryDataByHeads(reqParams, res => {
                if (res && res.data && res.data?.Result) {
                    let Data = res.data?.Data;
                    setValue('InterestRatePercentage', Data?.InterestRate)
                    setICCInterestRateId(Data?.InterestRateId !== null ? Data?.InterestRateId : EMPTY_GUID)
                    setICCapplicability({ label: Data?.ICCApplicability, value: Data?.ICCApplicability })
                    setInventoryObj(Data)
                    checkInventoryApplicability(Data?.ICCApplicability)

                    props.setICCDetail(Data, { BOMLevel: data?.BOMLevel, PartNumber: data?.PartNumber })
                } else if (res && res.status === 204) {
                    setValue('InterestRatePercentage', '')
                    setValue('CostApplicability', '')
                    setValue('NetICCTotal', '')
                    checkInventoryApplicability('')
                    setICCapplicability([])
                    setInventoryObj({})
                }

            }))
        } else {
            setICCapplicability([])
            if (!CostingViewMode) {
                // props.setICCDetail(null, { BOMLevel: data?.BOMLevel, PartNumber: data?.PartNumber })  OPENING THIS CREATED CLEARING OF OVERHEAD REDUCER WHEN CLOSE ICC TOGGLE
            }
        }
    }

    useEffect(() => {

        if (ICCApplicabilityDetail) {
            setValue('crmHeadIcc', ICCApplicabilityDetail.ICCCRMHead ? { label: ICCApplicabilityDetail.ICCCRMHead, value: 1 } : '')
            setValue('iccRemark', ICCApplicabilityDetail.Remark ? ICCApplicabilityDetail.Remark : '')
        }

    }, [])

    /**
    * @description SET VALUE IN NetICCTotal WHEN FIXED AND ENABLED 'InterestRatePercentage'
    */
    useEffect(() => {
        if (ICCapplicability && ICCapplicability.label === 'Fixed') {
            setValue('NetICCTotal', getValues('InterestRatePercentage'))
        }
    }, [interestRateValues])

    useEffect(() => {
        setTotalOverHeadAndProfit(OverheadProfitTabData[0]?.CostingPartDetails?.TotalOverheadAndProfitPerAssembly)
    }, [OverheadProfitTabData[0]?.CostingPartDetails?.TotalOverheadAndProfitPerAssembly])

    /**
      * @method checkInventoryApplicability
      * @description INVENTORY APPLICABILITY CALCULATION
      */
    const checkInventoryApplicability = (Text) => {
        if (headerCosts !== undefined && Text !== '' && !CostingViewMode) {

            let NetRawMaterialsCost;
            if (isNetWeight && !(costData?.IsAssemblyPart) && !(isPartApplicability)) {
                let rmValue = JSON.parse(sessionStorage.getItem('costingArray'))
                let newRmCost = (Array.isArray(rmValue) && rmValue[0]?.CostingPartDetails?.CostingRawMaterialsCost[0]?.RMRate) * (Array.isArray(rmValue) && rmValue[0]?.CostingPartDetails?.CostingRawMaterialsCost[0]?.FinishWeight)
                NetRawMaterialsCost = newRmCost
            } else {
                NetRawMaterialsCost = headerCosts.NetRawMaterialsCost
            }
            const toolCost = checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost)
            const ConversionCostForCalculation = costData?.IsAssemblyPart ? (checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly)) + checkForNull(includeToolCostIcc ? toolCost : 0) : headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal + checkForNull(includeToolCostIcc ? toolCost : 0);
            const RMBOPCC = NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation + checkForNull(includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0)
            const RMBOP = NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + checkForNull(includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0);
            const RMCC = NetRawMaterialsCost + ConversionCostForCalculation + checkForNull(includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0);
            const BOPCC = headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation + checkForNull(includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0);
            const InterestRatePercentage = getValues('InterestRatePercentage')

            switch (Text) {
                case 'RM':
                case 'Part Cost':
                    if ((partType && Text === 'Part Cost') || (!partType && Text === 'RM')) {
                        setValue('CostApplicability', checkForDecimalAndNull(NetRawMaterialsCost + checkForNull(includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0), initialConfiguration.NoOfDecimalForPrice))
                        setValue('NetICCTotal', checkForDecimalAndNull((NetRawMaterialsCost + checkForNull((includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0))) * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
                        setTempInventoryObj({
                            ...tempInventoryObj,
                            CostApplicability: checkForNull(NetRawMaterialsCost) + checkForNull((includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0)),
                            NetICCTotal: checkForNull(NetRawMaterialsCost + checkForNull((includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0))) * calculatePercentage(InterestRatePercentage)
                        })
                    }
                    break;

                case 'BOP':
                    setValue('CostApplicability', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice))
                    setValue('NetICCTotal', checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost + checkForNull(includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0)) * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
                    setTempInventoryObj({
                        ...tempInventoryObj,
                        CostApplicability: checkForNull(headerCosts.NetBoughtOutPartCost) + (includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0),
                        NetICCTotal: (checkForNull(headerCosts?.NetBoughtOutPartCost) + (includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0)) * calculatePercentage(InterestRatePercentage)
                    })
                    break;

                case 'CC':
                    setValue('CostApplicability', checkForDecimalAndNull(ConversionCostForCalculation, initialConfiguration.NoOfDecimalForPrice))
                    setValue('NetICCTotal', checkForDecimalAndNull((checkForNull(ConversionCostForCalculation) + checkForNull(includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0)) * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
                    setTempInventoryObj({
                        ...tempInventoryObj,
                        CostApplicability: checkForNull(ConversionCostForCalculation) + (includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0),
                        NetICCTotal: (checkForNull(ConversionCostForCalculation) + (includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0)) * calculatePercentage(InterestRatePercentage)
                    })
                    break;

                case 'RM + CC':
                case 'Part Cost + CC':
                    if ((partType && Text === 'Part Cost + CC') || (!partType && Text === 'RM + CC')) {
                        setValue('CostApplicability', checkForDecimalAndNull(RMCC, initialConfiguration.NoOfDecimalForPrice))
                        setValue('NetICCTotal', checkForDecimalAndNull((RMCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                        setTempInventoryObj({
                            ...tempInventoryObj,
                            CostApplicability: checkForNull(RMCC),
                            NetICCTotal: checkForNull(RMCC) * calculatePercentage(InterestRatePercentage)
                        })
                    }
                    break;

                case 'RM + BOP':
                case 'Part Cost + BOP':

                    if ((partType && Text === 'Part Cost + BOP') || (!partType && Text === 'RM + BOP')) {
                        setValue('CostApplicability', checkForDecimalAndNull(RMBOP, initialConfiguration.NoOfDecimalForPrice))
                        setValue('NetICCTotal', checkForDecimalAndNull((RMBOP * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                        setTempInventoryObj({
                            ...tempInventoryObj,
                            CostApplicability: checkForNull(RMBOP),
                            NetICCTotal: checkForNull(RMBOP) * calculatePercentage(InterestRatePercentage)
                        })
                    }
                    break;

                case 'BOP + CC':
                    setValue('CostApplicability', checkForDecimalAndNull(BOPCC, initialConfiguration.NoOfDecimalForPrice))
                    setValue('NetICCTotal', checkForDecimalAndNull((BOPCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setTempInventoryObj({
                        ...tempInventoryObj,
                        CostApplicability: checkForNull(BOPCC),
                        NetICCTotal: checkForNull(BOPCC) * calculatePercentage(InterestRatePercentage)
                    })
                    break;

                case 'RM + CC + BOP':
                case 'Part Cost + CC + BOP':
                    if ((partType && Text === 'Part Cost + CC + BOP') || (!partType && Text === 'RM + CC + BOP')) {
                        setValue('CostApplicability', checkForDecimalAndNull(RMBOPCC, initialConfiguration.NoOfDecimalForPrice)) //NEED TO ASK HERE ALSO
                        setValue('NetICCTotal', checkForDecimalAndNull((RMBOPCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                        setTempInventoryObj({
                            ...tempInventoryObj,
                            CostApplicability: checkForNull(RMBOPCC),
                            NetICCTotal: checkForNull(RMBOPCC) * calculatePercentage(InterestRatePercentage)
                        })
                    }
                    break;

                case 'Fixed':
                    setValue('CostApplicability', '-')
                    setValue('NetICCTotal', checkForDecimalAndNull(checkForNull(InterestRatePercentage) + checkForNull(includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0), initialConfiguration.NoOfDecimalForPrice))
                    setTempInventoryObj({
                        ...tempInventoryObj,
                        CostApplicability: '-',
                        NetICCTotal: checkForNull(InterestRatePercentage) + (includeOverHeadProfitIcc ? totalOverHeadAndProfit : 0)
                    })
                    break;

                case 'Annual ICC (%)':
                    setValue('CostApplicability', checkForDecimalAndNull(RMBOPCC, initialConfiguration.NoOfDecimalForPrice)) // NEED TO ASK HERE ALSO
                    setValue('NetICCTotal', checkForDecimalAndNull((RMBOPCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setTempInventoryObj({
                        ...tempInventoryObj,
                        CostApplicability: checkForNull(RMBOPCC),
                        NetICCTotal: checkForNull(RMBOPCC) * calculatePercentage(InterestRatePercentage)
                    })
                    break;

                case 'Net Cost':
                    setValue('CostApplicability', checkForDecimalAndNull(RMBOPCC, initialConfiguration.NoOfDecimalForPrice)) //NEED TO ASK HERE ALSO
                    setValue('NetICCTotal', checkForDecimalAndNull((RMBOPCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
                    setTempInventoryObj({
                        ...tempInventoryObj,
                        CostApplicability: checkForNull(RMBOPCC),
                        NetICCTotal: checkForNull(RMBOPCC) * calculatePercentage(InterestRatePercentage)
                    })
                    break;

                default:
                    break;
            }
        }
    }


    useEffect(() => {
        checkInventoryApplicability(ICCapplicability?.label)
    }, [interestRateValues, IsIncludedSurfaceInOverheadProfit, ICCapplicability, isNetWeight, includeOverHeadProfitIcc, totalOverHeadAndProfit, includeToolCostIcc]);


    useEffect(() => {
        setTimeout(() => {

            let tempObj = {
                "InterestRateId": ICCapplicability.label !== 'Fixed' ? (ICCApplicabilityDetail ? ICCInterestRateId : '') : null,
                "IccDetailId": InventoryObj ? InventoryObj.InterestRateId : '',
                "ICCApplicability": Object.keys(ICCapplicability).length > 0 ? ICCapplicability.label : '',
                "CostApplicability": IsInventoryApplicable ? tempInventoryObj.CostApplicability : '',
                "InterestRate": IsInventoryApplicable ? getValues('InterestRatePercentage') : '',
                "NetCost": IsInventoryApplicable ? tempInventoryObj.NetICCTotal : '',
                "EffectiveDate": "",
                "IsICCCalculationOnNetWeight": isNetWeight,
                "ICCCRMHead": tempInventoryObj.ICCCRMHead ? tempInventoryObj.ICCCRMHead : '',
                "Remark": tempInventoryObj.Remark ? tempInventoryObj.Remark : ''
            }
            setValue('CostApplicability', IsInventoryApplicable ? checkForDecimalAndNull(tempInventoryObj.CostApplicability, initialConfiguration.NoOfDecimalForPrice) : '')
            if (!CostingViewMode) {

                props.setICCDetail(tempObj, { BOMLevel: data?.BOMLevel, PartNumber: data?.PartNumber })
            }
        }, 200)
    }, [tempInventoryObj])

    const handleChangeInterestRateFixedLimit = (event) => {
        let message = ''
        if (decimalAndNumberValidationBoolean(event.target.value)) {
            setInterestRateFixedLimit(true)
            message = MESSAGES.OTHER_VALIDATION_ERROR_MESSAGE
        } if (!isNumber(event.target.value)) {
            setInterestRateFixedLimit(true)
            message = NoSignNoDecimalMessage
        }
        setErrorMessage(message)
        dispatch(isOverheadProfitDataChange(true))
    }

    if (Object.keys(errors).length > 0 && counter < 2) {
        counter = counter + 1;
        dispatch(setOverheadProfitErrors(errors))
    } else if (Object.keys(errors).length === 0 && counter > 0) {
        counter = 0
        dispatch(setOverheadProfitErrors({}))
    }

    const handleCrmHeadChange = (e) => {
        if (e) {
            setTempInventoryObj({
                ...tempInventoryObj,
                ICCCRMHead: e?.label
            })
        }

    }

    const onRemarkPopUpClickIcc = () => {

        if (errors.iccRemark !== undefined) {
            return false
        }

        setTempInventoryObj({
            ...tempInventoryObj,
            Remark: getValues('iccRemark')
        })


        if (getValues(`iccRemark`)) {
            Toaster.success('Remark saved successfully')
        }
        var button = document.getElementById(`popUpTriggerIcc`)
        button.click()
    }

    const onRemarkPopUpCloseIcc = () => {
        let button = document.getElementById(`popUpTriggerIcc`)
        setValue(`iccRemark`, tempInventoryObj.Remark)
        if (errors.iccRemark) {
            delete errors.iccRemark;
        }
        button.click()
    }

    return (
        <>
            <Row className="mt-15 pt-15">
                <Col md="12" className="switch mb-2">
                    <label className="switch-level" id="Inventory_Carrying_Cost_switch">
                        <Switch
                            onChange={onPressInventory}
                            checked={IsInventoryApplicable}
                            id="normal-switch"
                            disabled={CostingViewMode ? true : false}
                            background="#4DC771"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#CCC"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={20}
                            width={46}
                        />
                        <div className={'right-title'}>Inventory Carrying Cost</div>
                    </label>
                </Col>
            </Row>

            {IsInventoryApplicable &&
                <>
                    {initialConfiguration.IsShowCRMHead && <Col md="3">
                        <SearchableSelectHookForm
                            name={`crmHeadIcc`}
                            type="text"
                            label="CRM Head"
                            errors={errors.crmHeadIcc}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{
                                required: false,
                            }}
                            placeholder={'Select'}
                            options={CRMHeads}
                            required={false}
                            handleChange={handleCrmHeadChange}
                            disabled={CostingViewMode}
                        />
                    </Col>}

                    <Row>
                        <Col md="11" className='first-section'>
                            <Row className="costing-border-inner-section border-bottom-none m-0">
                                <Col md={ICCapplicability?.label?.includes('RM') && !(costData?.IsAssemblyPart) && IsShowRmcAndNetWeightToggleForIcc ? '2' : '3'}>
                                    <span className="head-text">
                                        Applicability
                                    </span>
                                </Col>
                                <Col md={ICCapplicability?.label?.includes('RM') && !(costData?.IsAssemblyPart) && IsShowRmcAndNetWeightToggleForIcc ? '2' : '3'}>
                                    <span className="head-text">
                                        {ICCapplicability.label !== 'Fixed' ? 'Interest Rate (%)' : 'Interest Rate'}
                                    </span>
                                </Col>

                                {ICCapplicability?.label?.includes('RM') && !(costData?.IsAssemblyPart) && IsShowRmcAndNetWeightToggleForIcc && <Col md="2"></Col>}
                                {ICCapplicability.label !== 'Fixed' && <Col md="3">
                                    <span className="head-text">
                                        Cost (Applicability)
                                    </span>
                                </Col>}
                                <Col md={ICCapplicability.label === 'Fixed' ? '6' : '3'}>
                                    <span className="head-text">
                                        Net ICC
                                    </span>
                                </Col>
                            </Row>
                            <Row className="costing-border costing-border-with-labels  pt-3 m-0 overhead-profit-tab-costing">
                                <>
                                    <Col md={ICCapplicability?.label?.includes('RM') && !(costData?.IsAssemblyPart) && IsShowRmcAndNetWeightToggleForIcc ? '2' : '3'}>
                                        <label className="col-label">
                                            {ICCapplicability.label}
                                        </label>
                                    </Col>

                                    <Col md={ICCapplicability?.label?.includes('RM') && !(costData?.IsAssemblyPart) && IsShowRmcAndNetWeightToggleForIcc ? '2' : '3'}>
                                        {ICCapplicability.label !== 'Fixed' ?
                                            <TextFieldHookForm
                                                label={false}
                                                name={'InterestRatePercentage'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                    max: {
                                                        value: 100,
                                                        message: 'Percentage cannot be greater than 100'
                                                    },
                                                }}
                                                handleChange={() => { dispatch(isOverheadProfitDataChange(true)) }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.InterestRatePercentage}
                                                disabled={(CostingViewMode || ICCapplicability.label !== 'Fixed') ? true : false}
                                            />
                                            :
                                            <div className='p-relative error-wrapper'>
                                                <TextFieldHookForm
                                                    label={false}
                                                    name={'InterestRatePercentage'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    handleChange={(e) => handleChangeInterestRateFixedLimit(e)}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    disabled={CostingViewMode ? true : false}
                                                />
                                                {ICCapplicability.label === 'Fixed' && InterestRateFixedLimit && <WarningMessage dClass={"error-message fixed-error"} message={errorMessage} />}           {/* //MANUAL CSS FOR ERROR VALIDATION MESSAGE */}
                                            </div>}
                                    </Col>
                                    {ICCapplicability?.label?.includes('RM') && !(costData?.IsAssemblyPart) && IsShowRmcAndNetWeightToggleForIcc && <Col md="2" className="switch mb-2 d-flex justify-content-center pl-4">
                                        <label className="switch-level">
                                            <div className={'right-title mr-2'}>RMC</div>
                                            <Switch
                                                onChange={onPressRmc}
                                                checked={isNetWeight}
                                                id="normal-switch"
                                                disabled={CostingViewMode ? true : false}
                                                background="#4DC771"
                                                onColor="#4DC771"
                                                onHandleColor="#ffffff"
                                                offColor="#CCC"
                                                uncheckedIcon={false}
                                                checkedIcon={false}
                                                height={20}
                                                width={46}
                                            />
                                            <div className={'right-title word-nowrap'}>Net Weight</div>
                                        </label>
                                    </Col>}
                                    {ICCapplicability.label !== 'Fixed' &&
                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={false}
                                                name={'CostApplicability'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.CostApplicability}
                                                disabled={true}
                                            />
                                        </Col>}
                                    <Col md={ICCapplicability.label === 'Fixed' ? '6' : '3'}>
                                        <TextFieldHookForm
                                            label={false}
                                            name={'NetICCTotal'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.NetICCTotal}
                                            disabled={true}
                                        />
                                    </Col>
                                </>
                            </Row>
                        </Col>
                        <Col md="1" className='second-section pr-2'>
                            <div className='costing-border-inner-section'>
                                <Col md="12" className='text-center'>Remark</Col>
                                <Col md="12">
                                    <Popup trigger={<button id={`popUpTriggerIcc`} title="Remark" className="Comment-box" type={'button'} />}
                                        position="top center">
                                        <TextAreaHookForm
                                            label="Remark:"
                                            name={`iccRemark`}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                maxLength: REMARKMAXLENGTH
                                            }}
                                            handleChange={() => { }}
                                            className=""
                                            customClassName={"withBorder"}
                                            errors={errors.iccRemark}
                                            disabled={CostingViewMode}
                                            hidden={false}
                                        />
                                        <Row>
                                            <Col md="12" className='remark-btn-container'>
                                                <button className='submit-button mr-2' disabled={(CostingViewMode) ? true : false} onClick={() => onRemarkPopUpClickIcc()} > <div className='save-icon'></div> </button>
                                                <button className='reset' onClick={() => onRemarkPopUpCloseIcc()} > <div className='cancel-icon'></div></button>
                                            </Col>
                                        </Row>
                                    </Popup>
                                </Col>
                            </div>
                        </Col>
                    </Row>

                </>
            }
        </>
    );
}

export default Icc;