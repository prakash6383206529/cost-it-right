import React, { Component, useEffect } from "react";
import { connect } from "react-redux";
import { getMenuByUser, getLeftMenu } from "../../actions/auth/AuthActions";
import { checkForNull, loggedInUserId } from "../../helper";
import { reactLocalStorage } from "reactjs-localstorage";
import { Field, reduxForm } from "redux-form";
import dashboardImg from '../../assests/images/dashboard-img.png'

function Dashboard(props) {
  const { handleSubmit, menusData } = props

  useEffect(() => {
    props.getMenuByUser(loggedInUserId(), () => {
      if (menusData !== undefined) {
        reactLocalStorage.set("ModuleId", menusData[0].ModuleId);
        props.getLeftMenu(
          menusData[0].ModuleId,
          loggedInUserId(),
          (res) => { }
        );
      }
    });
  })



  return (
    <>
      <div className="dashboard-top position-relative">
        <div className="dashboard-text">
          <h2>Dashboard will come here</h2>
        </div>
        <img src={dashboardImg} alt='dashboard-background' />
      </div>
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
