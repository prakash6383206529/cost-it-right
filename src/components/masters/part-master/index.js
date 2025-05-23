import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import AddAssemblyPart from "./AddAssemblyPart";
import AddIndivisualPart from "./AddIndivisualPart";
import AssemblyPartListing from "./AssemblyPartListing";
import IndivisualPartListing from "./IndivisualPartListing";
import IndivisualProductListing from "./IndivisualProductListing";
import AddIndivisualProduct from "./AddIndivisualProduct";
import FetchDrawer from "./FetchBOMDrawer";
import ScrollToTop from "../../common/ScrollToTop";
import { MASTERS, PART } from "../../../config/constants";
import { checkPermission } from "../../../helper/util";
import { MESSAGES } from "../../../config/message";
import { resetStatePagination } from "../../common/Pagination/paginationAction";
import ProductHierarchyListing from "./ProductHierarchyListing";
import AddProductHierarchy from "./AddProductHierarchy";
import PartFamilyListing from "./PartFamilyListing";
import AddPartFamily from "./AddPartFamily";
export const ApplyPermission = React.createContext();

const PartMaster = () => {
  const dispatch = useDispatch()
  const [state, setState] = useState({
    isOpen: false,
    activeTab: "1",
    isAddBOMForm: false,
    isPartForm: false,
    isProductForm: false,
    getDetails: {},
    ViewAccessibility: false,
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    BulkUploadAccessibility: false,
    DownloadAccessibility: false,
    openDrawer: false,
    isHover: false,
    stopApiCallOnCancel: false,
    isPartFamilyForm: false,
  });

  const topAndLeftMenuData = useSelector((state) => state.auth.topAndLeftMenuData);
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration);
  const disabledClass = useSelector((state) => state.comman.disabledClass);
  const [permissionData, setPermissionData] = useState({});

  useEffect(() => {
    applyPermission(topAndLeftMenuData); toggle("1");
  }, [topAndLeftMenuData]);


  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find((el) => el.ModuleName === MASTERS);
      const accessData = Data && Data.Pages.find((el) => el.PageName === PART);
      const permmisionDataAccess = accessData && accessData.Actions && checkPermission(accessData.Actions);
      if (permmisionDataAccess !== undefined) {
        setPermissionData(permmisionDataAccess);
      }
    }
  };

  const toggleFetchDrawer = () => {
    setState((prevState) => ({ ...prevState, openDrawer: false, }));
  };

  const toggle = (tab) => {
    if (state.activeTab !== tab) {
      dispatch(resetStatePagination())
      setState((prevState) => ({ ...prevState, activeTab: tab, }));
    }
  };

  const displayForm = useCallback(() => {
    setState((prevState) => ({ ...prevState, isAddBOMForm: true, isPartForm: false, getDetails: {}, }));
  }, []);

  const getDetails = useCallback((data) => {
    setState((prevState) => ({ ...prevState, getDetails: data, isAddBOMForm: true, isPartForm: false, }));
  }, []);

  const hideForm = (type) => {
    setState((prevState) => ({ ...prevState, isAddBOMForm: false, isPartForm: false, isProductForm: false, getDetails: {}, stopApiCallOnCancel: type === "cancel", }));
  };

  const displayIndividualForm = () => {
    setState((prevState) => ({ ...prevState, isPartForm: true, isAddBOMForm: false, getDetails: {}, }));
  };

  const getIndividualPartDetails = (data) => {
    setState((prevState) => ({ ...prevState, getDetails: data, isPartForm: true, isAddBOMForm: false, }));
  };

  const displayIndividualProductForm = () => {
    setState((prevState) => ({ ...prevState, isProductForm: true, getDetails: {}, }));
  };

  const getIndividualProductDetails = (data) => {
    setState((prevState) => ({ ...prevState, getDetails: data, isProductForm: true, isAddBOMForm: false, }));
  };

  const openFetchDrawer = () => {
    setState((prevState) => ({ ...prevState, openDrawer: true, }));
    // dispatch(CreatComponentBySap(() => { }))  //MINDA
  };

  const handleMouse = () => {
    setState((prevState) => ({ ...prevState, isHover: true, }));
  };

  const handleMouseOut = () => {
    setState((prevState) => ({ ...prevState, isHover: false, }));
  };

  if (state.isAddBOMForm) {
    return (<AddAssemblyPart hideForm={hideForm} data={state.getDetails} displayBOMViewer={state.displayBOMViewer} stopApiCallOnCancel={state.stopApiCallOnCancel} />);
  }

  if (state.isPartForm) {
    return (<AddIndivisualPart hideForm={hideForm} data={state.getDetails} stopApiCallOnCancel={state.stopApiCallOnCancel} />);
  }

  if (state.isProductForm) {
    return (<AddIndivisualProduct hideForm={hideForm} data={state.getDetails} stopApiCallOnCancel={state.stopApiCallOnCancel} />);
  }
  // if (state.isPartFamilyForm) {
  //   return (<AddPartFamily hideForm={hideForm} data={state.getDetails} stopApiCallOnCancel={state.stopApiCallOnCancel} />);
  // }

  return (
    <>
      {
        Object.keys(permissionData).length > 0 &&
        <div className="container-fluid" id="go-to-top">
          <ScrollToTop pointProp="go-to-top" />
          <div className="user-page p-0">
            <div>
              <div className="d-flex justify-content-between">
                <div className="p-relative">
                  {disabledClass && (<div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"></div>)}
                </div>
              </div>

              <Nav tabs className="subtabs mt-0 p-relative">
                {disabledClass && (<div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"  ></div>)}
                <NavItem> <NavLink className={classnames({ active: state.activeTab === "1" })} onClick={() => toggle("1")}  > Manage Assembly  </NavLink></NavItem>
                <NavItem> <NavLink className={classnames({ active: state.activeTab === "2" })} onClick={() => toggle("2")} > Manage Component </NavLink> </NavItem>
                {initialConfiguration?.IsProductMasterConfigurable && (
                  <NavItem> <NavLink className={classnames({ active: state.activeTab === "3" })} onClick={() => toggle("3")} >  Manage Products </NavLink> </NavItem>
                )}
                {initialConfiguration?.IsProductMasterConfigurable && <NavItem> <NavLink className={classnames({ active: state.activeTab === "4" })} onClick={() => toggle("4")} > Product Hierarchy </NavLink> </NavItem>}
                {initialConfiguration?.IsSAPConfigured && <button type="button" className={`secondary-btn mr5 mt-1 fetch-btn`} title="Fetch" onClick={openFetchDrawer} onMouseOver={handleMouse} onMouseOut={handleMouseOut} >
                  <div className={`${state.isHover ? "swap-hover" : "swap"} mr-0`} ></div>
                </button>}
                {initialConfiguration?.PartAdditionalMasterFields?.IsShowPartFamily && <NavItem> <NavLink className={classnames({ active: state.activeTab === "5" })} onClick={() => toggle("5")} > Part Family </NavLink> </NavItem>}
              </Nav>
              <ApplyPermission.Provider value={permissionData}>
                <TabContent activeTab={state.activeTab}>
                  {state.activeTab === "1" && (
                    <TabPane tabId="1"> <AssemblyPartListing displayForm={displayForm} getDetails={getDetails} stopApiCallOnCancel={state.stopApiCallOnCancel} /> </TabPane>
                  )}
                  {state.activeTab === "2" && (
                    <TabPane tabId="2"> <IndivisualPartListing formToggle={displayIndividualForm} getDetails={getIndividualPartDetails} stopApiCallOnCancel={state.stopApiCallOnCancel} /> </TabPane>
                  )}
                  {state.activeTab === "3" && (
                    <TabPane tabId="3"> <IndivisualProductListing formToggle={displayIndividualProductForm} getDetails={getIndividualProductDetails} stopApiCallOnCancel={state.stopApiCallOnCancel} /> </TabPane>
                  )}
                  {state.activeTab === "4" && (
                    <TabPane tabId="4"> <ProductHierarchyListing /> </TabPane>
                  )}
                  {state.activeTab === "5" && (
                    <TabPane tabId="5"> <PartFamilyListing  /> </TabPane>
                  )}
                </TabContent>
              </ApplyPermission.Provider>
              {state.openDrawer && (<FetchDrawer isOpen={state.openDrawer} toggleDrawer={toggleFetchDrawer} anchor={"right"} />)}
            </div>
          </div>
        </div>
      }
    </>
  );
};

export default PartMaster;
