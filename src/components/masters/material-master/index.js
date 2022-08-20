import React from 'react';
import AddRMDomestic from './AddRMDomestic';
import RMListing from './RMListing';
import SpecificationListing from './SpecificationListing';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddRMImport from './AddRMImport';
import RMDomesticListing from './RMDomesticListing';
import RMImportListing from './RMImportListing';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { MASTERS, RAW_MATERIAL, RAW_MATERIAL_NAME_AND_GRADE, RM_MASTER_ID } from '../../../config/constants';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ScrollToTop from '../../common/ScrollToTop';
import { CheckApprovalApplicableMaster } from '../../../helper';
import CommonApproval from './CommonApproval';

function RowMaterialMaster(props) {

    const [stopApiCallOnCancel, setStopApiCallOnCancel] = useState(false);
    const [activeTab, setactiveTab] = useState(reactLocalStorage.get('location') === '/raw-material-master/raw-material-approval' ? '5' : '1');

    const [isRMDomesticForm, setisRMDomesticForm] = useState(false);

    const [isRMImportForm, setisRMImportForm] = useState(false);

    const [data, setdata] = useState({});
    const [ViewRMAccessibility, setViewRMAccessibility] = useState(false);
    const [AddAccessibility, setAddAccessibility] = useState(false);
    const [EditAccessibility, setEditAccessibility] = useState(false);
    const [DeleteAccessibility, setDeleteAccessibility] = useState(false);
    const [DownloadAccessibility, setDownloadAccessibility] = useState(false);
    const [BulkUploadAccessibility, setBulkUploadAccessibility] = useState(false);
    const [AddAccessibilityRMANDGRADE, setAddAccessibilityRMANDGRADE] = useState(false);
    const [EditAccessibilityRMANDGRADE, setEditAccessibilityRMANDGRADE] = useState(false);
    const [isRMAssociated, setIsRMAssociated] = useState(false);

    const topAndLeftMenuData = useSelector((state) => state.auth.topAndLeftMenuData)


    /**
        * @method componentDidMount
        * @description SET PERMISSION FOR ADD, VIEW, EDIT, DELETE, DOWNLOAD AND BULKUPLOAD
        */
    useEffect(() => {

        applyPermission(topAndLeftMenuData);

    }, [topAndLeftMenuData])



    // UNSAFE_componentWillReceiveProps(nextProps) {
    //     if (this.props.topAndLeftMenuData !== nextProps.topAndLeftMenuData) {
    //         applyPermission(nextProps.topAndLeftMenuData)
    //     }
    // }


    // useMemo((nextProps) => {
    //     // componentWillReceiveProps
    //     if (topAndLeftMenuData !== nextProps.topAndLeftMenuData) {
    //               applyPermission(nextProps.topAndLeftMenuData);
    //         //     }
    //     }
    //   },[]);




    /**
    * @method applyPermission
    * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
    */
    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === MASTERS);

            const accessData = Data && Data.Pages.find(el => el.PageName === RAW_MATERIAL)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            const accessDataRMANDGRADE = Data && Data.Pages.find(el => el.PageName === RAW_MATERIAL_NAME_AND_GRADE)
            const permmisionDataRMANDGRADE = accessDataRMANDGRADE && accessDataRMANDGRADE.Actions && checkPermission(accessDataRMANDGRADE.Actions)

            if (permmisionData !== undefined) {
                setViewRMAccessibility(permmisionData && permmisionData.View ? permmisionData.View : false);
                setAddAccessibility(permmisionData && permmisionData.Add ? permmisionData.Add : false);
                setEditAccessibility(permmisionData && permmisionData.Edit ? permmisionData.Edit : false);
                setDeleteAccessibility(permmisionData && permmisionData.Delete ? permmisionData.Delete : false);
                setDownloadAccessibility(permmisionData && permmisionData.Download ? permmisionData.Download : false);
                setBulkUploadAccessibility(permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false);
                setAddAccessibilityRMANDGRADE(permmisionDataRMANDGRADE && permmisionDataRMANDGRADE.Add ? permmisionDataRMANDGRADE.Add : false);
                setEditAccessibilityRMANDGRADE(permmisionDataRMANDGRADE && permmisionDataRMANDGRADE.Edit ? permmisionDataRMANDGRADE.Edit : false);

            }
        }
    }

    /**
    * @method toggle
    * @description toggling the tabs
    */
    const toggle = (tab) => {

        if (activeTab !== tab) {
            setactiveTab(tab);
            setStopApiCallOnCancel(false)
        }
    }

    /**
    * @method displayDomesticForm
    * @description DISPLAY DOMESTIC FORM
    */
    const displayDomesticForm = () => {
        setisRMDomesticForm(true);
    }

    /**
    * @method displayImportForm
    * @description DISPLAY IMPORT FORM
    */
    const displayImportForm = () => {
        setisRMImportForm(true);
    }

    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    const hideForm = (type) => {
        setStopApiCallOnCancel(false)
        setisRMDomesticForm(false);
        setisRMImportForm(false);
        setdata({});
        if (type === 'cancel') {
            setStopApiCallOnCancel(true)
        }
    }

    /**
    * @method getDetails
    * @description GET DETAILS FOR DOMESTIC FORM IN EDIT MODE
    * @param DATA CONTAINS ID AND EDIT FLAG
    */
    const getDetails = (data, IsRMAssociated) => {
        setisRMDomesticForm(true);
        setdata(data);
        setIsRMAssociated(IsRMAssociated)
    }



    /**
    * @method getDetailsImport
    * @description GET DETAILS FOR IMPORT FORM IN EDIT MODE
    * @param DATA CONTAINS ID AND EDIT FLAG
    */
    const getDetailsImport = (data, IsRMAssociated) => {

        setisRMImportForm(true);
        setdata(data);
        setIsRMAssociated(IsRMAssociated)

    }

    /**
    * @method render
    * @description Renders the component
    */

    // const { isRMDomesticForm, isRMImportForm, data, ViewRMAccessibility, AddAccessibilityRMANDGRADE,
    //     EditAccessibilityRMANDGRADE, } = this.state;

    if (isRMDomesticForm === true) {
        return <AddRMDomestic
            data={data}
            hideForm={hideForm}
            AddAccessibilityRMANDGRADE={AddAccessibilityRMANDGRADE}
            EditAccessibilityRMANDGRADE={EditAccessibilityRMANDGRADE}
            isRMAssociated={isRMAssociated}
        />
    }

    if (isRMImportForm === true) {
        return <AddRMImport
            data={data}
            hideForm={hideForm}
            AddAccessibilityRMANDGRADE={AddAccessibilityRMANDGRADE}
            EditAccessibilityRMANDGRADE={EditAccessibilityRMANDGRADE}
            isRMAssociated={isRMAssociated}
        />
    }


    return (
        <Container fluid>
            <Row id="go-top-top">
                {<Col sm="4">
                    <h1>{`Raw Material Master`}</h1>
                </Col>}
                <ScrollToTop pointProp={"go-top-top"} />
            </Row>
            <Row>
                <Col>
                    <div>
                        <Nav tabs className="subtabs mt-0">



                            {<NavItem>
                                <NavLink className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                                    Manage Raw Material (Domestic)
                                </NavLink>
                            </NavItem>}
                            {<NavItem>
                                <NavLink className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                                    Manage Raw Material (Import)
                                </NavLink>
                            </NavItem>}
                            {<NavItem>
                                <NavLink className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('3'); }}>
                                    Manage Specification
                                </NavLink>
                            </NavItem>}
                            {<NavItem>
                                <NavLink className={classnames({ active: activeTab === '4' })} onClick={() => { toggle('4'); }}>
                                    Manage Material
                                </NavLink>
                            </NavItem>}
                            {/* SHOW THIS TAB IF KEY IS COMING TRUE FROM CONFIGURATION (CONNDITIONAL TAB) */}
                            {/* uncomment below line after cherry-pick to Minda  TODO */}
                            {(CheckApprovalApplicableMaster(RM_MASTER_ID)) && <NavItem>
                                {/* {ViewRMAccessibility && <NavItem> */}
                                <NavLink className={classnames({ active: activeTab === '5' })} onClick={() => {
                                    toggle('5');
                                    // this.props.history.push({ pathname: '/raw-material-master/raw-material-approval' })
                                }}>
                                    Approval Status
                                </NavLink>
                            </NavItem>}
                        </Nav>

                        <TabContent activeTab={activeTab}>



                            {Number(activeTab) === 1 &&
                                <TabPane tabId="1">
                                    <RMDomesticListing
                                        formToggle={displayDomesticForm}
                                        getDetails={getDetails}
                                        toggle={toggle}
                                        ViewRMAccessibility={ViewRMAccessibility}
                                        AddAccessibility={AddAccessibility}
                                        EditAccessibility={EditAccessibility}
                                        DeleteAccessibility={DeleteAccessibility}
                                        BulkUploadAccessibility={BulkUploadAccessibility}
                                        DownloadAccessibility={DownloadAccessibility}
                                        stopApiCallOnCancel={stopApiCallOnCancel}
                                        selectionForListingMasterAPI='Master'
                                    />
                                </TabPane>}

                            {Number(activeTab) === 2 &&
                                <TabPane tabId="2">
                                    <RMImportListing
                                        formToggle={displayImportForm}
                                        getDetails={getDetailsImport}
                                        toggle={toggle}
                                        ViewRMAccessibility={ViewRMAccessibility}
                                        AddAccessibility={AddAccessibility}
                                        EditAccessibility={EditAccessibility}
                                        DeleteAccessibility={DeleteAccessibility}
                                        BulkUploadAccessibility={BulkUploadAccessibility}
                                        DownloadAccessibility={DownloadAccessibility}
                                        stopApiCallOnCancel={stopApiCallOnCancel}
                                        selectionForListingMasterAPI='Master'
                                    />
                                </TabPane>}

                            {Number(activeTab) === 3 &&
                                <TabPane tabId="3">
                                    <SpecificationListing
                                        toggle={toggle}
                                        AddAccessibility={AddAccessibility}
                                        EditAccessibility={EditAccessibility}
                                        DeleteAccessibility={DeleteAccessibility}
                                        BulkUploadAccessibility={BulkUploadAccessibility}
                                        AddAccessibilityRMANDGRADE={AddAccessibilityRMANDGRADE}
                                        EditAccessibilityRMANDGRADE={EditAccessibilityRMANDGRADE}
                                        DownloadAccessibility={DownloadAccessibility}
                                        stopApiCallOnCancel={stopApiCallOnCancel}

                                    />
                                </TabPane>}

                            {Number(activeTab) === 4 &&
                                <TabPane tabId="4">
                                    <RMListing
                                        AddAccessibility={AddAccessibility}
                                        EditAccessibility={EditAccessibility}
                                        DeleteAccessibility={DeleteAccessibility}
                                        DownloadAccessibility={DownloadAccessibility}
                                        stopApiCallOnCancel={stopApiCallOnCancel}

                                    />
                                </TabPane>}
                            {Number(activeTab) === 5 &&
                                <TabPane tabId="5">
                                    {/* {
                                            this.props.history.push({ pathname: '/raw-material-master/raw-material-approval' })
                                        } */}

                                    {/* <Link to="/raw-material-approval"></Link> */}
                                    {/* <Route path="/raw-material-approval">
                                        </Route> */}
                                    <CommonApproval
                                        AddAccessibility={AddAccessibility}
                                        EditAccessibility={EditAccessibility}
                                        DeleteAccessibility={DeleteAccessibility}
                                        DownloadAccessibility={DownloadAccessibility}
                                        MasterId={RM_MASTER_ID}
                                    />
                                </TabPane>}

                        </TabContent>
                    </div>
                </Col>
            </Row>

        </Container >
    );

}



export default RowMaterialMaster;

