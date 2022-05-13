import React, { useState } from "react";
import _ from 'lodash'
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDataOfCheckBox } from "../../actions/Costing";
function GroupProcess(props) {
    const { selectedProcessAndGroup } = useSelector(state => state.costing)
    const [processAcc, setProcessAcc] = useState(false);
    const [selectedData, setSelectedData] = useState([])
    const dispatch = useDispatch()

    const dummyData = [
        {

            GroupName: "Drilling and Cutting",
            Technologies: "Sheet metal",
            MachineName: "T4",
            MachineId: "12",
            MachineTonnage: 3,
            ProcessList: [
                {
                    ProcessId: '11',
                    ProcessName: '1st forming 150 MT',
                    UnitOfMeasurement: 'hours',
                    MachineId: "12",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"

                },
                {
                    ProcessId: '12',
                    ProcessName: '2st forming 150 MT',
                    UnitOfMeasurement: 'gal',
                    MachineId: "12",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"

                },
                {
                    ProcessId: '13',
                    ProcessName: '3st forming 150 MT',
                    UnitOfMeasurement: 'minute',
                    MachineId: "12",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"

                },
            ]
        },
        {

            GroupName: "Drilling and Cutting & Wiring",
            Technologies: "Sheet metal",
            MachineName: "T4",
            MachineId: "12",
            MachineTonnage: 3,
            ProcessList: [
                {
                    ProcessId: '11',
                    ProcessName: '1st forming 150 MT',
                    UnitOfMeasurement: 'hours',
                    MachineId: "12",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"

                },
                {
                    ProcessId: '12',
                    ProcessName: '2st forming 150 MT',
                    UnitOfMeasurement: 'gal',
                    MachineId: "12",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"

                },
                {
                    ProcessId: '13',
                    ProcessName: '3st forming 150 MT',
                    UnitOfMeasurement: 'minute',
                    MachineId: "12",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"

                },
            ]
        },
        {

            GroupName: "painting and cleaning",
            Technologies: "Sheet metal",
            MachineName: "T6",
            MachineTonnage: 3,
            MachineId: "23",
            ProcessList: [
                {
                    ProcessId: '21',
                    ProcessName: '1st forming 150 MT',
                    UnitOfMeasurement: 'hours',
                    MachineId: "23",
                    MachineNumber: "MAC-50002815",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"

                },
                {
                    ProcessId: '22',
                    ProcessName: '2st forming 150 MT',
                    UnitOfMeasurement: 'gal',
                    MachineId: "23",
                    MachineNumber: "MAC-50002815",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"

                },
                {
                    ProcessId: '23',
                    ProcessName: '3st forming 150 MT',
                    UnitOfMeasurement: 'minute',
                    MachineId: "23",
                    MachineNumber: "MAC-50002815",
                    UnitType: "Time",
                    ProcessTechnologyId: 1

                },
                {
                    ProcessId: '24',
                    ProcessName: '4st forming 150 MT',
                    UnitOfMeasurement: 'hours',
                    MachineId: "23",
                    MachineNumber: "MAC-50002815",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"
                },
            ]
        },
        {

            GroupName: "painting and cleaning",
            Technologies: "Sheet metal",
            MachineName: "T7",
            MachineTonnage: 3,
            MachineId: "24",
            ProcessList: [
                {
                    ProcessId: '21',
                    ProcessName: '1st forming 150 MT',
                    UnitOfMeasurement: 'hours',
                    MachineId: "24",
                    MachineNumber: "MAC-50002816",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"
                },
                {
                    ProcessId: '22',
                    ProcessName: '2st forming 150 MT',
                    UnitOfMeasurement: 'gal',
                    MachineId: "24",
                    MachineNumber: "MAC-50002816",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"
                },
                {
                    ProcessId: '23',
                    ProcessName: '3st forming 150 MT',
                    UnitOfMeasurement: 'minute',
                    MachineId: "24",
                    MachineNumber: "MAC-50002816",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"
                },
                {
                    ProcessId: '24',
                    ProcessName: '4st forming 150 MT',
                    UnitOfMeasurement: 'hours',
                    MachineId: "24",
                    MachineNumber: "MAC-50002816",
                    UnitType: "Time",
                    ProcessTechnologyId: 1,
                    MachineRate: 12,
                    MachineRateId: "9a836a52-2b97-417c-800e-0356ce42469f"
                },
            ]
        },
    ]

    const handleCheckBox = (clickedData, index) => {
        let tempData = selectedData
        let tempArrForRedux = selectedProcessAndGroup

        const findGroupCode = () => {
            let isContainGroup = _.find(selectedData, function (obj) {
                if (obj.GroupName === clickedData.GroupName && obj.MachineId === clickedData.MachineId) {
                    return true;
                } else {
                    return false
                }
            });
            return isContainGroup
        }

        if (findGroupCode()) {
            let tempArrAfterDelete = selectedData && selectedData.filter((el, i) => {
                if (i === index) return false;
                return true
            })
            tempArrForRedux = selectedProcessAndGroup && selectedProcessAndGroup.filter(el => el.MachineRateId !== clickedData.MachineRateId && el.GroupName !== clickedData.ProcessId)
            console.log('tempArrForRedux: ', tempArrForRedux);
            dispatch(setSelectedDataOfCheckBox(tempArrForRedux))
            setSelectedData(tempArrAfterDelete)
        } else {
            tempData.push(clickedData)
            tempArrForRedux.push(clickedData)
            dispatch(setSelectedDataOfCheckBox(tempArrForRedux))
            setSelectedData(tempData)
        }

    }

    return (
        <div>
            <div className='py-3'>
                <table className='table cr-brdr-main group-process-table'>
                    <thead>
                        <tr>
                            <th>Process Group</th>
                            <th>Technologies</th>
                            <th>Machine Name</th>
                            <th>MachineTonnage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dummyData && dummyData.map((item, index) => {
                            const ProcessList = item.ProcessList;
                            return <>
                                <tr>
                                    <td> <span className='mr-2'><input type="checkbox" onClick={() => handleCheckBox(item, index)} /></span>{item.GroupName}</td>
                                    <td>{item.Technologies}</td>
                                    <td>{item.MachineName}</td>
                                    <td className='process-name'>{item.MachineTonnage} <div onClick={() => setProcessAcc(!processAcc)} className={`${processAcc ? 'Open' : 'Close'}`}></div></td>
                                </tr>
                                {processAcc && <tr>
                                    <td colSpan={4}>
                                        <table className='table cr-brdr-main mb-0'>
                                            <thead>
                                                <tr>
                                                    <th>Process Name</th>
                                                    <th>Machine Rate</th>
                                                    <th>UnitOfMeasurement</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ProcessList && ProcessList.map(item => {
                                                    return <tr>
                                                        <td>{item.ProcessName}</td>
                                                        <td>{item.MachineRate}</td>
                                                        <td>{item.UnitOfMeasurement}</td>
                                                    </tr>
                                                })}

                                            </tbody>
                                        </table>
                                    </td>
                                </tr>}
                            </>
                        })}

                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GroupProcess;