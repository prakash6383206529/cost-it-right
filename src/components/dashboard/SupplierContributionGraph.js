import React from 'react'
import { Doughnut } from 'react-chartjs-2';

export function Suppliercontributiongraph(props) {


    return (
        <>
            <div className="graph-container">
                <Doughnut data={props?.data} options={props?.options} />
            </div>
        </>
    )
}
Suppliercontributiongraph.defaultProps = {
    data: {},
    options: {}
}
