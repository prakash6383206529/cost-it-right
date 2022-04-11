import React, { useState, useEffect, Fragment, useContext } from 'react'
import { Row, Col, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'
import { calculateScrapWeight, checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../../helper'
import { saveRawMaterialCalciData } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { KG, EMPTY_DATA } from '../../../../../config/constants'
import NoContentFound from '../../../../common/NoContentFound'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { debounce } from 'lodash'



const gridOptions = {};
function StandardRub(props) {

    const { rmRowData, rmData } = props
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;

    const costData = useContext(costingInfoContext)
    const [tableData, setTableData] = useState([])
    const [rmDropDownData, setRmDropDownData] = useState([])
    const [rmRowDataState, setRmRowDataState] = useState({})
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [dataToSend, setDataToSend] = useState({ ...WeightCalculatorRequest })



    const defaultValues = {
        shotWeight: WeightCalculatorRequest && WeightCalculatorRequest.ShotWeight !== null ? WeightCalculatorRequest.ShotWeight : '',
        noOfCavity: WeightCalculatorRequest && WeightCalculatorRequest.Cavity !== undefined ? WeightCalculatorRequest.Cavity : 1,
        grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '',
        finishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? WeightCalculatorRequest.FinishWeight : '',
    }

    const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })


    const dispatch = useDispatch()
    const [grossWeights, setGrossWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? WeightCalculatorRequest.FinishWeight : '')

    const fieldValues = useWatch({
        control,
        name: ['InnerDiameter', 'OuterDiameter', 'Length', 'CuttingAllowance', 'FinishWeight'],
    })

    useEffect(() => {

        calculateTotalLength()
        calculateVolume()
        calculateScrapWeight()

    }, [fieldValues])


    useEffect(() => {

        let arr = []
        let count = 0
        rmData && rmData.map((item) => {
            arr.push({
                label: item.RMName, value: count
            })
            count++
        })
        setRmDropDownData(arr)
    }, [])




    const calculateTotalLength = () => {

        const Length = Number(getValues('Length'))
        const CuttingAllowance = Number(getValues('CuttingAllowance'))
        let TotalLength = checkForNull(Length) + checkForNull(CuttingAllowance)
        setDataToSend(prevState => ({ ...prevState, TotalLength: TotalLength }))
        setValue('TotalLength', checkForDecimalAndNull(TotalLength, getConfigurationKey().NoOfDecimalForInputOutput))

    }


    const calculateVolume = debounce(() => {

        const InnerDiameter = Number(getValues('InnerDiameter'))
        const OuterDiameter = Number(getValues('OuterDiameter'))

        if (InnerDiameter && OuterDiameter && InnerDiameter > OuterDiameter) {
            Toaster.warning('Inner diameter cannot be greater than outer diameter')
            setTimeout(() => {
                setValue('OuterDiameter', 0)
            }, 300);
            return false

        }

        if (InnerDiameter && OuterDiameter) {
            const Length = Number(getValues('Length'))
            const CuttingAllowance = Number(getValues('CuttingAllowance'))
            let Volume = 0.7857 * (Math.pow(checkForNull(OuterDiameter), 2) - Math.pow(checkForNull(InnerDiameter), 2)) * checkForNull(Length + CuttingAllowance)
            let GrossWeight = Volume * (checkForNull(rmRowDataState.Density) / 1000000)


            setDataToSend(prevState => ({ ...prevState, Volume: Volume, GrossWeight: GrossWeight }))
            setValue('Volume', checkForDecimalAndNull(Volume, getConfigurationKey().NoOfDecimalForInputOutput))
            setValue('GrossWeight', checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        }

    }, 500)


    const calculateScrapWeight = () => {

        const FinishWeight = Number(getValues('FinishWeight'))
        if (FinishWeight > dataToSend.GrossWeight) {
            Toaster.warning('Finish weight cannot be greater than gross weight')
            setTimeout(() => {
                setValue('FinishWeight', 0)
            }, 300);
            return false
        }



        let ScrapWeight = checkForNull(dataToSend.GrossWeight) - checkForNull(FinishWeight)
        setDataToSend(prevState => ({ ...prevState, ScrapWeight: ScrapWeight }))
        setValue('ScrapWeight', checkForDecimalAndNull(ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))

        let NetRmCost = checkForNull(dataToSend.GrossWeight) * checkForNull(rmRowDataState.RMRate) - checkForNull(rmRowDataState.ScrapRate) * ScrapWeight
        setDataToSend(prevState => ({ ...prevState, NetRmCost: NetRmCost }))
        setValue('NetRmCost', checkForDecimalAndNull(NetRmCost, getConfigurationKey().NoOfDecimalForInputOutput))



    }


    const handleRMDropDownChange = (e) => {
        rmData && rmData.map((item, index) => {
            if (item.RMName === e.label) {
                setRmRowDataState(rmData[index])
            }
            return false
        })

        if (tableData.length > 0) {

            let obj = tableData[tableData.length - 1]

            setValue('InnerDiameter', obj.OuterDiameter)
            setValue('Length', obj.Length)
            setValue('CuttingAllowance', obj.CuttingAllowance)


        }

    }

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForInputOutput)
    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,

    };

    const onGridReady = (params) => {

        params.api.sizeColumnsToFit();
        setGridColumnApi(params.columnApi)
        setGridApi(params.api)
        params.api.paginationGoToPage(0);
    };
    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };


    const addRow = () => {

        let obj = {
            RmName: rmRowDataState.RMName,
            InnerDiameter: Number(getValues('InnerDiameter')),
            OuterDiameter: Number(getValues('OuterDiameter')),
            Length: Number(getValues('Length')),
            CuttingAllowance: Number(getValues('CuttingAllowance')),
            TotalLength: dataToSend.TotalLength,
            Volume: dataToSend.Volume,
            GrossWeight: dataToSend.GrossWeight,
            FinishWeight: Number(getValues('FinishWeight')),
            ScrapWeight: dataToSend.ScrapWeight,
            NetRmCost: dataToSend.NetRmCost,

        }


        if (obj.InnerDiameter === 0 || obj.OuterDiameter === 0 || obj.Length === 0 || obj.CuttingAllowance === 0 || obj.FinishWeight === 0) {

            Toaster.warning("Please fill all the mandatory fields first.")
            return false;
        }
        setTableData([...tableData, obj])


        reset({

            InnerDiameter: "",
            OuterDiameter: "",
            Length: "",
            CuttingAllowance: "",
            TotalLength: "",
            Volume: "",
            GrossWeight: "",
            FinishWeight: "",
            ScrapWeight: "",
            NetRmCost: "",
            RawMaterial: []

        })
        setRmRowDataState({})

        setTimeout(() => {
            setValue('ScrapWeight', 0)
        }, 300);


        let arr2 = rmDropDownData && rmDropDownData.filter((item) => {
            return item.label !== obj.RmName
        })
        setRmDropDownData(arr2)
    }








    const onSubmit = () => {
        let obj = {}
        obj.LayoutType = 'Default'
        obj.WeightCalculationId = WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId ? WeightCalculatorRequest.WeightCalculationId : "00000000-0000-0000-0000-000000000000"
        obj.IsChangeApplied = true //NEED TO MAKE IT DYNAMIC how to do
        obj.PartId = costData.PartId
        obj.RawMaterialId = rmRowData.RawMaterialId
        obj.CostingId = costData.CostingId
        obj.TechnologyId = costData.TechnologyId
        obj.CostingRawMaterialDetailId = rmRowData.RawMaterialDetailId
        obj.RawMaterialName = rmRowData.RMName
        obj.RawMaterialType = rmRowData.MaterialType
        obj.BasicRatePerUOM = rmRowData.RMRate
        obj.ScrapRate = rmRowData.ScrapRate
        obj.NetLandedCost = grossWeights * rmRowData.RMRate - (grossWeights - getValues('finishWeight')) * rmRowData.ScrapRate
        obj.PartNumber = costData.PartNumber
        obj.TechnologyName = costData.TechnologyName
        obj.Density = rmRowData.Density
        obj.UOMId = rmRowData.UOMId
        obj.UOM = rmRowData.UOM
        obj.UOMForDimension = KG
        obj.ShotWeight = getValues('shotWeight')
        obj.NumberOfCavity = getValues('noOfCavity')
        obj.GrossWeight = grossWeights
        obj.FinishWeight = getValues('finishWeight')

        dispatch(saveRawMaterialCalciData(obj, res => {
            if (res.data.Result) {
                obj.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', obj, obj)
            }
        }))
    }

    const cancel = () => {
        props.toggleDrawer('')
    }

    const frameworkComponents = {
        hyphenFormatter: hyphenFormatter,

    };


    return (
        <Fragment>
            <Row>
                <Col>
                    <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
                        <Col md="12" className={'mt25'}>
                            <div className="border pl-3 pr-3 pt-3">
                                {/* <Col md="12">
                                    <div className="left-border">
                                        {'Input Weight:'}
                                    </div>
                                </Col> */}
                                <Col md="12">


                                    <Col md="3">
                                        <SearchableSelectHookForm
                                            label={`Raw Material`}
                                            name={'RawMaterial'}
                                            placeholder={'-Select-'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            options={rmDropDownData}
                                            handleChange={handleRMDropDownChange}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.RawMaterial}
                                            disabled={props.CostingViewMode ? true : false}
                                        />
                                    </Col>


                                    <Row className="mb-4 pb-2">
                                        <Col md="12 d-flex weight-calculator-headings">
                                            <div className="d-inline-block "><span className="grey-text d-block">RM Name:</span><span className="text-dark-blue one-line-overflow" title={rmRowDataState.RMName}>{`${rmRowDataState.RMName !== undefined ? rmRowDataState.RMName : ''}`}</span></div>
                                            <div className="d-inline-block "><span className="grey-text d-block">Material:</span><span className="text-dark-blue">{`${rmRowDataState.MaterialType !== undefined ? rmRowDataState.MaterialType : ''}`}</span></div>
                                            <div className="d-inline-block "><span className="grey-text d-block">Density(g/cm){<sup>3</sup>}):</span><span className="text-dark-blue">{`${rmRowDataState.Density !== undefined ? rmRowDataState.Density : ''}`}</span></div>
                                            <div className="d-inline-block "><span className="grey-text d-block">RM Rate(INR):</span><span className="text-dark-blue">{`${rmRowDataState.RMRate !== undefined ? rmRowDataState.RMRate : ''}`}</span></div>
                                            {props?.appyMasterBatch && < div className="d-inline-block "><span className="grey-text d-block">RM Rate(including Master Batch):</span><span className="text-dark-blue">{`${rmRowDataState.RMRate !== undefined ? checkForDecimalAndNull(5, getConfigurationKey().NoOfDecimalForInputOutput) : ''}`}</span></div>}
                                            <div className="d-inline-block "><span className="grey-text d-block">Scrap Rate(INR):</span><span className="text-dark-blue">{`${rmRowDataState.ScrapRate !== undefined ? rmRowDataState.ScrapRate : ''}`}</span></div>
                                            <div className="d-inline-block"><span className="grey-text d-block">Category:</span><span className="text-dark-blue">{`${rmRowDataState.RawMaterialCategory !== undefined ? rmRowDataState.RawMaterialCategory : ''}`}</span></div>

                                        </Col>
                                    </Row>



                                    <Row className={'mt15'}>
                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Inner Diameter (mm)`}
                                                name={'InnerDiameter'}
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
                                                errors={errors.shotWeight}
                                                disabled={(props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true) || (tableData.length > 0 ? true : false)}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Outer Diameter (mm)`}
                                                name={'OuterDiameter'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.noOfCavity}
                                                disabled={props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Length (mm)`}
                                                name={'Length'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.finishWeight}
                                                disabled={(props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true) || (tableData.length > 0 ? true : false)}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Cutting Allowance (mm)`}
                                                name={'CuttingAllowance'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.grossWeight}
                                                disabled={(props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true) || (tableData.length > 0 ? true : false)}
                                            />
                                        </Col>


                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Total Length`}
                                                name={'TotalLength'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.grossWeight}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Volume (mm^3)`}
                                                name={'Volume'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.grossWeight}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Gross Weight (Kg)`}
                                                name={'GrossWeight'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.grossWeight}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Finish Weight`}
                                                name={'FinishWeight'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.grossWeight}
                                                disabled={props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Scrap Weight (Kg)`}
                                                name={'ScrapWeight'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.grossWeight}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Net RM Cost/ Component`}
                                                name={'NetRmCost'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.grossWeight}
                                                disabled={true}
                                            />
                                        </Col>

                                        <button
                                            type="button"
                                            className={'user-btn mt30 pull-left ml-3'}
                                            onClick={() => addRow()}
                                            disabled={props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true}
                                        >
                                            <div className={'plus'}></div>ADD
                                        </button>

                                    </Row>
                                </Col>
                            </div>


                            <Row>
                                <Col>
                                    <div className={`ag-grid-wrapper height-width-wrapper ${tableData && tableData.length <= 0 ? "overlay-contain" : ""} `}>

                                        <div className={`ag-theme-material  max-loader-height`}>
                                            <AgGridReact
                                                defaultColDef={defaultColDef}
                                                //floatingFilter={true}
                                                domLayout='autoHeight'
                                                // columnDefs={c}
                                                rowData={tableData}
                                                //pagination={true}
                                                paginationPageSize={10}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                }}
                                                frameworkComponents={frameworkComponents}
                                            >
                                                <AgGridColumn minWidth="150" field="RmName" headerName="RM Name" ></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="InnerDiameter" headerName="Inner Dia" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="OuterDiameter" headerName="Outer Dia " cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="Length" headerName="Length(mm)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="CuttingAllowance" headerName="Cutting Allowance" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="Volume" headerName="Volume" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="GrossWeight" headerName="Gross Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="FinishWeight" headerName="Finish Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="ScrapWeight" headerName="Scrap Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="NetRmCost" headerName="Net RM Cost/Component" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="120" field="ProcessId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                            </AgGridReact>

                                        </div>
                                    </div>

                                </Col>
                            </Row>



                        </Col>
                        <div className="mt25 col-md-12 text-right">
                            <button
                                onClick={cancel} // Need to change this cancel functionality
                                type="submit"
                                value="CANCEL"
                                className="reset mr15 cancel-btn"
                            >
                                <div className={'cancel-icon'}></div>
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                // disabled={isSubmitted ? true : false}
                                className="btn-primary save-btn"
                            >
                                <div className={'save-icon'}></div>
                                {'SAVE'}
                            </button>
                        </div>
                    </form>
                </Col >
            </Row >
        </Fragment >
    )
}

export default StandardRub;