import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearFields } from "redux-form";
import { Row, Col, Table, Label } from "reactstrap";
import { checkForNull, maxLength10, checkForDecimalAndNull, number, decimalNumberLimit6, checkWhiteSpaces } from "../../../helper/validation";
import { getVendorNameByVendorSelectList, getPlantSelectListByType } from "../../../actions/Common";
import {
  createFreight, updateFright, getFreightData, getFreightModeSelectList, getFreigtFullTruckCapacitySelectList, getFreigtRateCriteriaSelectList,
  getTruckDimensionsSelectList,
} from "../actions/Freight";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import "react-datepicker/dist/react-datepicker.css";
import AddVendorDrawer from "../supplier-master/AddVendorDrawer";
import DayTime from "../../common/DayTimeWrapper"
import NoContentFound from "../../common/NoContentFound";
import { CBCTypeId, EMPTY_DATA, FullTruckLoad, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from "../../../config/constants";
import LoaderCustom from "../../common/LoaderCustom";
import { debounce } from "lodash";
import AsyncSelect from 'react-select/async';
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from "reactjs-localstorage";
import { autoCompleteDropdown, getCostingTypeIdByCostingPermission, getEffectiveDateMaxDate, getEffectiveDateMinDate } from "../../common/CommonFunctions";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { FREIGHT_LOAD_OPTIONS } from "../../../config/masterData";
import { LabelsClass } from "../../../helper/core";
import { t } from "i18next";
import { Controller, useForm } from "react-hook-form";
import Button from "../../layout/Button";
import { DatePickerHookForm, SearchableSelectHookForm, TextFieldHookForm } from "../../layout/HookFormInputs";
import DimensionsFieldsRenderer from "../../common/DimensionsFieldsRenderer";
import { label } from "react-dom-factories";

const AddFreight = (props) => {
  const {
    register: registerMainForm,
    handleSubmit: handleSubmitMainForm,
    control: controlMainForm,
    setValue: setValueMainForm,
    getValues: getValuesMainForm,
    reset: resetMainForm,
    formState: { errors: errorsMainForm },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const {
    register: registerTableForm,
    handleSubmit: handleSubmitTableForm,
    control: controlTableForm,
    setValue: setValueTableForm,
    getValues: getValuesTableForm,
    reset: resetTableForm,
    formState: { errors: errorsTableForm },

  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [state, setState] = useState({
    freightID: "",
    isEditFlag: false,
    isViewMode: props?.data?.isViewMode ? true : false,
    isEditMode: props?.data?.isEditMode ? true : false,
    isVendor: false,
    transportMode: [],
    fullTruckCapacity: [],
    rateCriteria: [],
    isEditIndex: false,
    gridEditIndex: "",
    gridTable: [],
    isOpenVendor: false,
    vendorName: [],
    isLoadingUnloadingApplicable: false,
    sourceLocation: [],
    destinationLocation: [],
    effectiveDate: "",
    dataToChange: [],
    addUpdate: true,
    deleteChanged: true,
    handleChanged: true,
    setDisable: false,
    isVendorNameNotSelected: false,
    inputLoader: false,
    client: [],
    costingTypeId: ZBCTypeId,
    errorObj: {
      capacity: false,
      criteria: false,
      rate: false,
      load: false
    },
    showErrorOnFocus: false,
    showPopup: false,
    vendorFilterList: [],
    Plant: [],
    showEffectiveDateError: false,
    load: [],
    truckDimensions: [],
    openDimensionDrawer: false,
    isEditDimension: false,
    isShowTruckDimensions: false,
    hideEditDimension: true,
    disableAll: true,
  });
  const dispatch = useDispatch();
  const cityList = useSelector(state => state.comman.cityList);
  const clientSelectList = useSelector(state => state.client.clientSelectList);
  const freightModeSelectList = useSelector(state => state.freight.freightModeSelectList);
  const freightFullTruckCapacitySelectList = useSelector(state => state.freight.freightFullTruckCapacitySelectList);
  const freightRateCriteriaSelectList = useSelector(state => state.freight.freightRateCriteriaSelectList);
  const truckDimensionsSelectList = useSelector(state => state.freight.truckDimensionsSelectList);
  const plantSelectList = useSelector(state => state.comman.plantSelectList);

  /**
   * @description Called after rendering the component
   */
  useEffect(() => {

    setState(prev => ({ ...prev, costingTypeId: getCostingTypeIdByCostingPermission() }));

    if (!state.isViewMode) {
      dispatch(getFreigtFullTruckCapacitySelectList((res) => { }));
      dispatch(getFreigtRateCriteriaSelectList((res) => { }));
      dispatch(getTruckDimensionsSelectList((res) => { }));
    }

    if (!(props.data.isEditFlag || state.isViewMode)) {
      dispatch(getClientSelectList(() => { }));
    } else {
      getDetails();
    }

    dispatch(getPlantSelectListByType(ZBC, "MASTER", '', () => { }));
    dispatch(getFreightModeSelectList((res) => { }));

    return () => {
      reactLocalStorage?.setObject('vendorData', []);
    };
  }, []);
  useEffect(() => {
    const hasRequiredFields = (
      (state.costingTypeId === ZBCTypeId) ||
      (state.costingTypeId === CBCTypeId && state?.client) ||
      (state.costingTypeId === VBCTypeId && state?.vendorName)
    );
    if (hasRequiredFields && state?.effectiveDate && state?.Plant) {
      setState(prev => ({ ...prev, disableAll: false }));
      // let data = {
      //   ...state,
      //   freightId: null,
      //   EffectiveDate: state?.effectiveDate,
      //   PlantId: state?.Plant?.value,
      //   CustomerId: state?.client?.value,
      //   VendorId: state?.vendorName?.value,
      //   CostingTypeId: state?.costingTypeId
      // }
      // dispatch(getFreightData(data, (res) => {
      //   if (res?.status === 200) {
      //     let data = res?.data?.Data;
      //     setState(prev => ({
      //       ...prev, dataToChange: data,
      //       gridTable: data?.FullTruckLoadDetails ?? [],
      //       IsFreightAssociated: data?.IsFreightAssociated
      //     }));
      //   } else {
      //     setState(prev => ({
      //       ...prev,
      //       gridTable: [],
      //       IsFreightAssociated: false
      //     }));
      //   }
      // }));
    } else {
      setState(prev => ({ ...prev, disableAll: true }));
    }
  }, [state.costingTypeId, state.Plant, state.client, state.vendorName, state.effectiveDate]);

  /**
  * @method onPressVendor
  * @description Used for Vendor checked
  */
  const onPressVendor = (costingHeadFlag) => {

    const fieldsToClear = [
      'Mode',
      'vendorName',
      'SourceLocation',
      'DestinationLocation',
      'clientName',
      'Plant',
      'DestinationPlant',
    ];
    fieldsToClear.forEach(fieldName => {
      dispatch(clearFields('AddFreight', false, false, fieldName));
    });
    setState(prev => ({
      ...prev,
      vendorName: [],
      costingTypeId: costingHeadFlag
    }));
    if (costingHeadFlag === CBCTypeId) {
      dispatch(getClientSelectList(() => { }));
    }
  }

  /**
   * @method handleClient
   * @description called
   */
  const handleClient = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      setState(prev => ({ ...prev, client: newValue }));
    } else {
      setState(prev => ({ ...prev, client: [] }));
    }
  };

  /**
   * @method handlePlant
   * @description called
   */
  const handlePlant = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      setState(prev => ({ ...prev, Plant: newValue }));
    } else {
      setState(prev => ({ ...prev, Plant: [] }));
    }
  };

  /**
   * @method handleLoad
   * @description Load
   */
  const handleLoad = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      const { errorObj } = state;
      let obj = { ...errorObj };
      obj.load = false;
      setState(prev => ({
        ...prev,
        FullTruckCapacity: [],
        RateCriteria: [],
        Load: newValue,
        errorObj: obj
      }));
      setValueTableForm("Rate", '');
    } else {
      setState(prev => ({ ...prev, Load: [] }));
    }
  };
  /**
   * @method getDetails
   * @description Used to get Details
   */
  const getDetails = () => {
    const { data } = props;
    if (data && data.isEditFlag) {
      setState(prev => ({
        ...prev,
        isEditFlag: false,
        isLoader: true,
        FreightID: data.Id,
      }));
      let obj = {
        freightId: data.Id,
        EffectiveDate: null,
        PlantId: null,
        CustomerId: null,
        VendorId: null,
        CostingTypeId: null
      }
      dispatch(getFreightData(obj, (res) => {
        if (res && res.data && res.data.Result) {
          setState(prev => ({ ...prev, isLoader: false }));
          const Data = res.data.Data[0];
          setState(prev => ({ ...prev, DataToChange: Data, gridTable: Data?.FullTruckLoadDetails }));
          setValueMainForm('Plants', { label: Data.PlantName, value: Data.PlantId });
          setValueMainForm('EffectiveDate', DayTime(Data?.EffectiveDate).isValid() ? new Date(Data?.EffectiveDate) : '');
          setValueMainForm('vendorName', { label: Data.VendorName, value: Data.VendorId });
          setValueMainForm('ClientName', { label: Data.CustomerName, value: Data.CustomerId });


          setTimeout(() => {
            let modeObj = freightModeSelectList && freightModeSelectList.find((item) => item?.Value === Data.Mode);

            let GridArray = Data && Data.FullTruckLoadDetails.map((item) => {
              return {
                FullTruckLoadId: item?.FullTruckLoadId,
                FreightId: item?.FreightId,
                Capacity: item?.Capacity,
                RateCriteria: item?.RateCriteria,
                Rate: item?.Rate,
                DimensionsName: item?.DimensionsName,
                DimensionId: item?.DimensionId,
                IsShowDimesions: item?.IsShowDimesions,
                EFreightLoadType: item?.EFreightLoadType,
                FreightLoadType: item?.FreightLoadType,
                IsFreightAssociated: item?.IsFreightAssociated,
              };
            });
            setState(prev => ({
              ...prev,
              isEditFlag: true,
              isLoader: false,
              costingTypeId: Data.CostingTypeId,
              IsLoadingUnloadingApplicable: Data.IsLoadingUnloadingApplicable,
              TransportMode: modeObj && modeObj !== undefined
                ? { label: modeObj.Text, value: modeObj.Value }
                : [],
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorId } : [],
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              sourceLocation: Data.SourceCityName !== undefined ? { label: Data.SourceCityName, value: Data.SourceCityId } : [],
              destinationLocation: Data.DestinationCityName !== undefined ? { label: Data.DestinationCityName, value: Data.DestinationCityId } : [],
              Plant: { label: Data.PlantName, value: Data.PlantId },
              effectiveDate: DayTime(Data?.EffectiveDate).isValid() ? new Date(Data?.EffectiveDate) : ''
            }));
            setState(prev => ({ ...prev, isLoader: false }));
          }, 200);
        }
      }));
    } else {
      setState(prev => ({
        ...prev,
        isLoader: false
      }));
      // dispatch(getFreightData("", (res) => { }));
    }
  };

  /**
   * @method renderListing
   * @description Used to show type of listing
   */
  const renderListing = (label) => {
    const temp = [];
    if (label === "SourceLocation") {
      cityList &&
        cityList.map((item) => {
          if (item?.Value === "0") return false;
          temp.push({ label: item?.Text, value: item?.Value });
          return null
        });
      return temp;
    }
    if (label === "DestinationLocation") {
      cityList &&
        cityList.map((item) => {
          if (item?.Value === "0") return false;
          temp.push({ label: item?.Text, value: item?.Value });
          return null
        });
      return temp;
    }
    if (label === "FREIGHT_MODE") {
      freightModeSelectList &&
        freightModeSelectList.map((item) => {
          if (item?.Value === "0") return false;
          temp.push({ label: item?.Text, value: item?.Value });
          return null
        });
      return temp;
    }
    if (label === "FULL_TRUCK_CAPACITY") {
      freightFullTruckCapacitySelectList &&
        freightFullTruckCapacitySelectList.map((item) => {
          if (item?.Value === "0") return false;
          temp.push({ label: item?.Text, value: item?.Value });
          return null
        });
      return temp;
    }
    if (label === "FREIGHT_RATE_CRITERIA") {
      freightRateCriteriaSelectList &&
        freightRateCriteriaSelectList.map((item) => {
          if (item?.Value === "0") return false;
          temp.push({ label: item?.Text, value: item?.Value });
          return null
        });
      return temp;
    }
    if (label === 'ClientList') {
      clientSelectList && clientSelectList.map(item => {
        if (item?.Value === '0') return false;
        temp.push({ label: item?.Text, value: item?.Value })
        return null;
      });
      return temp;
    }
    if (label === 'Plant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item?.PlantId === '0') return false
        temp.push({ label: item?.PlantNameCode, value: item?.PlantId })
        return null
      })
      return temp
    }
    if (label === 'Load') {
      FREIGHT_LOAD_OPTIONS && FREIGHT_LOAD_OPTIONS.map((item) => {
        temp.push({ label: item?.label, value: item?.value })
        return null
      })
      return temp
    }
    if (label === 'TruckDimensions') {
      truckDimensionsSelectList && truckDimensionsSelectList.map((item) => {
        if (item?.Value === '--0--') return false
        temp.push({ label: item?.Text, value: item?.Value, isEditDimension: !item.IsAssociated });
        return null;
      });
      return temp;
    }
  };
  /**
   * @method handleVendorName
   * @description called
   */
  const handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      setState(prev => ({ ...prev, vendorName: newValue, isVendorNameNotSelected: false }));
    } else {
      setState(prev => ({ ...prev, vendorName: [] }));
    }
  };

  const vendorToggler = () => {
    setState(prev => ({ ...prev, isOpenVendor: true }));
  };
  const closeVendorDrawer = async (e = '', formData = {}, type) => {
    if (type === 'submit') {
      setState(prev => ({ ...prev, isOpenVendor: false }));
      const res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, state.vendorName);
      let vendorDataAPI = res?.data?.SelectList;
      reactLocalStorage?.setObject('vendorData', vendorDataAPI);
      if (Object.keys(formData).length > 0) {
        setState(prev => ({
          ...prev,
          vendorName: {
            label: `${formData.VendorName} (${formData.VendorCode})`,
            value: formData.VendorId
          }
        }));
      }
    }
    else {
      setState(prev => ({ ...prev, isOpenVendor: false }));
    }
  };
  /**
   * @method handleSourceCity
   * @description called
   */
  const handleSourceCity = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      setState(prev => ({ ...prev, sourceLocation: newValue }));
    } else {
      setState(prev => ({ ...prev, sourceLocation: [] }));
    }
  };

  /**
   * @method handleDestinationCity  
   * @description called
   */
  const handleDestinationCity = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      setState(prev => ({ ...prev, destinationLocation: newValue }));
    } else {
      setState(prev => ({ ...prev, destinationLocation: [] }));
    }
  };

  /**
   * @method onPressLoadUnload
   * @description USED FOR LOAD UNLOAD CHECKED
   */
  const onPressLoadUnload = () => {
    setState(prev => ({
      ...prev,
      IsLoadingUnloadingApplicable: !prev.IsLoadingUnloadingApplicable
    }));
  };

  /**
   * @method handleCapacity
   * @description called
   */
  const handleCapacity = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      setState(prev => ({ ...prev, FullTruckCapacity: newValue }));
    } else {
      setState(prev => ({ ...prev, FullTruckCapacity: [] }));
    }
    setState(prev => ({ ...prev, HandleChanged: false }));
  };

  /**
   * @method criteriaHandler
   * @description called
   */
  const criteriaHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      setState(prev => ({ ...prev, RateCriteria: newValue }));
    } else {
      setState(prev => ({ ...prev, RateCriteria: [] }));
    }
    setState(prev => ({ ...prev, HandleChanged: false }));
  };

  const rateChange = (newValue) => {
    setState(prev => {
      const obj = { ...prev.errorObj };
      if (decimalNumberLimit6(newValue?.target?.value) !== undefined || checkWhiteSpaces(newValue?.target?.value) !== undefined || number(newValue?.target?.value) !== undefined) {
        obj.rate = true;
      } else {
        obj.rate = false;
      }
      return { ...prev, errorObj: obj };
    });
  };

  /**
   * @method handleChange
   * @description Handle Effective Date
   */
  const handleEffectiveDateChange = (date) => {
    setState(prev => ({
      ...prev,
      effectiveDate: date,
      showEffectiveDateError: false
    }));
  };


  const gridHandler = () => {
    const { FullTruckCapacity, RateCriteria, gridTable, Load, truckDimensions, isShowTruckDimensions } = state;
    const Rate = getValuesTableForm("Rate");
    if (errorsTableForm && Object.keys(errorsTableForm)?.length > 0) {
      return false;
    }

    // Check for duplicate entry
    const isDuplicate = checkDuplicateEntry(FullTruckCapacity, RateCriteria, Load, truckDimensions, gridTable);
    if (isDuplicate) {
      Toaster.warning("This freight entry already exists.");
      return false;
    }

    const newGridItem = {
      FullTruckLoadId: "",
      Capacity: FullTruckCapacity?.label,
      RateCriteria: RateCriteria?.label,
      Rate: checkForNull(Rate) || 0,
      FreightLoadType: Load?.label,
      EFreightLoadType: Load?.value,
      IsFreightAssociated: false,
      DimensionsName: truckDimensions?.label,
      DimensionId: truckDimensions?.value,
      IsShowDimesions: isShowTruckDimensions
    };

    setState(prev => ({
      ...prev,
      gridTable: [...prev?.gridTable, newGridItem],
      AddUpdate: false
    }));

    resetFormFields();
  };
  /**
   * @method updateGrid
   * @description Used to handle update grid
   */
  const updateGrid = () => {
    const { FullTruckCapacity, RateCriteria, gridTable, gridEditIndex, Load, truckDimensions, isShowTruckDimensions } = state;
    const Rate = getValuesTableForm("Rate");

    if (!Rate || Number(Rate) === 0) {
      return false;
    }
    if (errorsTableForm && Object.keys(errorsTableForm)?.length > 0) {
      return false;
    }
    // Filter out edited item to check duplicates
    const otherItems = gridTable.filter((_, i) => i !== gridEditIndex);
    const isDuplicate = checkDuplicateEntry(FullTruckCapacity, RateCriteria, Load, truckDimensions, otherItems);
    if (isDuplicate) {
      Toaster.warning("This freight entry already exists.");
      return false;
    }

    const updatedItem = {
      ...gridTable[gridEditIndex],
      Capacity: FullTruckCapacity?.label,
      RateCriteria: RateCriteria?.label,
      Rate: checkForNull(Rate) || 0,
      FreightLoadType: Load?.label,
      EFreightLoadType: Load?.value,
      DimensionsName: isShowTruckDimensions ? truckDimensions?.label : null,
      DimensionId: isShowTruckDimensions ? truckDimensions?.value : null,
      IsShowDimesions: isShowTruckDimensions
    };

    const updatedGrid = [...gridTable];
    updatedGrid[gridEditIndex] = updatedItem;

    setState(prev => ({
      ...prev,
      gridTable: updatedGrid ?? [],
      gridEditIndex: "",
      isEditIndex: false,
      AddUpdate: false
    }));

    resetFormFields();
  };

  /**
   * @method resetFormFields
   * @description Reset form fields and errors
   */
  const resetFormFields = () => {
    // Reset form state
    setState(prev => ({
      ...prev,
      FullTruckCapacity: [],
      RateCriteria: [],
      Load: [],
      errorObj: {
        capacity: false,
        criteria: false,
        rate: false,
        load: false
      },
      truckDimensions: [],
      isEditIndex: false, // Reset edit mode
      gridEditIndex: "", // Clear edit index
      AddUpdate: false, // Reset update flag
      isShowTruckDimensions: false
    }));

    // Reset form values
    setValueTableForm("Rate", "");

    // Reset specific form fields and errors, preserving effective date
    // const currentValues = getValuesTableForm();
    resetTableForm({
      Rate: "",
      FullTruckCapacity: "",
      RateCriteria: "",
      Load: "",
      // EffectiveDate: currentValues.EffectiveDate // Preserve effective date
    });
  };

  /**
   * @method checkDuplicateEntry
   * @description Check for duplicate entries in grid
   */
  const checkDuplicateEntry = (capacity, criteria, load, truckDimensions, grid) => {
    return grid?.some(el => el?.Capacity === capacity?.value &&
      el?.RateCriteria === criteria?.value &&
      el?.EFreightLoadType === load?.value &&
      el?.DimensionsName === truckDimensions?.label &&
      el?.DimensionId === truckDimensions?.value
    );
  };
  /**
   * @method editGridItemDetails
   * @description Edit grid data
   */
  const editGridItemDetails = React.useCallback((index) => {
    const item = state.gridTable[index];
    setState(prev => ({
      ...prev,
      gridEditIndex: index,
      isEditIndex: true,
      FullTruckCapacity: {
        label: item?.Capacity,
        value: item?.Capacity,
      },
      RateCriteria: {
        label: item?.RateCriteria,
        value: item?.RateCriteria,
      },
      Load: {
        label: item?.FreightLoadType,
        value: item?.EFreightLoadType
      },
      truckDimensions: {
        label: item?.DimensionsName,
        value: item?.DimensionId
      },
      isShowTruckDimensions: item?.IsShowDimesions
    }));

    // Reset form values first
    resetTableForm({
      Rate: "",
      FullTruckCapacity: "",
      RateCriteria: "",
      Load: ""
    });

    // Set new values in a batch to avoid synthetic event reuse
    setTimeout(() => {
      setValueTableForm("Rate", item.Rate);
      setValueTableForm("Capacity", {
        label: item?.Capacity,
        value: item?.Capacity
      });
      setValueTableForm("RateCriteria", {
        label: item?.RateCriteria,
        value: item?.RateCriteria
      });
      setValueTableForm("Load", {
        label: item?.FreightLoadType,
        value: item?.EFreightLoadType
      });
      setValueTableForm("TruckDimensions", {
        label: item?.DimensionsName,
        value: item?.DimensionId
      });
    }, 0);
  }, [state.gridTable, setState, resetTableForm, setValueTableForm]);

  /**
   * @method deleteGridItem
   * @description Delete grid item
   */
  const deleteGridItem = (index) => {
    setState(prev => ({
      ...prev,
      gridTable: prev.gridTable.filter((_, i) => i !== index),
      deleteChanged: false
    }));
    resetFormFields();
  };

  /**
   * @method cancel
   * @description used to Reset form
   */
  const cancel = (type) => {
    resetMainForm();
    setState(prev => ({
      ...prev,
      isVendor: false,
      isOpenVendor: false,
      vendorName: [],
      sourceLocation: [],
      destinationLocation: []
    }));
    props.hideForm(type);
  };

  const cancelHandler = () => {
    if (state.isViewMode) {
      cancel('cancel');
    } else {
      setState(prev => ({ ...prev, showPopup: true }));
    }
  };

  const onPopupConfirm = () => {
    cancel('cancel');
    setState(prev => ({ ...prev, showPopup: false }));
  };

  const closePopUp = () => {
    setState(prev => ({ ...prev, showPopup: false }));
  };
  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = debounce(handleSubmitMainForm((values) => {
    const { vendorName, IsLoadingUnloadingApplicable, sourceLocation, destinationLocation, client,
      FreightID, gridTable, isEditFlag, DataToChange, HandleChanged, AddUpdate, DeleteChanged, costingTypeId } = state;

    const formValues = getValuesMainForm();
    if (state.effectiveDate === '' || !state.effectiveDate) {
      setState(prev => ({ ...prev, showEffectiveDateError: true }));
      return false;
    }

    if (checkForNull(state?.gridTable?.length) === 0) {
      Toaster.warning("Please add at least one data in Load Section.");
      return false;
    }

    if (costingTypeId === VBCTypeId && vendorName.length <= 0) {
      setState(prev => ({ ...prev, isVendorNameNotSelected: true }));
      return false;
    }

    setState(prev => ({ ...prev, isVendorNameNotSelected: false }));

    const userDetail = userDetails();

    if (isEditFlag) {
      if (
        DataToChange.LoadingUnloadingCharges === formValues.LoadingUnloadingCharges &&
        DataToChange.PartTruckLoadRatePerCubicFeet === formValues.PartTruckLoadRatePerCubicFeet &&
        DataToChange.PartTruckLoadRatePerKilogram === formValues.PartTruckLoadRatePerKilogram &&
        (AddUpdate && HandleChanged) &&
        DeleteChanged
      ) {
        cancel('cancel');
        return false;
      }

      const requestData = {
        FreightId: FreightID,
        IsLoadingUnloadingApplicable: IsLoadingUnloadingApplicable,
        LoadingUnloadingCharges: formValues.LoadingUnloadingCharges,
        PartTruckLoadRatePerKilogram: formValues.PartTruckLoadRatePerKilogram,
        PartTruckLoadRatePerCubicFeet: formValues.PartTruckLoadRatePerCubicFeet,
        FullTruckLoadDetails: gridTable,
        LoggedInUserId: loggedInUserId(),
        PlantId: state.Plant?.value,
        CostingTypeId: costingTypeId,
        Mode: "Road",
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        EffectiveDate: state.effectiveDate,
      };

      dispatch(updateFright(requestData, (res) => {
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_FREIGHT_SUCCESSFULLY);
          cancel('submit');
        }
      }));

      setState(prev => ({
        ...prev,
        HandleChanged: true,
        AddUpdate: true,
        DeleteChanged: true
      }));

    } else {
      const formData = {
        CostingTypeId: costingTypeId,
        Mode: "Road",
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        SourceCityId: sourceLocation.value,
        DestinationCityId: destinationLocation.value,
        IsLoadingUnloadingApplicable: IsLoadingUnloadingApplicable,
        LoadingUnloadingCharges: formValues.LoadingUnloadingCharges,
        PartTruckLoadRatePerKilogram: formValues.PartTruckLoadRatePerKilogram,
        PartTruckLoadRatePerCubicFeet: formValues.PartTruckLoadRatePerCubicFeet,
        FullTruckLoadDetails: gridTable,
        LoggedInUserId: loggedInUserId(),
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        EffectiveDate: DayTime(state.effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        PlantId: state.Plant?.value,
      };

      dispatch(createFreight(formData, (res) => {
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.ADD_FREIGHT_SUCCESSFULLY);
          cancel('submit');
        }
      }));
    }
  }), 500);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  /**
   * @method render
   * @description Renders the component
   */

  const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;

  const { isOpenVendor, isEditFlag, isViewMode, setDisable, costingTypeId, isEditMode } = state;
  const filterList = async (inputValue) => {
    if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
      inputValue = inputValue.trim();
    }
    const resultInput = inputValue.slice(0, searchCount)
    if (inputValue?.length >= searchCount && state.vendorFilterList !== resultInput) {
      setState(prev => ({ ...prev, inputLoader: true }));
      let res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput);
      setState(prev => ({
        ...prev,
        inputLoader: false,
        vendorFilterList: resultInput
      }));
      let vendorDataAPI = res?.data?.SelectList;
      if (inputValue) {
        return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true);
      } else {
        return vendorDataAPI;
      }
    }
    else {
      if (inputValue?.length < searchCount) return false;
      else {
        let VendorData = reactLocalStorage?.getObject('Data');
        if (inputValue) {
          return autoCompleteDropdown(inputValue, VendorData, false, [], false);
        } else {
          return VendorData;
        }
      }
    }
  };
  const handleTruckDimensions = (e) => {
    setState(prev => ({ ...prev, truckDimensions: e, hideEditDimension: !e.isEditDimension }));
  };
  const dimensionToggler = (isEditMode) => {
    setState(prev => ({ ...prev, openDimensionDrawer: true, isEditDimension: isEditMode }));
  };
  const closeDimensionDrawer = (type, formData) => {
    if (type === 'Save') {
      setState(prev => ({ ...prev, isEditDimension: true, truckDimensions: { label: `L(${formData?.Length}) B(${formData?.Breadth}) H(${formData?.Height})`, value: formData?.Id }, hideEditDimension: false }));
      setValueTableForm("TruckDimensions", { label: `L(${formData?.Length}) B(${formData?.Breadth}) H(${formData?.Height})`, value: formData?.Id });
      dispatch(getTruckDimensionsSelectList(() => { }));
    }
    setState(prev => ({ ...prev, openDimensionDrawer: false }));
  };
  const onShowTruckDimensions = () => {
    setState(prev => ({ ...prev, isShowTruckDimensions: !prev.isShowTruckDimensions }));
  };

  return (
    <>
      {state.isLoader && <LoaderCustom />}
      <div className="container-fluid">
        <div>
          <div className="login-container signup-form">
            <div className="row">
              <div className="col-md-12">
                <div className="shadow-lgg login-formg">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-heading mb-0">
                        <h1>
                          {isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Freight
                        </h1>
                      </div>
                    </div>
                  </div>
                  <form
                    noValidate
                    className="form"
                    onKeyDown={(e) => { handleKeyDown(e, onSubmit); }}
                  >
                    <div className="add-min-height">
                      <Row>
                        <Col md="12">
                          {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                            <input
                              type="radio"
                              name="costingHead"
                              checked={costingTypeId === ZBCTypeId}
                              onClick={() => onPressVendor(ZBCTypeId)}
                              disabled={isEditFlag}
                            />{" "}
                            <span>Zero Based</span>
                          </Label>}
                          {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                            <input
                              type="radio"
                              name="costingHead"
                              checked={costingTypeId === VBCTypeId}
                              onClick={() => onPressVendor(VBCTypeId)}
                              disabled={isEditFlag}
                            />{" "}
                            <span>{VendorLabel} Based</span>
                          </Label>}
                          {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                            <input
                              type="radio"
                              name="costingHead"
                              checked={costingTypeId === CBCTypeId}
                              onClick={() => onPressVendor(CBCTypeId)}
                              disabled={isEditFlag}
                            />{" "}
                            <span>Customer Based</span>
                          </Label>}
                        </Col>
                      </Row>
                      <Row>
                        <Col md="12">
                          <div className="left-border">{"Freight:"}</div>
                        </Col>
                        {costingTypeId === VBCTypeId && (
                          <Col className="col-md-15">
                            <label>{VendorLabel} (Code)<span className="asterisk-required">*</span></label>
                            <div className="d-flex justify-space-between align-items-center async-select">
                              <div className="fullinput-icon p-relative">
                                {state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                <AsyncSelect
                                  name="vendorName"
                                  loadOptions={filterList}
                                  onChange={(e) => handleVendorName(e)}
                                  value={state.vendorName}
                                  noOptionsMessage={({ inputValue }) => inputValue?.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                  isDisabled={isEditFlag || isViewMode}
                                  onKeyDown={(onKeyDown) => {
                                    if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                  }}
                                  onBlur={() => setState(prevState => ({ ...prevState, showErrorOnFocus: false }))}
                                />
                              </div>
                              {!isEditFlag && (
                                <Button
                                  id="addFreight_vendorToggle"
                                  onClick={vendorToggler}
                                  className={"right mt-0"}
                                  variant="plus-icon-square"
                                />
                              )}
                            </div>
                            {((state.showErrorOnFocus && state.vendorName.length === 0) || state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                          </Col>
                        )}
                        {costingTypeId === CBCTypeId && (
                          <Col className="col-md-15">
                            <SearchableSelectHookForm
                              name="clientName"
                              label={"Customer (Code)"}
                              Controller={Controller}
                              control={controlMainForm}
                              register={registerMainForm}
                              mandatory={true}
                              rules={{ required: true }}
                              placeholder={isEditFlag ? '-' : "Select"}
                              options={renderListing("ClientList")}
                              defaultValue={state.client}
                              handleChange={handleClient}
                              disabled={isEditFlag}
                              errors={errorsMainForm?.clientName}
                            />
                          </Col>
                        )}
                        <Col className="col-md-15">
                          <SearchableSelectHookForm
                            label={'Plant (Code)'}
                            name="Plants"
                            Controller={Controller}
                            control={controlMainForm}
                            register={registerMainForm}
                            mandatory={true}
                            rules={{ required: true }}
                            placeholder={'Select'}
                            options={renderListing("Plant")}
                            defaultValue={state.Plant}
                            handleChange={handlePlant}
                            disabled={isEditFlag || isViewMode}
                            errors={errorsMainForm?.Plants}
                          />
                        </Col>
                        <Col className="col-md-15">
                          <div className="inputbox date-section">
                            <DatePickerHookForm
                              name="EffectiveDate"
                              label="Effective Date"
                              rules={{ required: true }}
                              selected={DayTime(state.effectiveDate).isValid() ? new Date(state.effectiveDate) : ''}
                              Controller={Controller}
                              control={controlMainForm}
                              register={registerMainForm}
                              placeholder="Select date"
                              showMonthDropdown
                              showYearDropdown
                              dateFormat="dd/MM/yyyy"
                              dropdownMode="select"
                              customClassName="withBorder"
                              className="withBorder"
                              autoComplete="off"
                              disabledKeyboardNavigation
                              disabled={isViewMode || isEditMode}
                              mandatory={true}
                              errors={errorsMainForm?.EffectiveDate}
                              minDate={getEffectiveDateMinDate()}
                              maxDate={getEffectiveDateMaxDate()}
                              handleChange={handleEffectiveDateChange}
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row className={'mt-3'}>
                        <form>
                          <Row>
                            <Col md="12">
                              <div className="left-border">
                                {"Load:"}
                              </div>
                            </Col>
                            <Col md="2">
                              <SearchableSelectHookForm
                                name="Load"
                                label="Load"
                                Controller={Controller}
                                control={controlTableForm}
                                register={registerTableForm}
                                mandatory={true}
                                rules={{ required: true }}
                                placeholder={isViewMode ? '-' : 'Select'}
                                options={renderListing("Load")}
                                handleChange={handleLoad}
                                value={state?.Load}
                                defaultValue={state.Load}
                                disabled={isViewMode || state.disableAll}
                                errors={errorsTableForm?.Load}
                              />
                            </Col>

                            <Col md='2' className='mt-2'>
                              <label id="AddFreight_TruckDimensions"
                                className={`custom-checkbox w-auto mb-0 mt-4 `}
                                onChange={onShowTruckDimensions}
                              >
                                Enable Truck Dimensions
                                <input
                                  type="checkbox"
                                  checked={state.isShowTruckDimensions}
                                  disabled={isViewMode || state.disableAll}
                                />
                                <span
                                  className=" before-box p-0"
                                  checked={state.isShowTruckDimensions}
                                  onChange={onShowTruckDimensions}
                                />
                              </label>
                            </Col>
                            {state.isShowTruckDimensions && <Col md="2">
                              <div className="d-flex justify-space-between inputwith-icon form-group">
                                <SearchableSelectHookForm
                                  name="TruckDimensions"
                                  label="Truck Dimensions (mm)"
                                  Controller={Controller}
                                  control={controlTableForm}
                                  register={registerTableForm}
                                  mandatory={true}
                                  rules={{ required: true }}
                                  placeholder={'Select'}
                                  options={renderListing("TruckDimensions")}
                                  handleChange={handleTruckDimensions}
                                  defaultValue={state?.truckDimensions}
                                  disabled={isViewMode || state.disableAll}
                                  errors={errorsTableForm?.TruckDimensions}
                                  title={state?.truckDimensions && state?.truckDimensions?.label}
                                />
                                <div className='action-icon-container'>
                                  <div
                                    onClick={() => dimensionToggler(false)}
                                    className={"plus-icon-square mt-0 right"}
                                  ></div>
                                  <button
                                    type="button"
                                    onClick={() => dimensionToggler(true)}
                                    className={'user-btn'}
                                    disabled={state.hideEditDimension || isViewMode || state.disableAll}
                                  >
                                    <div className={"edit_pencil_icon right"}></div>
                                  </button>
                                </div>
                              </div>
                            </Col>}
                            {(state.Load?.value === FullTruckLoad || state.isShowTruckDimensions) && <Col md="2">
                              <SearchableSelectHookForm
                                name="Capacity"
                                label="Capacity"
                                Controller={Controller}
                                control={controlTableForm}
                                register={registerTableForm}
                                mandatory={true}
                                rules={{ required: true }}
                                placeholder={isViewMode ? '-' : 'Select'}
                                options={renderListing(
                                  "FULL_TRUCK_CAPACITY"
                                )}
                                handleChange={handleCapacity}
                                value={state.FullTruckCapacity}
                                disabled={isViewMode || state.disableAll}
                                errors={errorsTableForm?.Capacity}
                              />
                            </Col>}
                            <Col md="2">
                              <SearchableSelectHookForm
                                name="RateCriteria"
                                label="Criteria"
                                Controller={Controller}
                                control={controlTableForm}
                                register={registerTableForm}
                                mandatory={true}
                                rules={{ required: true }}
                                placeholder={isViewMode ? '-' : 'Select'}
                                options={renderListing(
                                  "FREIGHT_RATE_CRITERIA"
                                )}
                                disabled={isViewMode || state.disableAll}
                                handleChange={criteriaHandler}
                                value={state.RateCriteria}
                                errors={errorsTableForm?.RateCriteria}
                              />
                            </Col>
                            <Col md="2">
                              <TextFieldHookForm
                                label={`Rate (${reactLocalStorage.getObject("baseCurrency")})`}
                                name={"Rate"}
                                placeholder={isViewMode ? '-' : 'Enter'}
                                rules={{
                                  required: true,
                                  validate: { number, decimalNumberLimit6, maxLength10 },
                                }}
                                defaultValue={''}
                                Controller={Controller}
                                control={controlTableForm}
                                register={registerTableForm}
                                mandatory={true}
                                disabled={isViewMode || state.disableAll}
                                className=" "
                                customClassName=" withBorder"
                                handleChange={rateChange}
                                errors={errorsTableForm?.Rate}
                              />
                              {state.errorObj.rate && (!getValuesTableForm("Rate") || Number(getValuesTableForm("Rate")) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                            </Col>
                            <Col md="2">
                              <div className={`${state.isShowTruckDimensions ? "" : "pt-2"}`}>
                                {state.isEditIndex ? (
                                  <>
                                    <button
                                      type="button"
                                      className={`btn btn-primary ${state.isShowTruckDimensions ? "" : "mt30"} pull-left mr5 px-2 mb-2`}
                                      onClick={handleSubmitTableForm(updateGrid)}
                                    >
                                      Update
                                    </button>
                                    <button
                                      type="button"
                                      className={`reset-btn ${state.isShowTruckDimensions ? "" : "mt30"} pull-left mb-2 w-auto px-1`}
                                      onClick={resetFormFields}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="submit"
                                      disabled={isViewMode || state.disableAll}
                                      className={`user-btn ${state.isShowTruckDimensions ? "" : "mt30"} pull-left`}
                                      onClick={handleSubmitTableForm(gridHandler)}
                                    >
                                      <div className={"plus"}></div>
                                      ADD
                                    </button>
                                    <button
                                      type="button"
                                      className={`reset-btn ${state.isShowTruckDimensions ? "" : "mt30"} ml5 pull-left`}
                                      onClick={resetFormFields}
                                      disabled={isViewMode || state.disableAll}
                                    >
                                      Reset
                                    </button>
                                  </>
                                )}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col md="12 mt-3">
                              <Table className="table border" size="sm">
                                <thead>
                                  <tr>
                                    <th>{`Load`}</th>
                                    <th>{`Truck Dimensions`}</th>
                                    <th>{`Capacity`}</th>
                                    <th>{`Criteria`}</th>
                                    <th>{`Rate`}</th>
                                    <th>{`Action`}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {state.gridTable?.length > 0 &&
                                    state.gridTable?.map((item, index) => {
                                      return (
                                        <tr key={index}>
                                          <td>{item?.FreightLoadType ?? '-'}</td>
                                          <td>{item?.IsShowDimesions === true ? item?.DimensionsName : '-'}</td>
                                          <td>{item?.Capacity ?? '-'}</td>
                                          <td>{item?.RateCriteria ?? '-'}</td>
                                          <td>{item?.Rate ? checkForDecimalAndNull(item?.Rate, getConfigurationKey()?.NoOfDecimalForPrice) : '-'}</td>
                                          <td>
                                            <button className="Edit mr-2" type={"button"} disabled={isViewMode || item?.IsFreightAssociated} onClick={() => editGridItemDetails(index)} />
                                            <button className="Delete" type={"button"} disabled={isViewMode || item?.IsFreightAssociated} onClick={() => deleteGridItem(index)} />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                                {state.gridTable?.length === 0 && <tbody className="border">
                                  <tr>
                                    <td colSpan={"5"}> <NoContentFound title={EMPTY_DATA} /></td>
                                  </tr>
                                </tbody>}
                              </Table>
                            </Col>
                          </Row>
                        </form>
                      </Row>
                    </div>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                      <div className="col-sm-12 text-right bluefooter-butn">
                        <button
                          type={"button"}
                          className="mr15 cancel-btn"
                          onClick={cancelHandler}
                          disabled={setDisable}
                        >
                          <div className={"cancel-icon"}></div>
                          {"Cancel"}
                        </button>
                        {!isViewMode && <button
                          type="submit"
                          disabled={isViewMode || setDisable}
                          className="user-btn mr5 save-btn"
                          onClick={handleSubmitMainForm(onSubmit)}
                        >
                          <div className={"save-icon"}></div>
                          {isEditFlag ? "Update" : "Save"}
                        </button>}
                      </div>
                    </Row>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {
          state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
        }
        {
          state.openDimensionDrawer && <DimensionsFieldsRenderer
            cancelHandler={closeDimensionDrawer}
            isOpen={state.openDimensionDrawer}
            truckDimensionId={state.truckDimensions?.value}
            isEditDimension={state.isEditDimension}
          />
        }
        {isOpenVendor && (
          <AddVendorDrawer
            isOpen={isOpenVendor}
            closeDrawer={closeVendorDrawer}
            isEditFlag={false}
            ID={""}
            anchor={"right"}
          />
        )}
      </div>
    </>
  );
}
export default AddFreight;
