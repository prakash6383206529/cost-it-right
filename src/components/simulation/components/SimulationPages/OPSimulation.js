import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { EMPTY_DATA } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import Toaster from '../../../common/Toaster';
import { runSimulationOnSelectedBoughtOutPartCosting, runSimulationOnSelectedOverheadProfitCosting, setData } from '../../actions/Simulation';
import { Fragment } from 'react';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { useForm, Controller, useWatch } from 'react-hook-form'
import RunSimulationDrawer from '../RunSimulationDrawer';
import VerifySimulation from '../VerifySimulation';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { data } from 'jquery';
import Simulation from '../Simulation';
import { debounce } from 'lodash'
import { VBC, ZBC } from '../../../../config/constants';

const gridOptions = {

};


function OPSImulation(props) {
    const { isDomestic, list, isbulkUpload, rowCount, technology, master, isImpactedMaster, costingAndPartNo } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [colorClass, setColorClass] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)
    const [valuesForDropdownInAgGrid, setValuesForDropdownInAgGrid] = useState(
        {
            applicability: ['BOP', 'BOP + CC', 'CC', 'Fixed', 'RM', 'RM + BOP', 'RM + CC', 'RM + CC + BOP'],
            modelType: ['All', 'High Volume', 'Low Volume', 'Medium Volume', 'New Development']
        }
    )
    const [applicabilityForGrid, setApplicabilityForGrid] = useState('')

    const [isRM, setIsRM] = useState(false)
    const [isCC, setIsCC] = useState(false)
    const [isBOP, setIsBOP] = useState(false)
    const [isOverheadPercent, setIsOverheadPercent] = useState(false)
    const [reload, setReload] = useState(true)
    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    useEffect(() => {
        // console.log('gridOptions.columnApi: ', gridOptions);

        console.log(gridApi, 'gridApigridApi');
        // if (gridApi !== null) {
        //     gridApi.redrawRows();
        // }



    }, [isBOP])
    // useEffect(() => {
    //     setValuesForDropdownInAgGrid(prevState => ({ ...prevState, applicability: ['BOP', 'BOP + CC', 'CC', 'Fixed', 'RM', 'RM + BOP', 'RM + CC', 'RM + CC + BOP'] }))
    //     setValuesForDropdownInAgGrid(prevState => ({ ...prevState, modelType: ['All', 'High Volume', 'Low Volume', 'Medium Volume', 'New Development'] }))
    // }, [])

    const dispatch = useDispatch()

    const { selectedMasterForSimulation } = useSelector(state => state.simulation)
    const { valdataTemp } = useSelector(state => state.simulation)

    const { filteredRMData } = useSelector(state => state.material)
    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
        }
    }, [])

    const verifySimulation = debounce(() => {
        let basicRateCount = 0
        let basicScrapCount = 0

        list && list.map((li) => {

            if (Number(li.BasicRate) === Number(li.NewBasicRate) || li?.NewBasicRate === undefined) {

                basicRateCount = basicRateCount + 1
            }
            if (Number(li.ScrapRate) === Number(li.NewScrapRate) || li?.NewScrapRate === undefined) {
                basicScrapCount = basicScrapCount + 1
            }
            return null;
        })

        // if (basicRateCount === list.length && basicScrapCount === list.length) {
        //     Toaster.warning('There is no changes in new value.Please correct the data ,then run simulation')
        //     return false
        // }
        basicRateCount = 0
        basicScrapCount = 0
        // setShowVerifyPage(true)
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
        let obj = {}
        obj.Technology = technology
        obj.SimulationTechnologyId = selectedMasterForSimulation.value
        obj.CostingHead = list[0].CostingHead === 'Vendor Based' ? VBC : ZBC
        obj.Masters = master
        obj.LoggedInUserId = loggedInUserId()

        obj.TechnologyId = list[0].TechnologyId

        if (filteredRMData.plantId && filteredRMData.plantId.value) {
            obj.PlantId = filteredRMData.plantId ? filteredRMData.plantId.value : ''
        }
        let tempArr = []
        list && list.map(item => {
            if ((item.NewBasicRate !== undefined || item.NewScrapRate !== undefined) && ((item.NewBasicRate !== undefined ? Number(item.NewBasicRate) : Number(item.BasicRate)) !== Number(item.BasicRate) || (item.NewScrapRate !== undefined ? Number(item.NewScrapRate) : Number(item.ScrapRate)) !== Number(item.ScrapRate))) {
                let tempObj = {}
                tempObj.CostingHead = item.CostingHead === 'Vendor Based' ? VBC : ZBC
                tempObj.RawMaterialName = item.RawMaterial
                tempObj.MaterialType = item.MaterialType
                tempObj.RawMaterialGrade = item.RMGrade
                tempObj.RawMaterialSpecification = item.RMSpec
                tempObj.RawMaterialCategory = item.Category
                tempObj.UOM = item.UOM
                tempObj.OldBasicRate = item.BasicRate
                tempObj.NewBasicRate = item.NewBasicRate ? item.NewBasicRate : item.BasicRate
                tempObj.OldScrapRate = item.ScrapRate
                tempObj.NewScrapRate = item.NewScrapRate ? item.NewScrapRate : item.ScrapRate
                tempObj.RawMaterialFreightCost = checkForNull(item.RMFreightCost)
                tempObj.RawMaterialShearingCost = checkForNull(item.RMShearingCost)
                tempObj.OldNetLandedCost = item.NetLandedCost
                tempObj.NewNetLandedCost = Number(item.NewBasicRate ? item.NewBasicRate : item.BasicRate) + checkForNull(item.RMShearingCost) + checkForNull(item.RMFreightCost)
                tempObj.EffectiveDate = item.EffectiveDate
                tempObj.RawMaterialId = item.RawMaterialId
                tempObj.PlantId = item.PlantId
                tempObj.VendorId = item.VendorId
                tempObj.Delta = 0
                tempArr.push(tempObj)
            }
            return null;
        })
        obj.SimulationRawMaterials = tempArr

        dispatch(runSimulationOnSelectedOverheadProfitCosting(obj, res => {

            if (res.data.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
        setShowVerifyPage(true)
    }, 500)


    const cancelVerifyPage = () => {

        setShowVerifyPage(false)
    }


    /**
     * @method shearingCostFormatter
     * @description Renders buttons
     */
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? cell : '-';
    }
    const reloadIt = () => {
        setReload(false)
        setTimeout(() => {

        }, 200);
        setReload(true)
    }
    /**
    * @method freightCostFormatter
    * @description Renders buttons
    */
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? cell : '-';
    }


    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
    }


    const costingHeadFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return (cell === true || cell === 'Vendor Based') ? 'Vendor Based' : 'Zero Based';
    }

    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        Number(row.NewBasicRate) :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.BasicRate)} </span>
                }

            </>
        )
    }
    const oldBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldBasicRate :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.BasicRate)} </span>
                }

            </>
        )
    }


    const newScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewScrapRate :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.ScrapRate)}</span>
                }
            </>
        )
    }
    const oldScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldScrapRate :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.ScrapRate)}</span>
                }
            </>
        )
    }

    // const colorCheck = 

    const costFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewBasicRate || row.BasicRate === row.NewBasicRate || row.NewBasicRate === '') return checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)
        const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
        const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const renderPaginationShowsTotal = (start, to, total) => {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
  * @method beforeSaveCell
  * @description CHECK FOR ENTER NUMBER IN CELL
  */
    const beforeSaveCell = (props) => {
        const cellValue = props
        if (Number.isInteger(Number(cellValue)) && /^\+?(0|[1-9]\d*)$/.test(cellValue) && cellValue.toString().replace(/\s/g, '').length) {
            if (cellValue.length > 8) {
                Toaster.warning("Value should not be more than 8")
                return false
            }
            return true
        } else if (cellValue && !/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive numbers.')
            return false
        }
        return true
    }

    const afterSaveCell = (row, cellName, cellValue, index) => {

        if ((Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)) > row.NetLandedCost) {
            setColorClass('red-value form-control')
        } else if ((Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)) < row.NetLandedCost) {
            setColorClass('green-value form-control')
        } else {
            setColorClass('form-class')
        }
        return false

    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewBasicRate || Number(row.BasicRate) === Number(row.NewBasicRate) || row.NewBasicRate === '') return ''
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }

    const modelTypeFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewBasicRate || Number(row.BasicRate) === Number(row.NewBasicRate) || row.NewBasicRate === '') return ''
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        // return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }

    const runSimulation = () => {
        let basicRateCount = 0
        let basicScrapCount = 0
        list && list.map((li) => {
            if (li.BasicRate === li.NewBasicRate) {
                basicRateCount = basicRateCount + 1
            }
            if (li.ScrapRate === li.NewScrapRate) {
                basicScrapCount = basicScrapCount + 1
            }

            if (basicRateCount === list.length || basicScrapCount === list.length) {
                Toaster.warning('There is no changes in new value.Please correct the data ,then run simulation')
            } else {
                setShowRunSimulationDrawer(true)
            }

        })
    }
    const applicabilityCellEditor = (params) => {
        const selectedCountry = params.data?.OverheadApplicabilityType;
        const allowedCities = valuesForDropdownInAgGrid.applicability;

        return {
            values: allowedCities,
            formatValue: (value) => `${value} (${selectedCountry})`,
        };
    };
    const modelTypeCellEditor = (params) => {
        const selectedCountry = params.data?.ModelType;
        const allowedCities = valuesForDropdownInAgGrid.modelType;

        return {
            values: allowedCities,
            formatValue: (value) => `${value} (${selectedCountry})`,
        };
    };
    const cancel = () => {
        // props.cancelEditPage()
        setShowMainSimulation(true)
    }

    const closeDrawer = (e = '') => {
        setShowRunSimulationDrawer(false)

    }
    const textTemp = () => {
        props.openEditPageReload()
    }
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        editable: true
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        window.screen.width >= 1600 && params.api.sizeColumnsToFit();
        if (isImpactedMaster) {
            window.screen.width >= 1365 && params.api.sizeColumnsToFit();
        }
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const checkOverheadFields = (applicabilityForGridProp) => {

        switch (applicabilityForGridProp) {
            case 'RM':
                setIsRM(false)
                setIsCC(true)
                setIsBOP(true)
                setIsOverheadPercent(true)
                // setIsHideOverhead(true)
                // setIsHideRM(false)
                // setIsHideCC(true)
                // setIsHideBOP(true)
                // gridApi.redrawRows();

                // dispatch(setData(true))
                // reloadIt()
                break;
            case 'CC':
                setIsRM(true)
                setIsCC(false)
                setIsBOP(true)
                setIsOverheadPercent(true)
                // setIsHideOverhead(true)
                // setIsHideRM(true)
                // setIsHideCC(false)
                // setIsHideBOP(true)
                // gridApi.redrawRows();
                // dispatch(setData(false))
                // reloadIt()
                break;
            case 'BOP':
                setIsRM(true)
                setIsBOP(false)
                setIsCC(true)
                setIsOverheadPercent(true)
                // setIsHideOverhead(true)
                // setIsHideRM(true)
                // setIsHideCC(true)
                // setIsHideBOP(false)
                // gridApi.redrawRows();
                break;
            case 'Fixed':
                setIsRM(true)
                setIsCC(true)
                setIsBOP(true)
                setIsOverheadPercent(true)
                // setIsHideOverhead(true)
                // setIsHideRM(true)
                // setIsHideCC(true)
                // setIsHideBOP(true)
                // gridApi.redrawRows();
                break;
            case 'RM + CC':
                setIsRM(false)
                setIsCC(false)
                setIsBOP(true)
                setIsOverheadPercent(false)
                // setIsHideOverhead(false)
                // setIsHideBOP(true)
                // setIsHideRM(false)
                // setIsHideCC(false)
                // gridApi.redrawRows();
                break;
            case 'RM + BOP':
                setIsRM(false)
                setIsCC(true)
                setIsBOP(false)
                setIsOverheadPercent(false)
                // setIsHideOverhead(false)
                // setIsHideCC(true)
                // setIsHideRM(false)
                // setIsHideBOP(false)
                // gridApi.redrawRows();
                break;
            case 'BOP + CC':
                setIsRM(true)
                setIsBOP(false)
                setIsCC(false)
                setIsOverheadPercent(false)
                // setIsHideOverhead(false)
                // setIsHideRM(true)
                // setIsHideBOP(false)
                // setIsHideCC(false)
                // gridApi.redrawRows();
                break;
            case 'RM + CC + BOP':
                setIsRM(false)
                setIsCC(false)
                setIsBOP(false)
                setIsOverheadPercent(false)
                // setIsHideOverhead(false)
                // setIsHideBOP(false)
                // setIsHideCC(false)
                // setIsHideRM(false)

                // gridApi.redrawRows();
                break;
            default:
                return 'foo';

        }

        var params = {
            force: true,
            suppressFlash: false,
        };
        // gridOptions.api.refreshCells(params);
    }

    const cellChange = (props) => {
        // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;

    }

    const cellEditorSelector = (params) => {
        return {
            component: 'agRichSelectCellEditor',
            params: { values: valuesForDropdownInAgGrid.applicability }
        };
    }
    const EditableCallback = (props) => {

        // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return true
    }
    const onCellValueChanged = (props) => {
        setApplicabilityForGrid(props.value)
        checkOverheadFields(props.value);
    }

    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        costingHeadFormatter: costingHeadFormatter,
        shearingCostFormatter: shearingCostFormatter,
        freightCostFormatter: freightCostFormatter,
        newScrapRateFormatter: newScrapRateFormatter,
        NewcostFormatter: NewcostFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newBasicRateFormatter: newBasicRateFormatter,
        cellChange: cellChange,
        oldBasicRateFormatter: oldBasicRateFormatter,
        oldScrapRateFormatter: oldScrapRateFormatter,
        cellEditorSelector: cellEditorSelector,
        applicabilityCellEditor: applicabilityCellEditor,
        modelTypeFormatter: modelTypeFormatter,
        onCellValueChanged: onCellValueChanged,
        EditableCallback: EditableCallback
    };







    // 
    // 
    // 
    return (

        <div>
            <div className={`ag-grid-react`}>

                {


                    (!showverifyPage && !showMainSimulation) &&
                    <Fragment>
                        {
                            isbulkUpload &&
                            <Row className="sm-edit-row justify-content-end">
                                <Col md="6">
                                    <div className="d-flex align-items-center">
                                        <label>No of rows with changes:</label>
                                        <TextFieldHookForm
                                            label=""
                                            name={'NoOfCorrectRow'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{ required: false }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder mn-height-auto hide-label mb-0'}
                                            errors={errors.NoOfCorrectRow}
                                            disabled={true}
                                        />
                                    </div>
                                </Col>
                                <Col md="6">
                                    <div className="d-flex align-items-center">
                                        <label>No of rows without changes:</label>
                                        <TextFieldHookForm
                                            label=""
                                            name={'NoOfRowsWithoutChange'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{ required: false }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder mn-height-auto hide-label mb-0'}
                                            errors={errors.NoOfRowsWithoutChange}
                                            disabled={true}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        }
                        <Row>
                            <Col className="add-min-height mb-3 sm-edit-page">
                                <div className="ag-grid-wrapper height-width-wrapper">
                                    <div className="ag-grid-header">
                                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                    </div>
                                    <div className="ag-theme-material" style={{ width: '100%' }}>
                                        <AgGridReact
                                            floatingFilter={true}
                                            style={{ height: '100%', width: '100%' }}
                                            defaultColDef={defaultColDef}
                                            domLayout='autoHeight'
                                            // columnDefs={c}
                                            rowData={list}
                                            pagination={true}
                                            paginationPageSize={10}
                                            onGridReady={onGridReady}
                                            gridOptions={gridOptions}
                                            loadingOverlayComponent={'customLoadingOverlay'}
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                            }}
                                            frameworkComponents={frameworkComponents}
                                            stopEditingWhenCellsLoseFocus={true}
                                            onCellValueChanged={onCellValueChanged}
                                            EditableCallback={EditableCallback}

                                        >
                                            {/* <AgGridColumn field="Technologies" editable='false' headerName="Technology" minWidth={190}></AgGridColumn> */}
                                            <AgGridColumn field="IsVendor" editable='false' headerName="Costing Head" minWidth={190}></AgGridColumn>
                                            <AgGridColumn field="ClientName" editable='false' headerName="Client Name" minWidth={190}></AgGridColumn>
                                            <AgGridColumn field="VendorName" editable='false' headerName="Vendor Name" minWidth={190}></AgGridColumn>

                                            <AgGridColumn field="ModelType" editable={false} headerName="Model Type" minWidth={190}></AgGridColumn>
                                            <AgGridColumn field="OverheadApplicabilityType" cellEditor="agSelectCellEditor" cellEditorParams={applicabilityCellEditor} ></AgGridColumn>

                                            <AgGridColumn field="OverheadBOPPercentage" headerName="Overhead BOP Percentage" editable={isBOP} minWidth={190}  ></AgGridColumn>
                                            {/* <AgGridColumn field="OverheadBOPPercentage" headerName="Overhead BOP Percentage" minWidth={190} editable={isBOP} ></AgGridColumn> */}
                                            {/* <AgGridColumn field="OverheadMachiningCCPercentage" headerName="Overhead Machining CC Percentage" editable={isCC} minWidth={190}></AgGridColumn>
                                                <AgGridColumn field="OverheadPercentage" headerName="Overhead Percentage" minWidth={190} editable={isOverheadPercent}></AgGridColumn>
                                                <AgGridColumn field="OverheadRMPercentage" headerName="Overhead RM Percentage" minWidth={190} editable={isRM} ></AgGridColumn>  */}


                                            <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                            <AgGridColumn field="CostingId" hide={true}></AgGridColumn>


                                        </AgGridReact>

                                        <div className="paging-container d-inline-block float-right">
                                            <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                                <option value="10" selected={true}>10</option>
                                                <option value="50">50</option>
                                                <option value="100">100</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                            </Col>
                        </Row>
                        {
                            !isImpactedMaster &&
                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                <div className="col-sm-12 text-right bluefooter-butn">
                                    <button type={"button"} className="mr15 cancel-btn" onClick={cancel}>
                                        <div className={"cancel-icon"}></div>
                                        {"CANCEL"}
                                    </button>
                                    <button onClick={verifySimulation} type="submit" className="user-btn mr5 save-btn">
                                        <div className={"Run-icon"}>
                                        </div>{" "}
                                        {"Verify"}
                                    </button>
                                    <button type="button" className={"user-btn mt2 mr5"} onClick={reloadIt} >
                                        <div className={"edit-icon"}></div>  {"RELOAD"} </button>


                                    {/* <button onClick={runSimulation} type="submit" className="user-btn mr5 save-btn"                    >
                                <div className={"Run"}>
                                </div>{" "}
                                {"RUN SIMULATION"}
                            </button> */}
                                </div>
                            </Row>
                        }
                    </Fragment>

                }
                {
                    showverifyPage &&
                    <VerifySimulation token={token} cancelVerifyPage={cancelVerifyPage} />
                }

                {
                    showMainSimulation && <Simulation isRMPage={true} />
                }
                {
                    showRunSimulationDrawer &&
                    <RunSimulationDrawer
                        isOpen={showRunSimulationDrawer}
                        closeDrawer={closeDrawer}
                        anchor={"right"}
                    />
                }
            </div>
        </div>
    );
}


export default OPSImulation;