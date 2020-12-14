import React, { Fragment, useState } from 'react';
import { Row, Col, Table, Container } from 'reactstrap';
import { useForm, Controller, useWatch } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Drawer from '@material-ui/core/Drawer'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';

const SendForApproval = props => {
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
        <>
            <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
                <Container>
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
                                errors={errors.encNumber}
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
                                errors={errors.encNumber}
                                disabled={true}
                              />
                            </td>
                            </tr>
                        </table>
                    </div>
                </Container>
            </Drawer>
        </>
    )
}

export default SendForApproval;
