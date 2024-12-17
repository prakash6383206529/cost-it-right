import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { defaultPageSize, EMPTY_DATA } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, showBopLabel } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { Fragment } from 'react';
import RunSimulationDrawer from '../RunSimulationDrawer';
import VerifySimulation from '../VerifySimulation';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Simulation from '../Simulation';
import { debounce } from 'lodash'
import { VBC, ZBC } from '../../../../config/constants';
import { runVerifyProfitSimulation } from '../../actions/Simulation';
import { checkForChangeInOverheadProfit1Values, checkForChangeInOverheadProfit2Values, checkForChangeInOverheadProfit3Values } from '../../SimulationUtils';
import { PaginationWrapper } from '../../../common/commonPagination';
import { isResetClick } from '../../../../actions/Common';
const gridOptions = {

};


function ProfitSimulation(props) {
    const { list, technology, master, isImpactedMaster, tokenForMultiSimulation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)
    const [valuesForDropdownInAgGrid, setValuesForDropdownInAgGrid] = useState(
        {
            applicability: [`BOP`, `BOP + CC`, 'CC', 'Fixed', 'RM', `RM + BOP`, 'RM + CC', `RM + CC + BOP`],
            modelType: ['All', 'High Volume', 'Low Volume', 'Medium Volume', 'New Development']
        }
    )
    const [applicabilityForGrid, setApplicabilityForGrid] = useState('')
    const [isDisable, setIsDisable] = useState(false)
    const [tableData, setTableData] = useState([])

    useEffect(() => {
        list && list.map((item) => {
            item.NewProfitApplicabilityType = item.ProfitApplicabilityType
            item.NewProfitBOPPercentage = item.ProfitBOPPercentage
            item.NewProfitMachiningCCPercentage = item.ProfitMachiningCCPercentage
            item.NewProfitRMPercentage = item.ProfitRMPercentage
            item.NewProfitPercentage = item.ProfitPercentage
            return null
        })
    }, [list])

    const dispatch = useDispatch()

    const { selectedMasterForSimulation } = useSelector(state => state.simulation)

    const { filteredRMData } = useSelector(state => state.material)
    useEffect(() => {
        setTableData(list)
        return () => {
            dispatch(isResetClick(true, "costingHead"))
          }
    }, [])

    const verifySimulation = debounce(() => {
        let ProfitApplicabilityTypeCount = 0
        let ProfitRMPercentageCount = 0
        let ProfitMachiningCCPercentageCount = 0
        let ProfitBOPPercentageCount = 0
        let ProfitPercentageCount = 0
        let temp = 0
        let tempRM = 0
        let tempCC = 0
        let tempBOP = 0
        let tempRMCC = 0
        let tempRMBOP = 0
        let tempBOPCC = 0
        let tempRMCCBOP = 0
        let value = 0

        let tempObj = new Set([]);

        list && list.map((item) => {
            tempRM = 0
            tempCC = 0
            tempBOP = 0
            tempRMCC = 0
            tempRMBOP = 0
            tempBOPCC = 0
            tempRMCCBOP = 0

            switch (item.NewProfitApplicabilityType) {
                case 'RM':
                    let tempRMValue = []
                    tempRMValue.NewValue = item.NewProfitRMPercentage
                    tempRMValue.Value = item.ProfitRMPercentage
                    if (checkForChangeInOverheadProfit1Values(tempRMValue)) {
                        tempObj.add(item)
                        tempRMBOP = 1
                    }
                    break;

                case 'CC':
                    let tempCCValue = []
                    tempCCValue.NewValue = item.NewProfitMachiningCCPercentage
                    tempCCValue.Value = item.ProfitMachiningCCPercentage
                    if (checkForChangeInOverheadProfit1Values(tempCCValue)) {
                        tempObj.add(item)
                        tempRMBOP = 1
                    }
                    break;

                case 'BOP':
                    let tempBOPValue = []
                    tempBOPValue.NewValue = item.NewProfitBOPPercentage
                    tempBOPValue.Value = item.ProfitBOPPercentage
                    if (checkForChangeInOverheadProfit1Values(tempBOPValue)) {
                        tempObj.add(item)
                        tempRMBOP = 1
                    }
                    break;

                case 'Fixed':
                    tempObj.add(item)

                    break;

                case 'RM + CC':
                    let tempRM_CC_Value = []
                    tempRM_CC_Value.NewApplicabilityType = item.NewProfitApplicabilityType
                    tempRM_CC_Value.ApplicabilityType = item.ProfitApplicabilityType
                    tempRM_CC_Value.NewProfitPercentage = item.NewProfitPercentage
                    tempRM_CC_Value.ProfitPercentage = item.ProfitPercentage
                    tempRM_CC_Value.NewFirstValue = item.NewProfitRMPercentage
                    tempRM_CC_Value.FirstValue = item.ProfitRMPercentage
                    tempRM_CC_Value.NewSecondValue = item.NewProfitMachiningCCPercentage
                    tempRM_CC_Value.SecondValue = item.ProfitMachiningCCPercentage

                    if (checkForChangeInOverheadProfit2Values(tempRM_CC_Value)) {
                        tempObj.add(item)
                        tempRMBOP = 1
                    }
                    break;

                case 'RM + BOP':
                    let tempRM_BOP_Value = []
                    tempRM_BOP_Value.NewApplicabilityType = item.NewProfitApplicabilityType
                    tempRM_BOP_Value.ApplicabilityType = item.ProfitApplicabilityType
                    tempRM_BOP_Value.NewProfitPercentage = item.NewProfitPercentage
                    tempRM_BOP_Value.ProfitPercentage = item.ProfitPercentage
                    tempRM_BOP_Value.NewFirstValue = item.NewProfitRMPercentage
                    tempRM_BOP_Value.FirstValue = item.ProfitRMPercentage
                    tempRM_BOP_Value.NewSecondValue = item.NewProfitBOPPercentage
                    tempRM_BOP_Value.SecondValue = item.ProfitBOPPercentage

                    if (checkForChangeInOverheadProfit2Values(tempRM_BOP_Value)) {
                        tempObj.add(item)
                        tempRMBOP = 1
                    }
                    break;
                case 'BOP + CC':
                    let tempBOP_CC_Value = []
                    tempBOP_CC_Value.NewApplicabilityType = item.NewProfitApplicabilityType
                    tempBOP_CC_Value.ApplicabilityType = item.ProfitApplicabilityType
                    tempBOP_CC_Value.NewProfitPercentage = item.NewProfitPercentage
                    tempBOP_CC_Value.ProfitPercentage = item.ProfitPercentage
                    tempBOP_CC_Value.NewFirstValue = item.NewProfitMachiningCCPercentage
                    tempBOP_CC_Value.FirstValue = item.ProfitMachiningCCPercentage
                    tempBOP_CC_Value.NewSecondValue = item.NewProfitBOPPercentage
                    tempBOP_CC_Value.SecondValue = item.ProfitBOPPercentage

                    if (checkForChangeInOverheadProfit2Values(tempBOP_CC_Value)) {
                        tempObj.add(item)
                        tempRMBOP = 1
                    }
                    break;

                case 'RM + CC + BOP':
                    let tempRM_CC_BOP_value = []
                    tempRM_CC_BOP_value.NewApplicabilityType = item.NewProfitApplicabilityType
                    tempRM_CC_BOP_value.ApplicabilityType = item.ProfitApplicabilityType
                    tempRM_CC_BOP_value.NewProfitPercentage = item.NewProfitPercentage
                    tempRM_CC_BOP_value.ProfitPercentage = item.ProfitPercentage
                    tempRM_CC_BOP_value.NewFirstValue = item.NewProfitMachiningCCPercentage
                    tempRM_CC_BOP_value.FirstValue = item.ProfitMachiningCCPercentage
                    tempRM_CC_BOP_value.NewSecondValue = item.NewProfitBOPPercentage
                    tempRM_CC_BOP_value.SecondValue = item.ProfitBOPPercentage
                    tempRM_CC_BOP_value.NewThirdValue = item.NewProfitMachiningCCPercentage
                    tempRM_CC_BOP_value.ThirdValue = item.ProfitMachiningCCPercentage

                    if (checkForChangeInOverheadProfit3Values(tempRM_CC_BOP_value)) {
                        tempObj.add(item)
                        tempRMBOP = 1
                    }
                    break;
                default:
                    return 'foo';
            }
            return null
        })
        list && list.map((item) => {
            tempRM = 0
            tempCC = 0
            tempBOP = 0
            tempRMCC = 0
            tempRMBOP = 0
            tempBOPCC = 0
            tempRMCCBOP = 0
            switch (item.NewProfitApplicabilityType) {
                case 'RM':
                    if (item.NewProfitRMPercentage === null || item.NewProfitRMPercentage === undefined
                        || item.NewProfitRMPercentage === '' || item.NewProfitRMPercentage === ' ') {

                        tempRM = 1
                    }
                    break;

                case 'CC':
                    if (item.NewProfitMachiningCCPercentage === null || item.NewProfitMachiningCCPercentage === undefined
                        || item.NewProfitMachiningCCPercentage === '' || item.NewProfitMachiningCCPercentage === ' ') {

                        tempCC = 1
                    }
                    break;

                case 'BOP':
                    if (item.NewProfitBOPPercentage === null || item.NewProfitBOPPercentage === undefined
                        || item.NewProfitBOPPercentage === '' || item.NewProfitBOPPercentage === ' ') {

                        tempBOP = 1
                    }
                    break;

                case 'Fixed':

                    break;

                case 'RM + CC':
                    if ((item.NewProfitPercentage === null || item.NewProfitPercentage === undefined
                        || item.NewProfitPercentage === '' || item.NewProfitPercentage === ' ') &&

                        ((item.NewProfitRMPercentage === null || item.NewProfitRMPercentage === undefined
                            || item.NewProfitRMPercentage === '' || item.NewProfitRMPercentage === ' ') ||

                            (item.NewProfitMachiningCCPercentage === null || item.NewProfitMachiningCCPercentage === undefined
                                || item.NewProfitMachiningCCPercentage === '' || item.NewProfitMachiningCCPercentage === ' '))) {

                        tempRMCC = 1
                    }
                    break;

                case 'RM + BOP':
                    if ((item.NewProfitPercentage === null || item.NewProfitPercentage === undefined
                        || item.NewProfitPercentage === '' || item.NewProfitPercentage === ' ') &&

                        ((item.NewProfitRMPercentage === null || item.NewProfitRMPercentage === undefined
                            || item.NewProfitRMPercentage === '' || item.NewProfitRMPercentage === ' ') ||

                            (item.NewProfitBOPPercentage === null || item.NewProfitBOPPercentage === undefined
                                || item.NewProfitBOPPercentage === '' || item.NewProfitBOPPercentage === ' '))) {

                        tempRMBOP = 1
                    }
                    break;
                case 'BOP + CC':
                    if ((item.NewProfitPercentage === null || item.NewProfitPercentage === undefined
                        || item.NewProfitPercentage === '' || item.NewProfitPercentage === ' ') &&

                        ((item.NewProfitMachiningCCPercentage === null || item.NewProfitMachiningCCPercentage === undefined
                            || item.NewProfitMachiningCCPercentage === '' || item.NewProfitMachiningCCPercentage === ' ') ||

                            (item.NewProfitBOPPercentage === null || item.NewProfitBOPPercentage === undefined
                                || item.NewProfitBOPPercentage === '' || item.NewProfitBOPPercentage === ' '))) {

                        tempBOPCC = 1
                    }
                    break;

                case 'RM + CC + BOP':
                    if ((item.NewProfitPercentage === null || item.NewProfitPercentage === undefined
                        || item.NewProfitPercentage === '' || item.NewProfitPercentage === ' ') &&

                        ((item.NewProfitRMPercentage === null || item.NewProfitRMPercentage === undefined
                            || item.NewProfitRMPercentage === '' || item.NewProfitRMPercentage === ' ') ||

                            (item.NewProfitBOPPercentage === null || item.NewProfitBOPPercentage === undefined
                                || item.NewProfitBOPPercentage === '' || item.NewProfitBOPPercentage === ' ') ||

                            (item.NewProfitMachiningCCPercentage === null || item.NewProfitMachiningCCPercentage === undefined
                                || item.NewProfitMachiningCCPercentage === '' || item.NewProfitMachiningCCPercentage === ' '))) {

                        tempRMCCBOP = 1
                    }
                    break;
                default:
                    return 'foo';
            }
            // if all 0 then temp 0         // IF THERE ARE CHANGES THEN 0        !== 0 -> no changes
            if (tempRM !== 0 || tempCC !== 0 || tempBOP !== 0 || tempRMCC !== 0 || tempRMBOP !== 0 || tempBOPCC !== 0 || tempRMCCBOP !== 0) {
                temp = temp + 1
            } else {
                value = value + 1
            }
            return null
        })

        if ((Number(temp) <= Number(list.length))) {
            if (tempRM !== 0) {
                Toaster.warning('Please fill RM');
                return false
            } else if (tempCC !== 0) {
                Toaster.warning('Please fill CC');
                return false
            } else if (tempBOP !== 0) {
                Toaster.warning(`Please fill ${showBopLabel()}`);
                return false
            } else if (tempRMCC !== 0) {
                Toaster.warning('Please fill both RM and CC or Profit Percentage');
                return false
            } else if (tempRMBOP !== 0) {
                Toaster.warning(`Please fill both RM and ${showBopLabel()} or Profit Percentage`);
                return false
            } else if (tempBOPCC !== 0) {
                Toaster.warning(`Please fill both ${showBopLabel()} and CC or Profit Percentage`);
                return false
            } else if (tempRMCCBOP !== 0) {
                Toaster.warning(`Please fill all values RM, CC and ${showBopLabel()} or Profit Percentage`);
                return false
            }
        }

        list && list.map((li) => {

            if (li.ProfitApplicabilityType === li.NewProfitApplicabilityType || li?.NewProfitApplicabilityType === undefined) {
                ProfitApplicabilityTypeCount = ProfitApplicabilityTypeCount + 1
            }

            if ((String(li.NewProfitPercentage) !== '' ? String(li.ProfitPercentage) === String(li.NewProfitPercentage) : true) || li?.NewProfitPercentage === undefined
                || li?.NewProfitPercentage === null || li?.NewProfitPercentage === '') {
                ProfitPercentageCount = ProfitPercentageCount + 1
            }
            if (String(li.ProfitRMPercentage) === String(li.NewProfitRMPercentage) || li?.NewProfitRMPercentage === undefined
                || li?.NewProfitRMPercentage === null || li?.NewProfitRMPercentage === '') {
                ProfitRMPercentageCount = ProfitRMPercentageCount + 1
            }
            if (String(li.ProfitMachiningCCPercentage) === String(li.NewProfitMachiningCCPercentage) || li?.NewProfitMachiningCCPercentage === undefined
                || li?.NewProfitMachiningCCPercentage === null || li?.NewProfitMachiningCCPercentage === '') {
                ProfitMachiningCCPercentageCount = ProfitMachiningCCPercentageCount + 1
            }

            if (String(li.ProfitBOPPercentage) === String(li.NewProfitBOPPercentage) || li?.NewProfitBOPPercentage === undefined
                || li?.NewProfitBOPPercentage === null || li?.NewProfitBOPPercentage === '') {
                ProfitBOPPercentageCount = ProfitBOPPercentageCount + 1
            }
            return null;
        })

        // if (ProfitPercentageCount === list.length && ProfitRMPercentageCount === list.length
        //     && ProfitMachiningCCPercentageCount === list.length && ProfitBOPPercentageCount === list.length) {
        //     Toaster.warning('There is no changes in new value.Please correct the data, then run simulation')
        //     return false
        // }

        if (ProfitApplicabilityTypeCount === list.length && ProfitPercentageCount === list.length &&
            ProfitRMPercentageCount === list.length && ProfitMachiningCCPercentageCount === list.length &&
            ProfitBOPPercentageCount === list.length) {
            Toaster.warning('There is no changes in net cost. Please change the basic rate, then run simulation')
            return false
        }
        setIsDisable(true)
        ProfitApplicabilityTypeCount = 0
        ProfitRMPercentageCount = 0
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
            if (Number(item.ProfitBOPPercentage) !== Number(item.NewProfitBOPPercentage) ||
                Number(item.ProfitRMPercentage) !== Number(item.NewProfitRMPercentage) ||
                Number(item.ProfitMachiningCCPercentage) !== Number(item.NewProfitMachiningCCPercentage) ||
                Number(item.ProfitPercentage) !== Number(item.NewProfitPercentage)) {

                tempObj.CostingHead = item.CostingHead === 'Vendor Based' ? VBC : ZBC
                tempObj.ClientName = item.ClientName
                tempObj.CompanyName = item.CompanyName
                tempObj.CreatedDate = item.CreatedDate
                tempObj.EffectiveDate = item.EffectiveDate
                tempObj.IsActive = item.IsActive
                tempObj.ModelType = item.ModelType
                tempObj.ModelTypeId = item.ModelTypeId
                tempObj.OldProfitApplicabilityId = item.ProfitApplicabilityId
                tempObj.ProfitApplicabilityType = item.ProfitApplicabilityType
                tempObj.OldProfitBOPPercentage = item.ProfitBOPPercentage
                tempObj.ProfitId = item.ProfitId
                tempObj.OldProfitMachiningCCPercentage = item.ProfitMachiningCCPercentage
                tempObj.OldProfitPercentage = item.ProfitPercentage
                tempObj.OldProfitRMPercentage = item.ProfitRMPercentage

                tempObj.NewProfitApplicabilityType = item.NewProfitApplicabilityType
                tempObj.NewProfitBOPPercentage = Number(item.NewProfitBOPPercentage)
                tempObj.NewProfitRMPercentage = Number(item.NewProfitRMPercentage)
                tempObj.NewProfitMachiningCCPercentage = Number(item.NewProfitMachiningCCPercentage)
                tempObj.NewProfitPercentage = Number(item.NewProfitPercentage)

                tempObj.TypeOfHead = item.TypeOfHead
                tempObj.VendorId = item.VendorId
                tempObj.VendorName = item.VendorName
                tempArr.push(tempObj)

                return null;
            }
            return null
        })

        obj.SimulationIds = tokenForMultiSimulation

        obj.SimulationRawMaterials = tempArr


        dispatch(runVerifyProfitSimulation(obj, res => {

            setIsDisable(false)
            if (res?.data?.Result) {
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

    const newProfitApplicabilityTypeFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCellProfitApplicability(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewProfitApplicabilityType :
                        <span className='form-control height33' >{value ? cell : row.ProfitApplicabilityType} </span>
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
    const newProfitBOPPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewProfitBOPPercentage :
                        <span className='form-control height33' >{row.NewProfitBOPPercentage && value ? row.NewProfitBOPPercentage : ''} </span>
                }

            </>
        )
    }
    const oldProfitBOPPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldProfitBOPPercentage :
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
                }

            </>
        )
    }
    const newProfitMachiningCCPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewProfitMachiningCCPercentage :
                        <span className='form-control height33' >{row.NewProfitMachiningCCPercentage && value ? row.NewProfitMachiningCCPercentage : ''} </span>
                }

            </>
        )
    }
    const oldProfitMachiningCCPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldProfitMachiningCCPercentage :
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
                }

            </>
        )
    }
    const newProfitRMPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)

        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewProfitRMPercentage :
                        <span className='form-control height33' >{row.NewProfitRMPercentage && value ? row.NewProfitRMPercentage : null} </span>
                }

            </>
        )
    }
    const oldProfitRMPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewProfitRMPercentage :
                        <span className='form-control height33' >{cell && value ? cell : null} </span>
                }

            </>
        )
    }
    const newProfitPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)

        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewProfitPercentage :
                        <span className='form-control height33' >{row.NewProfitPercentage && value ? row.NewProfitPercentage : null} </span>
                }

            </>
        )
    }
    const oldProfitPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldProfitPercentage :
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
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
                        <span className='form-control height33' >{cell && value ? cell : ''}</span>
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
    const beforeSaveCellProfitApplicability = (props) => {
        const cellValue = props
        if ((cellValue === 'BOP' || cellValue === 'BOP + CC' || cellValue === 'CC' || cellValue === 'Fixed' || cellValue === 'RM'
            || cellValue === 'RM + BOP' || cellValue === 'RM + CC' || cellValue === 'RM + CC + BOP') && cellValue !== undefined) {
            return true
        } else {
            return false
        }
    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewBasicRate || Number(row.BasicRate) === Number(row.NewBasicRate) || row.NewBasicRate === '') return ''
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }

    const cellChange = (props) => {
    }

    const applicabilityCellEditor = (params) => {
        const selectedCountry = params.data?.ProfitApplicabilityType;
        const allowedCities = valuesForDropdownInAgGrid.applicability;

        return {
            values: allowedCities,
            formatValue: (value) => `${value} (${selectedCountry})`,
        };
    };

    const cancel = () => {
        setShowMainSimulation(true)
    }

    const closeDrawer = (e = '') => {
        setShowRunSimulationDrawer(false)

    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
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
        gridOptions?.api?.startEditingCell({
            rowIndex: 1,
            colKey: 'NewProfitPercentage'
        })
        // setTimeout(() => {
        //     gridApi.stopEditing()
        // }, 200);

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
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
        switch (list[0].NewProfitApplicabilityType) {
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
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }

                value = false
                return value

            case 'RM + BOP':
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'BOP + CC':
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'RM + CC + BOP':
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
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
        switch (list[0].NewProfitApplicabilityType) {
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
                if (rowData.NewProfitPercentage && (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ')) {
                    value = false
                } else {
                    value = true
                }
                return value
            case 'RM + BOP':
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
                    value = false
                } else {
                    value = false
                }
                return value

            case 'BOP + CC':
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'RM + CC + BOP':
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
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
        switch (list[0].NewProfitApplicabilityType) {
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
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value
            case 'RM + BOP':
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'BOP + CC':
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
                    value = false
                } else {
                    value = false
                }
                return value

            case 'RM + CC + BOP':
                if (rowData.NewProfitPercentage !== null && rowData.NewProfitPercentage !== undefined && rowData.NewProfitPercentage !== '' && rowData.NewProfitPercentage !== ' ') {
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
        switch (list[0].NewProfitApplicabilityType) {
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
                if ((rowData.NewProfitMachiningCCPercentage !== null && rowData.NewProfitMachiningCCPercentage !== undefined && rowData.NewProfitMachiningCCPercentage !== '' && rowData.NewProfitMachiningCCPercentage !== ' ')
                    || (rowData.NewProfitRMPercentage !== null && rowData.NewProfitRMPercentage !== undefined && rowData.NewProfitRMPercentage !== '' && rowData.NewProfitRMPercentage !== ' ')) {
                    value = false
                } else {
                    value = true
                }
                return value
            case 'RM + BOP':
                if ((rowData.NewProfitBOPPercentage !== null && rowData.NewProfitBOPPercentage !== undefined && rowData.NewProfitBOPPercentage !== '' && rowData.NewProfitBOPPercentage !== ' ')
                    || (rowData.NewProfitRMPercentage !== null && rowData.NewProfitRMPercentage !== undefined && rowData.NewProfitRMPercentage !== '' && rowData.NewProfitRMPercentage !== ' ')) {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'BOP + CC':
                if ((rowData.NewProfitBOPPercentage !== null && rowData.NewProfitBOPPercentage !== undefined && rowData.NewProfitBOPPercentage !== '' && rowData.NewProfitBOPPercentage !== ' ')
                    || (rowData.NewProfitMachiningCCPercentage !== null && rowData.NewProfitMachiningCCPercentage !== undefined && rowData.NewProfitMachiningCCPercentage !== '' && rowData.NewProfitMachiningCCPercentage !== ' ')) {
                    value = false
                } else {
                    value = true
                }
                return value

            case 'RM + CC + BOP':
                if ((rowData.NewProfitBOPPercentage !== null && rowData.NewProfitBOPPercentage !== undefined && rowData.NewProfitBOPPercentage !== '' && rowData.NewProfitBOPPercentage !== ' ')
                    || (rowData.NewProfitMachiningCCPercentage !== null && rowData.NewProfitMachiningCCPercentage !== undefined && rowData.NewProfitMachiningCCPercentage !== '' && rowData.NewProfitMachiningCCPercentage !== ' ')
                    || (rowData.NewProfitRMPercentage !== null && rowData.NewProfitRMPercentage !== undefined && rowData.NewProfitRMPercentage !== '' && rowData.NewProfitRMPercentage !== ' ')) {
                    value = false
                } else {
                    value = true
                }
                return value

            default:
                return 'foo';


        }


        // if ((list[0].ProfitBOPPercentage !== null && list[0].ProfitBOPPercentage !== undefined)
        //     || (list[0].ProfitRMPercentage !== null && list[0].ProfitRMPercentage !== undefined)) {
        //     return false
        // } else {
        //     return true
        // }
    }

    const onCellValueChanged = (props) => {

        // DONT REMOVE THIS BLOCK OF CODE
        // const rowData = props?.data;
        // const valueField = props?.column?.userProvidedColDef?.field
        // const index = props?.node?.rowIndex
        // if (checkForNullReturnBlank(props?.value) === null) {
        //     switch (valueField) {
        //         case 'NewProfitRMPercentage':
        //             list[index].NewProfitRMPercentage = null

        //             break;
        //         case 'NewProfitPercentage':
        //             list[index].NewProfitPercentage = null


        //             break;
        //         case 'NewProfitMachiningCCPercentage':
        //             list[index].NewProfitMachiningCCPercentage = null


        //             break;

        //         case 'NewProfitBOPPercentage':
        //             list[index].NewProfitBOPPercentage = null



        //             break;

        //         default:
        //             return 'foo';

        //     }
        // }
        if ((props?.value === 'BOP' || props?.value === 'BOP + CC' || props?.value === 'CC' || props?.value === 'Fixed' || props?.value === 'RM'
            || props?.value === 'RM + BOP' || props?.value === 'RM + CC' || props?.value === 'RM + CC + BOP') && props?.value !== undefined) {
            list && list.map((item) => {
                item.NewProfitApplicabilityType = props?.value
                switch (list[0].NewProfitApplicabilityType) {
                    case 'RM':
                        item.NewProfitBOPPercentage = ''
                        item.NewProfitMachiningCCPercentage = ''
                        item.NewProfitPercentage = ''

                        break;
                    case 'CC':
                        item.NewProfitBOPPercentage = ''
                        item.NewProfitRMPercentage = ''
                        item.NewProfitPercentage = ''

                        break;
                    case 'BOP':
                        item.NewProfitRMPercentage = ''
                        item.NewProfitMachiningCCPercentage = ''
                        item.NewProfitPercentage = ''

                        break;

                    case 'Fixed':
                        item.NewProfitBOPPercentage = ''
                        item.NewProfitRMPercentage = ''
                        item.NewProfitMachiningCCPercentage = ''
                        item.NewProfitPercentage = ''

                        break;

                    case 'RM + CC':
                        item.NewProfitBOPPercentage = ''
                        item.NewProfitPercentage = ''

                        break;

                    case 'RM + BOP':
                        item.NewProfitMachiningCCPercentage = ''
                        item.NewProfitPercentage = ''

                        break;

                    case 'BOP + CC':
                        item.NewProfitRMPercentage = ''
                        item.NewProfitPercentage = ''

                        break;

                    case 'RM + CC + BOP':
                        item.NewProfitPercentage = ''

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

    const oldProfitApplicabilityTypeFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldProfitApplicabilityType :
                        <span className='form-control height33' >{cell ? cell : row.ProfitApplicabilityType} </span>
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
        newProfitApplicabilityTypeFormatter: newProfitApplicabilityTypeFormatter,
        cellChange: cellChange,
        oldBasicRateFormatter: oldBasicRateFormatter,
        newBasicRateFormatter: newBasicRateFormatter,
        oldScrapRateFormatter: oldScrapRateFormatter,
        cellEditorSelector: cellEditorSelector,
        applicabilityCellEditor: applicabilityCellEditor,
        onCellValueChanged: onCellValueChanged,
        EditableCallbackForBOP: EditableCallbackForBOP,
        EditableCallbackForCC: EditableCallbackForCC,
        EditableCallbackForRM: EditableCallbackForRM,
        EditableCallbackForOP: EditableCallbackForOP,
        oldProfitApplicabilityTypeFormatter: oldProfitApplicabilityTypeFormatter,
        newProfitBOPPercentageFormatter: newProfitBOPPercentageFormatter,
        oldProfitBOPPercentageFormatter: oldProfitBOPPercentageFormatter,
        oldProfitMachiningCCPercentageFormatter: oldProfitMachiningCCPercentageFormatter,
        newProfitMachiningCCPercentageFormatter: newProfitMachiningCCPercentageFormatter,
        oldProfitRMPercentageFormatter: oldProfitRMPercentageFormatter,
        newProfitRMPercentageFormatter: newProfitRMPercentageFormatter,
        oldProfitPercentageFormatter: oldProfitPercentageFormatter,
        newProfitPercentageFormatter: newProfitPercentageFormatter
    };







    // 
    // 
    // 
    return (

        <div>
            <div className={`ag-grid-react grid-parent-wrapper`}>

                {


                    (!showverifyPage && !showMainSimulation) &&
                    <Fragment>
                        <Row>
                            <Col className="add-min-height mb-3 sm-edit-page">
                                <div className={`ag-grid-wrapper height-width-wrapper ${list && list?.length <= 0 ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-header">
                                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
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
                                            paginationPageSize={defaultPageSize}
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

                                            {/* <AgGridColumn field="IsVendor" editable='false' headerName="Costing Head" minWidth={190}></AgGridColumn>
                                            <AgGridColumn field="ClientName" editable='false' headerName="Client Name" minWidth={190}></AgGridColumn>
                                            <AgGridColumn field="VendorName" editable='false' headerName="Vendor Name" minWidth={190}></AgGridColumn> */}

                                            {/* <AgGridColumn field="ModelType" editable={false} headerName="Model Type" minWidth={190}></AgGridColumn> */}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" headerName="Profit Applicability Type" marryChildren={true} >
                                                <AgGridColumn width={160} field="ProfitApplicabilityType" editable='false' headerName="Existing" cellRenderer='oldProfitApplicabilityTypeFormatter' colId="ProfitApplicabilityType"></AgGridColumn>
                                                <AgGridColumn width={160} cellRenderer='newProfitApplicabilityTypeFormatter' cellEditor="agSelectCellEditor" cellEditorParams={applicabilityCellEditor} field="NewProfitApplicabilityType" headerName="Revised" colId='NewProfitApplicabilityType'></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="ProfitApplicabilityType" cellEditor="agSelectCellEditor" cellEditorParams={applicabilityCellEditor} ></AgGridColumn> */}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Profit BOP Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="ProfitBOPPercentage" editable='false' headerName="Existing" cellRenderer='oldProfitBOPPercentageFormatter' colId="ProfitBOPPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newProfitBOPPercentageFormatter' onCellValueChanged='cellChange' field="NewProfitBOPPercentage" headerName="Revised" colId='NewProfitBOPPercentage' editable={EditableCallbackForBOP}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="ProfitBOPPercentage" headerName="Profit BOP Percentage" minWidth={190} editable={EditableCallbackForBOP} ></AgGridColumn> */}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Profit Machining CC Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="ProfitMachiningCCPercentage" editable='false' headerName="Existing" cellRenderer='oldProfitMachiningCCPercentageFormatter' colId="ProfitMachiningCCPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newProfitMachiningCCPercentageFormatter' onCellValueChanged='cellChange' field="NewProfitMachiningCCPercentage" headerName="Revised" colId='NewProfitMachiningCCPercentage' editable={EditableCallbackForCC}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="ProfitMachiningCCPercentage" headerName="Profit Machining CC Percentage" editable={EditableCallbackForCC} minWidth={190}></AgGridColumn> */}


                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Profit RM Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="ProfitRMPercentage" editable='false' headerName="Existing" cellRenderer='oldProfitRMPercentageFormatter' colId="ProfitRMPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newProfitRMPercentageFormatter' onCellValueChanged='cellChange' field="NewProfitRMPercentage" headerName="Revised" colId='NewProfitRMPercentage' editable={EditableCallbackForRM}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="ProfitRMPercentage" headerName="Profit RM Percentage" minWidth={190} editable={EditableCallbackForRM} ></AgGridColumn> */}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Profit Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="ProfitPercentage" editable='false' headerName="Existing" cellRenderer='oldProfitPercentageFormatter' colId="ProfitPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newProfitPercentageFormatter' onCellValueChanged='cellChange' field="NewProfitPercentage" headerName="Revised" colId='NewProfitPercentage' editable={EditableCallbackForOP}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="ProfitPercentage" headerName="Profit Percentage" minWidth={190} editable={EditableCallbackForOP}></AgGridColumn> */}


                                            <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                            <AgGridColumn field="CostingId" hide={true}></AgGridColumn>


                                        </AgGridReact>

                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
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


export default ProfitSimulation;