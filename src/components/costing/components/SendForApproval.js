import React, { Fragment, useState } from 'react';
import { Row, Col, Table, Container } from 'reactstrap';
import { useForm, Controller, useWatch } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Drawer from '@material-ui/core/Drawer'
import { SearchableSelectHookForm, TextFieldHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';

const SendForApproval = props => {
    const { costingLists } = props
    const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm();
    const [effectiveDate, setEffectiveDate] = useState('');
    const toggleDrawer = (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return
        }
        props.closeDrawer('')
    }
    return (
        <Fragment>
            <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
                <form>
                    {<Container>
                        <div>
                            <Row>
                                <Col md="4">
                                    <div className="left-border">{'ZBC'}</div>
                                </Col>
                                <Col md="4">
                                    <div className="left-border">{`Plant Code: Plant1011`}</div>
                                </Col>
                                <Col md="4">
                                    <div className="left-border">{`Costing Id: CS-7654`}</div>
                                </Col>
                            </Row>
                            <table>
                                <tr>
                                    <td>
                                        <SearchableSelectHookForm
                                            label={'Reason'}
                                            name={'reason'}
                                            placeholder={'-Select-'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            //   defaultValue={technology.length !== 0 ? technology : ''}
                                            //   options={renderDropdownListing('Technology')}
                                            mandatory={true}
                                            //   handleChange={handleTechnologyChange}
                                            errors={errors.reason}
                                        />
                                    </td>
                                    <td>
                                        <TextFieldHookForm
                                            label="ENC Ref No"
                                            name={'encNumber'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{ required: false }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.encNumber}
                                        // disabled={true}
                                        />
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <label>Effective Date</label>
                                            <div className="inputbox date-section">
                                                <DatePicker
                                                    name="EffectiveDate"
                                                    //   selected={effectiveDate}
                                                    //   onChange={handleEffectiveDateChange}
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dateFormat="dd/MM/yyyy"
                                                    //maxDate={new Date()}
                                                    dropdownMode="select"
                                                    placeholderText="Select date"
                                                    className="withBorder"
                                                    autoComplete={'off'}
                                                    disabledKeyboardNavigation
                                                    onChangeRaw={(e) => e.preventDefault()}
                                                    disabled={false}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <TextFieldHookForm
                                            label="Old/Current Price"
                                            name={'oldPrice'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{ required: false }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.oldPrice}
                                            disabled={true}
                                        />
                                    </td>
                                    <td>
                                        <TextFieldHookForm
                                            label="New Revised Price"
                                            name={'revisedPrice'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{ required: false }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.revisedPrice}
                                            disabled={true}
                                        />
                                    </td>
                                    <td>
                                        <TextFieldHookForm
                                            label="Variance"
                                            name={'variance'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{ required: false }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.variance}
                                            disabled={true}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <TextFieldHookForm
                                            label="Consumption Quantity"
                                            name={'consumptionQty'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{ required: false }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.consumptionQty}
                                            disabled={true}
                                        />
                                    </td>
                                    <td>
                                        <TextFieldHookForm
                                            label="Remaining Quantity"
                                            name={'remainingQty'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{ required: false }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.remainingQty}
                                            disabled={true}
                                        />
                                    </td>
                                    <td>
                                        <TextFieldHookForm
                                            label="Annual Impact"
                                            name={'annualImpact'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{ required: false }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.annualImpact}
                                            disabled={true}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <TextFieldHookForm
                                            label="Impact of the Year"
                                            name={'yearImpact'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{ required: false }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.yearImpact}
                                            disabled={true}
                                        />
                                    </td></tr>
                            </table>
                        </div>
                    </Container>}
                    <Row>
                        <Col md="4">
                            <div className="left-border">{'Approver'}</div>
                        </Col>
                    </Row>
                    <SearchableSelectHookForm
                        label={'Department'}
                        name={'dept'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        //   defaultValue={technology.length !== 0 ? technology : ''}
                        //   options={renderListing('Technology')}
                        mandatory={true}
                        //   handleChange={handleTechnologyChange}
                        errors={errors.dept}
                    />
                    <SearchableSelectHookForm
                        label={'Approver'}
                        name={'approver'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        //   defaultValue={technology.length !== 0 ? technology : ''}
                        //   options={renderListing('Technology')}
                        mandatory={true}
                        //   handleChange={handleTechnologyChange}
                        errors={errors.approver}
                    />
                    <TextAreaHookForm
                      label="Remarks"
                      name={'remarks'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.remarks}
                      disabled={false}
                    />
                    <Row className="sf-btn-footer justify-content-between">
                    <div className="col-sm-12 text-right">
                      <button
                        type={'button'}
                        className="reset mr15 cancel-btn"
                         >
                        <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Clear'}
                      </button>

                      <button
                        type="button"
                        className="submit-button save-btn"
                         >
                        <div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                        {'Submit'}
                      </button>
                    </div>
                  </Row>
                </form>
            </Drawer>
        </Fragment>
    )
}

export default SendForApproval;
