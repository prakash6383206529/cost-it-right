
import React from 'react'
import { Bar } from 'react-chartjs-2';
import { colorArray } from '../../../dashboard/ChartsDashboard';
import { useSelector } from 'react-redux';
import { getConfigurationKey } from '../../../../helper';
const StageOfParts = () => {
    const StageOfPartDetails = useSelector(state => state.report.stageOfPartDetails)
    const { ApprovedPartCostingCount, DraftPartCostingCount, RejectedPartCostingCount, PendingPartCostingCount, CostNotDonePartCount, ProductPrice } = StageOfPartDetails
    const data = {
        labels: ['Parts'],
        datasets: [
            {
                label: 'Approved',
                data: [ApprovedPartCostingCount],
                backgroundColor: colorArray[2],
            },
            {
                label: 'Draft',
                data: [DraftPartCostingCount],
                backgroundColor: colorArray[1],
            },
            {
                label: 'Rejected',
                data: [RejectedPartCostingCount],
                backgroundColor: colorArray[3],
            },
            {
                label: 'Pending',
                data: [PendingPartCostingCount],
                backgroundColor: colorArray[0],
            },
            {
                label: 'Cost Not Done',
                data: [CostNotDonePartCount],
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
                <input className='form-control w-auto' type='text' disabled={true} value={getConfigurationKey().BaseCurrency + " " + ProductPrice}></input>
            </div>
            <div className='mt-3'>

                <Bar data={data} options={options} height={32} />
            </div>
        </div>
    );
}
export default React.memo(StageOfParts);