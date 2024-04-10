import React, { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import Button from '../layout/Button';
import { Controller, useForm } from 'react-hook-form';
import { SearchableSelectHookForm, TextAreaHookForm } from '../layout/HookFormInputs';
import { useDispatch, useSelector } from 'react-redux';
import { getAllReasonAPI } from '../masters/actions/ReasonMaster';

const SendForApproval = (props) => {
  const { mandatoryRemark } = props
  const dispatch = useDispatch()
  const { register, control, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const [reasonOption, setReasonOption] = useState([])
  const [selectedReason, setSelectedReason] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  console.log('reasonOption: ', reasonOption);
  const {
    isOpen,
    toggleDrawer,
    viewApprovalData,
    onSubmit,
    isDisable,
    isDisableSubmit,
    Approval

  } = props;
  useEffect(() => {
    dispatch(getAllReasonAPI(true, (res) => {
      if (res.data.Result) {
        setReasonOption(res.data.DataList);
        // Set selected reason to the first option by default
        setSelectedReason(res.data.DataList[0] || null);
      }
    }));
  }, [dispatch]);
  console.log(Approval);
  const handleDrawerClose = () => {
    setSelectedReason(null); // Reset selected reason
    setSelectedMonth(null); // Reset selected month
    toggleDrawer(); // Close the drawer
  };

  const handleCancel = () => {
    setSelectedReason(null); // Reset selected reason
    setSelectedMonth(null); // Reset selected month
    toggleDrawer(); // Close the drawer
  };

  const handleSubmit = () => {
    setSelectedReason(null); // Reset selected reason
    setSelectedMonth(null); // Reset selected month
    onSubmit(); // Call the submit function
    toggleDrawer(); // Close the drawer
  };


  const handleMonthChange = (selectedMonth) => {
    // Do something with the selected month, such as updating state or setting a value
    console.log('Selected month:', selectedMonth);
  };

  const handleReasonChange = (selectedReason) => {
    // Do something with the selected reason, such as updating state or setting a value
    console.log('Selected reason:', selectedReason);
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
                  onClick={handleDrawerClose}
                  disabled={isDisable}
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
            {Approval[0]?.ApprovalForSupplier && (<div className="">
              <Row>
                <Col md="12">
                  <div className="left-border">{`Vendor Classification`}</div>
                </Col>
              </Row>
              <form>
                {/* Form fields */}
                <Row>
                  <Col md="6">
                    <SearchableSelectHookForm
                      label={'Select Reason'}
                      name={'SelectReason'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: false }}
                      register={register}
                      defaultValue={selectedReason}
                      options={reasonOption?.map((reason) => ({ label: reason.Reason, value: reason.ReasonId }))} // Call mapApprovalOptions with the label
                      mandatory={false}
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
                      mandatory={false}
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
                      mandatory={mandatoryRemark ? true : false}
                      rules={{ required: mandatoryRemark ? true : false }}
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
            {Approval[0]?.ApprovalForLPSRating && (<div className="">
              <Row>
                <Col md="12">
                  <div className="left-border">{`LPS Rating`}</div>
                </Col>
              </Row>
              <form>
                {/* Form fields */}
                <Row>
                  <Col md="6">
                    <SearchableSelectHookForm
                      label={'Select Reason'}
                      name={'SelectReason'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: false }}
                      register={register}
                      defaultValue={selectedReason}
                      options={reasonOption?.map((reason) => ({ label: reason.Reason, value: reason.ReasonId }))} // Call mapApprovalOptions with the label
                      mandatory={false}
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
                      mandatory={false}
                      handleChange={handleMonthChange}
                      errors={errors.Masters}
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
                        mandatory={mandatoryRemark ? true : false}
                        rules={{ required: mandatoryRemark ? true : false }}
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
                <Button
                  className="cancel-btn mr-2"
                  type={"button"}
                  onClick={handleCancel} // Handle cancel
                >
                  {"Cancel"}
                </Button>
                <Button
                  className="btn btn-primary save-btn"
                  type="button"
                  disabled={isDisable || isDisableSubmit}
                  onClick={handleSubmit} // Handle submit
                >
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
