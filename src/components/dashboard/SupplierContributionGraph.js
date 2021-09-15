import React from 'react'
import {data3, options3,} from "./ChartsDashboard";
import { Doughnut  } from 'react-chartjs-2';

export function Suppliercontributiongraph(props) {
    

    return (
        <>
            <div className="graph-container">
                <Doughnut data={data3} options={options3}/>
            </div>
        </>
    )
}
