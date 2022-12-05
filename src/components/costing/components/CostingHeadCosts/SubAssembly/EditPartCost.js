import React, { useContext, useEffect, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { checkForDecimalAndNull, checkForNull, formViewData, percentageOfNumber } from '../../../../../helper';
import { ListForPartCost, optionsForDelta } from '../../../../../config/masterData';
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import Toaster from '../../../../common/Toaster';
import { getCostingForMultiTechnology, getEditPartCostDetails, getSettledCostingDetails, saveSettledCostingDetails, setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../../actions/SubAssembly';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { formatMultiTechnologyUpdate } from '../../../CostingUtil';
import _ from 'lodash';
import NoContentFound from '../../../../common/NoContentFound';
import { getSingleCostingDetails, gridDataAdded, setCostingViewData } from '../../../actions/Costing';
import CostingDetailSimulationDrawer from '../../../../simulation/components/CostingDetailSimulationDrawer';
import { ViewCostingContext } from '../../CostingDetails';

function EditPartCost(props) {

    const [gridData, setGridData] = useState([])
    const { settledCostingDetails } = useSelector(state => state.subAssembly)
    const [weightedCost, setWeightedCost] = useState(0)
    const [costingNumberData, setCostingNumberData] = useState({})
    const [isOpen, setIsOpen] = useState(false)
    const CostingViewMode = useContext(ViewCostingContext);

    const dispatch = useDispatch()

    const PartCostFields = 'PartCostFields';
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
    const { costingForMultiTechnology } = useSelector(state => state.subAssembly)
    const costData = useContext(costingInfoContext);
    const { ToolTabData, ToolsDataList, ComponentItemDiscountData, OverHeadAndProfitTabData, SurfaceTabData, RMCCTabData, OverheadProfitTabData, DiscountCostData, PackageAndFreightTabData, checkIsToolTabChange, getAssemBOPCharge, CostingEffectiveDate } = useSelector(state => state.costing)


    const { register, handleSubmit, control, setValue, getValues } = useForm({
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
        let tempArray = []
        settledCostingDetails?.CostingWeightedAverageSettledDetails && settledCostingDetails?.CostingWeightedAverageSettledDetails.map((item, index) => {
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
            tempArray.push(tempObject)
            setValue(`${PartCostFields}.${index}.DeltaSign`, { label: item?.DeltaSign, value: item?.DeltaSign })
        })
        setWeightedCost(settledCostingDetails?.NetPOPrice)
        setGridData(tempArray)
    }, [settledCostingDetails])

    useEffect(() => {
        // GET DATA FOR EDIT DRAWER
        let obj = {
            partId: props?.tabAssemblyIndividualPartDetail?.PartId,
            plantId: costData?.DestinationPlantId,
            costingTypeId: costData?.CostingTypeId
        }

        !props.costingSummary && dispatch(getCostingForMultiTechnology(obj, res => { }))
        dispatch(getSettledCostingDetails(props?.tabAssemblyIndividualPartDetail?.CostingId, res => { }))
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
        props.closeDrawer('')
    };

    const netCostCalculator = (gridIndex) => {

        // TAKING OBJECT FROM WHOLE ARRAY LIST USING INDEX ON WHICH USER IS EDITING
        let editedObject = gridData[gridIndex]
        let weightedCostCalc = 0
        let netCost = 0

        // GET RUN TIME EDITED VALUES FROM INPUT FIELD
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

        // ASSIGN THE MANIPULAED OBJECT TO THE SAME INDEX IN THE ARRAY LIST
        let gridTempArr = Object.assign([...gridData], { [gridIndex]: editedObject })

        // CALCULATING TOTAL NET COST
        weightedCostCalc = gridTempArr && gridTempArr.reduce((accummlator, el) => {
            return checkForNull(accummlator) + checkForNull(el.NetCost)
        }, 0)

        setWeightedCost(weightedCostCalc)
        setGridData(gridTempArr)
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
                    dispatch(setCostingViewData(tempObj))
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
            setValue('CostingNumber', {})
            setCostingNumberData({})
            let indexForUpdate = _.findIndex([...gridData, costingNumberData], costingNumberData);

            setValue(`${PartCostFields}.${indexForUpdate}.DeltaValue`, 0)
            setValue(`${PartCostFields}.${indexForUpdate}.DeltaSign`, 0)
            setValue(`${PartCostFields}.${indexForUpdate}.SOBPercentage`, 0)
            setValue(`${PartCostFields}.${indexForUpdate}.NetCost`, 0)
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
                    SettledPrice: item?.SettledPrice, VendorCode: item?.VendorCode, VendorName: item?.VendorName
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
                tempArray.push(tempObject)
            })

            dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
            let obj = {
                "BaseWeightedAverageCostingId": props?.tabAssemblyIndividualPartDetail?.CostingId,
                "NetPOPrice": weightedCost,
                "CostingSettledDetails": tempArray
            }
            dispatch(saveSettledCostingDetails(obj, res => { }))

            let totalCost = (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
                checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
                checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
                checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
                checkForNull(OverHeadAndProfitTabData && OverHeadAndProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
                checkForNull(DiscountCostData?.AnyOtherCost)) -
                checkForNull(DiscountCostData?.HundiOrDiscountValue)

            let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray[0], totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate)
            dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
            dispatch(gridDataAdded(true))
        }
        props.closeDrawer('')

        // SAVE API FOR PART COST
        // dispatch(saveEditPartCostDetails((res) => { }))
    }

    return (
        <div>
            <Drawer className={`${props.costingSummary ? '' : 'bottom-drawer'}`}
                anchor={props.anchor}
                open={props.isOpen}>
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
                                            <th>Parent Assembly Number: {`${props?.costingSummary ? props?.tabAssemblyIndividualPartDetail?.CostingNumber : props?.tabAssemblyIndividualPartDetail?.AssemblyPartNumber}`}</th>
                                            <th>Part Number:  {`${props?.tabAssemblyIndividualPartDetail?.PartNumber}`}</th>
                                            <th>Part Name:  {`${props?.tabAssemblyIndividualPartDetail?.PartName}`}</th>
                                            <th colSpan={2}>Weighted Cost: {checkForDecimalAndNull(weightedCost, initialConfiguration.NoOfDecimalForPrice)}</th>
                                        </tr>
                                    </thead>
                                </Table>
                                {!props.costingSummary && <div className='add-container'>
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
                                <Table className={`table cr-brdr-main mb-0 rmcc-main-headings ${props.costingSummary ? 'mt-2' : ''}`}>
                                    <thead>
                                        <tr >
                                            <th>Vendor Name</th>
                                            <th>Costing Number</th>
                                            <th>Settled Price</th>
                                            <th>SOB%</th>
                                            <th>Delta</th>
                                            <th>Net Cost</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="part-cost-table">
                                        {gridData && gridData.map((item, index) => {
                                            return (
                                                <>
                                                    <tr key={index} >
                                                        <td>{item?.VendorName}</td>
                                                        <td>{item?.label}</td>
                                                        <td>{checkForDecimalAndNull(item?.SettledPrice, initialConfiguration.NoOfDecimalForPrice)}</td>
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
                                                                disabled={CostingViewMode || props.costingSummary ? true : false}
                                                            />
                                                        </td>
                                                        <td >
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
                                                                    disabled={CostingViewMode || props.costingSummary ? true : false}
                                                                />

                                                                <NumberFieldHookForm
                                                                    name={`${PartCostFields}.${index}.DeltaValue`}
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
                                                                    handleChange={(e) => handleDeltaValue(e.target.value, index)}
                                                                    defaultValue={''}
                                                                    className=""
                                                                    customClassName={'withBorder'}
                                                                    disabled={CostingViewMode || props.costingSummary ? true : false}
                                                                />
                                                            </div>
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
                                                                disabled={CostingViewMode || props.costingSummary ? true : false}
                                                            >
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </>
                                            )
                                        })
                                        }
                                        {gridData && gridData.length === 0 && <tr>
                                            <td colSpan={6}>
                                                <NoContentFound />
                                            </td>
                                        </tr>}
                                    </tbody>
                                </Table>
                            </Col>
                        </form>
                        {!props.costingSummary && <Row className="mx-0 mb-3" >
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
                />
            }
        </div >
    );
}

export default EditPartCost;