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
    const { isDomestic, list, isbulkUpload, rowCount, technology, master, isImpactedMaster, costingAndPartNo, tokenForMultiSimulation } = props
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
    const [isDisable, setIsDisable] = useState(false)
    const [tableData, setTableData] = useState([])

    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        list && list.map((item) => {
            item.NewOverheadApplicabilityType = list[0].OverheadApplicabilityType
            item.NewOverheadBOPPercentage = list[0].OverheadBOPPercentage
            item.NewOverheadMachiningCCPercentage = list[0].OverheadMachiningCCPercentage
            item.NewOverheadRMPercentage = list[0].OverheadRMPercentage
            item.NewOverheadPercentage = list[0].OverheadPercentage
            return null
        })
    }, [list])

    const dispatch = useDispatch()

    const { selectedMasterForSimulation } = useSelector(state => state.simulation)
    const { valdataTemp } = useSelector(state => state.simulation)

    const { filteredRMData } = useSelector(state => state.material)
    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
        }
        setTableData(list)
    }, [])

    const verifySimulation = debounce(() => {
        let OverheadApplicabilityTypeCount = 0
        let OverheadRMPercentageCount = 0
        let OverheadMachiningCCPercentageCount = 0
        let OverheadBOPPercentageCount = 0

        list && list.map((li) => {

            if (li.OverheadApplicabilityType === li.NewOverheadApplicabilityType || li?.NewOverheadApplicabilityType === undefined) {
                OverheadApplicabilityTypeCount = OverheadApplicabilityTypeCount + 1
            }
            if (Number(li.OverheadRMPercentage) === Number(li.NewOverheadRMPercentage) || li?.NewOverheadRMPercentage === undefined) {
                OverheadRMPercentageCount = OverheadRMPercentageCount + 1
            }
            if (Number(li.OverheadMachiningCCPercentage) === Number(li.NewOverheadMachiningCCPercentage) || li?.NewOverheadMachiningCCPercentage === undefined) {
                OverheadMachiningCCPercentageCount = OverheadMachiningCCPercentageCount + 1
            }
            if (Number(li.OverheadBOPPercentage) === Number(li.NewOverheadBOPPercentage) || li?.NewOverheadBOPPercentage === undefined) {
                OverheadBOPPercentageCount = OverheadBOPPercentageCount + 1
            }
            return null;
        })

        if (OverheadApplicabilityTypeCount === list.length && OverheadRMPercentageCount === list.length && OverheadMachiningCCPercentageCount === list.length
            && OverheadBOPPercentageCount === list.length) {
            Toaster.warning('There is no changes in new value.Please correct the data, then run simulation')
            return false
        }
        setIsDisable(true)
        OverheadApplicabilityTypeCount = 0
        OverheadRMPercentageCount = 0
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
            let tempObj = {}
            if (item.OverheadApplicabilityType !== item.NewOverheadApplicabilityType ||
                Number(item.OverheadBOPPercentage) !== Number(item.NewOverheadBOPPercentage) ||
                Number(item.OverheadRMPercentage) !== Number(item.NewOverheadRMPercentage) ||
                Number(item.OverheadMachiningCCPercentage) !== Number(item.NewOverheadMachiningCCPercentage) ||
                Number(item.OverheadPercentage) !== Number(item.NewOverheadPercentage)) {

                tempObj.CostingHead = item.CostingHead === 'Vendor Based' ? VBC : ZBC
                tempObj.ClientName = item.ClientName
                tempObj.CompanyName = item.CompanyName
                tempObj.CreatedDate = item.CreatedDate
                tempObj.EffectiveDate = item.EffectiveDate
                tempObj.IsActive = item.IsActive
                tempObj.ModelType = item.ModelType
                tempObj.ModelTypeId = item.ModelTypeId
                tempObj.OldOverheadApplicabilityId = item.OverheadApplicabilityId
                tempObj.OverheadApplicabilityType = item.OverheadApplicabilityType
                tempObj.OldOverheadBOPPercentage = item.OverheadBOPPercentage
                tempObj.OverheadId = item.OverheadId
                tempObj.OldOverheadMachiningCCPercentage = item.OverheadMachiningCCPercentage
                tempObj.OldOverheadPercentage = item.OverheadPercentage
                tempObj.OldOverheadRMPercentage = item.OverheadRMPercentage

                tempObj.NewOverheadApplicabilityType = Number(item.NewOverheadApplicabilityType)
                tempObj.NewOverheadBOPPercentage = Number(item.NewOverheadBOPPercentage)
                tempObj.NewOverheadRMPercentage = Number(item.NewOverheadRMPercentage)
                tempObj.NewOverheadMachiningCCPercentage = Number(item.NewOverheadMachiningCCPercentage)

                tempObj.TypeOfHead = item.TypeOfHead
                tempObj.VendorId = item.VendorId
                tempObj.VendorName = item.VendorName
                tempArr.push(tempObj)

                return null;
            }
        })

        obj.SimulationIds = tokenForMultiSimulation
        obj.SimulationRawMaterials = tempArr
        dispatch(runSimulationOnSelectedOverheadProfitCosting(obj, res => {

            setIsDisable(false)
            if (res.data.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
        setIsDisable(false)
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

    const newOverheadApplicabilityTypeFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCellOverheadApplicability(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewOverheadApplicabilityType :
                        <span className='form-control height33' >{value ? cell : row.OverheadApplicabilityType} </span>
                }

            </>
        )
    }
    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewBasicRate :
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
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
                        <span className='form-control height33' >{cell && value ? cell : row.BasicRate} </span>
                }

            </>
        )
    }
    const newOverheadBOPPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewOverheadBOPPercentage :
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
                }

            </>
        )
    }
    const oldOverheadBOPPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldOverheadBOPPercentage :
                        <span className='form-control height33' >{cell && value ? cell : row.OverheadBOPPercentage} </span>
                }

            </>
        )
    }
    const newOverheadMachiningCCPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewOverheadMachiningCCPercentage :
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
                }

            </>
        )
    }
    const oldOverheadMachiningCCPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldOverheadMachiningCCPercentage :
                        <span className='form-control height33' >{cell && value ? cell : row.OverheadMachiningCCPercentage} </span>
                }

            </>
        )
    }
    const newOverheadRMPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewOverheadMachiningCCPercentage :
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
                }

            </>
        )
    }
    const oldOverheadRMPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldOverheadMachiningCCPercentage :
                        <span className='form-control height33' >{cell && value ? cell : row.OverheadMachiningCCPercentage} </span>
                }

            </>
        )
    }
    const newOverheadPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewOverheadPercentage :
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
                }

            </>
        )
    }
    const oldOverheadPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldOverheadPercentage :
                        <span className='form-control height33' >{cell && value ? cell : row.OverheadPercentage} </span>
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
                        <span className='form-control height33' >{cell && value ? cell : ''}</span>
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
                        <span className='form-control height33' >{cell && value ? cell : row.ScrapRate}</span>
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
        if (cellValue === undefined) {
            return true
        }
        if (cellValue && !/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive numbers.')
            return false
        }
        return true
    }

    /**
    * @method beforeSaveCell
    * @description CHECK FOR ENTER NUMBER IN CELL
    */
    const beforeSaveCellOverheadApplicability = (props) => {
        const cellValue = props
        if ((cellValue === 'BOP' || cellValue === 'BOP + CC' || cellValue === 'CC' || cellValue === 'Fixed' || cellValue === 'RM'
            || cellValue === 'RM + BOP' || cellValue === 'RM + CC' || cellValue === 'RM + CC + BOP') && cellValue !== undefined) {
            return true
        } else {
            return false
        }
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
                Toaster.warning('There is no changes in new value. Please correct the data, then run simulation')
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
    const EditableCallbackForBOP = (props) => {
        const rowData = props?.data;
        let value = false
        switch (list[0].NewOverheadApplicabilityType) {
            case 'RM':
                value = false
                return value

            case 'CC':
                value = false
                return value

            case 'BOP':
                value = true
                return value

            case 'Fixed':
                value = false
                return value

            case 'RM + CC':


                value = false
                return value

            case 'RM + BOP':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'BOP + CC':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'RM + CC + BOP':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            default:
                return 'foo';


        }
    }
    const EditableCallbackForCC = (props) => {
        const rowData = props?.data;
        let value = false
        switch (list[0].NewOverheadApplicabilityType) {
            case 'RM':
                value = false
                return value

            case 'CC':
                value = true
                return value

            case 'BOP':
                value = false
                return value

            case 'Fixed':
                value = false
                return value

            case 'RM + CC':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value
            case 'RM + BOP':

                value = false
                return value

            case 'BOP + CC':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'RM + CC + BOP':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            default:
                return 'foo';


        }
    }
    const EditableCallbackForRM = (props) => {
        const rowData = props?.data;
        let value = false
        switch (list[0].NewOverheadApplicabilityType) {
            case 'RM':
                value = true

                return value
            case 'CC':
                value = false

                return value
            case 'BOP':
                value = false

                return value
            case 'Fixed':
                value = false

                return value
            case 'RM + CC':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value
            case 'RM + BOP':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'BOP + CC':
                value = false
                return value

            case 'RM + CC + BOP':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            default:
                return 'foo';


        }
    }
    const EditableCallbackForOP = (props, index) => {
        const rowData = props?.data;
        let value = false
        switch (list[0].NewOverheadApplicabilityType) {
            case 'RM':
                value = false
                return value

            case 'CC':
                value = false
                return value

            case 'BOP':
                value = false
                return value

            case 'Fixed':
                value = false
                return value

            case 'RM + CC':
                if ((rowData.NewOverheadMachiningCCPercentage !== null && rowData.NewOverheadMachiningCCPercentage !== undefined && rowData.NewOverheadMachiningCCPercentage !== '' && rowData.NewOverheadMachiningCCPercentage !== ' ')
                    || (rowData.NewOverheadRMPercentage !== null && rowData.NewOverheadRMPercentage !== undefined && rowData.NewOverheadRMPercentage !== '' && rowData.NewOverheadRMPercentage !== ' ')) {
                    value = false
                } else {
                    value = true
                }
                return value
            case 'RM + BOP':
                if ((rowData.NewOverheadBOPPercentage !== null && rowData.NewOverheadBOPPercentage !== undefined && rowData.NewOverheadBOPPercentage !== '' && rowData.NewOverheadBOPPercentage !== ' ')
                    || (rowData.NewOverheadRMPercentage !== null && rowData.NewOverheadRMPercentage !== undefined && rowData.NewOverheadRMPercentage !== '' && rowData.NewOverheadRMPercentage !== ' ')) {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'BOP + CC':
                if ((rowData.NewOverheadBOPPercentage !== null && rowData.NewOverheadBOPPercentage !== undefined && rowData.NewOverheadBOPPercentage !== '' && rowData.NewOverheadBOPPercentage !== ' ')
                    || (rowData.NewOverheadMachiningCCPercentage !== null && rowData.NewOverheadMachiningCCPercentage !== undefined && rowData.NewOverheadMachiningCCPercentage !== '' && rowData.NewOverheadMachiningCCPercentage !== ' ')) {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'RM + CC + BOP':
                if ((rowData.NewOverheadBOPPercentage !== null && rowData.NewOverheadBOPPercentage !== undefined && rowData.NewOverheadBOPPercentage !== '' && rowData.NewOverheadBOPPercentage !== ' ')
                    || (rowData.NewOverheadMachiningCCPercentage !== null && rowData.NewOverheadMachiningCCPercentage !== undefined && rowData.NewOverheadMachiningCCPercentage !== '' && rowData.NewOverheadMachiningCCPercentage !== ' ')
                    || (rowData.NewOverheadRMPercentage !== null && rowData.NewOverheadRMPercentage !== undefined && rowData.NewOverheadRMPercentage !== '' && rowData.NewOverheadRMPercentage !== ' ')) {
                    value = false
                } else {
                    value = true
                }
                return value

            default:
                return 'foo';


        }


        // if ((list[0].OverheadBOPPercentage !== null && list[0].OverheadBOPPercentage !== undefined)
        //     || (list[0].OverheadRMPercentage !== null && list[0].OverheadRMPercentage !== undefined)) {
        //     return false
        // } else {
        //     return true
        // }
    }

    const onCellValueChanged = (props) => {
        const rowData = props?.data;
        let value = false
        if ((props?.value === 'BOP' || props?.value === 'BOP + CC' || props?.value === 'CC' || props?.value === 'Fixed' || props?.value === 'RM'
            || props?.value === 'RM + BOP' || props?.value === 'RM + CC' || props?.value === 'RM + CC + BOP') && props?.value !== undefined) {
            list && list.map((item) => {
                item.NewOverheadApplicabilityType = props?.value
                switch (list[0].NewOverheadApplicabilityType) {
                    case 'RM':
                        item.NewOverheadBOPPercentage = ''
                        item.NewOverheadMachiningCCPercentage = ''
                        item.NewOverheadPercentage = ''

                        break;
                    case 'CC':
                        item.NewOverheadBOPPercentage = ''
                        item.NewOverheadRMPercentage = ''
                        item.NewOverheadPercentage = ''

                        break;
                    case 'BOP':
                        item.NewOverheadRMPercentage = ''
                        item.NewOverheadMachiningCCPercentage = ''
                        item.NewOverheadPercentage = ''

                        break;

                    case 'Fixed':
                        item.NewOverheadBOPPercentage = ''
                        item.NewOverheadRMPercentage = ''
                        item.NewOverheadMachiningCCPercentage = ''
                        item.NewOverheadPercentage = ''

                        break;

                    case 'RM + CC':
                        item.NewOverheadBOPPercentage = ''

                        break;

                    case 'RM + BOP':
                        item.NewOverheadMachiningCCPercentage = ''

                        break;

                    case 'BOP + CC':
                        item.NewOverheadRMPercentage = ''

                        break;

                    case 'RM + CC + BOP':

                        break;

                    default:
                        return 'foo';

                }
                return null
            })

        }
        gridApi.redrawRows()

        setApplicabilityForGrid(props.value)
    }

    const oldOverheadApplicabilityTypeFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldOverheadApplicabilityType :
                        <span className='form-control height33' >{cell ? cell : row.OverheadApplicabilityType} </span>
                }

            </>
        )
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
        newOverheadApplicabilityTypeFormatter: newOverheadApplicabilityTypeFormatter,
        cellChange: cellChange,
        oldBasicRateFormatter: oldBasicRateFormatter,
        newBasicRateFormatter: newBasicRateFormatter,
        oldScrapRateFormatter: oldScrapRateFormatter,
        cellEditorSelector: cellEditorSelector,
        applicabilityCellEditor: applicabilityCellEditor,
        modelTypeFormatter: modelTypeFormatter,
        onCellValueChanged: onCellValueChanged,
        EditableCallbackForBOP: EditableCallbackForBOP,
        EditableCallbackForCC: EditableCallbackForCC,
        EditableCallbackForRM: EditableCallbackForRM,
        EditableCallbackForOP: EditableCallbackForOP,
        oldOverheadApplicabilityTypeFormatter: oldOverheadApplicabilityTypeFormatter,
        newOverheadBOPPercentageFormatter: newOverheadBOPPercentageFormatter,
        oldOverheadBOPPercentageFormatter: oldOverheadBOPPercentageFormatter,
        oldOverheadMachiningCCPercentageFormatter: oldOverheadMachiningCCPercentageFormatter,
        newOverheadMachiningCCPercentageFormatter: newOverheadMachiningCCPercentageFormatter,
        oldOverheadRMPercentageFormatter: oldOverheadRMPercentageFormatter,
        newOverheadRMPercentageFormatter: newOverheadRMPercentageFormatter,
        oldOverheadPercentageFormatter: oldOverheadPercentageFormatter,
        newOverheadPercentageFormatter: newOverheadPercentageFormatter
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
                                <div className={`ag-grid-wrapper height-width-wrapper ${list && list?.length <= 0 ? "overlay-contain" : ""}`}>
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

                                        >
                                            {/* <AgGridColumn field="Technologies" editable='false' headerName="Technology" minWidth={190}></AgGridColumn> */}
                                            <AgGridColumn field="IsVendor" editable='false' headerName="Costing Head" minWidth={190}></AgGridColumn>
                                            <AgGridColumn field="ClientName" editable='false' headerName="Client Name" minWidth={190}></AgGridColumn>
                                            <AgGridColumn field="VendorName" editable='false' headerName="Vendor Name" minWidth={190}></AgGridColumn>

                                            <AgGridColumn field="ModelType" editable={false} headerName="Model Type" minWidth={190}></AgGridColumn>

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" headerName="Overhead Applicability Type" marryChildren={true} >
                                                <AgGridColumn width={160} field="OverheadApplicabilityType" editable='false' headerName="Old" cellRenderer='oldOverheadApplicabilityTypeFormatter' colId="OverheadApplicabilityType"></AgGridColumn>
                                                <AgGridColumn width={160} cellRenderer='newOverheadApplicabilityTypeFormatter' cellEditor="agSelectCellEditor" cellEditorParams={applicabilityCellEditor} field="NewOverheadApplicabilityType" headerName="New" colId='NewOverheadApplicabilityType'></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="OverheadApplicabilityType" cellEditor="agSelectCellEditor" cellEditorParams={applicabilityCellEditor} ></AgGridColumn> */}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Overhead BOP Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="OverheadBOPPercentage" editable='false' headerName="Old" cellRenderer='oldOverheadBOPPercentageFormatter' colId="OverheadBOPPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newOverheadBOPPercentageFormatter' onCellValueChanged='cellChange' field="NewOverheadBOPPercentage" headerName="New" colId='NewOverheadBOPPercentage' editable={EditableCallbackForBOP}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="OverheadBOPPercentage" headerName="Overhead BOP Percentage" minWidth={190} editable={EditableCallbackForBOP} ></AgGridColumn> */}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Overhead Machining CC Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="OverheadMachiningCCPercentage" editable='false' headerName="Old" cellRenderer='oldOverheadMachiningCCPercentageFormatter' colId="OverheadMachiningCCPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newOverheadMachiningCCPercentageFormatter' onCellValueChanged='cellChange' field="NewOverheadMachiningCCPercentage" headerName="New" colId='NewOverheadMachiningCCPercentage' editable={EditableCallbackForCC}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="OverheadMachiningCCPercentage" headerName="Overhead Machining CC Percentage" editable={EditableCallbackForCC} minWidth={190}></AgGridColumn> */}


                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Overhead RM Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="OverheadRMPercentage" editable='false' headerName="Old" cellRenderer='oldOverheadRMPercentageFormatter' colId="OverheadRMPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newOverheadRMPercentageFormatter' onCellValueChanged='cellChange' field="NewOverheadRMPercentage" headerName="New" colId='NewOverheadRMPercentage' editable={EditableCallbackForRM}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="OverheadRMPercentage" headerName="Overhead RM Percentage" minWidth={190} editable={EditableCallbackForRM} ></AgGridColumn> */}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Overhead Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="OverheadPercentage" editable='false' headerName="Old" cellRenderer='oldOverheadPercentageFormatter' colId="OverheadPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newOverheadPercentageFormatter' onCellValueChanged='cellChange' field="NewOverheadPercentage" headerName="New" colId='NewOverheadPercentage' editable={EditableCallbackForOP}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="OverheadPercentage" headerName="Overhead Percentage" minWidth={190} editable={EditableCallbackForOP}></AgGridColumn> */}


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
                                    <button onClick={verifySimulation} type="submit" className="user-btn mr5 save-btn" disabled={isDisable}>
                                        <div className={"Run-icon"}>
                                        </div>{" "}
                                        {"Verify"}
                                    </button>

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