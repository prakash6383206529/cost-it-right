import React, { useEffect, useState, } from "react";
import { useSelector } from "react-redux";
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from "classnames";
import AddFuel from "./AddFuel";
import AddPower from "./AddPower";
import FuelListing from "./FuelListing";
import PowerListing from "./PowerListing";
import { ADDITIONAL_MASTERS, FUEL_AND_POWER } from "../../../config/constants";
import { checkPermission } from "../../../helper/util";
import ScrollToTop from "../../common/ScrollToTop";

export const ApplyPermission = React.createContext();

const FuelMaster = (props) => {
  const [state, setState] = useState({
    Id: "",
    activeTab: "1",
    isFuelForm: false,
    isPowerForm: false,
    data: {},
    ViewAccessibility: false,
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    BulkUploadAccessibility: false,
    DownloadAccessibility: false,
    stopApiCallOnCancel: false,
    isImport: false,
    permissionData: {},
  });
  // const [permissionData, setPermissionData] = useState({});

  const { leftMenuData, loading, topAndLeftMenuData } = useSelector((state) => state.auth);

  useEffect(() => {
    applyPermission(topAndLeftMenuData);
  }, [topAndLeftMenuData]);

  /**
   * @method applyPermission
   * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
   */
  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data =
        topAndLeftMenuData &&
        topAndLeftMenuData.find((el) => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData =
        Data && Data.Pages.find((el) => el.PageName === FUEL_AND_POWER);
      const permmisionDataAccess =
        accessData && accessData.Actions && checkPermission(accessData.Actions);

      if (permmisionDataAccess !== undefined) {
        setState((prevState) => ({ ...prevState, permissionData: permmisionDataAccess, }));
      }
    }
  };

  /**
   * @method toggle
   * @description toggling the tabs
   */
  const toggle = (tab) => {
    if (state.activeTab !== tab) {
      setState((prevState) => ({ ...prevState, activeTab: tab, stopApiCallOnCancel: false, }));
    }
  };

  const displayFuelForm = () => {
    setState((prevState) => ({ ...prevState, isFuelForm: true, isPowerForm: false, data: {}, }));
  };

  const displayPowerForm = () => {
    setState((prevState) => ({ ...prevState, isPowerForm: true, isFuelForm: false, data: {}, }));
  };

  const hideForm = (type, isImport) => {
    setState((prevState) => ({ ...prevState, isFuelForm: false, isPowerForm: false, data: {}, stopApiCallOnCancel: false, isImport: isImport }));
    if (type === "cancel") {
      setState((prevState) => ({ ...prevState, stopApiCallOnCancel: true }));
    }
  };

  const getDetails = (data) => {
    setState((prevState) => ({ ...prevState, isFuelForm: true, data: data, }));
  };

  const getDetailsPower = (data) => {
    setState((prevState) => ({ ...prevState, isPowerForm: true, data: data, }));
  };

  //   const { isFuelForm, isPowerForm, data } = state;

  if (state.isFuelForm === true) {
    return <AddFuel data={state.data} hideForm={hideForm} />;
  }

  if (state.isPowerForm === true) {
    return (
      <AddPower data={state.data} hideForm={hideForm} stopApiCallOnCancel={state.stopApiCallOnCancel} />
    );
  }

  return (
    <>

      {state.permissionData && Object.keys(state.permissionData).length > 0 && (

        <div className="container-fluid" id="go-to-top">
          <ScrollToTop pointProp="go-to-top" />
          <Row>
            <Col>
              <div>
                <Nav tabs className="subtabs mt-0">
                  <NavItem>
                    <NavLink
                      className={classnames({ active: state.activeTab === "1" })}
                      onClick={() => {
                        toggle("1");
                      }}
                    >
                      Manage Fuel
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: state.activeTab === "2" })}
                      onClick={() => {
                        toggle("2");
                      }}
                    >
                      Manage Power
                    </NavLink>
                  </NavItem>
                </Nav>
                <ApplyPermission.Provider value={state.permissionData}>
                  <TabContent activeTab={state.activeTab}>
                    {state.activeTab === "1" && (
                      <TabPane tabId="1">
                        <FuelListing
                          formToggle={displayFuelForm}
                          getDetails={getDetails}
                          AddAccessibility={state.AddAccessibility}
                          EditAccessibility={state.EditAccessibility}
                          DeleteAccessibility={state.DeleteAccessibility}
                          BulkUploadAccessibility={state.BulkUploadAccessibility}
                          DownloadAccessibility={state.DownloadAccessibility}
                          ViewAccessibility={state.ViewAccessibility}
                          stopApiCallOnCancel={state.stopApiCallOnCancel}
                          isImport={state.isImport}
                        />
                      </TabPane>
                    )}

                    {state.activeTab === "2" && (
                      <TabPane tabId="2">
                        <PowerListing
                          formToggle={displayPowerForm}
                          getDetails={getDetailsPower}
                          AddAccessibility={state.AddAccessibility}
                          EditAccessibility={state.EditAccessibility}
                          DeleteAccessibility={state.DeleteAccessibility}
                          BulkUploadAccessibility={state.BulkUploadAccessibility}
                          DownloadAccessibility={state.DownloadAccessibility}
                          ViewAccessibility={state.ViewAccessibility}
                          stopApiCallOnCancel={state.stopApiCallOnCancel}
                          isImport={state.isImport}
                        />
                      </TabPane>
                    )}
                  </TabContent>
                </ApplyPermission.Provider>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default FuelMaster;
