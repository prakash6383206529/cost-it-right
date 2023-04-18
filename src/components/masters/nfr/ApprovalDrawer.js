import { Drawer } from '@material-ui/core';
import React, { Fragment, useState, useEffect } from 'react'
import { Col, Row, Table } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { getConfigurationKey, loggedInUserId, userDetails } from '../../../helper';
import { Controller, useForm } from 'react-hook-form';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA, EMPTY_GUID, NFRAPPROVALTYPEID } from '../../../config/constants';
import { useDispatch, useSelector } from 'react-redux';
import { getAllApprovalDepartment, getAllApprovalUserFilterByDepartment, getReasonSelectList } from '../../costing/actions/Approval';
import { costingTypeIdToApprovalTypeIdFunction } from '../../common/CommonFunctions';
import { approvedCostingByApprover, nfrSendToApproverBySender } from './actions/nfr';
import _ from 'lodash';
import { datalist } from 'react-dom-factories';
import Toaster from '../../common/Toaster';


const ApprovalDrawer = (props) => {
    const { rowData, technologyId, partData, IsFinalLevel, nfrData, type } = props
    const { register, setValue, getValues, control, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const deptList = useSelector((state) => state.approval.approvalDepartmentList)
    const reasonsList = useSelector((state) => state.approval.reasonsList)
    const [approvalDropDown, setApprovalDropDown] = useState([])
    const [gridData, setGridData] = useState([])
    const dispatch = useDispatch();
    const userData = userDetails()
    const { initialConfiguration } = useSelector(state => state.auth)
    const [approver, setApprover] = useState('')
    const [selectedApprover, setSelectedApprover] = useState('')
    const [selectedApproverLevelId, setSelectedApproverLevelId] = useState('')

    useEffect(() => {
        dispatch(getReasonSelectList((res) => { }))
        dispatch(getAllApprovalDepartment((res) => {
            const Data = res?.data?.SelectList
            const departObj = Data && Data.filter(item => item.Value === userData.DepartmentId)

            // setSelectedDepartment({ label: departObj[0]?.Text, value: departObj[0]?.Value })
            setValue('dept', { label: departObj[0]?.Text, value: departObj[0]?.Value })

            let requestObject = {
                LoggedInUserId: userData.LoggedInUserId,
                DepartmentId: departObj[0]?.Value,
                TechnologyId: technologyId,
                ReasonId: 0, // key only for minda
                ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(),
            }
            // dispatch(getAllApprovalUserFilterByDepartment(requestObject, (res) => {
            //     let tempDropdownList = []
            //     if (res.data.DataList.length === 1) {
            //         return false
            //     }
            //     res.data.DataList && res.data.DataList.map((item) => {
            //         if (item.Value === '0') return false;
            //         if (item.Value === EMPTY_GUID_0) return false;
            //         tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
            //         return null
            //     })
            //     const Data = res.data.DataList[1]
            //     setApprover(Data.Text)
            //     setSelectedApprover(Data.Value)
            //     setSelectedApproverLevelId({ levelName: Data.LevelName, levelId: Data.LevelId })
            //     if (tempDropdownList?.length !== 0) {
            //         setValue('approver', { label: Data.Text, value: Data.Value })
            //     } else {
            //         setShowValidation(true)
            //     }
            //     setApprovalDropDown(tempDropdownList)
            // }))
        }))

        let dataListTemp = []
        let tem = _.map(rowData, 'data')[0]
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

    const toggleDrawer = (e) => {
        props.closeDrawer('', 'Cancel')
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
        if (IsFinalLevel) {
            let req = [
                {
                    "ApprovalProcessSummaryId": nfrData?.ApprovalProcessSummaryId,
                    "ApprovalToken": nfrData?.ApprovalToken,
                    "LoggedInUserId": loggedInUserId(),
                    "SenderLevelId": userData?.LoggedInLevelId,
                    "SenderId": userData?.LoggedInUserId,
                    "SenderLevel": userData?.LoggedInLevel,
                    "ApproverId": getValues("approver")?.value ? getValues("approver")?.value : '',
                    "ApproverLevelId": getValues("approver")?.levelId ? getValues("approver")?.levelId : '',
                    "ApproverLevel": getValues("approver")?.levelName ? getValues("approver")?.levelName : '',
                    "Remark": "string",
                    "IsApproved": type === 'Approve' ? true : false,
                    "ApproverDepartmentId": getValues("dept")?.value ? getValues("dept")?.value : '',
                    "ApproverDepartmentName": getValues("dept")?.label ? getValues("dept")?.label : '',
                    "IsFinalApprovalProcess": true,
                    "ReasonId": 0,
                    "Reason": "string"
                }
            ]
            dispatch(approvedCostingByApprover(req, (res) => {
                if (res?.data?.Result === true) {
                    Toaster.success("NFR is approved successfully")
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
                        "PartId": partData?.PartId,
                        "VendorId": item?.value,
                        "CostingId": item?.SelectedCostingVersion?.CostingId,
                        "ReasonId": 0,
                        "Reason": "string",
                        "FinancialYear": "string",
                        "IsFinalApproved": false,
                    }
                    arrayOfObj.push(obj)
                }
            })

            let req = {
                "ApproverDepartmentId": getValues("dept")?.value,
                "ApproverDepartmentName": getValues("dept")?.label,
                "ApproverLevelId": getValues("approver")?.levelId,
                "ApproverLevel": getValues("approver")?.levelName,
                "ApproverId": getValues("approver")?.value,
                "SenderLevelId": userData?.LoggedInLevelId,
                "SenderId": userData?.LoggedInUserId,
                "ApprovalTypeId": NFRAPPROVALTYPEID,
                "NfrPartWiseGroupDetailsId": tempRowData[0]?.nfrPartWiseGroupDetailsId,
                "SenderLevel": userData?.LoggedInLevel,
                "SenderRemark": "string",
                "LoggedInUserId": loggedInUserId(),
                "ReasonId": 0,
                "Reason": "string",
                "NfrGroupList": arrayOfObj
            }
            dispatch(nfrSendToApproverBySender(req, (res) => {
                if (res?.data?.Result) {
                    Toaster.success("Costing has been sent for approval.")
                    toggleDrawer()
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
                                    <h3>{props.rejectDrawer ? "Reject Costing" : "Send for Approval"}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    // disabled={isDisable}
                                    className={"close-button right"}
                                ></div>
                            </Col>
                        </Row>
                        {(!props.rejectDrawer && !IsFinalLevel) && <> <Row>
                            <Col md={props.hideTable ? 12 : 6}>
                                <SearchableSelectHookForm
                                    label={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
                                    name={"dept"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    defaultValue={""}
                                    options={renderDropdownListing("Dept")}
                                    disabled={false}
                                    mandatory={true}
                                    handleChange={handleDepartmentChange}
                                // errors={errors.dept}
                                />
                            </Col>
                            <Col md={props.hideTable ? 12 : 6}>
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
                                    disabled={false}
                                // handleChange={handleApproverChange}
                                // errors={errors.approver}
                                />
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
                        </Row></>}
                        <Row>
                            {!props.hideTable && <Col md="12">
                                <Table className='table cr-brdr-main'>
                                    <thead>
                                        <tr>
                                            <th>{"Vendor"}</th>
                                            <th>{"Plant"}</th>
                                            <th>{"Costing"}</th>
                                            <th>{"Net PO"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {gridData && gridData?.map((data, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{data.vendor}</td>
                                                    <td>{data.PlantName}</td>
                                                    <td>{data.CostingNumber}</td>
                                                    <td>{data.Price}</td>
                                                </tr>
                                            )
                                        })}
                                        {props.data && props.data.length === 0 && <tr>
                                            <td colSpan={4}><NoContentFound title={EMPTY_DATA} /></td>
                                        </tr>}
                                    </tbody>
                                </Table>
                            </Col>}
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
                                    onClick={toggleDrawer}
                                // className="reset mr15 cancel-btn"
                                >
                                    <div className={'cancel-icon'}></div>
                                    {"Cancel"}
                                </button>


                                <button
                                    className="btn btn-primary save-btn"
                                    type="button"
                                    // className="submit-button save-btn"
                                    // disabled={isDisable}
                                    onClick={onSubmit}
                                >
                                    <div className={'save-icon'}></div>
                                    {"Submit"}
                                </button>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Drawer>
        </Fragment >
    );
}

export default ApprovalDrawer
