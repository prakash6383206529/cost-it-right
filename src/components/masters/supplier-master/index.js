import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import ScrollToTop from "../../common/ScrollToTop";
import { MASTERS, PART, VENDOR_MANAGEMENT_ROLE } from "../../../config/constants";
import { checkPermission } from "../../../helper/util";
import { MESSAGES } from "../../../config/message";
import { resetStatePagination } from "../../common/Pagination/paginationAction";
import SupplierClassificationListing from "../../vendorManagement/VendorClassificationListing";
import LpsRatingListing from "../../vendorManagement/LpsRatingLisitng";
import VendorListing from "./VendorListing";
export const ApplyPermission = React.createContext();

const VendorMaster = () => {
    const dispatch = useDispatch()
    const [state, setState] = useState({
        isOpen: false,
        activeTab: "1",
    });

    const topAndLeftMenuData = useSelector((state) => state.auth.topAndLeftMenuData);
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration);
    const disabledClass = useSelector((state) => state.comman.disabledClass);
    const [permissionData, setPermissionData] = useState({});
    const [isVendorManagement, setIsVendorManagement] = useState(false);

    useEffect(() => {
        applyPermission(topAndLeftMenuData); toggle("1");
    }, [topAndLeftMenuData]);


    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find((el) => el.ModuleName === MASTERS);
            const isVendorManagement = topAndLeftMenuData && topAndLeftMenuData.find((el) => el.ModuleName === VENDOR_MANAGEMENT_ROLE);;
            if (isVendorManagement.ModuleName === VENDOR_MANAGEMENT_ROLE) {
                setIsVendorManagement(true);
            }
            const accessData = Data && Data.Pages.find((el) => el.PageName === PART);
            const permmisionDataAccess = accessData && accessData.Actions && checkPermission(accessData.Actions);
            if (permmisionDataAccess !== undefined) {
                setPermissionData(permmisionDataAccess);
            }
        }
    };

    const toggle = (tab) => {
        if (state.activeTab !== tab) {
            dispatch(resetStatePagination())
            setState((prevState) => ({ ...prevState, activeTab: tab, }));
        }
    };

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
                            <Nav tabs className="subtabs mt-0 p-relative mb-4">
                                {disabledClass && (<div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"  ></div>)}
                                <NavItem> <NavLink className={classnames({ active: state.activeTab === "1" })} onClick={() => toggle("1")}  > Vendor Listing  </NavLink></NavItem>
                                <NavItem> <NavLink className={classnames({ active: state.activeTab === "2" })} onClick={() => toggle("2")} > Supplier Classification Status </NavLink> </NavItem>
                                {initialConfiguration?.IsProductMasterConfigurable && (
                                    <NavItem> <NavLink className={classnames({ active: state.activeTab === "3" })} onClick={() => toggle("3")} >  LPS Rating Status </NavLink> </NavItem>
                                )}
                            </Nav>
                            <TabContent activeTab={state.activeTab}>
                                {state.activeTab === "1" && (
                                    <TabPane tabId="1"><VendorListing isVendorManagement={isVendorManagement} />
                                    </TabPane>
                                )}
                                {state.activeTab === "2" && (
                                    <TabPane tabId="2"><SupplierClassificationListing />
                                    </TabPane>
                                )}
                                {state.activeTab === "3" && (
                                    <TabPane tabId="3"><LpsRatingListing />
                                    </TabPane>
                                )}
                            </TabContent>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default VendorMaster;
