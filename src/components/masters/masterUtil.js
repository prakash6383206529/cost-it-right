import React, { useEffect, useMemo, useState } from 'react';
import { SearchableSelectHookForm, TextFieldHookForm } from '../layout/HookFormInputs';
import { Col, Row } from 'reactstrap';
import { useForm, Controller } from "react-hook-form";
import { AgGridReact } from 'ag-grid-react';
import _ from 'lodash'
import Toaster from '../common/Toaster';
import { useDispatch, useSelector } from 'react-redux';
import { setGroupProcessList } from './actions/MachineMaster';

export const ProcessGroup = (props) => {

    const dummyData = [
        {
            dGroupName: 'grp1',
            dProcessList: [
                {
                    dProcessId: '1',
                    dProcessName: 'process 1'
                },
                {
                    dProcessId: '2',
                    dProcessName: 'process 2'
                },
            ]
        },
        {
            dGroupName: 'grp2',
            dProcessList: [
                {
                    dProcessId: '1',
                    dProcessName: 'process 1'
                },
                {
                    dProcessId: '2',
                    dProcessName: 'process 2'
                },
                {
                    dProcessId: '3',
                    dProcessName: 'process 3'
                },
            ]
        },
        {
            dGroupName: 'grp3',
            dProcessList: [
                {
                    dProcessId: '1',
                    dProcessName: 'process 1'
                },
                {
                    dProcessId: '2',
                    dProcessName: 'process 2'
                },
            ]
        },
        {
            dGroupName: 'grp4',
            dProcessList: [
                {
                    dProcessId: '1',
                    dProcessName: 'process 1'
                },

            ]
        },
    ]

    const { register, control, formState: { errors }, getValues, setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const dispatch = useDispatch()

    const [rowData, setRowData] = useState([]);
    const [apiData, setApiData] = useState([])
    const { processGroupApiData, processGroupList } = useSelector(state => state.machine)
    const rowSpan = (params) => {

        var ProcessGroup = params.data.ProcessGroup;
        if (ProcessGroup === getValues('groupName')) {
            return 2;
        } else {
            return 1;
        }
    };
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'GroupName',
            rowSpan: rowSpan,
            cellClassRules: {
                'cell-span': `"value === ${getValues('groupName')}"`,
            },
            width: 200,
        },
        { field: 'ProcessName' },

    ]);
    const [selectedProcess, setSelectedProcess] = useState([])
    const defaultColDef = useMemo(() => {
        return {
            width: 170,
            resizable: true,
        };
    }, []);


    useEffect(() => {
        // setRowData(processGroupList)
        // if (processGroupList && processGroupList.length > 0) {
        //     let temp = processGroupList && processGroupList.map(item => {
        //         return item.GroupName
        //     })
        //     let temp1 = []
        //     temp && temp.map((groupItem, index) => {
        //         let processList = []
        //         processGroupList && processGroupList.map((item, index) => {
        //             console.log('processGroupList: ', processGroupList);
        //             if (temp.includes(item.GroupName)) {
        //                 temp1.push({ GroupName: item.GroupName, ProcessName: item.ProcessName, ProcessId: item.ProcessId })
        //             }
        //         })
        //     })
        //     console.log(temp1, "temp1");

        // }
    }, [processGroupList])



    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        // slected row 1 time

    };
    const handleProcess = () => {
        const processName = getValues('process')
        setSelectedProcess([...selectedProcess, { ProcessName: processName.label, ProcessId: processName.value }])
        setValue('process', {})
    }

    const resetHandler = () => {
        setValue('groupName', '')
        setValue('process', '')
        setSelectedProcess([])
    }

    const processTableHandler = () => {
        const groupName = getValues('groupName')
        const data = _.find(rowData, ['GroupName', groupName])

        if (data !== undefined) {
            return Toaster.warning('This group name is already added')
        }
        let processList = []
        let temp = selectedProcess && selectedProcess.map((item, index) => {
            processList.push(item.ProcessId)
            return { GroupName: groupName, ProcessName: item.ProcessName, ProcessId: item.ProcessId }
            // if (index === 0) {
            //     return { GroupName: groupName, ProcessName: item.ProcessName, ProcessId: item.ProcessId }
            // } else {
            //     return { GroupName: '', ProcessName: item.ProcessName, ProcessId: item.ProcessId }
            // }
        })
        let obj = { ProcessGroupName: groupName, ProcessIdList: processList }
        dispatch(setGroupProcessList([...processGroupApiData, obj]))
        setApiData([...apiData, obj])
        setRowData([...rowData, ...temp])
        resetHandler()
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
                            disabled={false}
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
                            errors={errors.process}
                        />
                        <div onClick={handleProcess} className={'plus-icon-square mr5 right'}> </div>
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
                                <>
                                    <button
                                        type="button"
                                        className={`${props.isViewFlag ? 'disabled-button user-btn' : 'user-btn'} pull-left mr5`}
                                        //   disabled={isViewFlag ? true : isViewMode}
                                        onClick={processTableHandler}
                                    >
                                        <div className={'plus'}></div>ADD</button>
                                    <button
                                        type="button"
                                        //   disabled={isViewMode}
                                        className={`${props.isViewFlag ? 'disabled-button reset-btn' : 'reset-btn'} pull-left`}
                                        onClick={resetHandler}
                                    >Reset</button>
                                </>
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
                        </tr>
                    </thead>
                    <tbody>
                        {dummyData.map((item) => {
                            const processName = item.dProcessList;
                            return <tr>
                                <td className='group-name'>{item.dGroupName}</td>
                                <td>{processName && processName.map(processName => {
                                    return <div className='process-names'>{processName.dProcessName}</div>
                                })}</td>
                            </tr>
                        })}



                    </tbody>
                </table>
            </div>
            <div className={`ag-grid-wrapper  border mb-4`}>
                <div className={`ag-theme-material`}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        suppressRowTransform={true}
                        onGridReady={onGridReady}
                        domLayout='autoHeight'
                    ></AgGridReact>
                </div>
            </div>
        </>
    );
};
