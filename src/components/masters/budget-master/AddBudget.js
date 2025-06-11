import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Label, Button, Tooltip } from 'reactstrap'
import { checkForDecimalAndNull, checkForNull, number } from '../../../helper/validation'
import { getFinancialYearSelectList, getPartSelectListWtihRevNo, } from '../actions/Volume'
import { getCurrencySelectList, getExchangeRateSource, getPlantSelectListByType, getVendorNameByVendorSelectList, plantSelectList, setListToggle } from '../../../actions/Common'
import Toaster from '../../common/Toaster'
import { MESSAGES } from '../../../config/message'
import { getConfigurationKey, IsFetchExchangeRateVendorWiseForParts, loggedInUserId, userDetails } from '../../../helper/auth'
import { BOUGHTOUTPARTSPACING, BUDGET_ID, CBCTypeId, EMPTY_GUID, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT, PRODUCT_ID, searchCount, SPACEBAR, VBC_VENDOR_TYPE, VBCTypeId, ZBC, ZBCTypeId } from '../../../config/constants'
import LoaderCustom from '../../common/LoaderCustom'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { EMPTY_DATA } from '../../../config/constants'
import { debounce } from 'lodash'
import AsyncSelect from 'react-select/async';
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage'
import { autoCompleteDropdown, autoCompleteDropdownPart, getCostingTypeIdByCostingPermission } from '../../common/CommonFunctions'
import { useEffect } from 'react'
import { useState } from 'react'
import { AsyncSearchableSelectHookForm, NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form'
import { createBudget, getApprovedPartCostingPrice, getMasterBudget, getPartCostingHead, updateBudget } from '../actions/Budget'
import { checkFinalUser, getExchangeRateByCurrency } from '../../costing/actions/Costing'
import AddConditionCosting from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/AddConditionCosting'
import ConditionCosting from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/ConditionCosting'
import MasterSendForApproval from '../MasterSendForApproval'
import { CheckApprovalApplicableMaster, getExchangeRateParams, userTechnologyDetailByMasterId } from '../../../helper'
import PopupMsgWrapper from '../../common/PopupMsgWrapper'
import WarningMessage from '../../common/WarningMessage'
import { getSelectListPartType } from '../actions/Part'
import NoContentFound from '../../common/NoContentFound'
import TourWrapper from '../../common/Tour/TourWrapper'
import { useTranslation } from 'react-i18next'
import { Steps } from './TourMessages'
import { useLabels } from '../../../helper/core'
import { getPlantUnitAPI } from '../actions/Plant'
import DayTime from '../../common/DayTimeWrapper'
import ReactSwitch from 'react-switch'
import { useRef } from "react";
import { getUsersMasterLevelAPI } from '../../../actions/auth/AuthActions'
import TooltipCustom from '../../common/Tooltip'

const gridOptions = {};
function AddBudget(props) {
    const { register, handleSubmit, formState: { errors }, control, setValue, getValues, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const { t } = useTranslation("BudgetMaster")
    const fromCurrencyRef = useRef(null);

    const [selectedPlants, setSelectedPlants] = useState([]);
    const [vendorName, setVendorName] = useState([]);
    const [part, setPart] = useState([]);
    const [year, setYear] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [isEditFlag, setIsEditFlag] = useState(false);
    const [BudgetId, setBudgetId] = useState('');
    const [DataChanged, setDataChanged] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [setDisable, setSetDisable] = useState(false);
    const [inputLoader, setInputLoader] = useState(false);
    const [showErrorOnFocus, setShowErrorOnFocus] = useState(false);
    const [costingTypeId, setCostingTypeId] = useState(ZBCTypeId);
    const [client, setClient] = useState([]);
    const [conditionAcc, setConditionAcc] = useState(false);
    const [partName, setPartName] = useState('');
    const [IsVendor, setIsVendor] = useState(false);
    const [isLoader, setIsLoader] = useState(true);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [totalSum, setTotalSum] = useState(0);

    const [count, setCount] = useState(0);
    const [vendorFilter, setVendorFilter] = useState([]);
    const [currency, setCurrency] = useState({});

    const [showPopup, setShowPopup] = useState(false);
    const [currencyExchangeRate, setCurrencyExchangeRate] = useState(1);
    const [isConditionCostingOpen, setIsConditionCostingOpen] = useState(false)
    const [conditionTableData, seConditionTableData] = useState([])
    const [totalConditionCost, setTotalConditionCost] = useState(0)
    const [approveDrawer, setApproveDrawer] = useState(false)
    const [approvalObj, setApprovalObj] = useState({})
    const [isFinalApprover, setIsFinalApprover] = useState(false)
    const [levelDetails, setLevelDetails] = useState({})
    const dispatch = useDispatch();
    const plantSelectList = useSelector(state => state.comman.plantSelectList);
    const financialYearSelectList = useSelector(state => state.volume.financialYearSelectList);
    const clientSelectList = useSelector((state) => state.client.clientSelectList)
    const currencySelectList = useSelector((state) => state.comman.currencySelectList)
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const exchangeRateSourceList = useSelector((state) => state.comman.exchangeRateSourceList)
    const [showTooltip, setShowTooltip] = useState(false)
    const [viewTooltip, setViewTooltip] = useState(false)
    const [partType, setPartType] = useState([]);
    const [partTypeList, setPartTypeList] = useState([])
    const [disableSendForApproval, setDisableSendForApproval] = useState(false);
    const [disableCurrency, setDisableCurrency] = useState(true);
    const userMasterLevelAPI = useSelector((state) => state.auth.userMasterLevelAPI)
    const isViewMode = props.data.isViewMode
    const [budgetedEntryType, setBudgetedEntryType] = useState(props?.isImport ? props?.isImport : false)
    const [showWarning, setShowWarning] = useState(false)
    const [plantCurrencyID, setPlantCurrencyID] = useState('')
    const [hidePlantCurrency, setHidePlantCurrency] = useState(false)
    const [settlementCurrency, setSettlementCurrency] = useState(null)
    const [plantExchangeRateId, setPlantExchangeRateId] = useState('')
    const [settlementExchangeRateId, setSettlementExchangeRateId] = useState('')
    const [plantCurrency, setPlantCurrency] = useState(null)
    const [ExchangeSource, setExchangeSource] = useState()
    const [costConverSionInLocalCurrency, setCostConverSionInLocalCurrency] = useState(false)
    const [showPlantWarning, setShowPlantWarning] = useState(false)
    const { vendorLabel } = useLabels()
    const [budgetingId, setBudgetingId] = useState(0)
    // const [isImport, setIsImport] = useState(listToggle.RawMaterial);

    useEffect(() => {
        setCostingTypeId(getCostingTypeIdByCostingPermission())
        dispatch(getPlantSelectListByType(ZBC, "MASTER", '', () => { }))
        dispatch(getCurrencySelectList(() => { }))
        dispatch(getFinancialYearSelectList(() => { }))
        dispatch(getClientSelectList((res) => { }))
        dispatch(getPartCostingHead((res) => {
            setTableData(res.data.SelectList)
        }))

        getDetail()
        commonFunction();
        dispatch(getUsersMasterLevelAPI(loggedInUserId(), BUDGET_ID, null, (res) => { }))
        dispatch(getSelectListPartType((res) => {
            setPartTypeList(res?.data?.SelectList)
        }))
        dispatch(getExchangeRateSource((res) => { }))
    }, [])
    useEffect(() => {
        handleCalculation();
    }, [plantCurrency, settlementCurrency]);
    useEffect(() => {
        if (!isViewMode && !isEditFlag) {
            callExchangeRateAPI()
        }
    }, [currency, year, ExchangeSource, fromCurrencyRef, costConverSionInLocalCurrency, vendorName, client]);

    useEffect(() => {
        setBudgetedEntryType(props?.isImport)
    }, [props?.isImport])

    // ... existing code ...
    useEffect(() => {
        fromCurrencyRef.current = fromCurrencyRef
    }, [fromCurrencyRef]);
    const commonFunction = (plantId = '') => {
        let obj = {
            TechnologyId: BUDGET_ID,
            DepartmentId: userDetails().DepartmentId,
            UserId: loggedInUserId(),
            Mode: 'master',
            approvalTypeId: costingTypeId,
            plantId: plantId,
        }
        if (initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BUDGET_ID) === true) {
            dispatch(checkFinalUser(obj, res => {
                if (res.data?.Result) {
                    setIsFinalApprover(res.data?.Data?.IsFinalApprover)
                    if (res.data?.Data?.IsUserInApprovalFlow === false) {
                        setDisableSendForApproval(true)
                    } else {
                        setDisableSendForApproval(false)
                    }
                }
            }))
        }
    }
    useEffect(() => {
        if (userMasterLevelAPI) {
            let levelDetailsTemp = []
            levelDetailsTemp = userTechnologyDetailByMasterId(costingTypeId, BUDGET_ID, userMasterLevelAPI)
            setLevelDetails(levelDetailsTemp)
        }

    }, [userMasterLevelAPI, costingTypeId])


    /**
     * @method renderListing
     * @description Used show listing 
     */
    const renderListing = (label) => {
        const { filterPlantList } = props
        const temp = []

        if (label === 'plant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId })
                return null
            })
            return temp
        }
        if (label === 'yearList') {
            financialYearSelectList &&
                financialYearSelectList.map((item) => {
                    if (item.Value === '0') return false
                    temp.push({ label: item.Text, value: item.Value })
                    return null
                })
            return temp
        }
        if (label === 'VendorPlant') {
            filterPlantList &&
                filterPlantList.map((item) => {
                    if (item.Value === '0') return false
                    temp.push({ Text: item.Text, Value: item.Value })
                    return null
                })
            return temp
        }
        if (label === 'ClientList') {
            clientSelectList && clientSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'currency') {
            currencySelectList && currencySelectList.map(item => {
                if (item.Value === '0') return false;
                if (item.Text === getValues("plantCurrency")) return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'PartType') {
            partTypeList && partTypeList.map((item) => {
                if (item.Value === '0') return false
                if (item.Value === PRODUCT_ID) return false
                if (!getConfigurationKey()?.IsBoughtOutPartCostingConfigured && item.Text === BOUGHTOUTPARTSPACING) return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'ExchangeSource') {
            exchangeRateSourceList && exchangeRateSourceList.map((item) => {
                if (item.Value === '--Exchange Rate Source Name--') return false

                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }
    /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */
    const onPressVendor = (costingHeadFlag) => {
        setVendorName([])
        setClient([])
        setCostingTypeId(costingHeadFlag)
        setShowPlantWarning(false)
        setShowWarning(false)
        let arr = ['PartType', 'plantCurrency', 'ExchangeSource', 'totalSumCurrency', 'totalSumPlantCurrency', 'totalSum', 'currentPrice', 'currency', 'FinancialYear', 'PartNumber', 'clientName', 'DestinationPlant', 'vendorName', 'Plant', '']
        arr.map(label => setValue(label, null || ''))
        setPart([])
        if (costingHeadFlag === VBCTypeId) {
            setIsVendor(!IsVendor)
        }
        else if (costingHeadFlag === CBCTypeId) {
            // props.getClientSelectList(() => { })
        }

        let obj = {
            TechnologyId: BUDGET_ID,
            DepartmentId: userDetails().DepartmentId,
            UserId: loggedInUserId(),
            Mode: 'master',
            approvalTypeId: costingHeadFlag
        }
        if (initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BUDGET_ID) === true) {
            dispatch(checkFinalUser(obj, res => {
                if (res.data?.Result) {
                    setIsFinalApprover(res.data?.Data?.IsFinalApprover)
                    if (res.data?.Data?.IsUserInApprovalFlow === false) {
                        setDisableSendForApproval(true)
                    } else {
                        setDisableSendForApproval(false)
                    }
                }
            }))
        }
    }

    /**
     * @method handlePlants
     * @description called
     */
    const handlePlants = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setSelectedPlants(newValue)
            dispatch(getPlantUnitAPI(newValue?.value, (res) => {
                let Data = res?.data?.Data
                setValue("plantCurrency", Data?.Currency)
                fromCurrencyRef.current = Data?.Currency
                setPlantCurrencyID(Data?.CurrencyId)
                if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
                    setHidePlantCurrency(false)
                } else {
                    setHidePlantCurrency(true)
                }
            }));
            callExchangeRateAPI()
            commonFunction(newValue.value)
        } else {
            setSelectedPlants([])
            setPlantCurrency(null)
            setPlantCurrencyID('')
            setPlantExchangeRateId('')
            setSettlementExchangeRateId('')
        }
    }

    /**
     * @method handleVendorName
     * @description called
     */
    const handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setVendorName(newValue)
            setDisableCurrency(false)
            setTimeout(() => {
                callExchangeRateAPI()

            }, 100)
        } else {
            setVendorName([])
        }
    }

    /**
     * @method handlePartName
     * @description called
     */
    const handlePartName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setPart(newValue)
        } else {
            setPart([])
        }
    }


    /**
     * @method handleFinancialYear
     * @description called
     */
    const handleFinancialYear = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setYear(newValue)
            setDisableCurrency(false)
            setValue('currency', '')
            setCurrency([])


        } else {
            setYear([])
        }
    }

    /**
  * @method handleClient
  * @description called
  */
    const handleClient = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setClient(newValue)
            setDisableCurrency(false)
            callExchangeRateAPI()
        } else {
            setClient([])
        }
    };
    /**
     * @method handlePartChange
     * @description  USED TO HANDLE PART CHANGE
     */
    const handlePartTypeChange = (newValue) => {
        if (newValue && newValue !== '') {
            setPartType(newValue)
            setValue('PartNumber', '')
            setPart('')
        } else {
            setPartType([])
        }
        setPartName([])
        reactLocalStorage.setObject('PartData', [])
    }

    /**
     * @method buttonFormatter
     * @description Renders buttons
     */
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowIndex = props?.rowIndex
        return (
            <>
                <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue, rowIndex)} />
            </>
        )
    }

    const budgetedQuantity = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <>
                <span>{cell !== undefined && cell !== null && !isNaN(Number(cell)) ? Number(cell) : 0}</span>
            </>
        )
    }

    const actualQuantity = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const value = isNaN(cell) ? 0 : cell

        return (
            <>
                <span>{value ? Number(cell) : 0}</span>
            </>
        )
    }

    const costHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text'>Net Cost <i className={`fa fa-info-circle tooltip_custom_right tooltip-icon ms-4 ml40`} id={"cost-tooltip"}></i> </span>
            </div>
        );
    };

    const validateCellValue = (params) => {
        const cellValue = params.newValue;    
        // Handle empty values
        if (cellValue === undefined || cellValue === null || cellValue === '') {
            params.data[params.colDef.field] = 0;
            return true;
        }
    
        const strValue = cellValue.toString().trim();
    
        if (number(strValue)) {
            Toaster.warning('Invalid value. Only positive numbers are allowed.');
            return false;
        }
    
        if (!/^\d{0,4}(\.\d{0,6})?$/.test(strValue)) {
            Toaster.warning('Maximum length for integer is 4 and for decimal is 6.');
            return false
        }

        params.data[params.colDef.field] = Number(strValue)
        return true
    }


    /**
     * @method beforeSaveCell
     * @description CHECK FOR ENTER NUMBER IN CELL
     */
    const beforeSaveCell = (props) => {

        const cellValue = props
        if (Number.isInteger(Number(cellValue)) && /^\+?(0|[1-9]\d*)$/.test(cellValue) && cellValue.toString().replace(/\s/g, '').length) {
            if (cellValue.length > 8) {
                Toaster.warning("Value should not be more than 8")
                return false
            }
            return true
        } else if (!/^\+?(0|[0-9]\d*)$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive numbers.')
            return false
        }
    }


    const onCellValueChanged = (value) => {
        let temp = []
        tableData && tableData.map((item) => {
            if (item.Text == value.data.Text) {
                item.Sum = Number(checkForNull(value?.data?.January)) + Number(checkForNull(value?.data?.February)) + Number(checkForNull(value?.data?.March)) + Number(checkForNull(value?.data?.April)) + Number(checkForNull(value?.data?.May)) + Number(checkForNull(value?.data?.June)) + Number(checkForNull(value?.data?.July)) + Number(checkForNull(value?.data?.August)) + Number(checkForNull(value?.data?.September)) + Number(checkForNull(value?.data?.October)) + Number(checkForNull(value?.data?.November)) + Number(checkForNull(value?.data?.December))
            }
            temp.push(item)
        })

        let total = 0
        temp.map((item, ind) => {
            total = Number(total) + Number(checkForNull(item.Sum))
        })
        setTotalSum((total + currentPrice))

        if (costConverSionInLocalCurrency) {
            setValue('totalSumCurrency', checkForDecimalAndNull((total + currentPrice), getConfigurationKey().NoOfDecimalForPrice))
            setValue("totalSumPlantCurrency", checkForDecimalAndNull(((total + currentPrice) * plantCurrency), getConfigurationKey().NoOfDecimalForPrice))
            setValue('totalSum', checkForDecimalAndNull((((total + currentPrice) * plantCurrency) * settlementCurrency), getConfigurationKey().NoOfDecimalForPrice))
        } else {
            setValue('totalSumCurrency', checkForDecimalAndNull((total + currentPrice), getConfigurationKey().NoOfDecimalForPrice))
            setValue('totalSum', checkForDecimalAndNull(((total + currentPrice) * plantCurrency), getConfigurationKey().NoOfDecimalForPrice))

        }
        // setValue('totalSumCurrency', checkForDecimalAndNull((total + currentPrice), getConfigurationKey().NoOfDecimalForPrice))
        // if (settlementCurrency !== null || plantCurrency !== null) {
        //     setValue("totalSumPlantCurrency", checkForDecimalAndNull(((total + currentPrice) * settlementCurrency), getConfigurationKey().NoOfDecimalForPrice))
        //     setValue('totalSum', checkForDecimalAndNull(((total + currentPrice) * plantCurrency), getConfigurationKey().NoOfDecimalForPrice))
        // }

    }
    const ImportToggle = () => {
        dispatch(setListToggle({ Budget: !budgetedEntryType }));
        setBudgetedEntryType(!budgetedEntryType)
    }
    /**
     * @method getDetail
     * @description USED TO GET VOLUME DETAIL
     */
    const getDetail = () => {
        const { data } = props
        setIsLoader(true)

        if (data && data.isEditFlag) {
            setIsLoader(true)
            setIsEditFlag(false)
            setBudgetId(data.ID)

            dispatch(getMasterBudget(data.ID, (res) => {

                if (res && res.data && res?.data?.Data) {
                    let Data = res.data.Data
                    setDataChanged(Data)

                    let temp = []
                    Data.BudgetingPartCostingDetails && Data.BudgetingPartCostingDetails.map((item, index) => {
                        let sum = 0
                        let obj = {}
                        obj.Text = item.PartCostingHead
                        obj.Value = item.PartCostingHeadId

                        item.BudgetingDetails.map((element, ind) => {
                            obj[element.Month] = element.Delta
                            sum = sum + element.Delta
                        })
                        obj.Sum = sum

                        temp.push(obj)
                    })
                    setCostConverSionInLocalCurrency(Data?.CurrencyId !== null ? true : false)

                    setIsEditFlag(true)
                    setSelectedPlants({
                        label: `${Data.PlantName}(${Data.PlantCode})`, value: Data?.PlantId
                    })
                    setValue('DestinationPlant', { label: `${Data.PlantName}(${Data.PlantCode})`, value: Data?.PlantId })
                    setValue('Plant', { label: `${Data.PlantName}(${Data.PlantCode})`, value: Data?.PlantId })
                    setCostingTypeId(Data.CostingHeadId)
                    setTotalSum(Data.BudgetedPoPrice)
                    if (Data?.CurrencyId !== null) {
                        setValue("totalSumCurrency", Data?.BudgetedPoPrice)
                    }
                    setValue("totalSumPlantCurrency", Data?.BudgetedPoPriceLocalConversion)
                    setValue('totalSum', Data?.BudgetedPoPriceInCurrency)
                    setYear({ label: Data.FinancialYear, value: 0 })
                    setPart({ label: Data.PartNumber, value: Data.PartId })
                    setClient({ label: `${Data.CustomerName} (${Data.CustomerCode})`, value: Data.CustomerId })
                    setValue('clientName', { label: `${Data.CustomerName} (${Data.CustomerCode})`, value: Data.CustomerId })
                    setVendorName({ label: `${Data.VendorName} (${Data.VendorCode})`, value: Data.VendorId })
                    setValue('currentPrice', Data.NetPoPrice)
                    setValue('FinancialYear', { label: Data.FinancialYear, value: 0 })
                    setValue('currency', { label: Data.Currency, value: Data.CurrencyId })
                    setCurrency({ label: Data?.Currency, value: Data?.CurrencyId })
                    setValue("plantCurrency", Data?.LocalCurrency)
                    setPartType({ label: Data.PartType, value: Data?.PartTypeId })
                    setExchangeSource({ label: Data.ExchangeRateSourceName, valu: Data.ExchangeRateSourceName })
                    setValue("ExchangeSource", { label: Data.ExchangeRateSourceName, valu: Data.ExchangeRateSourceName })
                    setExchangeSource({ label: Data.ExchangeRateSourceName, valu: Data.ExchangeRateSourceName })
                    setCurrentPrice(Data?.NetPoPrice)
                    setPlantCurrencyID(Data?.CurrencyId !== null ? Data?.LocalCurrencyId : Data?.CurrencyId)
                    setCostConverSionInLocalCurrency(Data?.CurrencyId !== null ? true : false)
                    setPlantCurrency(Data?.CurrencyId !== null ? Data?.LocalCurrencyExchangeRate : Data?.ExchangeRate)
                    setPlantExchangeRateId(Data?.CurrencyId !== null ? Data?.LocalExchangeRateId : Data?.ExchangeRateId)
                    setSettlementCurrency(Data?.ExchangeRate)
                    setSettlementExchangeRateId(Data?.ExchangeRateId)
                    // LocalCurrencyExchangeRate: costConverSionInLocalCurrency ? plantCurrency : null,
                    //     LocalExchangeRateId: costConverSionInLocalCurrency ? plantExchangeRateId : null,
                    //         ExchangeRate: costConverSionInLocalCurrency ? settlementCurrency : plantCurrency,
                    //             ExchangeRateId: costConverSionInLocalCurrency ? settlementExchangeRateId : plantExchangeRateId,
                    if (Data?.LocalCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
                        setHidePlantCurrency(false)
                    } else {
                        setHidePlantCurrency(true)
                    }
                    setBudgetingId(Data?.BudgetingId)

                    setTimeout(() => {
                        setTableData(temp)
                        setIsLoader(false)
                    }, 300);
                    commonFunction(Data?.PlantId ?? "");

                }
            }))
        } else {
            setIsLoader(false)
        }
    }

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        gridApi?.sizeColumnsToFit();
        params.api.paginationGoToPage(0);
        setTimeout(() => {
            setShowTooltip(true)
        }, 100);
    };

    /**
     * @method cancel
     * @description used to Reset form
     */
    const cancel = (type) => {
        // THIS IS FOR RESETING THE VALUE OF TABLE TO ZERO
        tableData.map((item) => {
            item.BudgetedQuantity = 0;
            item.ApprovedQuantity = 0
            return null
        })

        reset('AddBudget')
        setSelectedPlants([])
        setVendorName([])
        setTableData([])
        setIsEditFlag(false)

        props.hideForm(type)
    }

    const allInputFieldsName = ['Plant', 'FinancialYear', 'totalSumCurrency', 'currency', 'totalSum', 'clientName', , "totalSumPlantCurrency"]
    const cancelHandler = () => {
        let count = 0;
        allInputFieldsName.forEach((item) => {
            if (getValues(item)) {
                count++
            }
        })
        if (count || vendorName.length !== 0 || part.length !== 0) {
            setShowPopup(true)
        } else {
            cancel('cancel')
        }
    }
    const onPopupConfirm = () => {
        cancel('cancel')
        setShowPopup(false)
    }
    const closePopUp = () => {
        setShowPopup(false)
    }

    const handleCurrencyChange = (newValue) => {
        if (newValue && newValue !== '') {
            setCurrency(newValue)
            setCostConverSionInLocalCurrency(true)
            // if (getValues("plantCurrency") !== newValue?.label) {
            //     setHidePlantCurrency(false)
            // } else {
            //     setHidePlantCurrency(true)
            // }

        } else {
            setCostConverSionInLocalCurrency(false)

        }
    }
    const callExchangeRateAPI = () => {
        const finalYear = year?.label && year?.label?.slice(0, 4);
        let date = (`${finalYear}-04-01`);
        const plantCurrency = getValues('plantCurrency')

        const hasCurrencyAndDate = plantCurrency && date;
        const fromCurrency = getValues("plantCurrency")
        if (hasCurrencyAndDate && finalYear) {
            if (IsFetchExchangeRateVendorWiseForParts() && (costingTypeId !== ZBCTypeId && vendorName?.length === 0 && client?.length === 0)) {
                return;
            }
            const callAPI = (from, to, costingType, vendorValue, clientValue) => {
                return new Promise((resolve) => {
                    dispatch(getExchangeRateByCurrency(
                        from,
                        costingType,
                        date,
                        vendorValue,
                        clientValue,
                        true,
                        to,
                        getValues("ExchangeSource")?.label ?? "",
                        res => {
                            if (Object.keys(res.data.Data).length === 0) {
                                setShowWarning(true)
                            } else {
                                setShowWarning(false)
                            }
                            resolve({
                                rate: res?.data?.Data.CurrencyExchangeRate !== 0 && res?.data?.Data.CurrencyExchangeRate !== null && res?.data?.Data.CurrencyExchangeRate !== undefined ? checkForNull(res?.data?.Data.CurrencyExchangeRate) : 1,
                                exchangeRateId: res?.data?.Data?.ExchangeRateId,
                                showWarning: Object.keys(res.data.Data).length === 0,
                                showPlantWarning: Object.keys(res.data.Data).length === 0
                            });
                        }
                    ));
                });
            };


            if (costConverSionInLocalCurrency && Object.keys(currency).length !== 0) {
                const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: plantCurrency, defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value, plantCurrency: plantCurrency });

                if (currency?.label === plantCurrency) {
                    setPlantCurrency(1);
                    setPlantExchangeRateId(null);
                    setShowPlantWarning(false);
                } else {
                    callAPI(currency?.label, plantCurrency, costingHeadTypeId, vendorId, clientId).then(({ rate: rate1, exchangeRateId: exchangeRateId1, showPlantWarning: showPlantWarning1, showWarning: showWarning1, }) => {
                        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value, plantCurrency: plantCurrency });

                        if (plantCurrency === reactLocalStorage.getObject("baseCurrency")) {
                            setSettlementCurrency(1);
                            setSettlementExchangeRateId(null);
                            setShowWarning(false);
                            setPlantCurrency(rate1);
                            setPlantExchangeRateId(exchangeRateId1);
                            setShowPlantWarning(showPlantWarning1);
                        } else {
                            callAPI(plantCurrency, reactLocalStorage.getObject("baseCurrency"), costingHeadTypeId, vendorId, clientId).then(({ rate: rate2, exchangeRateId: exchangeRateId2, showWarning: showWarning2, showPlantWarning: showPlantWarning2 }) => {
                                setPlantCurrency(rate1 === 0 ? 1 : rate1);
                                setSettlementCurrency(rate2 === 0 ? 1 : rate2);
                                setPlantExchangeRateId(exchangeRateId1);
                                setSettlementExchangeRateId(exchangeRateId2);
                                setShowPlantWarning(showPlantWarning1)
                                setShowWarning(showWarning2)
                            });
                        }
                    });
                }
            } else if (!costConverSionInLocalCurrency && fromCurrencyRef.current !== reactLocalStorage?.getObject("baseCurrency")) {
                const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value, plantCurrency: plantCurrency });
                callAPI(fromCurrency, reactLocalStorage.getObject("baseCurrency"), costingHeadTypeId, vendorId, clientId).then(({ rate: rate1, exchangeRateId: exchangeRateId1, showPlantWarning, showWarning }) => {
                    setSettlementCurrency(rate1)
                    setPlantExchangeRateId(exchangeRateId1);
                    setShowPlantWarning(showPlantWarning)
                    setShowWarning(showWarning)

                });
            }
        }
    };

    const handleCalculation = (rate = "") => {

        if (costConverSionInLocalCurrency) {
            setValue('totalSumCurrency', checkForDecimalAndNull((totalSum + currentPrice), getConfigurationKey().NoOfDecimalForPrice))
            setValue("totalSumPlantCurrency", checkForDecimalAndNull(((totalSum + currentPrice) * plantCurrency), getConfigurationKey().NoOfDecimalForPrice))
            setValue('totalSum', checkForDecimalAndNull((((totalSum + currentPrice) * plantCurrency) * settlementCurrency), getConfigurationKey().NoOfDecimalForPrice))
        } else {
            setValue('totalSumCurrency', checkForDecimalAndNull((totalSum + currentPrice), getConfigurationKey().NoOfDecimalForPrice))
            setValue('totalSum', checkForDecimalAndNull(((totalSum + currentPrice) * plantCurrency), getConfigurationKey().NoOfDecimalForPrice))

        }
    }
    /**
     * @method onSubmit
     * @description Used to Submit the form
     */
    const onSubmit = debounce((values) => {
        // Add check for data changes when updating
        if (isEditFlag) {
            const hasNoChanges = (
                selectedPlants?.value === DataChanged?.PlantId && part?.value === DataChanged?.PartId && year?.label === DataChanged?.FinancialYear &&
                costingTypeId === DataChanged?.CostingHeadId && partType?.label === DataChanged?.PartType && checkForDecimalAndNull(totalSum, initialConfiguration.NoOfDecimalForPrice) ===
                checkForDecimalAndNull(DataChanged.BudgetedPoPrice, initialConfiguration.NoOfDecimalForPrice) &&
                checkForDecimalAndNull(currentPrice, initialConfiguration.NoOfDecimalForPrice) ===
                checkForDecimalAndNull(DataChanged.NetPoPrice, initialConfiguration.NoOfDecimalForPrice) &&
                // Optional fields - need to handle null cases
                ((!vendorName?.value && !DataChanged?.VendorId) || vendorName?.value === DataChanged?.VendorId) &&
                ((!client?.value && !DataChanged?.CustomerId) || client?.value === DataChanged?.CustomerId) &&
                ((!currency?.value && !DataChanged?.CurrencyId) || currency?.value === DataChanged?.CurrencyId) &&
                // Condition data comparison - handle null case
                (!DataChanged?.ConditionsData ? conditionTableData.length === 0 :
                    conditionTableData.length === DataChanged?.ConditionsData?.length &&
                    conditionTableData.every((condition, index) =>
                        checkForDecimalAndNull(condition.ConditionCost, initialConfiguration.NoOfDecimalForPrice) ===
                        checkForDecimalAndNull(DataChanged?.ConditionsData[index]?.ConditionCost, initialConfiguration?.NoOfDecimalForPrice)
                    )
                )
            );

            if (hasNoChanges) {
                Toaster.warning('Please change the data to save the Budget.');
                return false;
            }
        }

        let startYear = year.label.slice(0, 4);
        let endYear = year.label.slice(-4);
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let temp = []
        tableData && tableData.map((item, index) => {
            let budGetingDetails = []
            let obj = {}
            obj.PartCostingHeadId = item.Value

            for (let i = 0; i < 12; i++) {
                let objInternal = {}
                if (i < 9) {
                    if (i < 3) {
                        objInternal.EffectiveDate = `${endYear}-0${i + 1}-01T00:00:00`
                    } else {
                        objInternal.EffectiveDate = `${startYear}-0${i + 1}-01T00:00:00`
                    }
                } else {
                    objInternal.EffectiveDate = `${startYear}-${i + 1}-01T00:00:00`
                }
                objInternal.Delta = item[months[i]] ? item[months[i]] : 0
                budGetingDetails.push(objInternal)
            }

            obj.BudgetingDetails = budGetingDetails
            temp.push(obj)
        })

        let formData = {
            LoggedInUserId: loggedInUserId(), FinancialYear: values.FinancialYear.label,
            NetPoPrice: values?.currentPrice,
            //  BudgetedPoPrice: totalSum,
            BudgetedPoPrice: totalSum,
            BudgetedEntryType: budgetedEntryType ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
            BudgetedPoPriceInCurrency: (costConverSionInLocalCurrency || reactLocalStorage?.getObject("baseCurrency") !== getValues("plantCurrency")) ? getValues("totalSum") : checkForNull(totalSum),
            CostingHeadId: costingTypeId,
            PartId: part.value,
            PartName: part.label, RevisionNumber: part.RevisionNumber, PlantId: selectedPlants.value,
            PlantName: selectedPlants.label, VendorId: vendorName.value, VendorName: vendorName.label, CustomerId: client.value, BudgetingPartCostingDetails: temp,
            ConditionsData: conditionTableData,
            ExchangeRateSourceName: ExchangeSource?.label,
            CurrencyId: costConverSionInLocalCurrency ? currency?.value : null,
            Currency: costConverSionInLocalCurrency ? currency?.label : getValues("plantCurrency"),
            LocalCurrencyExchangeRate: costConverSionInLocalCurrency ? plantCurrency : null,
            LocalCurrency: costConverSionInLocalCurrency ? getValues("plantCurrency") : null,
            LocalExchangeRateId: costConverSionInLocalCurrency ? plantExchangeRateId : null,
            ExchangeRate: costConverSionInLocalCurrency ? settlementCurrency : plantCurrency,
            ExchangeRateId: costConverSionInLocalCurrency ? settlementExchangeRateId : plantExchangeRateId,
            NetPoPriceConversion: (costConverSionInLocalCurrency || reactLocalStorage?.getObject("baseCurrency") !== getValues("plantCurrency")) ? getValues("totalSum") : checkForNull(totalSum),
            NetPoPriceLocalConversion: costConverSionInLocalCurrency ? getValues("totalSumPlantCurrency") : checkForNull(totalSum),
            BudgetedPoPriceLocalConversion: costConverSionInLocalCurrency ? getValues("totalSumPlantCurrency") : checkForNull(totalSum),

        }
        if (isEditFlag) {
            if (isFinalApprover) {
                dispatch(updateBudget(formData, (res) => {
                    setSetDisable(false)
                    if (res?.data?.Result) {
                        Toaster.success(MESSAGES.BUDGET_UPDATE_SUCCESS)
                        cancel('submit')
                    }
                }))
            } else {
                setApprovalObj(formData)
                setTimeout(() => {
                    setApproveDrawer(true)
                }, 300);
            }

        } else {

            let formData = {
                LoggedInUserId: loggedInUserId(), FinancialYear: values.FinancialYear.label,
                NetPoPrice: values?.currentPrice,
                //  BudgetedPoPrice: totalSum,
                BudgetedPoPrice: totalSum,
                BudgetedEntryType: budgetedEntryType ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
                BudgetedPoPriceInCurrency: (costConverSionInLocalCurrency || reactLocalStorage?.getObject("baseCurrency") !== getValues("plantCurrency")) ? getValues("totalSum") : checkForNull(totalSum),
                CostingHeadId: costingTypeId,
                PartId: part.value,
                PartName: part.label, RevisionNumber: part.RevisionNumber, PlantId: selectedPlants.value,
                PlantName: selectedPlants.label, VendorId: vendorName.value, VendorName: vendorName.label, CustomerId: client.value, BudgetingPartCostingDetails: temp,
                ConditionsData: conditionTableData,
                ExchangeRateSourceName: ExchangeSource?.label,
                CurrencyId: costConverSionInLocalCurrency ? currency?.value : null,
                Currency: costConverSionInLocalCurrency ? currency?.label : getValues("plantCurrency"),
                LocalCurrencyExchangeRate: costConverSionInLocalCurrency ? plantCurrency : null,
                LocalCurrency: costConverSionInLocalCurrency ? getValues("plantCurrency") : null,
                LocalExchangeRateId: costConverSionInLocalCurrency ? plantExchangeRateId : null,
                ExchangeRate: costConverSionInLocalCurrency ? settlementCurrency : plantCurrency,
                ExchangeRateId: costConverSionInLocalCurrency ? settlementExchangeRateId : plantExchangeRateId,
                NetPoPriceConversion: (costConverSionInLocalCurrency || reactLocalStorage?.getObject("baseCurrency") !== getValues("plantCurrency")) ? getValues("totalSum") : checkForNull(totalSum),
                NetPoPriceLocalConversion: costConverSionInLocalCurrency ? getValues("totalSumPlantCurrency") : checkForNull(totalSum),
                BudgetedPoPriceLocalConversion: costConverSionInLocalCurrency ? getValues("totalSumPlantCurrency") : checkForNull(totalSum),

            }

            if (isFinalApprover || (userDetails().Role === 'SuperAdmin') || (!initialConfiguration?.IsMasterApprovalAppliedConfigure)) {
                dispatch(createBudget(formData, (res) => {
                    setSetDisable(false)
                    if (res?.data?.Result) {
                        Toaster.success(MESSAGES.BUDGET_ADD_SUCCESS)
                        cancel('submit')
                    }
                }))
            } else {
                setApprovalObj(formData)
                setTimeout(() => {
                    setApproveDrawer(true)
                }, 300);
            }
        }
    }, 500)

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    const getCostingPrice = () => {
        // If currentPrice already has a value, don't make the API call
        if (currentPrice) {
            return false;
        }

        let obj = {}
        obj.costingHeadId = costingTypeId
        obj.partId = part.value
        obj.plantId = selectedPlants.value
        obj.vendorId = vendorName.value
        obj.customerId = client.value

        if (part.value) {
            dispatch(getApprovedPartCostingPrice(obj, (res) => {
                let TotalSum = checkForNull(res?.data?.DataList[0]?.NetPOPrice) + checkForNull(totalSum)
                setValue('currentPrice', checkForDecimalAndNull(res?.data?.DataList[0].NetPOPrice, getConfigurationKey().NoOfDecimalForInputOutput))
                setCurrentPrice(checkForDecimalAndNull(res?.data?.DataList[0].NetPOPrice, getConfigurationKey().NoOfDecimalForInputOutput))
                setTotalSum(TotalSum)

                if (costConverSionInLocalCurrency) {

                    setValue('totalSumCurrency', checkForDecimalAndNull((totalSum + currentPrice), getConfigurationKey().NoOfDecimalForPrice))
                    setValue("totalSumPlantCurrency", checkForDecimalAndNull(((totalSum + currentPrice) * plantCurrency), getConfigurationKey().NoOfDecimalForPrice))
                    setValue('totalSum', checkForDecimalAndNull((((totalSum + currentPrice) * plantCurrency) * settlementCurrency), getConfigurationKey().NoOfDecimalForPrice))
                } else {

                    setValue('totalSumCurrency', checkForDecimalAndNull((totalSum + currentPrice), getConfigurationKey().NoOfDecimalForPrice))
                    setValue('totalSum', checkForDecimalAndNull(((totalSum + currentPrice) * plantCurrency), getConfigurationKey().NoOfDecimalForPrice))

                }
                // setValue('totalSum', checkForNull(TotalSum * plantCurrency))on
                // setValue('totalSumCurrency', TotalSum)
                // setValue("totalSumPlantCurrency", checkForNull(TotalSum * settlementCurrency))
            }))
        }
    }


    const vendorFilterList = async (inputValue) => {
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendorFilter !== resultInput) {
            setInputLoader(true)
            let res
            res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)

            setInputLoader(false)
            setVendorFilter(resultInput)

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

    const partFilterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && partName !== resultInput) {
            const res = await getPartSelectListWtihRevNo(resultInput, null, null, partType?.value)

            setPartName(resultInput)
            let partDataAPI = res?.data?.DataList
            if (inputValue) {
                return autoCompleteDropdownPart(inputValue, partDataAPI, false, [], true)
            } else {
                return partDataAPI
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage?.getObject('PartData')
                if (inputValue) {
                    return autoCompleteDropdownPart(inputValue, partData, false, [], false)
                } else {
                    return partData
                }
            }
        }
    };

    const openAndCloseAddConditionCosting = (type, data = conditionTableData) => {
        setIsConditionCostingOpen(false)
        seConditionTableData(data)
        const sum = data.reduce((acc, obj) => Number(acc) + Number(obj.ConditionCost), 0);
        let finalNewSum = Number(sum) + Number(totalSum) - totalConditionCost

        setTotalSum(finalNewSum)
        // setValue('totalSum', checkForNull(finalNewSum * plantCurrency))
        // setValue("totalSumCurrency", finalNewSum)
        // setValue('totalSumPlantCurrency', checkForNull((finalNewSum) * settlementCurrency))

        if (costConverSionInLocalCurrency) {

            setValue('totalSumCurrency', checkForDecimalAndNull((totalSum + currentPrice), getConfigurationKey().NoOfDecimalForPrice))
            setValue("totalSumPlantCurrency", checkForDecimalAndNull(((totalSum + currentPrice) * plantCurrency), getConfigurationKey().NoOfDecimalForPrice))
            setValue('totalSum', checkForDecimalAndNull((((totalSum + currentPrice) * plantCurrency) * settlementCurrency), getConfigurationKey().NoOfDecimalForPrice))
        } else {

            setValue('totalSumCurrency', checkForDecimalAndNull((totalSum + currentPrice), getConfigurationKey().NoOfDecimalForPrice))
            setValue('totalSum', checkForDecimalAndNull(((totalSum + currentPrice) * plantCurrency), getConfigurationKey().NoOfDecimalForPrice))

        }

        setTimeout(() => {
            setTotalConditionCost(sum)
        }, 1000)
    }

    const closeApprovalDrawer = () => {
        setApproveDrawer(false)
        props.hideForm()
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        editable: true
    };

    const frameworkComponents = {
        buttonFormatter: buttonFormatter,
        customLoadingOverlay: LoaderCustom,
        budgetedQuantity: budgetedQuantity,
        actualQuantity: actualQuantity,
        costHeader: costHeader,
        customNoRowsOverlay: NoContentFound
    };
    const tooltipToggle = () => {
        setViewTooltip(!viewTooltip)
    }
    const handleExchangeRateSource = (e) => {
        setExchangeSource(e)
        callExchangeRateAPI()


    }
    const budgetedTotalTitle = () => {
        return {
            tooltipTextNetCostBaseCurrencyDomestic: `Total Sum (${getValues("plantCurrency")}) * Plant Currency Rate (${plantCurrency})`,
            tooltipTextPlantCurrency: `Total Sum (${currency?.label ? `${currency.label}` : getValues("plantCurrency")}) * Plant Currency Rate (${plantCurrency})`,
            toolTipTextNetCostBaseCurrency: hidePlantCurrency ? `Total Sum (${currency.label}) * Currency Rate (${plantCurrency})` : `Total Sum (${getValues("plantCurrency")}) * Currency Rate (${settlementCurrency})`,
        };
    };


    const getTooltipTextForCurrency = () => {
        const plantCurrencyLabel = (getValues("plantCurrency") === null || getValues("plantCurrency") === undefined || getValues("plantCurrency") === '') ? 'Plant Currency' : getValues("plantCurrency");
        const baseCurrency = reactLocalStorage.getObject("baseCurrency");
        const currencyLabel = currency?.label ?? 'Currency';

        // Check the exchange rates or provide a default placeholder if undefined
        const plantCurrencyRate = plantCurrency ?? 1;
        const settlementCurrencyRate = settlementCurrency ?? 1;

        return (
            <>
                <p>Exchange Rate: 1 {currencyLabel} = {plantCurrencyRate} {plantCurrencyLabel}</p>
                <p>Exchange Rate: 1 {plantCurrencyLabel} = {settlementCurrencyRate} {baseCurrency}</p>
            </>
        );
    };

    return (
        <>
            <div className={`ag-grid-react`}>
                <div className="container-fluid">
                    {isLoader ? <LoaderCustom customClass={"loader-center"} /> :
                        <div className="login-container signup-form">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="shadow-lgg login-formg">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-heading mb-0">
                                                    <h1>
                                                        {isViewMode ? 'View' : isEditFlag ? 'Update' : 'Add'} Budget
                                                        {!isViewMode && <TourWrapper
                                                            buttonSpecificProp={{ id: "Add_Budget_Form" }}
                                                            stepsSpecificProp={{
                                                                steps: Steps(t, {
                                                                    showSendForApproval: !isFinalApprover,
                                                                    isEditFlag: isEditFlag,
                                                                    customerField: (costingTypeId === CBCTypeId),
                                                                    vendorField: (costingTypeId === VBCTypeId),
                                                                    plantField: (costingTypeId === ZBCTypeId),
                                                                    destinationPlant: ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant))
                                                                }).ADD_BUDGET
                                                            }} />}
                                                    </h1>
                                                    <Row>
                                                        <Col md="4" className="switch mb15">
                                                            <label className="switch-level">
                                                                <div className={"left-title"}>Domestic</div>
                                                                <ReactSwitch
                                                                    onChange={ImportToggle}
                                                                    checked={budgetedEntryType}
                                                                    id="normal-switch"
                                                                    disabled={isViewMode || isEditFlag}
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
                                                </div>
                                            </div>
                                        </div>
                                        <form onSubmit={handleSubmit(onSubmit)} noValidate className="manageuser form" onKeyDown={(e) => { handleKeyDown(e, onSubmit); }}>
                                            <div className="add-min-height">
                                                <Row>
                                                    <Col md="12">
                                                        {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label id='AddBudget_ZeroBased' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                                            <input
                                                                type="radio"
                                                                name="costingHead"
                                                                checked={
                                                                    costingTypeId === ZBCTypeId ? true : false
                                                                }
                                                                onClick={() =>
                                                                    onPressVendor(ZBCTypeId)
                                                                }
                                                                disabled={isViewMode ? true : false || isEditFlag}
                                                            />{" "}
                                                            <span>Zero Based</span>
                                                        </Label>}
                                                        {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label id='AddBudget_VendorBased' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                                            <input
                                                                type="radio"
                                                                name="costingHead"
                                                                checked={
                                                                    costingTypeId === VBCTypeId ? true : false
                                                                }
                                                                onClick={() =>
                                                                    onPressVendor(VBCTypeId)
                                                                }
                                                                disabled={isViewMode ? true : false || isEditFlag}
                                                            />{" "}
                                                            <span>{vendorLabel} Based</span>
                                                        </Label>}
                                                        {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id='AddBudget_CustomerBased' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                                                            <input
                                                                type="radio"
                                                                name="costingHead"
                                                                checked={
                                                                    costingTypeId === CBCTypeId ? true : false
                                                                }
                                                                onClick={() =>
                                                                    onPressVendor(CBCTypeId)
                                                                }
                                                                disabled={isViewMode ? true : false || isEditFlag}
                                                            />{" "}
                                                            <span>Customer Based</span>
                                                        </Label>}
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md="11">
                                                        <Row>
                                                            {(costingTypeId === ZBCTypeId && (<>
                                                                <div className="col-md-3">
                                                                    <SearchableSelectHookForm
                                                                        name="Plant"
                                                                        type="text"
                                                                        label={'Plant (Code)'}
                                                                        errors={errors.Plant}
                                                                        Controller={Controller}
                                                                        control={control}
                                                                        register={register}
                                                                        mandatory={true}
                                                                        rules={{
                                                                            required: true,
                                                                        }}
                                                                        placeholder={'Select'}
                                                                        options={renderListing("plant")}
                                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                                        //validate={(role == null || role.length === 0) ? [required] : []}
                                                                        required={true}
                                                                        disabled={isViewMode || isEditFlag}
                                                                        handleChange={handlePlants}
                                                                        valueDescription={selectedPlants}
                                                                    />
                                                                </div>
                                                            </>)
                                                            )}

                                                            {costingTypeId === VBCTypeId && (<>
                                                                <Col md="3">
                                                                    <AsyncSearchableSelectHookForm
                                                                        label={`${vendorLabel} (Code)`}
                                                                        id='AddBudget_vendorName'
                                                                        name={"vendorName"}
                                                                        placeholder={"Select"}
                                                                        Controller={Controller}
                                                                        value={vendorName}
                                                                        control={control}
                                                                        rules={{ required: true }}
                                                                        register={register}
                                                                        defaultValue={vendorName?.length !== 0 ? vendorName : ""}
                                                                        asyncOptions={vendorFilterList}
                                                                        mandatory={true}
                                                                        loadOptions={vendorFilterList}
                                                                        handleChange={(e) => handleVendorName(e)}
                                                                        errors={errors.vendorName}
                                                                        disabled={isViewMode}
                                                                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                                                        isLoading={{
                                                                            isLoader: inputLoader,
                                                                            loaderClass: ''
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </>)}


                                                            {((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) &&

                                                                < div className="col-md-3">
                                                                    <SearchableSelectHookForm
                                                                        name="DestinationPlant"
                                                                        type="text"
                                                                        label={costingTypeId === VBCTypeId ? 'Destination Plant (Code)' : 'Plant (Code)'}
                                                                        errors={errors.DestinationPlant}
                                                                        Controller={Controller}
                                                                        control={control}
                                                                        register={register}
                                                                        mandatory={true}
                                                                        rules={{
                                                                            required: true,
                                                                        }}
                                                                        placeholder={'Select'}
                                                                        options={renderListing("plant")}
                                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                                        //validate={(role == null || role.length === 0) ? [required] : []}
                                                                        required={true}
                                                                        disabled={isViewMode ? true : false}
                                                                        handleChange={handlePlants}
                                                                        valueDescription={selectedPlants}
                                                                    />
                                                                </div>
                                                            }


                                                            {costingTypeId === CBCTypeId && (
                                                                <>
                                                                    < div className="col-md-3">
                                                                        <SearchableSelectHookForm
                                                                            name="clientName"
                                                                            type="text"
                                                                            label="Customer (Code)"
                                                                            errors={errors.clientName}
                                                                            Controller={Controller}
                                                                            control={control}
                                                                            register={register}
                                                                            mandatory={true}
                                                                            rules={{
                                                                                required: true,
                                                                            }}
                                                                            placeholder={'Select'}
                                                                            options={renderListing("ClientList")}
                                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                                            //validate={(role == null || role.length === 0) ? [required] : []}
                                                                            disabled={isViewMode ? true : false}
                                                                            required={true}
                                                                            handleChange={handleClient}
                                                                            valueDescription={client}
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}
                                                            <Col className="col-md-3">
                                                                <TextFieldHookForm
                                                                    name="plantCurrency"
                                                                    label="Plant Currency"
                                                                    id="plantCurrency"
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
                                                                    customClassName=" withBorder mb-1"
                                                                    handleChange={() => { }}
                                                                    errors={errors.plantCurrency}
                                                                />
                                                                {showPlantWarning && <WarningMessage dClass="mt-0" message={`${getValues("plantCurrency")} rate is not present in the Exchange Master`} />}

                                                            </Col>
                                                            {getConfigurationKey().IsSourceExchangeRateNameVisible && (
                                                                <Col className="col-md-15">
                                                                    <SearchableSelectHookForm
                                                                        label={"Exchange Rate Source"}
                                                                        name={"ExchangeSource"}
                                                                        placeholder={"Select"}
                                                                        Controller={Controller}
                                                                        control={control}
                                                                        rules={{ required: false }}
                                                                        register={register}
                                                                        defaultValue={partType.length !== 0 ? partType : ""}
                                                                        options={renderListing('ExchangeSource')}
                                                                        mandatory={false}
                                                                        handleChange={handleExchangeRateSource}
                                                                        errors={errors.ExchangeSource}
                                                                        disabled={isViewMode ? true : false || isEditFlag ? true : false}
                                                                    />
                                                                </Col>)}
                                                            <Col className="col-md-15">
                                                                <SearchableSelectHookForm
                                                                    label={"Part Type"}
                                                                    name={"PartType"}
                                                                    placeholder={"Select"}
                                                                    Controller={Controller}
                                                                    control={control}
                                                                    rules={{ required: true }}
                                                                    register={register}
                                                                    defaultValue={partType.length !== 0 ? partType : ""}
                                                                    options={renderListing('PartType')}
                                                                    mandatory={true}
                                                                    handleChange={handlePartTypeChange}
                                                                    errors={errors.PartType}
                                                                    disabled={isViewMode || isEditFlag}
                                                                />
                                                            </Col>
                                                            <Col className="col-md-3 p-relative">
                                                                <AsyncSearchableSelectHookForm
                                                                    label={"Part No. (Revision No.)"}
                                                                    id='AddBudget_PartNumber'
                                                                    name={"PartNumber"}
                                                                    placeholder={"Select"}
                                                                    Controller={Controller}
                                                                    value={part}
                                                                    control={control}
                                                                    rules={{ required: true }}
                                                                    register={register}
                                                                    defaultValue={part?.length !== 0 ? part : ""}
                                                                    asyncOptions={partFilterList}
                                                                    mandatory={true}
                                                                    loadOptions={partFilterList}
                                                                    handleChange={(e) => handlePartName(e)}
                                                                    errors={errors.PartNumber}
                                                                    disabled={(isViewMode || partType.length === 0) ? true : false || isEditFlag}
                                                                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                                                />

                                                            </Col>

                                                            <div className="col-md-3 p-relative">
                                                                <SearchableSelectHookForm
                                                                    name="FinancialYear"
                                                                    type="text"
                                                                    label="Year"
                                                                    errors={errors.FinancialYear}
                                                                    Controller={Controller}
                                                                    control={control}
                                                                    register={register}
                                                                    mandatory={true}
                                                                    rules={{
                                                                        required: true,
                                                                    }}
                                                                    //component={searchableSelect}
                                                                    placeholder={'Select'}
                                                                    options={renderListing("yearList")}
                                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                                    //validate={(role == null || role.length === 0) ? [required] : []}
                                                                    required={true}
                                                                    handleChange={handleFinancialYear}
                                                                    disabled={isViewMode ? true : false || isEditFlag}
                                                                />

                                                            </div>
                                                            {budgetedEntryType && <Col md="3">
                                                                <TooltipCustom id="currency" width="300px" tooltipText={getTooltipTextForCurrency()} />
                                                                <SearchableSelectHookForm
                                                                    name="currency"
                                                                    type="text"
                                                                    label="Currency"
                                                                    id="currency"
                                                                    errors={errors.currency}
                                                                    Controller={Controller}
                                                                    control={control}
                                                                    register={register}
                                                                    mandatory={budgetedEntryType ? true : false}
                                                                    rules={{
                                                                        required: budgetedEntryType ? true : false,
                                                                    }}
                                                                    //component={searchableSelect}
                                                                    placeholder={'Select'}
                                                                    options={renderListing("currency")}
                                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                                    //validate={(role == null || role.length === 0) ? [required] : []}
                                                                    required={budgetedEntryType ? true : false}
                                                                    handleChange={handleCurrencyChange}
                                                                    disabled={disableCurrency || isViewMode ? true : false}
                                                                    customClassName="mb-1"
                                                                />
                                                                {currency?.label && showWarning && <WarningMessage dClass="mt-1" message={`${currency?.label} rate is not present in the Exchange Master`} />}
                                                            </Col>}
                                                            <div md="1" className='p-relative col-md-0'>
                                                                <button id='AddBudget_checkbox' className='user-btn budget-tick-btn' type='button' onClick={getCostingPrice} disabled={isViewMode ? true : false} >
                                                                    <div className='save-icon' ></div>
                                                                </button>
                                                            </div>
                                                        </Row>
                                                    </Col>


                                                </Row>
                                                <Row>
                                                    <Col md="12">
                                                        <Row className='align-items-center'>
                                                            <Col md="3">
                                                                <div className="left-border">{"Budgeting Details:"}</div>
                                                            </Col>
                                                            {/* <Col md="3">
                                                                <div className='budgeting-details'>
                                                                    <label className='w-fit'>{`Current Price (${getValues("plantCurrency") ?? "Plant Currency"}:)`}</label>
                                                                    <NumberFieldHookForm
                                                                        label=""
                                                                        name={"currentPrice"}
                                                                        errors={errors.currentLocalPrice}
                                                                        Controller={Controller}
                                                                        control={control}
                                                                        register={register}
                                                                        disableErrorOverflow={true}
                                                                        mandatory={false}
                                                                        rules={{
                                                                            required: false,
                                                                        }}
                                                                        handleChange={() => { }}
                                                                        disabled={true}
                                                                        customClassName={'withBorder'}
                                                                    />
                                                                </div>

                                                            </Col> */}
                                                            <Col md="9">
                                                                <div className='budgeting-details'>
                                                                    <label className='w-fit'>{`Current Price :`}</label>
                                                                    <NumberFieldHookForm
                                                                        label=""
                                                                        name={"currentPrice"}
                                                                        errors={errors.currentPrice}
                                                                        Controller={Controller}
                                                                        control={control}
                                                                        register={register}
                                                                        disableErrorOverflow={true}
                                                                        mandatory={false}
                                                                        rules={{
                                                                            required: false,
                                                                        }}
                                                                        handleChange={() => { }}
                                                                        disabled={true}
                                                                        customClassName={'withBorder'}
                                                                    />
                                                                </div>

                                                            </Col>

                                                            {/* <Col md="3">
                                                                <div className='budgeting-details'>
                                                                    <label className='w-fit'>{`Current Price ${currency?.label ? `(${currency.label})` : '(Currency)'}:`}</label>
                                                                    <NumberFieldHookForm
                                                                        label=""
                                                                        name={"currentPrice"}
                                                                        errors={errors.currentSettlmentPrice}
                                                                        Controller={Controller}
                                                                        control={control}
                                                                        register={register}
                                                                        disableErrorOverflow={true}
                                                                        mandatory={false}
                                                                        rules={{
                                                                            required: false,
                                                                        }}
                                                                        handleChange={() => { }}
                                                                        disabled={true}
                                                                        customClassName={'withBorder'}
                                                                    />
                                                                </div>

                                                            </Col> */}
                                                        </Row>
                                                    </Col>

                                                    <Col md="12">
                                                        <div className={`ag-grid-wrapper budgeting-table  ${tableData && tableData?.length <= 0 ? "overlay-contain" : ""}`} style={{ width: '100%', height: '100%' }}>
                                                            {showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={viewTooltip} toggle={tooltipToggle} target={"cost-tooltip"} >{"Net cost's rows are editable. Double click to edit data"}</Tooltip>}
                                                            <div className="ag-theme-material" >
                                                                <AgGridReact
                                                                    style={{ height: '100%', width: '100%' }}
                                                                    defaultColDef={defaultColDef}
                                                                    domLayout='autoHeight'
                                                                    // columnDefs={c}
                                                                    rowData={tableData}
                                                                    onCellValueChanged={onCellValueChanged}
                                                                    pagination={true}
                                                                    paginationPageSize={12}
                                                                    onGridReady={onGridReady}
                                                                    gridOptions={gridOptions}
                                                                    loadingOverlayComponent={'customLoadingOverlay'}
                                                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                                                    noRowsOverlayComponentParams={{
                                                                        title: EMPTY_DATA,
                                                                    }}
                                                                    frameworkComponents={frameworkComponents}
                                                                    suppressColumnVirtualisation={true}
                                                                    stopEditingWhenCellsLoseFocus={true}
                                                                >
                                                                    <AgGridColumn field="Text" headerName="Net Cost" editable='false' pinned='left' cellStyle={{ 'font-size': '15px', 'font-weight': '500', 'color': '#3d4465' }} width={310} headerComponent={'costHeader'} ></AgGridColumn>
                                                                    <AgGridColumn width={115} field="April" headerName="April" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity'></AgGridColumn>
                                                                    <AgGridColumn width={115} field="May" headerName="May" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={115} field="June" headerName="June" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={115} field="July" headerName="July" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={115} field="August" headerName="August" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={115} field="September" headerName="September" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={115} field="October" headerName="October" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={115} field="November" headerName="November" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={115} field="December" headerName="December" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={115} field="January" headerName="January" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={115} field="February" headerName="February" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={115} field="March" headerName="March" editable={isViewMode ? false : true} cellRenderer='budgetedQuantity' valueSetter={validateCellValue}></AgGridColumn>
                                                                    <AgGridColumn width={130} field="Sum" headerName="Sum" cellRenderer='actualQuantity' editable={false} valueGetter='(Number(data.March?data.March:0) + Number(data.January?data.January:0) + Number(data.February?data.February:0)+ Number(data.April?data.April:0)+ Number(data.May?data.May:0)+ Number(data.June?data.June:0)+ Number(data.July?data.July:0)+ Number(data.August?data.August:0)+ Number(data.September?data.September:0)+ Number(data.October?data.October:0)+ Number(data.November?data.November:0)+ Number(data.December?data.December:0))'></AgGridColumn>
                                                                </AgGridReact>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    {initialConfiguration?.IsBasicRateAndCostingConditionVisible && <><Col md="8" className='mt-3'><div className="left-border mt-1">Costing Condition:</div></Col>
                                                        <Col md="4" className="text-right mt-3">
                                                            <button id='AddBudget_Add' className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setConditionAcc(!conditionAcc) }} disabled={isViewMode ? true : false}>
                                                                {conditionAcc ? (
                                                                    <i className="fa fa-minus" ></i>
                                                                ) : (
                                                                    <i className="fa fa-plus"></i>
                                                                )}
                                                            </button>
                                                        </Col>
                                                        {conditionAcc && <div className='mb-2'><Row>
                                                            <Col md="12">
                                                                <div className='d-flex justify-content-end mb-2'>
                                                                    <Button type='button' onClick={() => { setIsConditionCostingOpen(true) }}> <div className={`${conditionTableData.length === 0 ? 'plus' : 'fa fa-eye pr-1'}`}></div>{conditionTableData.length === 0 ? "Add" : "View"}</Button>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                            <ConditionCosting hideAction={true} tableData={conditionTableData} /></div>}
                                                    </>}
                                                    <Col md="4">
                                                        <div className='budgeting-details  mt-2 '>
                                                            <label className='w-fit'>{`Total Sum (${currency?.label ? `${currency.label}` : getValues("plantCurrency")}):`}</label>
                                                            <NumberFieldHookForm
                                                                label=""
                                                                name={"totalSumCurrency"}
                                                                errors={errors.totalSumCurrency}
                                                                Controller={Controller}
                                                                control={control}
                                                                register={register}
                                                                disableErrorOverflow={true}
                                                                mandatory={true}
                                                                rules={{
                                                                    required: true,
                                                                }}
                                                                handleChange={() => { }}
                                                                disabled={true}
                                                                customClassName={'withBorder'}
                                                            />
                                                        </div>  <></>
                                                        {/* } */}
                                                    </Col>

                                                    {(!hidePlantCurrency && costConverSionInLocalCurrency && budgetedEntryType) && <Col md="4">
                                                        <TooltipCustom disabledIcon={true} id="total-local" tooltipText={hidePlantCurrency ? budgetedTotalTitle()?.toolTipTextNetCostBaseCurrency : budgetedTotalTitle()?.tooltipTextPlantCurrency} />
                                                        {/* {currency && currency?.label ? */}
                                                        <div className='budgeting-details  mt-2 '>
                                                            <label className='w-fit'>{`Total Sum (${getValues("plantCurrency") ?? "Currency"}):`}</label>
                                                            <NumberFieldHookForm
                                                                label=""
                                                                name={"totalSumPlantCurrency"}
                                                                id="total-local"
                                                                errors={errors.totalSumPlantCurrency}
                                                                Controller={Controller}
                                                                control={control}
                                                                register={register}
                                                                disableErrorOverflow={true}
                                                                mandatory={false}
                                                                rules={{
                                                                    required: false,
                                                                }}
                                                                handleChange={() => { }}
                                                                disabled={true}
                                                                customClassName={'withBorder'}
                                                            />
                                                        </div>
                                                        {/* } */}
                                                    </Col>}


                                                    {(!(!costConverSionInLocalCurrency && reactLocalStorage.getObject("baseCurrency") === getValues("plantCurrency"))) && <Col md="4">
                                                        <TooltipCustom disabledIcon={true} id="total-base" tooltipText={budgetedEntryType ? budgetedTotalTitle()?.toolTipTextNetCostBaseCurrency : budgetedTotalTitle()?.tooltipTextNetCostBaseCurrencyDomestic} />
                                                        <div className='budgeting-details  mt-2 mb-2'>
                                                            <label className='w-fit'>{`Total Sum (${reactLocalStorage.getObject("baseCurrency")}):`}</label>
                                                            <NumberFieldHookForm
                                                                label=""
                                                                name={"totalSum"}
                                                                id="total-base"
                                                                errors={errors.totalSum}
                                                                Controller={Controller}
                                                                control={control}
                                                                register={register}
                                                                disableErrorOverflow={true}
                                                                mandatory={false}
                                                                rules={{
                                                                    required: false,
                                                                }}
                                                                handleChange={() => { }}
                                                                disabled={true}
                                                                customClassName={'withBorder'}
                                                            />
                                                        </div>
                                                    </Col>}

                                                </Row>

                                                {
                                                    isConditionCostingOpen && <AddConditionCosting
                                                        isOpen={isConditionCostingOpen}
                                                        tableData={conditionTableData}
                                                        closeDrawer={openAndCloseAddConditionCosting}
                                                        anchor={'right'}
                                                        //netPOPrice={netPOPrice}
                                                        basicRate={totalSum}
                                                    />
                                                }

                                            </div>
                                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                                <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                                                    {disableSendForApproval && <WarningMessage dClass={"mr-2"} message={'This user is not in the approval cycle'} />}
                                                    <button
                                                        type={"button"}
                                                        id='AddBudget_Cancel'

                                                        className="mr15 cancel-btn"
                                                        onClick={cancelHandler}
                                                        disabled={setDisable}
                                                    >
                                                        <div className={"cancel-icon"}></div>{" "}
                                                        {"Cancel"}
                                                    </button>
                                                    {!userDetails().Role === 'SuperAdmin' && !isFinalApprover && initialConfiguration?.IsMasterApprovalAppliedConfigure ?
                                                        <button type="submit"
                                                            id='AddBudget_SendForApproval'
                                                            className="user-btn approval-btn save-btn mr5"
                                                            disabled={setDisable || disableSendForApproval || isViewMode || showWarning || showPlantWarning}
                                                        >
                                                            <div className="send-for-approval"></div>
                                                            {'Send For Approval'}
                                                        </button>
                                                        :
                                                        <button
                                                            type="submit"
                                                            id="AddBudget_Save"
                                                            className="user-btn mr5 save-btn"
                                                            disabled={setDisable || disableSendForApproval || isViewMode || showWarning || showPlantWarning}
                                                        >
                                                            <div className={"save-icon"}></div>
                                                            {isEditFlag ? "Update" : "Save"}
                                                        </button>
                                                    }
                                                </div>
                                            </Row>

                                        </form></div>
                                    {
                                        approveDrawer && (
                                            <MasterSendForApproval
                                                isOpen={approveDrawer}
                                                closeDrawer={closeApprovalDrawer}
                                                isEditFlag={false}
                                                masterId={BUDGET_ID}
                                                type={'Sender'}
                                                anchor={"right"}
                                                approvalObj={approvalObj}
                                                isBulkUpload={false}
                                                IsImportEntry={false}
                                                costingTypeId={costingTypeId}
                                                //costingTypeId={this.state.costingTypeId}
                                                levelDetails={levelDetails}
                                            />
                                        )
                                    }
                                </div>
                            </div>
                        </div>}
                </div>
                {showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />}
            </div >

        </>
    );
}

export default AddBudget;

