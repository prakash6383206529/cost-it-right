import { Drawer } from '@material-ui/core';
import React, { Fragment, useState, useEffect } from 'react'
import { Col, Row, Table } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { getConfigurationKey } from '../../../helper';
import { Controller, useForm } from 'react-hook-form';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA } from '../../../config/constants';
import { useDispatch, useSelector } from 'react-redux';
import { getReasonSelectList } from '../../costing/actions/Approval';



const ApprovalDrawer = (props) => {

    const { register, setValue, getValues, control, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const deptList = useSelector((state) => state.approval.approvalDepartmentList)
    const reasonsList = useSelector((state) => state.approval.reasonsList)
    const [approvalDropDown, setApprovalDropDown] = useState([])
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getReasonSelectList((res) => { }))
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

    const onSubmit = (data) => {

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
                        {!props.rejectDrawer && <> <Row>
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
                                // handleChange={handleDepartmentChange}
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
                                // handleChange={(e) => {
                                //     handleReasonChange(e, index);
                                // }}
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

                                        {props.data && props.data.map((data, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{data.vendor}</td>
                                                    <td>{data.plant}</td>
                                                    <td>{data.costing}</td>
                                                    <td>{data.netPO}</td>
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
