import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import classnames from "classnames";
import AddBOPDomestic from "./AddBOPDomestic";
import AddBOPImport from "./AddBOPImport";
import BOPDomesticListing from "./BOPDomesticListing";
import BOPImportListing from "./BOPImportListing";
import SOBListing from "./SOBListing";
import ScrollToTop from "../../common/ScrollToTop";
import { CheckApprovalApplicableMaster, getConfigurationKey, showBopLabel } from "../../../helper";
import CommonApproval from "../material-master/CommonApproval";
import { MESSAGES } from "../../../config/message";
import { checkPermission } from "../../../helper/util";
import {
  APPROVAL_CYCLE_STATUS_MASTER, BOP, BOP_MASTER_ID, MASTERS, NON_APPROVAL_CYCLE_STATUS_MASTER,
} from "../../../config/constants";
import { resetStatePagination } from '../../common/Pagination/paginationAction';
import BOPManage from "./BOPManage";


/* Create context for ApplyPermission */
export const ApplyPermission = React.createContext();

const BOPMaster = () => {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    activeTab: "1",
    isBOPDomesticForm: false,
    isBOPImportForm: false,
    data: {},
    ViewAccessibility: false,
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    BulkUploadAccessibility: false,
    DownloadAccessibility: false,
    isBOPAssociated: false,
    stopApiCallOnCancel: false,
    approvalStatusState: "",
  });

  const { isBOPDomesticForm, isBOPImportForm, data, approvalStatusState } =
    state;

  const { disabledClass } = useSelector((state) => state.comman);
  const { topAndLeftMenuData, initialConfiguration } = useSelector(
    (state) => state.auth
  );
  const [permissionData, setPermissionData] = useState({});
  useEffect(() => {
    applyPermission(topAndLeftMenuData);

    if (initialConfiguration?.IsMasterApprovalAppliedConfigure) {
      setState((prevState) => ({
        ...prevState,
        approvalStatusState: APPROVAL_CYCLE_STATUS_MASTER,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        approvalStatusState: NON_APPROVAL_CYCLE_STATUS_MASTER,
      }));
    }
  }, [initialConfiguration, topAndLeftMenuData]);

  const applyPermission = useCallback((topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data =
        topAndLeftMenuData &&
        topAndLeftMenuData.find((el) => el.ModuleName === MASTERS);
      const accessData = Data && Data.Pages.find((el) => el.PageName === showBopLabel());
      const permmisionData =
        accessData && accessData.Actions && checkPermission(accessData.Actions);

      if (permmisionData !== undefined) {
        setPermissionData(permmisionData);
        setState((prevState) => ({
          ...prevState,
          ViewAccessibility:
            permmisionData && permmisionData.View ? permmisionData.View : false,
          AddAccessibility:
            permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility:
            permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility:
            permmisionData && permmisionData.Delete
              ? permmisionData.Delete
              : false,
          BulkUploadAccessibility:
            permmisionData && permmisionData.BulkUpload
              ? permmisionData.BulkUpload
              : false,
          DownloadAccessibility:
            permmisionData && permmisionData.Download
              ? permmisionData.Download
              : false,
        }));
      }
    }
  }, []);

  const toggle = (tab) => {
    if (state.activeTab !== tab) {
      dispatch(resetStatePagination())
      setState((prevState) => ({
        ...prevState,
        activeTab: tab,
        stopApiCallOnCancel: false,
      }));
    }
  };

  const displayDomesticForm = () => {
    setState((prevState) => ({
      ...prevState,
      isBOPDomesticForm: true,
      isBOPImportForm: false,
      data: {},
    }));
  };

  const displayImportForm = () => {
    setState((prevState) => ({
      ...prevState,
      isBOPDomesticForm: false,
      isBOPImportForm: true,
      data: {},
    }));
  };

  const hideForm = (type) => {
    setState((prevState) => ({
      ...prevState,
      isBOPDomesticForm: false,
      isBOPImportForm: false,
      data: {},
      stopApiCallOnCancel: false,
    }));
    if (type === "cancel") {
      setState((prevState) => ({ ...prevState, stopApiCallOnCancel: true }));
    }
  };

  const getDetails = (data, isBOPAssociate) => {
    setState((prevState) => ({ ...prevState, isBOPDomesticForm: true, data }));
    setState((prevState) => ({
      ...prevState,
      isBOPAssociated: isBOPAssociate,
    }));
  };

  const getImportDetails = (data, isBOPAssociate) => {
    setState((prevState) => ({ ...prevState, isBOPImportForm: true, data }));
    setState((prevState) => ({
      ...prevState,
      isBOPAssociated: isBOPAssociate,
    }));
  };

  if (isBOPDomesticForm) {
    return (
      <AddBOPDomestic
        data={data} hideForm={hideForm} isBOPAssociated={state.isBOPAssociated} stopApiCallOnCancel={state.stopApiCallOnCancel}
      />
    );
  }

  if (isBOPImportForm) {
    return (
      <AddBOPImport
        data={data}
        hideForm={hideForm}
        isBOPAssociated={state.isBOPAssociated}
        stopApiCallOnCancel={state.stopApiCallOnCancel}
      />
    );
  }

  return (
    <>
      {Object.keys(permissionData).length > 0 && (
        <div className="container-fluid" id="go-top-top">
          <Row>
            <ScrollToTop pointProp={"go-top-top"} />
          </Row>

          <Row>
            <Col>
              <Nav tabs className="subtabs mt-0 p-relative">
                {disabledClass && (
                  <div
                    title={MESSAGES.DOWNLOADING_MESSAGE}
                    className="disabled-overflow"
                  ></div>
                )}
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: state.activeTab === "1",
                    })}
                    onClick={() => {
                      toggle("1");
                    }}
                  >
                    Manage {showBopLabel()} (Domestic)
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    className={classnames({
                      active: state.activeTab === "2",
                    })}
                    onClick={() => {
                      toggle("2");
                    }}
                  >
                    Manage {showBopLabel()} (Import)
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    className={classnames({ active: state.activeTab === "3" })}
                    onClick={() => {
                      toggle("3");
                    }}
                  >
                    Manage Specification
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: state.activeTab === "4" })}
                    onClick={() => {
                      toggle("4");
                    }}
                  >
                    Manage SOB
                  </NavLink>
                </NavItem>

                {CheckApprovalApplicableMaster(BOP_MASTER_ID) && (
                  <NavItem>
                    <NavLink
                      className={classnames({
                        active: state.activeTab === "5",
                      })}
                      onClick={() => {
                        toggle("5");
                      }}
                    >
                      Approval Status
                    </NavLink>
                  </NavItem>
                )}
              </Nav>
              <ApplyPermission.Provider value={permissionData}>
                <TabContent activeTab={state.activeTab}>
                  {Number(state.activeTab) === 1 && (
                    <TabPane tabId="1">
                      <BOPDomesticListing
                        displayForm={displayDomesticForm}
                        getDetails={getDetails}
                        isMasterSummaryDrawer={false}
                        selectionForListingMasterAPI="Master"
                        stopApiCallOnCancel={state.stopApiCallOnCancel}
                        approvalStatus={approvalStatusState}
                      />
                    </TabPane>
                  )}

                  {Number(state.activeTab) === 2 && (
                    <TabPane tabId="2">
                      <BOPImportListing
                        displayForm={displayImportForm}
                        getDetails={getImportDetails}
                        stopApiCallOnCancel={state.stopApiCallOnCancel}
                        selectionForListingMasterAPI="Master"
                        approvalStatus={approvalStatusState}
                      />
                    </TabPane>
                  )}

                  {Number(state.activeTab) === 3 && (
                    <TabPane tabId="3">
                      <BOPManage
                        displayForm={displayImportForm}
                        getDetails={getImportDetails}

                      />
                    </TabPane>
                  )}
                  {Number(state.activeTab) === 4 && (
                    <TabPane tabId="4">
                      <SOBListing
                        displayForm={displayImportForm}
                        getDetails={getImportDetails}

                      />
                    </TabPane>
                  )}

                  {Number(state.activeTab) === 5 && (
                    <TabPane tabId="5">
                      <CommonApproval
                        AddAccessibility={state.AddAccessibility}
                        EditAccessibility={state.EditAccessibility}
                        DeleteAccessibility={state.DeleteAccessibility}
                        DownloadAccessibility={state.DownloadAccessibility}
                        MasterId={BOP_MASTER_ID}
                      />
                    </TabPane>
                  )}
                </TabContent>
              </ApplyPermission.Provider>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default BOPMaster;
