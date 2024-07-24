
import React, { useState, useEffect } from 'react'
import { Row, Col, } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, loggedInUserId, calculateWeight, setValueAccToUOM, number, checkWhiteSpaces, decimalAndNumberValidation, percentageLimitValidation, calculateScrapWeight, calculatePercentage } from '../../../../../helper'
import TooltipCustom from '../../../../common/Tooltip'
import { nonZero } from '../../../../../helper/validation'
import { reactLocalStorage } from 'reactjs-localstorage'
import { debounce } from 'lodash'
import { saveRawMaterialCalculationForInsulation } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'

function InsulationCalculator(props) {

    const { rmRowData, CostingViewMode, item } = props;
    const WeightCalculatorRequest = rmRowData.WeightCalculatorRequest;
    const [isDisable, setIsDisable] = useState(false)
    const [area, setArea] = useState(0);
    const [RmCost, setRmCost] = useState(0);

    const localStorage = reactLocalStorage.getObject('InitialConfiguration');
    const [defaultValues, setDefaultValues] = useState({
        thickness: '',
        width: '',
        length: '',
        noOfGumLayers: '',
        area: '',
        RawMtlSqmtr: rmRowData?.RMRate ? rmRowData?.RMRate : '-',
        Rmcost: ''
    });
    const {
        register,
        control,
        setValue,
        getValues,
        handleSubmit,
        formState: { errors }
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues
    });






    useEffect(() => {
        if (WeightCalculatorRequest && rmRowData) {
            const newDefaultValues = {
                thickness: WeightCalculatorRequest.Thickness !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Thickness, localStorage.NoOfDecimalForInputOutput) : '',
                width: WeightCalculatorRequest.Width !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Width, localStorage.NoOfDecimalForInputOutput) : '',
                length: WeightCalculatorRequest.Length !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Length, localStorage.NoOfDecimalForInputOutput) : '',
                noOfGumLayers: WeightCalculatorRequest.NoOfGumLayers !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NoOfGumLayers, localStorage.NoOfDecimalForInputOutput) : '',
                area: WeightCalculatorRequest.Area !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Area, localStorage.NoOfDecimalForInputOutput) : '',
                RawMtlSqmtr: rmRowData.RMRate ? rmRowData.RMRate : '-',
                Rmcost: WeightCalculatorRequest.RawMaterialCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, localStorage.NoOfDecimalForInputOutput) : '',
            };

            setDefaultValues(newDefaultValues);

            // Ensure form is initialized and then set values
            Object.keys(newDefaultValues).forEach((key) => {
                setValue(key, newDefaultValues[key]);
            });
        }
    }, [WeightCalculatorRequest, rmRowData, setValue, localStorage.NoOfDecimalForInputOutput]);


    const dispatch = useDispatch()


    const fieldValues = useWatch({
        control,
        name: ['length', 'width', 'RawMtlSqmtr']
    });

    function calculateWeight(length, width) {
        const value = (length * width) / 1000000;
        return value;
    }

    useEffect(() => {
        if (!CostingViewMode) {
            setCalculatedArea();
        }
    }, [fieldValues[0], fieldValues[1]]); // Watching length and width changes

    useEffect(() => {
        if (!CostingViewMode) {
            setCalculatedRMCost();
        }
    }, [area, fieldValues[2]]); // Watching area and RawMtlSqmtr changes

    const setCalculatedArea = () => {
        const length = checkForNull(getValues('length'));
        const width = checkForNull(getValues('width'));

        const calculatedArea = calculateWeight(length, width);
        setArea(calculatedArea);
        // setValue('area', calculatedArea);
        setValue('area', checkForDecimalAndNull(calculatedArea, localStorage.NoOfDecimalForPrice));

    };

    const setCalculatedRMCost = () => {
        const rawMtlSqmtr = parseFloat(checkForNull(getValues('RawMtlSqmtr')));
        const calculatedRmCost = area * (isNaN(rawMtlSqmtr) ? 0 : rawMtlSqmtr);
        setRmCost(calculatedRmCost);
        // setValue('Rmcost', calculatedRmCost);
        setValue('Rmcost', checkForDecimalAndNull(calculatedRmCost, localStorage.NoOfDecimalForPrice));
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    const cancel = () => {
        props.toggleDrawer('')
    }
    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    /**
       * @method onSubmit
       * @description Used to Submit the form
       */

    const onSubmit = debounce(handleSubmit((values) => {
        setIsDisable(true);

        let data = {

            LayoutType: 'Insulation',
            SheetMetalCalculationId: "0", // Dummy ID
            //IsChangeApplied: false, // Dummy value
            BaseCostingIdRef: item.CostingId,
            //CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
            RawMaterialIdRef: rmRowData.RawMaterialId,
            LoggedInUserId: loggedInUserId(),
            Thickness: values.thickness,
            Width: values.width,
            Length: values.length,
            NoOfGumLayers: values.noOfGumLayers,
            Area: area,
            RawMtlSqmtr: values.RawMtlSqmtr,
            RawMaterialCost: RmCost
        };


        dispatch(saveRawMaterialCalculationForInsulation(data, (res) => {


            setIsDisable(false);

            if (res && res.data && res.data.Result) {

                Toaster.success("Calculation saved successfully");


                props.toggleDrawer('', data);
            }
        }));
    }), 500);

    return (
        <div className="user-page p-0">
            <div>
                <form noValidate className="form"
                    onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
                    <div className="costing-border border-top-0 px-4">
                        <Row>
                            <Col md="3">
                                <TextFieldHookForm
                                    label="Length (mm)"
                                    name="length"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    rules={{
                                        required: true,
                                        validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation }
                                    }}
                                    handleChange={() => { }}
                                    defaultValue={defaultValues.length} // Ensure defaultValue is set
                                    ///defaultValue=""

                                    className=""
                                    customClassName="withBorder"
                                    errors={errors.length}
                                    disabled={CostingViewMode}
                                />
                            </Col>
                            <Col md="3">
                                <TextFieldHookForm
                                    label="Width (mm)"
                                    name="width"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    rules={{
                                        required: true,
                                        validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation }
                                    }}
                                    handleChange={() => { }}
                                    //defaultValue=""
                                    defaultValue={defaultValues.width} // Ensure defaultValue is set
                                    className=""
                                    customClassName="withBorder"
                                    errors={errors.width}
                                    disabled={CostingViewMode}

                                />
                            </Col>
                            <Col md="3">
                                <TextFieldHookForm
                                    label="Thickness (mm)"
                                    name="thickness"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    //mandatory={true}
                                    rules={{
                                        required: true,
                                        validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation }
                                    }}
                                    handleChange={() => { }}
                                    defaultValue=""
                                    className=""
                                    customClassName="withBorder"
                                    errors={errors.thickness}
                                    disabled={CostingViewMode}
                                />
                            </Col>
                            <Col md="3">
                                <TextFieldHookForm
                                    label="No.of Gum layers"
                                    name="noOfGumLayers"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    //mandatory={true}
                                    rules={{
                                        required: true,
                                        validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation }
                                    }}
                                    handleChange={() => { }}
                                    defaultValue=""
                                    className=""
                                    customClassName="withBorder"
                                    errors={errors.gumLayers}
                                    disabled={CostingViewMode}
                                />
                            </Col>
                            <Col md="3">
                                <TooltipCustom tooltipClass="weight-of-sheet" disabledIcon={true} id="area-insulation" tooltipText="Area =  (Length * Width) / 1000000" />
                                <TextFieldHookForm
                                    label="Area"
                                    name="area"
                                    id="area-insulation"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    defaultValue=""
                                    className=""
                                    customClassName="withBorder"
                                    disabled={true}
                                />
                            </Col>
                            <Col md="3">
                                <TextFieldHookForm
                                    label="Raw mtl Sqmtr"
                                    name="RawMtlSqmtr"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    //mandatory={true}
                                    rules={{
                                        required: true,
                                        validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation }
                                    }}
                                    handleChange={() => { }}
                                    defaultValue={rmRowData?.RMRate ? rmRowData?.RMRate : '-'}
                                    className=""
                                    customClassName="withBorder"
                                    errors={errors.RawMtlSqmtr}
                                    disabled={true}
                                />
                            </Col>
                            <Col md="3">
                                <TooltipCustom tooltipClass="weight-of-sheet" disabledIcon={true} id="coil-gross-weight" tooltipText=" RM Cost = Raw mtl Sqmtr * Area" />
                                <TextFieldHookForm
                                    label="RM Cost (Rs./pc)"
                                    name="Rmcost"
                                    id="coil-gross-weight"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    defaultValue=""
                                    className=""
                                    customClassName="withBorder"
                                    errors={errors.GrossWeight}
                                    disabled={true}
                                />
                            </Col>
                        </Row>
                    </div>
                    {!CostingViewMode &&
                        <div className="col-sm-12 text-right px-4 mt-4">
                            <button
                                type={'button'}
                                className="reset mr15 cancel-btn"
                                onClick={cancel} >
                                <div className={'cancel-icon'}></div> {'Cancel'}
                            </button>
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={CostingViewMode || isDisable ? true : false}
                                className="submit-button save-btn">
                                <div className={'save-icon'}></div>
                                {'Save'}
                            </button>
                        </div>}
                </form>
            </div>
        </div>
    );
}

export default InsulationCalculator;