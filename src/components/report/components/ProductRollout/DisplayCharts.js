import React from "react";
import { Col, Row } from "reactstrap";
import { Suppliercontributiongraph } from "../../../dashboard/SupplierContributionGraph";
import { Costratiograph } from "../../../dashboard/CostRatioGraph";
import { colorArray } from "../../../dashboard/ChartsDashboard";

const DisplayCharts = () => {
    const pieChartData = {
        labels: ['RM', 'BOP', 'CC', 'Others'],
        datasets: [
            {
                label: '',
                data: [20, 12, 30, 10],
                backgroundColor: colorArray,
                borderWidth: 0.5,
                hoverOffset: 10
            },
        ],

    };
    const pieChartOption = {
        plugins: {
            legend: {
                position: 'bottom',
                align: 'center',
                labels: {
                    boxWidth: 16,
                    borderWidth: 0,
                    padding: 8,
                    color: '#000'
                }
            },
        },
        layout: {
            padding: {
                top: 30
            }
        }
    }
    return (
        <>
            <Row>
                <Col md="6">
                    <div className="seprate-box">
                        <h6>Supplier Contribution</h6>
                        <Suppliercontributiongraph />
                    </div>
                </Col>
                <Col md="6">
                    <div className="seprate-box">
                        <h6>Cost Ratio</h6>
                        <Costratiograph data={pieChartData} options={pieChartOption} />
                    </div>
                </Col>
            </Row>
        </>

    );
}
export default DisplayCharts;