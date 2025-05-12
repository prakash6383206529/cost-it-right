import React, { useState } from 'react';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import { useDispatch } from 'react-redux';
import ScrollToTop from '../../common/ScrollToTop';
import { CheckApprovalApplicableMaster } from '../../../helper';
import { BUDGET_ID, OPERATIONS_ID } from '../../../config/constants';
import CommonApproval from '../material-master/CommonApproval';
import BudgetListing from './BudgetListing';
import AddBudget from './AddBudget';
import { resetStatePagination } from '../../common/Pagination/paginationAction';

function BudgetMaster() {
    const dispatch = useDispatch();
    const [Id, setId] = useState('');
    const [activeTab, setActiveTab] = useState('1');
    const [isOperation, setIsOperation] = useState(false);
    const [ViewAccessibility, setViewAccessibility] = useState(false);
    const [AddAccessibility, setAddAccessibility] = useState(false);
    const [EditAccessibility, setEditAccessibility] = useState(false);
    const [DeleteAccessibility, setDeleteAccessibility] = useState(false);
    const [BulkUploadAccessibility, setBulkUploadAccessibility] = useState(false);
    const [DownloadAccessibility, setDownloadAccessibility] = useState(false);
    const [data, setData] = useState({});
    const [isOperationAssociated, setIsOperationAssociated] = useState(false);
    const [stopAPICall, setStopAPICall] = useState(false);
    const [isImport, setIsImport] = useState(false);

    const displayBudgetForm = (data, isImport) => {
        setIsImport(isImport)
        setIsOperation(true);
        setData(data);
    }

    const hideForm = (type) => {
        setIsOperation(false);
        setData({ isEditFlag: false, ID: '' })
        setStopAPICall(false);

        if (type === 'Cancel') {
            setStopAPICall(true);
        }
    }


    const getDetails = (data, isOperationAssociate) => {
        setIsOperation(true);
        setData(data);
        setIsOperationAssociated(isOperationAssociate);
    }


    /**
    * @method toggle
    * @description toggling the tabs
    */
    const toggle = (tab) => {

        if (activeTab !== tab) {
            dispatch(resetStatePagination())
            setActiveTab(tab);
            setStopAPICall(false);
        }
    }


    // if (isOperation === true) {
    //     return <AddBudget
    //         data={data}
    //         hideForm={hideForm}
    //         isOperationAssociated={isOperationAssociated}
    //     />
    // }

    return (
        <>
            <div className="container-fluid" id='go-to-top'>
                {/* {this.props.loading && <Loader/>} */}
                <ScrollToTop pointProp="go-to-top" />


                {!isOperation && < Row >
                    <Col>
                        <div>
                            <Nav tabs className="subtabs mt-0 p-relative">
                                {/* {<div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"></div>} */}

                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                                        Manage Budget
                                    </NavLink>
                                </NavItem>

                                {CheckApprovalApplicableMaster(BUDGET_ID) && <NavItem>
                                    <NavLink className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                                        Approval Status
                                    </NavLink>
                                </NavItem>}

                            </Nav>

                            <TabContent activeTab={activeTab}>

                                {Number(activeTab) === 1 &&
                                    <TabPane tabId="1">
                                        <BudgetListing
                                            formToggle={displayBudgetForm}
                                            getDetails={getDetails}
                                            hideForm={hideForm}
                                            AddAccessibility={AddAccessibility}
                                            EditAccessibility={EditAccessibility}
                                            DeleteAccessibility={DeleteAccessibility}
                                            BulkUploadAccessibility={BulkUploadAccessibility}
                                            DownloadAccessibility={DownloadAccessibility}
                                            isMasterSummaryDrawer={false}
                                            selectionForListingMasterAPI='Master'
                                            stopAPICall={stopAPICall}
                                            isImport={isImport}
                                        />
                                    </TabPane>}


                                {Number(activeTab) === 2 &&
                                    <TabPane tabId="2">
                                        <CommonApproval
                                            AddAccessibility={AddAccessibility}
                                            EditAccessibility={EditAccessibility}
                                            DeleteAccessibility={DeleteAccessibility}
                                            DownloadAccessibility={DownloadAccessibility}
                                            MasterId={BUDGET_ID}
                                            OnboardingApprovalId={'0'}
                                        />
                                    </TabPane>}
                            </TabContent>
                        </div>
                    </Col>
                </Row>}

                {isOperation &&

                    <AddBudget
                        data={data}
                        hideForm={hideForm}
                        isOperationAssociated={isOperationAssociated}
                        isImport={isImport}
                    />

                }



            </div>
        </ >
    );
}

export default BudgetMaster;

