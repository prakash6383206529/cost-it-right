import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { EMPTY_DATA } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { getConfigurationKey, getLocalizedCostingHeadValue, loggedInUserId, showBopLabel } from '../../../../helper';
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
import { runVerifyOverheadSimulation } from '../../actions/Simulation';
import { checkForChangeInOverheadProfit1Values, checkForChangeInOverheadProfit2Values, checkForChangeInOverheadProfit3Values } from '../../SimulationUtils';
import { PaginationWrapper } from '../../../common/commonPagination';
import { useLabels } from '../../../../helper/core';
import CostingHeadDropdownFilter from '../../../masters/material-master/CostingHeadDropdownFilter';
import { setResetCostingHead } from '../../../../actions/Common';

const gridOptions = {};

function OverheadSimulation(props) {
    const { list, technology, master, isImpactedMaster, tokenForMultiSimulation } = props
    const { vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels()
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
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
    const dispatch = useDispatch()
    const { selectedMasterForSimulation } = useSelector(state => state.simulation)
    const {costingHeadFilter} =useSelector(state => state?.common )

    useEffect(() => {
   
        if (costingHeadFilter && costingHeadFilter?.data) {
          const matchedOption = costingHeadFilter?.CostingHeadOptions?.find(option => option?.value === costingHeadFilter?.data?.value);
          if (matchedOption) {
            gridApi?.setQuickFilter(matchedOption?.label);
          }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [ costingHeadFilter]);
    useEffect(() => {
        // TO SET INITIAL VALUES IN AGGRID
        list && list.map((item) => {
            item.NewOverheadApplicabilityType = item.OverheadApplicabilityType
            item.NewOverheadBOPPercentage = item.OverheadBOPPercentage
            item.NewOverheadMachiningCCPercentage = item.OverheadMachiningCCPercentage
            item.NewOverheadRMPercentage = item.OverheadRMPercentage
            item.NewOverheadPercentage = item.OverheadPercentage
            return null
        })
    }, [list])
    useEffect(() => {
        return () => {
            dispatch(setResetCostingHead(true, "costingHead"))
          }
    }, [])


    // VERIFY SIMUALTION BUTTON (SUBMIT)
    const verifySimulation = debounce(() => {
        let OverheadApplicabilityTypeCount = 0
        let OverheadRMPercentageCount = 0
        let OverheadMachiningCCPercentageCount = 0
        let OverheadBOPPercentageCount = 0
        let OverheadPercentageCount = 0
        let tempRM = 0
        let tempCC = 0
        let tempBOP = 0
        let tempRMCC = 0
        let tempRMBOP = 0
        let tempBOPCC = 0
        let tempRMCCBOP = 0
        let stopflow = false

        let tempObjVal = new Set([]);

        // SWITCH FOR SAVING VALUE IN AN ARRAY 
        list && list.map((item) => {
            tempRM = 0
            tempCC = 0
            tempBOP = 0
            tempRMCC = 0
            tempRMBOP = 0
            tempBOPCC = 0
            tempRMCCBOP = 0
            // HERE WE CHECK : IF APPLICABILITY IS CHANGED THAN CHECK OTHER VALUE IS NOT EMPTY OR NOT SIMILAR TO OLD 
            switch (item.NewOverheadApplicabilityType) {
                case 'RM':
                    let tempRMValue = []
                    tempRMValue.NewValue = item.NewOverheadRMPercentage
                    tempRMValue.Value = item.OverheadRMPercentage
                    if (checkForChangeInOverheadProfit1Values(tempRMValue)) {
                        tempObjVal.add(item)
                        tempRMBOP = 1
                    }
                    break;

                case 'CC':
                    let tempCCValue = []
                    tempCCValue.NewValue = item.NewOverheadMachiningCCPercentage
                    tempCCValue.Value = item.OverheadMachiningCCPercentage
                    if (checkForChangeInOverheadProfit1Values(tempCCValue)) {
                        tempObjVal.add(item)
                        tempRMBOP = 1
                    }
                    break;

                case 'BOP':
                    let tempBOPValue = []
                    tempBOPValue.NewValue = item.NewOverheadBOPPercentage
                    tempBOPValue.Value = item.OverheadBOPPercentage
                    if (checkForChangeInOverheadProfit1Values(tempBOPValue)) {
                        tempObjVal.add(item)
                        tempRMBOP = 1
                    }
                    break;

                case 'Fixed':
                    tempObjVal.add(item)

                    break;

                case 'RM + CC':
                    let tempRM_CC_Value = []
                    tempRM_CC_Value.NewApplicabilityType = item.NewOverheadApplicabilityType
                    tempRM_CC_Value.ApplicabilityType = item.OverheadApplicabilityType
                    tempRM_CC_Value.NewOverheadPercentage = item.NewOverheadPercentage
                    tempRM_CC_Value.OverheadPercentage = item.OverheadPercentage
                    tempRM_CC_Value.NewFirstValue = item.NewOverheadRMPercentage
                    tempRM_CC_Value.FirstValue = item.OverheadRMPercentage
                    tempRM_CC_Value.NewSecondValue = item.NewOverheadMachiningCCPercentage
                    tempRM_CC_Value.SecondValue = item.OverheadMachiningCCPercentage

                    if (checkForChangeInOverheadProfit2Values(tempRM_CC_Value)) {
                        tempObjVal.add(item)
                        tempRMBOP = 1
                    }
                    break;

                case 'RM + BOP':
                    let tempRM_BOP_Value = []
                    tempRM_BOP_Value.NewApplicabilityType = item.NewOverheadApplicabilityType
                    tempRM_BOP_Value.ApplicabilityType = item.OverheadApplicabilityType
                    tempRM_BOP_Value.NewOverheadPercentage = item.NewOverheadPercentage
                    tempRM_BOP_Value.OverheadPercentage = item.OverheadPercentage
                    tempRM_BOP_Value.NewFirstValue = item.NewOverheadRMPercentage
                    tempRM_BOP_Value.FirstValue = item.OverheadRMPercentage
                    tempRM_BOP_Value.NewSecondValue = item.NewOverheadBOPPercentage
                    tempRM_BOP_Value.SecondValue = item.OverheadBOPPercentage

                    if (checkForChangeInOverheadProfit2Values(tempRM_BOP_Value)) {
                        tempObjVal.add(item)
                        tempRMBOP = 1
                    }
                    break;
                case 'BOP + CC':
                    let tempBOP_CC_Value = []
                    tempBOP_CC_Value.NewApplicabilityType = item.NewOverheadApplicabilityType
                    tempBOP_CC_Value.ApplicabilityType = item.OverheadApplicabilityType
                    tempBOP_CC_Value.NewOverheadPercentage = item.NewOverheadPercentage
                    tempBOP_CC_Value.OverheadPercentage = item.OverheadPercentage
                    tempBOP_CC_Value.NewFirstValue = item.NewOverheadMachiningCCPercentage
                    tempBOP_CC_Value.FirstValue = item.OverheadMachiningCCPercentage
                    tempBOP_CC_Value.NewSecondValue = item.NewOverheadBOPPercentage
                    tempBOP_CC_Value.SecondValue = item.OverheadBOPPercentage

                    if (checkForChangeInOverheadProfit2Values(tempBOP_CC_Value)) {
                        tempObjVal.add(item)
                        tempRMBOP = 1
                    }
                    break;

                case 'RM + CC + BOP':
                    let tempRM_CC_BOP_value = []
                    tempRM_CC_BOP_value.NewApplicabilityType = item.NewOverheadApplicabilityType
                    tempRM_CC_BOP_value.ApplicabilityType = item.OverheadApplicabilityType
                    tempRM_CC_BOP_value.NewOverheadPercentage = item.NewOverheadPercentage
                    tempRM_CC_BOP_value.OverheadPercentage = item.OverheadPercentage
                    tempRM_CC_BOP_value.NewFirstValue = item.NewOverheadMachiningCCPercentage
                    tempRM_CC_BOP_value.FirstValue = item.OverheadMachiningCCPercentage
                    tempRM_CC_BOP_value.NewSecondValue = item.NewOverheadBOPPercentage
                    tempRM_CC_BOP_value.SecondValue = item.OverheadBOPPercentage
                    tempRM_CC_BOP_value.NewThirdValue = item.NewOverheadMachiningCCPercentage
                    tempRM_CC_BOP_value.ThirdValue = item.OverheadMachiningCCPercentage

                    if (checkForChangeInOverheadProfit3Values(tempRM_CC_BOP_value)) {
                        tempObjVal.add(item)
                        tempRMBOP = 1
                    }
                    break;
                default:
                    return 'foo';
            }
            return null
        })

        // SWITCH TO CHECK EVERY FIELD IS FILLED ACCPRDING TO THE APPLICABILITY CHECK
        list && list.map((item, index) => {
            tempRM = 0
            tempCC = 0
            tempBOP = 0
            tempRMCC = 0
            tempRMBOP = 0
            tempBOPCC = 0
            tempRMCCBOP = 0
            switch (item.NewOverheadApplicabilityType) {
                case 'RM':
                    if (item.NewOverheadRMPercentage === null || item.NewOverheadRMPercentage === undefined
                        || item.NewOverheadRMPercentage === '' || item.NewOverheadRMPercentage === ' ') {

                        tempRM = 1
                    }
                    break;

                case 'CC':
                    if (item.NewOverheadMachiningCCPercentage === null || item.NewOverheadMachiningCCPercentage === undefined
                        || item.NewOverheadMachiningCCPercentage === '' || item.NewOverheadMachiningCCPercentage === ' ') {

                        tempCC = 1
                    }
                    break;

                case 'BOP':
                    if (item.NewOverheadBOPPercentage === null || item.NewOverheadBOPPercentage === undefined
                        || item.NewOverheadBOPPercentage === '' || item.NewOverheadBOPPercentage === ' ') {

                        tempBOP = 1
                    }
                    break;

                case 'Fixed':

                    break;

                case 'RM + CC':
                    if ((item.NewOverheadPercentage === null || item.NewOverheadPercentage === undefined
                        || item.NewOverheadPercentage === '' || item.NewOverheadPercentage === ' ') &&

                        ((item.NewOverheadRMPercentage === null || item.NewOverheadRMPercentage === undefined
                            || item.NewOverheadRMPercentage === '' || item.NewOverheadRMPercentage === ' ') ||

                            (item.NewOverheadMachiningCCPercentage === null || item.NewOverheadMachiningCCPercentage === undefined
                                || item.NewOverheadMachiningCCPercentage === '' || item.NewOverheadMachiningCCPercentage === ' '))) {

                        tempRMCC = 1
                    }
                    break;

                case 'RM + BOP':
                    if ((item.NewOverheadPercentage === null || item.NewOverheadPercentage === undefined
                        || item.NewOverheadPercentage === '' || item.NewOverheadPercentage === ' ') &&

                        ((item.NewOverheadRMPercentage === null || item.NewOverheadRMPercentage === undefined
                            || item.NewOverheadRMPercentage === '' || item.NewOverheadRMPercentage === ' ') ||

                            (item.NewOverheadBOPPercentage === null || item.NewOverheadBOPPercentage === undefined
                                || item.NewOverheadBOPPercentage === '' || item.NewOverheadBOPPercentage === ' '))) {

                        tempRMBOP = 1
                    }
                    break;
                case 'BOP + CC':
                    if ((item.NewOverheadPercentage === null || item.NewOverheadPercentage === undefined
                        || item.NewOverheadPercentage === '' || item.NewOverheadPercentage === ' ') &&

                        ((item.NewOverheadMachiningCCPercentage === null || item.NewOverheadMachiningCCPercentage === undefined
                            || item.NewOverheadMachiningCCPercentage === '' || item.NewOverheadMachiningCCPercentage === ' ') ||

                            (item.NewOverheadBOPPercentage === null || item.NewOverheadBOPPercentage === undefined
                                || item.NewOverheadBOPPercentage === '' || item.NewOverheadBOPPercentage === ' '))) {
                        // if condition failed  //stop here
                        tempBOPCC = 1
                    }
                    break;

                case 'RM + CC + BOP':
                    if ((item.NewOverheadPercentage === null || item.NewOverheadPercentage === undefined
                        || item.NewOverheadPercentage === '' || item.NewOverheadPercentage === ' ') &&    // FOR EXP : || 

                        ((item.NewOverheadRMPercentage === null || item.NewOverheadRMPercentage === undefined
                            || item.NewOverheadRMPercentage === '' || item.NewOverheadRMPercentage === ' ') ||   // FOR EXP : &&

                            (item.NewOverheadBOPPercentage === null || item.NewOverheadBOPPercentage === undefined
                                || item.NewOverheadBOPPercentage === '' || item.NewOverheadBOPPercentage === ' ') ||   // FOR EXP : &&

                            (item.NewOverheadMachiningCCPercentage === null || item.NewOverheadMachiningCCPercentage === undefined
                                || item.NewOverheadMachiningCCPercentage === '' || item.NewOverheadMachiningCCPercentage === ' '))) {
                        tempRMCCBOP = 1
                    }
                    break;
                default:
                    return 'foo';
            }

            if (Number(tempRM) === 1) {
                Toaster.warning(`Please fill RM`);
                stopflow = true
            } else if (Number(tempCC) === 1) {
                Toaster.warning(`Please fill CC`);
                stopflow = true
            } else if (Number(tempBOP) === 1) {
                Toaster.warning(`Please fill ${showBopLabel()}`);
                stopflow = true
            } else if (Number(tempRMCC) === 1) {
                Toaster.warning(`Please fill both RM and CC or Overhead Percentage`);
                stopflow = true
            } else if (Number(tempRMBOP) === 1) {
                Toaster.warning(`Please fill both RM and ${showBopLabel()} or Overhead Percentage`);
                stopflow = true
            } else if (Number(tempBOPCC) === 1) {
                Toaster.warning(`Please fill both ${showBopLabel()} and CC or Overhead Percentage`);
                stopflow = true
            } else if (Number(tempRMCCBOP) === 1) {
                Toaster.warning(`Please fill all values RM, CC and ${showBopLabel()} or Overhead Percentage`);
                stopflow = true
            }
            if (item.OverheadApplicabilityType === item.NewOverheadApplicabilityType || item?.NewOverheadApplicabilityType === undefined) {
                OverheadApplicabilityTypeCount = OverheadApplicabilityTypeCount + 1
            }

            if ((String(item.NewOverheadPercentage) !== '' ? String(item.OverheadPercentage) === String(item.NewOverheadPercentage) : true) || item?.NewOverheadPercentage === undefined
                || item?.NewOverheadPercentage === null || item?.NewOverheadPercentage === '') {
                OverheadPercentageCount = OverheadPercentageCount + 1
            }
            if (String(item.OverheadRMPercentage) === String(item.NewOverheadRMPercentage) || item?.NewOverheadRMPercentage === undefined
                || item?.NewOverheadRMPercentage === null || item?.NewOverheadRMPercentage === '') {
                OverheadRMPercentageCount = OverheadRMPercentageCount + 1
            }
            if (String(item.OverheadMachiningCCPercentage) === String(item.NewOverheadMachiningCCPercentage) || item?.NewOverheadMachiningCCPercentage === undefined
                || item?.NewOverheadMachiningCCPercentage === null || item?.NewOverheadMachiningCCPercentage === '') {
                OverheadMachiningCCPercentageCount = OverheadMachiningCCPercentageCount + 1
            }

            if (String(item.OverheadBOPPercentage) === String(item.NewOverheadBOPPercentage) || item?.NewOverheadBOPPercentage === undefined
                || item?.NewOverheadBOPPercentage === null || item?.NewOverheadBOPPercentage === '') {
                OverheadBOPPercentageCount = OverheadBOPPercentageCount + 1
            }
            return null;
        })
        if (stopflow) {
            return false
        }

        //CHECK IF THERE IS NO CHANGE IN THE TABLE

        if (OverheadApplicabilityTypeCount === list.length && OverheadPercentageCount === list.length &&
            OverheadRMPercentageCount === list.length && OverheadMachiningCCPercentageCount === list.length &&
            OverheadBOPPercentageCount === list.length) {
            Toaster.warning('There is no changes in net cost. Please change the basic rate, then run simulation')
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

        let tempArr = []
        list && list.map(item => {
            let tempObj = {}
            // if (Number(item.OverheadBOPPercentage) !== Number(item.NewOverheadBOPPercentage) ||     // FOR EXP : 
            //     Number(item.OverheadRMPercentage) !== Number(item.NewOverheadRMPercentage) ||
            //     Number(item.OverheadMachiningCCPercentage) !== Number(item.NewOverheadMachiningCCPercentage) ||
            //     Number(item.OverheadPercentage) !== Number(item.NewOverheadPercentage)) {

            tempObj.CostingHead = item?.CostingHead === 'Vendor Based' ? VBC : ZBC
            tempObj.ClientName = item?.ClientName
            tempObj.CompanyName = item?.CompanyName
            tempObj.CreatedDate = item?.CreatedDate
            tempObj.EffectiveDate = item?.EffectiveDate
            tempObj.IsActive = item?.IsActive
            tempObj.ModelType = item?.ModelType
            tempObj.ModelTypeId = item?.ModelTypeId
            tempObj.OldOverheadApplicabilityId = item?.OverheadApplicabilityId
            tempObj.OverheadApplicabilityType = item?.OverheadApplicabilityType
            tempObj.OldOverheadBOPPercentage = item?.OverheadBOPPercentage
            tempObj.OverheadId = item?.OverheadId
            tempObj.OldOverheadMachiningCCPercentage = item?.OverheadMachiningCCPercentage
            tempObj.OldOverheadPercentage = item?.OverheadPercentage
            tempObj.OldOverheadRMPercentage = item?.OverheadRMPercentage

            tempObj.NewOverheadApplicabilityType = item?.NewOverheadApplicabilityType
            tempObj.NewOverheadBOPPercentage = Number(item?.NewOverheadBOPPercentage)
            tempObj.NewOverheadRMPercentage = Number(item?.NewOverheadRMPercentage)
            tempObj.NewOverheadMachiningCCPercentage = Number(item?.NewOverheadMachiningCCPercentage)
            tempObj.NewOverheadPercentage = Number(item?.NewOverheadPercentage)

            tempObj.TypeOfHead = item?.TypeOfHead
            tempObj.VendorId = item?.VendorId
            tempObj.VendorName = item?.VendorNameg
            tempArr.push(tempObj)

            return null;
            // }
        })

        let objectSend = []
        for (let item of tempObjVal) {
            objectSend.push(item)
        }

        obj.SimulationIds = tokenForMultiSimulation

        obj.SimulationOverheadProfit = objectSend

        dispatch(runVerifyOverheadSimulation(obj, res => {

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

    const oldOverheadBOPPercentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldOverheadBOPPercentage :
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
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
                        <span className='form-control height33' >{row.NewOverheadBOPPercentage && value ? row.NewOverheadBOPPercentage : ''} </span>
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
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
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
                        <span className='form-control height33' >{row.NewOverheadMachiningCCPercentage && value ? row.NewOverheadMachiningCCPercentage : ''} </span>
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
                        row.NewOverheadRMPercentage :
                        <span className='form-control height33' >{cell && value ? cell : null} </span>
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
                        row.NewOverheadRMPercentage :
                        <span className='form-control height33' >{row.NewOverheadRMPercentage && value ? row.NewOverheadRMPercentage : null} </span>
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
                        <span className='form-control height33' >{cell && value ? cell : ''} </span>
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
                        <span className='form-control height33' >{row.NewOverheadPercentage && value ? row.NewOverheadPercentage : null} </span>
                }

            </>
        )
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
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
    * @method beforeSaveCellOverheadApplicability
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

    const applicabilityCellEditor = (params) => {
        const selectedCountry = params.data?.OverheadApplicabilityType;
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

    const EditableCallback = (props, fieldName) => {
        const rowData = props?.data;
        let value = false
        const index = props?.node?.rowIndex
        switch (list[index]?.NewOverheadApplicabilityType) {
            case 'RM':
                value = fieldName === 'RM' ? true : false
                return value

            case 'CC':
                value = fieldName === 'CC' ? true : false
                return value

            case 'BOP':
                value = fieldName === 'BOP' ? true : false
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
                value = fieldName === 'BOP' ? false : true
                return value

            case 'RM + BOP':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                value = fieldName === 'CC' ? false : true
                return value

            case 'BOP + CC':
                if (rowData.NewOverheadPercentage !== null && rowData.NewOverheadPercentage !== undefined && rowData.NewOverheadPercentage !== '' && rowData.NewOverheadPercentage !== ' ') {
                    value = false
                } else {
                    value = true
                }
                value = fieldName === 'RM' ? false : true
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


    // CALL BACK FOR DISABLE AND ENABLE % CELL
    const EditableCallbackForOP = (props) => {
        const rowData = props?.data;
        let value = false
        const index = props?.node?.rowIndex
        switch (list[index]?.NewOverheadApplicabilityType) {
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

    }

    // TRIGGER ON EVERY CHNAGE IN CELL
    const onCellValueChanged = (props) => {
        const indexFromProps = props?.node?.rowIndex
        if ((props?.value === 'BOP' || props?.value === 'BOP + CC' || props?.value === 'CC' || props?.value === 'Fixed' || props?.value === 'RM'
            || props?.value === 'RM + BOP' || props?.value === 'RM + CC' || props?.value === 'RM + CC + BOP') && props?.value !== undefined) {
            list && list.map((item, index) => {
                // item.NewOverheadApplicabilityType = props?.value
                if (Number(indexFromProps) === Number(index)) {
                    switch (item.NewOverheadApplicabilityType) {
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
                            item.NewOverheadPercentage = ''

                            break;

                        case 'RM + BOP':
                            item.NewOverheadMachiningCCPercentage = ''
                            item.NewOverheadPercentage = ''

                            break;

                        case 'BOP + CC':
                            item.NewOverheadRMPercentage = ''
                            item.NewOverheadPercentage = ''

                            break;

                        case 'RM + CC + BOP':
                            item.NewOverheadPercentage = ''

                            break;

                        default:
                            return 'foo';

                    }

                    // HERE | PUT

                    return null
                }
                return null
            })
        }
        gridApi.redrawRows()
        setApplicabilityForGrid(props.value)
    }
    const combinedCostingHeadRenderer = (props) => {
        // Call the existing checkBoxRenderer
      
        // Get and localize the cell value
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);
      
        // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
        return localizedValue;
      };
      const floatingFilterStatus = {
        maxValue: 1,
        suppressFilterButton: true,
        component: CostingHeadDropdownFilter,
        
    };
    const frameworkComponents = {
        combinedCostingHeadRenderer: combinedCostingHeadRenderer,
        effectiveDateRenderer: effectiveDateFormatter,
        customNoRowsOverlay: NoContentFound,
        newOverheadApplicabilityTypeFormatter: newOverheadApplicabilityTypeFormatter,
        cellEditorSelector: cellEditorSelector,
        applicabilityCellEditor: applicabilityCellEditor,
        onCellValueChanged: onCellValueChanged,
        EditableCallback: EditableCallback,
        EditableCallbackForOP: EditableCallbackForOP,
        oldOverheadApplicabilityTypeFormatter: oldOverheadApplicabilityTypeFormatter,
        newOverheadBOPPercentageFormatter: newOverheadBOPPercentageFormatter,
        oldOverheadBOPPercentageFormatter: oldOverheadBOPPercentageFormatter,
        oldOverheadMachiningCCPercentageFormatter: oldOverheadMachiningCCPercentageFormatter,
        newOverheadMachiningCCPercentageFormatter: newOverheadMachiningCCPercentageFormatter,
        oldOverheadRMPercentageFormatter: oldOverheadRMPercentageFormatter,
        newOverheadRMPercentageFormatter: newOverheadRMPercentageFormatter,
        oldOverheadPercentageFormatter: oldOverheadPercentageFormatter,
        newOverheadPercentageFormatter: newOverheadPercentageFormatter,
        statusFilter : CostingHeadDropdownFilter
    };

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

                                            <AgGridColumn field="IsVendor" editable='false' headerName="Costing Head" minWidth={190} cellRenderer={'combinedCostingHeadRenderer'}
                                             floatingFilterComponentParams={floatingFilterStatus} 
                                             floatingFilterComponent="statusFilter"></AgGridColumn>
                                            <AgGridColumn field="ClientName" editable='false' headerName="Client Name" minWidth={190}></AgGridColumn>
                                            <AgGridColumn field="VendorName" editable='false' headerName={vendorLabel + " Name"} minWidth={190}></AgGridColumn>

                                            <AgGridColumn field="ModelType" editable={false} headerName="Model Type" minWidth={190}></AgGridColumn>

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" headerName="Overhead Applicability Type" marryChildren={true} >
                                                <AgGridColumn width={160} field="OverheadApplicabilityType" editable='false' headerName="Existing" cellRenderer='oldOverheadApplicabilityTypeFormatter' colId="OverheadApplicabilityType"></AgGridColumn>
                                                <AgGridColumn width={160} cellRenderer='newOverheadApplicabilityTypeFormatter' cellEditor="agSelectCellEditor" cellEditorParams={applicabilityCellEditor} field="NewOverheadApplicabilityType" headerName="Revised" colId='NewOverheadApplicabilityType'></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="OverheadApplicabilityType" cellEditor="agSelectCellEditor" cellEditorParams={applicabilityCellEditor} ></AgGridColumn> */}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName={`Overhead ${showBopLabel()} Percentage`} marryChildren={true} >
                                                <AgGridColumn width={120} field="OverheadBOPPercentage" editable='false' headerName="Existing" cellRenderer='oldOverheadBOPPercentageFormatter' colId="OverheadBOPPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newOverheadBOPPercentageFormatter' field="NewOverheadBOPPercentage" headerName="Revised" colId='NewOverheadBOPPercentage' editable={(props) => EditableCallback(props, 'BOP')}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="OverheadBOPPercentage" headerName="Overhead BOP Percentage" minWidth={190} editable={EditableCallback} ></AgGridColumn> */}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Overhead Machining CC Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="OverheadMachiningCCPercentage" editable='false' headerName="Existing" cellRenderer='oldOverheadMachiningCCPercentageFormatter' colId="OverheadMachiningCCPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newOverheadMachiningCCPercentageFormatter' field="NewOverheadMachiningCCPercentage" headerName="Revised" colId='NewOverheadMachiningCCPercentage' editable={(props) => EditableCallback(props, 'CC')}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="OverheadMachiningCCPercentage" headerName="Overhead Machining CC Percentage" editable={EditableCallbackForCC} minWidth={190}></AgGridColumn> */}


                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Overhead RM Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="OverheadRMPercentage" editable='false' headerName="Existing" cellRenderer='oldOverheadRMPercentageFormatter' colId="OverheadRMPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newOverheadRMPercentageFormatter' field="NewOverheadRMPercentage" headerName="Revised" colId='NewOverheadRMPercentage' editable={(props) => EditableCallback(props, 'RM')}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="OverheadRMPercentage" headerName="Overhead RM Percentage" minWidth={190} editable={EditableCallbackForRM} ></AgGridColumn> */}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Overhead Percentage" marryChildren={true} >
                                                <AgGridColumn width={120} field="OverheadPercentage" editable='false' headerName="Existing" cellRenderer='oldOverheadPercentageFormatter' colId="OverheadPercentage"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newOverheadPercentageFormatter' field="NewOverheadPercentage" headerName="Revised" colId='NewOverheadPercentage' editable={EditableCallbackForOP}></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn field="OverheadPercentage" headerName="Overhead Percentage" minWidth={190} editable={EditableCallbackForOP}></AgGridColumn> */}


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
                                    <button type={"button"} className="mr15 cancel-btn" onClick={cancel} disabled={isDisable}>
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


export default OverheadSimulation;