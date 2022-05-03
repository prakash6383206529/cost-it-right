import React from 'react';
import { ProcessGroup } from '../../../masters/masterUtil';




function GroupProcess(props) {
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
                        <tr>
                            <td>Drilling and Cutting</td>
                            <td>Sheet Metal</td>
                            <td>T4</td>
                            <td className='process-name'>3 <div className='Open'></div> </td>
                        </tr>
                        <tr>
                            <td colSpan={4}>
                                <table className='table cr-brdr-main mb-0'>
                                    <tbody>
                                        <tr>
                                            <th>Process Name</th>
                                            <th>machine Type</th>
                                            <th>Machine Rate</th>
                                            <th>UOM</th>
                                        </tr>
                                    </tbody>
                                    <tbody>
                                        <tr>
                                            <td>1st forming 150 MT</td>
                                            <td> - </td>
                                            <td>Minutes</td>
                                            <td>4000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td>Drilling and Cutting</td>
                            <td>Sheet Metal</td>
                            <td>T4</td>
                            <td className='process-name'>3 <div className='Close'></div> </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GroupProcess;