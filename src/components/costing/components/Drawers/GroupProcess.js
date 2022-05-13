import React, { useContext, useEffect, useState } from "react";
import _ from 'lodash'
import { useDispatch, useSelector } from "react-redux";
import { getMachineProcessGroupDetail, setIdsOfProcessGroup, setSelectedDataOfCheckBox } from "../../actions/Costing";
import { costingInfoContext } from "../CostingDetailStepTwo";
import { getConfigurationKey } from "../../../../helper";
import { EMPTY_GUID } from "../../../../config/constants";
function GroupProcess(props) {
    const { selectedProcessAndGroup, selectedProcessGroupId, CostingEffectiveDate } = useSelector(state => state.costing)
    const [processAcc, setProcessAcc] = useState(false);
    const [processAccObj, setProcessAccObj] = useState({});
    const [selectedData, setSelectedData] = useState([])
    const [tableData, setTableDataList] = useState([])
    const costData = useContext(costingInfoContext)
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

    useEffect(() => {
        let data = {
            VendorId: costData.VendorId,
            TechnologyId: String(costData.TechnologyId),
            VendorPlantId: getConfigurationKey()?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
            DestinationPlantId: getConfigurationKey()?.IsDestinationPlantConfigure ? costData.DestinationPlantId : EMPTY_GUID,
            CostingId: costData.CostingId,
            EffectiveDate: CostingEffectiveDate,
        }
        dispatch(getMachineProcessGroupDetail(data, (res) => {
            if (res && res.status === 200) {
                let Data = res.data.DataList;
                setTableDataList(Data)
            } else if (res && res.response && res.response.status === 412) {
                setTableDataList([])
            } else {
                setTableDataList([])
            }
        }))
    }, [])

    const findGroupCode = (clickedData, arr) => {
        let isContainGroup = _.find(arr, function (obj) {
            if (obj.GroupName === clickedData.GroupName && obj.MachineId === clickedData.MachineId) {
                return true;
            } else {
                return false
            }
        });
        return isContainGroup
    }

    const handleCheckBox = (clickedData, index) => {
        let tempData = selectedData
        let tempArrForRedux = selectedProcessAndGroup
        if (findGroupCode(selectedData)) {
            let tempArrAfterDelete = selectedData && selectedData.filter((el, i) => {
                if (i === index) return false;
                return true
            })
            tempArrForRedux = selectedProcessAndGroup && selectedProcessAndGroup.filter(el => el.MachineId !== clickedData.MachineId && el.GroupName !== clickedData.GroupName)
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
                        {tableData && tableData.map((item, index) => {
                            const ProcessList = item.ProcessList;
                            return <>
                                <tr>

                                    <td> <span className='mr-2'>
                                        {!findGroupCode(item, selectedProcessGroupId) && <input type="checkbox" onClick={() => handleCheckBox(item, index)} />}
                                    </span>
                                        {item.GroupName}</td>
                                    <td>{item.Technology}</td>
                                    <td>{item.MachineName}</td>
                                    <td className='process-name'>{item.Tonnage} <div onClick={() => {
                                        processAccObj[index] === true ? setProcessAccObj(prevState => ({ ...prevState, [index]: false })) : setProcessAccObj(prevState => ({ ...prevState, [index]: true }))
                                    }} className={`${processAccObj[index] ? 'Open' : 'Close'}`}></div></td>
                                </tr>
                                {processAccObj[index] && <tr>
                                    <td colSpan={4}>
                                        <table className='table cr-brdr-main mb-0'>
                                            <thead>
                                                <tr>
                                                    <th>Process Name</th>
                                                    <th>Machine Rate</th>
                                                    <th>UOM</th>
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