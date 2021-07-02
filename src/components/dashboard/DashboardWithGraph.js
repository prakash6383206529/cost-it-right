import React, {useEffect} from 'react';
import { connect } from "react-redux";
import { getMenuByUser } from "../../actions/auth/AuthActions";
import { checkForNull, loggedInUserId } from "../../helper";
import { reactLocalStorage } from "reactjs-localstorage";
import { Col, Container, Row } from "reactstrap";
import { DashboardMaster } from "../../config/constants";
import { Field, reduxForm } from "redux-form";
import {  searchableSelect} from '../layout/FormInputs'
import { Costmovementgraph } from "./CostMovementGraph";
import { Costcomparisonplantgraph } from "./CostComparisonPlantGraph";
import {Suppliercontributiongraph} from './SupplierContributionGraph';
import { Costratiograph } from "./CostRatioGraph";
import {Costratiobuyinggraph} from './CostRatioBuyingGraph';

export function Dashboardwithgraph(props) {
    const { handleSubmit, menusData } = props
    
    useEffect(() => {
        props.getMenuByUser(loggedInUserId(), () => {
          if (menusData !== undefined) {
            reactLocalStorage.set("ModuleId", menusData[0].ModuleId);
            props.getLeftMenu(
              menusData[0].ModuleId,
              loggedInUserId(),
              (res) => {}
            );
          }
        });
      })

    return (
        <>
            <Container fluid className="dashboard-page">
                <Row>
                <Col md="12">
                    <h1>{DashboardMaster}</h1>
                </Col>
                </Row>

                <form onSubmit={handleSubmit}>
                <Row className="m-0">
                <div className="graph-box w-100 d-flex pb-0">
                <Col md="3">
                    <Field
                    name="Business"
                    type="text"
                    label="Business"
                    component={searchableSelect}
                    placeholder={"Select"}              
                    />
                </Col>
                <Col md="3">
                    <Field
                    name="Plant"
                    type="text"
                    label="Plant"
                    component={searchableSelect}
                    placeholder={"Select"}              
                    />
                </Col>
                <Col md="3">
                    <Field
                    name="Part Number"
                    type="text"
                    label="Part Number"
                    component={searchableSelect}
                    placeholder={"Select"}              
                    />
                </Col>
                </div>
                </Row>
                <Row className="graph-section">
                    <Col md="6">
                    <div className="graph-box">
                        <h3 className="mb-3">Cost Movement by Cost Drivers</h3>
                        <Costmovementgraph/>
                    </div>
                    </Col>
                    <Col md="6">
                    <div className="graph-box">
                        <h3 className="mb-3">Cost Comparison by Plant</h3>
                        <Costcomparisonplantgraph/>
                    </div>
                    </Col>
                </Row>
                <Row className="graph-section">
                    <Col md="3">
                    <div className="graph-box">
                        <h3 className="mb-3">Supplier Contribution(SOB)</h3>
                        <Suppliercontributiongraph/>
                    </div>
                    </Col>
                    <Col md="3">
                    <div className="graph-box">
                        <h3 className="mb-3">Cost Ratio(PFS)</h3>
                        <Costratiograph/>
                    </div>
                    </Col>
                    <Col md="6">
                    <div className="graph-box">
                        <h3 className="mb-3">Cost Ratio(Buying)</h3>
                        <Costratiobuyinggraph/>
                    </div>
                    </Col>
                </Row>
                </form>
            </Container>
        </>
    )
}

function mapStateToProps({ auth }) {
    const { menusData } = auth;
    return { menusData };
  }

export default connect(mapStateToProps, {
    getMenuByUser,
  })(reduxForm({
    form: 'Dashboardwithgraph',
    enableReinitialize: true,
  })(Dashboardwithgraph));