import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddFreight from './AddFreight';
import AddPackaging from './AddPackaging';
import FreightListing from './FreightListing';
import PackagListing from './PackagListing';
import { ADDITIONAL_MASTERS, FREIGHT } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import ScrollToTop from '../../common/ScrollToTop';
export const ApplyPermission = React.createContext();
const FreightMaster = () => {
    const [state, setState] = useState({
        activeTab: '1',
        isFreightForm: false,
        isPackageForm: false,
        data: {},
        ViewAccessibility: false,
        AddAccessibility: false,
        EditAccessibility: false,
        DeleteAccessibility: false,
        BulkUploadAccessibility: false,
        DownloadAccessibility: false,
        stopApiCallOnCancel: false,
        isImport: false
    })
    const [permissionData, setPermissionData] = useState({});
    const { topAndLeftMenuData } = useSelector(state => state.auth);
    useEffect(() => {
        applyPermission(topAndLeftMenuData)

    }, [topAndLeftMenuData])



    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
            const accessData = Data && Data.Pages.find(el => el.PageName === FREIGHT)
            const permmisionDataAccess = accessData && accessData.Actions && checkPermission(accessData.Actions)
            if (permmisionDataAccess !== undefined) {
                setPermissionData(permmisionDataAccess);

            }
        }
    }

    const toggle = (tab) => {
        if (state.activeTab !== tab) {
            setState((prevState) => ({ ...prevState, activeTab: tab, stopApiCallOnCancel: false }));
        }
    }

    /**
    * @method displayFreightForm
    * @description DISPLAY FREIGHT FORM
    */
    const displayFreightForm = () => {
        setState((prevState) => ({ ...prevState, isFreightForm: true, isPackageForm: false, data: {} }))
    }

    /**
    * @method displayPackagForm
    * @description DISPLAY PACKAGING FORM
    */
    const displayPackagForm = () => {
        setState((prevState) => ({ ...prevState, isFreightForm: false, isPackageForm: true, data: {} }))
    }

    /**
    * @method hideForm
    * @description HIDE FREIGHT AND PACKAGING FORMS
    */
    const hideForm = (type, isImport) => {
        setState((prevState) => ({ ...prevState, isFreightForm: false, isPackageForm: false, data: {}, stopApiCallOnCancel: false,isImport: isImport  }))
        if (type === 'cancel') {
            setState((prevState) => ({ ...prevState, stopApiCallOnCancel: true, isImport: isImport }))

        }
    }

    /**
    * @method getDetails
    * @description GET DETAILS FOR FREIGHT FORM
    */
    const getDetails = (data, IsFreightAssociated) => {
        setState((prevState) => ({ ...prevState, isFreightForm: true, data: data, IsFreightAssociated: IsFreightAssociated}))
    }

    /**
    * @method getPackaingDetails
    * @description GET DETAILS FOR PACKAGING FORM
    */
    const getPackaingDetails = (data) => {
        setState((prevState) => ({ ...prevState, isPackageForm: true, data: data }))
    }

    /**
    * @method render
    * @description Renders the component
    */

    const { isFreightForm, isPackageForm, data, IsFreightAssociated } = state;

    if (isFreightForm === true) {
        return <AddFreight data={data} hideForm={hideForm}  IsFreightAssociated={IsFreightAssociated}/>
    }

    if (isPackageForm === true) {
        return <AddPackaging data={data} hideForm={hideForm} />
    }

    return (
        <> {
            Object.keys(permissionData).length > 0 &&
            <div className="container-fluid" id='go-to-top'>
                {/* {props.loading && <Loader/>} */}
                <ScrollToTop pointProp="go-to-top" />
                <Row>
                    <Col>
                        <Nav tabs className="subtabs mt-0">
                            <NavItem>
                                <NavLink className={classnames({ active: state.activeTab === '1' })} onClick={() => { toggle('1'); }}>
                                    Manage Freight
                                </NavLink>
                            </NavItem>
                            {/* <NavItem>
                                <NavLink className={classnames({ active: state.activeTab === '2' })} onClick={() => { toggle('2'); }}>
                                    Manage Packaging
                                </NavLink>
                            </NavItem> */}
                        </Nav>
                        <ApplyPermission.Provider value={permissionData}>

                            <TabContent activeTab={state.activeTab}>

                                {state.activeTab === '1' &&
                                    <TabPane tabId="1">
                                        <FreightListing displayForm={displayFreightForm} getDetails={getDetails} stopApiCallOnCancel={state.stopApiCallOnCancel} isImport={state.isImport} />
                                    </TabPane>}

                                {state.activeTab === '2' &&
                                    <TabPane tabId="2">
                                        <PackagListing displayForm={displayPackagForm} getDetails={getPackaingDetails} />
                                    </TabPane>}
                            </TabContent>
                        </ApplyPermission.Provider>

                    </Col>
                </Row>
            </div>
        }
        </ >
    );
}




export default FreightMaster

