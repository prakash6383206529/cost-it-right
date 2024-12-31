
import React, { useEffect, useRef, useState } from "react";
import { SearchableSelectHookForm, TextAreaHookForm, DatePickerHookForm, NumberFieldHookForm, TextFieldHookForm, AsyncSearchableSelectHookForm } from '../../../components/layout/HookFormInputs'
import { useForm, Controller, useWatch } from "react-hook-form";
import Toaster from "../../common/Toaster";
import { Loader } from "../../common/Loader";
import {
    maxLength12, required,
    checkWhiteSpaces, maxLength25, hashValidation, checkForNull, checkForDecimalAndNull, acceptAllExceptSingleSpecialCharacter, maxLength80,
    validateFileName,
} from "../../../helper/validation";

import { AttachmentValidationInfo, MESSAGES } from "../../../config/message";
import { getConfigurationKey, IsFetchExchangeRateVendorWise, loggedInUserId, userDetails } from "../../../helper/auth";
import { Row, Col, Label } from 'reactstrap';
import { CBCTypeId, CRMHeads, EMPTY_GUID, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT, FILE_URL, OPERATIONS_ID, VBCTypeId, VBC_VENDOR_TYPE, ZBCTypeId, searchCount } from "../../../config/constants";
import HeaderTitle from "../../common/HeaderTitle";
import { useDispatch, useSelector } from 'react-redux'
import { reactLocalStorage } from "reactjs-localstorage";
import { autoCompleteDropdown, costingTypeIdToApprovalTypeIdFunction, getEffectiveDateMaxDate, getEffectiveDateMinDate } from "../../common/CommonFunctions";
import { getClientSelectList } from "../actions/Client";
import { AcceptableOperationUOM, LOGISTICS } from "../../../config/masterData";
import { getUOMSelectList, getVendorNameByVendorSelectList } from "../../../actions/Common";
import DayTime from "../../common/DayTimeWrapper";
import { createOperationsAPI, fileUploadOperation, getOperationPartSelectList, updateOperationAPI } from "../actions/OtherOperation";
import LoaderCustom from "../../common/LoaderCustom";
import Dropzone from "react-dropzone-uploader";
import imgRedcross from '../../../assests/images/red-cross.png';
import TooltipCustom from "../../common/Tooltip";
import { useLabels } from "../../../helper/core";
import { getUsersMasterLevelAPI } from "../../../actions/auth/AuthActions";
import { CheckApprovalApplicableMaster, userTechnologyDetailByMasterId } from "../../../helper";
import { checkFinalUser, getExchangeRateByCurrency } from "../../costing/actions/Costing";
import MasterSendForApproval from "../MasterSendForApproval";
import Button from "../../layout/Button";
import { debounce } from "lodash";
import Switch from 'react-switch'
import { getPlantUnitAPI } from "../actions/Plant";

function AddMoreOperation(props) {
    const { addMoreDetailObj, isEditFlag, detailObject, isViewMode } = props
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const costingSpecifiTechnology = useSelector(state => state.costing.costingSpecifiTechnology)
    const clientSelectList = useSelector(state => state.client.clientSelectList)
    const UOMSelectList = useSelector(state => state.comman.UOMSelectList)
    const plantSelectList = useSelector(state => state.comman.plantSelectList)
    const currencySelectList = useSelector(state => state.comman.currencySelectList)
    const [technology, setTechnology] = useState("");
    const [isLoader, setIsLoader] = useState(false);
    const [isMaterialCostOpen, setIsMaterialCostOpen] = useState(false);
    const [isPowerCostOpen, setIsPowerCostOpen] = useState(false);
    const [isLabourCostOpen, setIsLabourCostOpen] = useState(false);
    const [isConsumablesCostOpen, setIsConsumablesCostOpen] = useState(false);
    const [isInterestCostOpen, setIsInterestCostOpen] = useState(false);
    const [isOtherOperationCostOpen, setIsOtherOperationCostOpen] = useState(false);
    const [isOtherCostOpen, setIsOtherCostOpen] = useState(false);
    const [includeInterestInRejection, setIncludeInterestInRejection] = useState(false);
    const [isWelding, setIsWelding] = useState(false)
    const [isPlating, setIsPlating] = useState(false)
    const [other, setIsOther] = useState(false)
    const [attachmentLoader, setAttachmentLoader] = useState(false)
    const [client, setClient] = useState([])
    const [plant, setPlant] = useState([])
    const [uom, setUom] = useState([])
    const [files, setFiles] = useState([])
    const [vendor, setVendor] = useState([])
    const [dataToSend, setDataToSend] = useState({})
    const [disable, setDisable] = useState(true);
    const [IsOpen, setIsOpen] = useState(false);
    const [dataObj, setDataObj] = useState(detailObject ? detailObject : '');
    const dropzone = useRef(null);
    const dispatch = useDispatch();
    const operationSelectList = useSelector(state => state.otherOperation.operationSelectList)
    const { technologyLabel, vendorLabel } = useLabels();
    let defaultValues = {
        remark: detailObject && detailObject.Remark ? detailObject.Remark : '',
        crmHeadWireRate: detailObject && detailObject.MaterialWireCRMHead && { label: detailObject.MaterialWireCRMHead, value: 1 },
        wireRate: detailObject && detailObject.MaterialWireRate ? checkForDecimalAndNull(detailObject.MaterialWireRate, initialConfiguration.NoOfDecimalForPrice) : '',
        consumptionWire: detailObject && detailObject.MaterialWireConsumption ? checkForDecimalAndNull(detailObject.MaterialWireConsumption, initialConfiguration.NoOfDecimalForPrice) : '',
        wireCost: detailObject && detailObject.MaterialWireCost ? checkForDecimalAndNull(detailObject.MaterialWireCost, initialConfiguration.NoOfDecimalForPrice) : '',
        crmHeadGasRate: detailObject && detailObject.MaterialGasCRMHead && { label: detailObject.MaterialGasCRMHead, value: 1 },
        gasRate: detailObject && detailObject.MaterialGasRate ? checkForDecimalAndNull(detailObject.MaterialGasRate, initialConfiguration.NoOfDecimalForPrice) : '',
        consumptionGas: detailObject && detailObject.MaterialGasConsumption ? checkForDecimalAndNull(detailObject.MaterialGasConsumption, initialConfiguration.NoOfDecimalForPrice) : '',
        gasCostWelding: detailObject && detailObject.MaterialGasCost ? checkForDecimalAndNull(detailObject.MaterialGasCost, initialConfiguration.NoOfDecimalForPrice) : '',
        //////////////////////////
        crmHeadPowerWelding: detailObject && detailObject.PowerCRMHead && { label: detailObject.PowerCRMHead, value: 1 },
        electricityRate: detailObject && detailObject.PowerElectricityRate ? checkForDecimalAndNull(detailObject.PowerElectricityRate, initialConfiguration.NoOfDecimalForPrice) : '',
        consumptionPower: detailObject && detailObject.PowerElectricityConsumption ? checkForDecimalAndNull(detailObject.PowerElectricityConsumption, initialConfiguration.NoOfDecimalForPrice) : '',
        electricityCostWelding: detailObject && detailObject.PowerElectricityCost ? checkForDecimalAndNull(detailObject.PowerElectricityCost, initialConfiguration.NoOfDecimalForPrice) : '',
        //////////////////////////
        crmHeadLabourWelding: detailObject && detailObject.LabourCRMHead && { label: detailObject.LabourCRMHead, value: 1 },
        labourRate: detailObject && detailObject.LabourManPowerRate ? checkForDecimalAndNull(detailObject.LabourManPowerRate, initialConfiguration.NoOfDecimalForPrice) : '',
        weldingShift: detailObject && detailObject.LabourManPowerConsumption ? checkForDecimalAndNull(detailObject.LabourManPowerConsumption, initialConfiguration.NoOfDecimalForPrice) : '',
        labourCost: detailObject && detailObject.LabourManPowerCost ? checkForDecimalAndNull(detailObject.LabourManPowerCost, initialConfiguration.NoOfDecimalForPrice) : '',
        //////////////////////////
        crmHeadConsumableMachineCost: detailObject && detailObject.ConsumableMachineCRMHead && { label: detailObject.ConsumableMachineCRMHead, value: 1 },

    }
    const [state, setState] = useState({
        isFinalApprovar: false,
        disableSendForApproval: false,
        CostingTypePermission: false,
        finalApprovalLoader: true,
        approveDrawer: false,
        approvalObj: {},
        levelDetails: {},
        isDateChanged: false,
        disableAll: false,
        showWarning: false,
        plantCurrency: addMoreDetailObj.plantCurrencyState ?? 1,
        settlementCurrency: addMoreDetailObj.settlementCurrency ?? 1,
        plantExchangeRateId: null,
        settlementExchangeRateId: null,
        isImport: addMoreDetailObj?.isImport,
        currency: addMoreDetailObj.currency ?? null,
        ExchangeSource: null,
        plantCurrencyID: null,
        costingTypeId: addMoreDetailObj?.costingTypeId,
        hidePlantCurrency: addMoreDetailObj?.hidePlantCurrency ?? false
    })
    const { register, handleSubmit, formState: { errors }, control, setValue, getValues } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    });
    const fromCurrencyRef = useRef(null);
    const plantCurrencyRef = useRef(1);
    const settlementCurrencyRef = useRef(1);
    const localCurrencyLabel = useRef(null)


    const fieldValues = useWatch({
        control,
        name: addMoreDetailObj?.useWatchArray
    })
    useEffect(() => {
        let obj = {}
        if (isWelding) {
            obj = { ...setMaterialCostWelding(), ...setPowerCostWelding(), ...setLabourCostWelding() }
            setDataToSend(prevState => ({ ...prevState, ...obj }))
            setNetCostWelding(obj)
        } else if (other) {
            setRejectionReworkAndProfitCost()
        } else {
            obj = { ...setMaterialCostWelding(), ...setPowerCostWelding() }
            setDataToSend(prevState => ({ ...prevState, ...obj }))
            setRejectionReworkAndProfitCostPlating(obj)
            setNetCostPlating(obj)
        }
        // callExchangeRateAPI(obj)

    }, [fieldValues, includeInterestInRejection, fromCurrencyRef])
    useEffect(() => {
        fromCurrencyRef.current = fromCurrencyRef
        settlementCurrencyRef.current = settlementCurrencyRef
        plantCurrencyRef.current = plantCurrencyRef
        localCurrencyLabel.current = localCurrencyLabel
    }, [fromCurrencyRef, settlementCurrencyRef, plantCurrencyRef, localCurrencyLabel]);
    useEffect(() => {
        callExchangeRateAPI()
    }, [localCurrencyLabel]);

    const callExchangeRateAPI = (obj) => {
        const vendorValue = IsFetchExchangeRateVendorWise() ?
            ((addMoreDetailObj.costingTypeId === VBCTypeId) ? vendor.value : EMPTY_GUID) :
            EMPTY_GUID;
        const costingType = IsFetchExchangeRateVendorWise() ?
            ((addMoreDetailObj.costingTypeId === VBCTypeId) ? VBCTypeId : addMoreDetailObj.costingTypeId) :
            ZBCTypeId;
        const fromCurrency = state.isImport ? fromCurrencyRef?.current?.label : localCurrencyLabel?.current;
        const toCurrency = reactLocalStorage.getObject("baseCurrency");
        const hasCurrencyAndDate = Boolean(localCurrencyLabel?.current && getValues('effectiveDate'));

        if (hasCurrencyAndDate) {
            if (IsFetchExchangeRateVendorWise() && (vendor?.length === 0 && client?.length === 0)) {
                return;
            }

            const callAPI = (from, to) => {
                return new Promise((resolve) => {
                    dispatch(getExchangeRateByCurrency(
                        from,
                        costingType,
                        DayTime(getValues('effectiveDate')).format('YYYY-MM-DD'),
                        vendorValue,
                        client.value,
                        false,
                        to,
                        state.ExchangeSource?.label ?? null,
                        res => {
                            if (Object.keys(res.data.Data).length === 0) {
                                setState(prevState => ({ ...prevState, showWarning: true }));
                            } else {
                                setState(prevState => ({ ...prevState, showWarning: false }));
                            }
                            resolve({
                                rate: checkForNull(res.data.Data.CurrencyExchangeRate),
                                exchangeRateId: res?.data?.Data?.ExchangeRateId
                            });
                        }
                    ));
                });
            };

            if (state.isImport) {
                // First API call
                callAPI(fromCurrency, localCurrencyLabel?.current).then(({ rate: rate1, exchangeRateId: exchangeRateId1 }) => {
                    callAPI(fromCurrency, reactLocalStorage.getObject("baseCurrency")).then(({ rate: rate2, exchangeRateId: exchangeRateId2 }) => {
                        setState(prevState => ({
                            ...prevState,
                            plantCurrency: rate1,
                            settlementCurrency: rate2,
                            plantExchangeRateId: exchangeRateId1,
                            settlementExchangeRateId: exchangeRateId2
                        }));
                        plantCurrencyRef.current = rate1
                        settlementCurrencyRef.current = rate2
                        if (isWelding) {
                            obj = { ...setMaterialCostWelding(), ...setPowerCostWelding(), ...setLabourCostWelding() }
                            setDataToSend(prevState => ({ ...prevState, ...obj }))
                            setNetCostWelding(obj)
                        } else if (other) {
                            setRejectionReworkAndProfitCost()
                        } else {
                            obj = { ...setMaterialCostWelding(), ...setPowerCostWelding() }
                            setDataToSend(prevState => ({ ...prevState, ...obj }))
                            setRejectionReworkAndProfitCostPlating(obj)
                            setNetCostPlating(obj)
                        }
                    });
                });
            } else if (localCurrencyLabel.current !== reactLocalStorage?.getObject("baseCurrency")) {
                // Original single API call for non-import case
                callAPI(fromCurrency, toCurrency).then(({ rate, exchangeRateId }) => {
                    setState(prevState => ({
                        ...prevState,
                        plantCurrency: rate,
                        plantExchangeRateId: exchangeRateId
                    }));
                    plantCurrencyRef.current = rate
                    if (isWelding) {
                        obj = { ...setMaterialCostWelding(), ...setPowerCostWelding(), ...setLabourCostWelding() }
                        setDataToSend(prevState => ({ ...prevState, ...obj }))
                        setNetCostWelding(obj)
                    } else if (other) {
                        setRejectionReworkAndProfitCost()
                    } else {
                        obj = { ...setMaterialCostWelding(), ...setPowerCostWelding() }
                        setDataToSend(prevState => ({ ...prevState, ...obj }))
                        setRejectionReworkAndProfitCostPlating(obj)
                        setNetCostPlating(obj)
                    }
                });
            }
        }
    };

    const setMaterialCostWelding = () => {

        let wireRate = Number(getValues('wireRate'))
        let consumptionWire = Number(getValues('consumptionWire'))
        let gasRate = Number(getValues('gasRate'))
        let consumptionGas = Number(getValues('consumptionGas'))
        let wireCost
        let gasCost
        if (wireRate && consumptionWire) {
            wireCost = checkForNull(wireRate) * checkForNull(consumptionWire)
            setValue('wireCost', checkForDecimalAndNull(wireCost, initialConfiguration.NoOfDecimalForPrice))
        }

        if (gasRate && consumptionGas) {
            gasCost = checkForNull(gasRate) * checkForNull(consumptionGas)
            setValue('gasCostWelding', checkForDecimalAndNull(gasCost, initialConfiguration.NoOfDecimalForPrice))
        }
        return { wireCost: wireCost, gasCost: gasCost }
    }


    const setPowerCostWelding = () => {

        let electricityRate = Number(getValues('electricityRate'))
        let consumptionPower = Number(getValues('consumptionPower'))
        let electricityCost
        if (electricityRate && consumptionPower) {
            electricityCost = checkForNull(electricityRate) * checkForNull(consumptionPower)
            setValue('electricityCostWelding', checkForDecimalAndNull(electricityCost, initialConfiguration.NoOfDecimalForPrice))
        }
        return { electricityCost: electricityCost }
    }

    const setLabourCostWelding = () => {

        let labourRate = Number(getValues('labourRate'))
        let weldingShift = Number(getValues('weldingShift'))
        let labourCost
        if (labourRate && weldingShift) {
            labourCost = checkForNull(labourRate / weldingShift)
            setValue('labourCost', checkForDecimalAndNull(labourCost, initialConfiguration.NoOfDecimalForPrice))
        }
        return { labourCost: labourCost }
    }

    const setNetCostWelding = (obj) => {
        let wireCost = checkForNull(obj.wireCost)
        let gasCost = checkForNull(obj.gasCost)
        let electricityCost = checkForNull(obj.electricityCost)
        let labourCost = checkForNull(obj.labourCost)
        let machineConsumableCost = checkForNull(Number(getValues('machineConsumableCost')))
        let welderCost = checkForNull(Number(getValues('welderCost')))
        let otherCostWelding = checkForNull(Number(getValues('otherCostWelding')))
        let interestDepriciationCost = checkForNull(Number(getValues('interestDepriciationCost')))
        let totalCost = wireCost + gasCost + electricityCost + labourCost + machineConsumableCost + welderCost + otherCostWelding + interestDepriciationCost
        setDataToSend(prevState => ({ ...prevState, netCostWelding: totalCost }))
        if (state.isImport) {
            const rateConversion = checkForNull(settlementCurrencyRef?.current) * checkForNull(totalCost)
            const rateLocalConversion = checkForNull(plantCurrencyRef?.current) * checkForNull(totalCost)

            setValue('Rate', checkForDecimalAndNull(totalCost, initialConfiguration.NoOfDecimalForPrice))
            setValue('RateLocalConversion', checkForDecimalAndNull(rateLocalConversion, initialConfiguration.NoOfDecimalForPrice))
            setValue('RateConversion', checkForDecimalAndNull(rateConversion, initialConfiguration.NoOfDecimalForPrice))
        } else {
            const rateConversion = checkForNull(state.plantCurrency) * checkForNull(totalCost)
            setValue('RateLocalConversion', checkForDecimalAndNull(totalCost, initialConfiguration.NoOfDecimalForPrice))
            setValue('RateConversion', checkForDecimalAndNull(rateConversion, initialConfiguration.NoOfDecimalForPrice))
        }
    }

    const setRejectionReworkAndProfitCost = () => {

        let gasCost = checkForNull(Number(getValues('gasCost')))
        let electricityCost = checkForNull(Number(getValues('electricityCost')))
        let manPowerCost = checkForNull(Number(getValues('manPowerCost')))
        let staffCost = checkForNull(Number(getValues('staffCost')))
        let maintenanceCost = checkForNull(Number(getValues('maintenanceCost')))
        let consumablesCost = checkForNull(Number(getValues('consumablesCost')))
        let waterCost = checkForNull(Number(getValues('waterCost')))
        let jigStripping = checkForNull(Number(getValues('jigStripping')))
        let interestCost = checkForNull(Number(getValues('interestCost')))
        let depriciationCost = checkForNull(Number(getValues('depriciationCost')))
        let statuatoryLicense = checkForNull(Number(getValues('statuatoryLicense')))
        let rateOperation = checkForNull(Number(getValues('rateOperation')))
        let rejnReworkPercent = checkForNull(Number(getValues('rejnReworkPercent'))) / 100
        let profitPercent = checkForNull(Number(getValues('profitPercent'))) / 100

        let RateLocalConversion = 0
        if (includeInterestInRejection) {
            RateLocalConversion = gasCost + electricityCost + manPowerCost + staffCost + maintenanceCost + consumablesCost + waterCost + jigStripping + interestCost + depriciationCost + statuatoryLicense + rateOperation

        } else {

            RateLocalConversion = gasCost + electricityCost + manPowerCost + staffCost + maintenanceCost + consumablesCost + waterCost + jigStripping + statuatoryLicense + rateOperation
        }

        let rejectionReworkCost = RateLocalConversion * rejnReworkPercent
        let profitCost = RateLocalConversion * profitPercent
        setDataToSend(prevState => ({ ...prevState, rejectionReworkCostState: rejectionReworkCost, profitCostState: profitCost }))
        setValue('rejoinReworkCost', checkForDecimalAndNull(rejectionReworkCost, initialConfiguration.NoOfDecimalForPrice))
        setValue('profitCost', checkForDecimalAndNull(profitCost, initialConfiguration.NoOfDecimalForPrice))

        //SETTING NET COST NOW
        let profitCostState = checkForNull(profitCost)
        let otherCost = checkForNull(Number(getValues('otherCost')))
        let totalCost = gasCost + electricityCost + manPowerCost + staffCost + maintenanceCost + consumablesCost + waterCost + jigStripping + interestCost + depriciationCost + statuatoryLicense + rateOperation + rejectionReworkCost + profitCostState + otherCost
        setDataToSend(prevState => ({ ...prevState, RateLocalConversion: totalCost }))
        if (state.isImport) {
            const rateConversion = checkForNull(settlementCurrencyRef?.current) * checkForNull(totalCost)
            const rateLocalConversion = checkForNull(plantCurrencyRef?.current) * checkForNull(totalCost)
            setValue('Rate', checkForDecimalAndNull(totalCost, initialConfiguration.NoOfDecimalForPrice))
            setValue('RateLocalConversion', checkForDecimalAndNull(rateLocalConversion, initialConfiguration.NoOfDecimalForPrice))
            setValue('RateConversion', checkForDecimalAndNull(rateConversion, initialConfiguration.NoOfDecimalForPrice))
        } else {
            const rateConversion = checkForNull(plantCurrencyRef?.current) * checkForNull(totalCost)
            setValue('RateLocalConversion', checkForDecimalAndNull(totalCost, initialConfiguration.NoOfDecimalForPrice))
            setValue('RateConversion', checkForDecimalAndNull(rateConversion, initialConfiguration.NoOfDecimalForPrice))
        }
    }


    const setRejectionReworkAndProfitCostPlating = (obj) => {

        let wireCost = checkForNull(obj.wireCost)
        let gasCost = checkForNull(obj.gasCost)
        let electricityCost = checkForNull(obj.electricityCost)
        let manPowerCost = checkForNull(Number(getValues('manPowerCost')))
        let staffCost = checkForNull(Number(getValues('staffCost')))
        let waterCost = checkForNull(Number(getValues('waterCost'))) //used for Additional chemical cost
        let jigStripping = checkForNull(Number(getValues('jigStripping'))) // used for CEPT CHARGE
        let statuatoryLicense = checkForNull(Number(getValues('statuatoryLicense'))) //used for Fixed Cost
        let rejnReworkPercent = checkForNull(Number(getValues('rejnReworkPercent'))) / 100
        let profitPercent = checkForNull(Number(getValues('profitPercent'))) / 100

        let RateLocalConversion = (wireCost - gasCost + electricityCost + manPowerCost + staffCost + waterCost + jigStripping + statuatoryLicense)
        let rejectionReworkCost = RateLocalConversion * rejnReworkPercent
        let profitCost = RateLocalConversion * profitPercent

        setDataToSend(prevState => ({ ...prevState, rejectionReworkCostState: rejectionReworkCost, profitCostState: profitCost }))
        setValue('rejoinReworkCost', checkForDecimalAndNull(rejectionReworkCost, initialConfiguration.NoOfDecimalForPrice))
        setValue('profitCost', checkForDecimalAndNull(profitCost, initialConfiguration.NoOfDecimalForPrice))

        setNetCostPlating(obj)
    }

    const setNetCostPlating = (obj) => {

        let wireCost = checkForNull(obj.wireCost)
        let gasCost = checkForNull(obj.gasCost)
        let electricityCost = checkForNull(obj.electricityCost)
        let manPowerCost = checkForNull(Number(getValues('manPowerCost')))
        let staffCost = checkForNull(Number(getValues('staffCost')))
        let waterCost = checkForNull(Number(getValues('waterCost'))) //used for Additional chemical cost
        let jigStripping = checkForNull(Number(getValues('jigStripping'))) // used for CEPT Charge
        let statuatoryLicense = checkForNull(Number(getValues('statuatoryLicense'))) //used for Fixed Cost
        let rejectionReworkCost = checkForNull(Number(getValues('rejoinReworkCost')))
        let profitCostState = checkForNull(Number(getValues('profitCost')))

        let Rate = (wireCost - gasCost + electricityCost + manPowerCost + staffCost + waterCost + jigStripping + statuatoryLicense + rejectionReworkCost + profitCostState)
        setDataToSend(prevState => ({ ...prevState, RateLocalConversion: Rate }))
        if (state.isImport) {
            const rateConversion = checkForNull(settlementCurrencyRef?.current) * checkForNull(Rate)
            const rateLocalConversion = checkForNull(plantCurrencyRef?.current) * checkForNull(Rate)
            setValue('Rate', checkForDecimalAndNull(Rate, initialConfiguration.NoOfDecimalForPrice))
            setValue('RateLocalConversion', checkForDecimalAndNull(rateLocalConversion, initialConfiguration.NoOfDecimalForPrice))
            setValue('RateConversion', checkForDecimalAndNull(rateConversion, initialConfiguration.NoOfDecimalForPrice))
        } else {
            const rateConversion = checkForNull(plantCurrencyRef?.current) * checkForNull(Rate)
            setValue('RateLocalConversion', checkForDecimalAndNull(Rate, initialConfiguration.NoOfDecimalForPrice))
            setValue('RateConversion', checkForDecimalAndNull(rateConversion, initialConfiguration.NoOfDecimalForPrice))
        }

    }

    useEffect(() => {

        if (String(props?.addMoreDetailObj?.operationType?.label) === "Welding") {
            setIsWelding(true)
        } else if (String(props?.addMoreDetailObj?.operationType?.label) === "Ni Cr Plating") {
            setIsPlating(true)
        } else {
            setIsOther(true)
        }

        setValue('operationType', addMoreDetailObj?.operationType)
        setValue('operationCode', addMoreDetailObj?.operationCode)

        let technologyTemp = []
        addMoreDetailObj && addMoreDetailObj.technology && addMoreDetailObj.technology.map((item, index) => {
            let obj = {}
            obj.label = item.Text
            obj.value = item.Value
            technologyTemp.push(obj)
        })
        let plantArray
        if (addMoreDetailObj && addMoreDetailObj?.plants?.length > 0) {
            plantArray = addMoreDetailObj?.plants?.map(plant => ({ label: plant?.PlantName, value: plant?.PlantId }));
        }

        setValue("OperationBasicRate", addMoreDetailObj?.weldingRate)
        setValue("OperationConsumption", addMoreDetailObj?.consumption)
        setValue("LabourRatePerUOM", addMoreDetailObj?.labourRatePerUOM)
        setValue("Rate", addMoreDetailObj?.rate)
        setValue('technology', technologyTemp)
        setValue('operationName', addMoreDetailObj.operationName)
        setValue('description', addMoreDetailObj.description)
        setValue('plant', plantArray ?? [])
        setValue('vendorName', { label: addMoreDetailObj?.vendor?.label, value: addMoreDetailObj?.vendor?.value })
        setVendor({ label: addMoreDetailObj?.vendor?.label, value: addMoreDetailObj?.vendor?.value })
        setValue('uom', { label: addMoreDetailObj.UOM.label, value: addMoreDetailObj.UOM.value })
        setUom({ label: addMoreDetailObj.UOM.label, value: addMoreDetailObj.UOM.value })
        setPlant(plantArray ?? [])
        setValue('customer', { label: addMoreDetailObj.customer.label, value: addMoreDetailObj.customer.value })
        setClient({ label: addMoreDetailObj.customer.label, value: addMoreDetailObj.customer.value })
        setValue('plantCurrency', addMoreDetailObj?.plantCurrency)
        setState(prevState => ({ ...prevState, isImport: addMoreDetailObj?.isImport, currency: addMoreDetailObj?.currency, plantCurrencyID: addMoreDetailObj?.plantCurrencyID, ExchangeSource: addMoreDetailObj?.ExchangeSource, plantExchangeRateId: addMoreDetailObj?.plantExchangeRateId, settlementExchangeRateId: addMoreDetailObj?.settlementExchangeRateId, plantCurrency: addMoreDetailObj?.plantCurrencyState, settlementCurrency: addMoreDetailObj?.settlementCurrency }))
        setValue('ExchangeSource', { label: addMoreDetailObj?.ExchangeSource?.label, value: addMoreDetailObj?.ExchangeSource?.value })
        setValue('currency', { label: addMoreDetailObj?.currency?.label, value: addMoreDetailObj?.currency?.value })
        fromCurrencyRef.current = props?.addMoreDetailObj.currency
        plantCurrencyRef.current = addMoreDetailObj?.plantCurrencyState
        settlementCurrencyRef.current = addMoreDetailObj?.settlementCurrency
        localCurrencyLabel.current = addMoreDetailObj?.plantCurrency
        if (isEditFlag) {
            setValue('effectiveDate', DayTime(addMoreDetailObj.effectiveDate).$d)
            if (String(props?.addMoreDetailObj?.operationType?.label) === "Welding") {
                setDataToSend(prevState => ({ ...prevState, netCostWelding: detailObject && detailObject.Rate ? detailObject.Rate : '', wireCostWelding: detailObject && detailObject.MaterialWireCost ? detailObject.MaterialWireCost : '', gasCostWelding: detailObject && detailObject.MaterialGasCost ? detailObject.MaterialGasCost : '', electricityCostWelding: detailObject && detailObject.PowerElectricityCost ? detailObject.PowerElectricityCost : '', labourCostWelding: detailObject && detailObject.LabourManPowerCost ? detailObject.LabourManPowerCost : '' }))
                setFiles(detailObject?.Attachements)
                setValue('machineConsumableCost', detailObject && detailObject.MachineConsumptionCost ? checkForDecimalAndNull(detailObject.MachineConsumptionCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadConsumableWelderCost', detailObject && detailObject.ConsumableWelderCRMHead && { label: detailObject.ConsumableWelderCRMHead, value: 1 })
                setValue('welderCost', detailObject && detailObject.WelderCost ? checkForDecimalAndNull(detailObject.WelderCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadInterestDepriciationWelding', detailObject && detailObject.InterestAndDepriciationCRMHead && { label: detailObject.InterestAndDepriciationCRMHead, value: 1 })
                setValue('interestDepriciationCost', detailObject && detailObject.InterestAndDepriciationCost ? checkForDecimalAndNull(detailObject.InterestAndDepriciationCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadAdditionalOtherCostWelding', detailObject && detailObject.OtherCostCRMHead && { label: detailObject.OtherCostCRMHead, value: 1 })
                setValue('otherCostDescriptionWelding', detailObject && detailObject.OtherCostDescription ? detailObject.OtherCostDescription : '',)
                setValue('otherCostWelding', detailObject && detailObject.OtherCost ? checkForDecimalAndNull(detailObject.OtherCost, initialConfiguration.NoOfDecimalForPrice) : '',)

            } else {
                setDataToSend(prevState => ({ ...prevState, RateLocalConversion: detailObject && detailObject.Rate ? detailObject.Rate : '', rejectionReworkCostState: detailObject && detailObject.RejectionAndReworkCost ? detailObject.RejectionAndReworkCost : '', profitCostState: detailObject && detailObject.ProfitCRMCost ? detailObject.ProfitCRMCost : '' }))
                setIncludeInterestInRejection(detailObject?.IsIncludeInterestRateAndDepriciationInRejectionAndProfit)
                setValue('crmHeadMaterialCost', detailObject && detailObject.MaterialGasCRMHead && { label: detailObject.MaterialGasCRMHead, value: 1 })
                setValue('gasCost', detailObject && detailObject.MaterialGasCost ? checkForDecimalAndNull(detailObject.MaterialGasCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadPower', detailObject && detailObject.PowerCRMHead && { label: detailObject.PowerCRMHead, value: 1 })
                setValue('electricityCost', detailObject && detailObject.PowerElectricityCost ? checkForDecimalAndNull(detailObject.PowerElectricityCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                //////////
                setValue('crmHeadLabour', detailObject && detailObject.LabourCRMHead && { label: detailObject.LabourCRMHead, value: 1 })
                setValue('manPowerCost', detailObject && detailObject.LabourManPowerCost ? checkForDecimalAndNull(detailObject.LabourManPowerCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadLabourStaffCost', detailObject && detailObject.LabourStaffCRMHead && { label: detailObject.LabourStaffCRMHead, value: 1 })
                setValue('staffCost', detailObject && detailObject.LabourStaffCost ? checkForDecimalAndNull(detailObject.LabourStaffCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                //////////
                setValue('crmHeadConsumableMaintenanceCost', detailObject && detailObject.ConsumableMaintenanceCRMHead && { label: detailObject.ConsumableMaintenanceCRMHead, value: 1 })
                setValue('maintenanceCost', detailObject && detailObject.ConsumableMaintenanceCost ? checkForDecimalAndNull(detailObject.ConsumableMaintenanceCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadConsumableCost', detailObject && detailObject.ConsumableCRMHead && { label: detailObject.ConsumableCRMHead, value: 1 })
                setValue('consumablesCost', detailObject && detailObject.ConsumableCost ? checkForDecimalAndNull(detailObject.ConsumableCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadWaterCost', detailObject && detailObject.ConsumableWaterCRMHead && { label: detailObject.ConsumableWaterCRMHead, value: 1 })
                setValue('waterCost', detailObject && detailObject.ConsumableWaterCost ? checkForDecimalAndNull(detailObject.ConsumableWaterCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadJigStripping', detailObject && detailObject.ConsumableJigStrippingCRMHead && { label: detailObject.ConsumableJigStrippingCRMHead, value: 1 })
                setValue('jigStripping', detailObject && detailObject.ConsumableJigStrippingCost ? checkForDecimalAndNull(detailObject.ConsumableJigStrippingCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                ///////////
                setValue('crmHeadInterest', detailObject && detailObject.InterestCRMHead && { label: detailObject.InterestCRMHead, value: 1 })
                setValue('interestCost', detailObject && detailObject.InterestCost ? checkForDecimalAndNull(detailObject.InterestCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadDepriciation', detailObject && detailObject.DepriciationCRMHead && { label: detailObject.DepriciationCRMHead, value: 1 })
                setValue('depriciationCost', detailObject && detailObject.DepriciationCost ? checkForDecimalAndNull(detailObject.DepriciationCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                ///////////
                setValue('crmHeadOtherOperation', detailObject && detailObject.OtherOperationCRMHead && { label: detailObject.OtherOperationCRMHead, value: 1 })
                setValue('OtherOperationName', detailObject && detailObject.OtherOperationName && { label: detailObject.OtherOperationName, value: detailObject.OtherOperationIdRef })
                setValue('rateOperation', detailObject && detailObject.OtherOperationCost ? checkForDecimalAndNull(detailObject.OtherOperationCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                ///////////
                setValue('crmHeadStatuaryLicense', detailObject && detailObject.StatuatoryAndLicenseCRMHead && { label: detailObject.StatuatoryAndLicenseCRMHead, value: 1 })
                setValue('statuatoryLicense', detailObject && detailObject.StatuatoryAndLicenseCost ? checkForDecimalAndNull(detailObject.StatuatoryAndLicenseCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadRejoinRework', detailObject && detailObject.RejectionAndReworkCRMHead && { label: detailObject.RejectionAndReworkCRMHead, value: 1 })
                setValue('rejnReworkPercent', detailObject && detailObject.RejectionAndReworkPercentage ? checkForDecimalAndNull(detailObject.RejectionAndReworkPercentage, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('rejoinReworkCost', detailObject && detailObject.RejectionAndReworkCost ? checkForDecimalAndNull(detailObject.RejectionAndReworkCost, initialConfiguration.NoOfDecimalForPrice) : '')
                setValue('crmHeadProfit', detailObject && detailObject.ProfitCRMHead && { label: detailObject.ProfitCRMHead, value: 1 })
                setValue('profitPercent', detailObject && detailObject.ProfitCRMPercentage ? checkForDecimalAndNull(detailObject.ProfitCRMPercentage, initialConfiguration.NoOfDecimalForPrice) : '')
                setValue('profitCost', detailObject && detailObject.ProfitCRMCost ? checkForDecimalAndNull(detailObject.ProfitCRMCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('crmHeadOtherCost', detailObject && detailObject.OtherCostCRMHead && { label: detailObject.OtherCostCRMHead, value: 1 })
                setValue('otherCost', detailObject && detailObject.OtherCost ? checkForDecimalAndNull(detailObject.OtherCost, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('otherCostDescription', detailObject && detailObject.OtherCostDescription ? detailObject.OtherCostDescription : '',)
            }

            setTimeout(() => {
                if (detailObject?.OperationEntryType === ENTRY_TYPE_IMPORT) {
                    setValue('Rate', detailObject && detailObject?.Rate ? checkForDecimalAndNull(detailObject?.Rate, initialConfiguration.NoOfDecimalForPrice) : '',)
                }
                setValue('RateLocalConversion', detailObject && detailObject.RateLocalConversion ? checkForDecimalAndNull(detailObject.RateLocalConversion, initialConfiguration.NoOfDecimalForPrice) : '',)
                setValue('RateConversion', detailObject && detailObject.RateConversion ? checkForDecimalAndNull(detailObject.RateConversion, initialConfiguration.NoOfDecimalForPrice) : '',)
            }, 600);

        } else {
            setValue('effectiveDate', addMoreDetailObj.effectiveDate)
        }

    }, [])


    useEffect(() => {
        dispatch(getClientSelectList(() => { }))
        dispatch(getUOMSelectList(() => { }))
        dispatch(getOperationPartSelectList(() => { }))

    }, [])
    const finalUserCheckAndMasterLevelCheckFunction = (plantId, isDivision = false) => {
        if (!isViewMode && getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(OPERATIONS_ID) === true) {
            dispatch(getUsersMasterLevelAPI(loggedInUserId(), OPERATIONS_ID, (res) => {
                setTimeout(() => {
                    commonFunction(plantId, isDivision, res?.data?.Data?.MasterLevels)
                }, 500);
            }))
        }
    }
    const commonFunction = (plantId = EMPTY_GUID, isDivision = false, masterLevels = []) => {
        let levelDetailsTemp = []
        levelDetailsTemp = userTechnologyDetailByMasterId(addMoreDetailObj?.costingTypeId, OPERATIONS_ID, masterLevels)
        setState(prevState => ({ ...prevState, levelDetails: levelDetailsTemp }))
        let obj = {
            DepartmentId: userDetails().DepartmentId,
            UserId: loggedInUserId(),
            TechnologyId: OPERATIONS_ID,
            Mode: 'master',
            approvalTypeId: costingTypeIdToApprovalTypeIdFunction(addMoreDetailObj?.costingTypeId),
            plantId: plantId
        }
        if (getConfigurationKey().IsMasterApprovalAppliedConfigure && !isDivision) {
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
    }
    const handleOperationAPI = (formData, isEdit) => {
        const apiFunction = isEdit ? updateOperationAPI : createOperationsAPI;
        const successMessage = isEdit ? MESSAGES.OPERATION_UPDATE_SUCCESS : MESSAGES.OPERATION_ADD_SUCCESS;

        dispatch(apiFunction(formData, (res) => {
            if (res?.data?.Result) {
                Toaster.success(successMessage);
                props?.cancel('submit');
            }
        }));
    };


    const onSubmit = debounce(handleSubmit((values) => {
        let technologyArray = []
        // let plantArray = [{ PlantName: plant.label, PlantId: plant.value, PlantCode: ' ', }]
        let plantArray = Array?.isArray(plant) ? plant?.map(plant => ({ PlantId: plant?.value, PlantName: plant?.label, PlantCode: '' })) :
            plant ? [{ PlantId: plant?.value, PlantName: plant?.label, PlantCode: '' }] : [];
        values && values.technology && values.technology.map((item, index) => {
            let obj = {}
            obj.Technology = item.Label
            obj.TechnologyId = item.value
            technologyArray.push(obj)
        })

        let formData = {
            IsFinancialDataChanged: false,
            IsSendForApproval: false,
            OperationId: addMoreDetailObj?.OperationId,
            CostingTypeId: addMoreDetailObj?.costingTypeId,
            OperationName: values.operationName ? values.operationName : '',
            OperationCode: values.operationCode ? values.operationCode : '',
            Description: values.description ? values.description : '',
            VendorId: addMoreDetailObj.costingTypeId === VBCTypeId ? vendor.value : null,
            UnitOfMeasurementId: uom.value,
            IsSurfaceTreatmentOperation: addMoreDetailObj?.isSurfaceTreatment,
            Rate: isWelding ? dataToSend.netCostWelding : (values.Rate ? values?.Rate : values?.RateLocalConversion),
            RateLocalConversion: values?.RateLocalConversion,
            RateConversion: values?.RateConversion,
            LabourRatePerUOM: initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure ? values?.LabourRatePerUOM : '',
            OperationBasicRate: values?.OperationBasicRate,
            OperationConsumption: values?.OperationConsumption,
            Technology: technologyArray,
            Remark: values.remark ? values.remark : '',
            Plant: plantArray ? plantArray : [],
            Attachements: files,
            LoggedInUserId: loggedInUserId(),
            EffectiveDate: DayTime(values.effectiveDate).format('YYYY/MM/DD HH:mm:ss'),
            VendorPlant: [],
            CustomerId: addMoreDetailObj?.costingTypeId === CBCTypeId ? client.value : null,

            ForType: values?.operationType?.label,
            MaterialGasCRMHead: (isWelding || isPlating) ? values?.crmHeadGasRate?.label : values?.crmHeadMaterialCost?.label,

            MaterialGasRate: values?.gasRate,//welding
            MaterialGasConsumption: values?.consumptionGas,//welding
            MaterialGasCost: (isWelding || isPlating) ? dataToSend?.gasCost : values?.gasCost,
            MaterialWireCRMHead: values?.crmHeadWireRate?.label,//welding
            MaterialWireRate: values?.wireRate,//welding
            MaterialWireConsumption: values?.consumptionWire,//welding
            MaterialWireCost: dataToSend?.wireCost,//welding  

            PowerCRMHead: (isWelding || isPlating) ? values?.crmHeadPowerWelding?.label : values?.crmHeadPower?.label,
            PowerElectricityRate: values?.electricityRate,//welding
            PowerElectricityConsumption: values?.consumptionPower,//welding
            PowerElectricityCost: (isWelding || isPlating) ? dataToSend?.electricityCost : values?.electricityCost,

            LabourCRMHead: isWelding ? values?.crmHeadLabourWelding?.label : values?.crmHeadLabour?.label,
            LabourManPowerRate: values?.labourRate,
            LabourManPowerConsumption: values?.weldingShift,//welding/shift
            LabourManPowerCost: isWelding ? dataToSend?.labourCost : values?.manPowerCost,
            LabourStaffCRMHead: values?.crmHeadLabourStaffCost?.label,
            LabourStaffCost: values?.staffCost,

            ConsumableMaintenanceCRMHead: values?.crmHeadConsumableMaintenanceCost?.label,
            ConsumableMaintenanceCost: values?.maintenanceCost,
            ConsumableCRMHead: values?.crmHeadConsumableCost?.label,
            ConsumableCost: values?.consumablesCost,
            ConsumableWaterCRMHead: values?.crmHeadWaterCost?.label,
            ConsumableWaterCost: values?.waterCost,
            ConsumableJigStrippingCRMHead: values?.crmHeadJigStripping?.label,
            ConsumableJigStrippingCost: values?.jigStripping,
            ConsumableMachineCRMHead: values?.crmHeadConsumableMachineCost?.label,//welding
            MachineConsumptionCost: values?.machineConsumableCost,//welding
            ConsumableWelderCRMHead: values?.crmHeadConsumableWelderCost?.label,//welding
            WelderCost: values?.welderCost,

            InterestCRMHead: values?.crmHeadInterest?.label,
            InterestCost: values?.interestCost,
            DepriciationCRMHead: values?.crmHeadDepriciation?.label,
            DepriciationCost: values?.depriciationCost,

            OtherOperationCRMHead: values?.crmHeadOtherOperation?.label,
            // OtherOperationName: "string",
            OtherOperationCode: values?.OtherOperationName?.label,
            OtherOperationIdRef: values?.OtherOperationName?.value,
            OtherOperationCost: values?.rateOperation,

            StatuatoryAndLicenseCRMHead: values?.crmHeadStatuaryLicense?.label,
            StatuatoryAndLicenseCost: values?.statuatoryLicense,
            RejectionAndReworkCRMHead: values?.crmHeadRejoinRework?.label,
            RejectionAndReworkPercentage: values?.rejnReworkPercent,
            RejectionAndReworkCost: dataToSend?.rejectionReworkCostState,
            ProfitCRMHead: values?.crmHeadProfit?.label,
            ProfitCRMPercentage: values?.profitPercent,
            ProfitCRMCost: dataToSend?.profitCostState,

            OtherCostCRMHead: isWelding ? values?.crmHeadAdditionalOtherCostWelding?.label : values?.crmHeadOtherCost?.label,
            OtherCostDescription: isWelding ? values?.otherCostDescriptionWelding : values?.otherCostDescription,
            OtherCost: isWelding ? values?.otherCostWelding : values?.otherCost,
            IsDetailedEntry: true,
            IsIncludeInterestRateAndDepriciationInRejectionAndProfit: includeInterestInRejection,
            InterestAndDepriciationCRMHead: values?.crmHeadInterestDepriciationWelding?.label,
            InterestAndDepriciationCost: values?.interestDepriciationCost,
            OperationEntryType: state.isImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
            ExchangeRateSourceName: state.ExchangeSource?.label || null,
            LocalCurrencyId: state.isImport ? state?.plantCurrencyID : null,
            LocalCurrency: state.isImport ? localCurrencyLabel.current : null,
            LocalExchangeRateId: state.isImport ? state?.plantExchangeRateId : null,
            LocalCurrencyExchangeRate: state.isImport ? state?.plantCurrency : null,
            ExchangeRate: state.isImport ? state?.settlementCurrency : state?.plantCurrency,
            ExchangeRateId: state.isImport ? state?.settlementExchangeRateId : state?.plantExchangeRateId,
            CurrencyId: state.isImport ? state.currency?.value : state?.plantCurrencyID,
            Currency: state.isImport ? state?.currency?.label : localCurrencyLabel.current,
        }

        let isFinancialDataChange = false;
        if (isEditFlag) {
            isFinancialDataChange = Object.keys(formData)
                .filter(item => item.includes('Cost') || (item.includes('CRMHead') && initialConfiguration?.IsShowCRMHead) || item.includes('Rate')) // Filter keys that include 'Cost', 'CRMHead', or 'Rate'
                .some(item => dataObj[item] && String(dataObj[item]) !== String(formData[item]));



            if (isFinancialDataChange) {
                formData.IsFinancialDataChanged = true;
                if (DayTime(dataObj.EffectiveDate).format('DD/MM/YYYY') === DayTime(values.effectiveDate).format('DD/MM/YYYY')) {
                    Toaster.warning('Please update the effective date');
                    return false;
                }
            }
        }
        if (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !state.isFinalApprovar && !isFinancialDataChange) {
            // this.allFieldsInfoIcon(true)
            formData.IsSendForApproval = true
            setState(prevState => ({
                ...prevState, approveDrawer: true, approvalObj: formData
            }))
        } else {
            formData.IsSendForApproval = false;
            handleOperationAPI(formData, isEditFlag);
        }
    }), 500);


    const cancel = () => {
        props.cancelAddMoreDetails()

    }
    const searchableSelectType = (label) => {

        let temp = [];

        if (label === 'technology') {
            costingSpecifiTechnology && costingSpecifiTechnology.map(item => {
                if (item.Value === '0' || (item.Value === String(LOGISTICS))) return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'ClientList') {
            clientSelectList && clientSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'uom') {
            UOMSelectList && UOMSelectList.map(item => {
                const accept = AcceptableOperationUOM.includes(item.Type)
                if (accept === false) return false
                if (item.Value === '0') return false;
                temp.push({ label: item.Display, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.PlantId === '0') return false;
                temp.push({ label: item.PlantNameCode, value: item.PlantId })
                return null;
            });
            return temp;
        }

        if (label === 'operation') {
            operationSelectList && operationSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            return temp;
        }

        if (label === 'crmHead') {
            temp = CRMHeads
            return temp;
        }
        if (label === 'currency') {
            currencySelectList && currencySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

    }

    const materialCostToggle = () => {

        setIsMaterialCostOpen(!isMaterialCostOpen)
    }

    const powerCostToggle = () => {

        setIsPowerCostOpen(!isPowerCostOpen)
    }

    const labourCostToggle = () => {

        setIsLabourCostOpen(!isLabourCostOpen)
    }

    const consumableCostToggle = () => {

        setIsConsumablesCostOpen(!isConsumablesCostOpen)
    }


    const interestCostToggle = () => {

        setIsInterestCostOpen(!isInterestCostOpen)
    }


    const operationCostToggle = () => {

        setIsOtherOperationCostOpen(!isOtherOperationCostOpen)
    }


    const otherCostToggle = () => {

        setIsOtherCostOpen(!isOtherCostOpen)
    }


    const includeInterestRateinRejection = () => {
        setIncludeInterestInRejection(!includeInterestInRejection)
    }

    const clientHandler = (value) => {
        if (value && value !== '') {
            setClient(value)
        }
    }

    const handlePlant = (value) => {
        if (value && value !== '') {
            setPlant(value)
            dispatch(getPlantUnitAPI(value?.value, (res) => {
                let Data = res?.data?.Data
                localCurrencyLabel.current = Data?.Currency
                setValue('plantCurrency', Data?.Currency)
                setState(prevState => ({ ...prevState, plantCurrencyID: Data?.CurrencyId }))

                if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
                    setState(prevState => ({ ...prevState, hidePlantCurrency: false }))
                } else {
                    setState(prevState => ({ ...prevState, hidePlantCurrency: true }))
                }
                callExchangeRateAPI()
            }))

        }
    }
    const handleExchangeRateSource = (newValue) => {
        setState(prevState => ({ ...prevState, ExchangeSource: newValue }))
        callExchangeRateAPI()
    };
    const handleCurrency = (newValue) => {
        if (newValue && newValue !== '') {
            fromCurrencyRef.current = newValue
            setState(prevState => ({ ...prevState, currency: newValue }))
            callExchangeRateAPI()
        }
    }

    const uomHandler = (value) => {
        if (value && value !== '') {
            setUom(value)
        }
    }

    const handleTechnology = (value) => {
        if (value && value !== '') {
            setTechnology(value)
        }
    }

    const handleVendorChange = (value) => {
        if (value && value !== '') {
            setVendor(value)
        }
    }

    const vendorFilterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendor !== resultInput) {
            let res
            res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
            setVendor(resultInput)
            let vendorDataAPI = res?.data?.SelectList
            if (inputValue) {
                return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
            } else {
                return vendorDataAPI
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let VendorData = reactLocalStorage?.getObject('Data')
                if (inputValue) {
                    return autoCompleteDropdown(inputValue, VendorData, false, [], false)
                } else {
                    return VendorData
                }
            }
        }
    };


    const setDisableFalseFunction = () => {
        const loop = Number(dropzone.current.files.length) - Number(files.length)
        if (Number(loop) === 1 || Number(dropzone.current.files.length) === Number(files.length)) {
            setDisable(false)
            setAttachmentLoader(false)
        }
    }
    const handleChangeStatus = ({ meta, file }, status) => {
        setDisable(true);
        setAttachmentLoader(true);

        if (status === "removed") {
            const removedFileName = file.name;
            const tempArr = files.filter(
                (item) => item.OriginalFileName !== removedFileName
            );
            setFiles(tempArr);
            setIsOpen(!IsOpen)
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            if (!validateFileName(file.name)) {
                this.dropzone.current.files.pop()
                this.setDisableFalseFunction()
                return false;
            }
            dispatch(fileUploadOperation(data, (res) => {
                if (res && res?.status !== 200) {
                    this.dropzone.current.files.pop()
                    this.setDisableFalseFunction()
                    return false
                }
                setDisableFalseFunction()
                if ('response' in res) {
                    status = res && res?.response?.status
                    dropzone.current.files.pop()
                }
                else {
                    let Data = res.data[0]
                    files.push(Data)
                    setFiles(files)
                    setAttachmentLoader(false)
                    setTimeout(() => {
                        setIsOpen(!IsOpen)
                    }, 500);
                }
            }))
        }

        if (status === 'rejected_file_type') {
            Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
        } else if (status === 'error_file_size') {
            setDisableFalseFunction()
            setAttachmentLoader(false)
            dropzone.current.files.pop()
            Toaster.warning("File size greater than 20 mb not allowed")
        } else if (status === 'error_validation'
            || status === 'error_upload_params' || status === 'exception_upload'
            || status === 'aborted' || status === 'error_upload') {
            setDisableFalseFunction()
            setAttachmentLoader(false)
            dropzone.current.files.pop()
            Toaster.warning("Something went wrong")
        }
    }


    const deleteFile = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let tempArr = files.filter((item) => item.FileId !== FileId)
            setFiles(tempArr);
        }
        if (FileId == null) {
            let tempArr = files.filter((item) => item.FileName !== OriginalFileName);
            setFiles(tempArr);
        }
        // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
        if (dropzone?.current !== null) {
            dropzone.current.files.pop()
        }
    }


    const Preview = ({ meta }) => {
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {/* {Math.round(percent)}% */}
            </span>
        )
    }

    const getLabel = (value) => {
        let label;
        switch (value) {
            case 'wireRate':
                label = isWelding ? `Wire Rate (${state.isImport ? state.currency?.label : getValues('plantCurrency')})` : `Ni Rate (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`
                break;
            case 'wireCost':
                label = isWelding ? `Wire Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})` : `Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`
                break;
            case 'gasRate':
                label = isWelding ? `Gas Rate (${state.isImport ? state.currency?.label : getValues('plantCurrency')})` : `Ni Scrap Rate (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`
                break;
            case 'consumablesCost':
                label = other ? `Consumables Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})` : `Office Exp (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`
                break;
            case 'waterCost':
                label = other ? `Water Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})` : `Additional Chemical Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`
                break;
            case 'jigStripping':
                label = other ? `Jig Stripping (${state.isImport ? state.currency?.label : getValues('plantCurrency')})` : `CETP Charge (${state.isImport ? 'Currency' : getValues('plantCurrency') ?? 'Currency'})`
                break;
            case 'statuatoryLicense':
                label = other ? `Statuatory & License (${state.isImport ? state.currency?.label : getValues('plantCurrency')})` : `Fixed Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`
                break;
            default:
                label = ''
        }
        return label
    }

    const getAccordianClassName = (value) => {
        return `accordian-content form-group row mx-0 w-100 ${value ? '' : 'd-none'}`
    }
    const closeApprovalDrawer = (e = '', type) => {
        setState(prevState => ({ ...prevState, approveDrawer: false, setDisable: false, isEditBuffer: true }))
        if (type === 'submit') {
            props?.cancel('submit')
        }
    }
    const handleEffectiveDate = (e) => {
        callExchangeRateAPI()
    }
    const OperationRateTitle = () => {
        return {
            tooltipTextPlantCurrency: `Rate * Plant Currency Rate (${state?.plantCurrency ?? ''})`,
            toolTipTextNetCostBaseCurrency: `Rate * Currency Rate (${state?.settlementCurrency ?? ''})`,
        };
    };
    const getTooltipTextForCurrency = () => {
        const { settlementCurrency, plantCurrency, currency } = state
        const currencyLabel = currency?.label ?? 'Currency';
        const plantCurrencyLabel = getValues('plantCurrency') ?? 'Plant Currency';
        const baseCurrency = reactLocalStorage.getObject("baseCurrency");

        // Check the exchange rates or provide a default placeholder if undefined
        const plantCurrencyRate = plantCurrency ?? '-';
        const settlementCurrencyRate = settlementCurrency ?? '-';

        // Generate tooltip text based on the condition
        return <>
            {!this.state?.hidePlantCurrency
                ? `Exchange Rate: 1 ${currencyLabel} = ${plantCurrencyRate} ${plantCurrency}, `
                : ''}<p>Exchange Rate: 1 {currencyLabel} = {settlementCurrencyRate} {baseCurrency}</p>
        </>;
    };
    return (
        <div className="container-fluid">
            {isLoader && <Loader />}
            <div className="row">
                <div className={`col-md-12`}>
                    <div className="shadow-lgg login-formg additional-opration">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-heading mb-0">
                                    <h2>Add More Operation Details</h2>
                                </div>
                            </div>

                        </div>
                        <form>
                            <Row>
                                <Col md="4" className="switch mt-4 mb15">
                                    <label className="switch-level">
                                        <div className={"left-title"}>Domestic</div>
                                        <Switch
                                            onChange={() => { }}
                                            checked={state.isImport}
                                            id="normal-switch"
                                            disabled={true}
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
                                            onClick={() => { }}
                                            disabled={true}
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
                                            onClick={() => { }}
                                            disabled={true}
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
                                                state.costingTypeId === CBCTypeId ? true : false
                                            }
                                            onClick={() => { }}
                                            disabled={true}
                                        />{" "}
                                        <span>Customer Based</span>
                                    </Label>}
                                </Col>
                            </Row>
                            <div className="">
                                <HeaderTitle
                                    title={'Operation:'}
                                    customClass={'Personal-Details'} />

                                <div className={`row form-group ${props?.RFQUser ? 'rfq-portal-container' : ''}`}>
                                    <div className="input-group col-md-3 input-withouticon" >
                                        <SearchableSelectHookForm
                                            name="operationType"
                                            type="text"
                                            label="Operation Type"
                                            errors={errors.operationType}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                            }}
                                            placeholder={'Select'}
                                            required={true}
                                            disabled={true}
                                        />
                                    </div>
                                    <div className="input-group col-md-3 input-withouticon">
                                        <SearchableSelectHookForm
                                            name="technology"
                                            type="text"
                                            label={technologyLabel}
                                            errors={errors.technology}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                            }}
                                            isMulti={true}
                                            placeholder={'Select'}
                                            options={searchableSelectType('technology')}
                                            required={true}
                                            handleChange={handleTechnology}
                                            disabled={isViewMode || isEditFlag}
                                        />
                                    </div>
                                    <div className="input-group col-md-3">
                                        <TextFieldHookForm
                                            label="Operation Name"
                                            name={"operationName"}
                                            errors={errors.operationName}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            disableErrorOverflow={true}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                                validate: { required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, hashValidation },
                                            }}
                                            handleChange={() => { }}
                                            placeholder={'Enter'}
                                            customClassName={'withBorder'}
                                            disabled={isViewMode}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <TextFieldHookForm
                                            label="Operation Code"
                                            name={"operationCode"}
                                            errors={errors.operationCode}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            disableErrorOverflow={true}
                                            rules={{
                                                required: false,
                                                validate: {
                                                    maxLength12
                                                }
                                            }}
                                            handleChange={() => { }}
                                            placeholder={'Enter'}
                                            customClassName={'withBorder'}
                                            disabled={true}
                                        />
                                    </div>


                                    <div className="input-group col-md-3">
                                        <TextFieldHookForm
                                            label="Description"
                                            name={"description"}
                                            errors={errors.description}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            disableErrorOverflow={true}
                                            mandatory={false}
                                            rules={{
                                                required: false,
                                                validate: {
                                                    acceptAllExceptSingleSpecialCharacter,
                                                    maxLength25,
                                                    checkWhiteSpaces,
                                                }
                                            }}
                                            handleChange={() => { }}
                                            placeholder={'Enter'}
                                            customClassName={'withBorder'}
                                            disabled={isViewMode}
                                        />
                                    </div>


                                    <div className="input-group col-md-3 input-withouticon" >
                                        <SearchableSelectHookForm
                                            name="plant"
                                            type="text"
                                            label="Plant (Code)"
                                            errors={errors.plant}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                            }}
                                            placeholder={'Select'}
                                            options={searchableSelectType('plant')}
                                            validate={(plant == null || plant.length === 0) ? [required] : []}
                                            required={true}
                                            handleChange={handlePlant}
                                            valueDescription={plant}
                                            disabled={isViewMode || isEditFlag}
                                        />
                                    </div>
                                    {getConfigurationKey().IsSourceExchangeRateNameVisible && <Col className="col-md-15">
                                        <SearchableSelectHookForm
                                            name="ExchangeSource"
                                            label="Exchange Rate Source"
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{ required: false }}
                                            placeholder={'Select'}
                                            options={searchableSelectType("ExchangeSource")}
                                            handleChange={handleExchangeRateSource}
                                            disabled={(isViewMode || isEditFlag) ? true : false}
                                            errors={errors.ExchangeSource}
                                        />
                                    </Col>}
                                    <Col className="col-md-15">
                                        {getValues('plantCurrency') && !state.hidePlantCurrency && !state.isImport && <TooltipCustom id="plantCurrency" width="350px" tooltipText={`Exchange Rate: 1 ${getValues('plantCurrency')} = ${state?.plantCurrency ?? '-'} ${reactLocalStorage.getObject("baseCurrency")}`} />}
                                        <TextFieldHookForm
                                            name="plantCurrency"
                                            label="Plant Currency"
                                            placeholder={'-'}
                                            defaultValue={''}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{
                                                required: false,
                                            }}
                                            mandatory={false}
                                            disabled={true}
                                            className=" "
                                            customClassName=" withBorder"
                                            handleChange={() => { }}
                                            errors={errors.plantCurrency}
                                        />
                                    </Col>

                                    {addMoreDetailObj.costingTypeId === VBCTypeId && <div className="input-group col-md-3 input-withouticon" >
                                        <AsyncSearchableSelectHookForm
                                            label={`${vendorLabel} (Code)`}
                                            name={"vendorName"}
                                            placeholder={"Select"}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            isMulti={false}
                                            defaultValue={vendor?.length !== 0 ? vendor : ""}
                                            asyncOptions={vendorFilterList}
                                            mandatory={false}
                                            handleChange={handleVendorChange}
                                            errors={errors.vendorName}
                                            disabled={(isViewMode || isEditFlag) ? true : false}
                                        />
                                    </div>}

                                    {addMoreDetailObj.costingTypeId === CBCTypeId && <div className="input-group col-md-3 input-withouticon" >
                                        <SearchableSelectHookForm
                                            name="customer"
                                            type="text"
                                            label="Customer (Code)"
                                            errors={errors.customer}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                            }}
                                            placeholder={'Select'}
                                            options={searchableSelectType('ClientList')}
                                            validate={(client == null || client.length === 0) ? [required] : []}
                                            required={true}
                                            handleChange={clientHandler}
                                            valueDescription={client}
                                            disabled={(isViewMode || isEditFlag) ? true : false}
                                        />
                                    </div>}


                                    <div className="input-group col-md-3 input-withouticon" >
                                        <SearchableSelectHookForm
                                            name="uom"
                                            type="text"
                                            label="UOM"
                                            errors={errors.uom}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                            }}
                                            placeholder={'Select'}
                                            options={searchableSelectType('uom')}
                                            validate={(uom == null || uom.length === 0) ? [required] : []}
                                            required={true}
                                            handleChange={uomHandler}
                                            disabled={isViewMode}
                                            valueDescription={uom}
                                        />
                                    </div>
                                    {state.isImport && <Col className="col-md-15">
                                        <TooltipCustom id="currency" tooltipText={getTooltipTextForCurrency()} />
                                        <SearchableSelectHookForm
                                            name="currency"
                                            label="Currency"
                                            errors={errors.currency}
                                            id="currency"
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                            }}
                                            placeholder={'Select'}
                                            options={searchableSelectType("currency")}
                                            handleChange={handleCurrency}
                                            disabled={isEditFlag || isViewMode}
                                        />
                                    </Col>}
                                    <div className="col-md-3 mb-5">
                                        <div className="inputbox date-section">
                                            <DatePickerHookForm
                                                name={`effectiveDate`}
                                                label={'Effective Date'}
                                                handleChange={(date) => {
                                                    handleEffectiveDate(date);
                                                }}
                                                rules={{ required: false }}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                showMonthDropdown
                                                showYearDropdown
                                                dateFormat="DD/MM/YYYY"
                                                dropdownMode="select"
                                                placeholder="Select date"
                                                customClassName="withBorder"
                                                className="withBorder"
                                                autoComplete={"off"}
                                                maxDate={getEffectiveDateMaxDate()}
                                                minDate={getEffectiveDateMinDate()}
                                                disabledKeyboardNavigation
                                                onChangeRaw={(e) => e.preventDefault()}
                                                disabled={isViewMode}
                                                mandatory={true}
                                                errors={errors && errors.effectiveDate}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/*  MATERIAL COST VALUE */}
                            <Row className="mb-3 accordian-container">
                                <Col md="6">
                                    <HeaderTitle
                                        title={'Material Cost:'}
                                        customClass={'Personal-Details'} />
                                </Col>
                                <Col md="6">
                                    <div className={'right-details text-right'}>
                                        <button className="btn btn-small-primary-circle ml-1" onClick={materialCostToggle} type="button">{isMaterialCostOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                                    </div>
                                </Col>
                                {
                                    <div className={getAccordianClassName(isMaterialCostOpen)}>

                                        {other &&
                                            <><Col md="3" className="mb-3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadMaterialCost"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadMaterialCost}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />

                                            </Col>
                                                <Col md="3">

                                                    <NumberFieldHookForm
                                                        label={`Gas Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                        name={'gasCost'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            pattern: {
                                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                                message: 'Maximum length for integer is 4 and for decimal is 7',
                                                            },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.gasCost}
                                                        disabled={isViewMode ? true : false}
                                                    />

                                                </Col>
                                            </>}

                                        {(isWelding || isPlating) && <>
                                            <Col md="3" className="mb-3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadWireRate"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadWireRate}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />

                                            </Col>
                                            <Col md="3">
                                                <NumberFieldHookForm
                                                    label={getLabel('wireRate')}
                                                    name={'wireRate'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.wireRate}
                                                    disabled={isViewMode}
                                                />

                                            </Col>

                                            <Col md="3">
                                                <NumberFieldHookForm
                                                    label={`Consumption`}
                                                    name={'consumptionWire'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.consumptionWire}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>


                                            <Col md="3">
                                                <TooltipCustom
                                                    id={"wireCostTooltip"}
                                                    disabledIcon={true}
                                                    width={"350px"}
                                                    tooltipText={`${getLabel('wireCost')} = ${getLabel('wireRate')} * Consumption`}
                                                />
                                                <NumberFieldHookForm
                                                    label={getLabel('wireCost')}
                                                    name={'wireCost'}
                                                    id={"wireCostTooltip"}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.wireCost}
                                                    disabled={true}
                                                />

                                            </Col>


                                            <Col md="3" className="mb-3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadGasRate"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadGasRate}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />
                                            </Col>
                                            <Col md="3" className="mb-3">

                                                <NumberFieldHookForm
                                                    label={getLabel('gasRate')}
                                                    name={'gasRate'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.gasRate}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>


                                            <Col md="3" className="mb-3">
                                                <NumberFieldHookForm
                                                    label={`Consumption`}
                                                    name={'consumptionGas'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.consumptionGas}
                                                    disabled={isViewMode ? true : false}
                                                />

                                            </Col>

                                            <Col md="3">
                                                <TooltipCustom id={"gasCostWelding"} width={"350px"} disabledIcon={true} tooltipText={`Cost = ${getLabel('gasRate')} * Consumption`} />

                                                <NumberFieldHookForm
                                                    label={`Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    id={"gasCostWelding"}
                                                    name={'gasCostWelding'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.gasCostWelding}
                                                    disabled={true}
                                                />
                                            </Col>
                                        </>
                                        }
                                    </div>
                                }
                            </Row>



                            {/*  POWER VALUE */}
                            <Row className="mb-3 accordian-container">
                                <Col md="6">
                                    <HeaderTitle
                                        title={'Power:'}
                                        customClass={'Personal-Details'} />
                                </Col>
                                <Col md="6">
                                    <div className={'right-details text-right'}>
                                        <button className="btn btn-small-primary-circle ml-1" onClick={powerCostToggle} type="button">{isPowerCostOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                                    </div>
                                </Col>
                                {
                                    <div className={getAccordianClassName(isPowerCostOpen)}>

                                        {other && <><Col md="3">
                                            <SearchableSelectHookForm
                                                name="crmHeadPower"
                                                type="text"
                                                label="CRM Head"
                                                errors={errors.crmHeadPower}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                }}
                                                placeholder={'Select'}
                                                options={searchableSelectType('crmHead')}
                                                required={false}
                                                handleChange={() => { }}
                                                disabled={isViewMode}
                                            />

                                        </Col>
                                            <Col md="3">
                                                <NumberFieldHookForm
                                                    label={`Electricity Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'electricityCost'}
                                                    id={"electricityCost"}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.electricityCost}
                                                    disabled={isViewMode ? true : false}
                                                />

                                            </Col></>}

                                        {(isWelding || isPlating) && <>

                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadPowerWelding"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadPowerWelding}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />

                                            </Col>
                                            <Col md="3">

                                                <NumberFieldHookForm
                                                    label={`Electricity Rate (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'electricityRate'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.electricityRate}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>


                                            <Col md="3">
                                                <NumberFieldHookForm
                                                    label={`Consumption`}
                                                    name={'consumptionPower'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.consumptionPower}
                                                    disabled={isViewMode ? true : false}
                                                />

                                            </Col>

                                            <Col md="3">
                                                <TooltipCustom id={"electricityCostWelding"} width={"350px"} disabledIcon={true} tooltipText={`Electricity Cost = Electricity Rate * Consumption`} />
                                                <NumberFieldHookForm
                                                    label={`Electricity Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'electricityCostWelding'}
                                                    Controller={Controller}
                                                    id={"electricityCostWelding"}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.electricityCostWelding}
                                                    disabled={true}
                                                />
                                            </Col>
                                        </>}
                                    </div>
                                }
                            </Row>



                            {/*  LABOUR VALUE */}
                            <Row className="mb-3 accordian-container">
                                <Col md="6">
                                    <HeaderTitle
                                        title={'Labour:'}
                                        customClass={'Personal-Details'} />
                                </Col>
                                <Col md="6">
                                    <div className={'right-details text-right'}>
                                        <button className="btn btn-small-primary-circle ml-1" onClick={labourCostToggle} type="button">{isLabourCostOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                                    </div>
                                </Col>
                                {
                                    <div className={getAccordianClassName(isLabourCostOpen)}>

                                        {(other || isPlating) && <>
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadLabour"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadLabour}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />

                                            </Col>
                                            <Col md="3">

                                                <NumberFieldHookForm
                                                    label={`ManPower Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'manPowerCost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.manPowerCost}
                                                    disabled={isViewMode ? true : false}
                                                />

                                            </Col>


                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadLabourStaffCost"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadLabourStaffCost}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />

                                            </Col>
                                            <Col md="3">

                                                <NumberFieldHookForm
                                                    label={`Staff Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'staffCost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.staffCost}
                                                    disabled={isViewMode ? true : false}
                                                />

                                            </Col></>}

                                        {isWelding &&
                                            <>
                                                <Col md="3">
                                                    <SearchableSelectHookForm
                                                        name="crmHeadLabourWelding"
                                                        type="text"
                                                        label="CRM Head"
                                                        errors={errors.crmHeadLabourWelding}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        placeholder={'Select'}
                                                        options={searchableSelectType('crmHead')}
                                                        required={false}
                                                        handleChange={() => { }}
                                                        disabled={isViewMode}
                                                    />

                                                </Col>
                                                <Col md="3">

                                                    <NumberFieldHookForm
                                                        label={`Labour Rate (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                        name={'labourRate'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            pattern: {
                                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                                message: 'Maximum length for integer is 4 and for decimal is 7',
                                                            },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.labourRate}
                                                        disabled={isViewMode ? true : false}
                                                    />

                                                </Col>

                                                <Col md="3">
                                                    <NumberFieldHookForm
                                                        label={`Welding/Shift`}
                                                        name={'weldingShift'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            pattern: {
                                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                                message: 'Maximum length for integer is 4 and for decimal is 7',
                                                            },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.weldingShift}
                                                        disabled={isViewMode ? true : false}
                                                    />

                                                </Col>

                                                <Col md="3">
                                                    <TooltipCustom id={"labourCost"} width={"350px"} disabledIcon={true} tooltipText={`Labour Cost = Labour Rate / Welding/Shift`} />
                                                    <NumberFieldHookForm
                                                        label={`Labour Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                        name={'labourCost'}
                                                        id={"labourCost"}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            pattern: {
                                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                                message: 'Maximum length for integer is 4 and for decimal is 7',
                                                            },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.labourCost}
                                                        disabled={true}
                                                    />
                                                </Col>

                                            </>
                                        }

                                    </div>
                                }
                            </Row>


                            {/*  CONSUMABLES VALUE */}
                            <Row className="mb-3 accordian-container">
                                <Col md="6">
                                    <HeaderTitle
                                        title={'Consumables:'}
                                        customClass={'Personal-Details'} />
                                </Col>
                                <Col md="6">
                                    <div className={'right-details text-right'}>
                                        <button className="btn btn-small-primary-circle ml-1" onClick={consumableCostToggle} type="button">{isConsumablesCostOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                                    </div>
                                </Col>
                                {
                                    <div className={getAccordianClassName(isConsumablesCostOpen)}>

                                        {(other || isPlating) && <><Col md="3" className="mb-4">
                                            <SearchableSelectHookForm
                                                name="crmHeadConsumableMaintenanceCost"
                                                type="text"
                                                label="CRM Head"
                                                errors={errors.crmHeadConsumableMaintenanceCost}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                }}
                                                placeholder={'Select'}
                                                options={searchableSelectType('crmHead')}
                                                required={false}
                                                handleChange={() => { }}
                                                disabled={isViewMode}
                                            />

                                        </Col>
                                            <Col md="3">
                                                <NumberFieldHookForm
                                                    label={`Maintenance Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'maintenanceCost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.maintenanceCost}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>

                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadConsumableCost"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadConsumableCost}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />

                                            </Col>
                                            <Col md="3">

                                                <NumberFieldHookForm
                                                    label={getLabel('consumablesCost')}
                                                    name={'consumablesCost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.consumablesCost}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>


                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadWaterCost"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadWaterCost}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />

                                            </Col>
                                            <Col md="3">
                                                <NumberFieldHookForm
                                                    label={getLabel('waterCost')}
                                                    name={'waterCost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.waterCost}
                                                    disabled={isViewMode ? true : false}
                                                />

                                            </Col>

                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadJigStripping"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadJigStripping}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />
                                            </Col>
                                            <Col md="3">

                                                <NumberFieldHookForm
                                                    label={getLabel(`jigStripping`)}
                                                    name={'jigStripping'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.jigStripping}
                                                    disabled={isViewMode ? true : false}
                                                />

                                            </Col></>}


                                        {isWelding && <>
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadConsumableMachineCost"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadConsumableMachineCost}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />

                                            </Col>
                                            <Col md="3">

                                                <NumberFieldHookForm
                                                    label={`Machine Consumable Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'machineConsumableCost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.machineConsumableCost}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>


                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadConsumableWelderCost"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadConsumableWelderCost}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />

                                            </Col>

                                            <Col md="3">
                                                <NumberFieldHookForm
                                                    label={`Welder Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'welderCost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.welderCost}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>

                                        </>
                                        }

                                    </div>
                                }
                            </Row>



                            {/*  INTEREST AND DEPRICIATION VALUE */}
                            {!isPlating && <Row className="mb-3 accordian-container">
                                <Col md="6">
                                    <HeaderTitle
                                        title={'Interest and Depreciation:'}
                                        customClass={'Personal-Details'} />
                                </Col>
                                <Col md="6">
                                    <div className={'right-details text-right'}>
                                        <button className="btn btn-small-primary-circle ml-1" onClick={interestCostToggle} type="button">{isInterestCostOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                                    </div>
                                </Col>
                                {true &&
                                    <div className={getAccordianClassName(isInterestCostOpen)}>

                                        {other && <> <Col md="3">
                                            <SearchableSelectHookForm
                                                name="crmHeadInterest"
                                                type="text"
                                                label="CRM Head"
                                                errors={errors.crmHeadInterest}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                }}
                                                placeholder={'Select'}
                                                options={searchableSelectType('crmHead')}
                                                required={false}
                                                handleChange={() => { }}
                                                disabled={isViewMode}
                                            />

                                        </Col>
                                            <Col md="3">

                                                <NumberFieldHookForm
                                                    label={`Interest  Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'interestCost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.interestCost}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>


                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadDepriciation"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadDepriciation}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />

                                            </Col>
                                            <Col md="3">
                                                <NumberFieldHookForm
                                                    label={`Depreciation Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'depriciationCost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.depriciationCost}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>


                                            <label
                                                className={`custom-checkbox w-auto ml-4 mt-4 `}
                                                onChange={includeInterestRateinRejection}
                                            >
                                                Include Interest rate & Depreciation in Rejection & Profit
                                                <input
                                                    type="checkbox"
                                                    checked={includeInterestInRejection}
                                                    disabled={isViewMode}
                                                />
                                                <span
                                                    className=" before-box p-0"
                                                    checked={includeInterestInRejection}
                                                    onChange={includeInterestRateinRejection}
                                                />
                                            </label>
                                        </>}

                                        {isWelding && <>
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadInterestDepriciationWelding"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadInterestDepriciationWelding}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />
                                            </Col>


                                            <Col md="3">
                                                <NumberFieldHookForm
                                                    label={`Interest And Depreciation Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'interestDepriciationCost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.interestDepriciationCost}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>
                                        </>
                                        }
                                    </div>
                                }
                            </Row>}



                            {/*  OTHER OPERATION VALUE */}
                            {other && <> <Row className="mb-3 accordian-container">
                                <Col md="6">
                                    <HeaderTitle
                                        title={'Other Operation:'}
                                        customClass={'Personal-Details'} />
                                </Col>
                                <Col md="6">
                                    <div className={'right-details text-right'}>
                                        <button className="btn btn-small-primary-circle ml-1" onClick={operationCostToggle} type="button">{isOtherOperationCostOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                                    </div>
                                </Col>
                                {true &&
                                    <div className={getAccordianClassName(isOtherOperationCostOpen)}>

                                        <Col md="3">
                                            <SearchableSelectHookForm
                                                name="crmHeadOtherOperation"
                                                type="text"
                                                label="CRM Head"
                                                errors={errors.crmHeadOtherOperation}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                }}
                                                placeholder={'Select'}
                                                options={searchableSelectType('crmHead')}
                                                required={false}
                                                handleChange={() => { }}
                                                disabled={isViewMode}
                                            />

                                        </Col>

                                        <Col md="3">
                                            <SearchableSelectHookForm
                                                name="OtherOperationName"
                                                type="text"
                                                label="Operation Name"
                                                errors={errors.OtherOperationName}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                }}
                                                placeholder={'Select'}
                                                options={searchableSelectType('operation')}
                                                required={false}
                                                handleChange={() => { }}
                                                disabled={isViewMode}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <NumberFieldHookForm
                                                label={`Rate (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                name={'rateOperation'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.rateOperation}
                                                disabled={isViewMode ? true : false}
                                            />

                                        </Col>
                                    </div>
                                }
                            </Row></>}



                            {/*  OTHER COST VALUE */}
                            <Row className="mb-3 accordian-container">
                                <Col md="6">
                                    <HeaderTitle
                                        title={'Additional/Other Cost:'}
                                        customClass={'Personal-Details'} />
                                </Col>
                                <Col md="6">
                                    <div className={'right-details text-right'}>
                                        <button className="btn btn-small-primary-circle ml-1" onClick={otherCostToggle} type="button">{isOtherCostOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                                    </div>
                                </Col>
                                {true &&
                                    <div className={getAccordianClassName(isOtherCostOpen)}>

                                        {(other || isPlating) &&
                                            <>
                                                <Col md="3" className="mb-4">
                                                    <SearchableSelectHookForm
                                                        name="crmHeadStatuaryLicense"
                                                        type="text"
                                                        label="CRM Head"
                                                        errors={errors.crmHeadStatuaryLicense}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        placeholder={'Select'}
                                                        options={searchableSelectType('crmHead')}
                                                        required={false}
                                                        handleChange={() => { }}
                                                        disabled={isViewMode}
                                                    />

                                                </Col>
                                                <Col md="3">
                                                    <NumberFieldHookForm
                                                        label={getLabel(`statuatoryLicense`)}
                                                        name={'statuatoryLicense'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            pattern: {
                                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                                message: 'Maximum length for integer is 4 and for decimal is 7',
                                                            },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.statuatoryLicense}
                                                        disabled={isViewMode ? true : false}
                                                    />
                                                </Col>


                                                <Col md="3">
                                                    <SearchableSelectHookForm
                                                        name="crmHeadRejoinRework"
                                                        type="text"
                                                        label="CRM Head"
                                                        errors={errors.crmHeadRejoinRework}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        placeholder={'Select'}
                                                        options={searchableSelectType('crmHead')}
                                                        required={false}
                                                        handleChange={() => { }}
                                                        disabled={isViewMode}
                                                    />

                                                </Col>
                                                <Col md="3">

                                                    <NumberFieldHookForm
                                                        label={`Rejection & Rework %`}
                                                        name={'rejnReworkPercent'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            pattern: {
                                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                                message: 'Maximum length for integer is 4 and for decimal is 7',
                                                            },
                                                            max: {
                                                                value: 100,
                                                                message: 'Percentage should be less than 100'
                                                            },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.rejnReworkPercent}
                                                        disabled={isViewMode ? true : false}
                                                    />

                                                </Col>


                                                <Col md="3">
                                                    <TooltipCustom id={"rejoinReworkCost"} disabledIcon={true} width={"350px"} tooltipText={`Rejection & Rework Cost = Statuatory & License * Rejection & Rework / 100`} />
                                                    <NumberFieldHookForm
                                                        label={`Rejection & Rework Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                        name={'rejoinReworkCost'}
                                                        Controller={Controller}
                                                        id={"rejoinReworkCost"}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            pattern: {
                                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                                message: 'Maximum length for integer is 4 and for decimal is 7',
                                                            },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.rejoinReworkCost}
                                                        disabled={true}
                                                    />

                                                </Col>


                                                <Col md="3">
                                                    <SearchableSelectHookForm
                                                        name="crmHeadProfit"
                                                        type="text"
                                                        label="CRM Head"
                                                        errors={errors.crmHeadProfit}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        placeholder={'Select'}
                                                        options={searchableSelectType('crmHead')}
                                                        required={false}
                                                        handleChange={() => { }}
                                                        disabled={isViewMode}
                                                    />

                                                </Col>
                                                <Col md="3">
                                                    <NumberFieldHookForm
                                                        label={`Profit %`}
                                                        name={'profitPercent'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            pattern: {
                                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                                message: 'Maximum length for integer is 4 and for decimal is 7',
                                                            },
                                                            max: {
                                                                value: 100,
                                                                message: 'Percentage should be less than 100'
                                                            },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.profitPercent}
                                                        disabled={isViewMode ? true : false}
                                                    />
                                                </Col>


                                                <Col md="3">
                                                    <TooltipCustom id={"profitCost"} disabledIcon={true} width={"350px"} tooltipText={`Profit Cost = Statuatory & License * Profit  / 100`} />
                                                    <NumberFieldHookForm
                                                        label={`Profit Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                        id={"profitCost"}
                                                        name={'profitCost'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            pattern: {
                                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                                message: 'Maximum length for integer is 4 and for decimal is 7',
                                                            },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.profitCost}
                                                        disabled={true}
                                                    />
                                                </Col>

                                                {other && <><Col md="3">
                                                    <SearchableSelectHookForm
                                                        name="crmHeadOtherCost"
                                                        type="text"
                                                        label="CRM Head"
                                                        errors={errors.crmHeadOtherCost}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        placeholder={'Select'}
                                                        options={searchableSelectType('crmHead')}
                                                        required={false}
                                                        handleChange={() => { }}
                                                        disabled={isViewMode}
                                                    />

                                                </Col>

                                                    <Col md="3">
                                                        <TextFieldHookForm
                                                            label="Other Cost Description"
                                                            name={"otherCostDescription"}
                                                            errors={errors.otherCostDescription}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            disableErrorOverflow={true}
                                                            mandatory={false}
                                                            rules={{
                                                                required: false,
                                                                validate: {
                                                                    acceptAllExceptSingleSpecialCharacter,
                                                                    maxLength25,
                                                                    checkWhiteSpaces,
                                                                }
                                                            }}
                                                            handleChange={() => { }}
                                                            placeholder={'Enter'}
                                                            customClassName={'withBorder'}
                                                            disabled={isViewMode}
                                                        />
                                                    </Col>

                                                    <Col md="3">
                                                        <NumberFieldHookForm
                                                            label={`Other Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                            name={'otherCost'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={false}
                                                            rules={{
                                                                required: false,
                                                                pattern: {
                                                                    value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                                    message: 'Maximum length for integer is 4 and for decimal is 7',
                                                                },
                                                            }}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                            errors={errors.otherCost}
                                                            disabled={isViewMode ? true : false}
                                                        />
                                                    </Col>

                                                </>}
                                            </>}

                                        {(isWelding || false) && <>
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    name="crmHeadAdditionalOtherCostWelding"
                                                    type="text"
                                                    label="CRM Head"
                                                    errors={errors.crmHeadAdditionalOtherCostWelding}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                    }}
                                                    placeholder={'Select'}
                                                    options={searchableSelectType('crmHead')}
                                                    required={false}
                                                    handleChange={() => { }}
                                                    disabled={isViewMode}
                                                />
                                            </Col>

                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Other Cost Description"
                                                    name={"otherCostDescriptionWelding"}
                                                    errors={errors.otherCostDescriptionWelding}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    disableErrorOverflow={true}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        validate: {
                                                            acceptAllExceptSingleSpecialCharacter,
                                                            maxLength25,
                                                            checkWhiteSpaces,
                                                        }
                                                    }}
                                                    handleChange={() => { }}
                                                    placeholder={'Enter'}
                                                    customClassName={'withBorder'}
                                                    disabled={isViewMode}
                                                />
                                            </Col>

                                            <Col md="3">
                                                <NumberFieldHookForm
                                                    label={`Other Cost (${state.isImport ? state.currency?.label : getValues('plantCurrency')})`}
                                                    name={'otherCostWelding'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        pattern: {
                                                            value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                            message: 'Maximum length for integer is 4 and for decimal is 7',
                                                        },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.otherCostWelding}
                                                    disabled={isViewMode ? true : false}
                                                />
                                            </Col>
                                        </>
                                        }
                                    </div>
                                }
                            </Row>
                            {state.isImport && <Col className="col-md-15">
                                {<TooltipCustom id={"Rate"} width="350px" disabledIcon={true} tooltipText={`Rate = Total Cost of all Section`} />}
                                <NumberFieldHookForm
                                    label={`Rate (${state.currency?.label ?? 'Currency'})`}
                                    name={'Rate'}
                                    id={"Rate"}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.Rate}
                                    disabled={true}
                                />
                            </Col>}



                            <>
                                {!state.isImport && <TooltipCustom id={"RateLocalConversion"} width="350px" disabledIcon={true} tooltipText={`Rate = Total Cost of all Section`} />}
                                {state.isImport && <TooltipCustom disabledIcon={true} width="350px" id={"RateLocalConversion"} tooltipText={state.hidePlantCurrency ? OperationRateTitle()?.toolTipTextNetCostBaseCurrency : OperationRateTitle()?.tooltipTextPlantCurrency} />}
                                <Col className="col-md-15">
                                    <NumberFieldHookForm
                                        label={`Rate (${getValues('plantCurrency') ?? 'Currency'})`}
                                        name={'RateLocalConversion'}
                                        Controller={Controller}
                                        id={"RateLocalConversion"}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.RateLocalConversion}
                                        disabled={true}
                                    />
                                </Col>
                            </>
                            {!state.hidePlantCurrency &&
                                <>
                                    <TooltipCustom disabledIcon={true} id="operation-rate" width="350px" tooltipText={state.isImport ? OperationRateTitle()?.toolTipTextNetCostBaseCurrency : OperationRateTitle()?.tooltipTextPlantCurrency} />
                                    <Col className="col-md-15">
                                        <NumberFieldHookForm
                                            label={`Rate (${reactLocalStorage.getObject("baseCurrency")})`}
                                            name={'RateConversion'}
                                            id="operation-rate"
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.RateConversion}
                                            disabled={true}
                                        />
                                    </Col></>}

                            <Row>
                                <Col md="12">
                                    <div className="left-border">
                                        {'Remarks & Attachments:'}
                                    </div>
                                </Col>
                                <Col md="4">
                                    <TextAreaHookForm
                                        label="Remarks"
                                        name={"remark"}
                                        errors={errors.remark}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        disableErrorOverflow={true}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: {
                                                acceptAllExceptSingleSpecialCharacter,
                                                checkWhiteSpaces,
                                            }
                                        }}
                                        disabled={isViewMode}
                                        handleChange={() => { }}
                                        placeholder={'Enter'}
                                        customClassName={'withBorder'}
                                        rowHeight={"5"}
                                    />
                                </Col>
                                <Col md="4">
                                    <label>Upload Files (upload up to {initialConfiguration.MaxMasterFilesToUpload} files)<AttachmentValidationInfo /></label>
                                    <div className={`alert alert-danger mt-2 ${files.length === initialConfiguration.MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                                        Maximum file upload limit reached.
                                    </div>
                                    <div className={`${files.length >= initialConfiguration.MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                                        <Dropzone
                                            ref={dropzone}
                                            onChangeStatus={handleChangeStatus}
                                            PreviewComponent={Preview}
                                            disabled={isViewMode}
                                            accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                            initialFiles={[]}
                                            maxFiles={initialConfiguration.MaxMasterFilesToUpload}
                                            maxSizeBytes={2000000}
                                            inputContent={(files, extra) => (extra.reject ? 'Image, audio and video files only' : (<div className="text-center">
                                                <i className="text-primary fa fa-cloud-upload"></i>
                                                <span className="d-block">
                                                    Drag and Drop or{" "}
                                                    <span className="text-primary">
                                                        Browse
                                                    </span>
                                                    <br />
                                                    file to upload
                                                </span>
                                            </div>))}
                                            styles={{
                                                dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                                                inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                                            }}
                                            classNames="draper-drop"
                                        />
                                    </div>
                                </Col>
                                <Col md="4" className="p-relative">
                                    <div className={'attachment-wrapper'}>
                                        {attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                                        {
                                            files && files.map(f => {
                                                const withOutTild = f.FileURL.replace('~', '')
                                                const fileURL = `${FILE_URL}${withOutTild}`;
                                                return (
                                                    <div className={'attachment images'}>
                                                        <a href={fileURL} target="_blank" rel="noreferrer">{f.OriginalFileName}</a>


                                                        {!isViewMode && <img
                                                            alt={""}
                                                            className="float-right"
                                                            onClick={() =>
                                                                deleteFile(f.FileId, f.FileName)
                                                            }
                                                            src={imgRedcross}
                                                        ></img>}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </Col>
                            </Row>


                            <div className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                <div className="col-sm-12 text-right bluefooter-butn">

                                    <button
                                        onClick={cancel}
                                        type="button"
                                        value="CANCEL"
                                        className="mr15 cancel-btn">
                                        <div className={"cancel-icon"}></div>
                                        CANCEL
                                    </button>

                                    {!isViewMode && <>
                                        {(!isViewMode && (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !state.isFinalApprovar) && getConfigurationKey().IsMasterApprovalAppliedConfigure) || (getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !state.CostingTypePermission) ?
                                            <Button
                                                id="addRMDomestic_sendForApproval"
                                                type="button"
                                                className="approval-btn mr5"
                                                disabled={isViewMode || state.disableSendForApproval}
                                                onClick={onSubmit}
                                                icon={(!state.disableSendForApproval) ? "send-for-approval" : "save-icon"}
                                                buttonName={(!state.disableSendForApproval) ? "Send For Approval" : isEditFlag ? "Update" : "Save1"}
                                            />
                                            :
                                            <Button
                                                id="addRMDomestic_updateSave"
                                                type="button"
                                                className="mr5"
                                                disabled={isViewMode || state.disableSendForApproval}
                                                onClick={onSubmit}
                                                icon={"save-icon"}
                                                buttonName={isEditFlag ? "Update" : "Save"}
                                            />
                                        }
                                    </>}
                                </div>
                            </div>
                            {
                                state.approveDrawer && (
                                    <MasterSendForApproval
                                        isOpen={state.approveDrawer}
                                        closeDrawer={closeApprovalDrawer}
                                        isEditFlag={false}
                                        masterId={OPERATIONS_ID}
                                        type={'Sender'}
                                        anchor={"right"}
                                        approvalObj={state.approvalObj}
                                        isBulkUpload={false}
                                        levelDetails={state.levelDetails}
                                        // Technology={state.Technology}
                                        handleOperation={handleOperationAPI}
                                        commonFunction={finalUserCheckAndMasterLevelCheckFunction}
                                        isEdit={isEditFlag}
                                        costingTypeId={addMoreDetailObj.costingTypeId}
                                    />
                                )
                            }
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default AddMoreOperation

