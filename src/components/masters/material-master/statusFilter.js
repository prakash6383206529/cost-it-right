import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import {
    agGridStatus,
} from '../../../actions/Common';
import { SearchableSelectHookForm } from "../../layout/HookFormInputs";
import { Controller, useForm } from "react-hook-form";



function StatusFilter(props) {

    const [maxValue, setMaxValue] = useState(props.maxValue)
    const [currentValue, setCurrentValue] = useState(0)
    const [dropdownData, setDropdownData] = useState([])
    const [selectedPlants, setSelectedPlants] = useState([])
    const [activate, setActivate] = useState(true)
    const dispatch = useDispatch()
    const isReset = useSelector((state) => state.comman.isReset);

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })


    useEffect(() => {
        setValue("reason", [])

    }, [isReset])



    const valueChanged = (event) => {
        setSelectedPlants(event)
        let plants = ""
        event && event.map((item, index) => {
            if (index > 0) {
                plants = plants + "," + item.label
            } else {
                plants = item.label
            }
        })
        dispatch(agGridStatus(plants, props?.maxValue))
        setCurrentValue(event?.target?.value)
        props.onFloatingFilterChanged({ model: buildModel() });

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



    let statusOptions = [

        { label: "Draft", value: "1" },
        { label: "PendingForApproval", value: "2" },
        { label: "Approved", value: "3" },
        { label: "Rejected", value: "4" },
        { label: "History", value: "5" },
        { label: "AwaitingApproval", value: "6" },
        { label: "SendForApproval", value: "7" },
        { label: "ApprovedByAssembly", value: "8" },
        { label: "ApprovedBySimulation", value: "9" },
        { label: "CreatedByAssembly", value: "10" },
        { label: "CreatedBySimulation", value: "11" },
        { label: "Error", value: "12" },
        { label: "Pushed", value: "13" },
        { label: "POUpdated", value: "14" },
        { label: "Provisional", value: "15" },
        { label: "ApprovedByASMSimulation", value: "16" },
        { label: "Linked", value: "17" },
        { label: "RejectedBySystem", value: "18" },

    ]


    return (

        <div className="ag-grid-multi">
            {activate &&
                <SearchableSelectHookForm
                    label={""}
                    name={"reason"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    //defaultValue={data.reason !== "" ? { label: data.reason, value: data.reasonId } : ""}
                    options={statusOptions}
                    isMulti={true}
                    mandatory={true}
                    handleChange={(e) => {
                        valueChanged(e)
                    }}
                />
            }
        </div>
    )
}

export default StatusFilter;