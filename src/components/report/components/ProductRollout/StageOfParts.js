
import React from 'react'
import { Bar } from 'react-chartjs-2';
import { colorArray } from '../../../dashboard/ChartsDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getConfigurationKey } from '../../../../helper';
import { useEffect } from 'react';
import { getStageOfPartDetails } from '../../actions/ReportListing';
import { useState } from 'react';
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA, EMPTY_GUID } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
const StageOfParts = ({ productId }) => {
    const dispatch = useDispatch()
    const StageOfPartDetails = useSelector(state => state.report.stageOfPartDetails)
    const [noContent, setNoContent] = useState(true)
    const [isLoader, setIsLoader] = useState(false)
    useEffect(() => {
        setIsLoader(true)
        dispatch(getStageOfPartDetails(productId, (res) => {
            setIsLoader(false)
            if (res && res.status === 200) {
                setNoContent(false)
            } else {
                setNoContent(true)
            }
        }))
    }, [productId])

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
        <div className='seprate-box stage-of-parts'>
            <div className='d-flex justify-content-between align-items-center'>
                <h6>Stage of Parts</h6>
                <div className='d-flex align-items-center'>
                    <label className='mr-2'>Cost: </label>
                    <input className='form-control w-auto' type='text' disabled={true} value={ProductPrice ? getConfigurationKey().BaseCurrency + " " + ProductPrice : '-'}></input>
                </div>
            </div>
            <div>
                {isLoader ? <LoaderCustom /> : <>
                    {noContent ? <NoContentFound title={EMPTY_DATA} customClassName="my-0" imagClass="custom-width-76px" /> : <Bar data={data} options={options} height={32} />}
                </>}
            </div>
        </div>
    );
}
StageOfParts.defualtProps = {
    productId: EMPTY_GUID
}
export default React.memo(StageOfParts);