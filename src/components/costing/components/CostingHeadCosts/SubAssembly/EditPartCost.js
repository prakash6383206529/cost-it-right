import React, { useContext, useEffect, useRef, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { checkForDecimalAndNull, checkForNull, formViewData, loggedInUserId, percentageOfNumber } from '../../../../../helper';
import { ListForPartCost, optionsForDelta, REMARKMAXLENGTH } from '../../../../../config/masterData';
import { NumberFieldHookForm, SearchableSelectHookForm, TextAreaHookForm } from '../../../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import Toaster from '../../../../common/Toaster';
import { getCostingForMultiTechnology, getEditPartCostDetails, getSettledCostingDetails, getSettledSimulationCostingDetails, saveSettledCostingDetails, setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../../actions/SubAssembly';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { formatMultiTechnologyUpdate } from '../../../CostingUtil';
import _ from 'lodash';
import NoContentFound from '../../../../common/NoContentFound';
import { getSingleCostingDetails, gridDataAdded, setCostingViewData, setCostingViewDataForAssemblyTechnology, getBOPDrawerDataList, setIsMultiVendor, setApplicabilityForChildParts } from '../../../actions/Costing';
import CostingDetailSimulationDrawer from '../../../../simulation/components/CostingDetailSimulationDrawer';
import { ViewCostingContext } from '../../CostingDetails';
import { AWAITING_APPROVAL_ID, CBCTypeId, EMPTY_DATA, EMPTY_GUID, NFRTypeId, NCCTypeId, PFS1TypeId, PFS2TypeId, PFS3TypeId, REJECTEDID, VBCTypeId, WACTypeId, ZBCTypeId, PENDING_FOR_APPROVAL_ID, INR } from '../../../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';
import { number, checkWhiteSpaces, decimalNumberLimit6, NoSignMaxLengthMessage } from "../../../../../helper/validation";
import { useLabels } from '../../../../../helper/core';
import TooltipCustom from '../../../../common/Tooltip';
import AddBOP from '../../Drawers/AddBOP';
import LoaderCustom from '../../../../common/Loader';
import DayTime from '../../../../common/DayTimeWrapper';
import Popup from 'reactjs-popup';
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper';
function EditPartCost(props) {
    const drawerRef = useRef();

    const [gridData, setGridData] = useState([])
    const { settledCostingDetails, settledCostingDetailsView } = useSelector(state => state.subAssembly)
    const [weightedCost, setWeightedCost] = useState(0)
    const [costingNumberData, setCostingNumberData] = useState({})
    const [isOpen, setIsOpen] = useState(false)
    const CostingViewMode = useContext(ViewCostingContext);
    const [technologyName, setTechnologyName] = useState('')
    const [tableDataList, setTableDataList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useDispatch()
    const [selectedBOPItems, setSelectedBOPItems] = useState([]);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [singleProcessRemark, setSingleProcessRemark] = useState(true)
    const [remark, setRemark] = useState('')
    const PartCostFields = 'PartCostFields';
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)

    const { costingForMultiTechnology } = useSelector(state => state.subAssembly)
    const costData = useContext(costingInfoContext);

    const { ToolTabData, OverheadProfitTabData, SurfaceTabData, DiscountCostData, PackageAndFreightTabData, CostingEffectiveDate, ToolsDataList, ComponentItemDiscountData, OverHeadAndProfitTabData, RMCCTabData, checkIsToolTabChange, getAssemBOPCharge } = useSelector(state => state.costing)
    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    const { vendorLabel } = useLabels()
    const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const { currencySource } = useSelector(state => state.costing)
    const isBOPView = props?.isBopEdit || false;
    const [openRemarkPopUp, setOpenRemarkPopUp] = useState(false);
    const [remarkIndex, setRemarkIndex] = useState(null);

    useEffect(() => {
        if (!isBOPView) {
            gridData && gridData.map((item, index) => {
                setValue(`${PartCostFields}.${index}.DeltaValue`, item?.DeltaValue)
                setValue(`${PartCostFields}.${index}.DeltaSign`, item?.DeltaSign)
                setValue(`${PartCostFields}.${index}.SOBPercentage`, item?.SOBPercentage)
                setValue(`${PartCostFields}.${index}.NetCost`, checkForDecimalAndNull(item?.NetCost, initialConfiguration?.NoOfDecimalForPrice))
                return null
            })
        } else {
            selectedBOPItems && selectedBOPItems?.map((item, index) => {
                setValue(`${PartCostFields}.${index}.DeltaValue`, item?.DeltaValue)
                setValue(`${PartCostFields}.${index}.DeltaSign`, item?.DeltaSign)
                setValue(`${PartCostFields}.${index}.SOBPercentage`, item?.SOBPercentage)
                setValue(`${PartCostFields}.${index}.NetCost`, checkForDecimalAndNull(item?.NetCost, initialConfiguration?.NoOfDecimalForPrice))
                return null
            })
            //calculateSelectedBOPWeightedCost();

        }
    }, [gridData, selectedBOPItems])

    useEffect(() => {
        let temp = []
        if (CostingViewMode || props?.costingSummary) {
            temp = settledCostingDetailsView

            let tempArray = []
            temp?.CostingWeightedAverageSettledDetails && temp?.CostingWeightedAverageSettledDetails.map((item, index) => {
                let tempObject = {}
                tempObject.DeltaValue = item?.Delta
                tempObject.DeltaSign = { label: item?.DeltaSign, value: item?.DeltaSign }
                tempObject.NetCost = item?.NetCost
                tempObject.SOBPercentage = item?.SOBPercentage
                tempObject.SettledPriceLocalConversion = item?.SettledPriceLocalConversion
                tempObject.SettledPriceConversion = item?.SettledPriceConversion
                tempObject.SettledPrice = item?.SettledPrice
                tempObject.VendorCode = item?.VendorCode
                tempObject.VendorName = item?.VendorName
                tempObject.label = item?.CostingNumber
                tempObject.value = item?.BaseCostingId
                tempObject.CustomerCode = item?.CustomerCode
                tempObject.CustomerName = item?.CustomerName
                if (isBOPView) {
                    tempObject.BoughtOutPartId = item?.BoughtOutPartId
                    tempObject.BoughtOutPartNumber = item?.BoughtOutPartNumber
                    tempObject.Vendor = `${item?.VendorName} - ${item?.VendorCode}`
                    tempObject.NetLandedCost = item?.SettledPrice
                    tempObject.EffectiveDate = item?.EffectiveDate
                    tempObject.Remark = item?.Remark
                }
                tempArray.push(tempObject)
                setValue(`${PartCostFields}.${index}.DeltaSign`, { label: item?.DeltaSign, value: item?.DeltaSign })
            })
            setWeightedCost(temp?.NetPOPrice)

            if (isBOPView) {
                setSelectedBOPItems(tempArray)
            } else {
                setGridData(tempArray)
            }
        }
    }, [settledCostingDetailsView])

    useEffect(() => {
        let temp = []
        if (!(CostingViewMode || props?.costingSummary)) {
            temp = _.cloneDeep(settledCostingDetails)

            let tempArray = []
            temp?.CostingWeightedAverageSettledDetails && temp?.CostingWeightedAverageSettledDetails.map((item, index) => {
                let tempObject = {}
                tempObject.DeltaValue = item?.Delta
                tempObject.DeltaSign = { label: item?.DeltaSign, value: item?.DeltaSign }
                tempObject.NetCost = item?.NetCost
                tempObject.SOBPercentage = item?.SOBPercentage
                tempObject.SettledPriceLocalConversion = item?.SettledPriceLocalConversion
                tempObject.SettledPriceConversion = item?.SettledPriceConversion
                tempObject.SettledPrice = item?.SettledPrice
                tempObject.VendorCode = item?.VendorCode
                tempObject.VendorName = item?.VendorName
                tempObject.label = item?.CostingNumber
                tempObject.value = item?.BaseCostingId
                tempObject.CustomerCode = item?.CustomerCode
                tempObject.CustomerName = item?.CustomerName
                if (isBOPView) {
                    tempObject.BoughtOutPartId = item?.BoughtOutPartId
                    tempObject.BoughtOutPartNumber = item?.BoughtOutPartNumber
                    tempObject.Vendor = `${item?.VendorName} - ${item?.VendorCode}`
                    tempObject.NetLandedCost = item?.SettledPrice
                    tempObject.EffectiveDate = item?.EffectiveDate
                    tempObject.Remark = item?.Remark

                } tempArray.push(tempObject)
                setValue(`${PartCostFields}.${index}.DeltaSign`, { label: item?.DeltaSign, value: item?.DeltaSign })
            })

            setWeightedCost(temp?.NetPOPrice)
            if (isBOPView) {
                setSelectedBOPItems(tempArray)
            } else {
                setGridData(tempArray)
            }
        }
    }, [settledCostingDetails])

    useEffect(() => {
        // GET DATA FOR EDIT DRAWER
        let obj = {
            partId: props?.tabAssemblyIndividualPartDetail?.PartId,
            plantId: costData?.DestinationPlantId,
            isRequestForWAC: (costData?.CostingTypeId === WACTypeId || props?.costingTypeId === WACTypeId) ? true : false,
            costingTypeId: (costData?.CostingTypeId === WACTypeId || props?.costingTypeId === WACTypeId) ? null : costData?.CostingTypeId,
            effectiveDate: CostingEffectiveDate,
            baseCostingId: costData?.CostingId
        }

        !props?.costingSummary && dispatch(getCostingForMultiTechnology(obj, res => { }))
        let isViewMode = false
        if ((CostingViewMode || props?.costingSummary) ? true : false) {
            isViewMode = true
        } else {
            isViewMode = false
        }
        const tempData = viewCostingData && viewCostingData[props?.index]
        if (props?.simulationMode && String(tempData?.CostingHeading) === String("New Costing") && (Number(tempData?.SimulationStatusId) === Number(REJECTEDID) || Number(tempData?.SimulationStatusId) === Number(PENDING_FOR_APPROVAL_ID) || Number(tempData?.SimulationStatusId) === Number(AWAITING_APPROVAL_ID))) {
            dispatch(getSettledSimulationCostingDetails(props?.SimulationId, props?.tabAssemblyIndividualPartDetail?.CostingId, isViewMode, (res) => {

            }))
        } else {
            dispatch(getSettledCostingDetails(props?.tabAssemblyIndividualPartDetail?.CostingId, isViewMode, res => { }))

        }


        // dispatch(getEditPartCostDetails(obj, res => { }))
        return () => {
            gridData && gridData.map((item, index) => {
                setValue(`${PartCostFields}.${index}.DeltaValue`, 0)
                setValue(`${PartCostFields}.${index}.DeltaSign`, 0)
                setValue(`${PartCostFields}.${index}.SOBPercentage`, 0)
                setValue(`${PartCostFields}.${index}.NetCost`, 0)
                return null
            })
        }
    }, [])

    // useEffect(() => {
    //     if (isBOPView && selectedBOPItems.length > 0) {
    //         // Update form fields for each selected BOP item
    //         selectedBOPItems.forEach((item, index) => {
    //             setValue(`${PartCostFields}.${index}.DeltaValue`, item?.Delta || 0)
    //             setValue(`${PartCostFields}.${index}.DeltaSign`, item?.DeltaSign || { label: '', value: '' })
    //             setValue(`${PartCostFields}.${index}.SOBPercentage`, item?.SOBPercentage || 0)
    //             setValue(`${PartCostFields}.${index}.NetCost`, checkForDecimalAndNull(item?.NetCost || 0, initialConfiguration?.NoOfDecimalForPrice))
    //         });

    //         // Calculate weighted cost based on selected BOPs
    //         calculateSelectedBOPWeightedCost();
    //     }
    // }, [selectedBOPItems]);

    const calculateSelectedBOPWeightedCost = () => {
        let totalCost = 0;
        selectedBOPItems.forEach(item => {
            totalCost += Number(item.NetBoughtOutPartCost || 0) * Number(item.SOBPercentage || 0) / 100;
        });

        setWeightedCost(totalCost);
    };

    /**
      * @method toggleDrawer
      * @description TOGGLE DRAWER
      */
    const toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props?.closeDrawer('')
    };

    const netCostCalculator = (gridIndex, currentGrid = []) => {
        // TAKING OBJECT FROM WHOLE ARRAY LIST USING INDEX ON WHICH USER IS EDITING
        let editedObject;

        if (isBOPView) {
            editedObject = selectedBOPItems[gridIndex];
            if (!editedObject) return;
        } else {
            editedObject = gridData[gridIndex];
        }

        // GET RUN TIME EDITED VALUES FROM INPUT FIELD
        if (costData?.CostingTypeId === WACTypeId) {
            editedObject = currentGrid[gridIndex]
            editedObject.SOBPercentage = getValues(`${PartCostFields}.${gridIndex}.SOBPercentage`)
        } else {
            editedObject.SOBPercentage = getValues(`${PartCostFields}.${gridIndex}.SOBPercentage`)
            editedObject.DeltaValue = getValues(`${PartCostFields}.${gridIndex}.DeltaValue`)
            editedObject.DeltaSign = getValues(`${PartCostFields}.${gridIndex}.DeltaSign`)
            let arr;
            if (isBOPView) {
                const updatedItems = [...selectedBOPItems];
                updatedItems[gridIndex] = editedObject;
                arr = updatedItems;
            } else {
                arr = Object.assign([...gridData], { [gridIndex]: editedObject });
            }

            let sum = calcTotalSOBPercent(arr)
            if (sum > 100) {
                Toaster.warning('Total SOB Percent should not be greater than 100');
                setValue(`${PartCostFields}.${gridIndex}.SOBPercentage`, 0)
                editedObject.SOBPercentage = 0
            }

            // RESPECTIVE CALCULATION FOR + and - DELTA SIGN
            if (editedObject.DeltaSign?.label === '+') {
                let baseValue = isBOPView ? editedObject.NetLandedCost : editedObject.SettledPrice
                let netCostLocalCurrency = percentageOfNumber(checkForNull(baseValue) + checkForNull(editedObject.DeltaValue || editedObject.Delta), checkForNull(editedObject.SOBPercentage))
                editedObject.NetCost = netCostLocalCurrency

                if (!isBOPView) {
                    netCostLocalCurrency = percentageOfNumber(checkForNull(editedObject.SettledPriceConversion) + checkForNull(editedObject.DeltaValue), checkForNull(editedObject.SOBPercentage))
                    editedObject.NetCost = netCostLocalCurrency

                    netCostLocalCurrency = percentageOfNumber(checkForNull(editedObject.SettledPriceLocalConversion) + checkForNull(editedObject.DeltaValue), checkForNull(editedObject.SOBPercentage))
                    editedObject.NetCost = netCostLocalCurrency
                }

                setValue(`${PartCostFields}.${gridIndex}.NetCost`, checkForDecimalAndNull(netCostLocalCurrency, initialConfiguration?.NoOfDecimalForPrice))
            } else if (editedObject.DeltaSign?.label === '-') {
                let baseValue = isBOPView ? editedObject.NetLandedCost : editedObject.SettledPrice
                let netCostLocalCurrency = percentageOfNumber(checkForNull(baseValue) - checkForNull(editedObject.DeltaValue || editedObject.Delta), checkForNull(editedObject.SOBPercentage))
                editedObject.NetCost = netCostLocalCurrency

                if (!isBOPView) {
                    netCostLocalCurrency = percentageOfNumber(checkForNull(editedObject.SettledPriceConversion) - checkForNull(editedObject.DeltaValue), checkForNull(editedObject.SOBPercentage))
                    editedObject.NetCost = netCostLocalCurrency

                    netCostLocalCurrency = percentageOfNumber(checkForNull(editedObject.SettledPriceLocalConversion) - checkForNull(editedObject.DeltaValue), checkForNull(editedObject.SOBPercentage))
                    editedObject.NetCost = netCostLocalCurrency
                }
                setValue(`${PartCostFields}.${gridIndex}.NetCost`, checkForDecimalAndNull(netCostLocalCurrency, initialConfiguration?.NoOfDecimalForPrice))
            } else {
                // When no delta sign is selected, just calculate based on SOB percentage
                let baseValue = isBOPView ? editedObject.NetLandedCost : editedObject.SettledPrice
                let netCostLocalCurrency = percentageOfNumber(checkForNull(baseValue), checkForNull(editedObject.SOBPercentage))
                editedObject.NetCost = netCostLocalCurrency

                if (!isBOPView) {
                    netCostLocalCurrency = percentageOfNumber(checkForNull(editedObject.SettledPriceConversion), checkForNull(editedObject.SOBPercentage))
                    editedObject.NetCost = netCostLocalCurrency

                    netCostLocalCurrency = percentageOfNumber(checkForNull(editedObject.SettledPriceLocalConversion), checkForNull(editedObject.SOBPercentage))
                    editedObject.NetCost = netCostLocalCurrency
                }

                setValue(`${PartCostFields}.${gridIndex}.NetCost`, checkForDecimalAndNull(netCostLocalCurrency, initialConfiguration?.NoOfDecimalForPrice))
            }
        }

        // ASSIGN THE MANIPULAED OBJECT TO THE SAME INDEX IN THE ARRAY LIST
        if (isBOPView) {
            const updatedItems = [...selectedBOPItems];
            updatedItems[gridIndex] = editedObject;
            setSelectedBOPItems(updatedItems);
        } else {
            let gridTempArr = Object.assign([...gridData], { [gridIndex]: editedObject })
            setGridData(gridTempArr)
        }

        // CALCULATING TOTAL NET COST
        let weightedCostCalc = 0;
        if (isBOPView) {
            weightedCostCalc = selectedBOPItems && selectedBOPItems.reduce((accummlator, el) => {
                return checkForNull(accummlator) + checkForNull(el.NetCost)
            }, 0)
        } else {
            weightedCostCalc = gridData && gridData.reduce((accummlator, el) => {
                return checkForNull(accummlator) + checkForNull(el.NetCost)
            }, 0)
        }

        setWeightedCost(weightedCostCalc)
    }
    const calculateWeightedCost = (arrayTemp = []) => {
        let weightedCostCalc = 0
        weightedCostCalc = arrayTemp && arrayTemp.reduce((accummlator, el) => {
            return checkForNull(accummlator) + checkForNull(el.NetCost)
        }, 0)

        return weightedCostCalc
    }

    const handleDeltaSignChange = (value, index) => {
        if (value?.label === '-') {
            let baseValue = isBOPView ? selectedBOPItems[index]?.NetLandedCost : gridData[index]?.SettledPriceLocalConversion
            if (isBOPView && (checkForNull(baseValue) < checkForNull(getValues(`${PartCostFields}.${index}.DeltaValue`)))) {
                Toaster.warning('Delta value should be less than settled price')

                let tempGrid = isBOPView ? selectedBOPItems[index] : gridData[index]
                tempGrid.DeltaSign = value
                tempGrid.DeltaValue = 0
                tempGrid.NetCost = 0

                if (isBOPView) {
                    let arr = Object.assign([...selectedBOPItems], { [index]: tempGrid })

                    setWeightedCost(calculateWeightedCost(arr))
                    setTableDataList(arr)
                } else {
                    let arr = Object.assign([...gridData], { [index]: tempGrid })
                    setWeightedCost(calculateWeightedCost(arr))

                    setGridData(arr)
                }

                setTimeout(() => {
                    setValue(`${PartCostFields}.${index}.DeltaValue`, 0)
                    setValue(`${PartCostFields}.${index}.NetCost`, 0)
                    setValue(`${PartCostFields}.${index}.DeltaSign`, value)
                }, 200);
                return false
            } else if (!isBOPView && (checkForNull(baseValue) < checkForNull(getValues(`${PartCostFields}.${index}.DeltaValue`)))) {
                Toaster.warning('Delta value should be less than settled price')

                let tempGrid = gridData[index]
                tempGrid.DeltaSign = value
                tempGrid.DeltaValue = 0
                tempGrid.NetCost = 0
                let arr = Object.assign([...gridData], { [index]: tempGrid })

                setWeightedCost(calculateWeightedCost(arr))
                setGridData(arr)

                setTimeout(() => {
                    setValue(`${PartCostFields}.${index}.DeltaValue`, 0)
                    setValue(`${PartCostFields}.${index}.NetCost`, 0)
                    setValue(`${PartCostFields}.${index}.DeltaSign`, value)
                }, 200);
                return false
            }
        }
        setTimeout(() => {
            netCostCalculator(index)
        }, 300);
    }

    const handleSOBPercentage = (value, index) => {
        setTimeout(() => {
            netCostCalculator(index)
        }, 300);
    }
    const handleDeltaValue = (value, index) => {


        let baseValue = isBOPView ? selectedBOPItems[index]?.NetLandedCost : gridData[index]?.SettledPriceLocalConversion

        if (isBOPView && (selectedBOPItems[index]?.DeltaSign?.label === '-') && baseValue < value) {
            Toaster.warning('Delta value should be less than settled price')
            setTimeout(() => {
                setValue(`${PartCostFields}.${index}.DeltaValue`, 0)
                setValue(`${PartCostFields}.${index}.NetCost`, 0)
            }, 200);

            setWeightedCost(calculateWeightedCost(selectedBOPItems))
            return false
        } else if (!isBOPView && (gridData[index]?.DeltaSign?.label === '-') && baseValue < value) {
            Toaster.warning('Delta value should be less than settled price')
            setTimeout(() => {
                setValue(`${PartCostFields}.${index}.DeltaValue`, 0)
                setValue(`${PartCostFields}.${index}.NetCost`, 0)
            }, 200);

            setWeightedCost(calculateWeightedCost(gridData))
            return false
        }
        setTimeout(() => {
            netCostCalculator(index)
        }, 300);
    }

    const handleChangeCostingNumber = (value) => {
        setCostingNumberData(value)
    }

    const closeUserDetails = () => {
        // setIsViewRM(false)
        setIsOpen(false)
        // setUserId("")

    }

    const viewDetails = (item) => {
        if (item.value && Object.keys(item.value).length > 0) {
            dispatch(getSingleCostingDetails(item.value, (res) => {
                if (res.data.Data) {
                    let dataFromAPI = res.data.Data
                    const tempObj = formViewData(dataFromAPI)
                    setTechnologyName(tempObj[0].technology)
                    dispatch(setCostingViewDataForAssemblyTechnology(tempObj))
                    dispatch(setCostingViewData(tempObj))
                    dispatch(setIsMultiVendor(dataFromAPI?.IsMultiVendorCosting))
                    dispatch(setApplicabilityForChildParts(dataFromAPI?.CostingPartDetails?.IsIncludeChildPartsApplicabilityCost ?? false))


                }
            },
            ))
        }
        setIsOpen(true)
    }

    const deleteDetails = (item, index) => {


        if (isBOPView) {
            // For BOP view, filter by BoughtOutPartId instead of value
            let tempArr = selectedBOPItems.filter(e => e?.BoughtOutPartId !== item?.BoughtOutPartId)
            let weightedCostCalc = 0
            weightedCostCalc = tempArr && tempArr.reduce((accummlator, el) => {
                return checkForNull(accummlator) + checkForNull(el.NetCost)
            }, 0)

            setWeightedCost(weightedCostCalc)
            setSelectedBOPItems(tempArr)
        } else {
            // For regular part cost view
            let tempArr = gridData.filter(e => e?.value !== item?.value)
            let weightedCostCalc = 0
            weightedCostCalc = tempArr && tempArr.reduce((accummlator, el) => {
                return checkForNull(accummlator) + checkForNull(el.NetCost)
            }, 0)

            setWeightedCost(weightedCostCalc)
            setGridData(tempArr)
        }
        setValue(`${PartCostFields}.${index}.DeltaValue`, 0)
        setValue(`${PartCostFields}.${index}.DeltaSign`, 0)
        setValue(`${PartCostFields}.${index}.SOBPercentage`, 0)
        setValue(`${PartCostFields}.${index}.NetCost`, 0)
    }

    /**
      * @method calcTotalSOBPercent
      * @description TO CALCULATE TOTAL SOB PERCENTAGE 
      */
    const calcTotalSOBPercent = (grid) => {
        let NetProcessCost = 0
        NetProcessCost = grid && grid.reduce((accummlator, el, index) => {
            return checkForNull(accummlator) + checkForNull(el.SOBPercentage)
        }, 0)
        return NetProcessCost
    }

    const addGrid = () => {
        if (isBOPView) {
            setIsDrawerOpen(true)
        } else {
            if (Object.keys(costingNumberData).length > 0) {
                setGridData([...gridData, costingNumberData])
                let currentGrid = [...gridData, costingNumberData]
                setValue('CostingNumber', {})
                setCostingNumberData({})
                let indexForUpdate = _.findIndex([...gridData, costingNumberData], costingNumberData);
                setValue(`${PartCostFields}.${indexForUpdate}.DeltaValue`, 0)
                setValue(`${PartCostFields}.${indexForUpdate}.DeltaSign`, 0)
                setValue(`${PartCostFields}.${indexForUpdate}.SOBPercentage`, 0)
                setValue(`${PartCostFields}.${indexForUpdate}.NetCost`, 0)

                if (costData?.CostingTypeId === WACTypeId) {
                    currentGrid[indexForUpdate].NetCost = checkForNull(currentGrid[indexForUpdate].SettledPriceLocalConversion) * checkForNull(currentGrid[indexForUpdate].SOBPercentage / 100)
                    setGridData(currentGrid)
                    setTimeout(() => {
                        setValue(`${PartCostFields}.${indexForUpdate}.SOBPercentage`, currentGrid[indexForUpdate].SOBPercentage)
                        setValue(`${PartCostFields}.${indexForUpdate}.NetCost`, checkForDecimalAndNull(checkForNull(currentGrid[indexForUpdate].SettledPriceLocalConversion) * checkForNull(currentGrid[indexForUpdate].SOBPercentage / 100), initialConfiguration?.NoOfDecimalForPrice))
                        setTimeout(() => {
                            netCostCalculator(indexForUpdate, currentGrid)
                        }, 300);
                    }, 300);
                }
            } else {
                Toaster.warning('Please select Costing Number')
                return false
            }
        }
    }

    const renderListing = (value) => {
        let final = _.map(gridData, 'label')
        if (value === 'CostingNumber') {
            let temp = []
            costingForMultiTechnology && costingForMultiTechnology.map(item => {
                if (item?.Value === '0' || final.includes(item?.CostingNumber)) return false;
                temp.push({
                    label: item?.CostingNumber, value: item?.BaseCostingIdRef,
                    SettledPrice: item?.SettledPrice, SettledPriceConversion: item?.SettledPriceConversion,
                    SettledPriceLocalConversion: item?.SettledPriceLocalConversion, VendorCode: item?.VendorCode, VendorName: item?.VendorName, SOBPercentage: (item?.SOBPercentage) ? item.SOBPercentage : 0, CustomerCode: item?.CustomerCode, CustomerName: item?.CustomerName
                })
                return null;
            });
            return temp;
        }
    }

    const onSubmit = (values) => {
        // BOP validation checks
        if (isBOPView) {
            // Check if any BOP items are selected
            if (selectedBOPItems.length === 0) {
                Toaster.warning('Please select at least one BOP item');
                return false;
            }

            // Calculate total SOB percentage for selected items
            let totalSOB = 0;
            selectedBOPItems.forEach(item => {
                totalSOB += Number(item.SOBPercentage || 0);
            });

            // Check if total SOB is 100
            if (totalSOB !== 100) {
                Toaster.warning('Total SOB percentage for selected BOP items should be 100');
                return false;
            }
        }

        const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
        const overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
        const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
        const toolTabData = ToolTabData && ToolTabData[0]

        if (isBOPView || !(settledCostingDetails?.length === 0 && gridData?.length === 0)) {
            // For part cost case, validate SOB percentage
            if (!isBOPView) {
                let sum = calcTotalSOBPercent(gridData)
                if (gridData?.length !== 0 && checkForNull(sum) !== 100) {
                    Toaster.warning('Total SOB percent should be 100');
                    return false
                }
            }

            let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
            let costPerAssemblyTotalWithQuantity = 0

            const index = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.findIndex(object => {
                return props?.tabAssemblyIndividualPartDetail?.PartNumber === object?.PartNumber;
            });

            let editedChildPart = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails[index]


            editedChildPart.CostingPartDetails.NetPOPrice = weightedCost
            editedChildPart.CostingPartDetails.NetTotalRMBOPCC = weightedCost
            editedChildPart.CostingPartDetails.NetChildPartsCostWithQuantity = !isBOPView ? checkForNull(weightedCost) * checkForNull(editedChildPart?.CostingPartDetails?.Quantity) : null
            editedChildPart.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = isBOPView ? checkForNull(weightedCost) * checkForNull(editedChildPart?.CostingPartDetails?.Quantity) : null
            editedChildPart.CostingPartDetails.BoughtOutPartRate = isBOPView ? checkForNull(weightedCost) : null

            Object.assign([...tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails], { [index]: editedChildPart })


            // CALCULATING TOTAL COST PER ASSEMBLY (PART COST ONLY => RM)
            costPerAssemblyTotalWithQuantity = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.reduce((accummlator, el) => {
                return checkForNull(accummlator) + checkForNull(el?.CostingPartDetails?.NetChildPartsCostWithQuantity)
            }, 0)
            let bopCostperAssembly = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.reduce((accummlator, el) => {
                return checkForNull(accummlator) + checkForNull(el?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity)
            }, 0)
            // tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyWithoutQuantity = costPerAssemblyWithoutQuantity
            tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetBoughtOutPartCost = checkForNull(bopCostperAssembly)
            tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetChildPartsCost = checkForNull(costPerAssemblyTotalWithQuantity)
            tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice = checkForNull(costPerAssemblyTotalWithQuantity) +
                checkForNull(bopCostperAssembly) +
                (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) +
                    checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost))
            tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetTotalRMBOPCC = checkForNull(costPerAssemblyTotalWithQuantity) +
                checkForNull(bopCostperAssembly) +
                (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) +
                    checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost)) +
                checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetLabourCost) +
                checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.IndirectLaborCost) +
                checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.StaffCost)
            let tempArray = []
            if (!isBOPView) {
                gridData && gridData?.map((item) => {
                    let tempObject = {}
                    tempObject.BaseCostingId = item?.value
                    tempObject.SOBPercentage = item?.SOBPercentage
                    tempObject.Delta = item?.DeltaValue
                    tempObject.DeltaSign = item?.DeltaSign?.label
                    tempObject.NetCost = item?.NetCost
                    tempObject.BasicRate = item?.NetCost
                    tempObject.SettledPriceConversion = item?.SettledPriceConversion
                    tempObject.SettledPriceLocalConversion = item?.SettledPriceLocalConversion
                    tempArray.push(tempObject)
                })
            } else {
                selectedBOPItems.forEach(item => {
                    let tempObject = {}
                    tempObject.BoughtOutPartId = item?.BoughtOutPartId
                    tempObject.SOBPercentage = item?.SOBPercentage
                    tempObject.Delta = item?.DeltaValue
                    tempObject.DeltaSign = item?.DeltaSign?.label
                    tempObject.NetCost = item?.NetCost || (item.NetBoughtOutPartCost * item.SOBPercentage / 100)
                    tempObject.BasicRate = item?.NetCost || (item.NetBoughtOutPartCost * item.SOBPercentage / 100)
                    tempObject.SettledPriceConversion = item?.SettledPriceConversion
                    tempObject.SettledPriceLocalConversion = item?.SettledPriceLocalConversion
                    tempObject.Remark = item?.Remark
                    tempArray.push(tempObject)
                });
            }


            dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
            let obj = {
                "BaseCostingId": props?.tabAssemblyIndividualPartDetail?.CostingId,

                "BaseWeightedAverageCostingId": props?.tabAssemblyIndividualPartDetail?.CostingId,
                "NetPOPrice": weightedCost,
                "BasicRate": weightedCost,
                "CostingSettledDetails": tempArray,
                "LoggedInUserId": loggedInUserId()
            }

            dispatch(saveSettledCostingDetails(obj, res => { }))
            let totalOverheadPrice = OverheadProfitTabData && (checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.OverheadCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ProfitCost) +
                checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.RejectionCost) +
                checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ICCCost))
            let totalCost = (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
                checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
                checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
                checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
                checkForNull(totalOverheadPrice) +
                checkForNull(DiscountCostData?.AnyOtherCost) + checkForNull(DiscountCostData?.totalConditionCost)) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) -
                checkForNull(DiscountCostData?.HundiOrDiscountValue)

            let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray[0], totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost)
            dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
            dispatch(gridDataAdded(true))
        }

        props?.closeDrawer('')

        // SAVE API FOR PART COST
        // dispatch(saveEditPartCostDetails((res) => { }))
    }

    const tooltipText = (item) => {
        return (
            <div>
                <div>{`Settled Price (${initialConfiguration?.BaseCurrency}) : ${isBOPView ? (item?.NetLandedCost ? checkForDecimalAndNull(item?.NetLandedCost, initialConfiguration?.NoOfDecimalForPrice) : '-') : (item?.SettledPriceConversion ? checkForDecimalAndNull(item?.SettledPriceConversion, initialConfiguration?.NoOfDecimalForPrice) : '-')}`}</div>
                {/* <div>{`Settled Price (${currencySource?.label ? currencySource?.label : props?.viewCostingData?.[props?.index]?.CostingCurrency}) : ${item?.SettledPrice ? checkForDecimalAndNull(item?.SettledPrice, initialConfiguration?.NoOfDecimalForPrice) : '-'}`}</div> */}
            </div>
        )
    }
    const closeDrawer = (e = '', rowData = []) => {

        if (rowData.length > 0) {
            // Create a new array with the selected BOP items
            let tempArr = [...selectedBOPItems];

            // Process each new BOP item
            rowData.forEach(newItem => {
                // Check if this BOP item is already in the selectedBOPItems array
                const existingIndex = tempArr.findIndex(existing => existing?.BoughtOutPartId === newItem?.BoughtOutPartId);

                if (existingIndex === -1) {
                    const newBOPItem = {
                        ...newItem,
                        DeltaValue: 0,
                        DeltaSign: "",
                        SOBPercentage: 0,
                        NetCost: 0
                    };
                    tempArr.push(newBOPItem);
                }
            });

            // Update the selectedBOPItems state
            setSelectedBOPItems(tempArr);

        }
        setIsDrawerOpen(false)
    }
   

    // Add the onRemarkPopUpClick function
    const onRemarkPopUpClick = (index) => {
        setOpenRemarkPopUp(true)
        setRemarkIndex(index)
        // Set the remark state to the current remark of the selected BOP item
        setRemark(selectedBOPItems[index]?.Remark || '')
       
    }

    // Add the onRemarkPopUpClose function
    const onRemarkPopUpClose = (index, type = '') => {
        setOpenRemarkPopUp(false)
       
    }
    const onRemarkPopUpConfirm = () => {
       let editedBOPItem = selectedBOPItems[remarkIndex]
        editedBOPItem = {
            ...editedBOPItem,
            Remark: remark,
        }
        let gridTempArr = Object.assign([...selectedBOPItems], { [remarkIndex]: editedBOPItem })
        setSelectedBOPItems(gridTempArr)
        if (remark.length > 0) {
            Toaster.success('Remark saved successfully')
        }
        setOpenRemarkPopUp(false)
    }
    const handleRendered = () => {
        setTimeout(() => {
            const drawerEl = drawerRef?.current;
            const divEl = drawerEl?.querySelector('.MuiDrawer-paperAnchorBottom');
            divEl?.removeAttribute('tabindex');
        }, 500);

    };

    return (
        <div>
            <Drawer className={`${props?.costingSummary ? '' : 'bottom-drawer'}`}
                anchor={props?.anchor}
                open={props?.isOpen}
                BackdropProps={props?.costingSummary && { style: { opacity: 0 } }}
                ref={drawerRef}
                onRendered={handleRendered}
            >
                <div className="container-fluid">
                    <div className={'drawer-wrapper drawer-1500px master-summary-drawer'}>
                        {/* {isLoading && <LoaderCustom />} */}
                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{isBOPView ? `BOP Cost:` : `Part Cost:`}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}>
                                </div>
                            </Col>
                        </Row>

                        <form>
                            <Col md="12">
                                <Table className='table cr-brdr-main mb-0'>
                                    <thead>
                                        <tr className="cr-bg-tbl" width='100%'>
                                            <th>{props?.costingSummary ? 'Parent Assembly Costing Number' : 'Parent Assembly Number'}: {`${props?.costingSummary ? props?.tabAssemblyIndividualPartDetail?.CostingNumber : props?.tabAssemblyIndividualPartDetail?.AssemblyPartNumber}`}</th>
                                            <th>Part Number:  {`${props?.tabAssemblyIndividualPartDetail?.PartNumber}`}</th>
                                            <th>Part Name:  {`${props?.tabAssemblyIndividualPartDetail?.PartName}`}</th>
                                            {!isBOPView && <th>Part Effective Date: {`${props?.tabAssemblyIndividualPartDetail?.EffectiveDate ? DayTime(props?.tabAssemblyIndividualPartDetail?.EffectiveDate).format('DD-MM-YYYY') : '-'}`}</th>}
                                            <th colSpan={isBOPView ? 1 : 2}>Weighted Cost: {checkForDecimalAndNull(weightedCost, initialConfiguration?.NoOfDecimalForPrice)}</th>
                                        </tr>
                                    </thead>
                                </Table>
                                {!props?.costingSummary && (
                                    <div className='add-container'>
                                        {!isBOPView && (
                                            <SearchableSelectHookForm
                                                label={`Costing Number`}
                                                name={`CostingNumber`}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                options={renderListing("CostingNumber")}
                                                handleChange={(e) => handleChangeCostingNumber(e)}
                                                disabled={CostingViewMode ? true : false}
                                            />
                                        )}

                                        <button
                                            type="button"
                                            className={"user-btn "}
                                            onClick={() => addGrid()}
                                            title="Add"
                                            disabled={CostingViewMode ? true : false}
                                        >
                                            <div className={"plus "}></div>Add
                                        </button>
                                    </div>
                                )}
                                <Table className={`table cr-brdr-main mb-0 ${props?.costingSummary ? 'mt-2' : ''}`}>
                                    <thead>
                                        <tr >
                                            {/* {isBOPView && <th>Select</th>} */}
                                            {(costData?.CostingTypeId === VBCTypeId || props?.costingTypeId === VBCTypeId) &&
                                                <th>{vendorLabel} (Code)</th>
                                            }
                                            {(costData?.CostingTypeId === CBCTypeId || props?.costingTypeId === CBCTypeId) &&
                                                <th>Customer (Code)</th>
                                            }
                                            <th>Costing Number</th>
                                            <th>Settled Price ({costData?.LocalCurrency ? costData?.LocalCurrency : (props?.viewCostingData?.[props?.index]?.LocalCurrency ? props?.viewCostingData?.[props?.index]?.LocalCurrency : '-')})</th>
                                            {(costData?.CostingTypeId !== WACTypeId && props?.costingTypeId !== WACTypeId) && <th>Delta</th>}
                                            <th>SOB%</th>
                                            <th>Net Cost ({currencySource?.label ? currencySource?.label : '-'})</th>
                                            {isBOPView && <th>Effective Date</th>}
                                            <th>Action</th>
                                        </tr >
                                    </thead >
                                    <tbody className="part-cost-table">
                                        {isBOPView ? (
                                            selectedBOPItems && selectedBOPItems.length > 0 ? (
                                                selectedBOPItems.map((item, index) => (
                                                    <tr key={index}>
                                                        {(costData?.CostingTypeId === VBCTypeId || props?.costingTypeId === VBCTypeId) &&
                                                            <td>{`${item?.Vendor || '-'}`}</td>
                                                        }
                                                        {(costData?.CostingTypeId === CBCTypeId || props?.costingTypeId === CBCTypeId) &&
                                                            <td>{`${item.CustomerName || '-'} (${item.CustomerCode || '-'})`}</td>
                                                        }
                                                        <td>{item.BoughtOutPartNumber || '-'}</td>
                                                        <td>{item?.NetLandedCost ? checkForDecimalAndNull(item?.NetLandedCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}{item?.NetLandedCost && <span><TooltipCustom customClass="float-unset" tooltipClass="process-quatity-tooltip" id={`settled-price-${index}`} tooltipText={() => tooltipText(item)} /></span>}</td>

                                                        {
                                                            (costData?.CostingTypeId !== WACTypeId && props?.costingTypeId !== WACTypeId) && <td >
                                                                <div className='delta-warpper'>
                                                                    <SearchableSelectHookForm
                                                                        name={`${PartCostFields}.${index}.DeltaSign`}
                                                                        placeholder={"Select"}
                                                                        Controller={Controller}
                                                                        control={control}
                                                                        // rules={{ required: true }}
                                                                        register={register}
                                                                        customClassName="w-auto"
                                                                        options={optionsForDelta}
                                                                        mandatory={true}
                                                                        handleChange={(e) => handleDeltaSignChange(e, index)}
                                                                        disabled={(CostingViewMode || props?.costingSummary) ? true : false}
                                                                    />

                                                                    <NumberFieldHookForm
                                                                        name={`${PartCostFields}.${index}.DeltaValue`}
                                                                        Controller={Controller}
                                                                        control={control}
                                                                        register={register}
                                                                        mandatory={false}
                                                                        rules={{
                                                                            required: false,
                                                                            validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                                            pattern: {
                                                                                value: /^\d*\.?\d*$/,
                                                                                message: 'Invalid Number.'
                                                                            },
                                                                        }}
                                                                        handleChange={(e) => handleDeltaValue(e.target.value, index)}
                                                                        defaultValue={''}
                                                                        className=""
                                                                        customClassName={'withBorder'}
                                                                        disabled={(CostingViewMode || props?.costingSummary) ? true : false}
                                                                        errors={errors?.PartCostFields && errors?.PartCostFields[index]?.DeltaValue}
                                                                    />
                                                                </div>
                                                            </td>
                                                        }
                                                        <td>
                                                            <NumberFieldHookForm
                                                                name={`${PartCostFields}.${index}.SOBPercentage`}
                                                                Controller={Controller}
                                                                control={control}
                                                                register={register}
                                                                mandatory={false}
                                                                rules={{
                                                                    required: false,
                                                                    pattern: {
                                                                        value: /^\d*\.?\d*$/,
                                                                        message: 'Invalid Number.'
                                                                    },
                                                                    max: {
                                                                        value: 100,
                                                                        message: 'Percentage cannot be greater than 100'
                                                                    },
                                                                }}
                                                                handleChange={(e) => {
                                                                    // Update the selectedBOPItems state
                                                                    const updatedItems = [...selectedBOPItems];
                                                                    updatedItems[index] = { ...updatedItems[index], SOBPercentage: e.target.value };
                                                                    setSelectedBOPItems(updatedItems);
                                                                    handleSOBPercentage(e.target.value, index);
                                                                }}
                                                                defaultValue={''}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                disabled={(CostingViewMode || props?.costingSummary || costData?.CostingTypeId === WACTypeId || props?.costingTypeId === WACTypeId) ? true : false}
                                                            />
                                                        </td>
                                                        <td >
                                                            <NumberFieldHookForm
                                                                name={`${PartCostFields}.${index}.NetCost`}
                                                                Controller={Controller}
                                                                control={control}
                                                                register={register}
                                                                mandatory={false}
                                                                rules={{
                                                                    required: false,
                                                                    pattern: {
                                                                        value: /^\d*\.?\d*$/,
                                                                        message: 'Invalid Number.'
                                                                    },
                                                                }}
                                                                defaultValue={''}
                                                                className=""
                                                                disabled={true}
                                                                customClassName={'withBorder'}
                                                            />
                                                        </td>
                                                        <td>{item?.EffectiveDate ? DayTime(item?.EffectiveDate).format('DD-MM-YYYY') : '-'}</td>
                                                        <td >
                                                            <div className='action-btn-wrapper'>
                                                                {/* <button
                                                                type="button"
                                                                className={'View mr-2 align-middle'}
                                                                onClick={() => viewDetails(item)}
                                                            >
                                                            </button>For BOP, temporarily hide the View button. BOP master drawer will open when the View button is clicked */}
                                                                <button
                                                                    type="button"
                                                                    className={'Delete mr-2 align-middle'}
                                                                    onClick={() => deleteDetails(item, index)}
                                                                    disabled={(CostingViewMode || props?.costingSummary) ? true : false}
                                                                >
                                                                </button>
                                                                {/* <textarea name={`${PartCostFields}.${index}`} /> */}
                                                                <button id={`bopAssembly_popUpTriggers${index}`} title="Remark" className="Comment-box" type={'button'} onClick={() => onRemarkPopUpClick(index)} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={8}>
                                                        <NoContentFound title={EMPTY_DATA} />
                                                    </td>
                                                </tr>
                                            )
                                        ) : (
                                            gridData && gridData.map((item, index) => {
                                                return (
                                                    <>
                                                        <tr key={index} >
                                                            {(costData?.CostingTypeId === VBCTypeId || props?.costingTypeId === VBCTypeId) &&
                                                                <td>{`${item?.VendorName} (${item?.VendorCode})`}</td>
                                                            }
                                                            {(costData?.CostingTypeId === CBCTypeId || props?.costingTypeId === CBCTypeId) &&
                                                                <td>{`${item.CustomerName} (${item.CustomerCode})`}</td>
                                                            }
                                                            <td>{item?.label}</td>
                                                            <td>{item?.SettledPriceLocalConversion ? checkForDecimalAndNull(item?.SettledPriceLocalConversion, initialConfiguration?.NoOfDecimalForPrice) : '-'}{item?.SettledPriceLocalConversion && <span><TooltipCustom customClass="float-unset" tooltipClass="process-quatity-tooltip" id={`settled-price`} tooltipText={() => tooltipText(item)} /></span>}</td>

                                                            {
                                                                (costData?.CostingTypeId !== WACTypeId && props?.costingTypeId !== WACTypeId) && <td >
                                                                    <div className='delta-warpper'>
                                                                        <SearchableSelectHookForm
                                                                            name={`${PartCostFields}.${index}.DeltaSign`}
                                                                            placeholder={"Select"}
                                                                            Controller={Controller}
                                                                            control={control}
                                                                            // rules={{ required: true }}
                                                                            register={register}
                                                                            customClassName="w-auto"
                                                                            options={optionsForDelta}
                                                                            mandatory={true}
                                                                            handleChange={(e) => handleDeltaSignChange(e, index)}
                                                                            disabled={(CostingViewMode || props?.costingSummary) ? true : false}
                                                                        />

                                                                        <NumberFieldHookForm
                                                                            name={`${PartCostFields}.${index}.DeltaValue`}
                                                                            Controller={Controller}
                                                                            control={control}
                                                                            register={register}
                                                                            mandatory={false}
                                                                            rules={{
                                                                                required: false,
                                                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                                                pattern: {
                                                                                    value: /^\d*\.?\d*$/,
                                                                                    message: 'Invalid Number.'
                                                                                },
                                                                            }}
                                                                            handleChange={(e) => handleDeltaValue(e.target.value, index)}
                                                                            defaultValue={''}
                                                                            className=""
                                                                            customClassName={'withBorder'}
                                                                            disabled={(CostingViewMode || props?.costingSummary) ? true : false}
                                                                            errors={errors?.PartCostFields && errors?.PartCostFields[index]?.DeltaValue}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            }
                                                            <td>
                                                                <NumberFieldHookForm
                                                                    name={`${PartCostFields}.${index}.SOBPercentage`}
                                                                    Controller={Controller}
                                                                    control={control}
                                                                    register={register}
                                                                    mandatory={false}
                                                                    rules={{
                                                                        required: false,
                                                                        pattern: {
                                                                            value: /^\d*\.?\d*$/,
                                                                            message: 'Invalid Number.'
                                                                        },
                                                                        max: {
                                                                            value: 100,
                                                                            message: 'Percentage cannot be greater than 100'
                                                                        },
                                                                    }}
                                                                    handleChange={(e) => handleSOBPercentage(e.target.value, index)}
                                                                    defaultValue={''}
                                                                    className=""
                                                                    customClassName={'withBorder'}
                                                                    disabled={(CostingViewMode || props?.costingSummary || costData?.CostingTypeId === WACTypeId || props?.costingTypeId === WACTypeId) ? true : false}
                                                                />
                                                            </td>
                                                            <td >
                                                                <NumberFieldHookForm
                                                                    name={`${PartCostFields}.${index}.NetCost`}
                                                                    Controller={Controller}
                                                                    control={control}
                                                                    register={register}
                                                                    mandatory={false}
                                                                    rules={{
                                                                        required: false,
                                                                        pattern: {
                                                                            value: /^\d*\.?\d*$/,
                                                                            message: 'Invalid Number.'
                                                                        },
                                                                    }}
                                                                    defaultValue={''}
                                                                    className=""
                                                                    disabled={true}
                                                                    customClassName={'withBorder'}
                                                                />
                                                            </td>
                                                            <td >
                                                                <button
                                                                    type="button"
                                                                    className={'View mr-2 align-middle'}
                                                                    onClick={() => viewDetails(item)}
                                                                >
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={'Delete mr-2 align-middle'}
                                                                    onClick={() => deleteDetails(item, index)}
                                                                    disabled={(CostingViewMode || props?.costingSummary) ? true : false}
                                                                >
                                                                </button>
                                                            </td>
                                                        </tr >
                                                    </>
                                                )
                                            })
                                        )}
                                        {
                                            !isBOPView && gridData && gridData.length === 0 && <tr>
                                                <td colSpan={8}>
                                                    <NoContentFound title={EMPTY_DATA} />
                                                </td>
                                            </tr>
                                        }
                                    </tbody >
                                </Table >
                            </Col >
                        </form >
                        {!props?.costingSummary && <Row className="mx-0 mb-3" >
                            <Col align="right">
                                <button
                                    type={'submit'}
                                    className="submit-button save-btn"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={CostingViewMode ? true : false}
                                >
                                    <div className={"save-icon"}></div>
                                    {'SAVE'}
                                </button>
                            </Col>
                        </Row >}
                    </div >
                </div >

            </Drawer >
            {
                isOpen &&
                <CostingDetailSimulationDrawer
                    isOpen={isOpen}
                    closeDrawer={closeUserDetails}
                    anchor={"right"}
                    isReport={isOpen}
                    //   selectedRowData={selectedRowData}
                    isSimulation={false}
                    simulationDrawer={false}
                    fromCostingSummary={props?.costingSummary}
                    selectedTechnology={technologyName}
                    isFromAssemblyTechnology={true}
                />
            }
            {isDrawerOpen && <AddBOP
                isOpen={isDrawerOpen}
                closeDrawer={closeDrawer}
                isEditFlag={false}
                ID={''}
                anchor={'right'}
                Ids={selectedBOPItems?.map(item => item?.BoughtOutPartId) || []}
                tableDataList={tableDataList}
                isBopEdit={props?.isBopEdit}
                selectedBOPItems={selectedBOPItems}
                isOpenFromAssemblyTechnology={true}
                boughtOutPartChildId={props?.boughtOutPartChildId}
            />}

            {openRemarkPopUp && <PopupMsgWrapper isOpen={openRemarkPopUp} closePopUp={onRemarkPopUpClose} confirmPopup={onRemarkPopUpConfirm} message={'Remark'} header={'Remark'} isInputField={true} defaultValue={remark} setInputData={setRemark} isDisabled={props?.costingSummary || CostingViewMode} maxLength={REMARKMAXLENGTH} />}
        </div >
    );
}

export default EditPartCost;
