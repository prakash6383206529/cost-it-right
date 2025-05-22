import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm, TextFieldHookForm } from '../layout/HookFormInputs';
import { Col, Row } from 'reactstrap';
import { useForm, Controller } from "react-hook-form";
import _ from 'lodash'
import Toaster from '../common/Toaster';
import { useDispatch, useSelector } from 'react-redux';
import { setGroupProcessList, setProcessList } from './actions/MachineMaster';
import NoContentFound from '../common/NoContentFound';
import { APPROVED, CANCELLED, DRAFT, EMPTY_DATA, EXTERNAL_REJECT, RECEIVED, SENT, UNDER_REVISION, EMPTY_GUID } from '../../config/constants';
import { encodeQueryParamsAndLog, getConfigurationKey, hashValidation } from '../../helper';
import DayTime from '../common/DayTimeWrapper';
export const ProcessGroup = (props) => {
    const { isEditFlag, isViewFlag } = props

    const { register, control, formState: { errors }, getValues, setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()

    const [rowData, setRowData] = useState([]);
    const [apiData, setApiData] = useState([]);
    const [errorObj, setErrorObj] = useState({
        groupName: false,
        processSelect: false,
        processAdd: false
    })
    const [processDropdown, setProcessDropdown] = useState({})
    const { processGroupApiData, processGroupList, processIdList } = useSelector(state => state.machine)


    const [selectedProcess, setSelectedProcess] = useState([])
    const [editIndex, setEditIndex] = useState('')
    const [groupNameText, setGroupNameText] = useState('')

    useEffect(() => {
        if (isEditFlag || isViewFlag) {
            if (props?.rowData && props.rowData.length > 0) {
                setRowData(props?.rowData)
            } else {
                setRowData(processGroupList)
            }
        } else {
            dispatch(setGroupProcessList([]))
        }
    }, [processGroupList, isEditFlag, isViewFlag])

    const handleProcess = () => {
        const processName = getValues('process')
        const groupName = getValues('groupName')
        if ((processName === undefined || processName === '' || Object.keys(processName).length === 0) || (groupName === '')) {
            setErrorObj({ groupName: true, processAdd: true })
            return false
        }
        if (groupName === '') {
            setErrorObj({ groupName: true })
            return false
        }
        setSelectedProcess([...selectedProcess, { ProcessName: processName?.label, ProcessId: processName?.value }])
        setValue('process', {})
        setErrorObj({ processAdd: false })
        setProcessDropdown({})
    }

    const resetHandler = () => {
        setValue('groupName', '')
        setValue('process', '')
        setErrorObj({ groupName: false, processSelect: false, processSelectedArr: false })
        setSelectedProcess([])
        setEditIndex('')
        setGroupNameText('')
        setProcessDropdown({})
    }


    const updateProcessidList = () => {
        let uniqueProcessId = []
        _.uniqBy(selectedProcess, function (o) {
            uniqueProcessId.push(o.ProcessId)
        });
        let storeProcessList = [...processIdList, ...uniqueProcessId]
        let uniqueStoreProcessList = [...new Set(storeProcessList)]

        props.showDelete(uniqueStoreProcessList)
        dispatch(setProcessList(uniqueStoreProcessList))
    }
    const processTableHandler = () => {
        const groupName = getValues('groupName')
        const data = _.find(rowData, ['GroupName', groupName])
        let processList = []
        let tableList = []
        // 

        if (groupNameText === '' && selectedProcess.length === 0) {
            setErrorObj({ groupName: true, processSelect: true })
            return false
        }
        if (groupNameText === '') {
            setErrorObj({ groupName: true })
            return false
        }
        if (selectedProcess.length === 0) {
            setErrorObj({ processSelect: true })
            return false
        }
        props.changeDropdownValue()

        if (data !== undefined) {
            return Toaster.warning('This group name is already added')
        }

        updateProcessidList()
        selectedProcess && selectedProcess.map((item, index) => {
            processList.push(item.ProcessId)
            tableList.push({ ProcessName: item.ProcessName, ProcessId: item.ProcessId })
            return { GroupName: groupName, ProcessName: item.ProcessName, ProcessId: item.ProcessId }
        })
        // FOR SETTING OBJ IN THE POST API FORMAT
        let obj = { ProcessGroupName: groupName, ProcessIdList: processList }
        // FOR SHOWING IN TABLE
        let tableObj = { GroupName: groupName, ProcessList: tableList }
        let updateArrayList = processGroupApiData

        dispatch(setGroupProcessList([...updateArrayList, obj]))

        setApiData([...apiData, obj])
        setRowData([...rowData, tableObj])
        props.setRowData([...rowData, tableObj])
        setErrorObj({ groupName: false, processSelect: false })
        setGroupNameText('')
        resetHandler()
    }

    const updateProcessTableHandler = () => {
        const tempData = rowData[editIndex]
        let groupName = getValues('groupName')
        if (groupNameText === '' && groupName === '') {
            setErrorObj({ groupName: true })
            return false
        }
        let processList = []
        let tableList = []
        selectedProcess && selectedProcess.map((item, index) => {
            processList.push(item.ProcessId)
            tableList.push({ ProcessName: item.ProcessName, ProcessId: item.ProcessId })
            return { GroupName: groupName, ProcessName: item.ProcessName, ProcessId: item.ProcessId }
        })
        updateProcessidList()
        tempData.GroupName = groupName
        tempData.ProcessList = selectedProcess
        let tempArr = Object.assign([...rowData], { [editIndex]: tempData })
        // FOR SHOWING IN TABLE
        let obj = { ProcessGroupName: groupName, ProcessIdList: processList }
        // FOR SETTING OBJ IN THE POST API FORMAT
        let apiTempArr = Object.assign([...apiData], { [editIndex]: obj })
        let reduxTempArr = Object.assign([...processGroupApiData], { [editIndex]: obj })
        dispatch(setGroupProcessList(reduxTempArr))
        setRowData(tempArr)
        setApiData(apiTempArr)
        setEditIndex('')
        resetHandler()
        props.changeDropdownValue()
        setErrorObj({ groupName: false })
        setGroupNameText('')
    }

    const renderListing = (label) => {
        let temp = []
        if (label === 'process') {
            temp = props.processListing && props.processListing.map(item => {
                return { label: item.ProcessName, value: item.ProcessId }
            })
        }
        return temp
    }

    const editItemDetails = (index) => {
        let editTempData = rowData[index]
        setValue('groupName', editTempData.GroupName)
        setSelectedProcess(editTempData.ProcessList)
        setEditIndex(index)
    }

    const deleteItem = (index) => {
        if (!props.isListing) props.checksFinancialDataChanged(true)
        let tempArrAfterDelete = rowData && rowData.filter((el, i) => {
            if (i === index) return false;
            return true
        })
        let apiTempArrAfterDelete = apiData && apiData.filter((el, i) => {
            if (i === index) return false;
            return true
        })
        let reduxTempArrAfterDelete = processGroupApiData && processGroupApiData.filter((el, i) => {
            if (i === index) return false;
            return true
        })
        let processIdList = []
        tempArrAfterDelete && tempArrAfterDelete.map(item => {
            item.ProcessList.map(process => processIdList.push(process.ProcessId))
            return null
        })

        let uniqueStoreProcessList = [...new Set(processIdList)]
        props.showDelete(uniqueStoreProcessList)
        dispatch(setProcessList(uniqueStoreProcessList))
        setRowData(tempArrAfterDelete)
        dispatch(setGroupProcessList(reduxTempArrAfterDelete))
        setApiData(apiTempArrAfterDelete)
        resetHandler()
        setEditIndex('')
        props.changeDropdownValue()
    }

    return (
        <>
            {
                !props?.isListing &&
                <Row className='child-form-container'>
                    <Col className="col-md-3">
                        <TextFieldHookForm
                            label="Group Name"
                            name={"groupName"}
                            Controller={Controller}
                            placeholder={props.isViewFlag ? '-' : "Enter"}
                            control={control}
                            register={register}
                            rules={{
                                required: false,
                                validate: { hashValidation }
                            }}
                            mandatory={true}
                            handleChange={(e) => { setGroupNameText(e.target.value) }}
                            defaultValue={""}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.groupName}
                            disabled={props.isViewFlag}
                        />
                        {errorObj.groupName && (getValues('groupName') === '') && groupNameText === '' && <div className='text-help p-absolute'>This field is required.</div>}
                    </Col>
                    <Col className="col-md-3 process-container">
                        <SearchableSelectHookForm
                            label={"Process (Code)"}
                            name={"process"}
                            placeholder={props.isViewFlag ? '-' : "Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            options={renderListing("process")}
                            customClassName={'process-group-container'}
                            mandatory={true}
                            handleChange={(value) => { setProcessDropdown(value) }}
                            disabled={props.isViewFlag}
                            errors={errors.process}
                        />
                        {errorObj.processAdd && Object.keys(processDropdown).length === 0 && <div className='text-help p-absolute'>Please select at least one process.</div>}
                        <div id="AddMoreDetails_Toggle" onClick={props.isViewFlag ? '' : handleProcess} disabled={true} className={`plus-icon-square mr5 right ${props.isViewFlag ? 'disabled' : ''}`}> </div>
                    </Col>

                    <Col md="4" className='process-group-wrapper'>
                        <div className={`border process-group ${props.isViewFlag ? 'disabled' : ''}`}>
                            {
                                selectedProcess && selectedProcess.map(item =>
                                    <span className='process-name'>{item.ProcessName}</span>
                                )
                            }
                        </div>
                        {errorObj.processSelect && selectedProcess.length === 0 && <div className='text-help p-absolute'>Please add process.</div>}
                    </Col>
                    <Col md="2" className='mb-2 d-flex align-items-center'>
                        <div className='d-flex'>
                            {
                                editIndex === '' ?
                                    <>
                                        <button id="AddMoreDetails_ProcessGroup_Add"
                                            type="button"
                                            className={`${props.isViewFlag ? 'disabled-button user-btn' : 'user-btn'} pull-left mr15`}
                                            onClick={processTableHandler}
                                        >
                                            <div className={'plus'}></div>ADD</button>
                                        <button
                                            id="addGroupProcess_Reset"
                                            type="button"
                                            className={`${props.isViewFlag ? 'disabled-button reset-btn' : 'reset-btn'} pull-left`}
                                            onClick={resetHandler}
                                        >Reset</button>
                                    </> :
                                    <div className='d-flex'>
                                        <button
                                            type="button"
                                            className={`${props.isViewFlag ? 'disabled-button user-btn' : 'user-btn'} pull-left mr15`}
                                            onClick={updateProcessTableHandler}>Update</button>
                                        <button
                                            type="button"
                                            className={`${props.isViewFlag ? 'disabled-button reset-btn' : 'reset-btn'} pull-left`}
                                            onClick={resetHandler}
                                        >Cancel</button>
                                    </div>
                            }
                        </div>
                    </Col>

                </Row>
            }
            <div>
                <table className='table border machine-group-process-table'>
                    <thead>
                        <tr>
                            <th>Group Name</th>
                            <th>Process (Code)</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowData && rowData.map((item, index) => {
                            const processNameList = item.ProcessList;
                            return <tr>
                                <td className='group-name'>{item.GroupName}</td>
                                <td>{processNameList && processNameList.map(processName => {
                                    return <div className='process-names'>{processName.ProcessName}</div>
                                })}</td>
                                <td>
                                    <div className='group-process-Actions'>
                                        <button title='Edit' className="Edit" type={'button'} disabled={props.isViewFlag ? true : false} onClick={() => editItemDetails(index)} />
                                        <button title='Delete' className="Delete" type={'button'} disabled={props.isViewFlag ? true : false} onClick={() => deleteItem(index)} />
                                    </div>
                                </td>
                            </tr>
                        })}
                        {rowData && rowData.length === 0 && <tr>
                            <td colSpan={"6"}>
                                <NoContentFound title={EMPTY_DATA} />
                            </td>
                        </tr>}
                    </tbody>
                </table>
            </div>
        </>
    );
};


export const rmQueryParms = (isPagination, skip, take, obj) => {

    let queryParamsSecond = `VendorId=${obj.VendorId !== undefined ? obj.VendorId : EMPTY_GUID}&PlantId=${obj.PlantId !== undefined ? obj.PlantId : EMPTY_GUID}&RMChildId=${obj.RMChildId !== undefined ? obj.RMChildId : EMPTY_GUID}&GradeId=${obj.GradeId !== undefined ? obj.GradeId : EMPTY_GUID}&CustomerId=${obj.CustomerId !== undefined ? obj.CustomerId : EMPTY_GUID}&RawMaterialEntryType=${obj?.RawMaterialEntryType}&CostingHead=${obj.CostingHead !== undefined ? obj.CostingHead : ""}&Technology=${obj.TechnologyName !== undefined ? obj.TechnologyName : ""}&StatusId=${obj.StatusId !== undefined ? obj.StatusId : ""}&RMName=${obj.RawMaterialName !== undefined ? obj.RawMaterialName : ""}&RMGrade=${obj.RawMaterialGradeName !== undefined ? obj.RawMaterialGradeName : ""}&RMSpecs=${obj.RawMaterialSpecificationName !== undefined ? obj.RawMaterialSpecificationName : ""}&RMCode=${obj.RawMaterialCode !== undefined ? obj.RawMaterialCode : ""}&RMCategory=${obj.Category !== undefined ? obj.Category : ""}&Plant=${obj.DestinationPlantName !== undefined ? obj.DestinationPlantName : ""}&Vendor=${obj.VendorName !== undefined ? obj.VendorName : ""}&UOM=${obj.UnitOfMeasurementName !== undefined ? obj.UnitOfMeasurementName : ""}&NetCostCurrency=${obj.NetLandedCost !== undefined ? obj.NetLandedCost : ""}&BasicRate=${obj.BasicRatePerUOM !== undefined ? obj.BasicRatePerUOM : ""}&ScrapRate=${obj.ScrapRate !== undefined ? obj.ScrapRate : ""}&FreightCost=${obj.RMFreightCost !== undefined ? obj.RMFreightCost : ""}&ShearingCost=${obj.RMShearingCost !== undefined ? obj.RMShearingCost : ""}&EffectiveDate=${obj.EffectiveDate !== undefined ? (obj.dateArray && obj.dateArray.length > 1 ? "" : obj.EffectiveDate) : ""}&MaterialType=${obj.MaterialType !== undefined ? obj.MaterialType : ""}&NetCostWithoutConditionCost=${obj.NetCostWithoutConditionCost !== undefined ? obj.NetCostWithoutConditionCost : ""}&applyPagination=${isPagination}&skip=${skip}&take=${take}&ExchangeRateSourceName=${obj.ExchangeRateSourceName !== undefined ? obj?.ExchangeRateSourceName : ""}&OtherNetCost=${obj.OtherNetCost !== undefined ? obj?.OtherNetCost : ""}`
    return queryParamsSecond

}

// export const bopQueryParms = (isPagination, skip, take, obj) => {
//     let queryParamsSecond = `EntryType=${obj.EntryType !== undefined ? obj.EntryType : EMPTY_GUID}&CostingHead=${obj.CostingHead !== undefined ? obj.CostingHead : ""}&BOPPartNumber=${obj.BoughtOutPartNumber !== undefined ? obj.BoughtOutPartNumber : ""}&BOPPartName=${obj.BoughtOutPartName !== undefined ? obj.BoughtOutPartName : ""}&BOPCategory=${obj.BoughtOutPartCategory !== undefined ? obj.BoughtOutPartCategory : ""}&UOM=${obj.UOM !== undefined ? obj.UOM : ""}&Specification=${obj.Specification !== undefined ? obj.Specification : ""}&Plant=${obj.Plants !== undefined ? obj.Plants : ""}&Vendor=${obj.Vendor !== undefined ? obj.Vendor : ""}&Currency=${obj.Currency !== undefined ? obj.Currency : ""}&NetCostCurrency=${obj.NetLandedCost !== undefined ? obj.NetLandedCost : ""}&BasicRate=${obj.BasicRate !== undefined ? obj.BasicRate : ""}&BasicRateConversion=${obj.BasicRateConversion !== undefined ? obj.BasicRateConversion : ""}&IncoTerm=${obj.IncoTermDescriptionAndInfoTerm !== undefined ? obj.IncoTermDescriptionAndInfoTerm : ""
//         }&NetConditionCost=${obj.NetConditionCost !== undefined ? obj.NetConditionCost : ""}&NetConditionCostConversion=${obj.NetConditionCostConversion !== undefined ? obj.NetConditionCostConversion : ""}&NetCostWithoutConditionCost=${obj.NetCostWithoutConditionCost !== undefined ? obj.NetCostWithoutConditionCost : ""}&NetCostWithoutConditionCostConversion=${obj.NetCostWithoutConditionCostConversion !== undefined ? obj.NetCostWithoutConditionCostConversion : ""}&EffectiveDate=${obj.newDate !== undefined ? (obj.dateArray && obj.dateArray.length > 1 ? "" : obj.newDate) : ""}&applyPagination=${isPagination}&skip=${skip}&take=${take}&NumberOfPieces=${obj.NumberOfPieces !== undefined ? obj.NumberOfPieces : ""}&VendorId=${obj?.VendorId !== undefined ? obj?.VendorId : ""}&CustomerId=${obj?.CustomerId !== undefined ? obj?.CustomerId : ""}`
//     return queryParamsSecond

// }
export const bopQueryParms = (isPagination, skip, take, obj) => {
    const queryParams = encodeQueryParamsAndLog({
        EntryType: obj.EntryType !== undefined ? obj.EntryType : EMPTY_GUID,
        CostingHead: obj.CostingHead !== undefined ? obj.CostingHead : "",
        BOPPartNumber: obj.BoughtOutPartNumber !== undefined ? obj.BoughtOutPartNumber : "",
        BOPPartName: obj.BoughtOutPartName !== undefined ? obj.BoughtOutPartName : "",
        BOPCategory: obj.BoughtOutPartCategory !== undefined ? obj.BoughtOutPartCategory : "",
        UOM: obj.UOM !== undefined ? obj.UOM : "",
        Specification: obj.Specification !== undefined ? obj.Specification : "",
        Plant: obj.Plants !== undefined ? obj.Plants : "",
        Vendor: obj.Vendor !== undefined ? obj.Vendor : "",
        //Currency: obj.Currency !== undefined ? obj.Currency : "",
        NetCostCurrency: obj.NetLandedCost !== undefined ? obj.NetLandedCost : "",
        BasicRate: obj.BasicRate !== undefined ? obj.BasicRate : "",
        BasicRateConversion: obj.BasicRateConversion !== undefined ? obj.BasicRateConversion : "",
        IncoTerm: obj.IncoTermDescriptionAndInfoTerm !== undefined ? obj.IncoTermDescriptionAndInfoTerm : "",
        NetConditionCost: obj.NetConditionCost !== undefined ? obj.NetConditionCost : "",
        NetConditionCostConversion: obj.NetConditionCostConversion !== undefined ? obj.NetConditionCostConversion : "",
        NetCostWithoutConditionCost: obj.NetCostWithoutConditionCost !== undefined ? obj.NetCostWithoutConditionCost : "",
        NetCostWithoutConditionCostConversion: obj.NetCostWithoutConditionCostConversion !== undefined ? obj.NetCostWithoutConditionCostConversion : "",
        EffectiveDate: obj.newDate !== undefined ? (obj.dateArray && obj.dateArray.length > 1 ? "" : obj.newDate) : "",
        applyPagination: isPagination,
        skip: skip,
        take: take,
        NumberOfPieces: obj.NumberOfPieces !== undefined ? obj.NumberOfPieces : "",
        VendorId: obj?.VendorId !== undefined ? obj?.VendorId : "",
        CustomerId: obj?.CustomerId !== undefined ? obj?.CustomerId : "",
        SAPCode: obj?.SAPCode !== undefined ? obj?.SAPCode : "",
        ExchangeRateSourceName: obj.ExchangeRateSourceName !== undefined ? obj?.ExchangeRateSourceName : "",
        OtherNetCost: obj.OtherNetCost !== undefined ? obj?.OtherNetCost : "",
        SAPPartNumber: obj?.SAPPartNumber !== undefined ? obj?.SAPPartNumber : ""
    });

    return queryParams;
};

export const hyphenFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null && cellValue !== '' && cellValue !== undefined ? cellValue : '-'
}

export const StatusTooltip = (APIData) => {
    let temp = []
    APIData && APIData.map((item) => {

        item.tooltipText = ''
        switch (item.Status) {
            case APPROVED:
                item.tooltipText = 'Total no. of parts for which costing has been approved from that quotation / Total no. of parts exist in that quotation'
                break;
            case RECEIVED:
                item.tooltipText = 'Total no. of costing received / Total no. of expected costing in that quotation'
                break;
            case UNDER_REVISION:
                item.tooltipText = 'Total no. of costing under revision / Total no. of expected costing in that quotation'
                break;
            case DRAFT:
                item.tooltipText = 'The token is pending to send for approval from your side.'
                break;
            case CANCELLED:
                item.tooltipText = 'Quotation has been cancelled.'
                break;
            case SENT:
                item.tooltipText = 'Costing under the quotation has been sent.'
                break;
            case EXTERNAL_REJECT:
                item.tooltipText = 'The SAP team has rejected the token'
                break;
            default:
                break;
        }
        temp.push(item)
        return null
    })
    return temp;
}
export const AgGridCustomDatePicker = ({ props, dateState, colId }) => {
    const formattedDate = props && props?.value ? props?.value?.split('T')[0] : ''; // Extract the date part

    // Parse the selected date
    const selectedDate = new Date(formattedDate);

    // Calculate min and max dates based on the selected date
    let minDate = null;
    let maxDate = null;
    if (colId === 'NewToDate' && dateState.NewFromDate) {
        minDate = new Date(dateState.NewFromDate);
        maxDate = new Date(dateState.NewToDate);
    } else if (colId === 'NewEffectiveDate' && dateState.NewToDate) {
        minDate = new Date(dateState.NewToDate);
    } else if (colId === 'NewFromDate' && dateState.NewToDate) {
        maxDate = new Date(dateState.NewToDate);
    } else {
        minDate = null;
        maxDate = null;
    }
    // Format dates to YYYY-MM-DD
    const formatToDateInput = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date)) {
            return null;
        }
        return date.toISOString().split('T')[0];
    }

    return <input
        className='grid-custom-date-picker'
        type="date"
        value={formattedDate} // Use the formatted date
        min={minDate ? formatToDateInput(minDate) : null} // Set min date
        max={maxDate ? formatToDateInput(maxDate) : null} // Set max date
        onChange={(e) => {
            if (props.node && props.node.setDataValue) {
                props.node.setDataValue(props.column.colId, e.target.value);
            }
        }}
        onKeyDown={(e) => {
            e.preventDefault()
        }}
    />
}

export const divisionApplicableFilter = (columnsArray, valueToExclude) => {
    return getConfigurationKey().IsDivisionAllowedForDepartment
        ? columnsArray
        : columnsArray.filter(col => col.value !== valueToExclude);
};

export const checkEffectiveDate = (effectiveDate, effectiveDateToChange) => {
    return DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss') === DayTime(effectiveDateToChange).format('YYYY-MM-DD HH:mm:ss')
}
