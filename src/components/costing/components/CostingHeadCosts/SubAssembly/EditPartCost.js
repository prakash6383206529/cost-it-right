import React, { useContext, useEffect, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { checkForDecimalAndNull, checkForNull, formViewData, percentageOfNumber } from '../../../../../helper';
import { ListForPartCost, optionsForDelta } from '../../../../../config/masterData';
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import Toaster from '../../../../common/Toaster';
import { getCostingForMultiTechnology, getEditPartCostDetails, getSettledCostingDetails, getSettledSimulationCostingDetails, saveSettledCostingDetails, setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../../actions/SubAssembly';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { formatMultiTechnologyUpdate } from '../../../CostingUtil';
import _ from 'lodash';
import NoContentFound from '../../../../common/NoContentFound';
import { getSingleCostingDetails, gridDataAdded, setCostingViewData, setCostingViewDataForAssemblyTechnology } from '../../../actions/Costing';
import CostingDetailSimulationDrawer from '../../../../simulation/components/CostingDetailSimulationDrawer';
import { ViewCostingContext } from '../../CostingDetails';
import { AWAITING_APPROVAL_ID, CBCTypeId, EMPTY_DATA, PENDING_FOR_APPROVAL_ID, REJECTEDID, VBCTypeId, WACTypeId } from '../../../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';
import { number, checkWhiteSpaces, decimalNumberLimit6 } from "../../../../../helper/validation";
import { useLabels } from '../../../../../helper/core';
function EditPartCost(props) {

    const [gridData, setGridData] = useState([])
    const { settledCostingDetails, settledCostingDetailsView } = useSelector(state => state.subAssembly)
    const [weightedCost, setWeightedCost] = useState(0)
    const [costingNumberData, setCostingNumberData] = useState({})
    const [isOpen, setIsOpen] = useState(false)
    const CostingViewMode = useContext(ViewCostingContext);
    const [technologyName, setTechnologyName] = useState('')
    const dispatch = useDispatch()

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

    useEffect(() => {
        gridData && gridData.map((item, index) => {
            setValue(`${PartCostFields}.${index}.DeltaValue`, item?.DeltaValue)
            setValue(`${PartCostFields}.${index}.DeltaSign`, item?.DeltaSign)
            setValue(`${PartCostFields}.${index}.SOBPercentage`, item?.SOBPercentage)
            setValue(`${PartCostFields}.${index}.NetCost`, checkForDecimalAndNull(item?.NetCost, initialConfiguration.NoOfDecimalForPrice))
            return null
        })

    }, [gridData])

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
                tempObject.SettledPrice = item?.SettledPrice
                tempObject.VendorCode = item?.VendorCode
                tempObject.VendorName = item?.VendorName
                tempObject.label = item?.CostingNumber
                tempObject.value = item?.BaseCostingId
                tempObject.CustomerCode = item?.CustomerCode
                tempObject.CustomerName = item?.CustomerName
                tempArray.push(tempObject)
                setValue(`${PartCostFields}.${index}.DeltaSign`, { label: item?.DeltaSign, value: item?.DeltaSign })
            })
            setWeightedCost(temp?.NetPOPrice)
            setGridData(tempArray)
        }
    }, [settledCostingDetailsView])

    useEffect(() => {
        let temp = []
        if (!(CostingViewMode || props?.costingSummary)) {
            temp = settledCostingDetails

            let tempArray = []
            temp?.CostingWeightedAverageSettledDetails && temp?.CostingWeightedAverageSettledDetails.map((item, index) => {
                let tempObject = {}
                tempObject.DeltaValue = item?.Delta
                tempObject.DeltaSign = { label: item?.DeltaSign, value: item?.DeltaSign }
                tempObject.NetCost = item?.NetCost
                tempObject.SOBPercentage = item?.SOBPercentage
                tempObject.SettledPrice = item?.SettledPrice
                tempObject.VendorCode = item?.VendorCode
                tempObject.VendorName = item?.VendorName
                tempObject.label = item?.CostingNumber
                tempObject.value = item?.BaseCostingId
                tempObject.CustomerCode = item?.CustomerCode
                tempObject.CustomerName = item?.CustomerName
                tempArray.push(tempObject)
                setValue(`${PartCostFields}.${index}.DeltaSign`, { label: item?.DeltaSign, value: item?.DeltaSign })
            })
            setWeightedCost(temp?.NetPOPrice)
            setGridData(tempArray)
        }
    }, [settledCostingDetails])

    useEffect(() => {
        // GET DATA FOR EDIT DRAWER
        let obj = {
            partId: props?.tabAssemblyIndividualPartDetail?.PartId,
            plantId: costData?.DestinationPlantId,
            isRequestForWAC: (costData?.CostingTypeId === WACTypeId || props?.costingTypeId === WACTypeId) ? true : false,
            costingTypeId: (costData?.CostingTypeId === WACTypeId || props?.costingTypeId === WACTypeId) ? null : costData?.CostingTypeId,
            effectiveDate: CostingEffectiveDate
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
        let editedObject = gridData[gridIndex]
        let weightedCostCalc = 0
        let netCost = 0

        // GET RUN TIME EDITED VALUES FROM INPUT FIELD
        if (costData?.CostingTypeId === WACTypeId) {
            editedObject = currentGrid[gridIndex]
            editedObject.SOBPercentage = getValues(`${PartCostFields}.${gridIndex}.SOBPercentage`)
        } else {
            editedObject.SOBPercentage = getValues(`${PartCostFields}.${gridIndex}.SOBPercentage`)
            editedObject.DeltaValue = getValues(`${PartCostFields}.${gridIndex}.DeltaValue`)
            editedObject.DeltaSign = getValues(`${PartCostFields}.${gridIndex}.DeltaSign`)
            let arr = Object.assign([...gridData], { [gridIndex]: editedObject })
            let sum = calcTotalSOBPercent(arr)
            if (sum > 100) {
                Toaster.warning('Total SOB Percent should not be greater than 100');
                setValue(`${PartCostFields}.${gridIndex}.SOBPercentage`, 0)
                editedObject.SOBPercentage = 0
            }

            // RESPECTIVE CALCULATION FOR + and - DELTA SIGN
            if (editedObject.DeltaSign?.label === '+') {
                netCost = percentageOfNumber(checkForNull(editedObject.SettledPrice) + checkForNull(editedObject.DeltaValue), checkForNull(editedObject.SOBPercentage))
                editedObject.NetCost = netCost
                setValue(`${PartCostFields}.${gridIndex}.NetCost`, checkForDecimalAndNull(netCost, initialConfiguration.NoOfDecimalForPrice))
            } if (editedObject.DeltaSign?.label === '-') {
                netCost = percentageOfNumber(checkForNull(editedObject.SettledPrice) - checkForNull(editedObject.DeltaValue), checkForNull(editedObject.SOBPercentage))
                editedObject.NetCost = netCost
                setValue(`${PartCostFields}.${gridIndex}.NetCost`, checkForDecimalAndNull(netCost, initialConfiguration.NoOfDecimalForPrice))
            } if (editedObject.DeltaSign === undefined) {
                netCost = percentageOfNumber(checkForNull(editedObject.SettledPrice), checkForNull(editedObject.SOBPercentage))
                editedObject.NetCost = netCost
            }

        }

        // ASSIGN THE MANIPULAED OBJECT TO THE SAME INDEX IN THE ARRAY LIST
        let gridTempArr = Object.assign([...gridData], { [gridIndex]: editedObject })

        // CALCULATING TOTAL NET COST
        weightedCostCalc = gridTempArr && gridTempArr.reduce((accummlator, el) => {
            return checkForNull(accummlator) + checkForNull(el.NetCost)
        }, 0)

        setWeightedCost(weightedCostCalc)
        setGridData(gridTempArr)
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
            if (gridData && (checkForNull(gridData[index]?.SettledPrice) < checkForNull(gridData[index]?.DeltaValue))) {
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
        if (gridData && (gridData[index]?.DeltaSign?.label === '-') && gridData[index]?.SettledPrice < value) {

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
                }
            },
            ))
        }
        setIsOpen(true)
    }

    const deleteDetails = (item, index) => {
        let tempArr = gridData.filter(e => e?.value !== item?.value)
        let weightedCostCalc = 0
        weightedCostCalc = tempArr && tempArr.reduce((accummlator, el) => {
            return checkForNull(accummlator) + checkForNull(el.NetCost)
        }, 0)

        setWeightedCost(weightedCostCalc)
        setGridData(tempArr)
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
        let ProcessCostTotal = 0
        ProcessCostTotal = grid && grid.reduce((accummlator, el, index) => {
            return checkForNull(accummlator) + checkForNull(el.SOBPercentage)
        }, 0)
        return ProcessCostTotal
    }

    const addGrid = () => {
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
                currentGrid[indexForUpdate].NetCost = checkForNull(currentGrid[indexForUpdate].SettledPrice) * checkForNull(currentGrid[indexForUpdate].SOBPercentage / 100)
                setGridData(currentGrid)
                setTimeout(() => {
                    setValue(`${PartCostFields}.${indexForUpdate}.SOBPercentage`, currentGrid[indexForUpdate].SOBPercentage)
                    setValue(`${PartCostFields}.${indexForUpdate}.NetCost`, checkForDecimalAndNull(checkForNull(currentGrid[indexForUpdate].SettledPrice) * checkForNull(currentGrid[indexForUpdate].SOBPercentage / 100), initialConfiguration.NoOfDecimalForPrice))
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

    const renderListing = (value) => {
        let final = _.map(gridData, 'label')
        if (value === 'CostingNumber') {
            let temp = []
            costingForMultiTechnology && costingForMultiTechnology.map(item => {
                if (item?.Value === '0' || final.includes(item?.CostingNumber)) return false;
                temp.push({
                    label: item?.CostingNumber, value: item?.BaseCostingIdRef,
                    SettledPrice: item?.SettledPrice, VendorCode: item?.VendorCode, VendorName: item?.VendorName, SOBPercentage: (item?.SOBPercentage) ? item.SOBPercentage : 0, CustomerCode: item?.CustomerCode, CustomerName: item?.CustomerName
                })
                return null;
            });
            return temp;
        }
    }

    const onSubmit = (values) => {
        const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
        const overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
        const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
        const toolTabData = ToolTabData && ToolTabData[0]

        if (!(settledCostingDetails?.length === 0 && gridData?.length === 0)) {
            let sum = calcTotalSOBPercent(gridData)
            if (gridData?.length !== 0 && checkForNull(sum) !== 100) {
                Toaster.warning('Total SOB percent should be 100');
                return false
            }
            let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
            let costPerAssemblyTotalWithQuantity = 0

            const index = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.findIndex(object => {
                return props?.tabAssemblyIndividualPartDetail?.PartNumber === object?.PartNumber;
            });

            let editedChildPart = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails[index]

            editedChildPart.CostingPartDetails.NetPOPrice = weightedCost
            editedChildPart.CostingPartDetails.TotalCalculatedRMBOPCCCost = weightedCost
            editedChildPart.CostingPartDetails.NetChildPartsCostWithQuantity = checkForNull(weightedCost) * checkForNull(editedChildPart?.CostingPartDetails?.Quantity)

            Object.assign([...tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails], { [index]: editedChildPart })

            // CALCULATING TOTAL COST PER ASSEMBLY (PART COST ONLY => RM)
            costPerAssemblyTotalWithQuantity = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.reduce((accummlator, el) => {
                return checkForNull(accummlator) + checkForNull(el?.CostingPartDetails?.NetChildPartsCostWithQuantity)
            }, 0)
            // tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyWithoutQuantity = costPerAssemblyWithoutQuantity
            tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetChildPartsCost = costPerAssemblyTotalWithQuantity
            tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice = checkForNull(costPerAssemblyTotalWithQuantity) +
                checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalBoughtOutPartCost) +
                (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost) +
                    checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost))
            tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(costPerAssemblyTotalWithQuantity) +
                checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalBoughtOutPartCost) +
                (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost) +
                    checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost))
            let tempArray = []
            gridData && gridData?.map((item) => {
                let tempObject = {}
                tempObject.BaseCostingId = item?.value
                tempObject.SOBPercentage = item?.SOBPercentage
                tempObject.Delta = item?.DeltaValue
                tempObject.DeltaSign = item?.DeltaSign?.label
                tempObject.NetCost = item?.NetCost
                tempObject.BasicRate = item?.NetCost
                tempArray.push(tempObject)
            })

            dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
            let obj = {
                "BaseWeightedAverageCostingId": props?.tabAssemblyIndividualPartDetail?.CostingId,
                "NetPOPrice": weightedCost,
                "BasicRate": weightedCost,
                "CostingSettledDetails": tempArray
            }
            dispatch(saveSettledCostingDetails(obj, res => { }))
            let totalOverheadPrice = OverheadProfitTabData && (checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.OverheadCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ProfitCost) +
                checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.RejectionCost) +
                checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ICCCost))
            let totalCost = (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
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

    return (
        <div>
            <Drawer className={`${props?.costingSummary ? '' : 'bottom-drawer'}`}
                anchor={props?.anchor}
                open={props?.isOpen}
                BackdropProps={props?.costingSummary && { style: { opacity: 0 } }}>
                <div className="container-fluid">
                    <div className={'drawer-wrapper drawer-1500px master-summary-drawer'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{`Part Cost:`}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}>
                                </div>
                            </Col>
                        </Row>

                        <form>
                            <Col md="12">
                                <Table className='table cr-brdr-main mb-0 rmcc-main-headings'>
                                    <thead>
                                        <tr className="cr-bg-tbl" width='100%'>
                                            <th>{props?.costingSummary ? 'Parent Assembly Costing Number' : 'Parent Assembly Number'}: {`${props?.costingSummary ? props?.tabAssemblyIndividualPartDetail?.CostingNumber : props?.tabAssemblyIndividualPartDetail?.AssemblyPartNumber}`}</th>
                                            <th>Part Number:  {`${props?.tabAssemblyIndividualPartDetail?.PartNumber}`}</th>
                                            <th>Part Name:  {`${props?.tabAssemblyIndividualPartDetail?.PartName}`}</th>
                                            <th colSpan={2}>Weighted Cost: {checkForDecimalAndNull(weightedCost, initialConfiguration.NoOfDecimalForPrice)}</th>
                                        </tr>
                                    </thead>
                                </Table>
                                {!props?.costingSummary && <div className='add-container'>
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

                                    <button
                                        type="button"
                                        className={"user-btn "}
                                        onClick={() => addGrid()}
                                        title="Add"
                                        disabled={CostingViewMode ? true : false}
                                    >
                                        <div className={"plus "}></div>Add
                                    </button>
                                </div>}
                                <Table className={`table cr-brdr-main mb-0 rmcc-main-headings ${props?.costingSummary ? 'mt-2' : ''}`}>
                                    <thead>
                                        <tr >
                                            {(costData?.CostingTypeId === VBCTypeId || props?.costingTypeId === VBCTypeId) &&
                                                <th>{vendorLabel} (Code)</th>
                                            }
                                            {(costData?.CostingTypeId === CBCTypeId || props?.costingTypeId === CBCTypeId) &&
                                                <th>Customer (Code)</th>
                                            }
                                            <th>Costing Number</th>
                                            <th>Settled Price</th>
                                            {(costData?.CostingTypeId !== WACTypeId && props?.costingTypeId !== WACTypeId) && <th>Delta</th>}
                                            <th>SOB%</th>
                                            <th>Net Cost</th>
                                            <th>Action</th>
                                        </tr >
                                    </thead >
                                    <tbody className="part-cost-table">
                                        {gridData && gridData.map((item, index) => {
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
                                                        <td>{checkForDecimalAndNull(item?.SettledPrice, initialConfiguration.NoOfDecimalForPrice)}</td>

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
                                                                        disabled={CostingViewMode || props?.costingSummary ? true : false}
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
                                                                        disabled={CostingViewMode || props?.costingSummary ? true : false}
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
                                                                disabled={CostingViewMode || props?.costingSummary ? true : false}
                                                            >
                                                            </button>
                                                        </td>
                                                    </tr >
                                                </>
                                            )
                                        })
                                        }
                                        {
                                            gridData && gridData.length === 0 && <tr>
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
        </div >
    );
}

export default EditPartCost;