import React, { useState, useEffect, } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import { TextFieldHookForm, SearchableSelectHookForm, NumberFieldHookForm, AsyncSearchableSelectHookForm, } from '../../layout/HookFormInputs';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddPlantDrawer from './AddPlantDrawer';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import AddVendorDrawer from './AddVendorDrawer';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull, checkPermission, checkVendorPlantConfigurable, getConfigurationKey, getTechnologyPermission, loggedInUserId, userDetails } from '../../../helper';
import moment from 'moment';
import CostingDetailStepTwo from './CostingDetailStepTwo';
import { APPROVED, DRAFT, EMPTY_GUID, PENDING, REJECTED, VBC, WAITING_FOR_APPROVAL, ZBC, EMPTY_GUID_0, COSTING, APPROVED_BY_SIMULATION } from '../../../config/constants';
import {
  getAllPartSelectList, getPartInfo, checkPartWithTechnology, createZBCCosting, createVBCCosting, getZBCExistingCosting, getVBCExistingCosting,
  updateZBCSOBDetail, updateVBCSOBDetail, storePartNumber, getZBCCostingByCostingId, deleteDraftCosting, getPartSelectListByTechnology,
  setOverheadProfitData, setComponentOverheadItemData, setPackageAndFreightData, setComponentPackageFreightItemData, setToolTabData,
  setComponentToolItemData, setComponentDiscountOtherItemData, gridDataAdded, getCostingSpecificTechnology,
} from '../actions/Costing'
import CopyCosting from './Drawers/CopyCosting'
import ConfirmComponent from '../../../helper/ConfirmComponent';
import { MESSAGES } from '../../../config/message';
import BOMUpload from '../../massUpload/BOMUpload';

import Clientbasedcostingdrawer from './ClientBasedCostingDrawer';
import TooltipCustom from '../../common/Tooltip';

export const ViewCostingContext = React.createContext()

function IsolateReRender(control) {
  const values = useWatch({
    control,
    name: ['zbcPlantGridFields', 'vbcGridFields', 'Technology'],
  })

  return values;
}

function CostingDetails(props) {
  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [technology, setTechnology] = useState([]);
  const [IsTechnologySelected, setIsTechnologySelected] = useState(false);
  const [part, setPart] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [IsOpenVendorSOBDetails, setIsOpenVendorSOBDetails] = useState(false);
  const [isZBCSOBEnabled, setZBCEnableSOBField] = useState(true);
  const [isVBCSOBEnabled, setVBCEnableSOBField] = useState(true);

  const [IsPlantDrawerOpen, setIsPlantDrawerOpen] = useState(false);
  const [zbcPlantGrid, setZBCPlantGrid] = useState([]);
  const [zbcPlantOldArray, setzbcPlantOldArray] = useState([]);
  const [editRow, setEditRow] = useState({});

  const [IsVendorDrawerOpen, setIsVendorDrawerOpen] = useState(false);
  const [vbcVendorGrid, setVBCVendorGrid] = useState([]);
  const [vbcVendorOldArray, setvbcVendorOldArray] = useState([]);

  const [stepOne, setStepOne] = useState(Object.keys(props.costingData).length > 0 ? false : true);
  const [stepTwo, setStepTwo] = useState(Object.keys(props.costingData).length > 0 ? true : false);
  const [IsShowNextBtn, setShowNextBtn] = useState(false);
  const [partInfoStepTwo, setPartInfo] = useState({});
  const [costingData, setCostingData] = useState({});

  const [IsBulkOpen, SetIsBulkOpen] = useState(false)

  // FOR COPY COSTING
  const [copyCostingData, setCopyCostingData] = useState({})
  const [type, setType] = useState('')
  const [isCopyCostingDrawer, setIsCopyCostingDrawer] = useState(false)
  const [costingIdForCopy, setCostingIdForCopy] = useState({})

  //ROLE AND PERMISSION
  const [ViewAccessibility, setViewAccessibility] = useState(true)
  const [AddAccessibility, setAddAccessibility] = useState(true)
  const [EditAccessibility, setEditAccessibility] = useState(true)
  const [DeleteAccessibility, setDeleteAccessibility] = useState(true)
  const [CopyAccessibility, setCopyAccessibility] = useState(true)
  const [SOBAccessibility, setSOBAccessibility] = useState(true)


  //FOR VIEW MODE COSTING
  const [IsCostingViewMode, setIsCostingViewMode] = useState(false)

  // client based costing
  const [clientDrawer, setClientDrawer] = useState(false)
  // client based costing
  const [partDropdown, setPartDropdown] = useState([])

  const fieldValues = IsolateReRender(control);

  const dispatch = useDispatch()

  const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
  const partInfo = useSelector((state) => state.costing.partInfo)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const partSelectListByTechnology = useSelector(state => state.costing.partSelectListByTechnology)
  const partNumber = useSelector(state => state.costing.partNo);
  const { topAndLeftMenuData } = useSelector(state => state.auth);

  useEffect(() => {
    setValue('Technology', '')
    setValue('Part', '')
    reset()
    applyPermission(topAndLeftMenuData, technology.label)
    dispatch(storePartNumber(''))
    dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
    dispatch(getPartSelectListByTechnology('', () => { }))
    dispatch(getAllPartSelectList(() => { }))
    dispatch(getPartInfo('', () => { }))
    dispatch(gridDataAdded(false))
  }, [])

  useEffect(() => {
    applyPermission(topAndLeftMenuData, technology.label)
  }, [topAndLeftMenuData, technology])

  /**
  * @method applyPermission
  * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
  */
  const applyPermission = (topAndLeftMenuData, selectedTechnology) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === COSTING);
      const accessData = Data && Data.Pages.find(el => el.PageName === getTechnologyPermission(selectedTechnology))
      const permmisionData = accessData?.Actions && checkPermission(accessData.Actions)
      if (permmisionData !== undefined) {
        setViewAccessibility(permmisionData?.View ? permmisionData.View : false)
        setAddAccessibility(permmisionData?.Add ? permmisionData.Add : false)
        setEditAccessibility(permmisionData?.Edit ? permmisionData.Edit : false)
        setDeleteAccessibility(permmisionData?.Delete ? permmisionData.Delete : false)
        setCopyAccessibility(permmisionData?.Copy ? permmisionData.Copy : false)
        setSOBAccessibility(permmisionData?.SOB ? permmisionData.SOB : false)
      }
    }
  }

  useEffect(() => {
    setStepOne(Object.keys(props.costingData).length > 0 ? false : true);
    setStepTwo(Object.keys(props.costingData).length > 0 ? true : false);
  }, [props.costingData])

  useEffect(() => {
    if (partNumber.isChanged === false) {
      setStepOne(false)
      setStepTwo(true)
    }
  }, [partNumber.isChanged])

  useEffect(() => {
    if (Object.keys(partNumber).length > 0 && partNumber.technologyName) {
      applyPermission(topAndLeftMenuData, technology.label)
      setValue('Technology', { label: partNumber.technologyName, value: partNumber.technologyId })
      setPart({ label: partNumber.partNumber, value: partNumber.partId })
      setTimeout(() => {
        setTechnology({ label: partNumber.technologyName, value: partNumber.technologyId })
        setValue('Part', { label: partNumber.partNumber, value: partNumber.partId })
        setIsTechnologySelected(true)
        setShowNextBtn(true)

        dispatch(getPartSelectListByTechnology(partNumber.technologyId, res => { }))
        dispatch(
          getPartInfo(partNumber.partId, (res) => {
            let Data = res.data.Data
            setValue("PartName", Data.PartName)
            setValue('Description', Data.Description)
            setValue('ECNNumber', Data.ECNNumber)
            setValue('DrawingNumber', Data.DrawingNumber)
            setValue('RevisionNumber', Data.RevisionNumber)
            setValue('ShareOfBusiness', Data.Price)
            setEffectiveDate(moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')

          }),
        )
      }, 300);
    }
  }, [partNumber])

  useEffect(() => {
    if (Object.keys(technology).length > 0 && Object.keys(partNumber).length > 0) {
      nextToggle()
    }
  }, [technology])

  useEffect(() => {
    renderListing('PartList')
  }, [partSelectListByTechnology])

  /**
   * @method renderListing
   * @description Used show listing of unit of measurement
   */
  const renderListing = (label) => {
    const temp = []


    if (label === 'Technology') {
      technologySelectList && technologySelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'PartList') {
      partSelectListByTechnology && partSelectListByTechnology.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      setPartDropdown(temp)

      return temp
    }


  }

  /**
   * @method renderCostingOption
   * @description Used show listing of unit of measurement
   */
  const renderCostingOption = (options) => {
    const temp = []

    options && options.map((item) => {
      if (item.CostingId === '00000000-0000-0000-0000-000000000000')
        return false
      temp.push({ label: item.DisplayCostingNumber, value: item.CostingId })
      return null
    })
    return temp
  }

  /**
   * @method handleTechnologyChange
   * @description  USED TO HANDLE TECHNOLOGY CHANGE
   */
  const handleTechnologyChange = (newValue) => {
    if (newValue && newValue !== '') {
      dispatch(getPartInfo('', () => { }))
      dispatch(getPartSelectListByTechnology(newValue.value, () => { }))
      setTechnology(newValue)
      setPart([])
      setIsTechnologySelected(true)
      setZBCPlantGrid([])
      setVBCVendorGrid([])
      setIsOpenVendorSOBDetails(false)
      dispatch(getPartInfo('', () => { }))
      setEffectiveDate('')
      setShowNextBtn(false)
      applyPermission(topAndLeftMenuData, technology.label)
      reset({
        Part: '',
      })
    } else {
      setTechnology([])
      setIsTechnologySelected(false)
    }
  }

  /**
   * @method handlePartChange
   * @description  USED TO HANDLE PART CHANGE
   */
  const handlePartChange = (newValue) => {
    if (newValue && newValue !== '') {
      if (IsTechnologySelected) {
        const data = { TechnologyId: technology.value, PartId: newValue.value }
        dispatch(checkPartWithTechnology(data, (response) => {
          setPart(newValue)
          setZBCPlantGrid([])
          setVBCVendorGrid([])
          setIsOpenVendorSOBDetails(false)
          if (response.data.Result) {
            dispatch(getPartInfo(newValue.value, (res) => {
              let Data = res.data.Data
              setValue('PartName', Data?.PartName ? Data.PartName : '')
              setValue('Description', Data?.Description ? Data.Description : '')
              setValue('ECNNumber', Data?.ECNNumber ? Data.ECNNumber : '')
              setValue('DrawingNumber', Data?.DrawingNumber ? Data.DrawingNumber : '')
              setValue('RevisionNumber', Data?.RevisionNumber ? Data.RevisionNumber : '')
              setValue('ShareOfBusiness', Data?.Price ? Data.Price : '')
              setEffectiveDate(moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
              setShowNextBtn(true)
            }),
            )
          } else {
            dispatch(getPartInfo('', () => { }))
            setValue('PartName', '')
            setValue('Description', '')
            setValue('ECNNumber', '')
            setValue('DrawingNumber', '')
            setValue('RevisionNumber', '')
            setValue('ShareOfBusiness', '')
            setEffectiveDate('')
            setShowNextBtn(false)
          }
        }),
        )
      }
    } else {
      setPart([])
      dispatch(getPartInfo('', () => { }))
    }
  }

  /**
   * @method handleEffectiveDateChange
   * @description Handle Effective Date
   */
  const handleEffectiveDateChange = (date) => {
    setEffectiveDate(date)
  }

  // client based costing start 
  const toggleCLientCosting = () => {
    setClientDrawer(true)
  }

  const closeCLientCostingDrawer = () => {
    setClientDrawer(false)
  }
  // client based costing end


  /**
   * @method nextToggle
   * @description DISPLAY FORM ONCLICK NEXT BUTTON
   */
  const nextToggle = () => {
    if (Object.keys(technology).length > 0 && Object.keys(part).length > 0) {
      dispatch(getZBCExistingCosting(part.value, (res) => {
        if (res.data.Result) {
          let Data = res.data.DataList
          setZBCPlantGrid(Data)
          setzbcPlantOldArray(Data)
        }
      }))

      dispatch(getVBCExistingCosting(part.value, (res) => {
        if (res.data.Result) {
          let Data = res.data.DataList
          setVBCVendorGrid(Data)
          setvbcVendorOldArray(Data)
        }
      }))

      setIsOpenVendorSOBDetails(true)
    } else {
      toastr.warning('Please select Technology or Part.')
    }
  }

  /**
   * @method plantDrawerToggle
   * @description HANDLE ZBC PLANT DRAWER TOGGLE
   */
  const plantDrawerToggle = () => {
    setIsPlantDrawerOpen(true)
  }

  /**
   * @method closePlantDrawer
   * @description HIDE ZBC PLANT DRAWER
   */
  const closePlantDrawer = (e = '', plantData = {}) => {
    if (Object.keys(plantData).length > 0) {
      let tempArr = [...zbcPlantGrid, plantData]
      setTimeout(() => {
        setZBCPlantGrid(tempArr)
      }, 200)
    }
    setIsPlantDrawerOpen(false)
  }

  /**
   * @method handleZBCSOBChange
   * @description HANDLE ZBC SOB CHANGE
   */
  const handleZBCSOBChange = (event, index) => {

    let tempArray = []
    let tempData = zbcPlantGrid[index]

    if (!isNaN(event.target.value)) {
      tempData = {
        ...tempData,
        ShareOfBusinessPercent: parseInt(event.target.value),
        isSOBChanged: checkIsZBCSOBChanged(event, index),
      }
      tempArray = Object.assign([...zbcPlantGrid], { [index]: tempData })
      setZBCPlantGrid(tempArray)
      setEditRow({ EditIndex: index, type: ZBC })
    } else {
      warningMessageHandle('VALID_NUMBER_WARNING')
    }
  }

  /**
   * @method checkIsZBCSOBChanged
   * @description HANDLE ZBC SOB CHANGE
   */
  const checkIsZBCSOBChanged = (event, index) => {
    let tempOldObj = zbcPlantOldArray[index]

    if (index > zbcPlantOldArray.length - 1) {
      return false
    } else if (parseInt(event.target.value) === tempOldObj.ShareOfBusinessPercent) {
      return false
    } else if (parseInt(event.target.value) !== tempOldObj.ShareOfBusinessPercent) {
      return true
    }
  }

  /**
   * @method handleCostingChange
   * @description HANDLE COSTING CHANGE
   */
  const handleCostingChange = (newValue, type, index) => {
    let tempArray = []

    if (type === ZBC && newValue !== '') {
      let tempData = zbcPlantGrid[index]
      let selectedOptionObj = tempData.CostingOptions.find((el) => el.CostingId === newValue.value,)

      tempData = {
        ...tempData,
        SelectedCostingVersion: newValue,
        Status: selectedOptionObj.Status,
        DisplayStatus: selectedOptionObj.DisplayStatus,
        CostingId: newValue.value,
        Price: selectedOptionObj.Price,
      }
      tempArray = Object.assign([...zbcPlantGrid], { [index]: tempData })
      setZBCPlantGrid(tempArray)
      //setValue(`zbcPlantGridFields[${index}]ShareOfBusinessPercent`, selectedOptionObj.ShareOfBusinessPercent)
    }

    if (type === VBC && newValue !== '') {
      let tempData = vbcVendorGrid[index]
      let selectedOptionObj = tempData.CostingOptions.find((el) => el.CostingId === newValue.value,)

      tempData = {
        ...tempData,
        SelectedCostingVersion: newValue,
        Status: selectedOptionObj.Status,
        DisplayStatus: selectedOptionObj.DisplayStatus,
        CostingId: newValue.value,
        Price: selectedOptionObj.Price,
      }
      tempArray = Object.assign([...vbcVendorGrid], { [index]: tempData })
      setVBCVendorGrid(tempArray)
    }
  }

  /**
   * @method vendorDrawerToggle
   * @description HANDLE VBC VENDOR DRAWER TOGGLE
   */
  const vendorDrawerToggle = () => {
    setIsVendorDrawerOpen(true)
  }

  /**
   * @method closeVendorDrawer
   * @description HIDE VENDOR DRAWER
   */
  const closeVendorDrawer = (e = '', vendorData = {}) => {
    if (Object.keys(vendorData).length > 0) {
      //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
      const isExist = vbcVendorGrid.findIndex(el => (el.VendorId === vendorData.VendorId && el.DestinationPlantId === vendorData.DestinationPlantId))
      if (isExist !== -1) {
        toastr.warning('Already added, Please select another plant.')
        return false;
      }
      let tempArr = [...vbcVendorGrid, { ...vendorData, Status: '' }]
      setTimeout(() => {
        setVBCVendorGrid(tempArr)
      }, 200)
    }
    setIsVendorDrawerOpen(false)
  }

  /**
   * @method closeCopyCostingDrawer
   * @description HIDE COPY COSTING DRAWER
   */
  const closeCopyCostingDrawer = (e = '', costingId = '', type = '') => {
    nextToggle()
    setIsCopyCostingDrawer(false)
    dispatch(getZBCCostingByCostingId('', (res) => { }))
    console.log('res from after copy costig before if: ');
    if (type === ZBC) {
      setCostingData({ costingId: costingId, type })
      dispatch(getZBCCostingByCostingId(costingId, (res) => {
        setTimeout(() => {
          setStepTwo(true)
          setStepOne(false)
        }, 500)
      }))
    }

    if (type === VBC) {
      setCostingData({ costingId: costingId, type })
      dispatch(getZBCCostingByCostingId(costingId, (res) => {
        console.log('res from after copy costig: ', res);
        setTimeout(() => {
          setStepTwo(true)
          setStepOne(false)
        }, 500)
      }))
    }
    // resetGrid()
  }

  /**
   * @method handleVBCSOBChange
   * @description HANDLE VBC SOB CHANGE
   */
  const handleVBCSOBChange = (event, index) => {
    let tempArray = []
    let tempData = vbcVendorGrid[index]

    if (!isNaN(event.target.value)) {
      tempData = {
        ...tempData,
        ShareOfBusinessPercent: parseInt(event.target.value),
        isSOBChanged: checkIsVBCSOBChanged(event, index),
      }
      tempArray = Object.assign([...vbcVendorGrid], { [index]: tempData })
      setVBCVendorGrid(tempArray)
      setEditRow({ EditIndex: index, type: VBC })
    } else {
      warningMessageHandle('VALID_NUMBER_WARNING')
    }
  }

  /**
   * @method checkIsZBCSOBChanged
   * @description HANDLE ZBC SOB CHANGE
   */
  const checkIsVBCSOBChanged = (event, index) => {
    let tempOldObj = vbcVendorOldArray[index]

    if (index > vbcVendorOldArray.length - 1) {
      return false
    } else if (parseInt(event.target.value) === tempOldObj.ShareOfBusinessPercent) {
      return false
    } else if (parseInt(event.target.value) !== tempOldObj.ShareOfBusinessPercent) {
      return true
    }
  }

  /**
   * @method checkSOBTotal
   * @description HANDLE COSTING CHANGE
   */
  const checkSOBTotal = () => {
    // const { zbcPlantGridFields, vbcGridFields } = fieldValues

    let NetZBCSOB = 0
    let NetVBCSOB = 0

    NetZBCSOB = zbcPlantGrid && zbcPlantGrid.length > 0 && zbcPlantGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.ShareOfBusinessPercent)
    }, 0)

    NetVBCSOB = vbcVendorGrid && vbcVendorGrid.length > 0 && vbcVendorGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.ShareOfBusinessPercent)
    }, 0)

    return checkForNull(NetZBCSOB) + checkForNull(NetVBCSOB) > 100 ? false : true
    // return true;

  }

  /**
   * @method isCostingVersionSelected
   * @description HANDLE COSTING VERSION SELECTED
   */
  const isCostingVersionSelected = (index, type) => {
    if (type === ZBC) {
      let tempData = zbcPlantGrid[index]
      return tempData.SelectedCostingVersion !== undefined ? true : false
    } else {
      let tempData = vbcVendorGrid[index]
      return tempData.SelectedCostingVersion !== undefined ? true : false
    }
  }

  /**
   * @method checkForError
   * @description HANDLE COSTING VERSION SELECTED
   */
  const checkForError = (index, type) => {
    if (errors && (errors.zbcPlantGridFields || errors.vbcGridFields)) {
      return false
    } else {
      return true
    }
  }

  /**
   * @method warningMessageHandle
   * @description VIEW COSTING DETAILS IN READ ONLY MODE
   */
  const warningMessageHandle = (warningType) => {
    switch (warningType) {
      case 'SOB_WARNING':
        toastr.warning('SOB Should not be greater than 100.')
        break
      case 'SOB_SAVED_WARNING':
        toastr.warning('Please save SOB percentage.')
        break
      case 'COSTING_VERSION_WARNING':
        toastr.warning('Please select a costing version.')
        break
      case 'VALID_NUMBER_WARNING':
        toastr.warning('Please enter a valid number.')
        break
      case 'ERROR_WARNING':
        toastr.warning('Please enter a valid number.')
        break
      default:
        break
    }
  }

  /**
   * @method addDetails
   * @description ADD DETAILS IN COSTING
   */
  const addDetails = (index, type) => {
    const userDetail = userDetails()

    if (CheckIsSOBChangedSaved()) {
      warningMessageHandle('SOB_SAVED_WARNING')
      return false;
    }

    dispatch(getZBCCostingByCostingId('', (res) => { }))

    if (checkSOBTotal() && type === ZBC) {
      let tempData = zbcPlantGrid[index]

      const data = {
        PartId: part.value,
        PartTypeId: partInfo.PartTypeId,
        PartType: partInfo.PartType,
        TechnologyId: technology.value,
        ZBCId: userDetail.ZBCSupplierInfo.VendorId,
        UserId: loggedInUserId(),
        LoggedInUserId: loggedInUserId(),
        PlantId: tempData.PlantId,
        PlantName: tempData.PlantName,
        PlantCode: tempData.PlantCode,
        ShareOfBusinessPercent: tempData.ShareOfBusinessPercent,
        IsAssemblyPart: partInfo.IsAssemblyPart,
        PartNumber: partInfo.PartNumber,
        PartName: getValues('PartName'),
        Description: getValues('Description'),
        ECNNumber: getValues('ECNNumber'),
        RevisionNumber: getValues('RevisionNumber'),
        DrawingNumber: getValues('DrawingNumber'),
        Price: partInfo.Price,
        EffectiveDate: effectiveDate,
      }

      dispatch(createZBCCosting(data, (res) => {
        if (res.data.Result) {
          setPartInfo(res.data.Data)
          setCostingData({ costingId: res.data.Data.CostingId, type })
          /***********ADDED THIS DISPATCH METHOD FOR GETTING ZBC DETAIL************/
          dispatch(getZBCCostingByCostingId(res.data.Data.CostingId, (res) => {
            setIsCostingViewMode(false)
            setStepTwo(true)
            setStepOne(false)
          }))
        }
      }),
      )
    } else if (checkSOBTotal() && type === VBC) {
      let tempData = vbcVendorGrid[index]

      const data = {
        PartId: part.value,
        PartTypeId: partInfo.PartTypeId,
        PartType: partInfo.PartType,
        TechnologyId: technology.value,
        VendorId: tempData.VendorId,
        VendorPlantId: checkVendorPlantConfigurable() ? tempData.VendorPlantId : '',
        VendorPlantName: tempData.VendorPlantName,
        VendorPlantCode: tempData.VendorPlantCode,
        VendorName: tempData.VendorName,
        VendorCode: tempData.VendorCode,
        DestinationPlantId: initialConfiguration?.IsDestinationPlantConfigure ? tempData.DestinationPlantId : EMPTY_GUID_0,
        DestinationPlantName: initialConfiguration?.IsDestinationPlantConfigure ? tempData.DestinationPlantName : '',
        DestinationPlantCode: initialConfiguration?.IsDestinationPlantConfigure ? tempData.DestinationPlantCode : '',
        UserId: loggedInUserId(),
        LoggedInUserId: loggedInUserId(),
        ShareOfBusinessPercent: tempData.ShareOfBusinessPercent,
        IsAssemblyPart: partInfo.IsAssemblyPart,
        PartNumber: partInfo.PartNumber,
        PartName: partInfo.PartName,
        Description: partInfo.Description,
        ECNNumber: partInfo.ECNNumber,
        RevisionNumber: partInfo.RevisionNumber,
        DrawingNumber: partInfo.DrawingNumber,
        Price: partInfo.Price,
        EffectiveDate: effectiveDate,
      }

      dispatch(createVBCCosting(data, (res) => {
        if (res.data.Result) {
          dispatch(getZBCCostingByCostingId(res.data.Data.CostingId, () => {

            console.log('res from after copy costig add detail: ', res);
            setIsCostingViewMode(false)
            setStepTwo(true)
            setStepOne(false)
          }))
          setPartInfo(res.data.Data)
          setCostingData({ costingId: res.data.Data.CostingId, type })
        }
      }),
      )
    } else {
      toastr.warning('SOB Should not be greater than 100.')
    }
  }

  /**
   * @method viewDetails
   * @description VIEW COSTING DETAILS IN READ ONLY MODE
   */
  const viewDetails = (index, type) => {
    if (CheckIsSOBChangedSaved()) {
      warningMessageHandle('SOB_SAVED_WARNING')
      return false;
    } else if (!checkSOBTotal()) {
      warningMessageHandle('SOB_WARNING')
    } else if (!isCostingVersionSelected(index, type)) {
      warningMessageHandle('COSTING_VERSION_WARNING')
    } else if (!checkForError(index, type)) {
      warningMessageHandle('ERROR_WARNING')
    } else {
      setIsCostingViewMode(true)
      moveToCostingDetail(index, type)
    }
  }

  /**
   * @method editCosting
   * @description EDIT COSTING DETAILS
   */
  const editCosting = (index, type) => {
    if (CheckIsSOBChangedSaved()) {
      warningMessageHandle('SOB_SAVED_WARNING')
      return false;
    } else if (!checkSOBTotal()) {
      warningMessageHandle('SOB_WARNING')
    } else if (!isCostingVersionSelected(index, type)) {
      warningMessageHandle('COSTING_VERSION_WARNING')
    } else if (!checkForError(index, type)) {
      warningMessageHandle('ERROR_WARNING')
    } else {
      setIsCostingViewMode(false)
      moveToCostingDetail(index, type)
    }
  }

  /**
   * @method checkSOBChanged
   * @description CHECK SOB CHANGED FOR UPDATE COSTING AND TRIGGER CONFIRMATION FOR DRAFT ALL PENDING COSTINGS
   */
  const checkSOBChanged = () => {

    let IsSOBChanged = false;

    zbcPlantGrid && zbcPlantGrid.map((el) => {
      if (el.isSOBChanged) {
        IsSOBChanged = true;
      }
    })

    vbcVendorGrid && vbcVendorGrid.map((el) => {
      if (el.isSOBChanged) {
        IsSOBChanged = true;
      }
    })

    return IsSOBChanged;
  }

  /**
   * @method editCostingAlert
   * @description CONFIRM EDIT COSTING FOR SOB CHANGE CONFIRMATION
   */
  const editCostingAlert = (index, type) => {
    const toastrConfirmOptions = {
      onOk: () => {
        confirmUpdateCosting(index, type)
      },
      onCancel: () => { },
      component: () => <ConfirmComponent />
    }
    return toastr.confirm(`${'You have changed SOB percent So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
  }

  /**
   * @method confirmUpdateCosting
   * @description CONFIRM UPDATE AND MOVE TO STEP TWO
   */
  const confirmUpdateCosting = (index, type) => {

    if (type === ZBC) {
      let tempData = zbcPlantGrid[index]
      setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      const data = {
        CostingId: tempData.SelectedCostingVersion.value,
        PlantId: tempData.PlantId,
        PartId: part.value,
        ShareOfBusinessPercent: tempData.ShareOfBusinessPercent,
        LoggedInUserId: loggedInUserId(),
      }
      dispatch(updateZBCSOBDetail(data, (res) => {
        dispatch(getZBCCostingByCostingId(tempData.SelectedCostingVersion.value, (res) => {
          resetSOBChanged()
          setStepTwo(true)
          setStepOne(false)
        }))
      }))
    }

    if (type === VBC) {
      let tempData = vbcVendorGrid[index]
      setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      const data = {
        CostingId: tempData.SelectedCostingVersion.value,
        PlantId: tempData.PlantId,
        PartId: part.value,
        ShareOfBusinessPercent: tempData.ShareOfBusinessPercent,
        LoggedInUserId: loggedInUserId(),
        VendorId: tempData.VendorId,
        VendorPlantId: tempData.VendorPlantId,
        DestinationPlantId: tempData.DestinationPlantId
      }
      dispatch(updateVBCSOBDetail(data, (res) => {
        dispatch(getZBCCostingByCostingId(tempData.SelectedCostingVersion.value, (res) => {

          console.log('res from after copy costig from update costing confirm: ', res);
          resetSOBChanged()
          setStepTwo(true)
          setStepOne(false)
        }))
      }))
    }

  }

  /**
   * @method moveToCostingDetail
   * @description MOVE TO COSTING DETAIL
   */
  const moveToCostingDetail = (index, type) => {
    dispatch(getZBCCostingByCostingId('', (res) => { }))

    if (type === ZBC) {
      let tempData = zbcPlantGrid[index]
      setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      dispatch(getZBCCostingByCostingId(tempData.SelectedCostingVersion.value, (res) => {
        setTimeout(() => {
          setStepTwo(true)
          setStepOne(false)
        }, 500)
      }))
    }

    if (type === VBC) {
      let tempData = vbcVendorGrid[index]
      setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      dispatch(getZBCCostingByCostingId(tempData.SelectedCostingVersion.value, (res) => {

        console.log('res from after copy costig move to costing : ', res);
        setTimeout(() => {
          setStepTwo(true)
          setStepOne(false)
        }, 500)
      }))
    }
  }

  /**
   * @method copyCosting
   * @description COPY EXIS COSTING
   */
  const copyCosting = (index, type) => {
    /*Commented because of error*/
    if (CheckIsSOBChangedSaved()) {
      warningMessageHandle('SOB_SAVED_WARNING')
      return false;
    } else if (!checkSOBTotal()) {
      warningMessageHandle('SOB_WARNING')
      return false;
    } else if (!isCostingVersionSelected(index, type)) {
      warningMessageHandle('COSTING_VERSION_WARNING')
      return false;
    } else if (!checkForError(index, type)) {
      warningMessageHandle('ERROR_WARNING')
      return false;
    } else {

      /*Copy Costing Drawer code here*/
      setIsCostingViewMode(false)
      setIsCopyCostingDrawer(true)

      if (type === ZBC) {
        const tempcopyCostingData = zbcPlantGrid[index]
        setCopyCostingData(tempcopyCostingData)
        setCostingIdForCopy({
          zbcCosting: getValues(`${zbcPlantGridFields}[${index}]CostingVersion`),
          vbcCosting: '',
        })
      } else {
        const tempcopyCostingData = vbcVendorGrid[index]
        setCopyCostingData(tempcopyCostingData)
        setCostingIdForCopy({
          zbcCosting: '',
          vbcCosting: getValues(`${vbcGridFields}[${index}]CostingVersion`),
        })
      }
      setType(type)

    }
  }

  /**
  * @method deleteItem
  * @description CONFIRM DELETE COSTINGS
  */
  const deleteItem = (Item, index, type) => {
    const toastrConfirmOptions = {
      onOk: () => {
        deleteCosting(Item, index, type);
      },
      onCancel: () => { },
      component: () => <ConfirmComponent />,
    };
    return toastr.confirm(`${MESSAGES.COSTING_DELETE_ALERT}`, toastrConfirmOptions);
  }

  /**
   * @method deleteCosting
   * @description USED FOR DELETE COSTING
   */
  const deleteCosting = (Item, index, type) => {
    let reqData = { Id: Item.CostingId, UserId: loggedInUserId() }
    dispatch(deleteDraftCosting(reqData, () => {
      setIsCostingViewMode(false)

      let tempArray = []

      if (type === ZBC) {
        let tempData = zbcPlantGrid[index]
        let selectedOptionObj = tempData.CostingOptions.filter((el) => el.CostingId !== Item.CostingId)

        tempData = {
          ...tempData,
          CostingOptions: selectedOptionObj,
          CostingId: Item.CostingId,
          DisplayStatus: '',
          Price: '',
        }
        tempArray = Object.assign([...zbcPlantGrid], { [index]: tempData })
        setZBCPlantGrid(tempArray)
        setValue(`zbcPlantGridFields.${index}.CostingVersion`, '')
      }

      if (type === VBC) {
        let tempData = vbcVendorGrid[index]
        let selectedOptionObj = tempData.CostingOptions.filter((el) => el.CostingId !== Item.CostingId,)

        tempData = {
          ...tempData,
          CostingOptions: selectedOptionObj,
          CostingId: Item.CostingId,
          DisplayStatus: '',
          Price: '',
          Status: '',
        }
        tempArray = Object.assign([...vbcVendorGrid], { [index]: tempData })
        setVBCVendorGrid(tempArray)
        setValue(`vbcGridFields.${index}.CostingVersion`, '')
      }
    }))
  }

  /**
* @method deleteRowItem
* @description CONFIRM DELETE COSTINGS
*/
  const deleteRowItem = (index, type) => {

    if (type === ZBC) {
      let tempArr = zbcPlantGrid && zbcPlantGrid.filter((el, i) => {
        if (i === index) return false;
        return true;
      })
      setZBCPlantGrid(tempArr)
    }

    if (type === VBC) {
      let tempArr = vbcVendorGrid && vbcVendorGrid.filter((el, i) => {
        if (i === index) return false;
        return true;
      })
      setVBCVendorGrid(tempArr)
    }

  }

  /**
   * @method cancel
   * @description used to Reset form
   */
  const cancel = () => {
    setTechnology([])
    setPart([])
    setZBCPlantGrid([])
    setVBCVendorGrid([])
    setIsOpenVendorSOBDetails(false)
    setShowNextBtn(false)
    setEffectiveDate('')
    dispatch(getPartInfo('', () => { }))
    reset({
      Technology: '',
      Part: '',
      PartName: '',
      Description: '',
      ECNNumber: '',
      DrawingNumber: '',
      RevisionNumber: '',
      ShareOfBusiness: '',
    })
  }

  /**
   * @method backToFirstStep
   * @description used to Reset form
   */
  const backToFirstStep = () => {
    dispatch(getZBCCostingByCostingId('', (res) => {

      console.log('res from after copy costig back to step one: ', res);
    }))

    dispatch(setOverheadProfitData([], () => { }))              //THIS WILL CLEAR OVERHEAD PROFIT REDUCER
    dispatch(setComponentOverheadItemData({}, () => { }))       //THIS WILL CLEAR OVERHEAD PROFIT ITEM REDUCER

    dispatch(setPackageAndFreightData([], () => { }))           //THIS WILL CLEAR PACKAGE FREIGHT ITEM DATA
    dispatch(setComponentPackageFreightItemData({}, () => { })) //THIS WILL CLEAR PACKAGE FREIGHT ITEM DATA

    dispatch(setToolTabData([], () => { }))                     //THIS WILL CLEAR TOOL ARR FROM REDUCER  
    dispatch(setComponentToolItemData({}, () => { }))           //THIS WILL CLEAR TOOL ITEM DATA FROM REDUCER

    dispatch(setComponentDiscountOtherItemData({}, () => { }))  //THIS WILL CLEAR DISCOUNT ITEM DATA FROM REDUCER

    dispatch(gridDataAdded(false)) //BASIS OF GRID DATA DISABLED/ENABLED COSTING EFFECTIVE DATE
    setStepOne(true);
    setStepTwo(false);

    resetGrid()
    setZBCPlantGrid([])
    setVBCVendorGrid([])
    nextToggle()

    dispatch(getPartInfo(part.value !== undefined ? part.value : partNumber.partId, (res) => {
      let Data = res.data.Data;
      setValue('PartName', Data.PartName)
      setValue("Description", Data.Description)
      setValue("ECNNumber", Data.ECNNumber)
      setValue("DrawingNumber", Data.DrawingNumber)
      setValue("RevisionNumber", Data.RevisionNumber)
      setValue("ShareOfBusiness", Data.Price)
      setEffectiveDate(moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
    }))

  }

  /**
   * @method resetGrid
   * @description TO RESET THE GRID DATA OF ZBC,VBC AND CBC (COSTING VVERSION RESET)
   */
  const resetGrid = () => {

    // BELOW CODE IS USED TO REMOVE COSTING VERSION FROM GRIDS
    zbcPlantGrid && zbcPlantGrid.map((el, index) => {
      setValue(`${zbcPlantGridFields}.${index}.CostingVersion`, '')
      return null;
    })

    // BELOW CODE IS USED TO REMOVE COSTING VERSION FROM GRIDS
    vbcVendorGrid && vbcVendorGrid.map((el, index) => {
      setValue(`${vbcGridFields}.${index}.CostingVersion`, '')
      return null;
    })
  }

  /**
   * @method CheckIsSOBChangedSaved
   * @description CHECK IF SOB % CHANGED THEN IT SAVED OR NOT
   */
  const CheckIsSOBChangedSaved = () => {
    return (!isZBCSOBEnabled || !isVBCSOBEnabled) ? true : false;
  }

  useEffect(() => {
    if (isZBCSOBEnabled && zbcPlantGrid.length > 0) {

      if (!checkSOBTotal()) {
        toastr.warning('SOB Should not be greater than 100.')
      } else if (CheckIsCostingAvailable() === false) {
        let tempArr = []
        //setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
        zbcPlantGrid && zbcPlantGrid.map((el) => {
          let data = {}
          if (el.isSOBChanged === true) {
            data = {
              PlantId: el.PlantId,
              PartId: part.value,
              ShareOfBusinessPercent: el.ShareOfBusinessPercent,
              LoggedInUserId: loggedInUserId(),
            }
            tempArr.push(data)
          }
          return false;
        })

        setTimeout(() => {
          dispatch(updateZBCSOBDetail(tempArr, (res) => {
            resetSOBChanged()
          }))
        }, 200)

      } else if (checkSOBChanged()) {
        SOBUpdateAlert(ZBC)
      } else {

      }

    }
  }, [isZBCSOBEnabled])

  /**
   * @method SOBUpdateAlert
   * @description CONFIRMATION FOR ZBC SOB UPDATE
   */
  const SOBUpdateAlert = (type) => {
    confirmSOBUpdate(type)
    // const toastrConfirmOptions = {
    //   onOk: () => {
    //     confirmSOBUpdate(type)
    //   },
    //   onCancel: () => { setPreviousSOBValue() },
    //   component: () => <ConfirmComponent />
    // }
    // return toastr.confirm(`${'You have changed SOB percent So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
  }

  /**
   * @method setPreviousSOBValue
   * @description SET OLD SOB VALUE
   */
  const setPreviousSOBValue = () => {
    if (editRow.type === ZBC) {
      let tempDataOld = zbcPlantOldArray[editRow.EditIndex];
      let tempData = zbcPlantGrid[editRow.EditIndex]

      if (tempData) {
        tempData = { ...tempData, ShareOfBusinessPercent: tempDataOld.ShareOfBusinessPercent, }
        let tempArray = Object.assign([...zbcPlantGrid], { [editRow.EditIndex]: tempData })
        setZBCPlantGrid(tempArray)
        setTimeout(() => {
          setValue(`${zbcPlantGridFields}[${editRow.EditIndex}]ShareOfBusinessPercent`, tempDataOld.ShareOfBusinessPercent)
        }, 200)
      }

    }

    if (editRow.type === VBC) {
      let tempDataOld = vbcVendorOldArray[editRow.EditIndex];
      let tempData = vbcVendorGrid[editRow.EditIndex]

      if (tempData) {
        tempData = { ...tempData, ShareOfBusinessPercent: tempDataOld.ShareOfBusinessPercent, }
        let tempArray = Object.assign([...vbcVendorGrid], { [editRow.EditIndex]: tempData })
        setVBCVendorGrid(tempArray)
        setTimeout(() => {
          setValue(`vbcGridFields[${editRow.EditIndex}]ShareOfBusinessPercent`, tempDataOld.ShareOfBusinessPercent)
        }, 200)
      }
    }
  }

  /**
   * @method confirmSOBUpdate
   * @description CONFIRM SOB UPDATE
   */
  const confirmSOBUpdate = (type) => {
    if (type === ZBC) {
      let tempArr = []
      //setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      zbcPlantGrid && zbcPlantGrid.map((el) => {
        let data = {}
        if (el.isSOBChanged === true) {
          data = {
            PlantId: el.PlantId,
            PartId: part.value,
            ShareOfBusinessPercent: el.ShareOfBusinessPercent,
            LoggedInUserId: loggedInUserId(),
          }
          tempArr.push(data)
        }
        return false;
      })

      setTimeout(() => {
        dispatch(updateZBCSOBDetail(tempArr, (res) => {
          resetSOBChanged()
        }))
      }, 200)
    }

    if (type === VBC) {
      let tempArr = []
      //setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      vbcVendorGrid && vbcVendorGrid.map((el) => {
        let data = {}
        if (el.isSOBChanged === true) {
          data = {
            PlantId: el.PlantId,
            PartId: part.value,
            ShareOfBusinessPercent: el.ShareOfBusinessPercent,
            LoggedInUserId: loggedInUserId(),
            VendorId: el.VendorId,
            VendorPlantId: initialConfiguration && initialConfiguration.IsVendorPlantConfigurable ? el.VendorPlantId : EMPTY_GUID,
            DestinationPlantId: el.DestinationPlantId
          }
          tempArr.push(data)
        }
        return false;
      })

      setTimeout(() => {
        dispatch(updateVBCSOBDetail(tempArr, (res) => {
          resetSOBChanged()
        }))
      }, 200)
    }

  }

  useEffect(() => {
    if (isVBCSOBEnabled && vbcVendorGrid.length > 0) {

      if (!checkSOBTotal()) {
        toastr.warning('SOB Should not be greater than 100.')
      } else if (CheckIsCostingAvailable() === false) {

        let tempArr = []
        //setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
        vbcVendorGrid && vbcVendorGrid.map((el) => {
          let data = {}
          if (el.isSOBChanged === true) {
            data = {
              PlantId: el.PlantId,
              PartId: part.value,
              ShareOfBusinessPercent: el.ShareOfBusinessPercent,
              LoggedInUserId: loggedInUserId(),
              VendorId: el.VendorId,
              VendorPlantId: initialConfiguration && initialConfiguration.IsVendorPlantConfigurable ? el.VendorPlantId : EMPTY_GUID,
              DestinationPlantId: el.DestinationPlantId
            }
            tempArr.push(data)
          }
          return false;
        })

        setTimeout(() => {
          dispatch(updateVBCSOBDetail(tempArr, (res) => {
            resetSOBChanged()
          }))
        }, 200)

      } else if (checkSOBChanged()) {
        SOBUpdateAlert(VBC)
      } else {

      }

    }

  }, [isVBCSOBEnabled])

  /**
   * @method CheckIsCostingAvailable
   * @description CHECK IS ANY COSTING CREATED YET OR AVAILABLE
   */
  const CheckIsCostingAvailable = () => {
    let ZBCAvailableIndex = '';
    let VBCAvailableIndex = '';

    ZBCAvailableIndex = zbcPlantGrid.length > 0 && zbcPlantGrid.findIndex(el => el.CostingOptions.length > 0)
    VBCAvailableIndex = vbcVendorGrid.length > 0 && vbcVendorGrid.findIndex(el => el.CostingOptions.length > 0)
    return (ZBCAvailableIndex !== -1 || VBCAvailableIndex !== -1) ? true : false;
  }

  /**
   * @method resetSOBChanged
   * @description RESET isSOBChanged TO FALSE IN BOTH ZBC AND VBC GRID, AFTER UPDATE ZBC AND VBC SOB 
   */
  const resetSOBChanged = () => {

    let tempZBCArr = zbcPlantGrid && zbcPlantGrid.map((el) => {
      el.isSOBChanged = false;
      return el;
    })

    let tempVBCArr = vbcVendorGrid && vbcVendorGrid.map((el) => {
      el.isSOBChanged = false;
      return el;
    })

    setZBCPlantGrid(tempZBCArr)
    setVBCVendorGrid(tempVBCArr)
  }


  const zbcPlantGridFields = 'zbcPlantGridFields'
  const vbcGridFields = 'vbcGridFields'

  const bulkToggle = () => {
    SetIsBulkOpen(true)
  }

  const closeBulkUploadDrawer = () => {
    SetIsBulkOpen(false)
  }

  /**
   * @method updateZBCState
   * @description UPDATE isZBCSOBEnabled STATE
   */
  const updateZBCState = () => {
    let findIndex = zbcPlantGrid && zbcPlantGrid.length > 0 && zbcPlantGrid.findIndex(el => isNaN(el.ShareOfBusinessPercent) === true)
    if (findIndex !== -1) {
      toastr.warning('SOB could not be empty.')
      return false;
    } else {
      setZBCEnableSOBField(!isZBCSOBEnabled)
    }
  }

  /**
   * @method onSubmit
   * @description UPDATE isVBCSOBEnabled STATE
   */
  const updateVBCState = () => {
    let findIndex = vbcVendorGrid && vbcVendorGrid.length > 0 && vbcVendorGrid.findIndex(el => isNaN(el.ShareOfBusinessPercent) === true)
    if (findIndex !== -1) {
      toastr.warning('SOB could not be empty.')
      return false;
    } else {
      setVBCEnableSOBField(!isVBCSOBEnabled)
    }
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => { }

  const filterList = (inputValue) => {
    if (inputValue) {
      let tempArr = []
      tempArr = partDropdown && partDropdown.filter(i => {
        return i.label.toLowerCase().includes(inputValue.toLowerCase())
      }
      );
      if (tempArr.length <= 100) {
        return tempArr
      } else {
        return tempArr.slice(0, 100)
      }
    } else {
      return partDropdown
    }
  };
  const promiseOptions = inputValue =>
    new Promise(resolve => {
      resolve(filterList(inputValue));
    });

  return (
    <>
      <span className="position-relative costing-page-tabs d-block w-100">
        <div className="right-actions">

          {/* BELOW BUTTONS ARE TEMPORARY HIDDEN FROM UI  */}

          {/* <button className="btn btn-link text-primary">
            <img src={require('../../../assests/images/print.svg')} alt="print-button" />
            <span className="d-block mt-1">PRINT</span>
          </button>
          <button className="btn btn-link text-primary">
            <img src={require('../../../assests/images/excel.svg')} alt="print-button" />
            <span className="d-block mt-1">XLS</span>
          </button>
          <button className="btn btn-link text-primary">
            <img src={require('../../../assests/images/pdf.svg')} alt="print-button" />
            <span className="d-block mt-1">PDF</span>
          </button> */}

          {/* COMMENTED FOR NOW 29-06-2021 */}
          {/* {stepOne && <button onClick={bulkToggle} className="btn btn-link text-primary pr-0">
            <img src={require('../../../assests/images/add-bom.svg')} alt="print-button" />
            <span className="d-block mt-1">ADD BOM</span>
          </button>} */}
        </div>
      </span>
      <div className="login-container signup-form costing-details-page">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              {/* BASIS OF TECHNOLOGY AND PART GET THE DETAILS OF PART.  */}
              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}              >
                {stepOne && (
                  <>
                    <Row>
                      <Col md="12">
                        <div className="left-border mt-3 ">{"Part Details:"}</div>
                      </Col>
                      <Col className="col-md-15">
                        <SearchableSelectHookForm
                          label={"Technology"}
                          name={"Technology"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={technology.length !== 0 ? technology : ""}
                          options={renderListing("Technology")}
                          mandatory={true}
                          handleChange={handleTechnologyChange}
                          errors={errors.Technology}
                        />
                      </Col>
                      <Col className="col-md-15">
                        <TooltipCustom tooltipText="Please enter first few digits to see the part numbers" />
                        <AsyncSearchableSelectHookForm
                          label={"Assembly No./Part No."}
                          name={"Part"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={part.length !== 0 ? part : ""}
                          asyncOptions={promiseOptions}
                          mandatory={true}
                          isLoading={false}
                          handleChange={handlePartChange}
                          errors={errors.Part}
                          disabled={technology.length === 0 ? true : false}
                        />
                      </Col>
                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly Name/Part Name"
                          name={"PartName"}
                          Controller={Controller}
                          control={control}
                          //register={register({ required: "PartName is required." })} //Working for required and msg
                          register={register}
                          mandatory={false}
                          rules={{
                            required: false,
                            // pattern: {
                            //   value: /^[0-9]*$/i,
                            //   message: 'Invalid Number.'
                            // },
                            // maxLength: 4,
                          }}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.PartName}
                          disabled={true}
                        />
                      </Col>
                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly/Part Description"
                          name={"Description"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          rules={{ required: false }}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.Description}
                          disabled={true}
                        />
                      </Col>
                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="ECN No."
                          name={"ECNNumber"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.ECNNumber}
                          disabled={true}
                        />
                      </Col>
                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Drawing No."
                          name={"DrawingNumber"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.DrawingNumber}
                          disabled={true}
                        />
                      </Col>
                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Revision No."
                          name={"RevisionNumber"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.RevisionNumber}
                          disabled={true}
                        />
                      </Col>
                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label={`Current Price (Approved SOB: ${partInfo && partInfo.WeightedSOB !== undefined ? partInfo.WeightedSOB + '%' : 0})`}
                          name={"ShareOfBusiness"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.ShareOfBusiness}
                          disabled={true}
                        />
                      </Col>
                      <Col className="col-md-15">
                        <div className="form-group">
                          <label>Effective Date</label>
                          <div className="inputbox date-section">
                            <DatePicker
                              name="EffectiveDate"
                              selected={effectiveDate}
                              onChange={handleEffectiveDateChange}
                              showMonthDropdown
                              showYearDropdown
                              dateFormat="dd/MM/yyyy"
                              //maxDate={new Date()}
                              dropdownMode="select"
                              placeholderText="Select date"
                              className="withBorder"
                              autoComplete={"off"}
                              disabledKeyboardNavigation
                              onChangeRaw={(e) => e.preventDefault()}
                              disabled={true}
                            />
                          </div>
                        </div>
                      </Col>

                    </Row>
                    {IsOpenVendorSOBDetails && (
                      <Row>
                        <Col md="12">
                          <div className="left-border mt-15 mb-0">
                            {"SOB Details:"}
                          </div>
                        </Col>
                      </Row>
                    )}
                    {IsOpenVendorSOBDetails && (
                      <>
                        <Row className="align-items-center">
                          <Col md="6" className={"mb-2 mt-3"}>
                            <h6 className="dark-blue-text sec-heading">ZBC:</h6>
                          </Col>
                          <Col md="6" className={"mb-2 mt-3"}>
                            <button
                              type="button"
                              className={"user-btn"}
                              onClick={plantDrawerToggle}
                            >
                              <div className={"plus"}></div>ADD PLANT
                            </button>
                          </Col>
                        </Row>

                        {/* ZBC PLANT GRID FOR COSTING */}
                        <Row>
                          <Col md="12">
                            <Table
                              className="table cr-brdr-main costing-table-next costing-table-zbc"
                              size="sm"
                            >
                              <thead>
                                <tr>
                                  <th style={{}}>{`Plant`}</th>
                                  <th style={{}}>{`SOB(%)`}{SOBAccessibility && zbcPlantGrid.length > 0 && <button className="edit-details-btn ml5" type={"button"} onClick={updateZBCState} />}</th>
                                  <th style={{}}>{`Costing Version`}</th>
                                  <th className="text-center" style={{ minWidth: "200px" }}>{`Status`}</th>
                                  <th style={{ minWidth: "115px" }}>{`Price`}</th>
                                  <th style={{ minWidth: "280px" }}>{`Actions`}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {zbcPlantGrid &&
                                  zbcPlantGrid.map((item, index) => {

                                    let displayCopyBtn = (item.Status === DRAFT ||
                                      item.Status === PENDING ||
                                      item.Status === WAITING_FOR_APPROVAL ||
                                      item.Status === APPROVED || item.Status === REJECTED || item.Status === APPROVED_BY_SIMULATION) ? true : false;

                                    let displayEditBtn = (item.Status === DRAFT || item.Status === REJECTED) ? true : false;

                                    let displayDeleteBtn = (item.Status === DRAFT) ? true : false;

                                    //FOR VIEW AND CREATE CONDITION NOT CREATED YET BECAUSE BOTH BUTTON WILL DISPLAY IN EVERY CONDITION 
                                    //AS OF NOW 25-03-2021

                                    return (
                                      <tr key={index}>
                                        <td>{`${item.PlantName}(${item.PlantCode})`}</td>
                                        <td className="cr-select-height w-100px">
                                          <NumberFieldHookForm
                                            label={""}
                                            name={`${zbcPlantGridFields}.${index}.ShareOfBusinessPercent`}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                              required: true,
                                              pattern: {
                                                value: /^\d*\.?\d*$/,
                                                message: "Invalid Number.",
                                              },
                                              max: {
                                                value: 100,
                                                message: "Should not be greater then 100"
                                              }
                                            }}
                                            defaultValue={item.ShareOfBusinessPercent}
                                            className=""
                                            customClassName={"withBorder"}
                                            handleChange={(e) => {
                                              e.preventDefault();
                                              handleZBCSOBChange(e, index);
                                            }}
                                            errors={errors && errors.zbcPlantGridFields && errors.zbcPlantGridFields[index] !== undefined ? errors.zbcPlantGridFields[index].ShareOfBusinessPercent : ""}
                                            disabled={isZBCSOBEnabled ? true : false}
                                          />
                                        </td>
                                        <td className="cr-select-height w-100px">
                                          <SearchableSelectHookForm
                                            label={""}
                                            name={`${zbcPlantGridFields}.${index}.CostingVersion`}
                                            placeholder={"Select"}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            defaultValue={item.SelectedCostingVersion}
                                            options={renderCostingOption(item.CostingOptions)}
                                            mandatory={false}
                                            handleChange={(newValue) =>
                                              handleCostingChange(newValue, ZBC, index)
                                            }
                                            errors={`${zbcPlantGridFields}[${index}]CostingVersion`}
                                          />
                                        </td>
                                        <td className="text-center">
                                          <div className={item.CostingId !== EMPTY_GUID ? item.Status : ''}>
                                            {item.DisplayStatus}
                                          </div>
                                        </td>
                                        <td>{item.Price ? checkForDecimalAndNull(item.Price, getConfigurationKey().NoOfDecimalForPrice) : 0}</td>
                                        <td style={{ width: "250px" }}>
                                          {AddAccessibility && <button className="Add-file mr-2 my-1" type={"button"} title={"Add Costing"} onClick={() => addDetails(index, ZBC)} />}
                                          {ViewAccessibility && !item.IsNewCosting && item.Status !== '-' && (<button className="View mr-2 my-1" type={"button"} title={"View Costing"} onClick={() => viewDetails(index, ZBC)} />)}
                                          {EditAccessibility && !item.IsNewCosting && displayEditBtn && (<button className="Edit mr-2 my-1" type={"button"} title={"Edit Costing"} onClick={() => editCosting(index, ZBC)} />)}
                                          {CopyAccessibility && !item.IsNewCosting && displayCopyBtn && (<button className="Copy All mr-2 my-1" type={"button"} title={"Copy Costing"} onClick={() => copyCosting(index, ZBC)} />)}
                                          {DeleteAccessibility && !item.IsNewCosting && displayDeleteBtn && (<button className="Delete mr-2 All my-1" type={"button"} title={"Delete Costing"} onClick={() => deleteItem(item, index, ZBC)} />)}
                                          {item?.CostingOptions?.length === 0 && <button className="CancelIcon" type={'button'} onClick={() => deleteRowItem(index, ZBC)} />}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                {zbcPlantGrid && zbcPlantGrid.length === 0 && (
                                  <tr>
                                    <td colSpan={7}>
                                      <NoContentFound
                                        title={CONSTANT.EMPTY_DATA}
                                      />
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </Col>
                        </Row>
                      </>
                    )}

                    {IsOpenVendorSOBDetails && (
                      <>
                        <Row className="align-items-center">
                          <Col md={'6'} className={"mb-2 mt-3"}>
                            <h6 className="dark-blue-text sec-heading">VBC:</h6>
                          </Col>
                          <Col md="6" className={"mb-2 mt-3"}>
                            {vbcVendorGrid && vbcVendorGrid.length < initialConfiguration.NumberOfVendorsForCostDetails ? (
                              <button
                                type="button"
                                className={"user-btn"}
                                onClick={vendorDrawerToggle}
                              >
                                <div className={"plus"}></div>ADD VENDOR
                              </button>
                            ) : (
                              ""
                            )}
                          </Col>
                        </Row>

                        {/* VBC PLANT GRID FOR COSTING */}
                        <Row>
                          <Col md="12">
                            <Table
                              className="table cr-brdr-main costing-table-next costing-table-vbc"
                              size="sm"
                            >
                              <thead>
                                <tr>
                                  <th style={{}}>{`Vendor`}</th>
                                  {initialConfiguration?.IsDestinationPlantConfigure && <th style={{}}>{`Destination Plant`}</th>}
                                  <th style={{}}>{`SOB(%)`}{SOBAccessibility && vbcVendorGrid.length > 0 && <button className="edit-details-btn ml5" type={"button"} onClick={updateVBCState} />}</th>
                                  <th style={{}}>{`Costing Version`}</th>
                                  <th className="text-center" style={{ minWidth: "200px" }}>{`Status`}</th>
                                  <th style={{ minWidth: "115px" }}>{`Price`}</th>
                                  <th style={{ minWidth: "280px" }}>{`Actions`}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {vbcVendorGrid && vbcVendorGrid.map((item, index) => {
                                  let displayCopyBtn = (item.Status === DRAFT ||
                                    item.Status === PENDING ||
                                    item.Status === WAITING_FOR_APPROVAL ||
                                    item.Status === APPROVED || item.Status === REJECTED || item.Status === APPROVED_BY_SIMULATION) ? true : false;

                                  let displayEditBtn = (item.Status === DRAFT || item.Status === REJECTED) ? true : false;

                                  let displayDeleteBtn = (item.Status === DRAFT) ? true : false;

                                  return (
                                    <tr key={index}>
                                      <td>{`${item.VendorName}(${item.VendorCode})`}</td>
                                      {initialConfiguration?.IsDestinationPlantConfigure && <td>{item?.DestinationPlantName ? item.DestinationPlantName : ''}</td>}
                                      <td className="w-100px cr-select-height">
                                        <NumberFieldHookForm
                                          label=""
                                          name={`${vbcGridFields}.${index}.ShareOfBusinessPercent`}
                                          Controller={Controller}
                                          control={control}
                                          register={register}
                                          mandatory={false}
                                          rules={{
                                            required: true,
                                            pattern: {
                                              value: /^\d*\.?\d*$/,
                                              message: "Invalid Number.",
                                            },
                                            max: {
                                              value: 100,
                                              message: "Should not be greater then 100"
                                            }
                                          }}
                                          defaultValue={item.ShareOfBusinessPercent}
                                          className=""
                                          customClassName={"withBorder"}
                                          handleChange={(e) => {
                                            e.preventDefault();
                                            handleVBCSOBChange(e, index);
                                          }}
                                          errors={errors && errors.vbcGridFields && errors.vbcGridFields[index] !== undefined ? errors.vbcGridFields[index].ShareOfBusinessPercent : ""}
                                          disabled={isVBCSOBEnabled ? true : false}
                                        />
                                      </td>
                                      <td className="cr-select-height w-100px">
                                        <SearchableSelectHookForm
                                          label={""}
                                          name={`${vbcGridFields}.${index}.CostingVersion`}
                                          placeholder={"Select"}
                                          Controller={Controller}
                                          control={control}
                                          rules={{ required: false }}
                                          register={register}
                                          defaultValue={item.SelectedCostingVersion}
                                          options={renderCostingOption(item.CostingOptions)}
                                          mandatory={false}
                                          handleChange={(newValue) => handleCostingChange(newValue, VBC, index)}
                                          errors={`${vbcGridFields}[${index}]CostingVersion`}
                                        />
                                      </td>
                                      <td className="text-center">
                                        <div className={item.CostingId !== EMPTY_GUID ? item.Status : ''}>
                                          {item.DisplayStatus}
                                        </div>
                                      </td>
                                      <td>{item.Price ? checkForDecimalAndNull(item.Price, getConfigurationKey().NoOfDecimalForPrice) : 0}</td>
                                      <td>
                                        {AddAccessibility && <button className="Add-file mr-2 my-1" type={"button"} title={"Add Costing"} onClick={() => addDetails(index, VBC)} />}
                                        {ViewAccessibility && !item.IsNewCosting && item.Status !== '' && (<button className="View mr-2 my-1" type={"button"} title={"View Costing"} onClick={() => viewDetails(index, VBC)} />)}
                                        {EditAccessibility && !item.IsNewCosting && displayEditBtn && (<button className="Edit mr-2 my-1" type={"button"} title={"Edit Costing"} onClick={() => editCosting(index, VBC)} />)}
                                        {CopyAccessibility && !item.IsNewCosting && (<button className="Copy All mr-2 my-1" title={"Copy Costing"} type={"button"} onClick={() => copyCosting(index, VBC)} />)}
                                        {DeleteAccessibility && !item.IsNewCosting && displayDeleteBtn && (<button className="Delete mr-2 All my-1" title={"Delete Costing"} type={"button"} onClick={() => deleteItem(item, index, VBC)} />)}
                                        {item?.CostingOptions?.length === 0 && <button className="CancelIcon" type={'button'} onClick={() => deleteRowItem(index, VBC)} />}
                                      </td>
                                    </tr>
                                  );
                                })}
                                {vbcVendorGrid.length === 0 && (
                                  <tr>
                                    <td colSpan={7}>
                                      <NoContentFound
                                        title={CONSTANT.EMPTY_DATA}
                                      />
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </Col>
                        </Row>
                      </>
                    )}

                    {!IsOpenVendorSOBDetails &&
                      <Row className="justify-content-between btn-row">
                        <div className="col-sm-12 text-right">
                          <button type={"button"} className="reset-btn" onClick={cancel} >
                            <div className="cancel-icon"></div>
                            {"Clear"}
                          </button>
                          {IsShowNextBtn &&
                            <button type="button" className="submit-button save-btn ml15" onClick={nextToggle} >
                              {"Next"}
                              <div className={"next-icon"}></div>
                            </button>}
                        </div>
                      </Row>}


                  </>
                )}
                {stepTwo && (
                  <ViewCostingContext.Provider value={IsCostingViewMode} >
                    <CostingDetailStepTwo
                      backBtn={backToFirstStep}
                      partInfo={Object.keys(props.partInfoStepTwo).length > 0 ? props.partInfoStepTwo : partInfoStepTwo}
                      costingInfo={Object.keys(props.costingData).length > 0 ? props.costingData : costingData}
                      toggle={props.toggle}
                      IsCostingViewMode={IsCostingViewMode}
                    />
                  </ViewCostingContext.Provider>
                )}
              </form>
            </div>
          </Col>
        </Row>
      </div>

      {IsPlantDrawerOpen && (
        <AddPlantDrawer
          isOpen={IsPlantDrawerOpen}
          closeDrawer={closePlantDrawer}
          isEditFlag={false}
          zbcPlantGrid={zbcPlantGrid}
          ID={""}
          anchor={"right"}
        />
      )}

      {IsVendorDrawerOpen && (
        <AddVendorDrawer
          isOpen={IsVendorDrawerOpen}
          closeDrawer={closeVendorDrawer}
          isEditFlag={false}
          vbcVendorGrid={vbcVendorGrid}
          ID={""}
          anchor={"right"}
        />
      )}

      {isCopyCostingDrawer && (
        <CopyCosting
          isOpen={isCopyCostingDrawer}
          closeDrawer={closeCopyCostingDrawer}
          copyCostingData={copyCostingData}
          zbcPlantGrid={zbcPlantGrid}
          vbcVendorGrid={vbcVendorGrid}
          partNo={getValues("Part")}
          type={type}
          selectedCostingId={costingIdForCopy}
          //isEditFlag={false}
          anchor={"right"}
        />
      )}

      {IsBulkOpen && <BOMUpload
        isOpen={IsBulkOpen}
        closeDrawer={closeBulkUploadDrawer}
        isEditFlag={false}
        fileName={'BOM'}
        messageLabel={'BOM'}
        anchor={'right'}
      />}

      {clientDrawer && (
        <Clientbasedcostingdrawer
          isOpen={clientDrawer}
          closeDrawer={closeCLientCostingDrawer}
          isEditFlag={false}
          anchor={'right'}
        />
      )}
    </>
  );
}

export default CostingDetails
