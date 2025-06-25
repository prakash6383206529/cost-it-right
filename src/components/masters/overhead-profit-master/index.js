import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddOverhead from './AddOverhead';
import AddProfit from './AddProfit';
import OverheadListing from './OverheadListing';
import ProfitListing from './ProfitListing';
import { ADDITIONAL_MASTERS, OVERHEAD_AND_PROFIT } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import ScrollToTop from '../../common/ScrollToTop';
import { MESSAGES } from '../../../config/message';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation'
import { Loader } from '../../common/Loader';
import AddOverheadMaster from './AddOverheadMaster';
import AddProfitMaster from './AddProfitMaster';
export const ApplyPermission = React.createContext();

const OverheadProfit = () => {
  const [loading, setLoading] = useState(true); // State to manage loading

  const [state, setState] = useState({
    activeTab: '1',
    isOverheadForm: false,
    isProfitForm: false,
    data: {},
    ViewAccessibility: false,
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    BulkUploadAccessibility: false,
    DownloadAccessibility: false,
    stopApiCallOnCancel: false,
    IsOverheadAssociated: false,
    IsProfitAssociated: false,
    permissions: {}
  });
  const dispatch = useDispatch();

  const topAndLeftMenuData = useSelector(state => state.auth.topAndLeftMenuData);
  const disabledClass = useSelector(state => state.comman.disabledClass);

  useEffect(() => {
    applyPermission(topAndLeftMenuData);
  }, [topAndLeftMenuData]);
  useEffect(() => {
    if (state.permissions && state.permissions.View) {
      setLoading(false); // Update loading state once permissions are available
    }
  }, [state.permissions]);
  /**
  * @method applyPermission
  * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
  */
  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData = Data && Data.Pages.find(el => el.PageName === OVERHEAD_AND_PROFIT)
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

      if (permmisionData !== undefined) {
        setState(prevState => ({
          ...prevState,
          permissions: permmisionData,
          ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
          AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          BulkUploadAccessibility:
            permmisionData && permmisionData.BulkUpload
              ? permmisionData.BulkUpload
              : false,
          DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
        }))
      }

    }
  }

  /**
  * @method toggle
  * @description toggling the tabs
  */
  const toggle = (tab) => {

    if (state.activeTab !== tab) {
      setState(prevState => ({
        ...prevState,

        activeTab: tab,
        stopApiCallOnCancel: false
      }));
    }
    dispatch(setSelectedRowForPagination([])); // Dispatch action using useDispatch hook
  }

  const displayOverheadForm = () => {
    setState(prevState => ({
      ...prevState,
      isOverheadForm: true, isProfitForm: false,
    }))
  }

  const displayProfitForm = () => {
    setState(prevState => ({
      ...prevState,
      isProfitForm: true, isOverheadForm: false,
    }))
  }

  const hideForm = (type) => {
    setState(prevState => ({
      ...prevState,
      isOverheadForm: false, isProfitForm: false, data: {}, stopApiCallOnCancel: false
    }))
    if (type === 'cancel') {
      setState(prevState => ({
        ...prevState,
        stopApiCallOnCancel: true,
        IsOverheadAssociated: false,
        IsProfitAssociated: false
      }))

    }
  }

  const getOverHeadDetails = (data,IsAssociated) => {
    setState(prevState => ({
      ...prevState,
      isOverheadForm: true, data: data, IsOverheadAssociated: IsAssociated
    }))
  }

  const getProfitDetails = (data,IsProfitAssociated) => {
    setState(prevState => ({
      ...prevState,
      isProfitForm: true, data: data, IsProfitAssociated: IsProfitAssociated
    }))
  }

  /**
  * @method render
  * @description Renders the component
  */
  const { isOverheadForm, isProfitForm, data } = state;

  // if (isOverheadForm === true) {
  //   return <AddOverhead
  //     data={data}
  //     hideForm={hideForm}
  //   />
  // }

  if (isOverheadForm === true) {
    return <AddOverheadMaster
      data={data}
      hideForm={hideForm}
      IsOverheadAssociated = {state.IsOverheadAssociated}
    />
  }

  // if (isProfitForm === true) {
  //   return <AddProfit
  //     data={data}
  //     hideForm={hideForm}
  //   />
  // }

  if (isProfitForm === true) {
    return <AddProfitMaster
      data={data}
      hideForm={hideForm}
      IsProfitAssociated = {state.IsProfitAssociated}
    />
  }


  return (
    <>
      <div className="container-fluid" id='go-to-top'>
        {loading && <Loader />}
        <ScrollToTop pointProp="go-to-top" />

        <Row>
          <Col>
            {Object.keys(state.permissions).length > 0 && (

              <div>
                <Nav tabs className="subtabs mt-0 p-relative">
                  {disabledClass && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"></div>}
                  <NavItem>
                    <NavLink
                      className={classnames({
                        active: state.activeTab === "1",
                      })}
                      onClick={() => {
                        toggle("1");
                      }}
                    >
                      Manage Overhead
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
                      Manage Profits
                    </NavLink>
                  </NavItem>
                </Nav>
                <ApplyPermission.Provider value={state.permissions}>

                  <TabContent activeTab={state.activeTab}>
                    {state.activeTab === '1' && (
                      <TabPane tabId="1">
                        <OverheadListing
                          formToggle={displayOverheadForm}
                          getDetails={getOverHeadDetails}
                          AddAccessibility={state.AddAccessibility}
                          EditAccessibility={state.EditAccessibility}
                          DeleteAccessibility={state.DeleteAccessibility}
                          DownloadAccessibility={state.DownloadAccessibility}
                          ViewAccessibility={state.ViewAccessibility}
                          BulkUploadAccessibility={state.BulkUploadAccessibility}
                          stopApiCallOnCancel={state.stopApiCallOnCancel}
                        />
                      </TabPane>
                    )}

                    {state.activeTab === '2' && (
                      <TabPane tabId="2">
                        <ProfitListing
                          formToggle={displayProfitForm}
                          getDetails={getProfitDetails}
                          AddAccessibility={state.AddAccessibility}
                          EditAccessibility={state.EditAccessibility}
                          DeleteAccessibility={state.DeleteAccessibility}
                          DownloadAccessibility={state.DownloadAccessibility}
                          ViewAccessibility={state.ViewAccessibility}
                          BulkUploadAccessibility={state.BulkUploadAccessibility}
                          stopApiCallOnCancel={state.stopApiCallOnCancel}
                        />
                      </TabPane>
                    )}
                  </TabContent>
                </ApplyPermission.Provider>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </>
  );

}
export default OverheadProfit

