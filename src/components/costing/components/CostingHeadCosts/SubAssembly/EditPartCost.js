import React, { useContext, useEffect, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { checkForDecimalAndNull, checkForNull, percentageOfNumber } from '../../../../../helper';
import { ListForPartCost, optionsForDelta } from '../../../../../config/masterData';
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import Toaster from '../../../../common/Toaster';
import { getCostingForMultiTechnology, getEditPartCostDetails, getSettledCostingDetails, saveSettledCostingDetails, setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../../actions/SubAssembly';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { formatMultiTechnologyUpdate } from '../../../CostingUtil';
import _ from 'lodash';
import NoContentFound from '../../../../common/NoContentFound';

function EditPartCost(props) {

    const [gridData, setGridData] = useState([])
    const [weightedCost, setWeightedCost] = useState(0)
    const [costingNumberData, setCostingNumberData] = useState({})

    const dispatch = useDispatch()

    const PartCostFields = 'PartCostFields';
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
    const { costingForMultiTechnology } = useSelector(state => state.subAssembly)
    const { settledCostingDetails } = useSelector(state => state.subAssembly)
    const costData = useContext(costingInfoContext);


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
        settledCostingDetails && settledCostingDetails.map((item, index) => {
            let tempObject = {}
            tempObject.DeltaValue = item?.Delta
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
        setGridData(tempArray)
    }, [settledCostingDetails])

    useEffect(() => {
        // GET DATA FOR EDIT DRAWER
        let obj = {
            partId: props?.tabAssemblyIndividualPartDetail?.PartId,
            plantId: costData?.DestinationPlantId,
            costingTypeId: costData?.CostingTypeId
        }

        dispatch(getCostingForMultiTechnology(obj, res => { }))
        dispatch(getSettledCostingDetails(props?.tabAssemblyIndividualPartDetail?.CostingId, res => { }))
        // dispatch(getEditPartCostDetails(obj, res => { }))
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
            return false
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
        setTimeout(() => {
            netCostCalculator(index)
        }, 300);
    }

    const handleChangeCostingNumber = (value) => {
        setCostingNumberData(value)
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
        let differenceCosting = _.intersection(_.map(gridData, 'value'), _.map(costingForMultiTechnology, 'BaseCostingIdRef'))
        if (differenceCosting?.includes(costingNumberData?.value)) {
            Toaster.warning('Please select another Costing Number')
            setValue('CostingNumber', {})
            setCostingNumberData({})
            return false
        } else if (Object.keys(costingNumberData).length > 0) {
            setGridData([...gridData, costingNumberData])
            setValue('CostingNumber', {})
            setCostingNumberData({})
        } else {
            Toaster.warning('Please select Costing Number')
            return false
        }
    }

    const renderListing = (value) => {
        if (value === 'CostingNumber') {
            let temp = []
            costingForMultiTechnology && costingForMultiTechnology.map(item => {
                if (item?.Value === '0') return false;
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
        let sum = calcTotalSOBPercent(gridData)
        if (checkForNull(sum) !== 100) {
            Toaster.warning('Total SOB percent should be 100');
            return false
        }
        let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
        let costPerAssemblyTotal = 0

        const index = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.findIndex(object => {
            return props?.tabAssemblyIndividualPartDetail?.PartNumber === object?.PartNumber;
        });

        let editedChildPart = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails[index]

        editedChildPart.CostingPartDetails.CostPerPiece = weightedCost
        editedChildPart.CostingPartDetails.CostPerAssembly = checkForNull(weightedCost) * checkForNull(editedChildPart?.CostingPartDetails?.Quantity)

        Object.assign([...tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails], { [index]: editedChildPart })

        // CALCULATING TOTAL COST PER ASSEMBLY (PART COST ONLY => RM)
        costPerAssemblyTotal = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.reduce((accummlator, el) => {
            return checkForNull(accummlator) + checkForNull(el?.CostingPartDetails?.CostPerAssembly)
        }, 0)

        tempsubAssemblyTechnologyArray[0].CostingPartDetails.EditPartCost = costPerAssemblyTotal
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssembly = checkForNull(costPerAssemblyTotal) + checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyBOP) + (checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.ProcessCostValue) + checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.OperationCostValue))
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
        let tabData = subAssemblyTechnologyArray[0]
        // let request = formatMultiTechnologyUpdate(tabData, weightedCost)
        // dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))

        props.closeDrawer('')

        // SAVE API FOR PART COST
        // dispatch(saveEditPartCostDetails((res) => { }))
    }

    return (
        <div>
            <Drawer className="bottom-drawer"
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
                                            <th>Parent Assembly Number: {`${props?.tabAssemblyIndividualPartDetail?.AssemblyPartNumber}`}</th>
                                            <th>Part Number:  {`${props?.tabAssemblyIndividualPartDetail?.PartNumber}`}</th>
                                            <th>Part Name:  {`${props?.tabAssemblyIndividualPartDetail?.PartName}`}</th>
                                            <th colSpan={2}>Weighted Cost: {checkForDecimalAndNull(weightedCost, initialConfiguration.NoOfDecimalForPrice)}</th>
                                        </tr>
                                    </thead>
                                </Table>
                                <div className='add-container'>
                                    <SearchableSelectHookForm
                                        label={`Costing Number`}
                                        name={`CostingNumber`}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        options={renderListing("CostingNumber")}
                                        handleChange={(e) => handleChangeCostingNumber(e)}
                                    />

                                    <button
                                        type="button"
                                        className={"user-btn "}
                                        onClick={() => addGrid()}
                                        title="Add"
                                    >
                                        <div className={"plus "}></div>Add
                                    </button>
                                </div>
                                <Table className='table cr-brdr-main mb-0 rmcc-main-headings'>
                                    <thead>
                                        <tr >
                                            <th>Vendor Name</th>
                                            <th>Settled Price</th>
                                            <th>SOB%</th>
                                            <th>Delta</th>
                                            <th>Net Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="part-cost-table">
                                        {gridData && gridData.map((item, index) => {
                                            return (
                                                <>
                                                    <tr key={index} >
                                                        <td>{item?.VendorName}</td>
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
                        <Row className="mx-0 mb-3" >
                            <Col align="right">
                                <button
                                    type={'submit'}
                                    className="submit-button save-btn"
                                    onClick={handleSubmit(onSubmit)}
                                >
                                    <div className={"save-icon"}></div>
                                    {'SAVE'}
                                </button>
                            </Col>
                        </Row >
                    </div >
                </div >
            </Drawer >
        </div >
    );
}

export default EditPartCost;