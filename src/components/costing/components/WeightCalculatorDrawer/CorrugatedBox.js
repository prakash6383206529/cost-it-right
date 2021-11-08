import React, { useState, useContext, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { costingInfoContext } from '../CostingDetailStepTwo'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row } from 'reactstrap'
import { saveRawMaterialCalciData } from '../../actions/CostWorking'

import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, loggedInUserId, calculateWeight, setValueAccToUOM, } from '../../../../helper'
import { getUOMSelectList } from '../../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import { toastr } from 'react-redux-toastr'
import { G, KG, MG, } from '../../../../config/constants'
import { AcceptableSheetMetalUOM } from '../../../../config/masterData'
import { ViewCostingContext } from '../CostingDetails'
import HeaderTitle from '../../../common/HeaderTitle'

function CorrugatedBox (props){


    // var widthSheetWithDecimal;
    // var lengthSheetWithDecimal;
    // var paperWithDecimal;
    // var burstingStrengthWithDecimal;
    // var widthIncCuttingDecimal;
    // var LengthCuttingAllowance;

    const [dataSend, setDataSend] = useState({})
    
    const localStorage = reactLocalStorage.getObject('InitialConfiguration');
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
    const { rmRowData, isEditFlag } = props
    const dispatch = useDispatch()







    const defaultValues = {
        no_of_ply: WeightCalculatorRequest && WeightCalculatorRequest.NosOfPly !== null ? WeightCalculatorRequest.NosOfPly: '',
        gsm : WeightCalculatorRequest && WeightCalculatorRequest.GSM !== null ? WeightCalculatorRequest.GSM : '',
        bursting_factor: WeightCalculatorRequest && WeightCalculatorRequest.BurstingFactor !== null ? WeightCalculatorRequest.BurstingFactor : '',
        bursting_strength : WeightCalculatorRequest && WeightCalculatorRequest.BurstingStrength !== null ? WeightCalculatorRequest.BurstingStrength : '',
        length_box : WeightCalculatorRequest && WeightCalculatorRequest.LengthBox  !== null ? WeightCalculatorRequest.LengthBox  : '',
        width_box: WeightCalculatorRequest && WeightCalculatorRequest.WidthBox !== null ? WeightCalculatorRequest.WidthBox : '',
        height_box: WeightCalculatorRequest && WeightCalculatorRequest.HeightBox !== null ? WeightCalculatorRequest.HeightBox : '',
        stiching_length: WeightCalculatorRequest && WeightCalculatorRequest.StichingLength !== null ? WeightCalculatorRequest.StichingLength : '',
        width_sheet: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheet !== null ? WeightCalculatorRequest.WidthSheet : '', // 
        cutting_allowance: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowance !== undefined ? WeightCalculatorRequest.CuttingAllowance : '',
        width_inc_cutting: WeightCalculatorRequest && WeightCalculatorRequest.WidthIncCutting !== null ? WeightCalculatorRequest.WidthIncCutting : '',
        length_sheet: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheet !== null ? WeightCalculatorRequest.LengthSheet : '',
        cutting_allowance2: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowance2 !== null ? WeightCalculatorRequest.CuttingAllowance2 : '',
        length_inc_cutting_allowance:  WeightCalculatorRequest && WeightCalculatorRequest.LengthIncCuttingAllowance !== null ? WeightCalculatorRequest.LengthIncCuttingAllowance : '',
        paper_process:  WeightCalculatorRequest && WeightCalculatorRequest.PaperProcess !== null ? WeightCalculatorRequest.PaperProcess : '',

    }





    const {
        register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues,
        })

        const costData = useContext(costingInfoContext)
        const [isChangeApplies, setIsChangeApplied] = useState(true)
        const [GrossWeight, setGrossWeights] = useState(WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '')

        const [dataToSend, setDataToSend] = useState({
            GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '',
           // FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? convert(WeightCalculatorRequest.FinishWeight, WeightCalculatorRequest.UOMForDimension) : ''
        })

        const [UOMDimension, setUOMDimension] = useState(
            WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length !== 0
                ? {
                    label: WeightCalculatorRequest.UOMForDimension,
                    value: WeightCalculatorRequest.UOMForDimensionId,
                }
                : [],
        )



        const fieldValues = useWatch({
            control,
            name: ['no_of_ply', 'gsm', 'bursting_factor', 'length_box', 'height_box', 'cutting_allowance','width_inc_cutting'],
        })

        

        useEffect(() => {
            setBurstingStrength()
            setWidthCuttingAllowance()
            setWidthSheet_LengthSheet()
            setLengthCuttingAllowance()
            setFinalGrossWeight()
            
        }, [fieldValues])


        const setBurstingStrength = () => {
            let data = {
                density: rmRowData.Density,
                thickness: getValues('no_of_ply'),
                length: checkForNull(getValues('bursting_factor')),
                width: checkForNull(getValues('gsm'))
            }
            const getWeightSheet = ( data.length * data.width * data.thickness) / 1000;
            //burstingStrengthWithDecimal = getWeightSheet;
            setDataSend(prevState => ({ ...prevState,burstingStrengthWithDecimal: getWeightSheet  }))
          //  const updatedValue = dataToSend
           // updatedValue.WeightOfSheet = getWeightSheet
            setTimeout(() => {
               // setDataToSend(getWeightSheet)
                setValue('bursting_strength', checkForDecimalAndNull(getWeightSheet, localStorage.NoOfDecimalForInputOutput))
            }, 200);
        }


        const  setWidthSheet_LengthSheet = () => {


            let data = {


                lengthBox: getValues('length_box'),
                widthBox: getValues('width_box'),
                heightBox: getValues('height_box'),
                stichingLength : getValues('stiching_length')

            }

           
            var widthsheet = (Number(data.widthBox) + parseInt(data.heightBox))/25.4;
             const lengthsheet = (2*(parseInt(data.lengthBox) + parseInt(data.widthBox)) + parseInt(data.stichingLength)  )/25.4;
             
              //widthSheetWithDecimal = widthsheet;
              //lengthSheetWithDecimal = lengthsheet;
              setDataSend(prevState => ({ ...prevState, widthSheetWithDecimal:widthsheet,lengthSheetWithDecimal:lengthsheet}))

            

            setTimeout(() => {
                // setDataToSend(getWeightSheet)
                 setValue('width_sheet', checkForDecimalAndNull(widthsheet, localStorage.NoOfDecimalForPrice))
             }, 200);


             setTimeout(() => {
                // setDataToSend(getWeightSheet)
                 setValue('length_sheet', checkForDecimalAndNull(lengthsheet, localStorage.NoOfDecimalForPrice))
             }, 200);

           


        }

 const setWidthCuttingAllowance =  () => {


    let data1 = { 
        cuttingAllowance :getValues('cutting_allowance') ,
                    widthSheet : getValues('width_sheet')

                                   }
             if(data1.cuttingAllowance) {

            
             
    const widthCuttingAllowance = data1.widthSheet + (2*data1.cuttingAllowance);
    
    const wca1 = Math.round(widthCuttingAllowance);
     // widthIncCuttingDecimal = wca1;
     setDataSend(prevState => ({ ...prevState, widthIncCuttingDecimal: wca1 }))

    setTimeout(() => {
       // setDataToSend(getWeightSheet)
        setValue('width_inc_cutting', wca1);
    }, 200);

             }

 }



 const setLengthCuttingAllowance = () => {


    let data = {
        widthSheet: getValues('width_sheet'),
        cuttingAllowance2: getValues('cutting_allowance2'),
    }


    if(data.cuttingAllowance2)   {
const lca = (parseInt(data.widthSheet)  +   2* parseInt(data.cuttingAllowance2) );
     // LengthCuttingAllowance = lca;
     setDataSend(prevState => ({ ...prevState,LengthCuttingAllowance: lca  }))


setTimeout(() => {
    // setDataToSend(getWeightSheet)
     setValue('length_inc_cutting_allowance', checkForDecimalAndNull(lca, localStorage.NoOfDecimalForPrice));
 }, 200);

    }
 }


 const setFinalGrossWeight = () =>  {

    let data = {
        width_inc_cutting: getValues('width_inc_cutting'),
        length_inc_cutting_allowance: getValues('length_inc_cutting_allowance'),
        no_of_ply : getValues('no_of_ply'),
        gsm : getValues('gsm')
       // np :
       // gsm : 
    }

if(data.length_inc_cutting_allowance) {
const Wca = Number(data.width_inc_cutting);
const Lca = parseInt(data.length_inc_cutting_allowance);
const Np= parseInt(data.no_of_ply);
const Gsm = parseInt(data.gsm);

const gross = (  Wca * Lca * Np * Gsm )/1550;
const finalGross = gross/1000;
//paperWithDecimal = finalGross;
setDataSend(prevState => ({ ...prevState, paperWithDecimal: finalGross}))

setTimeout(() => {
    // setDataToSend(getWeightSheet)
     setValue('paper_process', checkForDecimalAndNull(finalGross, localStorage.NoOfDecimalForPrice));
 }, 200);


}

}




const onSubmit= (Values)=> {




let data = {
    LayoutType: 'Sheet',
    WeightCalculationId: WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId ? WeightCalculatorRequest.WeightCalculationId : "00000000-0000-0000-0000-000000000000",
    IsChangeApplied: isChangeApplies, //NEED TO MAKE IT DYNAMIC how to do,
    PartId: costData.PartId,
    RawMaterialId: rmRowData.RawMaterialId,
    CostingId: costData.CostingId,
    TechnologyId: costData.TechnologyId,
    CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
    RawMaterialName: rmRowData.RMName,
    RawMaterialType: rmRowData.MaterialType,
    BasicRatePerUOM: rmRowData.RMRate,
    ScrapRate: rmRowData.ScrapRate,
    NetLandedCost: dataToSend.GrossWeight * rmRowData.RMRate - (dataToSend.GrossWeight - getValues('FinishWeightOfSheet')) * rmRowData.ScrapRate,
    PartNumber: costData.PartNumber,
    TechnologyName: costData.TechnologyName,
    Density: rmRowData.Density,
    UOMForDimensionId: UOMDimension ? UOMDimension.value : '',
    UOMForDimension: UOMDimension ? UOMDimension.label : '',
    GrossWeight: dataSend.paperWithDecimal,
    FinishWeight: dataSend.paperWithDecimal ,
    LoggedInUserId: loggedInUserId(),
    UOMId: rmRowData.UOMId,
    UOM: rmRowData.UOM,

    BurstingFactor: Values.bursting_factor,
    BurstingStrength: dataSend.burstingStrengthWithDecimal,
    CuttingAllowance : Values.cutting_allowance,
    CuttingAllowance2 : Values.cutting_allowance2,
    GSM : Values.gsm,
    HeightBox : Values.height_box,
    LengthBox : Values.length_box,
    LengthIncCuttingAllowance : dataSend.LengthCuttingAllowance,
    LengthSheet :  dataSend.lengthSheetWithDecimal,
    NosOfPly: Values.no_of_ply,
    PaperProcess : dataSend.paperWithDecimal,
    StichingLength : Values.stiching_length,
    WidthBox : Values.width_box,
    WidthIncCutting : dataSend.widthIncCuttingDecimal,
    WidthSheet : dataSend.widthSheetWithDecimal,
    UOMId: rmRowData.UOMId,
    UOM: rmRowData.UOM,


} 



let obj = {
}

dispatch(saveRawMaterialCalciData(data, res => {
    if (res.data.Result) {
        data.WeightCalculationId = res.data.Identity
        toastr.success("Calculation saved successfully")
        props.toggleDrawer('', data, obj)
    }
}))


}

const cancel = () => {
    props.toggleDrawer('')
}






    return (
        <>



        
            <div className="user-page p-0">
                <div>
                    <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
                        <div className="costing-border border-top-0 px-4">
                            <Row>
                                <Col md="12" className={'mt25'}>
                                    <HeaderTitle className="border-bottom"
                                        title={'RM Details'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                            </Row>
                            <Row className={'mt15'}>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Nos of Ply`}
                                        name={'no_of_ply'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.no_of_ply}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`GSM`}
                                        name={'gsm'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.gsm}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Bursting Factor`}
                                        name={'bursting_factor'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.bursting_factor}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Bursting Strength`}
                                        name={'bursting_strength'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        // rules={{
                                        //     required: true,
                                        //     pattern: {
                                        //         //value: /^[0-9]*$/i,
                                        //         value: /^[0-9]\d*(\.\d+)?$/i,
                                        //         message: 'Invalid Number.',
                                        //     },
                                        //     // maxLength: 4,
                                        // }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.bursting_strength}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>

                            {/* /////////////////////// */}
                            <Row>
                                <Col md="12" className={''}>
                                    <HeaderTitle className="border-bottom"
                                        title={'Box Details'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                            </Row>
                            <Row className={'mt15'}>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Length(Box)(mm)`}
                                        name={'length_box'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.length_box}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Width(Box)(mm)`}
                                        name={'width_box'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.width_box}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Height
                                        (Box)(mm)`}
                                        name={'height_box'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.height_box}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Stiching length - Inch/Joint`}
                                        name={'stiching_length'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                           required: true,
                                           pattern: {
                                               //value: /^[0-9]*$/i,
                                              //value: /^[0-9]\d*(\.\d+)?$/i,
                                             value: /^(0|[1-9]\d*)(\.\d+)?$/i,
                                              message: 'Invalid Number.',
                                       }}}
                                        //     // maxLength: 4,
                                        // }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.stiching_length}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>

                           </Row>

                                


                           <Row>
                                <Col md="12" className={''}>
                                    <HeaderTitle className="border-bottom"
                                        title={'Sheet Details'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                            </Row>


                                
                             
                                
                            <Row className={'mt15'}>
                          
                                  <Col md="3">
                               
                                    <TextFieldHookForm
                                        label={`Width(Sheet)(inch)`}
                                        name={'width_sheet'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.width_sheet}
                                        disabled={true}
                                    />
                                </Col>

              

                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Cutting Allowance`}
                                        name={'cutting_allowance'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.cutting_allowance}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>


                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Width(sheet) inc. Cutting allowance`}
                                        name={'width_inc_cutting'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.width_inc_cutting}
                                        disabled={true}
                                    />
                                </Col>
                                

                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Length(Sheet)(inch)`}
                                        name={'length_sheet'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.length_sheet}
                                        disabled={true}
                                    />
                                </Col>
                                </Row>



                           <Row className={'mt15'}>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Cutting Allowance`}
                                        name={'cutting_allowance2'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.cutting_allowance2}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Length(sheet) inc. Cutting allowance`}
                                        name={'length_inc_cutting_allowance'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            pattern: {
                                                //value: /^[0-9]*$/i,
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.length_inc_cutting_allowance}
                                        disabled={true}
                                    />
                                </Col>


                   </Row>
                            
                            

                            <hr className="mx-n4 w-auto" />
                            
                                 
                                 
                                
                                <Row>
                                <Col md="12" className={''}>
                                    <HeaderTitle className="border-bottom"
                                        title={'Paper wt.+ Process Rejection(Kg)'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>


                                <Col md="3">
                                    <TextFieldHookForm
                                        label={'Paper wt.+ Process Rejection(Kg)'}
                                        name={'paper_process'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            pattern: {
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.'
                                            },
                                            // maxLength: 3,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.paper_process}
                                        disabled={true}
                                    />
                                </Col>
                                
                                
                               
                            </Row>
                        </div>

                        { <div className="col-sm-12 text-right px-0 mt-4">
                            <button
                                type={'button'}
                                className="reset mr15 cancel-btn"
                                onClick={cancel} >
                                <div className={'cancel-icon'}></div> {'Cancel'}
                            </button>
                            <button
                                type={'submit'}
                                className="submit-button save-btn">
                                <div className={'save-icon'}></div>
                                {'Save'}
                            </button>
                        </div>}

                    </form>
                </div>
            </div>
        </>
    )




}
export default CorrugatedBox