import React, { useEffect, useState } from 'react'
import { Col, Row } from 'reactstrap'
import { TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form'
import { NUMBERMAXLENGTH } from '../../../../../config/masterData'
import { checkForDecimalAndNull, checkForNull, checkWhiteSpaces, decimalNumberLimit6, number } from '../../../../../helper'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { setSurfaceData } from '../../../actions/Costing'
import _ from 'lodash';

const Hanger = ({ ViewMode, isSummary, viewCostingDataObj, setSurfaceData, Params, item }) => {
    const { register, control, formState: { errors }, setValue, getValues } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { SurfaceTabData } = useSelector(state => state.costing)
    let surfaceTabData = SurfaceTabData && SurfaceTabData[0]

    const dispatch = useDispatch()
    const [state, setState] = useState({
        showHanger: false
    })
    const { NoOfDecimalForInputOutput, NoOfDecimalForPrice } = useSelector(state => state.auth.initialConfiguration)
    useEffect(() => {
        const data = isSummary ? viewCostingDataObj?.CostingPartDetails : item?.CostingPartDetails

        setValue(`HangerFactor`, checkForDecimalAndNull(data?.HangerRate, NoOfDecimalForInputOutput))
        setValue(`NoOfPartsPerHanger`, checkForDecimalAndNull(data?.NumberOfPartsPerHanger, NoOfDecimalForInputOutput))
        setValue(`HangerCostPerPart`, checkForDecimalAndNull(data?.HangerCostPerPart, NoOfDecimalForPrice))
    }, [])

    const calculateHangerCost = debounce((hangerFactor, noOfPartsPerHanger) => {
        const hangerCost = checkForNull(hangerFactor) / checkForNull(noOfPartsPerHanger)
        setValue(`HangerCostPerPart`, checkForDecimalAndNull(hangerCost, NoOfDecimalForPrice))
        let obj = {
            HangerRate: hangerFactor,
            NumberOfPartsPerHanger: checkForNull(noOfPartsPerHanger),
            HangerCostPerPart: hangerCost
        }
        setSurfaceData({ Params, hangerObj: obj, type: 'Hanger' }, errors)
        // let tempArray = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))
        // 
        // let indexForUpdate = _.findIndex(tempArray, tempArrayItem => tempArrayItem.PartNumber === item.PartNumber && tempArrayItem.AssemblyPartNumber === item.AssemblyPartNumber);

        // let objectToUpdate = tempArray[indexForUpdate]
        // 
        // objectToUpdate.CostingPartDetails = { ...objectToUpdate.CostingPartDetails, ...obj }
        // // objectToUpdate.CostingPartDetails.HangerRate = hangerFactor
        // // objectToUpdate.CostingPartDetails.NumberOfPartsPerHanger = checkForNull(noOfPartsPerHanger)
        // // objectToUpdate.CostingPartDetails.HangerCostPerPart = hangerCost
        // 
        // tempArray = Object.assign([...tempArray], { [indexForUpdate]: objectToUpdate })
        // 
        // sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArray))
        // dispatch(setSurfaceData(surfaceTabData, () => { }))
    }, 300)
    return (
        <>
            <Row>
                <Col md="8"><div className="left-border">
                    {'Hanger Cost:'}
                </div></Col>
                <Col md="4" className="text-right">
                    <button id="Dashboard_Costing_Accordian" className="btn btn-small-primary-circle ml-1 " type="button" onClick={() => { setState({ ...state, showHanger: !state.showHanger }) }}>
                        {state.showHanger ? (
                            <i className="fa fa-minus" ></i>
                        ) : (
                            <i className="fa fa-plus"></i>
                        )}

                    </button>
                </Col>
            </Row>
            {state.showHanger && <Row>
                <Col md="4">
                    <TextFieldHookForm
                        label="Hanger Factor (Rate)"
                        name={`HangerFactor`}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                            maxLength: NUMBERMAXLENGTH
                        }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        handleChange={(e) => {
                            e.preventDefault()
                            calculateHangerCost(e.target.value, getValues(`NoOfPartsPerHanger`))
                        }}
                        errors={errors && errors.HangerFactor}
                        disabled={ViewMode}
                    />
                </Col>
                <Col md="4">
                    <TextFieldHookForm
                        label="No. of Parts per Hanger"
                        name={`NoOfPartsPerHanger`}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                            maxLength: NUMBERMAXLENGTH
                        }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        handleChange={(e) => {
                            e.preventDefault()
                            calculateHangerCost(getValues(`HangerFactor`), e.target.value)
                        }}
                        errors={errors && errors.NoOfPartsPerHanger}
                        disabled={ViewMode}
                    />
                </Col>
                <Col md="4">
                    <TextFieldHookForm
                        label="Hanger Cost per Part"
                        name={`HangerCostPerPart`}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            // validate: TransportationType === 'Percentage' ? { number, checkWhiteSpaces, percentageLimitValidation } : { number, checkWhiteSpaces, decimalNumberLimit6 },
                            // maxLength: NUMBERMAXLENGTH
                        }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        handleChange={(e) => {
                            e.preventDefault()
                            // handleQuantityChange(e)
                        }}
                        errors={errors && errors.HangerCostPerPart}
                        disabled={true}
                    />
                </Col>
            </Row>}
        </>
    )
}

export default Hanger