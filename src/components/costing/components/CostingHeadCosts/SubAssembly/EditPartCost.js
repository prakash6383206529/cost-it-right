import React, { useEffect, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { checkForDecimalAndNull, checkForNull, percentageOfNumber } from '../../../../../helper';
import { ListForPartCost, optionsForDelta } from '../../../../../config/masterData';
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import Toaster from '../../../../common/Toaster';
import { setSubAssemblyTechnologyArray } from '../../../actions/SubAssembly';

function EditPartCost(props) {

    const [SOBPercentage, setSOBPercentage] = useState(0)
    const [DeltaSign, setDeltaSign] = useState('')
    const [DeltaValue, setDeltaValue] = useState(0)
    const [gridData, setGridData] = useState(ListForPartCost)
    const [weightedCost, setWeightedCost] = useState(0)
    const dispatch = useDispatch()

    const PartCostFields = 'PartCostFields';
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)

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
        let sum = calcTotalSOBPercent()
        let tempObject = ListForPartCost[gridIndex]
        let tempDeltaValue = getValues(`${PartCostFields}.${gridIndex}.DeltaValue`)
        let tempSOBPercentage = getValues(`${PartCostFields}.${gridIndex}.SOBPercentage`)
        let tempDeltaSign = getValues(`${PartCostFields}.${gridIndex}.DeltaSign`)
        let weightedCostCalc = 0

        if (sum > 100) {
            Toaster.warning('Total SOB Percent should not be greater than 100');
            setValue(`${PartCostFields}.${gridIndex}.SOBPercentage`, 0)
            return false
        }

        tempObject.SOBPercentage = tempSOBPercentage
        tempObject.DeltaValue = tempDeltaValue
        tempObject.DeltaSign = tempDeltaSign

        if (tempDeltaSign?.label === '+') {
            const temp = percentageOfNumber(Number(tempObject.SettledPrice) + Number(tempDeltaValue), tempSOBPercentage)
            tempObject.NetCost = temp
            setValue(`${PartCostFields}.${gridIndex}.NetCost`, checkForDecimalAndNull(temp, initialConfiguration.NoOfDecimalForPrice))
        } if (tempDeltaSign?.label === '-') {
            const temp = percentageOfNumber(Number(tempObject.SettledPrice) - Number(tempDeltaValue), tempSOBPercentage)
            tempObject.NetCost = temp
            setValue(`${PartCostFields}.${gridIndex}.NetCost`, checkForDecimalAndNull(temp, initialConfiguration.NoOfDecimalForPrice))
        }
        let gridTempArr = Object.assign([...ListForPartCost], { [gridIndex]: tempObject })
        weightedCostCalc = gridTempArr && gridTempArr.reduce((accummlator, el) => {
            return checkForNull(accummlator) + checkForNull(el.NetCost)
        }, 0)
        setWeightedCost(weightedCostCalc)
        setGridData(gridTempArr)
    }

    const handleDeltaSignChange = (value, index) => {
        setDeltaSign(value)
        setTimeout(() => {

            netCostCalculator(index)
        }, 300);
    }

    const handleSOBPercentage = (value, index) => {
        setSOBPercentage(value)
        setTimeout(() => {

            netCostCalculator(index)
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
        let sum = calcTotalSOBPercent()
        if (sum !== 100) {
            Toaster.warning('Total SOB percent should be 100');
            return false
        }
        let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
        let changeTempObject = tempsubAssemblyTechnologyArray[0].CostingChildPartDetails
        let tempBOMLevel = props.tabAssemblyIndividualPartDetail.BOMLevel
        let tempPartNo = props.tabAssemblyIndividualPartDetail.PartNumber
        let tempAssemblyPartNumber = props.tabAssemblyIndividualPartDetail.AssemblyPartNumber
        let costPerPieceTotal = 0
        let costPerAssemblyTotal = 0
        let costPerAssemblyBOPTotal = 0

        changeTempObject && changeTempObject.map((item) => {
            if (tempBOMLevel === item.BOMLevel && tempPartNo === item.PartNumber && tempAssemblyPartNumber === item.AssemblyPartNumber) {
                item.CostingPartDetails.CostPerPiece = weightedCost
                item.CostingPartDetails.CostPerAssembly = checkForNull(weightedCost) * checkForNull(item.CostingPartDetails.QuantityForSubAssembly)
            }
            costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.CostPerPiece)
            costPerAssemblyTotal = checkForNull(costPerAssemblyTotal) + checkForNull(item?.CostingPartDetails?.CostPerAssembly)
            costPerAssemblyBOPTotal = checkForNull(costPerAssemblyBOPTotal) + checkForNull(item?.CostingPartDetails?.CostPerAssemblyBOP)
            return null
        })
        costPerAssemblyBOPTotal = checkForNull(costPerAssemblyBOPTotal) + checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingCharges)

        tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerPiece = costPerPieceTotal
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.EditPartCost = costPerAssemblyTotal
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssembly = checkForNull(costPerAssemblyTotal) + checkForNull(costPerAssemblyBOPTotal) + (checkForNull(tempsubAssemblyTechnologyArray[0].ProcessCostValue) + checkForNull(tempsubAssemblyTechnologyArray[0].OperationCostValue))
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssemblyBOP = checkForNull(costPerAssemblyBOPTotal)
        dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))

        props.getCostPerPiece(weightedCost)
        props.closeDrawer('')
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
                                </tbody>
                            </Table>
                        </form>
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