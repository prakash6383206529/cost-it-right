import React, { useContext, useEffect, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { checkForDecimalAndNull, checkForNull, percentageOfNumber } from '../../../../../helper';
import { ListForPartCost, optionsForDelta, tempObject } from '../../../../../config/masterData';
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import { setSubAssemblyTechnologyArray } from '../../../actions/SubAssembly.js';

function EditPartCost(props) {

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

    const [SOBPercentage, setSOBPercentage] = useState(0)
    const [DeltaSign, setDeltaSign] = useState('')
    const [DeltaValue, setDeltaValue] = useState(0)
    const [gridData, setGridData] = useState(ListForPartCost)
    const [weightedCost, setWeightedCost] = useState(0)
    const dispatch = useDispatch()

    const PartCostFields = 'PartCostFields';
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    const { register, handleSubmit, control, setValue, getValues, formState: { errors },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const onSubmit = (values) => {
        let changeTempObject = tempObject[0].CostingChildPartDetails
        let targetBOMLevel = props.tabAssemblyIndividualPartDetail.BOMLevel
        let targetPartNo = props.tabAssemblyIndividualPartDetail.PartNumber
        let targetAssemblyPartNumber = props.tabAssemblyIndividualPartDetail.AssemblyPartNumber
        let costPerPieceTotal = 0
        let costPerAssemblyTotal = 0
        changeTempObject && changeTempObject.map((item) => {

            if (targetBOMLevel == item.BOMLevel && targetPartNo == item.PartNumber && targetAssemblyPartNumber == item.AssemblyPartNumber) {
                item.CostingPartDetails.CostPerPiece = weightedCost
                item.CostingPartDetails.CostPerAssembly = Number(weightedCost) * Number(item.CostingPartDetails.QuantityForSubAssembly)
            }

            costPerPieceTotal = Number(costPerPieceTotal) + Number(item?.CostingPartDetails?.CostPerPiece)
            costPerAssemblyTotal = Number(costPerAssemblyTotal) + Number(item?.CostingPartDetails?.CostPerAssembly)

        })

        dispatch(setSubAssemblyTechnologyArray(changeTempObject))

        props.getCostPerPiece(weightedCost)
        props.closeDrawer('')
    }

    const netCostCalculator = (gridIndex) => {

        let WeightedCost = 0

        ListForPartCost && ListForPartCost.map((item, index) => {

            let tempDeltaValue = getValues(`PartCostFields.${index}.DeltaValue`)
            let tempSOBPercentage = getValues(`PartCostFields.${index}.SOBPercentage`)

            if (Number(gridIndex) === Number(index)) {

                if (getValues(`PartCostFields.${index}.DeltaSign`)?.label === '+') {

                    const temp = percentageOfNumber(Number(item.SettledPrice) + Number(tempDeltaValue), tempSOBPercentage)
                    item.NetCost = temp
                    setValue(`PartCostFields.${index}.NetCost`, temp)

                } if (getValues(`PartCostFields.${index}.DeltaSign`)?.label === '-') {

                    const temp = percentageOfNumber(Number(item.SettledPrice) - Number(tempDeltaValue), tempSOBPercentage)
                    item.NetCost = temp
                    setValue(`PartCostFields.${index}.NetCost`, temp)
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
                                        <th>Weighted Cost: {weightedCost}</th>
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
                                                            name={`PartCostFields.${index}.SOBPercentage`}
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
                                                    <td width="40%">
                                                        <SearchableSelectHookForm
                                                            name={`PartCostFields.${index}.DeltaSign`}
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
                                                            name={`PartCostFields.${index}.DeltaValue`}
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
                                                    <td width="40%">
                                                        <NumberFieldHookForm
                                                            name={`PartCostFields.${index}.NetCost`}
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