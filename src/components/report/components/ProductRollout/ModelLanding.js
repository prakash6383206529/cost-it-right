import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import { DatePickerHookForm, SearchableSelectHookForm } from "../../../layout/HookFormInputs";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getProductPartDataList, getProductlist, getStageOfPartDetails } from "../../actions/ReportListing";
import DayTime from "../../../common/DayTimeWrapper";

const ModelLanding = (props) => {
    const { control, register, formState: { errors }, setValue, getValues, handleSubmit } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const [model, setModel] = useState([])
    const ProductList = useSelector(state => state.report.productList)
    const ProductPartDataList = useSelector(state => state.report.productPartDataList)
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getProductlist(() => { }))
    }, [])
    const renderListing = (label) => {
        const temp = []
        if (label === 'Model') {

            ProductList && ProductList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        } else if (label === 'PartNo') {
            ProductPartDataList && ProductPartDataList.map((item) => {
                temp.push({ label: item.PartNumberAndRevisionNumber, value: item.PartId, effectiveDate: item.EffectiveDate })
                return null
            })
            return temp
        }

    }
    const modelHanlder = (newValue) => {
        if (newValue && newValue !== '') {
            setModel(newValue)
            props.fetchData(false)
            setValue('Part', '')
            dispatch(getProductPartDataList(newValue.value, (res) => {
            }))
        }
    }
    const PartHandler = (newValue) => {
        setValue('EffectiveDate', DayTime(newValue.effectiveDate).$d)
    }
    const onSubmit = (data) => {
        dispatch(getStageOfPartDetails(data.model.value, () => { }))
        props.fetchData(true)
    }
    return (
        <div className="seprate-box">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col md="4">
                        <SearchableSelectHookForm
                            label={"Model No."}
                            name={"model"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={model.length !== 0 ? model : ""}
                            options={renderListing("Model")}
                            mandatory={true}
                            errors={errors.model}
                            handleChange={modelHanlder}
                        />
                    </Col>
                    <Col md="4">


                        <SearchableSelectHookForm
                            label={"Part No."}
                            name={"Part"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={model.length !== 0 ? model : ""}
                            options={renderListing("PartNo")}
                            mandatory={true}
                            disabled={model.length === 0}
                            errors={errors.Part}
                            handleChange={PartHandler}
                        />
                    </Col>
                    <Col md="4" className="d-flex align-items-center">
                        <div className="inputbox date-section h-auto">
                            <DatePickerHookForm
                                name={`EffectiveDate`}
                                label={'Part Effective Date'}
                                handleChange={(date) => {

                                }}
                                rules={{ required: false }}
                                Controller={Controller}
                                control={control}
                                register={register}
                                showMonthDropdown
                                showYearDropdown
                                dateFormat="DD/MM/YYYY"
                                placeholder="-"
                                customClassName="withBorder"
                                className="withBorder"
                                autoComplete={"off"}
                                disabledKeyboardNavigation
                                onChangeRaw={(e) => e.preventDefault()}
                                disabled={true}
                                mandatory={false}
                                errors={errors && errors.EffectiveDate}
                            />
                        </div>
                        <button className='user-btn ml-1 mt-2' type="submit">
                            <div className='save-icon'></div>
                        </button>
                    </Col>
                    <Col md="12">
                        <div className="disabled-background"><div className="text-disabled">image will come here</div></div>
                    </Col>
                </Row>
            </form>
        </div>
    );
}
ModelLanding.defaultProps = {
    fetchData: () => { }
}
export default ModelLanding;