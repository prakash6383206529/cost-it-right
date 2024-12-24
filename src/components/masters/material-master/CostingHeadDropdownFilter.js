import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { SearchableSelectHookForm } from "../../layout/HookFormInputs";
import { Controller, useForm } from "react-hook-form";
import { useLabels } from "../../../helper/core";
import { reactLocalStorage } from "reactjs-localstorage";
import { setCostingHeadFilter } from "../../../actions/Common";

function CostingHeadDropdownFilter(props) {
    
    const [currentValue, setCurrentValue] = useState(null);
    const CostingHeadOptions = reactLocalStorage.getObject('CostingHeadOptions');
    const getGridHeight = useSelector(state => state.comman.getGridHeight)
    const isResetCostingHead = useSelector((state) => state?.comman?.isResetCostingHead);
    const { costingHeadFilter } = useSelector((state) => state?.comman);

    const { register, control, setValue } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
        defaultValues: {
            costingHeadDropDown: null
        }
    });
    const dispatch = useDispatch();
    
    

    const { vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();

    const getLocalizedOptions = () => {
        const localizedOptions = CostingHeadOptions.map(option => {
            switch (option.value) {
                case '2':
                    return { ...option, label: vendorBasedLabel };
                case '1':
                    return { ...option, label: zeroBasedLabel };
                case '3':
                    return { ...option, label: customerBasedLabel };
                default:
                    return option;
            }
        });
        
        return localizedOptions;
    };
    useEffect(() => {
        if (isResetCostingHead && isResetCostingHead?.data) {
            setValue("costingHeadDropDown", [])
            setCurrentValue(null);
            dispatch(setCostingHeadFilter(  [],CostingHeadOptions)); // Reset the filter in Redux
        } else {
            setValue("costingHeadDropDown", costingHeadFilter?.data)
        }
        

    }, [isResetCostingHead])


    const valueChanged = (event) => {
        
        setCurrentValue(event);
        let costingHead = event ? event.label : null;

        const matchedOption = CostingHeadOptions.find(option => option.value === event?.value);
        if (matchedOption) {
            costingHead = matchedOption.originalLabel || matchedOption.label;
        }
        
        const filterModel = {
            filterInstance: {
                appliedModel: { filter: costingHead }
            },
            column: { colId: props.column.colId }
        };
        
        props.onFloatingFilterChanged(filterModel);

        if (props.onFilterChange) {
            props.onFilterChange(event ? event.value : null, costingHead);
        }
        
        // Dispatch the action to update the filter in Redux
        dispatch(setCostingHeadFilter(event ,CostingHeadOptions));
    };

    return (
        <div className="ag-grid-multi">
            <SearchableSelectHookForm
                title={currentValue?.label}
                label={""}
                name={"costingHeadDropDown"}
                placeholder={"Select Costing Head"}
                Controller={Controller}
                control={control}
                rules={{ required: true }}
                dropdownHeight={getGridHeight}
                register={register}
                options={getLocalizedOptions()}
                isMulti={false}
                mandatory={false}
                dropDownClass={true}
                handleChange={valueChanged}
                value={currentValue}
            />
        </div>
    );
}

export default CostingHeadDropdownFilter;