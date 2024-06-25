import React, { Fragment, useEffect, useState } from "react"
import { Row, Col, Label } from 'reactstrap';
import AddRMDetails from "./AddRMDetails"
import AddRMFinancialDetails from "./AddRMFinancialDetails"
import { CBCTypeId, EMPTY_GUID, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT, RM_MASTER_ID, VBCTypeId, ZBCTypeId } from "../../../config/constants"
import { getCommodityIndexRateAverage } from '../../../../src/actions/Common';
import { costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission } from "../../common/CommonFunctions"
import { reactLocalStorage } from "reactjs-localstorage"
import { useForm, Controller, useWatch, } from 'react-hook-form';
import Switch from 'react-switch'
import { useDispatch, useSelector } from "react-redux";
import Button from '../../layout/Button';
import { animateScroll as scroll } from 'react-scroll';
import { DatasetController } from "chart.js";
import { debounce } from "lodash";
import RemarksAndAttachments from "../Remark&Attachments";
import { CheckApprovalApplicableMaster, checkForDecimalAndNull, checkForNull, getCodeBySplitting, getConfigurationKey, getNameBySplitting, loggedInUserId, userDetails, userTechnologyDetailByMasterId } from "../../../helper";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { fetchSpecificationDataAPI } from "../../../actions/Common";
import { SetRawMaterialDetails, createRM, getRMDataById, updateRMAPI, getMaterialTypeDataAPI } from "../actions/Material";
import DayTime from "../../common/DayTimeWrapper";
import LoaderCustom from "../../common/LoaderCustom";
import { isFinalApprover } from "../../costing/actions/Approval";
import { checkFinalUser } from "../../costing/actions/Costing";
import { getUsersMasterLevelAPI } from "../../../actions/auth/AuthActions";
import MasterSendForApproval from "../MasterSendForApproval";
import WarningMessage from "../../common/WarningMessage";
import AddIndexationMaterialListing from "./AddIndexationMaterialListing"
import HeaderTitle from "../../common/HeaderTitle";

function AddRMMaster(props) {
    const { data, EditAccessibilityRMANDGRADE, AddAccessibilityRMANDGRADE } = props
    const { register, handleSubmit, formState: { errors }, control, setValue, getValues, reset, isRMAssociated } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const dispatch = useDispatch()
    const [state, setState] = useState({
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

    })
    const isViewFlag = data?.isViewFlag ? true : false
    const rawMaterailDetails = useSelector((state) => state.material.rawMaterailDetails)
    const commodityAverage = useSelector((state) => state.material.commodityAverage)

    const avgValues = useWatch({
        control,
        name: ['Material', 'Index', 'ExchangeSource', 'fromDate', 'toDate']
    })
    const fieldValueGrade = useWatch({
        control,
        name: ['RawMaterialGrade']
    })
    useEffect(() => {
        if (getValues('Material') && getValues('Index') && getValues('ExchangeSource') && getValues('fromDate') && getValues('toDate')) {
            dispatch(getCommodityIndexRateAverage(
                getValues('Material')?.value,
                getValues('Index').value,
                '',
                '',
                getValues('ExchangeSource')?.label,
                DayTime(getValues('fromDate')).format('YYYY-MM-DD'),
                DayTime(getValues('toDate')).format('YYYY-MM-DD'),
                (res) => {
                    setValue('UnitOfMeasurement', { label: res?.data?.Data, value: res?.data?.Identity })
                    const updatedCommodityDetails = state.commodityDetails.map(detail => {
                        const avgRate = res?.data?.DataList.find(rate => rate.MaterialCommodityStandardDetailsId === detail.MaterialCommodityStandardDetailsId);
                        return {
                            ...detail,
                            BasicRate: avgRate ? avgRate.RateConversionPerConvertedUOM : null
                        };
                    });
                    setState(prevState => ({ ...prevState, commodityDetails: updatedCommodityDetails }));
                    if (res?.status === 200 && res?.data?.Result === false) {
                        Toaster.warning(res?.data?.Message)
                        return false
                    }
                }
            ));
        }
    }, [avgValues])

    useEffect(() => {

        if (getValues('RawMaterialGrade')) {
            const commodityVal = getValues('RawMaterialGrade').value;
            dispatch(getMaterialTypeDataAPI('', commodityVal, (res) => {
                if (res) {
                    let Data = res.data.Data
                    setValue('Material', { label: Data.MaterialType, value: Data.MaterialTypeId })
                    dispatch(getMaterialTypeDataAPI(Data.MaterialTypeId, '', (res) => {
                        let Data = res.data.Data
                        setState(prevState => ({ ...prevState, commodityDetails: Data.MaterialCommodityStandardDetails }))

                    }))
                }
            }))
        }
    }, [fieldValueGrade])

    const commodityToggle = () => {
        setState(prevState => ({ ...prevState, isCommodityOpen: !state.isCommodityOpen }))
    }

    useEffect(() => {
        getDetails(data)
        setState(prevState => ({ ...prevState, costingTypeId: getCostingTypeIdByCostingPermission() }))
        return () => {
            dispatch(SetRawMaterialDetails({ states: {}, Technology: {}, ShowScrapKeys: {} }, () => { }))
        }
    }, [])
    useEffect(() => {
        if (!isViewFlag && getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
            commonFunction()
        }
    }, [state.costingTypeId])


    const userMasterLevelAPI = useSelector((state) => state.auth.userMasterLevelAPI)
    /**
     * @method onPressVendor
     * @description Used for Vendor checked
     */
    const onPressVendor = (costingHeadFlag) => {
        reset()
        setState(prevState => ({
            ...prevState,
            costingTypeId: costingHeadFlag,
        }));
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
    const commonFunction = (plantId = EMPTY_GUID) => {
        let levelDetailsTemp = []
        levelDetailsTemp = userTechnologyDetailByMasterId(state.costingTypeId, RM_MASTER_ID, userMasterLevelAPI)
        setState(prevState => ({ ...prevState, levelDetails: levelDetailsTemp }))
        let obj = {
            DepartmentId: userDetails().DepartmentId,
            UserId: loggedInUserId(),
            TechnologyId: RM_MASTER_ID,
            Mode: 'master',
            approvalTypeId: costingTypeIdToApprovalTypeIdFunction(state.costingTypeId),
            plantId: plantId
        }
        dispatch(checkFinalUser(obj, (res) => {
            if (res?.data?.Result) {
                setState(prevState => ({ ...prevState, isFinalApprovar: res?.data?.Data?.IsFinalApprover, CostingTypePermission: true, finalApprovalLoader: false }))
            }
            if (res?.data?.Data?.IsUserInApprovalFlow === false) {
                setState(prevState => ({ ...prevState, disableSendForApproval: true }))
            } else {
                setState(prevState => ({ ...prevState, disableSendForApproval: false }))
            }
        }))
        setState(prevState => ({ ...prevState, CostingTypePermission: false, finalApprovalLoader: false }))
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
                            ...prevState, DataToChange: Data, isImport: Data.RawMaterialEntryType === ENTRY_TYPE_IMPORT ? true : false, isLoader: false, costingTypeId: Data.CostingTypeId

                        }))
                        if (getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
                            dispatch(getUsersMasterLevelAPI(loggedInUserId(), RM_MASTER_ID, (res) => {
                                setTimeout(() => {
                                    commonFunction(Data?.Plant[0]?.PlantId)
                                }, 100);
                            }))
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


    const onSubmit = debounce(handleSubmit((values) => {
        
        const { DataToChange } = state
        let scrapRate = ''
        let jaliRateBaseCurrency = ''
        let machiningRateBaseCurrency = ''
        let scrapRateInr = ''
        const { ShowScrapKeys } = rawMaterailDetails
        const Plants = values.Plants
        if (ShowScrapKeys?.showCircleJali) {

            scrapRate = state?.isImport ? checkForNull(values?.JaliScrapCostSelectedCurrency) : checkForNull(values?.JaliScrapCostBaseCurrency)
            scrapRateInr = state?.isImport ? checkForNull(values?.JaliScrapCostBaseCurrency) : 0
            jaliRateBaseCurrency = checkForNull(values?.CircleScrapCostBaseCurrency)
            if (checkForNull(values?.BasicRateBaseCurrency) < checkForNull(jaliRateBaseCurrency) || checkForNull(values?.BasicRateBaseCurrency) < checkForNull(scrapRate)) {
                setState(prevState => ({ ...prevState, setDisable: false }))
                Toaster.warning("Scrap rate/cost should not be greater than the basic rate.")
                return false
            }

        } else if (ShowScrapKeys?.showForging) {

            scrapRate = state?.isImport ? checkForNull(values?.ForgingScrapSelectedCurrency) : checkForNull(values?.ForgingScrapBaseCurrency)
            scrapRateInr = state?.isImport ? checkForNull(values?.ForgingScrapSelectedCurrency) : 0
            machiningRateBaseCurrency = state?.isImport ? checkForNull(values?.MachiningScrapSelectedCurrency) : checkForNull(values?.MachiningScrapBaseCurrency)
            if (checkForNull(values?.BasicRateBaseCurrency) < checkForNull(scrapRate) || checkForNull(values?.BasicRateBaseCurrency) < checkForNull(machiningRateBaseCurrency)) {
                setState(prevState => ({ ...prevState, setDisable: false }))
                Toaster.warning("Scrap rate/cost should not be greater than the basic rate.")
                return false
            }

        } else if (ShowScrapKeys?.showScrap) {

            scrapRate = state?.isImport ? checkForNull(values?.ScrapRateSelectedCurrency) : checkForNull(values?.ScrapRateBaseCurrency)
            scrapRateInr = state?.isImport ? checkForNull(values?.ScrapRateBaseCurrency) : 0
            if (checkForNull(values?.BasicRateBaseCurrency) < checkForNull(scrapRate)) {
                setState(prevState => ({ ...prevState, setDisable: false }))
                Toaster.warning("Scrap rate/cost should not be greater than the basic rate.")
                return false
            }
        }
        let plantArray = []
        if ((state.costingTypeId === ZBCTypeId && !getConfigurationKey().IsMultipleUserAllowForApproval) || state.isEditFlag) {
            Plants && Plants.map((item) => {
                plantArray.push({ PlantName: item.label, PlantId: item.value, PlantCode: '', })
                return plantArray
            })
        } else {
            plantArray.push({ PlantName: values?.Plants?.label, PlantId: values?.Plants?.value, PlantCode: '', })
        }
        let formData = {
            "RawMaterialId": state.RawMaterialID,
            "IsSendForApproval": false,
            "CostingTypeId": state?.costingTypeId,
            "RawMaterialCode": values?.RawMaterialCode?.value,
            "CutOffPrice": state?.isImport ? values?.cutOffPriceSelectedCurrency : values?.cutOffPriceBaseCurrency,
            "IsCutOffApplicable": true,
            "TechnologyId": values?.Technology?.value,
            "TechnologyName": values?.Technology?.label,
            "RawMaterialEntryType": state.isImport ? checkForNull(ENTRY_TYPE_IMPORT) : checkForNull(ENTRY_TYPE_DOMESTIC),
            "RawMaterial": values?.RawMaterialName?.value,
            "RMGrade": values?.RawMaterialGrade?.value,
            "RawMaterialGradeName": values?.RawMaterialGrade?.label,
            "RMSpec": values?.RawMaterialSpecification?.value,
            "RawMaterialSpecificationName": values?.RawMaterialSpecification?.label,
            "Category": values?.RawMaterialCategory?.value,
            "RawMaterialCategoryName": values?.RawMaterialCategory?.label,
            "CustomerId": state.costingTypeId === CBCTypeId ? values?.clientName?.value : '',
            "CustomerName": state.costingTypeId === CBCTypeId ? getNameBySplitting(values?.clientName?.label) : '',
            "CustomerCode": state.costingTypeId === CBCTypeId ? getCodeBySplitting(values?.clientName?.label) : '',
            "Vendor": !state.isEditFlag ? rawMaterailDetails?.Vendor?.value : values?.Vendor?.value,
            "VendorName": state.costingTypeId === VBCTypeId ? !state.isEditFlag ? getNameBySplitting(rawMaterailDetails?.Vendor?.label) : getNameBySplitting(values?.Vendor?.label) : '',
            "VendorCode": state.costingTypeId === VBCTypeId ? !state.isEditFlag ? getCodeBySplitting(rawMaterailDetails?.Vendor?.label) : getCodeBySplitting(values?.Vendor?.label) : '',
            "HasDifferentSource": rawMaterailDetails?.states?.HasDifferentSource,
            "Source": values?.source,
            "SourceLocation": values?.SourceSupplierCityId?.value,
            "SourceSupplierLocationName": values?.SourceSupplierCityId?.label,
            "UOM": values?.UnitOfMeasurement?.value,
            "UnitOfMeasurementName": values?.UnitOfMeasurement?.label,
            "BasicRatePerUOM": state.isImport ? values?.BasicRateSelectedCurrency : values?.BasicRateBaseCurrency,
            "ScrapRate": scrapRate,
            "MachiningScrapRate": state?.isImport ? values?.MachiningScrapSelectedCurrency : values?.MachiningScrapBaseCurrency,
            "NetLandedCost": state?.isImport ? values?.NetLandedCostSelectedCurrency : values?.NetLandedCostBaseCurrency,
            "RMFreightCost": state?.isImport ? values?.FreightChargeSelectedCurrency : values?.FreightChargeBaseCurrency,
            "RMShearingCost": state?.isImport ? values?.ShearingCostSelectedCurrency : values?.ShearingCostBaseCurrency,
            "JaliScrapCost": state.isImport ? values?.CircleScrapCostSelectedCurrency : values?.CircleScrapCostBaseCurrency,
            "Remark": values?.Remarks,
            "ScrapRateInINR": scrapRateInr,
            "MachiningScrapRateInINR": state?.isImport ? values?.MachiningScrapBaseCurrency : 0,
            "CutOffPriceInINR": state?.isImport ? values?.cutOffPriceBaseCurrency : 0,
            "EffectiveDate": DayTime(values?.effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
            "LoggedInUserId": loggedInUserId(),
            // "IsFinancialDataChanged": true,
            "Plant": plantArray,
            "VendorPlant": [],
            "Attachements": rawMaterailDetails?.Files,
            "RawMaterialName": values?.RawMaterialName?.label,
            "NetLandedCostConversion": state?.isImport ? values?.NetLandedCostBaseCurrency : 0,
            "CurrencyId": values?.currency?.value,
            "Currency": values?.currency?.label,
            "BasicRatePerUOMConversion": state.isImport ? values?.BasicPriceBaseCurrency : 0,
            "NetCostWithoutConditionCost": state?.isImport ? values?.BasicPriceSelectedCurrency : values?.BasicPriceBaseCurrency,
            "NetCostWithoutConditionCostConversion": state?.isImport ? values?.BasicPriceBaseCurrency : 0,
            "NetConditionCost": state?.isImport ? values?.FinalConditionCostSelectedCurrency : values?.FinalConditionCostBaseCurrency,
            "NetConditionCostConversion": state?.isImport ? values?.FinalConditionCostBaseCurrency : 0,
            "CurrencyExchangeRate": rawMaterailDetails?.CurrencyValue,
            "RawMaterialFreightCostConversion": state?.isImport ? values?.FreightChargeBaseCurrency : 0,
            "RawMaterialShearingCostConversion": state?.isImport ? values?.ShearingCostBaseCurrency : 0,
            "JaliScrapCostConversion": state.isImport ? values?.CircleScrapCostBaseCurrency : 0,
            "RawMaterialConditionsDetails": rawMaterailDetails?.ConditionTableData,
            "IsScrapUOMApply": rawMaterailDetails?.states?.IsApplyHasDifferentUOM,
            "ScrapUnitOfMeasurementId": rawMaterailDetails?.states?.IsApplyHasDifferentUOM === true ? values?.ScrapRateUOM?.value : '',
            "ScrapUnitOfMeasurement": rawMaterailDetails?.states?.IsApplyHasDifferentUOM === true ? values?.ScrapRateUOM?.label : '',
            "UOMToScrapUOMRatio": rawMaterailDetails?.states?.IsApplyHasDifferentUOM === true ? values?.ConversionRatio : '',
            "CalculatedFactor": rawMaterailDetails?.states?.IsApplyHasDifferentUOM === true ? values?.CalculatedFactor : '',
            "ScrapRatePerScrapUOM": rawMaterailDetails?.states?.IsApplyHasDifferentUOM === true ? state?.isImport ? values?.ScrapRatePerScrapUOM : values.ScrapRatePerScrapUOMBaseCurrency : '',
            "ScrapRatePerScrapUOMConversion": rawMaterailDetails?.states?.IsApplyHasDifferentUOM === true || state?.isImport ? values?.ScrapRatePerScrapUOMBaseCurrency : ''
        }


        let basicRate = state.isImport ? checkForNull(values?.BasicRateSelectedCurrency) : checkForNull(values.BasicRateBaseCurrency)
        let cuttOffPrice = state.isImport ? checkForNull(values?.cutOffPriceSelectedCurrency) : checkForNull(values.cutOffPriceBaseCurrency)
        let shearingCost = state.isImport ? checkForNull(values?.ShearingCostSelectedCurrency) : checkForNull(values.ShearingCostBaseCurrency)
        let freightCost = state.isImport ? checkForNull(values?.FreightChargeSelectedCurrency) : checkForNull(values.FreightChargeBaseCurrency)
        let machiningScrapCost = state.isImport ? checkForNull(values?.MachiningScrapSelectedCurrency) : checkForNull(values.MachiningScrapBaseCurrency)
        let circleScrapCost = state.isImport ? checkForNull(values?.CircleScrapCostSelectedCurrency) : checkForNull(values.CircleScrapCostBaseCurrency)

        let financialDataNotChanged = (cuttOffPrice === checkForNull(DataToChange?.CutOffPrice)) && (basicRate === checkForNull(DataToChange?.BasicRatePerUOM)) && rawMaterailDetails?.states?.IsApplyHasDifferentUOM === DataToChange?.IsScrapUOMApply
            && checkForNull(values?.ConversionRatio) === checkForNull(DataToChange?.UOMToScrapUOMRatio) && checkForNull(values?.ScrapRatePerScrapUOM) === checkForNull(DataToChange?.ScrapRatePerScrapUOM) && (freightCost === checkForNull(DataToChange?.RMFreightCost))
            && (shearingCost === checkForNull(DataToChange?.RMShearingCost)) && (circleScrapCost === checkForNull(DataToChange?.JaliScrapCost)) && (machiningScrapCost === checkForNull(DataToChange?.MachiningScrapRate))
        let nonFinancialDataNotChanged = (JSON.stringify(rawMaterailDetails.Files) === JSON.stringify(DataToChange?.FileList) && values?.Remarks === DataToChange?.Remark)
        if (state.isEditFlag) {
            if (!isRMAssociated) {
                                                if (financialDataNotChanged && nonFinancialDataNotChanged) {
                    if (!state.isFinalApprovar) {
                        Toaster.warning('Please change data to send RM for approval')
                        return false
                    }
                } else if ((!financialDataNotChanged) && DayTime(values?.effectiveDate).format('YYYY-MM-DD HH:mm:ss') === DayTime(DataToChange?.EffectiveDate).format('YYYY-MM-DD HH:mm:ss')) {
                    Toaster.warning('Please update the effective date')
                    setState(prevState => ({ ...prevState, isDateChanged: true }))
                    return false
                }
            }

            formData.IsFinancialDataChanged = financialDataNotChanged ? false : true
        }

        //  IF: APPROVAL FLOW
        if (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !state.isFinalApprovar && !financialDataNotChanged) {
            // this.allFieldsInfoIcon(true)
            formData.IsSendForApproval = true
            setState(prevState => ({
                ...prevState, approveDrawer: true, approvalObj: formData
            }))
        } else {
            if (state.isEditFlag) {
                formData.IsSendForApproval = false

                dispatch(updateRMAPI(formData, (res) => {
                    if (res?.data?.Result) {
                        Toaster.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS)
                        cancel('submit')
                    }
                }))
            } else {
                dispatch(createRM(formData, (res) => {
                    if (res?.data?.Result) {
                        Toaster.success(MESSAGES.MATERIAL_ADD_SUCCESS)
                        cancel('submit')
                    }
                }))
            }
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
    // 

    return (
        state.isLoader ? <LoaderCustom customClass="loader-center" /> :
            <Fragment>
                <form className="add-min-height">
                    <Row>
                        <Col md="4" className="switch mb15">
                            <label className="switch-level">
                                <div className={"left-title"}>Domestic</div>
                                <Switch
                                    onChange={onRmToggle}
                                    checked={state.isImport}
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
                                        state.costingTypeId === ZBCTypeId ? true : false
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
                                        state.costingTypeId === VBCTypeId ? true : false
                                    }
                                    onClick={() =>
                                        onPressVendor(VBCTypeId)
                                    }
                                    disabled={data.isEditFlag || isViewFlag}
                                />{" "}
                                <span>Vendor Based</span>
                            </Label>}
                            {(reactLocalStorage.getObject('CostingTypePermission').cbc) && <Label id="rm_domestic_form_customer_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                                <input
                                    type="radio"
                                    name="costingHead"
                                    className='customer-based'
                                    id='customerBased'
                                    checked={
                                        state.costingTypeId === CBCTypeId ? true : false
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
                        DataToChange={state.DataToChange}
                        data={data}
                        commonFunction={commonFunction}
                        AddAccessibilityRMANDGRADE={AddAccessibilityRMANDGRADE}
                        EditAccessibilityRMANDGRADE={EditAccessibilityRMANDGRADE} />
                    <AddRMFinancialDetails states={state}
                        Controller={Controller}
                        control={control}
                        register={register}
                        setValue={setValue}
                        getValues={getValues}
                        errors={errors}
                        useWatch={useWatch}
                        DataToChange={state.DataToChange}
                        data={data} />

                    <Row className="mb-3 accordian-container">
                        <Col md="6" className='d-flex align-items-center'>
                            <HeaderTitle
                                title={'Commodity Details:'}
                                customClass={'Personal-Details'}
                            />
                        </Col>
                        <Col md="6">
                            <div className={'right-details text-right'}>
                                <button className="btn btn-small-primary-circle ml-1" onClick={commodityToggle} type="button">{state.isCommodityOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                            </div>
                        </Col>
                        <AddIndexationMaterialListing
                            states={state}
                            isOpen={state.isCommodityOpen}
                            commodityDetails={state.commodityDetails}
                        />
                    </Row>
                    <RemarksAndAttachments Controller={Controller}
                        control={control}
                        register={register}
                        setValue={setValue}
                        getValues={getValues}
                        errors={errors}
                        useWatch={useWatch}
                        DataToChange={state.DataToChange}
                        data={data} />
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                            {state.disableSendForApproval && <WarningMessage dClass={"mr-2"} message={'This user is not in the approval cycle'} />}
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
                                {(!isViewFlag && (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !state.isFinalApprovar) && getConfigurationKey().IsMasterApprovalAppliedConfigure) || (getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !state.CostingTypePermission) ?
                                    <Button
                                        id="addRMDomestic_sendForApproval"
                                        type="button"
                                        className="approval-btn mr5"
                                        disabled={isViewFlag || state.disableSendForApproval}
                                        onClick={onSubmit}
                                        icon={showSendForApproval() ? "send-for-approval" : "save-icon"}
                                        buttonName={showSendForApproval() ? "Send For Approval" : 'Update'}
                                    />
                                    :
                                    <Button
                                        id="addRMDomestic_updateSave"
                                        type="button"
                                        className="mr5"
                                        disabled={isViewFlag || state.disableSendForApproval}
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
                    state.approveDrawer && (
                        <MasterSendForApproval
                            isOpen={state.approveDrawer}
                            closeDrawer={closeApprovalDrawer}
                            isEditFlag={false}
                            masterId={RM_MASTER_ID}
                            type={'Sender'}
                            anchor={"right"}
                            UOM={state.UOM}
                            approvalObj={state.approvalObj}
                            isBulkUpload={false}
                            IsImportEntry={state.isImport}
                            costingTypeId={state.costingTypeId}
                            levelDetails={state.levelDetails}
                            currency={{ label: reactLocalStorage.getObject("baseCurrency"), value: reactLocalStorage.getObject("baseCurrency") }}
                            Technology={state.Technology}
                            showScrapKeys={rawMaterailDetails?.ShowScrapKeys}
                            toolTipTextObject={state.toolTipTextObject}
                        />
                    )
                }
            </Fragment>

    )
}
export default AddRMMaster