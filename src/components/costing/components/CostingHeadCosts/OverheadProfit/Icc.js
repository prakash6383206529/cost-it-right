import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, decimalAndNumberValidationBoolean, getConfigurationKey, } from '../../../../../helper';
import { getIccDataByModelType, gridDataAdded, isIccDataChange, isOverheadProfitDataChange, setDisableIccCheckBox, setIccCost, setIsCalculatorExist, setOverheadProfitErrors, } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import { CBCTypeId, CRMHeads, EMPTY_GUID, NCCTypeId, NFRTypeId, VBCTypeId, WACTypeId, ZBCTypeId } from '../../../../../config/constants';
import Switch from "react-switch";
import DayTime from '../../../../common/DayTimeWrapper';
import { MESSAGES } from '../../../../../config/message';
import WarningMessage from '../../../../common/WarningMessage';
import { number, percentageLimitValidation, checkWhiteSpaces, NoSignNoDecimalMessage, isNumber, maxLength7 } from "../../../../../helper/validation";
import { reactLocalStorage } from 'reactjs-localstorage';
import Popup from 'reactjs-popup';
import { IdForMultiTechnology, REMARKMAXLENGTH } from '../../../../../config/masterData';
import Toaster from '../../../../common/Toaster';
import { fetchModelTypeAPI } from '../../../../../actions/Common';
import TableRenderer from '../../../../common/TableRenderer';
import IccCalculator from './IccCalculator';

let counter = 0;
function Icc(props) {

    const { Controller, control, register, data, setValue, getValues, errors, useWatch } = props

    const headerCosts = useContext(netHeadCostContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);


    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { IsIncludedSurfaceInOverheadProfit, OverheadProfitTabData, includeOverHeadProfitIcc, includeToolCostIcc, ToolTabData, costingDetailForIcc, IsIncludeApplicabilityForChildPartsInICC } = useSelector(state => state.costing)
    const ICCApplicabilityDetail = costingDetailForIcc && costingDetailForIcc.ICCApplicabilityDetail !== null ? costingDetailForIcc.ICCApplicabilityDetail : {}
    const [InventoryObj, setInventoryObj] = useState(ICCApplicabilityDetail)
    const [tempInventoryObj, setTempInventoryObj] = useState(ICCApplicabilityDetail)
    const [isPartApplicability, setIsPartApplicability] = useState(false)

    const [IsInventoryApplicable, setIsInventoryApplicable] = useState(costingDetailForIcc && costingDetailForIcc.IsInventoryCarringCost ? true : false)
    const [ICCapplicability, setICCapplicability] = useState(ICCApplicabilityDetail !== undefined ? { label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability } : {})

    const [ICCInterestRateId, setICCInterestRateId] = useState(ICCApplicabilityDetail !== undefined ? ICCApplicabilityDetail.InterestRateId : '')
    const [InterestRateFixedLimit, setInterestRateFixedLimit] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isNetWeight, setIsNetWeight] = useState((ICCApplicabilityDetail?.IsICCCalculationOnNetWeight) ? (ICCApplicabilityDetail?.IsICCCalculationOnNetWeight) : false)
    const [totalOverHeadAndProfit, setTotalOverHeadAndProfit] = useState((OverheadProfitTabData?.[0]?.CostingPartDetails?.TotalOverheadAndProfitPerAssembly) ? (OverheadProfitTabData[0]?.CostingPartDetails?.TotalOverheadAndProfitPerAssembly) : 0)
    const { CostingEffectiveDate, IsCalculatorExist } = useSelector(state => state.costing)
    const [state, setState] = useState({
        iccDetails: ICCApplicabilityDetail?.ICCCostingApplicabilityDetails,
        modelType: Object.keys(InventoryObj).length !== 0 ? { label: InventoryObj?.ICCModelType, value: InventoryObj?.ICCModelTypeId } : '',
        isApplyInventoryDay: ICCApplicabilityDetail?.IsApplyInventoryDay,
        iccMethod: InventoryObj?.ICCMethod,
        openCalculatorIcc: false,
        totalIccPayable: ICCApplicabilityDetail?.ICCPayableToSupplierCost,
        totalIccReceivable: ICCApplicabilityDetail?.ICCReceivableFromSupplierCost,
        totalIccNetCost: costingDetailForIcc?.NetICC,
        markUpFactor: ICCApplicabilityDetail?.MarkupFactor
    })

    // partType USED FOR MANAGING CONDITION IN CASE OF NORMAL COSTING AND ASSEMBLY TECHNOLOGY COSTING (TRUE FOR ASSEMBLY TECHNOLOGY)
    const IsMultiVendorCosting = useSelector(state => state.costing?.IsMultiVendorCosting);
    const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData?.CostingTypeId === WACTypeId || (costData?.PartType === 'Assembly' && IsMultiVendorCosting))

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
    useEffect(() => {
        dispatch(fetchModelTypeAPI('iccAndPaymentTerms', (res) => {
            let temp = [];
            res?.data?.SelectList?.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            setState(prev => ({
                ...prev,
                modelTypeList: temp
            }));
        }))
    }, [])
    useEffect(() => {
        dispatch(setIccCost({ NetCost: costingDetailForIcc?.NetICC }))
        if (!CostingViewMode) {
            callModelTypeApi(state.modelType)
        }
    }, [costingDetailForIcc, IsIncludeApplicabilityForChildPartsInICC])

    /**
     * @method onPressInventory
     * @description  USED TO HANDLE INVENTORY CHANGE
     */
    const onPressInventory = (value) => {
        setIsInventoryApplicable(!IsInventoryApplicable)
        dispatch(gridDataAdded(true))
        dispatch(isOverheadProfitDataChange(true))
        setInterestRateFixedLimit(false)
    }


    const onPressRmc = (value) => {

        setIsNetWeight(!isNetWeight)

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
        setTotalOverHeadAndProfit(OverheadProfitTabData?.[0]?.CostingPartDetails?.TotalOverheadAndProfitPerAssembly)
    }, [OverheadProfitTabData?.[0]?.CostingPartDetails?.TotalOverheadAndProfitPerAssembly])

    /**
      * @method checkInventoryApplicability
      * @description INVENTORY APPLICABILITY CALCULATION
      */
    const checkInventoryApplicability = (dataObj, IsApplyInventoryDay) => {
        if (headerCosts !== undefined && Text !== '' && !CostingViewMode) {
            let TopHeaderValues = OverheadProfitTabData && OverheadProfitTabData?.length > 0 && OverheadProfitTabData?.[0]?.CostingPartDetails !== undefined ? OverheadProfitTabData?.[0]?.CostingPartDetails : null;
            let NetRawMaterialsCost;
            if (isNetWeight && !(costData?.IsAssemblyPart) && !(isPartApplicability)) {
                let rmValue = JSON.parse(sessionStorage.getItem('costingArray'))
                let newRmCost = (Array.isArray(rmValue) && rmValue?.[0]?.CostingPartDetails?.CostingRawMaterialsCost?.[0]?.RMRate) * (Array.isArray(rmValue) && rmValue?.[0]?.CostingPartDetails?.CostingRawMaterialsCost?.[0]?.FinishWeight)
                NetRawMaterialsCost = newRmCost
            } else {
                NetRawMaterialsCost = headerCosts.NetRawMaterialsCost
            }

            const toolCost = checkForNull(ToolTabData?.[0]?.CostingPartDetails?.TotalToolCost)
            const ConversionCostForCalculation = costData?.IsAssemblyPart ? (checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly)) + checkForNull(includeToolCostIcc ? toolCost : 0) : headerCosts.NetProcessCost + headerCosts.NetOperationCost + checkForNull(includeToolCostIcc ? toolCost : 0);
            let totalCost = 0;
            if (Array.isArray(dataObj)) {
                // Create a map of existing data using unique identifier
                const existingData = {};
                dataObj.forEach(item => {
                    const uniqueId = `${item?.Applicability}_${item?.Percentage}`;
                    existingData[uniqueId] = {
                        NoOfDays: item?.NoOfDays,
                        Cost: item?.Cost,
                        TotalCost: item?.TotalCost
                    };
                });

                const updatedData = dataObj.map(item => {
                    let cost = 0;
                    switch (item?.Applicability) {
                        case 'RM':
                        case 'Part Cost':
                            cost = IsIncludeApplicabilityForChildPartsInICC ? checkForNull(TopHeaderValues?.NetChildPartsRawMaterialsCost) : checkForNull(headerCosts?.NetRawMaterialsCost); break;
                        case 'BOP':
                            cost = IsIncludeApplicabilityForChildPartsInICC ? checkForNull(TopHeaderValues?.NetChildPartsBoughtOutPartCost) + checkForNull(headerCosts?.NetBoughtOutPartCost) : checkForNull(headerCosts?.NetBoughtOutPartCost);
                            break;
                        case 'CC':
                            cost = IsIncludeApplicabilityForChildPartsInICC ? checkForNull(TopHeaderValues?.NetChildPartsConversionCost) + ConversionCostForCalculation : ConversionCostForCalculation; break;
                        case 'Overhead':
                            cost = checkForNull(includeOverHeadProfitIcc ? TopHeaderValues?.OverheadCost : 0)
                            break;
                        case 'Profit':
                            cost = checkForNull(includeOverHeadProfitIcc ? TopHeaderValues?.ProfitCost : 0)
                            break;
                        case 'Fixed':
                            cost = item.Cost;
                            totalCost = item?.TotalCost;
                            break;
                        case 'BOP Domestic':
                            cost = IsIncludeApplicabilityForChildPartsInICC ? checkForNull(TopHeaderValues?.NetChildPartsBoughtOutPartCost) + checkForNull(headerCosts?.NetBOPDomesticCost) : checkForNull(headerCosts?.NetBOPDomesticCost);;
                            break;
                        case 'BOP CKD':
                            cost = IsIncludeApplicabilityForChildPartsInICC ? checkForNull(TopHeaderValues?.NetChildPartsBoughtOutPartCost) + checkForNull(headerCosts?.NetBOPImportCost) : checkForNull(headerCosts?.NetBOPImportCost);;
                            break;
                        case 'BOP V2V':
                            cost = IsIncludeApplicabilityForChildPartsInICC ? checkForNull(TopHeaderValues?.NetChildPartsBoughtOutPartCost) + checkForNull(headerCosts?.NetBOPSourceCost) : checkForNull(headerCosts?.NetBOPSourceCost);;
                            break;
                        case 'BOP OSP':
                            cost = IsIncludeApplicabilityForChildPartsInICC ? checkForNull(TopHeaderValues?.NetChildPartsBoughtOutPartCost) + checkForNull(headerCosts?.NetBOPOutsourcedCost) : checkForNull(headerCosts?.NetBOPOutsourcedCost);;
                            break;
                        default:
                            cost = 0;
                            break;
                    }

                    const uniqueId = `${item?.Applicability}_${item?.Percentage}`;
                    const existingItem = existingData[uniqueId];

                    // Calculate total cost using item's own NoOfDays
                    if (item?.Applicability === 'Fixed') {
                        totalCost = item?.TotalCost;
                    } else if (IsApplyInventoryDay) {
                        const noOfDays = existingItem?.NoOfDays ?? 0;
                        totalCost = (cost * item?.Percentage * noOfDays) / (365 * 100);
                    } else {
                        totalCost = (cost * item?.Percentage) / (100);
                    }

                    return {
                        ...item,
                        Cost: cost,
                        TotalCost: totalCost,
                        NoOfDays: existingItem?.NoOfDays ?? 0
                    };
                });
                setState(prev => ({
                    ...prev,
                    iccDetails: updatedData,
                    totalIccCost: updatedData.reduce((sum, item) => sum + item.TotalCost, 0)
                }));
                dispatch(setIccCost({ NetCost: updatedData.reduce((sum, item) => sum + item?.TotalCost, 0) }))
                return;
            }
            dispatch(isIccDataChange(true))
        }
    }


    useEffect(() => {
        if (state?.iccDetails?.length > 0) {
            checkInventoryApplicability(state?.iccDetails, state?.isApplyInventoryDay)
        }
    }, [interestRateValues, IsIncludedSurfaceInOverheadProfit, ICCapplicability, isNetWeight, includeOverHeadProfitIcc, totalOverHeadAndProfit, includeToolCostIcc]);
    useEffect(() => {
        if (state.iccDetails && state.iccDetails?.length > 0) {
            const totalIccNetCost = state.iccDetails.reduce((sum, item) => {
                return sum + (item.TotalCost || 0);
            }, 0);

            // Now set it in state
            setState(prev => ({
                ...prev,
                totalIccNetCost: totalIccNetCost
            }));
            setValue('totalIccNetCost', checkForDecimalAndNull(totalIccNetCost, getConfigurationKey()?.NoOfDecimalForPrice))
        }
        // Only update if either InventoryObj or iccDetails have meaningful changes
        const hasChanges = JSON.stringify(InventoryObj) !== JSON.stringify(tempInventoryObj) ||
            JSON.stringify(state.iccDetails) !== JSON.stringify(tempInventoryObj?.ICCCostingApplicabilityDetails);
        if (hasChanges && !CostingViewMode) {
            // Create a map of existing ICC details using unique identifier
            const existingDetails = {};
            state?.iccDetails?.forEach(item => {
                const uniqueId = `${item?.Applicability}_${item?.Percentage}`;
                existingDetails[uniqueId] = item;
            });

            // Filter ICC details based on conditions while preserving existing data
            const filteredData = state?.iccDetails?.length > 0
                ? state.iccDetails.filter(item => {
                    const applicability = item?.Applicability;

                    // Hide Overhead and Profit if includeOverHeadProfitIcc is false
                    if (!includeOverHeadProfitIcc && (applicability === "Overhead" || applicability === "Profit")) {
                        return false;
                    }

                    // If includeChildPartCost is true, hide Part Cost
                    if (IsIncludeApplicabilityForChildPartsInICC && applicability === "Part Cost") {
                        return false;
                    }

                    // If includeChildPartCost is false, hide RM
                    if (!IsIncludeApplicabilityForChildPartsInICC && applicability === "RM") {
                        return false;
                    }

                    return true;
                }).map(item => {
                    const uniqueId = `${item?.Applicability}_${item?.Percentage}`;
                    const existingItem = existingDetails[uniqueId];
                    return existingItem ? { ...existingItem } : item;
                })
                : [];

            const tempObj = {
                ...InventoryObj,
                Remark: getValues('iccRemark'),
                ICCCostingApplicabilityDetails: filteredData
            }
            props.setICCDetail(tempObj, { BOMLevel: data?.BOMLevel, PartNumber: data?.PartNumber })
        }
    }, [InventoryObj, state.iccDetails, tempInventoryObj, CostingViewMode])

    useEffect(() => {
        if (ICCApplicabilityDetail?.ICCCostingApplicabilityDetails?.length > 0) {
            setState(prev => ({
                ...prev,
                iccDetails: ICCApplicabilityDetail?.ICCCostingApplicabilityDetails?.map(item => ({
                    ...item,
                    NoOfDays: item?.NoOfDays || 0,
                    Cost: item?.Cost || 0,
                    TotalCost: item?.TotalCost || 0
                }))
            }));
        }
    }, [ICCApplicabilityDetail]);

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
    const callModelTypeApi = (ModelTypeValues) => {
        if (ModelTypeValues && ModelTypeValues !== '' && ModelTypeValues.value !== undefined) {
            const reqParams = {
                ModelTypeId: ModelTypeValues?.value,
                VendorId: (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NFRTypeId) ? costData.VendorId : null,
                costingTypeId: Number(costData.CostingTypeId) === NFRTypeId ? VBCTypeId : Number(costData.CostingTypeId === WACTypeId) ? ZBCTypeId : costData.CostingTypeId,
                EffectiveDate: CostingEffectiveDate,
                plantId: (getConfigurationKey()?.IsPlantRequiredForOverheadProfitInterestRate && costData?.CostingTypeId !== VBCTypeId) ? costData.PlantId : (getConfigurationKey()?.IsDestinationPlantConfigure && costData?.CostingTypeId === VBCTypeId) || (costData?.CostingTypeId === CBCTypeId) || (costData?.CostingTypeId === NFRTypeId) ? costData.DestinationPlantId : EMPTY_GUID,
                customerId: costData.CustomerId,
                technologyId: null,
                partFamilyId: costData?.PartFamilyId,
                MethodTypeId: null,
                IsMultiVendorCosting: IsMultiVendorCosting
            }
            dispatch(getIccDataByModelType(reqParams, (res) => {
                let data = res?.data?.Data
                setInventoryObj(data)
                setValue('ICCMethod', data?.ICCMethod)
                setValue('InventoryDayType', data?.ApplicabilityBasedInventoryDayType)
                setValue('CreditBasedAnnualIcc', data?.CreditBasedAnnualICCPercent)

                // Preserve existing NoOfDays values
                const existingNoOfDays = {};
                state.iccDetails?.forEach(item => {
                    const uniqueId = `${item?.Applicability}_${item?.Percentage}`;
                    existingNoOfDays[uniqueId] = item?.NoOfDays;
                });

                const updatedIccDetails = data?.ICCCostingApplicabilityDetails?.map(item => {
                    const uniqueId = `${item?.Applicability}_${item?.Percentage}`;
                    return {
                        ...item,
                        NoOfDays: existingNoOfDays[uniqueId] ?? item?.NoOfDays
                    };
                });

                setState(prev => ({
                    ...prev,
                    iccDetails: updatedIccDetails,
                    isApplyInventoryDay: data?.IsApplyInventoryDay,
                    iccMethod: data?.ICCMethod
                }))
                if (data?.ICCMethod === 'Credit Based') {
                    dispatch(setDisableIccCheckBox(true))
                } else {
                    dispatch(setDisableIccCheckBox(false))
                }
                setICCInterestRateId(data?.InterestRateId)
                checkInventoryApplicability(updatedIccDetails, data?.IsApplyInventoryDay)
            }))
            dispatch(isIccDataChange(true))
        }
    }
    const handleModelTypeChange = (ModelTypeValues, IsDropdownClicked) => {
        setState(prev => ({
            ...prev,
            IsDropdownClicked: IsDropdownClicked,
            iccDetails: [],
            isApplyInventoryDay: false,
            modelType: ModelTypeValues,
            totalIccPayable: 0,
            totalIccReceivable: 0,
            totalIccNetCost: 0
        }))
        setValue('ICCMethod', '')
        setValue('InventoryDayType', '')
        setValue('totalIccPayable', 0)
        setValue('totalIccReceivable', 0)
        setValue('totalIccNetCost', 0)
        dispatch(setIsCalculatorExist(false))
        dispatch(setIccCost({ NetCost: 0 }))
        if (ModelTypeValues && ModelTypeValues !== '' && ModelTypeValues.value !== undefined) {
            callModelTypeApi(ModelTypeValues)
        } else {
            setState(prev => ({
                ...prev,
                modelType: [],
                gridData: []
            }))
        }
    }
    const handleInventoryDayTypeChange = (e, data, ind, col) => {
        let val = Number(e.target.value);
        const updatedInventoryDayType = state.iccDetails.map(item => {
            if (item.Applicability === data?.Applicability) {
                return { ...item, NoOfDays: val };
            }
            return item;
        });
        setState(prev => ({ ...prev, iccDetails: updatedInventoryDayType }));
        checkInventoryApplicability(updatedInventoryDayType, state.isApplyInventoryDay)
        dispatch(isOverheadProfitDataChange(true))
    };
    const handleApplicabilityCostChange = (e, data) => {
        let val = Number(e.target.value);
        const updatedInventoryDayType = state.iccDetails.map(item => {
            if (item.Applicability === data?.Applicability) {
                return { ...item, Cost: val, TotalCost: val, NoOfDays: 0 };
            }
            return item;
        });
        setState(prev => ({ ...prev, iccDetails: updatedInventoryDayType }));
        checkInventoryApplicability(updatedInventoryDayType, state.isApplyInventoryDay)
        dispatch(isOverheadProfitDataChange(true))
    }

    const Inventory_Day_Columns = [
        {
            columnHead: "ICC Applicabiity",
            key: "Applicability",
            identifier: "text",
        },
        {
            columnHead: "Percentage (%)",
            key: "Percentage",
            identifier: "inputOutput",
        },
        ...(InventoryObj?.IsApplyInventoryDay ? [
            {
                columnHead: "No. Of Days",
                key: "NoOfDays",
                identifier: "inputOutput",
                fieldKey: "InventoryDays",
                valueKey: "NoOfDays",
                mandatory: true,
                validate: { number, checkWhiteSpaces, maxLength7 },
                handleChangeFn: handleInventoryDayTypeChange,
                type: "textField",
                disabled: state.iccDetails?.map(item => item.Applicability).includes('Fixed') ? true : false
            },
        ] : []),
        ...(state.iccDetails?.map(item => item.Applicability).includes('Fixed') ? [
            {
                columnHead: "Applicability Cost",
                key: "Cost",
                identifier: "cost",
                fieldKey: "Cost",
                valueKey: "Cost",
                mandatory: true,
                validate: { number, checkWhiteSpaces, maxLength7 },
                handleChangeFn: handleApplicabilityCostChange,
                type: "textField",
            },
        ] : [{
            columnHead: "Applicability Cost",
            key: "Cost",
            identifier: "cost",
        }]),
        {
            columnHead: "Net Cost",
            key: "TotalCost",
            identifier: "cost"
        }

    ];

    const toggleWeightCalculator = () => {
        setState(prev => ({
            ...prev,
            openCalculatorIcc: !state.openCalculatorIcc
        }))
    }
    const closeCalculator = (formData, isCalculatorExist) => {
        if (isCalculatorExist) {
            setState(prev => ({
                ...prev,
                totalIccPayable: formData?.ICCPayableToSupplierCost,
                totalIccReceivable: formData?.ICCReceivableFromSupplierCost,
                totalIccNetCost: formData?.NetICC,
                markUpFactor: formData?.MarkupFactor
            }))
            dispatch(setIccCost({ NetCost: formData?.NetICC }))
            setValue('totalIccPayable', checkForDecimalAndNull(formData?.ICCPayableToSupplierCost, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('totalIccReceivable', checkForDecimalAndNull(formData?.ICCReceivableFromSupplierCost, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('totalIccNetCost', checkForDecimalAndNull(formData?.NetICC, getConfigurationKey()?.NoOfDecimalForPrice))
            setInventoryObj({
                ...InventoryObj,
                NetICC: formData?.NetICC,
                ICCPayableToSupplierCost: formData?.ICCPayableToSupplierCost,
                ICCReceivableFromSupplierCost: formData?.ICCReceivableFromSupplierCost,
                MarkupFactor: formData?.MarkupFactor
            })
            dispatch(setIsCalculatorExist(true))
            dispatch(isIccDataChange(true))

        } else {
            dispatch(setIsCalculatorExist(false))
        }
        setState(prev => ({
            ...prev,
            openCalculatorIcc: false
        }))
    }

    return (
        <>
            {/* <Row className="mt-15 pt-15 here">
                <Col md="12" className="switch mb-2"> */}
            {/* <label className="switch-level" id="Inventory_Carrying_Cost_switch">
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
                    </label> */}
            {/* </Col>
            </Row> */}

            {
                <>
                    <Row>
                        <Col md="3">
                            <SearchableSelectHookForm
                                label={'Model Type for Icc'}
                                name={'ModelTypeIcc'}
                                placeholder={'Select'}
                                Controller={Controller}
                                control={control}
                                rules={{ required: false }}
                                register={register}
                                defaultValue={state.modelType && Object.keys(state.modelType).length !== 0 ? state.modelType : ''}
                                options={state.modelTypeList}
                                mandatory={false}
                                disabled={CostingViewMode ? true : false}
                                handleChange={(ModelTypeValues) => {
                                    handleModelTypeChange(ModelTypeValues, true)
                                }}
                                errors={errors.ModelTypeIcc}
                                isClearable={true}
                            />
                        </Col>
                        {initialConfiguration?.IsShowCRMHead &&
                            <Col md="3">
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
                            </Col>
                        }
                    </Row>
                    <Row>
                        <Col md="3">
                            <TextFieldHookForm
                                name="ICCMethod"
                                label="ICC Method"
                                Controller={Controller}
                                control={control}
                                register={register}
                                placeholder="-"
                                mandatory={false}
                                handleChange={() => { }}
                                errors={errors.ICCMethod}
                                disabled={true}
                                customClassName={"withBorder"}
                                defaultValue={InventoryObj?.ICCMethod}
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
                                    checked={state.isApplyInventoryDay}
                                    disabled={true}
                                />
                                <span className="before-box" checked={state.isApplyInventoryDay} />
                            </label>
                        </Col>
                        {state.isApplyInventoryDay &&
                            state.iccMethod === 'Applicability Based' ? (<Col md="3">
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
                                    defaultValue={InventoryObj?.ApplicabilityBasedInventoryDayType}
                                />
                            </Col>) :
                            (state.isApplyInventoryDay &&
                                state.iccMethod === 'Credit Based' && <Col md="3">
                                    <TextFieldHookForm
                                        name="CreditBasedAnnualIcc"
                                        label="Credit Based Annual ICC (%)"
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        placeholder="-"
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.CreditBasedAnnualIcc}
                                        disabled={true}
                                        customClassName={"withBorder"}
                                        defaultValue={InventoryObj?.CreditBasedAnnualICCPercent}
                                    />
                                </Col>)
                        }
                        {state.iccMethod !== 'Credit Based' && <Col md="3">
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
                                customClassName={"withBorder"}
                                defaultValue={checkForDecimalAndNull(state.totalIccNetCost, getConfigurationKey()?.NoOfDecimalForPrice)}
                            />
                        </Col>}
                        {state.iccMethod === 'Credit Based' &&
                            <>
                                <Col md="3">
                                    <label>ICC Calculator</label>
                                    <div>
                                        <button
                                            id={`calculatorIcc`}
                                            className={`CalculatorIcon cr-cl-icon calculatorIcc mt10`}
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
                                        customClassName={"withBorder"}
                                        defaultValue={checkForDecimalAndNull(state.totalIccPayable, getConfigurationKey()?.NoOfDecimalForPrice)}
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
                                        customClassName={"withBorder"}
                                        defaultValue={checkForDecimalAndNull(state.totalIccReceivable, getConfigurationKey()?.NoOfDecimalForPrice)}
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
                                        customClassName={"withBorder"}
                                        defaultValue={checkForDecimalAndNull(state.totalIccNetCost, getConfigurationKey()?.NoOfDecimalForPrice)}
                                    />
                                </Col>
                                <Col md="3">
                                    <label>Remark</label>
                                    <Popup trigger={<button id={`popUpTriggerIcc`} title="Remark" className="Comment-box mt10" type={'button'} />}
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
                                            validateWithRemarkValidation={true}
                                        />
                                        <Row>
                                            <Col md="12" className='remark-btn-container'>
                                                <button className='submit-button mr-2' disabled={(CostingViewMode) ? true : false} onClick={() => onRemarkPopUpClickIcc()} > <div className='save-icon'></div> </button>
                                                <button className='reset' onClick={() => onRemarkPopUpCloseIcc()} > <div className='cancel-icon'></div></button>
                                            </Col>
                                        </Row>
                                    </Popup>
                                </Col>
                            </>
                        }

                    </Row>
                    {state.iccMethod !== 'Credit Based' && <Row>
                        <Col md="11" className='pr-0'>
                            <TableRenderer
                                data={state.iccDetails}
                                columns={Inventory_Day_Columns}
                                register={register}
                                Controller={Controller}
                                control={control}
                                errors={errors}
                                isViewMode={CostingViewMode}
                                setValue={setValue}
                                includeOverHeadProfitIcc={includeOverHeadProfitIcc}
                                isCreditBased={state.iccMethod === 'Credit Based'}
                                includeChildPartCost={IsIncludeApplicabilityForChildPartsInICC}
                            />
                        </Col>
                        <Col md="1" className='second-section mb-3'>
                            <div className='costing-border-inner-section'>
                                <Col md="12" className='text-center pb-2 text-black'>Remark</Col>
                                <Col md="12">
                                    <Popup trigger={<button id={`popUpTriggerIcc`} title="Remark" className="Comment-box mt10" type={'button'} />}
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
                                            validateWithRemarkValidation={true}
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
                    </Row>}
                    {state.openCalculatorIcc && <IccCalculator
                        anchor={`right`}
                        isOpen={state.openCalculatorIcc}
                        closeCalculator={closeCalculator}
                        rmRowData={state.iccDetails}
                        CostingViewMode={CostingViewMode}
                        iccInterestRateId={ICCInterestRateId}
                        isNetWeight={isNetWeight}
                        isPartApplicability={isPartApplicability}
                        totalOverHeadAndProfit={totalOverHeadAndProfit}
                    />}
                </>
            }
        </>
    );
}

export default Icc;