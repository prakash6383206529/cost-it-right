import { Drawer } from '@material-ui/core';
import React, { Fragment, useState, useEffect } from 'react'
import { Col, Row, Table } from 'reactstrap';
import { AllApprovalField, SearchableSelectHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { getConfigurationKey, handleDepartmentHeader, loggedInUserId, userDetails } from '../../../helper';
import { Controller, useForm } from 'react-hook-form';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA, EMPTY_GUID, NFRAPPROVALTYPEID, NFRTypeId } from '../../../config/constants';
import { useDispatch, useSelector } from 'react-redux';
import { getAllApprovalDepartment, getAllApprovalUserFilterByDepartment, getReasonSelectList } from '../../costing/actions/Approval';
import { costingTypeIdToApprovalTypeIdFunction } from '../../common/CommonFunctions';
import { approvedCostingByApprover, nfrSendToApproverBySender, pushNfrOnSap } from './actions/nfr';
import _ from 'lodash';
import { datalist } from 'react-dom-factories';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { checkFinalUser } from '../../costing/actions/Costing';
import WarningMessage from '../../common/WarningMessage';
import LoaderCustom from '../../common/LoaderCustom';
import { useLabels } from '../../../helper/core';


const ApprovalDrawer = (props) => {
    const { rowData, technologyId, partData, nfrData, type, levelDetails, isFinalLevelUser, nfrPartDetail } = props
    const { register, setValue, getValues, control, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const {vendorLabel} = useLabels()
    const deptList = useSelector((state) => state.approval.approvalDepartmentList)
    const reasonsList = useSelector((state) => state.approval.reasonsList)
    const [approvalDropDown, setApprovalDropDown] = useState([])
    const [gridData, setGridData] = useState([])
    const dispatch = useDispatch();
    const userData = userDetails()
    const { initialConfiguration } = useSelector(state => state.auth)
    const [approver, setApprover] = useState('')
    const [selectedApprover, setSelectedApprover] = useState('')
    const [isLoader, setIsLoader] = useState(false)
    const [selectedApproverLevelId, setSelectedApproverLevelId] = useState('')
    const [isDisable, setIsDisable] = useState('')
    const [editWarning, setEditWarning] = useState(false)
    const [filterStatus, setFilterStatus] = useState('')
    const [approverIdList, setApproverIdList] = useState([])
    useEffect(() => {

        dispatch(getReasonSelectList((res) => { }))
        dispatch(getAllApprovalDepartment((res) => {
            const Data = res?.data?.SelectList
            const departObj = Data && Data.filter(item => item.Value === userData.DepartmentId)
            setValue('dept', { label: departObj[0]?.Text, value: departObj[0]?.Value })

            const tempDropdownList = []
            let requestObject = {
                LoggedInUserId: userData.LoggedInUserId,
                DepartmentId: departObj[0]?.Value,
                TechnologyId: technologyId,
                ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(NFRTypeId),
                plantId: props?.PlantId
            }
            let approverIdListTemp = []
            dispatch(getAllApprovalUserFilterByDepartment(requestObject, (res) => {
                res.data.DataList && res.data.DataList.map((item) => {
                    if (item.Value === '0') return false;
                    if (item.Value === EMPTY_GUID) return false;
                    tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
                    approverIdListTemp.push(item.Value)
                    return null
                })
                setApprovalDropDown(tempDropdownList)
                setApproverIdList(approverIdListTemp)
            }))
        }))

        let obj = {}
        obj.DepartmentId = userDetails().DepartmentId
        obj.UserId = loggedInUserId()
        obj.TechnologyId = nfrPartDetail?.TechnologyId
        //MINDA
        // obj.TechnologyId = technologyId
        obj.Mode = 'costing'
        obj.approvalTypeId = costingTypeIdToApprovalTypeIdFunction(NFRTypeId)
        obj.plantId = props?.PlantId
        dispatch(checkFinalUser(obj, (res) => {
            if (res?.data?.Result) {
                if (res?.data?.Data?.IsFinalApprover) {
                    if (res?.data?.Data?.IsFinalApprover) {
                        setIsDisable(true)
                        setEditWarning(true)
                        setFilterStatus("You are a final level user and cannot send NFR for approval.")
                        //MINDA
                        // if (res?.data?.Data?.IsUserInApprovalFlow === false) {
                        //     setIsDisable(true)
                        //     setEditWarning(true)
                        //     setFilterStatus('This user is not in the approval cycle')
                    } else {
                        setIsDisable(false)
                        setEditWarning(false)
                        setFilterStatus("")
                    }
                }
            }
        }))

        let dataListTemp = []
        let length = rowData?.length - 1
        if (!props.hideTable) {
            let tem = [..._.map(rowData, 'data')[0]]
            tem && tem?.map(item => {
                if (item?.SelectedCostingVersion) {
                    let obj = {}


                    obj.vendor = item?.label
                    obj.vendorCode = item?.vendorCode
                    obj.vendorName = item?.vendorName
                    obj.vendorid = item?.value
                    obj.PlantName = initialConfiguration.DefaultPlantName
                    obj.PlantCode = initialConfiguration.DefaultPlantCode
                    obj.PlantId = initialConfiguration.DefaultPlantId
                    obj.CostingNumber = item?.SelectedCostingVersion?.CostingNumber
                    obj.CostingId = item?.SelectedCostingVersion?.CostingId
                    obj.Price = item?.SelectedCostingVersion?.Price

                    dataListTemp.push(obj)
                }
            })
            setGridData(dataListTemp)

        }


    }, [])

    const renderDropdownListing = (label) => {
        const tempDropdownList = []

        if (label === 'Reason') {
            reasonsList &&
                reasonsList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList.push({ label: item.Text, value: item.Value })
                    return null
                })
            return tempDropdownList
        }
        if (label === 'Dept') {
            deptList &&
                deptList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList.push({ label: item.Text, value: item.Value })
                    return null
                })
            return tempDropdownList
        }
    }

    const toggleDrawer = (type) => {
        if (!isLoader) {
            props.closeDrawer(type, 'Cancel')
        }
    }

    /**
     * @method handleDepartmentChange
     * @description  USED TO HANDLE DEPARTMENT CHANGE
     */
    const handleDepartmentChange = (newValue) => {
        const tempDropdownList = []
        if (newValue && newValue !== '') {
            setValue('approver', '')
            //   setSelectedApprover('')
            //   setShowValidation(false)
            let requestObject = {
                LoggedInUserId: userData.LoggedInUserId,
                DepartmentId: newValue.value,
                TechnologyId: technologyId,
                ApprovalTypeId: NFRAPPROVALTYPEID,
                plantId: props?.PlantId
            }
            dispatch(getAllApprovalUserFilterByDepartment(requestObject, (res) => {
                res.data.DataList && res.data.DataList.map((item) => {
                    if (item.Value === '0') return false;
                    if (item.Value === EMPTY_GUID) return false;
                    tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
                    return null
                })
                if (tempDropdownList?.length === 0) {
                    //   setShowValidation(true)
                }
                setApprovalDropDown(tempDropdownList)
                let obj = {}
                obj.DepartmentId = userDetails().DepartmentId
                obj.UserId = loggedInUserId()
                obj.TechnologyId = nfrPartDetail?.TechnologyId
                //MINDA
                // obj.TechnologyId = technologyId
                obj.Mode = 'costing'
                obj.approvalTypeId = costingTypeIdToApprovalTypeIdFunction(NFRTypeId)
                obj.plantId = props?.PlantId
                dispatch(checkFinalUser(obj, (res) => {
                    if (res?.data?.Result) {
                        if (res?.data?.Data?.IsFinalApprover) {
                            setIsDisable(true)
                            setEditWarning(true)
                            setFilterStatus("You are a final level user and cannot send NFR for approval.")
                            //MINDA
                            // if (res?.data?.Data?.IsUserInApprovalFlow === false) {
                            //     setIsDisable(true)
                            //     setEditWarning(true)
                            //     setFilterStatus('This user is not in the approval cycle')
                        } else {
                            setIsDisable(false)
                            setEditWarning(false)
                            setFilterStatus("")
                        }
                    }
                }))
            }))
            //   setSelectedDepartment(newValue)
        } else {
            //   setSelectedDepartment('')
        }
    }

    const handleApproverChange = (data) => {
        setApprover(data.label)
        setSelectedApprover(data.value)
        setSelectedApproverLevelId({ levelName: data.levelName, levelId: data.levelId })
        setValue('approver', data)
    }


    const onSubmit = (data) => {
        if (isFinalLevelUser) {
            let req = [
                {
                    "ApprovalProcessSummaryId": nfrData?.ApprovalProcessSummaryId,
                    "ApprovalToken": nfrData?.ApprovalToken,
                    "LoggedInUserId": loggedInUserId(),
                    "SenderLevelId": levelDetails?.LevelId,
                    "SenderId": userData?.LoggedInUserId,
                    "SenderLevel": levelDetails?.Level,
                    "ApproverId": getValues("approver")?.value ? getValues("approver")?.value : '',
                    "ApproverLevelId": getValues("approver")?.levelId ? getValues("approver")?.levelId : '',
                    "ApproverLevel": getValues("approver")?.levelName ? getValues("approver")?.levelName : '',
                    "Remark": getValues('remarks'),
                    "IsApproved": type === 'Approve' ? true : false,
                    "ApproverDepartmentId": getValues("dept")?.value ? getValues("dept")?.value : '',
                    "ApproverDepartmentName": getValues("dept")?.label ? getValues("dept")?.label : '',
                    "IsFinalApprovalProcess": true,
                    "ReasonId": getValues('reason')?.value ? getValues('reason')?.value : 0,
                    "Reason": getValues('reason')?.label ? getValues('reason')?.label : "",
                    "PushedCostingId": props?.pushData?.CostingId
                }
            ]
            let pushRequest = {
                nfrGroupId: props?.nfrData?.NfrGroupId,
                costingId: props?.pushData?.CostingId
            }
            setIsLoader(true)
            dispatch(approvedCostingByApprover(req, (res) => {
                setIsLoader(false)
                if (res?.data?.Result === true) {
                    if (type === 'Approve') {
                        Toaster.success(MESSAGES.NFR_APPROVED)
                        if (props?.nfrData?.ApprovalTypeId === NFRAPPROVALTYPEID) {
                            dispatch(pushNfrOnSap(pushRequest, res => {
                                if (res?.data?.Result) {
                                    Toaster.success(MESSAGES.NFR_PUSHED)
                                }
                            }))
                        }
                    } else {
                        Toaster.success(MESSAGES.NFR_REJECTED)
                    }
                    props?.closeDrawer("submit")
                }
            }))

        } else {
            let tempRowData = [...rowData]
            let arrayOfObj = []
            tempRowData[0]?.data && tempRowData[0]?.data?.map(item => {
                if (item?.SelectedCostingVersion !== undefined) {
                    let obj = {}
                    obj = {
                        "ApprovalProcessId": "00000000-0000-0000-0000-000000000000",
                        "PlantId": initialConfiguration?.DefaultPlantId,
                        //MINDA
                        // "PlantId": nfrPartDetail?.PlantId,
                        "PartId": partData?.PartId,
                        "VendorId": item?.value,
                        "CostingId": item?.SelectedCostingVersion?.CostingId,
                        "ReasonId": 0,
                        "Reason": "string",
                        "FinancialYear": "string",
                        "IsFinalApproved": false,
                        "NfrPartWiseGroupDetailsId": item?.NfrPartWiseGroupDetailsId
                    }
                    arrayOfObj.push(obj)
                }
            })
            let req = {
                "ApproverDepartmentId": getValues("dept")?.value,
                "ApproverDepartmentName": getValues("dept")?.label,
                "ApproverLevelId": approvalDropDown[0]?.levelId,
                "ApproverLevel": approvalDropDown[0]?.levelName,
                // "ApproverId": getValues("approver")?.value,
                "ApproverIdList": initialConfiguration.IsMultipleUserAllowForApproval ? approverIdList : [getValues("approver")?.value],

                "SenderLevelId": levelDetails?.LevelId,
                "SenderId": userData?.LoggedInUserId,
                "ApprovalTypeId": NFRTypeId,
                "NfrPartWiseGroupDetailsId": tempRowData[0]?.nfrPartWiseGroupDetailsId,
                "SenderLevel": levelDetails?.Level,
                "SenderRemark": getValues('remarks'),
                "LoggedInUserId": loggedInUserId(),
                "ReasonId": getValues('reason')?.value,
                "Reason": getValues('reason')?.label,
                "NfrGroupList": arrayOfObj
            }
            if (approverIdList.length === 0) {
                Toaster.error(MESSAGES.SOME_ERROR)
                return false
            }
            dispatch(nfrSendToApproverBySender(req, (res) => {
                if (res?.data?.Result) {
                    Toaster.success("Costing has been sent for approval.")
                    toggleDrawer('submit')
                }
            }))
        }
    }
    return (
        <Fragment>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                <div className="container">
                    <div className={`drawer-wrapper drawer-${props.hideTable ? 'sm' : 'md'}`}>
                        <Row className="drawer-heading ">
                            <Col className='px-0'>
                                <div className={"header-wrapper left"}>
                                    <h3>{props.rejectDrawer ? "Reject Costing" : props?.IsFinalApproved ? "Approve Costing" : "Send for Approval"}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer('cancel')}
                                    disabled={isLoader}
                                    className={"close-button right"}
                                ></div>
                            </Col>
                        </Row>
                        {isLoader && <LoaderCustom customClass="approve-reject-drawer-loader" />}
                        {(!props.rejectDrawer && !isFinalLevelUser) && <> <Row>
                            <Col md={props.hideTable ? 12 : 6}>
                                <SearchableSelectHookForm
                                    label={`${handleDepartmentHeader()}`}
                                    name={"dept"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    defaultValue={""}
                                    options={renderDropdownListing("Dept")}
                                    disabled={initialConfiguration.IsMultipleUserAllowForApproval}
                                    mandatory={true}
                                    handleChange={handleDepartmentChange}
                                // errors={errors.dept}
                                />
                            </Col>
                            <Col md={props.hideTable ? 12 : 6}>
                                {initialConfiguration.IsMultipleUserAllowForApproval ? <>
                                    <AllApprovalField
                                        label="Approver"
                                        approverList={approvalDropDown}
                                        popupButton="View all"
                                    />
                                </> :
                                    <SearchableSelectHookForm
                                        label={"Approver"}
                                        name={"approver"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={""}
                                        options={approvalDropDown}
                                        handleChange={handleApproverChange}
                                        mandatory={true}
                                        disabled={initialConfiguration.IsMultipleUserAllowForApproval}
                                    // handleChange={handleApproverChange}
                                    // errors={errors.approver}
                                    />}
                            </Col>
                            <Col md={props.hideTable ? 12 : 6}>
                                <SearchableSelectHookForm
                                    label={"Reason"}
                                    // name={"reason"}
                                    name={`reason`}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    defaultValue={""}
                                    options={renderDropdownListing("Reason")}
                                    mandatory={true}
                                    handleChange={(e) => {

                                    }}
                                // errors={errors && errors.reasonFieldreason && errors.reasonFieldreason !== undefined ? errors.reasonFieldreason[index] : ""}
                                // errors={`${errors}.${reasonField}[${index}]reason`}

                                />
                            </Col>
                        </Row></>
                        }
                        <Row>
                            {!props.hideTable && <Col md="12">
                                <Table className='table cr-brdr-main'>
                                    <thead>
                                        <tr>
                                            <th>{`${vendorLabel} (Code)`}</th>
                                            <th>{"Plant (Code)"}</th>
                                            <th>{"Costing"}</th>
                                            <th>{"Net PO"}</th>
                                        </tr >
                                    </thead >
                                    <tbody>

                                        {gridData && gridData?.map((data, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{data.vendor}</td>
                                                    <td>{data.PlantName}</td>
                                                    {/* MINDA */}
                                                    {/* <td>{`${nfrPartDetail.PlantName} (${nfrPartDetail.PlantCode})`}</td> */}
                                                    <td>{data.CostingNumber}</td>
                                                    <td>{data.Price}</td>
                                                </tr >
                                            )
                                        })}
                                        {
                                            props.data && props.data.length === 0 && <tr>
                                                <td colSpan={4}><NoContentFound title={EMPTY_DATA} /></td>
                                            </tr>
                                        }
                                    </tbody >
                                </Table >
                            </Col >}
                            <Col md="12">
                                <TextAreaHookForm
                                    label="Remarks"
                                    name={"remarks"}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={props.rejectDrawer}
                                    handleChange={() => { }}
                                    defaultValue={""}
                                    className=""
                                    customClassName={"withBorder"}
                                    errors={errors.remarks}
                                    disabled={false}
                                />
                            </Col>
                            <Col
                                md="12"
                                className="d-flex justify-content-end align-items-center"
                            >
                                <button
                                    className="cancel-btn mr-2"
                                    type={"button"}
                                    onClick={() => { toggleDrawer('cancel') }}
                                // className="reset mr15 cancel-btn"
                                >
                                    <div className={'cancel-icon'}></div>
                                    {"Cancel"}
                                </button>


                                <button
                                    className="btn btn-primary save-btn"
                                    type="button"
                                    // className="submit-button save-btn"
                                    disabled={isDisable}
                                    onClick={onSubmit}
                                >
                                    <div className={'save-icon'}></div>
                                    {"Submit"}
                                </button>
                            </Col>
                        </Row >
                        <div>
                            {editWarning && <WarningMessage dClass="mr-3" message={filterStatus} />}
                        </div>
                    </div >
                </div >
            </Drawer >
        </Fragment >
    );
}

export default ApprovalDrawer
