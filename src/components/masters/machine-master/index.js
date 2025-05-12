import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from "classnames";
import MachineRateListing from "./MachineRateListing";
import AddMachineRate from "./AddMachineRate";
import AddMoreDetails from "./AddMoreDetails";
import ProcessListing from "./ProcessListing";
import { checkPermission } from "../../../helper/util";
import { APPROVAL_CYCLE_STATUS_MASTER, MACHINE, MACHINE_MASTER_ID, MASTERS, } from "../../../config/constants";
//MINDA
// import { APPROVED_STATUS_MASTER, MACHINE, MACHINE_MASTER_ID, MASTERS, } from '../../../config/constants';
import ScrollToTop from "../../common/ScrollToTop";
import { CheckApprovalApplicableMaster } from "../../../helper";
import CommonApproval from "../material-master/CommonApproval";
import { MESSAGES } from "../../../config/message";
import { resetStatePagination } from "../../common/Pagination/paginationAction";
export const ApplyPermission = React.createContext();

const MachineMaster = () => {
  const dispatch = useDispatch()

  const [state, setState] = useState({
    activeTab: "1",
    isMachineRateForm: false,
    isAddMoreDetails: false,
    isProcessForm: false,
    data: {},
    editDetails: {},
    ViewAccessibility: false,
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    DownloadAccessibility: false,
    BulkUploadAccessibility: false,
    stopApiCallOnCancel: false,
  });
  const [permissionData, setPermissionData] = useState({});
  const { topAndLeftMenuData } = useSelector((state) => state.auth);
  const { disabledClass } = useSelector((state) => state.comman);
  const [isImport, setIsImport] = useState(false)

  useEffect(() => {
    applyPermission(topAndLeftMenuData);
  }, [topAndLeftMenuData]);

  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find((el) => el.ModuleName === MASTERS);
      const accessData = Data && Data.Pages.find((el) => el.PageName === MACHINE);
      const permmisionDataAccess = accessData && accessData.Actions && checkPermission(accessData.Actions);
      if (permmisionDataAccess !== undefined) {
        setPermissionData(permmisionDataAccess);
        setState((prevState) => ({ ...prevState, AddAccessibility: permmisionDataAccess.Add, EditAccessibility: permmisionDataAccess.Edit, DeleteAccessibility: permmisionDataAccess.Delete }));
      }
    }
  };

  const toggle = (tab) => {
    if (state.activeTab !== tab) {
      dispatch(resetStatePagination())
      setState((prevState) => ({ ...prevState, activeTab: tab, stopApiCallOnCancel: false, }));
    };
  }
  const displayForm = () => {
    setState((prevState) => ({ ...prevState, isMachineRateForm: true, isAddMoreDetails: false, editDetails: { isEditFlag: false }, }));
  };
  const getDetails = (data, isMachineAssociate) => {
    setState((prevState) => ({ ...prevState, isMachineRateForm: true, isAddMoreDetails: false, editDetails: data, isMachineAssociated: isMachineAssociate, }));
  };
  const setData = (data = {}) => { setState((prevState) => ({ ...prevState, data: data })); };

  const hideForm = (type, isImport) => {
    setIsImport(isImport)
    setState((prevState) => ({ ...prevState, isMachineRateForm: false, data: {}, editDetails: {}, stopApiCallOnCancel: false, }));
    if (type === "cancel") {
      setState((prevState) => ({ ...prevState, stopApiCallOnCancel: true }));
    }
  };

  const displayMoreDetailsForm = (data = {}) => {
    setState((prevState) => ({ ...prevState, isAddMoreDetails: true, isMachineRateForm: false, editDetails: data, }));
  };

  const hideMoreDetailsForm = (data = {}, editDetails = {}) => {
    setState((prevState) => ({ ...prevState, isAddMoreDetails: false, isMachineRateForm: true, data: data, editDetails: editDetails, }));
  };

  const { isMachineRateForm, isAddMoreDetails } = state;

  if (isMachineRateForm === true) {
    return (
      <AddMachineRate editDetails={state.editDetails} data={state.data} setData={setData} hideForm={hideForm} displayMoreDetailsForm={displayMoreDetailsForm} AddAccessibility={state.AddAccessibility} EditAccessibility={state.EditAccessibility} isMachineAssociated={state.isMachineAssociated} isImport={isImport} />
    );
  }

  if (isAddMoreDetails === true) {
    return (
      <AddMoreDetails editDetails={state.editDetails} data={state.data} hideMoreDetailsForm={hideMoreDetailsForm} isMachineAssociated={state.isMachineAssociated} isImport={isImport} />
    );
  }

  return (
    <>
      {Object.keys(permissionData).length > 0 && (<div className="container-fluid" id="go-top-top">
        <ScrollToTop pointProp={"go-top-top"} />
        <Row>
          <Col>
            <div>
              <Nav tabs className="subtabs mt-0 p-relative">
                {disabledClass && (<div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"></div>)}
                <NavItem><NavLink className={classnames({ active: state.activeTab === "1", })} onClick={() => { toggle("1"); }} >Machine Rate  </NavLink> </NavItem>
                <NavItem> <NavLink className={classnames({ active: state.activeTab === "2", })} onClick={() => { toggle("2"); }}> Manage Process</NavLink> </NavItem>
                {CheckApprovalApplicableMaster(MACHINE_MASTER_ID) && (<NavItem><NavLink className={classnames({ active: state.activeTab === "3", })} onClick={() => { toggle("3"); }} > Approval Status </NavLink></NavItem>)}
              </Nav>
              <ApplyPermission.Provider value={permissionData}>
                <TabContent activeTab={state.activeTab}>
                  {Number(state.activeTab) === 1 && (<TabPane tabId="1"> <MachineRateListing displayForm={displayForm} getDetails={getDetails} isMasterSummaryDrawer={false} stopApiCallOnCancel={state.stopApiCallOnCancel} selectionForListingMasterAPI="Master" approvalStatus={APPROVAL_CYCLE_STATUS_MASTER} isImport={isImport} /> </TabPane>)}
                  {Number(state.activeTab) === 2 && (<TabPane tabId="2"> <ProcessListing stopApiCallOnCancel={state.stopApiCallOnCancel} /></TabPane>)}
                  {Number(state.activeTab) === 3 && (<TabPane tabId="3">  <CommonApproval MasterId={MACHINE_MASTER_ID} OnboardingApprovalId={'0'} /> </TabPane>)}
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

export default MachineMaster;
