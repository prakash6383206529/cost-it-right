import React, { useCallback, useEffect, useState } from 'react'
import { Col, Row } from 'reactstrap'
import { TextFieldHookForm, TextAreaHookForm } from '../../../../layout/HookFormInputs'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { NUMBERMAXLENGTH } from '../../../../../config/masterData'
import { checkForDecimalAndNull, checkForNull, checkWhiteSpaces, decimalNumberLimit6, hashValidation, maxLength250, number } from '../../../../../helper'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { setSurfaceData } from '../../../actions/Costing'
import _ from 'lodash';
import TooltipCustom from '../../../../common/Tooltip'
import { useLabels } from '../../../../../helper/core'

const Hanger = ({ ViewMode, isSummary, viewCostingDataObj, setSurfaceData, Params, item }) => {
    const { register, control, formState: { errors }, setValue, getValues } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { SurfaceTabData } = useSelector(state => state.costing)
    let surfaceTabData = SurfaceTabData && SurfaceTabData[0]
    const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
    const dispatch = useDispatch()
    const [state, setState] = useState({
        showHanger: true
    })
    const { remarkProcessNameLabel } = useLabels()
    const { NoOfDecimalForInputOutput, NoOfDecimalForPrice } = useSelector(state => state.auth.initialConfiguration)
    const hangerCost = useWatch({
        control,
        name: 'HangerCostPerPart',
    });
    useEffect(() => {
        const data = isSummary ? viewCostingDataObj : item?.CostingPartDetails
        setValue(`HangerFactor`, data?.HangerRate ? checkForDecimalAndNull(data?.HangerRate, NoOfDecimalForInputOutput) : '')
        setValue(`NoOfPartsPerHanger`, data?.NumberOfPartsPerHanger ? checkForDecimalAndNull(data?.NumberOfPartsPerHanger, NoOfDecimalForInputOutput) : '')
        setValue(`HangerCostPerPart`, checkForDecimalAndNull(data?.HangerCostPerPart, NoOfDecimalForPrice))
        setValue(`HangerRemark`, data?.HangerRemark ?? "")
    }, [viewCostingDataObj])
    const calculateHangerCost = debounce((hangerFactor, noOfPartsPerHanger) => {
        const hangerCost = checkForNull(hangerFactor) / checkForNull(noOfPartsPerHanger)
        setValue(`HangerCostPerPart`, checkForDecimalAndNull(hangerCost, NoOfDecimalForPrice))
        let hangerRemarks = getValues("HangerRemark")
        let obj = {
            HangerRate: hangerFactor,
            NumberOfPartsPerHanger: checkForNull(noOfPartsPerHanger),
            HangerCostPerPart: hangerCost,
            HangerRemark: hangerRemarks
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
    }, 800)

    const debouncedUpdate = useCallback(
        debounce((value, getValues, setSurfaceData) => {
            const { HangerFactor, NoOfPartsPerHanger, HangerCostPerPart } = getValues();
            const obj = {
                HangerRate: HangerFactor,
                NumberOfPartsPerHanger: checkForNull(NoOfPartsPerHanger),
                HangerCostPerPart: checkForDecimalAndNull(HangerCostPerPart, NoOfDecimalForPrice),
                HangerRemark: value,
            };
            setSurfaceData({ Params, hangerObj: obj, type: 'Hanger' }, errors);
        }, 300),
        []
    );

    const handleRemark = (e) => {
        const value = e?.target?.value;
        debouncedUpdate(value, getValues, setSurfaceData);
    };

    return (
        <>
            <Row>
                <Col md="8" className={`${(!state.showHanger && !isSummary) ? 'mb-4' : ""}`}><div className="left-border">
                    {'Hanger Cost:'}
                </div></Col>
               {!isSummary && <Col md="4" className="text-right">
                    <button id="Dashboard_Costing_Accordian" className="btn btn-small-primary-circle ml-1 " type="button" onClick={() => { setState({ ...state, showHanger: !state.showHanger }) }}>
                        {state.showHanger ? (
                            <i className="fa fa-minus" ></i>
                        ) : (
                            <i className="fa fa-plus"></i>
                        )}

                    </button>
                </Col>}
            </Row>
            {(state.showHanger || isSummary) && <Row>
                <Col md="4">
                    <TextFieldHookForm
                        label={`${remarkProcessNameLabel}`}
                        name={"HangerRemark"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={!!(checkForNull(hangerCost) > 0)}
                        rules={{
                            required: !!(checkForNull(hangerCost) > 0),
                            validate: { checkWhiteSpaces, hashValidation, maxLength250 },

                        }}
                        handleChange={handleRemark}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.HangerRemark}
                        disabled={ViewMode || IsLocked}
                    />
                </Col>
                <Col md="4">
                    <TextFieldHookForm
                        label="Hanger Factor (Rate)"
                        name={`HangerFactor`}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            validate: { checkWhiteSpaces, decimalNumberLimit6 },
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
                        disabled={ViewMode || IsLocked}
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
                            required: false,
                            validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                            // maxLength: NUMBERMAXLENGTH
                        }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        handleChange={(e) => {
                            e.preventDefault()
                            calculateHangerCost(getValues(`HangerFactor`), e.target.value)
                        }}
                        errors={errors && errors.NoOfPartsPerHanger}
                        disabled={ViewMode || IsLocked}
                    />
                </Col>
                <Col md="4">
                    <TooltipCustom disabledIcon={true} id="HangerCostPerPart" tooltipText="Hanger Cost per Part = Hanger Factor / No. of Parts per Hanger" />
                    <TextFieldHookForm
                        label="Hanger Cost per Part"
                        name={`HangerCostPerPart`}
                        id="HangerCostPerPart"
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            // validate: TransportationType === 'Percentage' ? { number, checkWhiteSpaces, percentageLimitValidation } : { number, checkWhiteSpaces, decimalNumberLimit6 },
                            // maxLength: NUMBERMAXLENGTH
                        }}
                        defaultValue={''}
                        className="" x
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