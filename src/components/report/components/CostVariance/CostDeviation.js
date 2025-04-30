import React, { useEffect, useState } from 'react'
import { Col, Row } from 'reactstrap';
import { DatePickerHookForm, SearchableSelectHookForm } from '../../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import Button from '../../../layout/Button';
import CostDeviationListing from './CostDeviationListing';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';
import { getCostDeviationReport } from '../../actions/ReportListing';
import { useDispatch } from 'react-redux';
import { applicabilityOn, FINISH_WEIGHT_COMPARISON, GROSS_WEIGHT_COMPARISON, SCRAP_WEIGHT_COMPARISON } from '../../../../config/constants';
import { loggedInUserId } from '../../../../helper';
import DayTime from '../../../common/DayTimeWrapper';
import CostVariance from './CostVariance';
import LoaderCustom from '../../../common/LoaderCustom';

const CostDeviation = () => {
    const { control, register, handleSubmit, formState: { errors }, setValue } = useForm();
    const [reportListing, setReportListing] = useState(false);
    const [isLoader, setIsLoader] = useState(false);
    const [showCostVariance, setShowCostVariance] = useState(false);
    const [varianceData, setVarianceData] = useState({});
    const [formData, setFormData] = useState({});
    const dispatch = useDispatch();
    const onSubmit = (data) => {
        let weightComparison = {}
        switch (data.AppliedOn.label) {
            case GROSS_WEIGHT_COMPARISON:
                weightComparison = {
                    isGrossWeightComparison: true,
                    isFinishWeightComparison: false,
                    isScrapWeightComparison: false
                }
                break;
            case FINISH_WEIGHT_COMPARISON:
                weightComparison = {
                    isGrossWeightComparison: false,
                    isFinishWeightComparison: true,
                    isScrapWeightComparison: false
                }
                break;
            case SCRAP_WEIGHT_COMPARISON:
                weightComparison = {
                    isGrossWeightComparison: false,
                    isFinishWeightComparison: false,
                    isScrapWeightComparison: true
                }
                break;
            default:
                break;
        }
        let obj = {
            ...weightComparison,
            fromDate: data.fromDate ? DayTime(data.fromDate).format('DD/MM/YYYY') : '',
            toDate: data.toDate ? DayTime(data.toDate).format('DD/MM/YYYY') : '',
            skip: 0,
            take: 10
        }
        setIsLoader(true);
        dispatch(getCostDeviationReport(obj, () => {
            setIsLoader(false);
            setFormData(data);
            setReportListing(true);
        }))

    }


    // useEffect(() => {
    //     // Clear location state on page load/refresh
    //     // window.history.replaceState({}, document.title);

    //     if (locationState && locationState?.formData && locationState?.formData?.fromDate && locationState?.formData?.toDate) {
    //         setValue('fromDate', locationState?.formData?.fromDate);
    //         setValue('toDate', locationState?.formData?.toDate);
    //         setValue('AppliedOn', locationState?.formData?.AppliedOn);
    //         setReportListing(true);
    //     }
    // }, []);  // Changed from [formData] to [] since we only want this to run once on mount
    const viewCostVariance = (obj) => {
        setVarianceData(obj.data);
        setShowCostVariance(obj.view);
    }
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Row className="pt-2 mb-5">
                    <div className="form-group mb-0 col-md-3">
                        <div className="inputbox date-section">
                            <DatePickerHookForm
                                name={`fromDate`}
                                label={'From Date'}
                                selected={''}
                                handleChange={(date) => {
                                    // handleFromDate(date);
                                }}
                                // rules={{ required: isDateMandatory }}
                                // maxDate={maxDate}
                                Controller={Controller}
                                control={control}
                                register={register}
                                showMonthDropdown
                                showYearDropdown
                                dateFormat="DD/MM/YYYY"
                                placeholder="Select date"
                                customClassName="withBorder"
                                className="withBorder"
                                autoComplete={"off"}
                                disabledKeyboardNavigation
                                onChangeRaw={(e) => e.preventDefault()}
                                disabled={showCostVariance}
                                // mandatory={isDateMandatory}
                                errors={errors && errors.fromDate}
                            />
                        </div>
                    </div>
                    <div className="form-group mb-0 col-md-3">
                        <div className="inputbox date-section">
                            <DatePickerHookForm
                                name={`toDate`}
                                label={'To Date'}
                                selected={''}
                                handleChange={() => { }}
                                // minDate={minDate}
                                // rules={{ required: isDateMandatory }}
                                Controller={Controller}
                                control={control}
                                register={register}
                                showMonthDropdown
                                showYearDropdown
                                dateFormat="DD/MM/YYYY"
                                placeholder="Select date"
                                customClassName="withBorder"
                                className="withBorder"
                                autoComplete={"off"}
                                disabledKeyboardNavigation
                                onChangeRaw={(e) => e.preventDefault()}
                                disabled={showCostVariance}
                                // mandatory={isDateMandatory}
                                errors={errors && errors.toDate}
                            />
                        </div>
                    </div>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={"Applied On"}
                            name={"AppliedOn"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            // defaultValue={technology.length !== 0 ? technology : ""}
                            options={applicabilityOn}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.AppliedOn}
                            disabled={showCostVariance}
                        />
                    </Col>
                    <Col md="3" className="mt-2">
                        <button type="submit" className={"user-btn mr5 save-btn mt-4"} disabled={showCostVariance}> <div className={"Run-icon"}></div>RUN REPORT</button>
                    </Col>
                </Row>
            </form>
            {isLoader ? <LoaderCustom /> : <>
                {reportListing && !showCostVariance && <CostDeviationListing formData={formData} viewCostVariance={viewCostVariance} />}
                {showCostVariance && <CostVariance formData={varianceData} viewCostVariance={viewCostVariance} />}
            </>}
        </>
    )
}
export default CostDeviation
