import React from "react";
import { Line } from "react-chartjs-2";
import { data1, options1 } from "../../../dashboard/ChartsDashboard";
const CostMovement = () => {
    return (
        <div className="seprate-box">
            <Line data={data1} options={options1} height={80} />
        </div>
    );
}
export default CostMovement;