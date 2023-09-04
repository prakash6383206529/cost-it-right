import React from "react";
import { Line } from "react-chartjs-2";
import { colorArray, data1, options1 } from "../../../dashboard/ChartsDashboard";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { getProductRolloutCostMovement } from "../../actions/ReportListing";
import NoContentFound from "../../../common/NoContentFound";
import { EMPTY_DATA } from "../../../../config/constants";
const CostMovement = ({ partId }) => {
    const dispatch = useDispatch()
    const [costMovementData, setCostMovementData] = useState([])
    const [noContent, setNoContent] = useState(true)

    const formatDate = (dateString) => {
        const parts = dateString.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };
    useEffect(() => {
        dispatch(getProductRolloutCostMovement(partId, (res) => {
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
            } else {
                setNoContent(true)
            }
        }))
    }, [partId])

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
        <div className="seprate-box">
            <h4 className="mb-2 ml-1">Cost Movement</h4>
            {noContent ? <NoContentFound customClassName="" title={EMPTY_DATA} /> : <Line data={costMovementData} options={options} height={80} />}
        </div>
    );
}
export default CostMovement;