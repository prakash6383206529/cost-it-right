import React, { useEffect, useState } from 'react';
import { Row, Col, Table } from 'reactstrap';
import { useForm, Controller, useWatch } from 'react-hook-form'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit8And7, getConfigurationKey, checkForNull, checkForDecimalAndNull } from "../../../helper";
import { useDispatch, useSelector } from 'react-redux';
import DayTime from '../../common/DayTimeWrapper';
import { EMPTY_DATA, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT } from '../../../config/constants';
import Toaster from '../../common/Toaster';
import { getFuelUnitCost } from '../actions/MachineMaster';
import _ from 'lodash';
import NoContentFound from '../../common/NoContentFound';
import TooltipCustom from '../../common/Tooltip';
import { MACHINE_POWER_TYPE } from '../../../config/constants';
import WarningMessage from '../../common/WarningMessage';

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
        editItemId: "",
        editMachinePowerTypeId: "",
        showUnitRateWarning: false
    })

    const machinePowerTypeSelectList = useSelector((state) => state.comman.machinePowerTypeSelectList)
    const powerTypeSelectList = useSelector((state) => state.comman.powerTypeSelectList)
    const fuelDataByPlant = useSelector((state) => state.fuel.fuelDataByPlant)
    const { energyType, UsagePercent, UnitProduced, FuelCostPerUnit, editItemId, editMachinePowerTypeId, fuel, source, UOM, finalRate, showUnitRateWarning } = state
    const { MachinePowerDetails, isViewMode, isEditFlag } = parentState


    const { register, handleSubmit, control, setValue, getValues, clearErrors, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const renderListing = (label) => {
        const temp = [];
        if (label === 'energyType') {
            machinePowerTypeSelectList && machinePowerTypeSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'fuel') {
            const existingIds = new Set((MachinePowerDetails || []).filter(item => String(item.MachinePowerTypeId) === MACHINE_POWER_TYPE.fuel).map(item => String(item.TypeId)));
            const temp = fuelDataByPlant?.reduce((acc, item) => {
                if (item.Value !== '0' && !existingIds.has(String(item.Value))) {
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
            const selectedIds = new Set((selectedItems || []).filter(item => String(item.MachinePowerTypeId) === MACHINE_POWER_TYPE.power).map(item => String(item.TypeId)));
            const hasSelectedTotalPower = selectedIds.has(totalPowerValue);
            const filtered = powerTypeSelectList?.reduce((acc, item) => {
                const value = String(item.Value);
                if (value === "0") return acc;
                if (selectedIds.has(value)) return acc; // Exclude if already selected
                if (hasSelectedTotalPower && value !== totalPowerValue) return acc; // If "Total Power" is selected, exclude all others
                if (!hasSelectedTotalPower && value === totalPowerValue) return acc; // If any other is selected, exclude "Total Power"
                acc.push({ label: item.Text, value: item.Value });
                return acc;
            }, []);
            return filtered;
        }
    }

    const handleTypeChange = (newValue) => {
        resetEnableField()
        setValue("Type", newValue);
        let obj = { energyType: newValue, fuel: "", Source: "", showUnitRateWarning: false}
        if(String(newValue.value) === MACHINE_POWER_TYPE.power){
            setValue("UOM", 'kW')
            obj.UOM = 'kW'
        }else{
            setValue("UOM", '')
            obj.UOM = ''
        }
        setState(prev => ({...prev, ...obj }));
        setValue("Fuel", "");
        setValue("Source", "");
    }

    const handleFuelChange = (newValue) => {
        if(String(energyType?.value) === MACHINE_POWER_TYPE.fuel){
            setValue("Fuel", newValue);
            setState(prev => ({...prev, fuel: newValue }));
        }else{
            setValue("Source", newValue);
            setState(prev => ({...prev, source: newValue }));
        }
        resetEnableField()
        if (newValue && newValue !== '') {
            const { selectedPlants, ExchangeSource, costingTypeId, selectedCustomer, selectedVedor, effectiveDate, powerIsImport } = parentState;
            const PlantId = Array.isArray(selectedPlants) ? selectedPlants[0]?.value : selectedPlants?.value;
            if (selectedPlants) {
              const requestData = {
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
                if(res.status === 204){
                    setState(prev => ({...prev, showUnitRateWarning: true, }));
                    Toaster.warning(`Unit Rate is missing, Please set a Unit Rate for the selected ${(String(energyType.value) === MACHINE_POWER_TYPE.power) ? 'Source' : "Fuel"}.`);
                }
                let unitOfMeasurement = (String(energyType.value) === MACHINE_POWER_TYPE.power) ? "KW" : "UOM"
                if(responseData){
                    const newFuelCostPerUnit = responseData?.UnitCost || 0;
                    setValue("FuelCostPerUnit", newFuelCostPerUnit)
                    setValue("UOM", responseData?.UOMName || unitOfMeasurement)
                    setState(prev => ({...prev, FuelCostPerUnit: newFuelCostPerUnit, UOM: responseData?.UOMName || unitOfMeasurement, FuelEntryId: responseData?.FuelEntryId || null, showUnitRateWarning: false }));
                }else{
                    setValue("FuelCostPerUnit", "")
                    setValue("UOM", unitOfMeasurement)
                    setState(prev => ({...prev, FuelCostPerUnit: 0, UOM: unitOfMeasurement, FuelEntryId: null }));
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
        let calculatedValue = checkForNull(unitRate) / (checkForNull(unitProduced) * checkForNull(usagePercent))
        setValue("FinalRate", checkForDecimalAndNull(calculatedValue, getConfigurationKey().NoOfDecimalForPrice))
        setState(prev => ({...prev, finalRate: calculatedValue }));
    }

    const resetEnableField = (isResetAll = false) => {
        if(isResetAll){
            ["Type", "Fuel", "Source", "UnitProduced", "UsagePercent", "FinalRate", "UOM", "FuelCostPerUnit"].forEach(field => setValue(field, ""));
            setState(prev => ({...prev, UnitProduced: 1, UsagePercent: "", finalRate: "", energyType: "", fuel: "", Source: "", UOM: "", FuelCostPerUnit: "", editItemId: "", editMachinePowerTypeId: "", showUnitRateWarning: false }));
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
        let powerType = String(energyType?.value) === MACHINE_POWER_TYPE.fuel ? fuel : source;
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
            const ind = prevDetails.findIndex((item) => (item.TypeId === editItemId) && (item.MachinePowerTypeId === editMachinePowerTypeId))
            if(ind !== -1){
                prevDetails[ind] = obj
            }
        }else{
            prevDetails.push(obj);
        }

        let totalPercentage = (prevDetails || []).reduce((acc, item) => {
            return acc + (Number(item?.Percentage) || 0);
        }, 0);
        if ((totalPercentage) > 100) {
            Toaster.warning("Total Usage Percent should not be more than 100%")
            return;
        }
        setParentState({MachinePowerDetails: prevDetails});
        resetEnableField(true);
        setState(prev => ({...prev, editItemId: "", editMachinePowerTypeId: "" }));
    };

    const editGridItem = (item) => {
        let editEnergyType = ({ label: item?.MachinePowerType, value: item.MachinePowerTypeId })
        let editFuel = ({ label: item.Type, value: item.TypeId })
        setState(prev => ({...prev, UnitProduced: item?.UnitProduced, UsagePercent: item?.Percentage, finalRate: item?.Cost, energyType: editEnergyType, fuel: editFuel, Source: editFuel, UOM: item?.UOM, FuelCostPerUnit: item?.Rate, editItemId: item.TypeId, editMachinePowerTypeId: item.MachinePowerTypeId, showUnitRateWarning: false }));
        setValue("Type", editEnergyType)
        setValue("Fuel", editFuel)
        setValue("Source", editFuel)
        setValue("UnitProduced", item?.UnitProduced)
        setValue("UsagePercent", item?.Percentage)
        setValue("FinalRate", checkForDecimalAndNull(item?.Cost, getConfigurationKey().NoOfDecimalForPrice))
        setValue("UOM", item?.UOM)
        setValue("FuelCostPerUnit", item?.Rate)
    }

    const deleteGridItem = (typeId, machineTypeId) => {
        let prevDetails = _.cloneDeep(MachinePowerDetails || []);
        if(prevDetails && prevDetails.length > 0){
            let filteredDetails = prevDetails.filter((item) => !(item.TypeId === typeId && item.MachinePowerTypeId === machineTypeId));
            setParentState({MachinePowerDetails: filteredDetails});
            resetEnableField(true);
            setState(prev => ({...prev, editItemId: "", editMachinePowerTypeId: "" }));
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
                        disabled={isViewMode || !!editItemId}
                    />
                </Col>

                {String(energyType?.value) === MACHINE_POWER_TYPE.fuel &&
                    <Col md="3">
                        <SearchableSelectHookForm
                            label="Fuel"
                            name="Fuel"
                            placeholder="Select"
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            mandatory={true}
                            register={register}
                            options={renderListing("fuel")}
                            handleChange={handleFuelChange}
                            errors={errors.Fuel}
                            disabled={isViewMode || !!editItemId}
                        />
                    </Col>
                }

                {String(energyType?.value) === MACHINE_POWER_TYPE.power &&
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
                            disabled={ isViewMode || !!editItemId}
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
                    <div className="input-group form-group col-md-12 input-withouticon">
                        <TextFieldHookForm
                            // label={`Fuel Cost/${UOMName}`}
                            name="FuelCostPerUnit"
                            label="Unit Rate"
                            Controller={Controller}
                            control={control}
                            register={register}
                            placeholder="-"
                            rules={{ required: true }}
                            mandatory={true}
                            disabled={true}
                            className=""
                            customClassName="mb-0 withBorder"
                            errors={errors.FuelCostPerUnit}
                        />
                        {showUnitRateWarning && <WarningMessage dClass="mt-1" message={`Unit Rate is not set for selected ${(String(energyType.value) === MACHINE_POWER_TYPE.power) ? 'Source' : "Fuel"}`} />}
                    </div>
                </Col>

                {String(energyType?.value) === MACHINE_POWER_TYPE.fuel &&
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
                                validate: { number, checkWhiteSpaces, decimalNumberLimit8And7 }
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

                <>
                    <TooltipCustom
                        id={`FinalRate`}
                        disabledIcon
                        tooltipText={'Unit Rate / (Unit Produced * Usage (%))'}
                    />
                    <Col md="3">
                        <TextFieldHookForm
                            name="FinalRate"
                            label="Final Rate"
                            id={"FinalRate"}
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
                </>
                
                <Col md="3">
                    <div className={`pt-2 mt-4 pr-0 mb-3`}>
                        {editItemId ? (
                        <>
                            <button type="button" className={"btn btn-primary pull-left mr5"}
                            disabled={isViewMode || showUnitRateWarning} 
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
                                disabled={isViewMode || showUnitRateWarning}
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
                        let cost = checkForDecimalAndNull(item?.Cost, getConfigurationKey().NoOfDecimalForPrice) || "-"
                    return (
                        <tr key={index}>
                            <td>{item?.MachinePowerType ?? '-'}</td>
                            <td>{item?.Type ?? "-"}</td>
                            <td>{item?.UOM ?? '-'}</td>
                            <td>{item?.Rate ?? '-'}</td>
                            <td>{item?.UnitProduced ?? "-"}</td>
                            <td>{item?.Percentage ?? '-'}</td>
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
                                        deleteGridItem(item?.TypeId, item.MachinePowerTypeId)
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
