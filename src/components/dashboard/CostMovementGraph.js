import React from 'react'
import { Line } from 'react-chartjs-2';
import { data1,options1} from "./ChartsDashboard";

export function Costmovementgraph(props) {
    const {graphData=data1,graphOptions=options1,graphHeight} = props;
    return (
        <>
            <div className="graph-container">
                <Line data={graphData}  options={graphOptions} height={graphHeight} />
            </div>
        </>
    )
}
