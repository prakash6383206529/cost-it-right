import React, { useEffect, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { checkForDecimalAndNull, checkForNull, percentageOfNumber } from '../../../../../helper';
import { ListForPartCost, optionsForDelta } from '../../../../../config/masterData';
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import Toaster from '../../../../common/Toaster';
import { getEditPartCostDetails, saveEditPartCostDetails, setSubAssemblyTechnologyArray } from '../../../actions/SubAssembly';

function EditPartCost(props) {

    const [SOBPercentage, setSOBPercentage] = useState(0)
    const [DeltaSign, setDeltaSign] = useState('')
    const [DeltaValue, setDeltaValue] = useState(0)
    const [gridData, setGridData] = useState(ListForPartCost)
    const [weightedCost, setWeightedCost] = useState(0)
    const dispatch = useDispatch()

    const PartCostFields = 'PartCostFields';
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { subAssemblyTechnologyArray } = useSelector(state => state.SubAssembly)
    const { ToolTabData, ToolsDataList, ComponentItemDiscountData, OverHeadAndProfitTabData, SurfaceTabData, RMCCTabData, OverheadProfitTabData, DiscountCostData, PackageAndFreightTabData, checkIsToolTabChange, getAssemBOPCharge, CostingEffectiveDate } = useSelector(state => state.costing)
    const { settledCostingDetails } = useSelector(state => state.subAssembly)

    const { register, handleSubmit, control, setValue, getValues, formState: { errors },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        gridData && gridData.map((item, index) => {
            setValue(`${PartCostFields}.${index}.DeltaValue`, item.DeltaValue)
            setValue(`${PartCostFields}.${index}.DeltaSign`, item.DeltaSign)
            setValue(`${PartCostFields}.${index}.SOBPercentage`, item.SOBPercentage)
            setValue(`${PartCostFields}.${index}.NetCost`, checkForDecimalAndNull(item.NetCost, initialConfiguration.NoOfDecimalForPrice))
            setDeltaSign(item.DeltaSign)
        })

    }, [gridData])

    useEffect(() => {
        let obj = {}
        dispatch(getEditPartCostDetails(obj, res => { }))
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

        let sum = 0
        ListForPartCost && ListForPartCost.map((item, index) => {                                           //API
            sum = checkForNull(sum) + checkForNull(getValues(`${PartCostFields}.${index}.SOBPercentage`))
            return null
        })
        if (sum > 100) {
            Toaster.warning('Total SOB Percent should not be greater than 100');
            setValue(`${PartCostFields}.${gridIndex}.SOBPercentage`, 0)
            return false
        }

        let WeightedCost = 0
        ListForPartCost && ListForPartCost.map((item, index) => {

            let tempDeltaValue = getValues(`${PartCostFields}.${index}.DeltaValue`)
            let tempSOBPercentage = getValues(`${PartCostFields}.${index}.SOBPercentage`)
            let tempDeltaSign = getValues(`${PartCostFields}.${index}.DeltaSign`)
            if (Number(gridIndex) === Number(index)) {

                item.SOBPercentage = tempSOBPercentage
                item.DeltaValue = tempDeltaValue
                item.DeltaSign = tempDeltaSign
                if (tempDeltaSign?.label === '+') {

                    const temp = percentageOfNumber(Number(item.SettledPrice) + Number(tempDeltaValue), tempSOBPercentage)
                    item.NetCost = temp
                    setValue(`${PartCostFields}.${index}.NetCost`, checkForDecimalAndNull(temp, initialConfiguration.NoOfDecimalForPrice))

                } if (tempDeltaSign?.label === '-') {

                    const temp = percentageOfNumber(Number(item.SettledPrice) - Number(tempDeltaValue), tempSOBPercentage)
                    item.NetCost = temp
                    setValue(`${PartCostFields}.${index}.NetCost`, checkForDecimalAndNull(temp, initialConfiguration.NoOfDecimalForPrice))
                }
            }
            WeightedCost = checkForNull(WeightedCost) + checkForNull(item.NetCost)
            return null
        })

        setWeightedCost(WeightedCost)
        setGridData(ListForPartCost)
    }

    const handleDeltaSignChange = (value, index) => {
        setDeltaSign(value)
        setTimeout(() => {

            netCostCalculator(index)
        }, 300);
    }

    const handleSOBPercentage = (value, index1) => {
        setSOBPercentage(value)
        setTimeout(() => {

            netCostCalculator(index1)
        }, 300);

    }

    const handleDeltaValue = (value, index) => {
        setDeltaValue(value)
        setTimeout(() => {

            netCostCalculator(index)
        }, 300);

    }

    const calcTotalSOBPercent = () => {
        let ProcessCostTotal = 0
        ProcessCostTotal = ListForPartCost && ListForPartCost.reduce((accummlator, el, index) => {
            return checkForNull(accummlator) + checkForNull(el.SOBPercentage)
        }, 0)
        return ProcessCostTotal
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
            // dispatch(saveSettledCostingDetails(obj, res => { }))

            let totalCost = (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
                checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
                checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
                checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
                checkForNull(OverHeadAndProfitTabData && OverHeadAndProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
                checkForNull(DiscountCostData?.AnyOtherCost)) -
                checkForNull(DiscountCostData?.HundiOrDiscountValue)

            // let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray[0], totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate)
            // dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
            // dispatch(gridDataAdded(true))
        }
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
                                    <h3>{`Part Cost`}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}>
                                </div>
                            </Col>
                        </Row>
                        <form
                        // onSubmit={handleSubmit(onSubmit)}
                        >

                            <Table className=''>

                                <thead>
                                    <tr className="cr-bg-tbl" width='100%'>
                                        <th>Parent Assembly Number: { }</th>
                                        <th>Part Number: { }</th>
                                        <th>Part Name: { }</th>
                                        <th>Weighted Cost: {checkForDecimalAndNull(weightedCost, initialConfiguration.NoOfDecimalForPrice)}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <br />
                                <tbody>
                                    <tr >
                                        <th>Vendor Name</th>
                                        <th>Settled Price</th>
                                        <th>SOB%</th>
                                        <th>Delta</th>
                                        <th>Net Cost</th>
                                    </tr>
                                    {gridData && gridData.map((item, index) => {

                                        return (
                                            <>

                                                <tr key={index} >
                                                    <td>{item.VendorName}</td>
                                                    <td>{checkForDecimalAndNull(item.SettledPrice, initialConfiguration.NoOfDecimalForPrice)}</td>
                                                    <td width={20}>
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
                                                            errors={errors.SOBPercentage}
                                                        />
                                                    </td>
                                                    <td >
                                                        <SearchableSelectHookForm
                                                            name={`${PartCostFields}.${index}.DeltaSign`}
                                                            placeholder={"Select"}
                                                            Controller={Controller}
                                                            control={control}
                                                            // rules={{ required: true }}
                                                            register={register}
                                                            // defaultValue={plant.length !== 0 ? plant : ''}
                                                            options={optionsForDelta}
                                                            mandatory={true}
                                                            handleChange={(e) => handleDeltaSignChange(e, index)}
                                                            errors={errors.DeltaSign}
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
                                                                // max: {
                                                                //     value: 100,
                                                                //     message: 'Percentage cannot be greater than 100'
                                                                // },
                                                            }}
                                                            handleChange={(e) => handleDeltaValue(e.target.value, index)}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                            errors={errors.DeltaValue}
                                                        />
                                                        {/* {checkForDecimalAndNull(item.Delta, initialConfiguration.NoOfDecimalForPrice)} */}
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
                                                                // max: {
                                                                //     value: 100,
                                                                //     message: 'Percentage cannot be greater than 100'
                                                                // },
                                                            }}
                                                            // handleChange={(e) => handleDeltaValue(e.target.value, index)}
                                                            defaultValue={''}
                                                            className=""
                                                            disabled={true}
                                                            customClassName={'withBorder'}
                                                            errors={errors.NetCost}
                                                        />
                                                        {/* {checkForDecimalAndNull(item.Delta, initialConfiguration.NoOfDecimalForPrice)} */}
                                                    </td>
                                                </tr>
                                            </>
                                        )
                                    })
                                    }
                                </tbody>
                            </Table>
                        </form>
                        {/* {loader && <LoaderCustom />} */}
                        < Row className="mx-0 mb-3" >
                            <Col align="right">
                                <button
                                    type={'submit'}
                                    className="submit-button mr5 save-btn"
                                    onClick={handleSubmit(onSubmit)}
                                >
                                    <div className={"save-icon"}></div>
                                    {'Save'}
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