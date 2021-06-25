import React, { Component, useEffect } from "react";
import { connect } from "react-redux";
import { getMenuByUser, getLeftMenu } from "../../actions/auth/AuthActions";
import { checkForNull, loggedInUserId } from "../../helper";
import { reactLocalStorage } from "reactjs-localstorage";
import { Col, Container, Row } from "reactstrap";
import { DashboardMaster } from "../../config/constants";
import { Field, reduxForm } from "redux-form";
import {  searchableSelect} from '../layout/FormInputs'
import { chart1,chart2,chart3,chart4,chart5 } from "./ChartsDashboard";


function Dashboard (props) {
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

  return(
    <>
      {/*<div className="dashboard-top position-relative">
          <div className="dashboard-text">
            <h2>Dashboard will come here</h2>
          </div>
          <img src={require('../../assests/images/dashboard-img.png')} alt='dashboard-background' />
       </div> */}
      <Container fluid className="dashboard-page">
        <Row>
          <Col md="12">
            <h1>{DashboardMaster}</h1>
          </Col>
        </Row>

        <form onSubmit={handleSubmit}>
        <Row>
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
        </Row>
        <Row className="graph-section">
            <Col md="6">
              <div className="graph-box">
                <div className="left-border ">Cost Movement by Cost Drivers</div>
                {/* <div className="graph-container">
                  <HighchartsReact highcharts={Highcharts} options={chart1}/>
                </div> */}
              </div>
            </Col>
            <Col md="6">
              <div className="graph-box">
                <div className="left-border ">Cost Comparison by Plant</div>
                {/* <div className="graph-container">
                <HighchartsReact highcharts={Highcharts} options={chart2}/>
                </div> */}
              </div>
            </Col>
        </Row>
        <Row className="graph-section">
            <Col md="3">
              <div className="graph-box">
                <div className="left-border ">Supplier Contribution(SOB)</div>
                {/* <div className="graph-container">
                  <HighchartsReact highcharts={Highcharts} options={chart3}/>
                </div> */}
              </div>
            </Col>
            <Col md="3">
              <div className="graph-box">
                <div className="left-border ">Cost Ratio(PFS)</div>
                {/* <div className="graph-container">
                  <HighchartsReact highcharts={Highcharts} options={chart4}/>
                </div> */}
              </div>
            </Col>
            <Col md="6">
              <div className="graph-box">
                <div className="left-border ">Cost Ratio(Buying)</div>
                {/* <div className="graph-container">
                  <HighchartsReact highcharts={Highcharts} options={chart5}/>
                </div> */}
              </div>
            </Col>
        </Row>
        </form>

      </Container>
    </>
  )
}
/**
 * @name mapStateToProps
 * @desc map state containing organisation details from the api to props
 * @return object{}
 */
function mapStateToProps({ auth }) {
  const { menusData, leftMenuData } = auth;
  return { menusData, leftMenuData };
}

export default connect(mapStateToProps, {
  getMenuByUser,
  getLeftMenu,
})(reduxForm({
  form: 'Dashboard',
  enableReinitialize: true,
})(Dashboard));
