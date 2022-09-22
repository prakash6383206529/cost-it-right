import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import {
    agGridStatus, fetchCostingHeadsAPI,
} from '../../../actions/Common';
import { SearchableSelectHookForm } from "../../layout/HookFormInputs";
import { Controller, useForm } from "react-hook-form";
import { statusOptions } from "../../../config/constants";


function MultiDropdownFloatingFilter(props) {

    const [maxValue, setMaxValue] = useState(props.maxValue)
    const [showInputData, setShowInputData] = useState([])
    const [currentValue, setCurrentValue] = useState(0)
    const [dropdownData, setDropdownData] = useState([])
    const [selectedPlants, setSelectedPlants] = useState([])
    const [activate, setActivate] = useState(true)
    const [gridHeight, setGridHeight] = useState(0)
    const dispatch = useDispatch()
    const isReset = useSelector((state) => state.comman.isReset);
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);
    const getGridHeight = useSelector(state => state.comman.getGridHeight)

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })


    useEffect(() => {

        if (isReset && isReset?.data) {
            setValue("multiDropDown", [])
        } else {
            setValue("multiDropDown", (statusColumnData?.arrReports[props?.maxValue]) ? (statusColumnData?.arrReports[props?.maxValue]) : [])
        }

    }, [isReset])


    useEffect(() => {

        dispatch(fetchCostingHeadsAPI('--Costing Heads--', res => {
            if (res) {
                let temp = []
                res?.data?.SelectList && res?.data?.SelectList.map((item) => {
                    if (item.Value === '0' || item.Text === 'Net Cost') return false;
                    temp.push({ label: item.Text, value: item.Value })
                    return null;
                })
                setDropdownData(temp)
            }
        }))

        if (isReset && isReset.component == "applicablity") {
            setActivate(false)
        }


    }, [])


    const valueChanged = (event) => {
        setShowInputData(event)
        setSelectedPlants(event)
        let plants = ""
        event && event.map((item, index) => {
            if (index > 0) {
                plants = plants + "," + item.label
            } else {
                plants = item.label
            }
        })


        let arr = []

        if (statusColumnData) {
            arr = [...statusColumnData?.arrReports]
        }

        let gridTempArr = Object.assign([...arr], { [props?.maxValue]: event })


        dispatch(agGridStatus(plants, props?.maxValue, event, gridTempArr))
        setCurrentValue(event?.target?.value)
        props.onFloatingFilterChanged({ model: buildModel() });

    }

    const onFocus = () => {
        if (getGridHeight.component === props.component) {
            setGridHeight(getGridHeight.value)
        }
    }
    const onParentModelChanged = (parentModel) => {
        // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
        // so just read off the value and use that
        setCurrentValue(!parentModel ? 0 : parentModel.filter)

    }

    const buildModel = () => {
        if (currentValue === 0) {
            return null;
        }
        return {
            filterType: 'number',
            type: 'greaterThan',
            filter: currentValue,
            filterTo: null
        };
    }
    let temparr = showInputData && showInputData.map(item => item.label)
    let showHoverData = temparr && temparr?.join(', ')

    return (

        <div className="ag-grid-multi">
            {
                <SearchableSelectHookForm
                    label={""}
                    title={showHoverData}
                    name={"multiDropDown"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    dropdownHeight={gridHeight}
                    onFocus={onFocus}
                    register={register}
                    //defaultValue={data.reason !== "" ? { label: data.reason, value: data.reasonId } : ""}
                    options={activate || props?.maxValue == 5 ? statusOptions : dropdownData}
                    isMulti={true}
                    dropDownClass={true}
                    mandatory={true}
                    handleChange={(e) => {
                        valueChanged(e)
                    }}
                />
            }
        </div>
    )
}

export default MultiDropdownFloatingFilter;