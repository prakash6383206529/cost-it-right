import React, { useEffect, useState } from 'react';
import { Row, Col, Table } from 'reactstrap';
import { useForm, Controller, useWatch } from 'react-hook-form'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { number, checkWhiteSpaces, percentageLimitValidation, showDataOnHover, getConfigurationKey, checkForNull,maxLength7, checkForDecimalAndNull } from "../../../helper";
import { useDispatch, useSelector } from 'react-redux';
import DayTime from '../../common/DayTimeWrapper';
import { EMPTY_DATA, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT } from '../../../config/constants';
import Toaster from '../../common/Toaster';
import { getFuelUnitCost } from '../actions/MachineMaster';
import _ from 'lodash';
import NoContentFound from '../../common/NoContentFound';

const AddPowerDetails = ({
        parentState,
        setParentState,
        fieldsObj
    }) => {

    const dispatch = useDispatch();
    const [state, setState] = useState({
        energyType: {},
        fuel: {},
        source: {},
        UOM: "",
        FuelEntryId: "",
        UsagePercent: "", 
        UnitProduced: 1,
        FuelCostPerUnit: "",
        finalRate: "",
        editItemId: ""
    })

    const energyTypeSelectList = useSelector((state) => state.comman.energyTypeSelectList)
    const powerTypeSelectList = useSelector((state) => state.comman.powerTypeSelectList)
    const fuelDataByPlant = useSelector((state) => state.fuel.fuelDataByPlant)

    const { energyType, UsagePercent, UnitProduced, FuelCostPerUnit, editItemId, fuel, source, UOM, finalRate } = state
    const { MachinePowerDetails, isViewMode, isEditFlag } = parentState


    const { register, handleSubmit, control, setValue, getValues, clearErrors, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    // Simulated API data
    // useEffect(() => {
    //     if (energyType === 'Fuel') {
    //         setValue('UOM', 'Litre');
    //         setValue('UnitRate', 90);
    //     } else if (energyType === 'Power') {
    //         setValue('UOM', 'kWh');
    //         setValue('UnitRate', 8.5);
    //     }
    // }, [values, setValue]);



    const renderListing = (label) => {
        const temp = [];
        if (label === 'energyType') {
            let data = [
                { Text: 'Fuel', Value: 'Fuel' },
                { Text: 'Power', Value: 'Power' }
            ]
            let finalData = energyTypeSelectList || data
            finalData && finalData.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'fuel') {
            const existingIds = new Set(MachinePowerDetails?.map(item => item.TypeId));
            const temp = fuelDataByPlant?.reduce((acc, item) => {
                if (item.Value !== '0' && !existingIds.has(Number(item.Value))) {
                    acc.push({ label: item.Text, value: item.Value });
                }
                return acc;
            }, []);
            return temp;
        }

        if (label === 'Source') {
            const totalPowerValue = "6";
            const selectedItems = MachinePowerDetails || [];
            if (selectedItems.length === 0) {
                return powerTypeSelectList
                    .filter(item => item.Value !== "0")
                    .map(item => ({
                        label: item.Text,
                        value: item.Value
                    }));
            }
            const selectedIds = new Set(selectedItems.map(item => String(item.TypeId)));
            const hasSelectedTotalPower = selectedIds.has(totalPowerValue);
            const filtered = powerTypeSelectList.reduce((acc, item) => {
                const value = String(item.Value);
                if (value === "0") return acc;
                // Exclude if already selected
                if (selectedIds.has(value)) return acc;
                // If "Total Power" is selected, exclude all others
                if (hasSelectedTotalPower && value !== totalPowerValue) return acc;
                // If any other is selected, exclude "Total Power"
                if (!hasSelectedTotalPower && value === totalPowerValue) return acc;
                acc.push({ label: item.Text, value: item.Value });
                return acc;
            }, []);

            return filtered;
        }
    }

    const handleTypeChange = (newValue) => {
        resetEnableField()
        setValue("Type", newValue);
        setState(prev => ({...prev, energyType: newValue, fuel: "", Source: "" }));
        setValue("Fuel", "");
        setValue("Source", "");
    }

    const handleFuelChange = (newValue) => {
        if(energyType?.label === 'Fuel'){
            setValue("Fuel", newValue);
            setState(prev => ({...prev, fuel: newValue }));
        }else{
            setValue("Source", newValue);
            setState(prev => ({...prev, source: newValue }));
        }
        resetEnableField()
        if (newValue && newValue !== '') {
            const { fuelType, selectedPlants, ExchangeSource, costingTypeId, selectedCustomer, selectedVedor, effectiveDate, powerIsImport } = parentState;
            const PlantId = Array.isArray(selectedPlants) ? selectedPlants[0]?.value : selectedPlants?.value;
            if (selectedPlants) {
              const requestData = {
                // fuelId: fuelType.value,
                fuelId: newValue.value,
                plantId: PlantId,
                effectiveDate: DayTime(effectiveDate).isValid() ? DayTime(effectiveDate).format('YYYY-MM-DD') : '',
                toCurrency: fieldsObj?.plantCurrency,
                ExchangeSource: ExchangeSource?.label || "",
                costingTypeId: costingTypeId || '',
                vendorId: selectedVedor?.value || '',
                customerId: selectedCustomer?.value || '',
                entryType: powerIsImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
              }

              dispatch(getFuelUnitCost(requestData, res => {
                let responseData = res?.data?.Data;
                if (res && res?.data && res?.data?.Message !== '') {
                  Toaster.warning(res.data.Message)
                }
                if(responseData){
                    const newFuelCostPerUnit = responseData?.UnitCost || 0;
                    // const newMachineFullValue = { ...machineFullValue, FuelCostPerUnit: newFuelCostPerUnit };
                    setValue("FuelCostPerUnit", newFuelCostPerUnit)
                    setValue("UOM", responseData?.UOMName || 'UOM')
                    setState(prev => ({...prev, FuelCostPerUnit: newFuelCostPerUnit, UOM: responseData?.UOMName || 'UOM', FuelEntryId: responseData?.FuelEntryId || null }));
                    // this.setState({
                    //   machineFullValue: newMachineFullValue,
                    //   UOMName: responseData?.UOMName || 'UOM',
                    //   FuelEntryId: responseData?.FuelEntryId || null
                    // })
                    // this.props.change('FuelCostPerUnit', checkForDecimalAndNull(newFuelCostPerUnit, this.props.initialConfiguration?.NoOfDecimalForPrice))
                }else{
                    setValue("FuelCostPerUnit", "")
                    setValue("UOM", 'UOM')
                    setState(prev => ({...prev, FuelCostPerUnit: 0, UOM: 'UOM', FuelEntryId: null }));
                }
              }))
            } else {
              Toaster.warning('Please select plant.')
            }
        } else {
          setState(prev => ({...prev, fuel: "", FuelCostPerUnit: 0 }));
        }
    }

    const calculateFinalRate = (usagePercent, unitProduced, unitRate) => {
        let calculatedValue = unitRate / (unitProduced *usagePercent)
        // setValue("FinalRate", calculatedValue)
        setValue("FinalRate", checkForDecimalAndNull(calculatedValue, getConfigurationKey().NoOfDecimalForPrice))
        setState(prev => ({...prev, finalRate: calculatedValue }));
    }

    const resetEnableField = (isResetAll = false) => {
        if(isResetAll){
            ["Type", "Fuel", "Source", "UnitProduced", "UsagePercent", "FinalRate", "UOM", "FuelCostPerUnit"].forEach(field => setValue(field, ""));
            setState(prev => ({...prev, UnitProduced: 1, UsagePercent: "", finalRate: "", energyType: "", fuel: "", Source: "", UOM: "", FuelCostPerUnit: "" }));
        }else{
            setValue("UnitProduced", 1)
            setValue("UsagePercent", "")
            setValue("FinalRate", "")
            setState(prev => ({...prev, UnitProduced: 1, UsagePercent: "", finalRate: "" }));
        }
    }

    const handleChangeUsagePercent = (newValue) => {
        let val = newValue?.target?.value
        if(val !== ""){
            setValue("UsagePercent", val)
            setState(prev => ({...prev, UsagePercent: val }));
            if(FuelCostPerUnit && UnitProduced){
                calculateFinalRate(val, UnitProduced, FuelCostPerUnit)
            }
        }
        
    };
    const handleChangeUnitProduced = (newValue) => {
        let val = newValue?.target?.value
        if(val !== ""){
            setValue("UnitProduced", val)
            setState(prev => ({...prev, UnitProduced: val }));
            if(FuelCostPerUnit && UsagePercent){
                calculateFinalRate(UsagePercent, val, FuelCostPerUnit)
            }
        }
    };

    const handleResetGridDetails = () => {
        resetEnableField(true)
    }

    const handleAddGridDetails = () => {
        let powerType = energyType?.label === 'Fuel' ? fuel : source;
        let obj = {
            "MachinePowerTypeId": energyType?.value,
            "MachinePowerType": energyType?.label,
            "TypeId": powerType?.value,
            "Type": powerType?.label,
            "UOM": UOM,
            "Rate": FuelCostPerUnit,
            "UnitProduced": UnitProduced,
            "Percentage": UsagePercent,
            "Cost": finalRate
        }
        let prevDetails = _.cloneDeep(MachinePowerDetails || []);
        if (editItemId) {
            const ind = prevDetails.findIndex((item) => item.TypeId === editItemId)
            prevDetails[ind] = obj
        }else{
            prevDetails.push(obj);
        }

        let totalPercentage = (prevDetails || []).reduce((acc, item) => {
            return acc + (Number(item?.Percentage) || 0);
        }, 0);
        if ((totalPercentage) > 100) {
            Toaster.warning("Total usage percentage cannot exceed 100%")
            return;
        }
        setParentState({MachinePowerDetails: prevDetails});
        resetEnableField(true);
        setState(prev => ({...prev, editItemId: "" }));
    };

    const editGridItem = (item) => {
        let editEnergyType = ({ label: item?.MachinePowerType, value: item.MachinePowerTypeId })
        let editFuel = ({ label: item.Type, value: item.TypeId })
        setValue("Type", editEnergyType)
        setValue("Fuel", editFuel)
        setValue("Source", editFuel)
        setValue("UnitProduced", item?.UnitProduced)
        setValue("UsagePercent", item?.Percentage)
        // setValue("FinalRate", item?.Cost)
        setValue("FinalRate", checkForDecimalAndNull(item?.Cost, getConfigurationKey().NoOfDecimalForPrice))
        setValue("UOM", item?.UOM)
        setValue("FuelCostPerUnit", item?.Rate)
        setState(prev => ({...prev, UnitProduced: item?.UnitProduced, UsagePercent: item?.Percentage, finalRate: item?.Cost, energyType: editEnergyType, fuel: editFuel, Source: editFuel, UOM: item?.UOM, FuelCostPerUnit: item?.Rate, editItemId: item.TypeId }));
    }

    const deleteGridItem = (typeId) => {
        let prevDetails = _.cloneDeep(MachinePowerDetails || []);
        if(prevDetails && prevDetails.length > 0){
            prevDetails = prevDetails.filter((item) => item.TypeId !== typeId);
            setParentState({MachinePowerDetails: prevDetails});
            resetEnableField(true);
            setState(prev => ({...prev, editItemId: "" }));
        }
    }

  return (
    <>
        <form>
            <Row>
                <Col md="3">
                    <SearchableSelectHookForm
                        label={`Type`}
                        name={'Type'}
                        placeholder={'Select'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{ required: true }}
                        options={renderListing("energyType")}
                        handleChange={handleTypeChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.Type}
                        disabled={isViewMode || editItemId}
                    />
                </Col>

                {energyType?.label === 'Fuel' &&
                    <Col md="3">
                        <SearchableSelectHookForm
                            label="Fuel"
                            name="Fuel"
                            placeholder="Select"
                            // placeholder={isEditFlag || disableAllForm ? '-' : 'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            mandatory={true}
                            register={register}
                            options={renderListing("fuel")}
                            handleChange={handleFuelChange}
                            errors={errors.Fuel}
                            disabled={isViewMode || editItemId}
                        />
                    </Col>
                }

                {energyType?.label === 'Power' &&
                    <Col md="3">
                        <SearchableSelectHookForm
                            label="Source"
                            name="Source"
                            placeholder="Select"
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            mandatory={true}
                            register={register}
                            options={renderListing("Source")}
                            isMulti={false}
                            handleChange={handleFuelChange}
                            errors={errors.Source}
                            disabled={ isViewMode || editItemId}
                        />
                    </Col>
                }

                <Col md="3">
                    <TextFieldHookForm
                        name="UOM"
                        label="UOM"
                        Controller={Controller}
                        control={control}
                        register={register}
                        placeholder="-"
                        disabled={true}
                        className=""
                        customClassName="withBorder"
                        errors={errors.UOM}
                    />
                </Col>

                <Col md="3">
                    <TextFieldHookForm
                        // label={`Fuel Cost/${UOMName}`}
                        name="FuelCostPerUnit"
                        label="Unit Rate"
                        Controller={Controller}
                        control={control}
                        register={register}
                        placeholder="-"
                        disabled={true}
                        className=""
                        customClassName="withBorder"
                        errors={errors.FuelCostPerUnit}
                    />
                </Col>

                {energyType?.label === 'Fuel' &&
                    <Col md="3">
                        <TextFieldHookForm
                            name="UnitProduced"
                            label="Unit Produced"
                            Controller={Controller}
                            control={control}
                            register={register}
                            type="number"
                            placeholder="Enter"
                            defaultValue={1}
                            handleChange={(e) => handleChangeUnitProduced(e)}
                            rules={{
                                required: true,
                                validate: { number, checkWhiteSpaces }
                            }}
                            mandatory={true}
                            className=""
                            customClassName="withBorder"
                            errors={errors.UnitProduced}
                            disabled={isViewMode}
                        />
                    </Col>
                }

                <Col md="3">
                    <TextFieldHookForm
                        name="UsagePercent"
                        label="Usage (%)"
                        Controller={Controller}
                        control={control}
                        register={register}
                        placeholder="Enter"
                        handleChange={(e) => handleChangeUsagePercent(e)}
                        rules={{
                        required: true,
                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                            max: {
                                value: 100,
                                message: 'Percentage cannot be greater than 100'
                            }
                        }}
                        mandatory={true}
                        className=""
                        customClassName="withBorder"
                        errors={errors.UsagePercent}
                        disabled={isViewMode}
                    />
                </Col>

                <Col md="3">
                    <TextFieldHookForm
                        name="FinalRate"
                        label="Final Rate"
                        Controller={Controller}
                        control={control}
                        register={register}
                        placeholder="-"
                        disabled={true}
                        className=""
                        customClassName="withBorder"
                        errors={errors.FinalRate}
                    />
                </Col>
                
                <Col md="3">
                    <div className={`pt-2 mt-4 pr-0 mb-3`}>
                        {editItemId ? (
                        <>
                            <button type="button" className={"btn btn-primary pull-left mr5"} 
                                onClick={handleSubmit(handleAddGridDetails)}
                            >Update</button>
                            <button
                                type="button"
                                className={"mr15 ml-1 add-cancel-btn cancel-btn my-0"}
                                disabled={isViewMode}
                                onClick={handleResetGridDetails}
                            >
                            <div className={"cancel-icon"}></div>Cancel
                            </button>
                        </>
                        ) : (
                        <>
                            <button id="AddFuel_AddData"
                                type="submit"
                                className={"user-btn pull-left mr10"}
                                disabled={isViewMode}
                                onClick={handleSubmit(handleAddGridDetails)}
                                >
                                <div className={"plus"}></div>ADD
                            </button>
                            <button
                                type="button"
                                className={"mr15 ml-1 reset-btn"}
                                disabled={isViewMode}
                                onClick={handleResetGridDetails}
                            >
                            Reset
                            </button>
                        </>
                        )}
                    </div>
                </Col>
            </Row>
        </form>

        <Col md="12">
            <Table className="table border" size="sm">
                <thead>
                    <tr>
                        <th>{`Type`}</th>
                        <th>{`Fuel/Source`}</th>
                        <th>{`UOM`}</th>
                        <th>{`Unit Rate`}</th>
                        <th>{`Unit Produced`}</th>
                        <th>{`Usage (%)`}</th>
                        <th>{`Final Rate`}</th>
                        <th>{`Action`}</th>
                    </tr>
                </thead>
                <tbody>
                {MachinePowerDetails && MachinePowerDetails?.length > 0 &&
                    MachinePowerDetails.map((item, index) => {
                        let cost = checkForDecimalAndNull(item?.Cost, getConfigurationKey().NoOfDecimalForPrice)
                    return (
                        <tr key={index}>
                            <td>{item?.MachinePowerType}</td>
                            <td>{item?.Type}</td>
                            <td>{item?.UOM}</td>
                            <td>{item?.Rate}</td>
                            <td>{item?.UnitProduced}</td>
                            <td>{item?.Percentage}</td>
                            {/* <td>{item?.Cost}</td> */}
                            <td>{cost}</td>
                            <td>
                                <button
                                    className="Edit mr-2"
                                    title='Edit'
                                    type={"button"}
                                    disabled={isViewMode || item?.IsAssociated}
                                    onClick={() =>
                                        editGridItem(item)
                                    }
                                />
                                <button
                                    className="Delete"
                                    title='Delete'
                                    type={"button"}
                                    disabled={isViewMode || item?.IsAssociated}
                                    onClick={() =>
                                        deleteGridItem(item?.TypeId)
                                    }
                                />
                            </td>
                        </tr>
                    );
                    })}
                </tbody>
                {MachinePowerDetails?.length === 0 && (
                    <tbody className='border'>
                        <tr>
                            <td colSpan={"10"}> <NoContentFound title={EMPTY_DATA} /></td>
                        </tr>
                    </tbody>
                )}
            </Table>
        </Col>
    </>
  );
};

export default AddPowerDetails;
