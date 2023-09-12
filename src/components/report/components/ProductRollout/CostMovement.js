import React from "react";
import { Line } from "react-chartjs-2";
import { colorArray } from "../../../dashboard/ChartsDashboard";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { getProductRolloutCostMovement } from "../../actions/ReportListing";
import NoContentFound from "../../../common/NoContentFound";
import { EMPTY_DATA } from "../../../../config/constants";
import Toaster from "../../../common/Toaster";
import LoaderCustom from "../../../common/LoaderCustom";
const CostMovement = ({ partId, partType, partNumber, dateArr }) => {
    const dispatch = useDispatch()
    const [costMovementData, setCostMovementData] = useState([])
    const [noContent, setNoContent] = useState(true)
    const [isLoader, setIsLaoder] = useState(false)

    const formatDate = (dateString) => {
        const parts = dateString.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };
    useEffect(() => {
        setIsLaoder(true)
        dispatch(getProductRolloutCostMovement(partId, partNumber, partType, (res) => {
            if (res && res.status === 200) {
                setNoContent(false)
                const uniqueDates = new Set();
                const datasets = {};

                // Extract all unique dates
                res.data.Data && res.data.Data.Label.forEach((item) => {
                    Object.keys(item.Data).forEach((date) => {
                        const parts = date.split('-');
                        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

                        if (!isNaN(new Date(formattedDate).getTime())) {
                            uniqueDates.add(formattedDate);
                        }
                    });
                });

                // Sort the valid dates as strings in ascending order
                const sortedDates = Array.from(uniqueDates).sort();

                // Organize res.data.Data.Label into res.data.Data.Labelsets for each type
                res.data.Data.Label.forEach((item, index) => {
                    const type = item.TableHeads;
                    datasets[type] = {
                        label: type,
                        data: [],
                        fill: false,
                        backgroundColor: colorArray[index],
                        borderColor: colorArray[index],
                        spanGaps: true,
                    };

                    // Fill in the data for each date, using NaN for missing dates
                    sortedDates.forEach((date) => {
                        const parts = date.split('-');
                        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        datasets[type].data.push(item.Data[formattedDate] || NaN);
                    });
                });

                const chartData = {
                    labels: sortedDates.map(formatDate),
                    datasets: Object.values(datasets),
                };
                setCostMovementData(chartData)
                setIsLaoder(false)
            } else {
                setNoContent(true)
                setIsLaoder(false)
            }
        }))
    }, [partId, partNumber, partType, dispatch])


    const options = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Value', // Y-axis label
                },
            },
        },
        plugins: {
            legend: {
                display: true, // Show legend
                position: 'bottom', // Legend position ('top', 'bottom', 'left', 'right')
            },
        },
    };

    return (
        <div className="seprate-box cost-movement-chart">
            <h4 className="mb-2 ml-1">Cost Movement</h4>
            {isLoader ? <LoaderCustom /> : <>
                {noContent ? <NoContentFound customClassName="" title={EMPTY_DATA} /> : <Line data={costMovementData} options={options} height={80} />}</>}
        </div>
    );
}
CostMovement.defaultProps = {
    partId: null,
    partType: null,
    partNumber: null,
}

export default CostMovement;