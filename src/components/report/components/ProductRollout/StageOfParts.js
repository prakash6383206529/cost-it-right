
import React from 'react'
import { Bar } from 'react-chartjs-2';
import { colorArray } from '../../../dashboard/ChartsDashboard';
const StageOfParts = () => {
    const data = {
        labels: ['Parts'],
        datasets: [
            {
                label: 'Approved',
                data: [5],
                backgroundColor: colorArray[2],
            },
            {
                label: 'Draft',
                data: [3],
                backgroundColor: colorArray[1],
            },
            {
                label: 'Rejected',
                data: [2],
                backgroundColor: colorArray[3],
            },
            {
                label: 'Pending',
                data: [3],
                backgroundColor: colorArray[0],
            },
            {
                label: 'Cost Not Done',
                data: [1],
                backgroundColor: colorArray[4],
            }
        ],
    };
    const options = {
        indexAxis: 'y',
        responsive: true,
        scales: {
            x: {
                display: false,
                stacked: true,
            },
            y: {
                display: false,
                stacked: true,
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
            },
        },
    };
    return (
        <div className='seprate-box'>
            <div className='d-flex justify-content-between align-items-center'>
                <h6>Stage of Parts</h6>
                <input className='form-control w-auto' type='text' disabled={true} value={'INR 1,20,000'}></input>
            </div>
            <div className='mt-3'>

                <Bar data={data} options={options} height={30} />
            </div>
        </div>
    );
}
export default StageOfParts;