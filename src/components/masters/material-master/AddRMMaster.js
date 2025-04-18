import React, { Fragment, useEffect, useRef, useState } from "react"
import { Row, Col, Label } from 'reactstrap';
import AddRMDetails from "./AddRMDetails"
import AddRMFinancialDetails from "./AddRMFinancialDetails"
import { CBCTypeId, EMPTY_GUID, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT, IsSelectSinglePlant, RM_MASTER_ID, VBCTypeId, ZBCTypeId } from "../../../config/constants"
import { getCommodityIndexRateAverage } from '../../../../src/actions/Common';
import { convertIntoCurrency, costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission } from "../../common/CommonFunctions"
import { reactLocalStorage } from "reactjs-localstorage"
import { useForm, Controller, useWatch, } from 'react-hook-form';
import Switch from 'react-switch'
import { useDispatch, useSelector } from "react-redux";
import Button from '../../layout/Button';
import { animateScroll as scroll } from 'react-scroll';
// import { DatasetController } from "chart.js";
import { debounce } from "lodash";
import RemarksAndAttachments from "../Remark&Attachments";
import { CheckApprovalApplicableMaster, checkForDecimalAndNull, checkForNull, getCodeBySplitting, getConfigurationKey, getNameBySplitting, loggedInUserId, userDetails, userTechnologyDetailByMasterId } from "../../../helper";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { fetchSpecificationDataAPI } from "../../../actions/Common";
import { setRawMaterialDetails, createRM, getRMDataById, updateRMAPI, getMaterialTypeDataAPI, setExchangeRateDetails } from "../actions/Material";
import DayTime from "../../common/DayTimeWrapper";
import LoaderCustom from "../../common/LoaderCustom";
import { isFinalApprover } from "../../costing/actions/Approval";
import { checkFinalUser } from "../../costing/actions/Costing";
import { getUsersMasterLevelAPI } from "../../../actions/auth/AuthActions";
import MasterSendForApproval from "../MasterSendForApproval";
import WarningMessage from "../../common/WarningMessage";
import AddIndexationMaterialListing from "./AddIndexationMaterialListing"
import HeaderTitle from "../../common/HeaderTitle";
import { getRawMaterialDataBySourceVendor, setCommodityDetails, setOtherCostDetails } from "../actions/Indexation";
import { useLabels } from "../../../helper/core";
import { useQueryClient } from "react-query";
import { fetchDivisionId } from "../../costing/CostingUtil";

function AddRMMaster(props) {
    const { data, EditAccessibilityRMANDGRADE, AddAccessibilityRMANDGRADE } = props

    const { register, handleSubmit, formState: { errors }, control, setValue, getValues, reset, isRMAssociated, clearErrors } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { vendorLabel } = useLabels();

    const dispatch = useDispatch()
    const initialState = {
        costingTypeId: ZBCTypeId,
        isImport: false,
        callSubmit: false,
        DataToChange: {},
        isEditFlag: false,
        setDisable: false,
        RawMaterialID: EMPTY_GUID,
        isLoader: false,
        isFinalApprovar: false,
        disableSendForApproval: false,
        CostingTypePermission: false,
        finalApprovalLoader: true,
        approveDrawer: false,
        approvalObj: {},
        levelDetails: {},
        isDateChanged: false,
        isCommodityOpen: false,
        commodityDetails: [],
        avgBasicRate: [],
        totalBasicRate: 0,
        materialCommodityIndexRateDetails: [],
        callAvgApi: false,
        disableAll: false,
        isSourceVendorApiCalled: false,
        sourceVendorRawMaterialId: null,
        isSourceVendor: false,
        masterLevels: []
    }
    const [state, setState] = useState(initialState);
    const isViewFlag = data?.isViewFlag === true ? true : false
    const rawMaterailDetails = useSelector((state) => state?.material?.rawMaterailDetails)
    const exchangeRateDetails = useSelector((state) => state?.material?.exchangeRateDetails)
    const queryClient = useQueryClient();

    const { commodityDetailsArray } = useSelector((state) => state?.indexation)
    const { otherCostDetailsArray } = useSelector((state) => state?.indexation)

    const avgValues = useWatch({
        control,
        name: ['Index', 'ExchangeSource', 'fromDate', 'toDate']
    })
    const sourceVendorValues = useWatch({
        control,
        name: ['RawMaterialSpecification', 'Technology', 'sourceVendorName']
    })
    const fieldValueGrade = useWatch({
        control,
        name: ['RawMaterialGrade']
    })

    useEffect(() => {

        if (!isViewFlag && !state?.sourceVendorRawMaterialId && rawMaterailDetails?.SourceVendor?.value && getValues('RawMaterialSpecification') && getValues('Technology')) {
            setState(prevState => ({ ...prevState, disableSendForApproval: true }));
            let data = {
                rawMaterialSpecificationId: getValues('RawMaterialSpecification')?.value,
                sourceVendorId: rawMaterailDetails?.SourceVendor?.value,
                technologyId: getValues('Technology')?.value,
                isIndexationDetails: rawMaterailDetails?.isShowIndexCheckBox,
                costingHeadId: state?.costingTypeId
            }
            dispatch(getRawMaterialDataBySourceVendor(data, (res) => {
                setState(prevState => ({ ...prevState, disableSendForApproval: false }));
                let Data = res?.data?.Data

                if (res?.status === 200) {
                    setState(prevState => ({
                        ...prevState,
                        isSourceVendorApiCalled: true,
                        sourceVendorRawMaterialId: Data?.RawMaterialId,
                        DataToChange: Data,
                        disableAll: true,
                        isLoader: false,
                        commodityDetails: Data?.MaterialCommodityIndexRateDetails,
                        disableSendForApproval: false
                    }))
                    dispatch(setOtherCostDetails(Data?.RawMaterialOtherCostDetails))
                    dispatch(setCommodityDetails(Data?.MaterialCommodityIndexRateDetails))
                } else {

                    setState(prevState => ({
                        ...prevState, isSourceVendorApiCalled: true, sourceVendorRawMaterialId: null, DataToChange: {}, disableAll: false, isLoader: false, commodityDetails: []
                    }))
                    dispatch(setOtherCostDetails([]))
                    dispatch(setCommodityDetails([]))
                }
            }))
        }
    }, [sourceVendorValues, rawMaterailDetails?.SourceVendor, rawMaterailDetails?.isShowIndexCheckBox, state?.costingTypeId])

    useEffect(() => {
        if (!isViewFlag && state?.callAvgApi === true && getValues('Index')?.value !== null && getValues('fromDate') && !state?.isSourceVendorApiCalled && getValues('toDate')) {
            dispatch(getCommodityIndexRateAverage(
                getValues('Material')?.value,
                getValues('Index').value,
                '',
                '',
                getValues('ExchangeSource')?.label ?? '',
                DayTime(getValues('fromDate'))?.format('YYYY-MM-DD'),
                DayTime(getValues('toDate'))?.format('YYYY-MM-DD'),
                (res) => {
                    setValue('UnitOfMeasurement', { label: res?.data?.Data, value: res?.data?.Identity })
                    const updatedCommodityDetails = state?.commodityDetails.map(detail => {
                        const avgRate = res?.data?.DataList.find(rate => rate.MaterialCommodityStandardDetailsId === detail.MaterialCommodityStandardDetailsId);
                        return {
                            ...detail,
                            BasicRateConversion: avgRate ? avgRate.RateConversionPerConvertedUOM : null,
                            BasicRate: avgRate ? avgRate.RatePerConvertedUOM : null,
                            ExchangeRate: avgRate ? avgRate.ExchangeRate : null,
                            TotalCostPercent: checkForNull(avgRate?.RateConversionPerConvertedUOM) * checkForNull(avgRate?.Percentage) / 100,
                            IndexUOM: avgRate ? avgRate.ConvertedUOM : null,
                            IndexUnitOfMeasurementId: avgRate ? avgRate.ConvertedUOMId : null,
                            IndexCurrency: avgRate ? avgRate.FromCurrency : null,
                            IndexCurrencyId: avgRate ? avgRate.FromCurrencyId : null
                        };
                    });
                    setState(prevState => ({ ...prevState, commodityDetails: updatedCommodityDetails }));
                    dispatch(setCommodityDetails(updatedCommodityDetails))
                    if (res?.status === 200 && res?.data?.Result === false) {
                        Toaster.warning(res?.data?.Message)
                        return false
                    }
                }
            ));
        }
    }, [avgValues, state?.callAvgApi])

    useEffect(() => {
        if (!isViewFlag) {
            if (getValues('RawMaterialGrade')) {
                const commodityVal = getValues('RawMaterialGrade').value;
                dispatch(getMaterialTypeDataAPI('', commodityVal, (res) => {
                    if (res) {
                        let Data = res.data.Data
                        setValue('Material', { label: Data.MaterialType, value: Data.MaterialTypeId })
                        dispatch(getMaterialTypeDataAPI(Data.MaterialTypeId, '', (res) => {
                            let Data = res.data.Data
                            if (Data.MaterialCommodityStandardDetails.length > 0) {
                                setState(prevState => ({ ...prevState, callAvgApi: true }))
                            }
                            setState(prevState => ({ ...prevState, commodityDetails: Data.MaterialCommodityStandardDetails }))
                        }))
                    }
                }))
            }
        }
    }, [fieldValueGrade])

    useEffect(() => {
        getDetails(data)
        setState(prevState => ({ ...prevState, costingTypeId: getCostingTypeIdByCostingPermission() }))

        return () => {
            dispatch(setRawMaterialDetails({}, () => { }))
            dispatch(setExchangeRateDetails({}, () => { }))
            dispatch(setCommodityDetails([]))
            dispatch(setOtherCostDetails([]))
        }
    }, [])
    useEffect(() => {
        if (!getConfigurationKey().IsDivisionAllowedForDepartment && !isViewFlag) {
            finalUserCheckAndMasterLevelCheckFunction()
        }
    }, [state?.costingTypeId])


    const finalUserCheckAndMasterLevelCheckFunction = (plantId, isDivision = false) => {
        if (!isViewFlag && getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
            dispatch(getUsersMasterLevelAPI(loggedInUserId(), RM_MASTER_ID, null, (res) => {
                setState(prevState => ({ ...prevState, masterLevels: res?.data?.Data?.MasterLevels }))
                setTimeout(() => {
                    commonFunction(plantId, isDivision, res?.data?.Data?.MasterLevels)
                }, 500);
            }))
        }
    }

    /**
     * @method onPressVendor
     * @description Used for Vendor checked
     */
    const onPressVendor = (costingHeadFlag) => {
        reset({
            Technology: '', RawMaterialCode: '', RawMaterialName: '', RawMaterialGrade: '', RawMaterialSpecification: '', RawMaterialCategory: '', Plants: '', UnitOfMeasurement: '', cutOffPriceBaseCurrency: '', sourceVendorName: '',
            BasicRateSelectedCurrency: '', ScrapRateBaseCurrency: '', OtherCostBaseCurrency: '', BasicRateBaseCurrency: '', EffectiveDate: '',
        });
        setState(prevState => ({
            ...prevState,
            isImport: prevState.isImport,
            costingTypeId: costingHeadFlag,
        }));
        dispatch(setRawMaterialDetails({}, () => { }))
        dispatch(setExchangeRateDetails({}, () => { }))
        dispatch(setCommodityDetails([]))
        dispatch(setOtherCostDetails([]))
    }
    /**
      * @method cancel
      * @description used to Reset form
      */
    const cancel = (type) => {
        dispatch(getRMDataById('', false, (res) => { }))
        dispatch(fetchSpecificationDataAPI(0, () => { }))
        props?.hideForm(type)
    }
    const commonFunction = (plantId, isDivision = false, masterLevels = []) => {
        let levelDetailsTemp = []
        levelDetailsTemp = userTechnologyDetailByMasterId(state?.costingTypeId, RM_MASTER_ID, masterLevels)
        setState(prevState => ({ ...prevState, levelDetails: levelDetailsTemp }))
        // fetchDivisionId(requestObject, dispatch).then((divisionId) => {
        let obj = {
            DepartmentId: userDetails().DepartmentId,
            UserId: loggedInUserId(),
            TechnologyId: RM_MASTER_ID,
            Mode: 'master',
            approvalTypeId: costingTypeIdToApprovalTypeIdFunction(state?.costingTypeId),
            plantId: (getConfigurationKey().IsMultipleUserAllowForApproval && plantId) ? plantId : EMPTY_GUID,
            divisionId: null
        }
        if (getConfigurationKey().IsMasterApprovalAppliedConfigure) {
            dispatch(checkFinalUser(obj, (res) => {
                if (res?.data?.Result && res?.data?.Data?.IsFinalApprover) {

                    setState(prevState => ({ ...prevState, isFinalApprovar: res?.data?.Data?.IsFinalApprover, CostingTypePermission: true, finalApprovalLoader: false, disableSendForApproval: false }))
                }
                else if (res?.data?.Data?.IsUserInApprovalFlow === false || res?.data?.Data?.IsNextLevelUserExist === false) {
                    setState(prevState => ({ ...prevState, disableSendForApproval: true }))
                } else {
                    setState(prevState => ({ ...prevState, disableSendForApproval: false }))
                }
            }))
        }
        setState(prevState => ({ ...prevState, CostingTypePermission: false, finalApprovalLoader: false }))
        // }).catch((error) => {
        //     setState(prevState => ({ ...prevState, disableSendForApproval: true }))
        // })
    }
    /**
    * @method getDetails
    * @description Used to get Details
    */
    const getDetails = (data) => {

        if (data && data.isEditFlag) {
            setState(prevState => ({
                ...prevState,
                isEditFlag: true, isLoader: true, isShowForm: true, RawMaterialID: data.Id,
            }))
            dispatch(getRMDataById(data, true, (res) => {
                if (res && res.data && res?.data?.Result) {
                    const Data = res?.data?.Data
                    if (Data && Object.keys(Data).length > 0) {
                        setState(prevState => ({
                            ...prevState, sourceVendorRawMaterialId: Data?.SourceVendorRawMaterialId, DataToChange: Data, isImport: Data.RawMaterialEntryType === ENTRY_TYPE_IMPORT ? true : false, isLoader: false, costingTypeId: Data.CostingTypeId, commodityDetails: Data?.MaterialCommodityIndexRateDetails, isSourceVendor: Data?.IsSourceVendor, disableAll: Data?.IsSourceVendor ? true : false
                        }))
                        dispatch(setOtherCostDetails(Data?.RawMaterialOtherCostDetails))
                        dispatch(setCommodityDetails(Data?.MaterialCommodityIndexRateDetails))
                        if (!getConfigurationKey().IsDivisionAllowedForDepartment && getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
                            finalUserCheckAndMasterLevelCheckFunction(Data?.Plant[0]?.PlantId)
                        } else {
                            setState(prevState => ({ ...prevState, finalApprovalLoader: false }))
                        }
                    }

                }

            }))
        }
        else {
            setState(prevState => ({
                ...prevState,
                isEditFlag: false,
                isLoader: false,
                showTour: true,
                RawMaterialID: EMPTY_GUID
            }))
            dispatch(getRMDataById('', false, (res) => { }))
        }
    }
    /**
    * @method onRmToggle
    * @description RM TOGGLE
    */
    const onRmToggle = () => {
        setState(prevState => ({ ...prevState, isImport: !prevState.isImport }))
    }
    const closeApprovalDrawer = (e = '', type) => {
        setState(prevState => ({ ...prevState, approveDrawer: false, setDisable: false, isEditBuffer: true }))
        if (type === 'submit') {
            //   clearForm('submit')
            cancel('submit')
        }
    }
    const handleRMOperation = (formData, isEdit) => {
        const action = isEdit ? updateRMAPI : createRM;
        const successMessage = isEdit ? MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS : MESSAGES.MATERIAL_ADD_SUCCESS;

        dispatch(action(formData, (res) => {
            if (res?.data?.Result) {
                Toaster.success(successMessage);
                cancel('submit');
                queryClient.invalidateQueries('MastersRawMaterial_GetAllRawMaterialList');
            }
        }));
    };

    const onSubmit = debounce(handleSubmit((values, isDivision) => {
        const { DataToChange } = state
        let scrapRate = ''
        let jaliRateBaseCurrency = ''
        let machiningRateBaseCurrency = ''
        let scrapRateInr = ''
        let scrapRateLocalConversion = ''
        const { states: { showScrapKeys, totalOtherCost } } = rawMaterailDetails
        const NetCostWithoutConditionCost = checkForNull(values?.BasicRate) + checkForNull(totalOtherCost)
        const Plants = values.Plants
        if (showScrapKeys?.showCircleJali) {
            scrapRate = values?.JaliScrapCost
            scrapRateLocalConversion = state?.isImport ? convertIntoCurrency(values?.JaliScrapCost, exchangeRateDetails?.LocalCurrencyExchangeRate) : values?.JaliScrapCost
            scrapRateInr = state?.isImport ? convertIntoCurrency(values?.JaliScrapCost, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(values?.JaliScrapCost, exchangeRateDetails?.LocalCurrencyExchangeRate)
            jaliRateBaseCurrency = checkForNull(values?.CircleScrapCost)
            if (checkForNull(values?.BasicRate) < checkForNull(jaliRateBaseCurrency) || checkForNull(values?.BasicRate) < checkForNull(scrapRate)) {
                setState(prevState => ({ ...prevState, setDisable: false }))
                Toaster.warning("Scrap rate/cost should not be greater than the basic rate.")
                return false
            }

        } else if (showScrapKeys?.showForging) {
            scrapRate = values?.ForgingScrap
            scrapRateLocalConversion = state?.isImport ? convertIntoCurrency(values?.ForgingScrap, exchangeRateDetails?.LocalCurrencyExchangeRate) : values?.ForgingScrap
            scrapRateInr = state?.isImport ? convertIntoCurrency(values?.ForgingScrap, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(values?.ForgingScrap, exchangeRateDetails?.LocalCurrencyExchangeRate)
            machiningRateBaseCurrency = checkForNull(values?.MachiningScrap)
            if (checkForNull(values?.BasicRate) < checkForNull(scrapRate) || checkForNull(values?.BasicRate) < checkForNull(machiningRateBaseCurrency)) {
                setState(prevState => ({ ...prevState, setDisable: false }))
                Toaster.warning("Scrap rate/cost should not be greater than the basic rate.")
                return false
            }

        } else if (showScrapKeys?.showScrap) {
            scrapRate = checkForNull(values?.ScrapRate)
            scrapRateLocalConversion = state?.isImport ? convertIntoCurrency(values?.ScrapRate, exchangeRateDetails?.LocalCurrencyExchangeRate) : values?.ScrapRate
            scrapRateInr = state?.isImport ? convertIntoCurrency(values?.ScrapRate, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(values?.ScrapRate, exchangeRateDetails?.LocalCurrencyExchangeRate)
            if (checkForNull(values?.BasicRate) < checkForNull(scrapRate)) {
                setState(prevState => ({ ...prevState, setDisable: false }))
                Toaster.warning("Scrap rate/cost should not be greater than the basic rate.")
                return false
            }
        }

        let plantArray = []
        if ((state?.costingTypeId === ZBCTypeId && !getConfigurationKey().IsMultipleUserAllowForApproval && !IsSelectSinglePlant) || state?.isEditFlag) {
            Plants && Plants.map((item) => {
                plantArray.push({ PlantName: item.label, PlantId: item.value, PlantCode: '', })
                return plantArray
            })
        } else {
            plantArray.push({ PlantName: values?.Plants?.label, PlantId: values?.Plants?.value, PlantCode: '', })
        }

        const netLandedCostLocalConversion = convertIntoCurrency(rawMaterailDetails?.states?.NetLandedCost, exchangeRateDetails?.LocalCurrencyExchangeRate)
        const netconditionCostLocalConversion = convertIntoCurrency(rawMaterailDetails?.states?.NetConditionCost, exchangeRateDetails?.LocalCurrencyExchangeRate)
        const netOtherCostLocalConversion = convertIntoCurrency(rawMaterailDetails?.states?.totalOtherCost, exchangeRateDetails?.LocalCurrencyExchangeRate)
        const netCostWithoutConditionCost = convertIntoCurrency(rawMaterailDetails?.states?.NetCostWithoutConditionCost ?? NetCostWithoutConditionCost, exchangeRateDetails?.LocalCurrencyExchangeRate)
        const basicRatePerUOMLocalConversion = convertIntoCurrency(values?.BasicRate, exchangeRateDetails?.LocalCurrencyExchangeRate)
        const commodityNetCostLocalConversion = convertIntoCurrency(rawMaterailDetails?.states?.totalBasicRate, exchangeRateDetails?.LocalCurrencyExchangeRate)
        const cutOffPriceLocalConversion = convertIntoCurrency(values?.cutOffPrice, exchangeRateDetails?.LocalCurrencyExchangeRate)
        
        let formData =
        {
            "Attachements": rawMaterailDetails?.Files,
            "BasicRatePerUOM": values?.BasicRate,
            "BasicRatePerUOMLocalConversion": state?.isImport ? basicRatePerUOMLocalConversion : values?.BasicRate,
            "BasicRatePerUOMConversion": state?.isImport ? convertIntoCurrency(basicRatePerUOMLocalConversion, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(values?.BasicRate, exchangeRateDetails?.CurrencyExchangeRate),
            "CalculatedFactor": rawMaterailDetails?.states?.IsApplyHasDifferentUOM === true ? rawMaterailDetails?.states?.CalculatedFactor : '',
            "Category": values?.RawMaterialCategory?.value,
            "CommodityNetCost": rawMaterailDetails?.states?.totalBasicRate,
            "CommodityNetCostLocalConversion": state?.isImport ? commodityNetCostLocalConversion : rawMaterailDetails?.states?.totalBasicRate,
            "CommodityNetCostConversion": state?.isImport ? convertIntoCurrency(commodityNetCostLocalConversion, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(rawMaterailDetails?.states?.totalBasicRate, exchangeRateDetails?.CurrencyExchangeRate),
            "CostingTypeId": state?.costingTypeId,
            "Currency": state?.isImport ? values?.currency?.label : values?.plantCurrency,
            "CurrencyExchangeRate": /* state?.isImport ? exchangeRateDetails?.LocalCurrencyExchangeRate :  */exchangeRateDetails?.CurrencyExchangeRate ? exchangeRateDetails?.CurrencyExchangeRate : null,
            "CurrencyId": state?.isImport ? values?.currency?.value : exchangeRateDetails?.LocalCurrencyId,
            "CustomerId": state?.costingTypeId === CBCTypeId ? values?.clientName?.value : '',
            "CustomerCode": state?.costingTypeId === CBCTypeId ? getCodeBySplitting(values?.clientName?.label) : '',
            "CustomerName": state?.costingTypeId === CBCTypeId ? getNameBySplitting(values?.clientName?.label) : '',
            "CutOffPrice": values?.cutOffPrice,
            "CutOffPriceLocalConversion": state?.isImport ? cutOffPriceLocalConversion : values?.cutOffPrice,
            "CutOffPriceInINR": state?.isImport ? convertIntoCurrency(cutOffPriceLocalConversion, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(values?.cutOffPrice, exchangeRateDetails?.CurrencyExchangeRate),
            "EffectiveDate": DayTime(values?.effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
            "ExchangeRateId": /* state?.isImport ? exchangeRateDetails?.LocalExchangeRateId : */ exchangeRateDetails?.ExchangeRateId ? exchangeRateDetails?.ExchangeRateId : null,
            "ExchangeRateSourceName": values?.ExchangeSource?.label,
            "FrequencyOfSettlement": values?.frequencyOfSettlement?.label,
            "FromDate": DayTime(values?.fromDate).format('YYYY-MM-DD HH:mm:ss'),
            "HasDifferentSource": rawMaterailDetails?.states?.HasDifferentSource,
            "IndexExchangeId": values?.Index?.value,
            "IndexExchangeName": values?.Index?.label,
            "IsIndexationDetails": rawMaterailDetails?.states?.isShowIndexCheckBox === true ? true : false,
            "IsCutOffApplicable": (values?.cutOffPriceBaseCurrency < values?.NetLandedCostBaseCurrency && checkForNull(values.cutOffPriceBaseCurrency) !== 0 && values.cutOffPriceBaseCurrency !== '') ? true : false,
            "IsScrapUOMApply": rawMaterailDetails?.states?.IsApplyHasDifferentUOM,
            "IsCalculateScrapRate": rawMaterailDetails?.states?.IsCalculateScrapRate,
            "IsCalculateMachineScrapRate": rawMaterailDetails?.states?.IsCalculateMachineScrapRate,
            "ScrapRatePercentageOfRMRate": rawMaterailDetails?.states?.scrapRatePercentageOfRMRate,
            "MachineScrapRatePercentageOfRMRate": rawMaterailDetails?.states?.machineScrapRatePercentageOfRMRate,
            "IsSendForApproval": false,
            "JaliScrapCost": values?.CircleScrapCost,
            "JaliScrapCostLocalConversion": state?.isImport ? convertIntoCurrency(values?.CircleScrapCost, exchangeRateDetails?.LocalCurrencyExchangeRate) : values?.CircleScrapCost,
            "JaliScrapCostConversion": state?.isImport ? convertIntoCurrency(values?.CircleScrapCost, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(values?.CircleScrapCost, exchangeRateDetails?.CurrencyExchangeRate),
            "LoggedInUserId": loggedInUserId(),
            "LocalCurrency": state?.isImport ? values?.plantCurrency : null,
            "LocalCurrencyExchangeRate": state?.isImport ? exchangeRateDetails?.LocalCurrencyExchangeRate : null,
            "LocalExchangeRateId": state?.isImport ? exchangeRateDetails?.LocalExchangeRateId : null,
            "LocalCurrencyId": state?.isImport ? exchangeRateDetails?.LocalCurrencyId : null,
            "MachiningScrapRate": values?.MachiningScrap,
            "MachiningScrapRateLocalConversion": state?.isImport ? convertIntoCurrency(values?.MachiningScrap, exchangeRateDetails?.LocalCurrencyExchangeRate) : values?.MachiningScrap,
            "MachiningScrapRateInINR": state?.isImport ? convertIntoCurrency(values?.MachiningScrap, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(values?.MachiningScrap, exchangeRateDetails?.CurrencyExchangeRate),
            "MaterialCommodityIndexRateDetails": commodityDetailsArray,
            "NetConditionCost": rawMaterailDetails?.states?.NetConditionCost,
            "NetConditionCostLocalConversion": state?.isImport ? netconditionCostLocalConversion : rawMaterailDetails?.states?.NetConditionCost,
            "NetConditionCostConversion": state?.isImport ? convertIntoCurrency(netconditionCostLocalConversion, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(rawMaterailDetails?.states?.NetConditionCost, exchangeRateDetails?.CurrencyExchangeRate),
            "NetCostWithoutConditionCost": rawMaterailDetails?.states?.NetCostWithoutConditionCost ?? NetCostWithoutConditionCost,
            "NetCostWithoutConditionCostLocalConversion": state?.isImport ? netCostWithoutConditionCost : rawMaterailDetails?.states?.NetCostWithoutConditionCost ?? NetCostWithoutConditionCost,
            "NetCostWithoutConditionCostConversion": state?.isImport ? convertIntoCurrency(netCostWithoutConditionCost, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(rawMaterailDetails?.states?.NetCostWithoutConditionCost ?? NetCostWithoutConditionCost, exchangeRateDetails?.CurrencyExchangeRate),
            "NetLandedCost": rawMaterailDetails?.states?.NetLandedCost,
            "NetLandedCostLocalConversion": state?.isImport ? netLandedCostLocalConversion : rawMaterailDetails?.states?.NetLandedCost,
            "NetLandedCostConversion": state?.isImport ? convertIntoCurrency(netLandedCostLocalConversion, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(rawMaterailDetails?.states?.NetLandedCost, exchangeRateDetails?.CurrencyExchangeRate),
            "OtherNetCost": rawMaterailDetails?.states?.totalOtherCost,
            "OtherNetCostLocalConversion": state?.isImport ? netOtherCostLocalConversion : rawMaterailDetails?.states?.totalOtherCost,
            "OtherNetCostConversion": state?.isImport ? convertIntoCurrency(netOtherCostLocalConversion, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(rawMaterailDetails?.states?.totalOtherCost, exchangeRateDetails?.CurrencyExchangeRate),
            "Plant": plantArray,
            "RMGrade": values?.RawMaterialGrade?.value,
            "RMSpec": values?.RawMaterialSpecification?.value,
            "RawMaterial": values?.RawMaterialName?.value,
            "RawMaterialCategoryName": values?.RawMaterialCategory?.label,
            "RawMaterialCode": values?.RawMaterialCode?.value,
            "RawMaterialConditionsDetails": rawMaterailDetails?.ConditionTableData,
            "RawMaterialEntryType": state?.isImport ? checkForNull(ENTRY_TYPE_IMPORT) : checkForNull(ENTRY_TYPE_DOMESTIC),
            "RawMaterialGradeName": values?.RawMaterialGrade?.label,
            "RawMaterialId": state?.RawMaterialID,
            "RawMaterialName": values?.RawMaterialName?.label,
            "RawMaterialOtherCostDetails": otherCostDetailsArray,
            "RawMaterialSpecificationName": values?.RawMaterialSpecification?.label,
            "Remark": values?.Remarks,
            "ScrapRate": scrapRate,
            "ScrapRateLocalConversion": scrapRateLocalConversion,
            "ScrapRateInINR": scrapRateInr,
            "ScrapRatePerScrapUOM": values?.ScrapRatePerScrapUOM,
            "ScrapRatePerScrapUOMConversion": state?.isImport ? convertIntoCurrency(values?.ScrapRatePerScrapUOM, exchangeRateDetails?.CurrencyExchangeRate) : convertIntoCurrency(values?.ScrapRatePerScrapUOM, exchangeRateDetails?.CurrencyExchangeRate),
            "ScrapUnitOfMeasurement": rawMaterailDetails?.states?.IsApplyHasDifferentUOM === true ? values?.ScrapRateUOM?.label : '',
            "ScrapUnitOfMeasurementId": rawMaterailDetails?.states?.IsApplyHasDifferentUOM === true ? values?.ScrapRateUOM?.value : '',
            "Source": values?.source,
            "SourceLocation": rawMaterailDetails?.SourceLocation?.value ?? '',
            "SourceSupplierLocationName": values?.SourceSupplierCityId?.label,
            "SourceVendorId": rawMaterailDetails?.SourceVendor?.value ?? null,
            "SourceVendorRawMaterialId": state?.sourceVendorRawMaterialId ?? null,
            "TechnologyId": values?.Technology?.value,
            "TechnologyName": values?.Technology?.label,
            "ToDate": DayTime(values?.toDate).format('YYYY-MM-DD HH:mm:ss'),
            "UOM": values?.UnitOfMeasurement?.value,
            "UOMToScrapUOMRatio": rawMaterailDetails?.states?.IsApplyHasDifferentUOM === true ? values?.ConversionRatio : '',
            "UnitOfMeasurementName": values?.UnitOfMeasurement?.label,
            "Vendor": !state?.isEditFlag ? rawMaterailDetails?.Vendor?.value : values?.Vendor?.value,
            "VendorCode": state?.costingTypeId === VBCTypeId ? !state?.isEditFlag ? getCodeBySplitting(rawMaterailDetails?.Vendor?.label) : getCodeBySplitting(values?.Vendor?.label) : '',
            "VendorName": state?.costingTypeId === VBCTypeId ? !state?.isEditFlag ? getNameBySplitting(rawMaterailDetails?.Vendor?.label) : getNameBySplitting(values?.Vendor?.label) : '',
            "VendorPlant": []
        }
        let financialDataNotChanged = (checkForNull(values.cutOffPrice) === checkForNull(DataToChange?.CutOffPrice)) && (checkForNull(values.BasicRate) === checkForNull(DataToChange?.BasicRatePerUOM)) && rawMaterailDetails?.states?.IsApplyHasDifferentUOM === DataToChange?.IsScrapUOMApply
            && checkForNull(values?.ConversionRatio) === checkForNull(DataToChange?.UOMToScrapUOMRatio) && checkForNull(values?.ScrapRatePerScrapUOM) === checkForNull(DataToChange?.ScrapRatePerScrapUOM) && (checkForNull(values.OtherCost) === checkForNull(DataToChange?.OtherNetCost))
            && (checkForNull(values.CircleScrapCost) === checkForNull(DataToChange?.JaliScrapCost)) && (checkForNull(values.MachiningScrap) === checkForNull(DataToChange?.MachiningScrapRate)
            && checkForNull(values?.ScrapRate) === checkForNull(DataToChange?.ScrapRate) && checkForNull(rawMaterailDetails?.states?.scrapRatePercentageOfRMRate) === checkForNull(DataToChange?.ScrapRatePercentageOfRMRate)
            && checkForNull(rawMaterailDetails?.states?.IsCalculateScrapRate) === checkForNull(DataToChange?.IsCalculateScrapRate) && checkForNull(rawMaterailDetails?.states?.IsCalculateMachineScrapRate) === checkForNull(DataToChange?.IsCalculateMachineScrapRate))
        let nonFinancialDataNotChanged = (JSON.stringify(rawMaterailDetails.Files) === JSON.stringify(DataToChange?.FileList) && values?.Remarks === DataToChange?.Remark)
        if (state?.isEditFlag) {
            if (!isRMAssociated) {
                if (financialDataNotChanged && nonFinancialDataNotChanged) {
                    if (state?.isFinalApprovar && getConfigurationKey()?.IsMasterApprovalAppliedConfigure) {
                        Toaster.warning('Please change data to save RM')
                        return false
                    } else {
                        Toaster.warning('Please change data to send RM for approval')
                        return false
                    }
                } else if (!state?.isSourceVendor && (!financialDataNotChanged) && DayTime(values?.effectiveDate).format('YYYY-MM-DD HH:mm:ss') === DayTime(DataToChange?.EffectiveDate).format('YYYY-MM-DD HH:mm:ss')) {
                    Toaster.warning('Please update the effective date')
                    setState(prevState => ({ ...prevState, isDateChanged: true }))
                    return false
                }
                formData.IsFinancialDataChanged = financialDataNotChanged ? false : true
            } else {
                if (financialDataNotChanged && nonFinancialDataNotChanged) {
                    if (state?.isFinalApprovar && getConfigurationKey()?.IsMasterApprovalAppliedConfigure) {
                        Toaster.warning('Please change data to save RM')
                        return false
                    } else {
                        Toaster.warning('Please change data to send RM for approval')
                        return false
                    }
                }
                formData.IsFinancialDataChanged = financialDataNotChanged ? false : true
            }


        }

        //  IF: APPROVAL FLOW
        if (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !state?.isFinalApprovar && !financialDataNotChanged) {
            // this.allFieldsInfoIcon(true)
            formData.IsSendForApproval = true
            setState(prevState => ({
                ...prevState, approveDrawer: true, approvalObj: formData
            }))
        } else {
            formData.IsSendForApproval = false;
            handleRMOperation(formData, state?.isEditFlag);
        }


    }), 500);
    const showSendForApproval = () => {
        if (rawMaterailDetails && (rawMaterailDetails?.financialDataChanged || rawMaterailDetails.netCostChanged)) {
            return true
        } else if (rawMaterailDetails && !rawMaterailDetails?.financialDataChanged && !rawMaterailDetails?.netCostChanged && rawMaterailDetails?.nonFinancialDataChanged) {
            return false
        } else {
            return false
        }
    }

    return (
        state?.isLoader ? <LoaderCustom customClass="loader-center" /> :
            <Fragment>
                <form>
                    <div className="rm-master-form">
                        <Row>
                            <Col md="4" className="switch mb15">
                                <label className="switch-level">
                                    <div className={"left-title"}>Domestic</div>
                                    <Switch
                                        onChange={onRmToggle}
                                        checked={state?.isImport}
                                        id="normal-switch"
                                        disabled={data.isEditFlag || isViewFlag}
                                        background="#4DC771"
                                        onColor="#4DC771"
                                        onHandleColor="#ffffff"
                                        offColor="#4DC771"
                                        uncheckedIcon={false}
                                        checkedIcon={false}
                                        height={20}
                                        width={46}
                                    />
                                    <div className={"right-title"}>Import</div>
                                </label>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label id="rm_domestic_form_zero_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                    <input
                                        type="radio"
                                        name="costingHead"
                                        className='zero-based'
                                        id='zeroBased'
                                        checked={
                                            state?.costingTypeId === ZBCTypeId ? true : false
                                        }
                                        onClick={() =>
                                            onPressVendor(ZBCTypeId)
                                        }
                                        disabled={data.isEditFlag || isViewFlag}
                                    />{" "}
                                    <span>Zero Based</span>
                                </Label>}
                                {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label id="rm_domestic_form_vendor_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                    <input
                                        type="radio"
                                        name="costingHead"
                                        className='vendor-based'
                                        id='vendorBased'
                                        checked={
                                            state?.costingTypeId === VBCTypeId ? true : false
                                        }
                                        onClick={() =>
                                            onPressVendor(VBCTypeId)
                                        }
                                        disabled={data.isEditFlag || isViewFlag}
                                    />{" "}
                                    <span>{vendorLabel} Based</span>
                                </Label>}
                                {(reactLocalStorage.getObject('CostingTypePermission').cbc) && <Label id="rm_domestic_form_customer_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                                    <input
                                        type="radio"
                                        name="costingHead"
                                        className='customer-based'
                                        id='customerBased'
                                        checked={
                                            state?.costingTypeId === CBCTypeId ? true : false
                                        }
                                        onClick={() =>
                                            onPressVendor(CBCTypeId)
                                        }
                                        disabled={data.isEditFlag || isViewFlag}
                                    />{" "}
                                    <span>Customer Based</span>
                                </Label>}
                            </Col>
                        </Row>
                        <AddRMDetails states={state}
                            Controller={Controller}
                            control={control}
                            register={register}
                            setValue={setValue}
                            getValues={getValues}
                            errors={errors}
                            useWatch={useWatch}
                            DataToChange={state?.DataToChange}
                            data={data}
                            AddAccessibilityRMANDGRADE={AddAccessibilityRMANDGRADE}
                            EditAccessibilityRMANDGRADE={EditAccessibilityRMANDGRADE}
                            disableAll={state?.disableAll}
                            isSourceVendorApiCalled={state?.isSourceVendorApiCalled}
                            commonFunction={commonFunction}
                            masterLevels={state?.masterLevels}
                            reset={reset}
                            clearErrors={clearErrors}
                        />
                        <AddRMFinancialDetails states={state}
                            Controller={Controller}
                            control={control}
                            register={register}
                            setValue={setValue}
                            getValues={getValues}
                            errors={errors}
                            useWatch={useWatch}
                            DataToChange={state?.DataToChange}
                            data={data}
                            totalBasicRate={state?.totalBasicRate}
                            commodityDetails={state?.commodityDetails}
                            disableAll={state?.disableAll}
                            reset={reset}
                        />
                        <RemarksAndAttachments states={state}
                            Controller={Controller}
                            control={control}
                            register={register}
                            setValue={setValue}
                            getValues={getValues}
                            errors={errors}
                            useWatch={useWatch}
                            DataToChange={state?.DataToChange}
                            data={data}
                            disableAll={state?.disableAll}
                            reset={reset}
                        />
                    </div>
                    <Row className="sf-btn-footer no-gutters justify-content-between sticky-btn-footer">
                        <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                            {state?.disableSendForApproval && <WarningMessage dClass={"mr-2"} message={'This user is not in the approval cycle'} />}
                            <Button
                                id="addBOPIMport_cancel"
                                className="mr15"
                                onClick={cancel}
                                disabled={false}
                                variant="cancel-btn"
                                icon="cancel-icon"
                                buttonName="Cancel"
                            />
                            {!isViewFlag && <>
                                {(!isViewFlag && (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !state?.isFinalApprovar) && getConfigurationKey().IsMasterApprovalAppliedConfigure) || (getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !state?.CostingTypePermission) ?
                                    <Button
                                        id="addRMDomestic_sendForApproval"
                                        type="button"
                                        className="approval-btn mr5"
                                        disabled={isViewFlag || state?.disableSendForApproval}
                                        onClick={onSubmit}
                                        icon={(showSendForApproval() || !state?.disableSendForApproval) ? "send-for-approval" : "save-icon"}
                                        buttonName={(showSendForApproval() || !state?.disableSendForApproval) ? "Send For Approval" : data.isEditFlag ? "Update" : "Save"}
                                    />
                                    :
                                    <Button
                                        id="addRMDomestic_updateSave"
                                        type="button"
                                        className="mr5"
                                        disabled={isViewFlag || state?.disableSendForApproval}
                                        onClick={onSubmit}
                                        icon={"save-icon"}
                                        buttonName={data.isEditFlag ? "Update" : "Save"}
                                    />
                                }
                            </>}
                        </div>
                    </Row>
                </form>
                {
                    state?.approveDrawer && (
                        <MasterSendForApproval
                            isOpen={state?.approveDrawer}
                            closeDrawer={closeApprovalDrawer}
                            isEditFlag={false}
                            masterId={RM_MASTER_ID}
                            type={'Sender'}
                            anchor={"right"}
                            UOM={state?.UOM}
                            approvalObj={state?.approvalObj}
                            isBulkUpload={false}
                            IsImportEntry={state?.isImport}
                            costingTypeId={state?.costingTypeId}
                            levelDetails={state?.levelDetails}
                            currency={state?.approvalObj?.Currency ? { label: state?.approvalObj?.Currency, value: state?.approvalObj?.Currency } : { label: "Currency", value: "Currency" }}
                            Technology={state?.Technology}
                            showScrapKeys={rawMaterailDetails?.ShowScrapKeys}
                            toolTipTextObject={state?.toolTipTextObject}
                            handleOperation={handleRMOperation}
                            commonFunction={finalUserCheckAndMasterLevelCheckFunction}
                            isEdit={state?.isEditFlag}
                        />
                    )
                }
            </Fragment>

    )
}
export default AddRMMaster  