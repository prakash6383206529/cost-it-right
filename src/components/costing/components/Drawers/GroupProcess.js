import React, { useState } from "react";

function GroupProcess(props) {
    const [processAcc, setProcessAcc] = useState(false);
    const dummyData = [
        {
            groupID: "1",
            groupName: "Drilling and Cutting",
            technology: "Sheet metal",
            machineName: "T4",
            tonnage: 3,
            processList: [
                {
                    processID: '11',
                    processName: '1st forming 150 MT',
                    machineRate: '4300',
                    UOM: 'hours'
                },
                {
                    processID: '12',
                    processName: '2st forming 150 MT',
                    machineRate: '4400',
                    UOM: 'gal'
                },
                {
                    processID: '13',
                    processName: '3st forming 150 MT',
                    machineRate: '5500',
                    UOM: 'minute'
                },
            ]
        },
        {
            groupID: "2",
            groupName: "painting and cleaning",
            technology: "Sheet metal",
            machineName: "T6",
            tonnage: 3,
            processList: [
                {
                    processID: '21',
                    processName: '1st forming 150 MT',
                    machineRate: '4300',
                    UOM: 'hours'
                },
                {
                    processID: '22',
                    processName: '2st forming 150 MT',
                    machineRate: '4400',
                    UOM: 'gal'
                },
                {
                    processID: '23',
                    processName: '3st forming 150 MT',
                    machineRate: '5500',
                    UOM: 'minute'
                },
                {
                    processID: '24',
                    processName: '4st forming 150 MT',
                    machineRate: '6500',
                    UOM: 'hours'
                },
            ]
        },
    ]
    return (
        <div>
            <div className='py-2 px-3'>
                <table className='table cr-brdr-main group-process-table'>
                    <thead>
                        <tr>
                            <th>Process Group</th>
                            <th>Technology</th>
                            <th>Machine Name</th>
                            <th>Tonnage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dummyData && dummyData.map(item => {
                            const processList = item.processList;
                            return <>
                                <tr>
                                    <td> <span className='mr-2'><input type="checkbox" /></span>{item.groupName}</td>
                                    <td>{item.technology}</td>
                                    <td>{item.machineName}</td>
                                    <td className='process-name'>{item.tonnage} <div onClick={() => setProcessAcc(!processAcc)} className={`${processAcc ? 'Open' : 'Close'}`}></div></td>
                                </tr>
                                {processAcc && <tr>
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
                                                {processList && processList.map(item => {
                                                    return <tr>
                                                        <td>{item.processName}</td>
                                                        <td>{item.machineRate}</td>
                                                        <td>{item.UOM}</td>
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