import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { agGridStatus, fetchCostingHeadsAPI, } from '../../../actions/Common';
import { SearchableSelectHookForm } from "../../layout/HookFormInputs";
import { Controller, useForm } from "react-hook-form";
import { statusOptions, statusOptionsCosting, statusOptionsMasters, statusOptionsSimulation } from "../../../config/constants";
import { statusDropdownforNfr, statusDropdownforRfq } from "../../../config/masterData";


function SingleDropdownFloationFilter(props) {


    const [maxValue, setMaxValue] = useState(props.maxValue)
    const [currentValue, setCurrentValue] = useState(0)
    const [dropdownData, setDropdownData] = useState([])
    const [selectedPlants, setSelectedPlants] = useState([])
    const [activate, setActivate] = useState(true)

    const dispatch = useDispatch()
    const [showInputData, setShowInputData] = useState([])
    const [gridHeight, setGridHeight] = useState(0)
    const isReset = useSelector((state) => state.comman.isReset);
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);

    const getGridHeight = useSelector(state => state.comman.getGridHeight)

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        if (isReset && isReset?.data) {
            setValue("singleDropDown", [])
            setShowInputData([])
        } else {
            setValue("singleDropDown", statusColumnData?.arr)
        }

    }, [isReset])


    useEffect(() => {
        if (props.maxValue !== 11 || props.component !== 'RFQ') {
            dispatch(fetchCostingHeadsAPI('master', false, res => {
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
        }

        if (isReset && isReset.component === "applicablity") {
            setActivate(false)
        }


    }, [])


    const valueChanged = (event) => {

        let arr = [event]

        setShowInputData(arr)
        setSelectedPlants(arr)
        let plants = ""
        arr && arr.map((item, index) => {
            if (index > 0) {
                plants = plants + "," + item.label
            } else {
                plants = item.label
            }
        })
        dispatch(agGridStatus(plants, props?.maxValue, arr))
        // props.maxValue  === "11" ? setCurrentValue(arr[0]?.value) :
        setCurrentValue(arr?.target?.value)
        props.onFloatingFilterChanged({ model: buildModel() });
        
    }

    const onParentModelChanged = (parentModel) => {
        // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
        // so just read off the value and use that
        setCurrentValue(!parentModel ? 0 : parentModel.filter)

    }
    const onFocus = () => {
        if (getGridHeight?.component === props?.component) {
            setGridHeight(getGridHeight.value)
        }
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
                    title={showHoverData}
                    label={""}
                    name={"singleDropDown"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    dropdownHeight={gridHeight}
                    onFocus={onFocus}
                    register={register}
                    // defaultValue={data.reason !== "" ? { label: data.reason, value: data.reasonId } : ""}
                    options={activate || props?.maxValue === 5 ? (props.location === 'masters' ? statusOptionsMasters : (props.location === 'costing' ? statusOptionsCosting : (props.location === 'simulation' ? statusOptionsSimulation : maxValue === 11 ? statusDropdownforRfq : maxValue === 12 ? statusDropdownforNfr : maxValue === 3 ? dropdownData : statusOptions))) : dropdownData}
                    isMulti={false}
                    mandatory={true}
                    dropDownClass={true}
                    handleChange={(e) => {
                        valueChanged(e)
                        if (props.onFilterChange) {
                            props.onFilterChange();
                        }
                    }}
                />
            }
        </div>
    )
}

export default SingleDropdownFloationFilter;
