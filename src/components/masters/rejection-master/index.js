import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from "reactstrap";
import AddRejectionMaster from './AddRejectionMaster';
import RejectionListing from './RejectionListing';
import { ADDITIONAL_MASTERS, REJECTION } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import ScrollToTop from '../../common/ScrollToTop';
import { MESSAGES } from '../../../config/message';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation'
import { Loader } from '../../common/Loader';
export const ApplyPermission = React.createContext();

const RejectionMaster = () => {
  const [loading, setLoading] = useState(true);

  const [state, setState] = useState({
    isRejectionForm: false,
    data: {},
    ViewAccessibility: false,
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    BulkUploadAccessibility: false,
    DownloadAccessibility: false,
    stopApiCallOnCancel: false,
    IsRejectionAssociated: false,
    // permissions: {}
    permissions: {
      "Add": true,
      "Edit": true,
      "Delete": true,
      "View": true,
      "Download": true,
      "BulkUpload": false,
      "Activate": false,
      "Copy": false,
      "SOB": false,
      "SendForReview": false
  }
  });
  const dispatch = useDispatch();

  const topAndLeftMenuData = useSelector(state => state.auth.topAndLeftMenuData);
  // const disabledClass = useSelector(state => state.comman.disabledClass);

  useEffect(() => {
    applyPermission(topAndLeftMenuData);
  }, [topAndLeftMenuData]);

  useEffect(() => {
    if (state.permissions && state.permissions.View) {
      setLoading(false);
    }
  }, [state.permissions]);

  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData = Data && Data.Pages.find(el => el.PageName === REJECTION)
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

  const displayRejectionForm = () => {
    setState(prevState => ({
      ...prevState,
      isRejectionForm: true,
    }))
  }

  const hideForm = (type) => {
    setState(prevState => ({
      ...prevState,
      isRejectionForm: false,
      data: {},
      stopApiCallOnCancel: false
    }))
    if (type === 'cancel') {
      setState(prevState => ({
        ...prevState,
        stopApiCallOnCancel: true
      }))
    }
  }

  const getRejectionDetails = (data, IsAssociated) => {
    setState(prevState => ({
      ...prevState,
      isRejectionForm: true,
      data: data,
      IsRejectionAssociated: IsAssociated
    }))
  }

  const { isRejectionForm, data } = state;

  if (isRejectionForm === true) {
    return <AddRejectionMaster
      data={data}
      hideForm={hideForm}
      IsRejectionAssociated={state.IsRejectionAssociated}
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
                <ApplyPermission.Provider value={state.permissions}>
                  <RejectionListing
                    formToggle={displayRejectionForm}
                    getDetails={getRejectionDetails}
                    AddAccessibility={state.AddAccessibility}
                    EditAccessibility={state.EditAccessibility}
                    DeleteAccessibility={state.DeleteAccessibility}
                    DownloadAccessibility={state.DownloadAccessibility}
                    ViewAccessibility={state.ViewAccessibility}
                    stopApiCallOnCancel={state.stopApiCallOnCancel}
                  />
                </ApplyPermission.Provider>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default RejectionMaster; 