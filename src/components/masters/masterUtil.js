import React, { useEffect, useMemo, useState } from 'react';
import { SearchableSelectHookForm, TextFieldHookForm } from '../layout/HookFormInputs';
import { Col, Row } from 'reactstrap';
import { useForm, Controller } from "react-hook-form";
import _ from 'lodash'
import Toaster from '../common/Toaster';
import { useDispatch, useSelector } from 'react-redux';
import { setGroupProcessList, setProcessList } from './actions/MachineMaster';
import NoContentFound from '../common/NoContentFound';
import { EMPTY_DATA } from '../../config/constants';

export const ProcessGroup = (props) => {
    const { isEditFlag, isViewFlag } = props

    const { register, control, formState: { errors }, getValues, setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const dispatch = useDispatch()

    const [rowData, setRowData] = useState([]);
    const [apiData, setApiData] = useState([])
    const { processGroupApiData, processGroupList, processIdList } = useSelector(state => state.machine)


    const [selectedProcess, setSelectedProcess] = useState([])
    const [editIndex, setEditIndex] = useState('')


    useEffect(() => {
        if (isEditFlag || isViewFlag) {
            setRowData(processGroupList)
        } else {
            dispatch(setGroupProcessList([]))
        }
    }, [processGroupList, isEditFlag, isViewFlag])

    const handleProcess = () => {
        const processName = getValues('process')
        if (processName && Object.keys(processName).length === 0) {
            Toaster.warning('Please select at least one process')
            return false
        }
        setSelectedProcess([...selectedProcess, { ProcessName: processName?.label, ProcessId: processName?.value }])
        setValue('process', {})
    }

    const resetHandler = () => {
        setValue('groupName', '')
        setValue('process', '')
        setSelectedProcess([])
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
        if (groupName === '' || selectedProcess?.length === 0) {
            Toaster.warning('Please enter Group Name and Select Process')
            return false
        }
        props.changeDropdownValue()

        if (data !== undefined) {
            return Toaster.warning('This group name is already added')
        }
        let processList = []
        let tableList = []

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
        resetHandler()
    }

    const updateProcessTableHandler = () => {
        const tempData = rowData[editIndex]
        let groupName = getValues('groupName')

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
    }

    const renderListing = (label) => {
        let temp = []
        if (label === 'process') {
            temp = props.processListing && props.processListing.map(item => {
                return { label: item.processName, value: item.ProcessId }
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

        let tempArr2 = [];
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
        })

        let uniqueStoreProcessList = [...new Set(processIdList)]
        props.showDelete(uniqueStoreProcessList)
        dispatch(setProcessList(uniqueStoreProcessList))
        setRowData(tempArrAfterDelete)
        dispatch(setGroupProcessList(reduxTempArrAfterDelete))
        setApiData(apiTempArrAfterDelete)
    }

    return (
        <>
            {
                !props?.isListing &&
                <Row>
                    <Col className="col-md-3">
                        <TextFieldHookForm
                            label="Group Name"
                            name={"groupName"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{ required: false }}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={""}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.groupName}
                            disabled={props.isViewFlag}
                        />
                    </Col>
                    <Col className="col-md-3 process-container">
                        <SearchableSelectHookForm
                            label={"Process"}
                            name={"process"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            options={renderListing("process")}
                            mandatory={false}
                            handleChange={() => { }}
                            disabled={props.isViewFlag}
                            errors={errors.process}
                        />
                        <div onClick={props.isViewFlag ? '' : handleProcess} disabled={true} className={`plus-icon-square mr5 right ${props.isViewFlag ? 'disabled' : ''}`}> </div>
                    </Col>

                    <Col md="4" className='process-group-wrapper'>
                        <div className='border process-group'>
                            {
                                selectedProcess && selectedProcess.map(item =>
                                    <span className='process-name'>{item.ProcessName}</span>
                                )
                            }
                        </div>
                    </Col>
                    <Col md="2" className='mb-2 d-flex align-items-center'>
                        <div>

                            {
                                editIndex === '' ?
                                    <>
                                        <button
                                            type="button"
                                            className={`${props.isViewFlag ? 'disabled-button user-btn' : 'user-btn'} pull-left mr5`}
                                            onClick={processTableHandler}
                                        >
                                            <div className={'plus'}></div>ADD</button>
                                        <button
                                            type="button"
                                            className={`${props.isViewFlag ? 'disabled-button reset-btn' : 'reset-btn'} pull-left`}
                                            onClick={resetHandler}
                                        >Reset</button>
                                    </> :
                                    <div className='d-flex'>
                                        <button
                                            type="button"
                                            className={`${props.isViewFlag ? 'disabled-button user-btn' : 'user-btn'} pull-left mr5`}
                                            onClick={updateProcessTableHandler}
                                        >
                                            <div className={'plus'}></div>Update</button>
                                        <button
                                            type="button"
                                            className={`${props.isViewFlag ? 'disabled-button reset-btn' : 'reset-btn'} pull-left`}
                                            onClick={resetHandler}
                                        >Reset</button>
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
                            <th>Process Name</th>
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
                                        <button className="Edit" type={'button'} disabled={props.isViewFlag ? true : false} onClick={() => editItemDetails(index)} />
                                        <button className="Delete" type={'button'} disabled={props.isViewFlag ? true : false} onClick={() => deleteItem(index)} />
                                    </div>
                                </td>
                            </tr>
                        })}
                        <tr>
                            <td colSpan={"6"}>{rowData && rowData.length === 0 &&
                                <NoContentFound title={EMPTY_DATA} />
                            }</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
};


// export const findProcessId = (processId,arr)=>{

// }
