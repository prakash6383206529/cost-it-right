import React, { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import Button from '../../layout/Button';
import { Controller, useForm } from 'react-hook-form';
import { SearchableSelectHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { useDispatch } from 'react-redux';
import { getAllReasonAPI } from '../../masters/actions/ReasonMaster';
import { useHistory } from 'react-router-dom';
import { handleDepartmentHeader } from '../../../helper';


const SendForApproval = (props) => {


  const history = useHistory();
  const [isLoader, setIsLoader] = useState(false)

  const { mandatoryRemark } = props
  const dispatch = useDispatch()
  const { register, control, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const [reasonOption, setReasonOption] = useState([])
  const [selectedReason, setSelectedReason] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const {
    isOpen,
    // toggleDrawer,
    viewApprovalData,
    // onSubmit,
    isDisable,
    isDisableSubmit,
    Approval

  } = props;
  useEffect(() => {
    dispatch(getAllReasonAPI(true, (res) => {
      setIsLoader(true)
      if (res.data.Result) {
        setReasonOption(res.data.DataList);
        // Set selected reason to the first option by default
        setSelectedReason(res.data.DataList || null);
      }
      setIsLoader(false)
    }));
  }, [dispatch]);


  const toggleDrawer = (event) => {
    if (isDisable) {
      return false
    }
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    // dispatch(setCostingApprovalData([]))
    props.closeDrawer('', 'Cancel')
  }



  const handleSubmit = () => {
    setSelectedReason(null); // Reset selected reason
    setSelectedMonth(null); // Reset selected month
    props.closeDrawer('', 'Cancel'); // Close the drawer
    history.push('/supplier-management/approval-listing'); // Redirect to the approval listing page
  };



  const handleMonthChange = (selectedMonth) => {
    // Do something with the selected month, such as updating state or setting a value

  };

  const handleReasonChange = (selectedReason) => {
    // Do something with the selected reason, such as updating state or setting a value

  };

  return (
    <Fragment>
      <Drawer anchor={props.anchor} open={isOpen}>

        <div className="container">
          <div className={"drawer-wrapper layout-width-900px"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"Send for Approval"}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  disabled={isLoader}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>


            {viewApprovalData &&
              viewApprovalData.map((data, index) => (
                <div className="" key={index}>
                  {/* Rendering approval data */}
                </div>
              ))}
            {Approval?.ApprovalForSupplier && (<div className="">
              <Row>
                <Col md="12">
                  <div className="left-border">{`Supplier Classification`}</div>
                </Col>
              </Row>
              <form>
                {/* Form fields */}
                <Row>
                  <Col md="6">
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={`${handleDepartmentHeader()}`}
                        name={"dept"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        mandatory={true}
                        errors={errors.dept}
                      />
                    </div>
                  </Col >
                  <Col md="6">
                    <SearchableSelectHookForm
                      label="Approver"
                      name="approver"
                      placeholder="Select"
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue=""
                      mandatory={true}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <SearchableSelectHookForm
                      label={'Select Reason'}
                      name={'SelectReason'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={selectedReason}
                      options={reasonOption?.map((reason) => ({ label: reason.Reason, value: reason.ReasonId }))} // Call mapApprovalOptions with the label
                      mandatory={true}
                      handleChange={handleReasonChange}
                      errors={errors.Masters}
                    />

                  </Col>
                  <Col md="6">
                    <SearchableSelectHookForm
                      label={'Deviation Duration For Classification'}
                      name={'DeviationDurationForClassification'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={selectedMonth}
                      options={
                        Array.from({ length: 12 }, (_, i) => ({
                          label: `${i + 1} Month(s)`,
                          value: i + 1
                        }))
                      }
                      mandatory={true}
                      handleChange={handleMonthChange}
                      errors={errors.Masters}
                    />

                  </Col>
                  <Col md="12">
                    <TextAreaHookForm
                      label="Remarks"
                      name={"remarks"}
                      Controller={Controller}
                      control={control}
                      register={register}
                      rules={{ required: false }}
                      mandatory={true}

                      // mandatory={mandatoryRemark ? true : false}
                      // rules={{ required: mandatoryRemark ? true : false }}
                      handleChange={() => { }}
                      defaultValue={""}
                      className=""
                      customClassName={"withBorder"}
                      errors={errors.remarks}
                      disabled={false}
                    />
                  </Col>
                </Row>
              </form>
            </div>)}

            {viewApprovalData &&
              viewApprovalData.map((data, index) => (
                <div className="" key={index}>
                  {/* Rendering approval data */}
                </div>
              ))}
            {Approval?.ApprovalForLPSRating && (<div className="">
              <Row>
                <Col md="12">
                  <div className="left-border">{`LPS Rating`}</div>
                </Col>
              </Row>
              <form>
                {/* Form fields */}
                <Row>
                  <Col md="6">
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={`${handleDepartmentHeader()}`}
                        name={"dept"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        mandatory={true}
                        errors={errors.dept}
                      />
                    </div>
                  </Col >
                  <Col md="6">
                    <SearchableSelectHookForm
                      label="Approver"
                      name="approver"
                      placeholder="Select"
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue=""
                      mandatory={true}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <SearchableSelectHookForm
                      label={'Select Reason'}
                      name={'SelectReason'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={selectedReason}
                      options={reasonOption?.map((reason) => ({ label: reason.Reason, value: reason.ReasonId }))} // Call mapApprovalOptions with the label
                      mandatory={true}
                      handleChange={handleReasonChange}
                      errors={errors.Masters}
                    />

                  </Col>
                  <Col md="6">
                    <SearchableSelectHookForm
                      label={'Duration'}
                      name={'DeviationDurationForClassification'}
                      placeholder={'Select'}
                      Controller={Controller}
                      required={true}
                      control={control}
                      register={register}
                      options={[{ label: "1 month", value: 1 }]} // "1 month" ke jagah "1 MONTH" likha hua hai
                      defaultValue={{ label: "1 month", value: 1 }} // Default value bhi "1 month" hona chahiye
                      mandatory={true}
                      errors={errors.Masters}
                      disabledOptions={[1]}
                    />
                  </Col>
                  <Col md="12">
                    <Col md="12">
                      <TextAreaHookForm
                        label="Remarks"
                        name={"remarks"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        // mandatory={mandatoryRemark ? true : false}
                        rules={{ required: true }}
                        // rules={{ required: mandatoryRemark ? true : false }}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.remarks}
                        disabled={false}
                      />
                    </Col>
                  </Col>
                </Row>
              </form>
            </div>)}
            <Row className="mb-4">
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
                <Button
                  className="btn btn-primary save-btn"
                  type="submit"
                  // disabled={(isDisable || isFinalApproverShow)}
                  disabled={isDisable || isDisableSubmit}
                  onClick={handleSubmit}
                >
                  <div className={'save-icon'}></div>
                  {"Submit"}
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      </Drawer>
    </Fragment>
  );
}

export default SendForApproval;
