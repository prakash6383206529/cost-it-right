import React from 'react'
import { Line } from 'react-chartjs-2';
import { data1,options1} from "./ChartsDashboard";

export function Costmovementgraph(props) {
    return (
        <>
            <div className="graph-container">
                <Line data={data1}  options={options1} />
            </div>
        </>
    )
}
