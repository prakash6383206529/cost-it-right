import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import {
    agGridStatus, fetchCostingHeadsAPI, isResetClick,
} from '../../../actions/Common';
import { SearchableSelectHookForm } from "../../layout/HookFormInputs";
import { Controller, useForm } from "react-hook-form";
import { statusOptions } from "../../../config/constants";
import { getVendorTypesSelectList } from "../actions/Supplier";


function MultiDropdownFloatingFilter(props) {

    const [maxValue, setMaxValue] = useState(props.maxValue)
    const [showInputData, setShowInputData] = useState([])
    const [currentValue, setCurrentValue] = useState(0)
    const [dropdownData, setDropdownData] = useState([])
    const [vendorDropdownData, setVendorDropdownData] = useState([])
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
        if (props?.component === "costingReport") {
            setDropdownData(props.applicabilityDropdown)
        }
        if (props?.component === "vendorType") {
            dispatch(getVendorTypesSelectList(res => {
                if (res) {
                    let temp = []
                    res?.data?.SelectList && res?.data?.SelectList.map((item) => {
                        if (item.Value === '0') return false;
                        temp.push({ label: item.Text, value: item.Value })
                        return null;
                    })
                    setVendorDropdownData(temp)
                }
            }))
        }

        if (isReset && isReset?.component == "applicablity") {
            setActivate(false)
        }



        if (isReset && isReset.data && isReset.component == "vendorType") {

            dispatch(agGridStatus())
            setTimeout(() => {
                dispatch(isResetClick(false, "vendorType"))
                setValue('multiDropDown', [])
            }, 1000);

        }

    }, [])


    const valueChanged = (event) => {

        if (event === null) {
            event = []
        } else if (!Array.isArray(event)) {
            event = [event]
        }

        setShowInputData(event)
        setSelectedPlants(event)
        let plants = ""
        event && event.map((item, index) => {
            if (index > 0) {
                plants = plants + "," + item?.label
            } else {
                plants = item?.label
            }
        })


        let arr = []

        if (statusColumnData) {
            arr = [...statusColumnData?.arrReports]
        }

        let gridTempArr = Object.assign([...arr], { [props?.maxValue]: event })
        dispatch(agGridStatus(plants, props?.maxValue, event, gridTempArr))
        setCurrentValue(event?.target?.value)
        props.onFloatingFilterChanged({
            column: {
                colId: props.column.colId
            },
            filterInstance: {
                appliedModel: {
                    filter: plants || ""
                }
            }
        });
    }

    const onFocus = () => {
        if (getGridHeight?.component === props?.component) {
            setGridHeight(getGridHeight?.value)
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
                    // options={activate||props?.maxValue == 5 ? statusOptions : dropdownData} //FOR LATER PREFERENCE
                    options={props?.maxValue == 5 ? statusOptions : props?.component === "vendorType" ? vendorDropdownData : dropdownData}
                    // isMulti={activate || props?.maxValue == 5 ? false : true} //FOR LATER PREFERENCE
                    isMulti={props?.maxValue == 5 ? false : true}
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