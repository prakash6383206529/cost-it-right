import React, { useState, useEffect, } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import { TextFieldHookForm, SearchableSelectHookForm, NumberFieldHookForm, AsyncSearchableSelectHookForm, } from '../../layout/HookFormInputs';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddPlantDrawer from './AddPlantDrawer';
import NoContentFound from '../../common/NoContentFound';
import { CBC, CBCTypeId, EMPTY_DATA, NCC, NCCTypeId, REJECTED_BY_SYSTEM, VBCTypeId, ZBCTypeId } from '../../../config/constants';
import AddVendorDrawer from './AddVendorDrawer';
import Toaster from '../../common/Toaster';
import { checkForDecimalAndNull, checkForNull, checkPermission, checkVendorPlantConfigurable, getConfigurationKey, getTechnologyPermission, loggedInUserId, userDetails } from '../../../helper';
import DayTime from '../../common/DayTimeWrapper'
import CostingDetailStepTwo from './CostingDetailStepTwo';
import { APPROVED, DRAFT, EMPTY_GUID, PENDING, REJECTED, VBC, WAITING_FOR_APPROVAL, ZBC, EMPTY_GUID_0, COSTING, APPROVED_BY_SIMULATION } from '../../../config/constants';
import {
  getPartInfo, checkPartWithTechnology, createZBCCosting, createVBCCosting, getZBCExistingCosting, getVBCExistingCosting,
  updateZBCSOBDetail, updateVBCSOBDetail, storePartNumber, getBriefCostingById, deleteDraftCosting, getPartSelectListByTechnology,
  setOverheadProfitData, setComponentOverheadItemData, setPackageAndFreightData, setComponentPackageFreightItemData, setToolTabData,
  setComponentToolItemData, setComponentDiscountOtherItemData, gridDataAdded, getCostingSpecificTechnology, setRMCCData, setComponentItemData, createNCCCosting, saveAssemblyBOPHandlingCharge, setProcessGroupGrid, savePartNumber, saveBOMLevel, setPartNumberArrayAPICALL, isDataChange, setSurfaceCostData, saveAssemblyNumber, createCosting, getExistingCosting,
} from '../actions/Costing'
import CopyCosting from './Drawers/CopyCosting'
import { MESSAGES } from '../../../config/message';
import BOMUploadDrawer from '../../massUpload/BOMUpload';

import Clientbasedcostingdrawer from './ClientBasedCostingDrawer';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import AddNCCDrawer from './AddNCCDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { debounce } from 'lodash';
import { MACHINING } from '../../../config/masterData';
import AddClientDrawer from './AddClientDrawer';

export const ViewCostingContext = React.createContext()
export const EditCostingContext = React.createContext()
export const CopyCostingContext = React.createContext()
export const VbcExistingCosting = React.createContext()
export const CostingStatusContext = React.createContext()
export const CostingTypeContext = React.createContext()

function IsolateReRender(control) {
  const values = useWatch({
    control,
    name: ['zbcPlantGridFields', 'vbcGridFields', 'Technology', 'cbcGridFields'],
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
  const [IsVendorDrawerOpen, setIsVendorDrawerOpen] = useState(false);
  const [isNCCDrawerOpen, setIsNCCDrawerOpen] = useState(false)
  const [vbcVendorGrid, setVBCVendorGrid] = useState([]);
  const [cbcGrid, setCBCGrid] = useState([]);
  const [nccGrid, setNccGrid] = useState([])
  const [vbcVendorOldArray, setvbcVendorOldArray] = useState([]);
  const [stepOne, setStepOne] = useState(Object.keys(props.costingData).length > 0 ? false : true);
  const [stepTwo, setStepTwo] = useState(Object.keys(props.costingData).length > 0 ? true : false);
  const [IsShowNextBtn, setShowNextBtn] = useState(false);
  const [partInfoStepTwo, setPartInfo] = useState({});
  const [costingData, setCostingData] = useState({});
  const [IsBulkOpen, SetIsBulkOpen] = useState(false)
  const [isZBCLoader, setIsZBCLoader] = useState(false)
  const [isVBCLoader, setIsVBCLoader] = useState(false)
  const [costingType, setCostingType] = useState("")
  const [IsClientDrawerOpen, setIsClientDrawerOpen] = useState(false);

  // FOR COPY COSTING
  const [copyCostingData, setCopyCostingData] = useState({})
  const [type, setType] = useState('')
  const [isCopyCostingDrawer, setIsCopyCostingDrawer] = useState(false)
  const [costingIdForCopy, setCostingIdForCopy] = useState({})
  const [approvalStatus, setApprovalStatus] = useState('')

  //ROLE AND PERMISSION
  const [ViewAccessibility, setViewAccessibility] = useState(true)
  const [AddAccessibility, setAddAccessibility] = useState(true)
  const [EditAccessibility, setEditAccessibility] = useState(true)
  const [DeleteAccessibility, setDeleteAccessibility] = useState(true)
  const [CopyAccessibility, setCopyAccessibility] = useState(true)
  const [SOBAccessibility, setSOBAccessibility] = useState(true)


  //FOR VIEW MODE COSTING
  const [IsCostingViewMode, setIsCostingViewMode] = useState(false)
  // FOR EDIT MODE COSTING
  const [IsCostingEditMode, setIsCostingEditMode] = useState(false)
  // FOR COPY COSTING MODE
  const [IsCopyCostingMode, setIsCopyCostingMode] = useState(false)

  // client based costing
  const [clientDrawer, setClientDrawer] = useState(false)
  // client based costing
  const [partDropdown, setPartDropdown] = useState([])

  IsolateReRender(control);
  const [showPopup, setShowPopup] = useState(false)
  const [costingObj, setCostingObj] = useState({
    item: {},
    type: '',
    index: []
  })
  const [titleObj, setTitleObj] = useState({})
  //dropdown loader 
  const [inputLoader, setInputLoader] = useState(false)
  const [costingOptionsSelectedObject, setCostingOptionsSelectedObject] = useState({})

  const dispatch = useDispatch()

  const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
  const partInfo = useSelector((state) => state.costing.partInfo)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const partSelectListByTechnology = useSelector(state => state.costing.partSelectListByTechnology)
  const partNumber = useSelector(state => state.costing.partNo);
  const { topAndLeftMenuData } = useSelector(state => state.auth);

  useEffect(() => {
    if (reactLocalStorage.get('location') === '/costing') {
      reactLocalStorage.setObject('costingArray', [])
      reactLocalStorage.setObject('surfaceCostingArray', [])
      setValue('Technology', '')
      setValue('Part', '')
      reset()
      applyPermission(topAndLeftMenuData, technology.label)
      dispatch(storePartNumber(''))
      dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
      dispatch(getPartSelectListByTechnology('', () => { }))
      dispatch(getPartInfo('', () => { }))
      dispatch(gridDataAdded(false))

    }
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
    if (Object.keys(partNumber).length > 0 && partNumber.technologyName && reactLocalStorage.get('location') === '/costing') {
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
            setValue('ShareOfBusiness', checkForDecimalAndNull(Data.Price, initialConfiguration.NoOfDecimalForPrice))
            setEffectiveDate(DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate).format('MM/DD/YYYY') : '')

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
        if (item.Value === '0' || checkForNull(item.Value) === MACHINING) return false        // SPECIFIC FOR RE, HIDE Machining TECHNOLOGY IN COSTING DROPDOWN
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
      setInputLoader(true)
      dispatch(getPartSelectListByTechnology(newValue.value, () => {
        setInputLoader(false)
      }))
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
        PartName: '',
        Description: '',
        ECNNumber: '',
        DrawingNumber: '',
        RevisionNumber: '',
        ShareOfBusiness: '',
        EffectiveDate: '',
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
              setValue('ShareOfBusiness', Data?.Price !== null ? checkForDecimalAndNull(Data.Price, initialConfiguration.NoOfDecimalForPrice) : '')
              setEffectiveDate(DayTime(Data.EffectiveDate).isValid ? DayTime(Data.EffectiveDate).format('MM/DD/YYYY') : '')
              //  setEffectiveDate(DayTime(Data.EffectiveDate).format('dd/MM/yyyy'))
              setShowNextBtn(true)
              setTitleObj(prevState => ({ ...prevState, descriptionTitle: Data.Description, partNameTitle: Data.PartName }))
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
  // const toggleCLientCosting = () => {
  //   setClientDrawer(true)
  // }

  const closeCLientCostingDrawer = () => {
    setClientDrawer(false)
  }
  // client based costing end



  /**
   * @method nextToggle
   * @description DISPLAY FORM ONCLICK NEXT BUTTON
   */
  const nextToggle = () => {
    // setIsZBCLoader(true)
    // setIsVBCLoader(true)
    if (Object.keys(technology).length > 0 && Object.keys(part).length > 0) {

      dispatch(getExistingCosting(part.value, (res) => {
        if (res.data.Result) {
          let Data = res.data.DataList
          console.log('Data: ', Data);
          let vbcArray = []
          let nccArray = []
          let zbvArray = []
          let cbcArray = []
          Data && Data.map((item) => {
            if (item.CostingTypeId === NCCTypeId) {
              nccArray.push(item)
            } else if (item.CostingTypeId === VBCTypeId) {
              vbcArray.push(item)
            } else if (item.CostingTypeId === ZBCTypeId) {
              zbvArray.push(item)
            } else if (item.CostingTypeId === CBCTypeId) {
              cbcArray.push(item)
            }
            console.log('cbcArray: ', cbcArray);

            return null
          })
          setZBCPlantGrid(zbvArray)
          setNccGrid(nccArray)
          setVBCVendorGrid(vbcArray)
          setCBCGrid(cbcArray)
          setvbcVendorOldArray(Data)
          setIsVBCLoader(false)
          setIsZBCLoader(false)
        }
      }))
      /*********************UNCOMMENT IT WHEN NCC COME IS START****************************************/
      // setIsNCCLoader(true)
      // dispatch(getNCCExistingCosting(part.value,(res=>{
      //   if(res.data.Result){
      //     let Data = res.data.DataList
      //     setNccGrid(Data)
      //     setIsNCCLoader(false)
      //   }
      // })))

      setIsOpenVendorSOBDetails(true)
    } else {
      Toaster.warning('Please select Technology or Part.')
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
        ShareOfBusinessPercent: event.target.value,
        isSOBChanged: checkIsZBCSOBChanged(event, index),
      }
      tempArray = Object.assign([...zbcPlantGrid], { [index]: tempData })
      setZBCPlantGrid(tempArray)
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

    let tempObject = []
    if (type === ZBCTypeId) {
      tempObject = zbcPlantGrid && zbcPlantGrid[index]?.CostingOptions
    } else if (type === VBCTypeId) {
      tempObject = vbcVendorGrid && vbcVendorGrid[index]?.CostingOptions
    } else if (type === NCCTypeId) {
      // NCC GRID AT PLACE OF vbcVendorGrid
      tempObject = nccGrid && nccGrid[index]?.CostingOptions
    } else if (type === CBCTypeId) {
      tempObject = cbcGrid && cbcGrid[index]?.CostingOptions
    }

    const indexOfCostingOptions = tempObject.findIndex((el) => el.CostingId === newValue.value)

    let costingOptionsSelectedObjectTemp = {
      SubAssemblyCostingId: tempObject[indexOfCostingOptions].SubAssemblyCostingId,
      AssemblyCostingId: tempObject[indexOfCostingOptions].AssemblyCostingId
    }
    setApprovalStatus(tempObject[indexOfCostingOptions].Status)
    setCostingOptionsSelectedObject(costingOptionsSelectedObjectTemp)

    let tempArray = []

    if (type === ZBCTypeId && newValue !== '') {
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

    if (type === VBCTypeId && newValue !== '') {
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

    if (type === NCCTypeId && newValue !== '') {
      let tempData = nccGrid[index]
      let selectedOptionObj = tempData.CostingOptions.find((el) => el.CostingId === newValue.value,)

      tempData = {
        ...tempData,
        SelectedCostingVersion: newValue,
        Status: selectedOptionObj.Status,
        DisplayStatus: selectedOptionObj.DisplayStatus,
        CostingId: newValue.value,
        Price: selectedOptionObj.Price,
      }
      tempArray = Object.assign([...nccGrid], { [index]: tempData })
      setNccGrid(tempArray)
    }
    if (type === CBCTypeId && newValue !== '') {
      let tempData = cbcGrid[index]
      let selectedOptionObj = tempData.CostingOptions.find((el) => el.CostingId === newValue.value,)

      tempData = {
        ...tempData,
        SelectedCostingVersion: newValue,
        Status: selectedOptionObj.Status,
        DisplayStatus: selectedOptionObj.DisplayStatus,
        CostingId: newValue.value,
        Price: selectedOptionObj.Price,
      }
      tempArray = Object.assign([...cbcGrid], { [index]: tempData })
      setCBCGrid(tempArray)
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
   * @method clientDrawerToggle
   * @description HANDLE VBC VENDOR DRAWER TOGGLE
   */
  const clientDrawerToggle = () => {
    setIsClientDrawerOpen(true)
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
        Toaster.warning('Already added, Please select another plant.')
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
   * @method closeVendorDrawer
   * @description HIDE VENDOR DRAWER
   */
  const closeClientDrawer = (e = '', clientData = {}) => {
    console.log('clientData: ', clientData);
    if (Object.keys(clientData).length > 0) {
      //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
      const isExist = cbcGrid.findIndex(el => (el.CustomerId === clientData.CustomerId && el.DestinationPlantId === clientData.DestinationPlantId))
      if (isExist !== -1) {
        Toaster.warning('Already added, Please select another plant.')
        return false;
      }

      let tempArr = [...cbcGrid, { ...clientData, Status: '' }]
      setTimeout(() => {
        setCBCGrid(tempArr)
      }, 200)
    }
    setIsClientDrawerOpen(false)
  }

  /**
   * @method nccDrawerToggle
   * @description FOR OPENING DRAWER
  */

  const nccDrawerToggle = () => {
    setIsNCCDrawerOpen(true)
  }

  /**
   * @method closeNCCDrawer
   * @description HIDE NCC DRAWER
   */
  const closeNCCDrawer = (e = '', nccData = {}) => {
    if (Object.keys(nccData).length > 0) {
      //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
      const isExist = nccGrid.findIndex(el => (el.VendorId === nccData.VendorId && el.PlantId === nccData.PlantId))
      if (isExist !== -1) {
        Toaster.warning('Already added, Please select another vendor.')
        return false;
      }
      let tempArr = [...nccGrid, { ...nccData, Status: '' }]
      setTimeout(() => {
        setNccGrid(tempArr)
      }, 200)
    }
    setIsNCCDrawerOpen(false)
  }



  /**
   * @method closeCopyCostingDrawer
   * @description HIDE COPY COSTING DRAWER
   */
  const closeCopyCostingDrawer = (e = '', costingId = '', type = '') => {
    //nextToggle()
    setCostingOptionsSelectedObject({})
    setIsCopyCostingDrawer(false)
    dispatch(getBriefCostingById('', (res) => { }))

    if (type === ZBCTypeId) {
      setCostingData({ costingId: costingId, type })
      dispatch(getBriefCostingById(costingId, (res) => {
        setTimeout(() => {
          setStepTwo(true)
          setStepOne(false)
        }, 500)
      }))
    }

    if (type === VBCTypeId) {
      setCostingData({ costingId: costingId, type })
      dispatch(getBriefCostingById(costingId, (res) => {

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
        ShareOfBusinessPercent: event.target.value,
        isSOBChanged: checkIsVBCSOBChanged(event, index),
      }
      tempArray = Object.assign([...vbcVendorGrid], { [index]: tempData })
      setVBCVendorGrid(tempArray)
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
    let NetZBCSOB = 0
    let NetVBCSOB = 0

    NetZBCSOB = zbcPlantGrid && zbcPlantGrid.length > 0 && zbcPlantGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.ShareOfBusinessPercent)
    }, 0)

    NetVBCSOB = vbcVendorGrid && vbcVendorGrid.length > 0 && vbcVendorGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.ShareOfBusinessPercent)
    }, 0)

    return checkForNull(NetZBCSOB) + checkForNull(NetVBCSOB) > 100 ? false : true
  }

  /**
   * @method checkSOBNegativeExist
   * @description HANDLE COSTING CHANGE
   */
  const checkSOBNegativeExist = (costingHead, array) => {
    let checkIfNegative = false
    array && array.length > 0 && array.filter(el => {
      if (el.ShareOfBusinessPercent < 0) {
        checkIfNegative = true
      }
    }, 0)
    return checkIfNegative
  }

  /**
   * @method isCostingVersionSelected
   * @description HANDLE COSTING VERSION SELECTED
   */
  const isCostingVersionSelected = (index, type) => {
    if (type === ZBCTypeId) {
      let tempData = zbcPlantGrid[index]
      return tempData.SelectedCostingVersion !== undefined ? true : false
    } else if (type === VBCTypeId) {
      let tempData = vbcVendorGrid[index]
      return tempData.SelectedCostingVersion !== undefined ? true : false
    } else if (type === NCCTypeId) {
      let tempData = nccGrid[index]
      return tempData.SelectedCostingVersion !== undefined ? true : false
    } else {
      let tempData = cbcGrid[index]
      return tempData.SelectedCostingVersion !== undefined ? true : false
    }
  }

  /**
   * @method checkForError
   * @description HANDLE COSTING VERSION SELECTED
   */
  const checkForError = (index, type) => {
    if (errors && (errors.zbcPlantGridFields || errors.vbcGridFields || errors.cbcGridFields)) {
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
        Toaster.warning('SOB should not be greater than 100.')
        break
      case 'SOB_SAVED_WARNING':
        Toaster.warning('Please save SOB percentage.')
        break
      case 'COSTING_VERSION_WARNING':
        Toaster.warning('Please select a costing version.')
        break
      case 'VALID_NUMBER_WARNING':
        Toaster.warning('Please enter a valid number.')
        break
      case 'ERROR_WARNING':
        Toaster.warning('Please enter a valid number.')
        break
      default:
        break
    }
  }
  /**
   * @method addDetails
   * @description ADD DETAILS IN COSTING
   */
  const addDetails = debounce((index, type) => {
    const userDetail = userDetails()
    setCostingOptionsSelectedObject({})
    setCostingType(type)

    if (CheckIsSOBChangedSaved()) {
      warningMessageHandle('SOB_SAVED_WARNING')
      return false;
    }

    dispatch(getBriefCostingById('', (res) => { }))

    if (checkSOBTotal()) {

      let tempData;
      if (type === VBCTypeId) {
        tempData = vbcVendorGrid[index]
      } else if (type === NCCTypeId) {
        tempData = nccGrid[index]
      } else if (type === ZBCTypeId) {
        tempData = zbcPlantGrid[index]
      } else if (type === CBCTypeId) {
        tempData = cbcGrid[index]
      }
      console.log('tempData: ', tempData);

      console.log('CBCTypeIdgggbb: ', CBCTypeId);
      console.log('type: ', type);
      const userDetailsCosting = JSON.parse(localStorage.getItem('userDetail'))
      console.log('userDetailsCosting: ', userDetailsCosting.Plants[0].PlantName);
      const data = {
        PartId: part.value,
        PartTypeId: partInfo.PartTypeId,
        PartType: partInfo.PartType,
        TechnologyId: technology.value,
        ZBCId: userDetail.ZBCSupplierInfo.VendorId,
        VendorId: tempData.VendorId,
        VendorPlantId: checkVendorPlantConfigurable() ? tempData.VendorPlantId : '',
        VendorPlantName: tempData.VendorPlantName,
        VendorPlantCode: tempData.VendorPlantCode,
        VendorName: tempData.VendorName,
        VendorCode: tempData.VendorCode,
        PlantId: (type === ZBCTypeId) ? tempData.PlantId : EMPTY_GUID,
        PlantName: (type === ZBCTypeId) ? tempData.PlantName : '',
        PlantCode: (type === ZBCTypeId) ? tempData.PlantCode : '',
        DestinationPlantId: (initialConfiguration?.IsDestinationPlantConfigure && (type === VBCTypeId || type === NCCTypeId)) || type === CBCTypeId ? tempData?.DestinationPlantId : userDetailsCosting.Plants[0].PlantId,
        DestinationPlantName: (initialConfiguration?.IsDestinationPlantConfigure && (type === VBCTypeId || type === NCCTypeId)) || type === CBCTypeId ? tempData?.DestinationPlantName : userDetailsCosting.Plants[0].PlantName,
        DestinationPlantCode: (initialConfiguration?.IsDestinationPlantConfigure && (type === VBCTypeId || type === NCCTypeId)) || type === CBCTypeId ? tempData?.DestinationPlantCode : userDetailsCosting.Plants[0].PlantCode,
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
        CostingTypeId: type,
        CustomerId: type === CBCTypeId ? tempData.CustomerId : EMPTY_GUID,
        CustomerName: type === CBCTypeId ? tempData.CustomerName : ''
      }

      dispatch(createCosting(data, (res) => {
        if (res.data.Result) {
          dispatch(getBriefCostingById(res.data.Data.CostingId, () => {
            setIsCostingViewMode(false)
            setIsCostingEditMode(false)
            setIsCopyCostingMode(false)
            setStepTwo(true)
            setStepOne(false)
          }))
          setPartInfo(res.data.Data)
          setCostingData({ costingId: res.data.Data.CostingId, type })
        }
      }),
      )
    }
    else {
      Toaster.warning('SOB should not be greater than 100.')
    }
  }, 500)

  /**
   * @method viewDetails
   * @description VIEW COSTING DETAILS IN READ ONLY MODE
   */
  const viewDetails = (index, type) => {
    setCostingType(type)
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
      setIsCostingEditMode(false)
      setIsCopyCostingMode(false)
      moveToCostingDetail(index, type)
    }
  }

  /**
   * @method editCosting
   * @description EDIT COSTING DETAILS
   */
  const editCosting = (index, type) => {
    setCostingType(type)
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
      setIsCostingEditMode(true)
      setIsCopyCostingMode(false)
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
      return null
    })

    vbcVendorGrid && vbcVendorGrid.map((el) => {
      if (el.isSOBChanged) {
        IsSOBChanged = true;
      }
      return null
    })

    return IsSOBChanged;
  }

  /**
   * @method moveToCostingDetail
   * @description MOVE TO COSTING DETAIL
   */
  const moveToCostingDetail = (index, type) => {
    dispatch(getBriefCostingById('', (res) => { }))

    if (type === ZBCTypeId) {
      let tempData = zbcPlantGrid[index]
      setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      dispatch(getBriefCostingById(tempData.SelectedCostingVersion.value, (res) => {
        setTimeout(() => {
          setStepTwo(true)
          setStepOne(false)
        }, 500)
      }))
    }

    if (type === VBCTypeId) {
      let tempData = vbcVendorGrid[index]
      setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      dispatch(getBriefCostingById(tempData.SelectedCostingVersion.value, (res) => {


        setTimeout(() => {
          setStepTwo(true)
          setStepOne(false)
        }, 500)
      }))
    }

    if (type === NCCTypeId) {
      let tempData = nccGrid[index]
      setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      dispatch(getBriefCostingById(tempData.SelectedCostingVersion.value, (res) => {
        setTimeout(() => {
          setStepTwo(true)
          setStepOne(false)
        }, 500)
      }))
    }
    if (type === CBCTypeId) {
      let tempData = cbcGrid[index]
      setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      dispatch(getBriefCostingById(tempData.SelectedCostingVersion.value, (res) => {
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
    setCostingType(type)
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
      setIsCostingEditMode(false)
      setIsCopyCostingDrawer(true)
      setIsCopyCostingMode(true)

      if (type === ZBCTypeId) {
        const tempcopyCostingData = zbcPlantGrid[index]
        setCopyCostingData(tempcopyCostingData)
        setCostingIdForCopy({
          zbcCosting: getValues(`${zbcPlantGridFields}[${index}]CostingVersion`),
          vbcCosting: '',
          cbcCosting: ''
        })
      }
      else if (type === VBCTypeId) {
        const tempcopyCostingData = vbcVendorGrid[index]
        setCopyCostingData(tempcopyCostingData)
        setCostingIdForCopy({
          zbcCosting: '',
          vbcCosting: getValues(`${vbcGridFields}[${index}]CostingVersion`),
          cbcCosting: ''
        })
      } else if (type === NCCTypeId) {
        const tempcopyCostingData = nccGrid[index]
        setCopyCostingData(tempcopyCostingData)
        setCostingIdForCopy({
          zbcCosting: '',
          nccCosting: getValues(`${nccGridFields}[${index}]CostingVersion`),
          vbcCosting: '',
          cbcCosting: ''
        })
      } else if (type === CBCTypeId) {
        const tempcopyCostingData = cbcGrid[index]
        setCopyCostingData(tempcopyCostingData)
        setCostingIdForCopy({
          zbcCosting: '',
          cbcCosting: getValues(`${cbcGridFields}[${index}]CostingVersion`),
          vbcCosting: '',
          nccCosting: ''
        })
        setType(type)
      }
    }
  }

  /**
  * @method deleteItem
  * @description CONFIRM DELETE COSTINGS
  */
  const deleteItem = (Item, index, type) => {
    setCostingType(type)
    setShowPopup(true)
    setCostingObj({ item: Item, type: type, index: index })

  }

  /**
   * @method deleteCosting
   * @description USED FOR DELETE COSTING
   */
  const deleteCosting = (Item, index, type) => {
    let reqData = { Id: Item.CostingId, UserId: loggedInUserId() }
    dispatch(deleteDraftCosting(reqData, () => {
      setIsCostingViewMode(false)
      setIsCostingEditMode(false)
      setIsCopyCostingMode(false)
      let tempArray = []

      if (type === ZBCTypeId) {
        let tempData = zbcPlantGrid[index]
        let selectedOptionObj = tempData.CostingOptions.filter((el) => el.CostingId !== Item.CostingId)

        tempData = {
          ...tempData,
          CostingOptions: selectedOptionObj,
          CostingId: Item.CostingId,
          DisplayStatus: '',
          Price: '',
          Status: '',
        }
        tempArray = Object.assign([...zbcPlantGrid], { [index]: tempData })
        setZBCPlantGrid(tempArray)
        setValue(`zbcPlantGridFields.${index}.CostingVersion`, '')
      }

      if (type === VBCTypeId) {
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

      if (type === NCCTypeId) {
        let tempData = nccGrid[index]
        let selectedOptionObj = tempData.CostingOptions.filter((el) => el.CostingId !== Item.CostingId)

        tempData = {
          ...tempData,
          CostingOptions: selectedOptionObj,
          CostingId: Item.CostingId,
          DisplayStatus: '',
          Price: '',
        }
        tempArray = Object.assign([...nccGrid], { [index]: tempData })
        setNccGrid(tempArray)
        setValue(`${nccGridFields}.${index}.CostingVersion`, '')
      }
      if (type === CBCTypeId) {
        let tempData = cbcGrid[index]
        let selectedOptionObj = tempData.CostingOptions.filter((el) => el.CostingId !== Item.CostingId)

        tempData = {
          ...tempData,
          CostingOptions: selectedOptionObj,
          CostingId: Item.CostingId,
          DisplayStatus: '',
          Price: '',
        }
        tempArray = Object.assign([...cbcGrid], { [index]: tempData })
        setCBCGrid(tempArray)
        setValue(`${cbcGridFields}.${index}.CostingVersion`, '')
      }
    }))
    setShowPopup(false)
  }

  /**
* @method deleteRowItem
* @description CONFIRM DELETE COSTINGS
*/
  const deleteRowItem = (index, type) => {
    setCostingType(type)

    if (type === ZBCTypeId) {
      let tempArr = zbcPlantGrid && zbcPlantGrid.filter((el, i) => {
        if (i === index) return false;
        return true;
      })
      setZBCPlantGrid(tempArr)
    }

    if (type === VBCTypeId) {
      let tempArr = vbcVendorGrid && vbcVendorGrid.filter((el, i) => {
        if (i === index) return false;
        return true;
      })
      setVBCVendorGrid(tempArr)
    }

    if (type === NCCTypeId) {
      let tempArr = nccGrid && nccGrid.filter((el, i) => {
        if (i === index) return false;
        return true;
      })
      setNccGrid(tempArr)
    }

    if (type === CBCTypeId) {
      let tempArr = cbcGrid && cbcGrid.filter((el, i) => {
        if (i === index) return false;
        return true;
      })
      setCBCGrid(tempArr)
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
    setNccGrid([])
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
    dispatch(getBriefCostingById('', (res) => { }))

    reactLocalStorage.setObject('costingArray', [])
    reactLocalStorage.setObject('surfaceCostingArray', [])
    dispatch(setRMCCData([], () => { }))                            //THIS WILL CLEAR RM CC REDUCER
    dispatch(setComponentItemData({}, () => { }))

    dispatch(setOverheadProfitData([], () => { }))              //THIS WILL CLEAR OVERHEAD PROFIT REDUCER
    dispatch(setComponentOverheadItemData({}, () => { }))       //THIS WILL CLEAR OVERHEAD PROFIT ITEM REDUCER


    dispatch(setPackageAndFreightData([], () => { }))           //THIS WILL CLEAR PACKAGE FREIGHT ITEM DATA
    dispatch(setComponentPackageFreightItemData({}, () => { })) //THIS WILL CLEAR PACKAGE FREIGHT ITEM DATA

    dispatch(setToolTabData([], () => { }))                     //THIS WILL CLEAR TOOL ARR FROM REDUCER  
    dispatch(setComponentToolItemData({}, () => { }))           //THIS WILL CLEAR TOOL ITEM DATA FROM REDUCER

    dispatch(setComponentDiscountOtherItemData({}, () => { }))  //THIS WILL CLEAR DISCOUNT ITEM DATA FROM REDUCER

    dispatch(saveAssemblyBOPHandlingCharge({}, () => { }))

    dispatch(gridDataAdded(false)) //BASIS OF GRID DATA DISABLED/ENABLED COSTING EFFECTIVE DATE
    setStepOne(true);
    setStepTwo(false);

    resetGrid()
    setZBCPlantGrid([])
    setVBCVendorGrid([])
    setNccGrid([])
    dispatch(setSurfaceCostData({}, () => { }))

    setTimeout(() => {

      nextToggle()
    }, 700);

    dispatch(getPartInfo(part.value !== undefined ? part.value : partNumber.partId, (res) => {
      let Data = res.data.Data;
      setValue('PartName', Data.PartName)
      setValue("Description", Data.Description)
      setValue("ECNNumber", Data.ECNNumber)
      setValue("DrawingNumber", Data.DrawingNumber)
      setValue("RevisionNumber", Data.RevisionNumber)
      setValue("ShareOfBusiness", Data.Price)
      setEffectiveDate(DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate).format('MM/DD/YYYY') : '')
    }))
    setCostingOptionsSelectedObject({})
    dispatch(setProcessGroupGrid([]))
    dispatch(savePartNumber(''))
    dispatch(saveBOMLevel(''))
    dispatch(setPartNumberArrayAPICALL([]))
    dispatch(isDataChange(false))
    dispatch(saveAssemblyNumber([]))

  }

  /**
   * @method resetGrid
   * @description TO RESET THE GRID DATA OF ZBC,VBC AND CBC (COSTING VVERSION RESET)
   */
  const resetGrid = () => {

    // BELOW CODE IS USED TO REMOVE COSTING VERSION FROM ZBC GRIDS
    zbcPlantGrid && zbcPlantGrid.map((el, index) => {
      setValue(`${zbcPlantGridFields}.${index}.CostingVersion`, '')
      setValue('ShareOfBusinessPercent', '')
      return null;
    })

    // BELOW CODE IS USED TO REMOVE COSTING VERSION FROM VBC GRIDS
    vbcVendorGrid && vbcVendorGrid.map((el, index) => {
      setValue(`${vbcGridFields}.${index}.CostingVersion`, '')
      setValue('ShareOfBusinessPercent', '')
      return null;
    })

    // BELOW CODE IS USED TO REMOVE COSTING VERSION NCC FROM GRIDS
    nccGrid && nccGrid.map((el, index) => {
      setValue(`${nccGridFields}.${index}.CostingVersion`, '')
      setValue('ShareOfBusinessPercent', '')
      return null;
    })

    // BELOW CODE IS USED TO REMOVE COSTING VERSION FROM CBC GRIDS
    cbcGrid && cbcGrid.map((el, index) => {
      setValue(`${cbcGridFields}.${index}.CostingVersion`, '')
      setValue('ShareOfBusinessPercent', '')
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
        Toaster.warning('SOB should not be greater than 100.')
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
        SOBUpdateAlert(ZBCTypeId)
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
    // return Toaster.confirm(`${'You have changed SOB percent So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
  }

  const setCostingOptionSelect = () => {
    setCostingOptionsSelectedObject({})
  }
  /**
   * @method confirmSOBUpdate
   * @description CONFIRM SOB UPDATE
   */
  const confirmSOBUpdate = (type) => {
    if (type === ZBCTypeId) {
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

    if (type === VBCTypeId) {
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
        Toaster.warning('SOB should not be greater than 100.')
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
        SOBUpdateAlert(VBCTypeId)
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
  const nccGridFields = 'nccGridFields'
  const cbcGridFields = 'cbcGridFields'

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
    if (!isZBCSOBEnabled) {
      let findIndex = zbcPlantGrid && zbcPlantGrid.length > 0 && zbcPlantGrid.findIndex(el => isNaN(el.ShareOfBusinessPercent) === true)
      if (!checkSOBTotal()) {
        Toaster.warning('SOB should not be greater than 100.')
        return false
      } else if (checkSOBNegativeExist(ZBCTypeId, zbcPlantGrid)) {
        Toaster.warning('SOB could not be negative.')
        return false;
      } else if (findIndex !== -1) {
        Toaster.warning('SOB could not be empty.')
        return false;
      } else {
        setZBCEnableSOBField(!isZBCSOBEnabled)
      }
    } else {
      setZBCEnableSOBField(!isZBCSOBEnabled)
    }
  }

  /**
   * @method onSubmit
   * @description UPDATE isVBCSOBEnabled STATE
   */
  const updateVBCState = () => {
    if (!isVBCSOBEnabled) {
      let findIndex = vbcVendorGrid && vbcVendorGrid.length > 0 && vbcVendorGrid.findIndex(el => isNaN(el.ShareOfBusinessPercent) === true)
      if (!checkSOBTotal()) {
        Toaster.warning('SOB should not be greater than 100.')
        return false
      } else if (checkSOBNegativeExist(VBCTypeId, vbcVendorGrid)) {
        Toaster.warning('SOB could not be negative.')
        return false;
      } else if (findIndex !== -1) {
        Toaster.warning('SOB could not be empty.')
        return false;
      } else {
        setVBCEnableSOBField(!isVBCSOBEnabled)
      }
    } else {
      setVBCEnableSOBField(!isVBCSOBEnabled)
    }
  }

  const onPopupConfirm = () => {
    const { item, type, index } = costingObj;
    deleteCosting(item, index, type);
  }

  const closePopUp = () => {
    setShowPopup(false)
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

  const loaderObj = { isLoader: inputLoader, }
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
          {stepOne && <button onClick={bulkToggle} className="btn btn-link text-primary pr-0">
            <div className="add-rounded m-auto"></div>
            <span className="d-block mt-1">ADD BOM</span>
          </button>}
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
                        <AsyncSearchableSelectHookForm
                          label={"Assembly/Part No."}
                          name={"Part"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={part.length !== 0 ? part : ""}
                          asyncOptions={promiseOptions}
                          mandatory={true}
                          isLoading={loaderObj}
                          handleChange={handlePartChange}
                          errors={errors.Part}
                          disabled={(technology.length === 0 || inputLoader) ? true : false}
                          NoOptionMessage={"Please enter first few digits to see the part numbers"}
                        />
                      </Col>
                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly/Part Name"
                          name={"PartName"}
                          title={titleObj.partNameTitle}
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
                          placeholder="-"
                        />
                      </Col>
                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly/Part Description"
                          name={"Description"}
                          title={titleObj.descriptionTitle}
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
                          placeholder="-"
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
                          placeholder="-"
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
                          placeholder="-"
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
                          placeholder="-"
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
                          placeholder="-"
                        />
                      </Col>
                      <Col className="col-md-15">
                        <div className="form-group">
                          <label>Effective Date</label>
                          <div className="inputbox date-section">
                            { }
                            <DatePicker
                              name="EffectiveDate"
                              selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                              onChange={handleEffectiveDateChange}
                              showMonthDropdown
                              showYearDropdown
                              dateFormat="dd/MM/yyyy"
                              // maxDate={new Date()}
                              dropdownMode="select"
                              placeholderText="-"
                              className="withBorder"
                              autoComplete={"off"}
                              disabledKeyboardNavigation
                              onChangeRaw={(e) => e.preventDefault()}
                              disabled={true}
                              placeholder="-"
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
                              <div className={"plus"}></div>PLANT
                            </button>
                          </Col>
                        </Row>

                        {/* ZBC PLANT GRID FOR COSTING */}
                        <Row>
                          <Col md="12" className={"costing-table-container"}>
                            <Table
                              className="table cr-brdr-main costing-table-next costing-table-zbc"
                              size="sm"
                            >
                              <thead>
                                <tr>
                                  <th className='vendor'>{`Plant`}</th>
                                  <th className="share-of-business">{`SOB(%)`}{SOBAccessibility && zbcPlantGrid.length > 0 && <button className="edit-details-btn ml5" type={"button"} onClick={updateZBCState} />}</th>
                                  <th className="costing-version" >{`Costing Version`}</th>
                                  <th className="text-center costing-status" >{`Status`}</th>
                                  <th className="costing-price">{`Price`}</th>
                                  <th className="costing-action text-right pr-2">{`Actions`}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {isZBCLoader ? <LoaderCustom customClass={'costing-table'} /> : ''}
                                {zbcPlantGrid &&
                                  zbcPlantGrid.map((item, index) => {

                                    let displayCopyBtn = (item.Status !== REJECTED_BY_SYSTEM && item.Status !== '-') ? true : false;

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
                                              handleCostingChange(newValue, ZBCTypeId, index)
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
                                          <div className='action-btn-wrapper pr-2'>
                                            {AddAccessibility && <button className="Add-file" type={"button"} title={"Add Costing"} onClick={() => addDetails(index, ZBCTypeId)} />}
                                            {ViewAccessibility && !item.IsNewCosting && item.Status !== '-' && (<button className="View " type={"button"} title={"View Costing"} onClick={() => viewDetails(index, ZBCTypeId)} />)}
                                            {EditAccessibility && !item.IsNewCosting && displayEditBtn && (<button className="Edit " type={"button"} title={"Edit Costing"} onClick={() => editCosting(index, ZBCTypeId)} />)}
                                            {CopyAccessibility && !item.IsNewCosting && displayCopyBtn && (<button className="Copy All " type={"button"} title={"Copy Costing"} onClick={() => copyCosting(index, ZBCTypeId)} />)}
                                            {DeleteAccessibility && !item.IsNewCosting && displayDeleteBtn && (<button className="Delete All" type={"button"} title={"Delete Costing"} onClick={() => deleteItem(item, index, ZBCTypeId)} />)}
                                            {item?.CostingOptions?.length === 0 && <button className="CancelIcon" type={'button'} onClick={() => deleteRowItem(index, ZBCTypeId)} />}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                {zbcPlantGrid && zbcPlantGrid.length === 0 && (
                                  <tr>
                                    <td colSpan={7}>
                                      <NoContentFound
                                        title={EMPTY_DATA}
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

                    {/* ****************************************NCC UI HERE************************************************************* */}
                    {IsOpenVendorSOBDetails && (
                      <>
                        <Row className="align-items-center">
                          <Col md={'6'} className={"mb-2 mt-3"}>
                            <h6 className="dark-blue-text sec-heading">NCC:</h6>
                          </Col>
                          <Col md="6" className={"mb-2 mt-3"}>
                            {nccGrid && nccGrid.length < initialConfiguration.NumberOfVendorsForCostDetails ? (
                              <button
                                type="button"
                                className={"user-btn"}
                                onClick={nccDrawerToggle}
                              >
                                <div className={"plus"}></div>Vendor
                              </button>
                            ) : (
                              ""
                            )}
                          </Col>
                        </Row>

                        {/* NCC PLANT GRID FOR COSTING */}
                        <Row>
                          <Col md="12" className={"costing-table-container"}>
                            <Table
                              className="table cr-brdr-main costing-table-next costing-table-vbc"
                              size="sm"
                            >
                              <thead>
                                <tr>
                                  <th className="destination-plant">{`Plant`}</th>
                                  <th className='vendor'>{`Vendor`}</th>

                                  <th className="costing-version">{`Costing Version`}</th>
                                  <th className="text-center costing-status">{`Status`}</th>
                                  <th className="costing-price">{`Price`}</th>
                                  <th className="costing-action text-right">{`Actions`}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {nccGrid && nccGrid.map((item, index) => {
                                  let displayEditBtn = (item.Status === DRAFT) ? true : false;
                                  let displayCopyBtn = (item.Status !== REJECTED_BY_SYSTEM && item.Status !== '') ? true : false;
                                  let displayDeleteBtn = (item.Status === DRAFT) ? true : false;

                                  return (
                                    <tr key={index}>
                                      <td>{item.DestinationPlantName ? `${item.DestinationPlantName}(${item.DestinationPlantCode})` : ''}</td>
                                      <td>{item.VendorName ? `${item.VendorName}(${item.VendorCode})` : '-'}</td>

                                      <td className="cr-select-height w-100px">
                                        <SearchableSelectHookForm
                                          label={""}
                                          name={`${nccGridFields}.${index}.CostingVersion`}
                                          placeholder={"Select"}
                                          Controller={Controller}
                                          control={control}
                                          rules={{ required: false }}
                                          register={register}
                                          defaultValue={item.SelectedCostingVersion}
                                          options={renderCostingOption(item.CostingOptions)}
                                          mandatory={false}
                                          handleChange={(newValue) => handleCostingChange(newValue, NCCTypeId, index)}
                                          errors={`${nccGridFields}[${index}]CostingVersion`}
                                        />
                                      </td>
                                      <td className="text-center">
                                        <div className={item.CostingId !== EMPTY_GUID ? item.Status : ''}>
                                          {item.DisplayStatus}
                                        </div>
                                      </td>
                                      <td>{item.Price ? checkForDecimalAndNull(item.Price, getConfigurationKey().NoOfDecimalForPrice) : 0}</td>
                                      <td>
                                        <div className='action-btn-wrapper pr-2'>
                                          {AddAccessibility && <button className="Add-file" type={"button"} title={"Add Costing"} onClick={() => addDetails(index, NCCTypeId)} />}
                                          {ViewAccessibility && !item.IsNewCosting && item.Status !== '' && (<button className="View" type={"button"} title={"View Costing"} onClick={() => viewDetails(index, NCCTypeId)} />)}
                                          {EditAccessibility && !item.IsNewCosting && displayEditBtn && (<button className="Edit" type={"button"} title={"Edit Costing"} onClick={() => editCosting(index, NCCTypeId)} />)}
                                          {CopyAccessibility && !item.IsNewCosting && displayCopyBtn && (<button className="Copy All" title={"Copy Costing"} type={"button"} onClick={() => copyCosting(index, NCCTypeId)} />)}
                                          {DeleteAccessibility && !item.IsNewCosting && displayDeleteBtn && (<button className="Delete All" title={"Delete Costing"} type={"button"} onClick={() => deleteItem(item, index, NCCTypeId)} />)}
                                          {item?.CostingOptions?.length === 0 && <button className="CancelIcon" type={'button'} onClick={() => deleteRowItem(index, NCCTypeId)} />}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                                {nccGrid.length === 0 && (
                                  <tr>
                                    <td colSpan={7}>
                                      <NoContentFound
                                        title={EMPTY_DATA}
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
                                <div className={"plus"}></div>VENDOR
                              </button>
                            ) : (
                              ""
                            )}
                          </Col>
                        </Row>

                        {/* VBC PLANT GRID FOR COSTING */}
                        <Row>
                          <Col md="12" className={"costing-table-container"}>
                            <Table
                              className="table cr-brdr-main costing-table-next costing-table-vbc"
                              size="sm"
                            >
                              <thead>
                                <tr>
                                  <th className='vendor'>{`Vendor`}</th>
                                  {initialConfiguration?.IsDestinationPlantConfigure && <th className="destination-plant">{`Destination Plant`}</th>}
                                  <th className="share-of-business">{`SOB(%)`}{SOBAccessibility && vbcVendorGrid.length > 0 && <button className="edit-details-btn ml5" type={"button"} onClick={updateVBCState} />}</th>
                                  <th className="costing-version">{`Costing Version`}</th>
                                  <th className="text-center costing-status">{`Status`}</th>
                                  <th className="costing-price">{`Price`}</th>
                                  <th className="costing-action text-right">{`Actions`}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {isVBCLoader ? <LoaderCustom customClass={'costing-table'} /> : ''}
                                {vbcVendorGrid && vbcVendorGrid.map((item, index) => {
                                  let displayEditBtn = (item.Status === DRAFT) ? true : false;
                                  let displayCopyBtn = (item.Status !== REJECTED_BY_SYSTEM && item.Status !== '') ? true : false;
                                  let displayDeleteBtn = (item.Status === DRAFT) ? true : false;

                                  return (
                                    <tr key={index}>
                                      <td className='break-word'>{`${item.VendorName}(${item.VendorCode})`}</td>
                                      {initialConfiguration?.IsDestinationPlantConfigure && <td className='break-word'>{item?.DestinationPlantName ? `${item.DestinationPlantName}(${item.DestinationPlantCode})` : ''}</td>}
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
                                          handleChange={(newValue) => handleCostingChange(newValue, VBCTypeId, index)}
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
                                        <div className='action-btn-wrapper pr-2'>
                                          {AddAccessibility && <button className="Add-file" type={"button"} title={"Add Costing"} onClick={() => addDetails(index, VBCTypeId)} />}
                                          {ViewAccessibility && !item.IsNewCosting && item.Status !== '' && (<button className="View" type={"button"} title={"View Costing"} onClick={() => viewDetails(index, VBCTypeId)} />)}
                                          {EditAccessibility && !item.IsNewCosting && displayEditBtn && (<button className="Edit" type={"button"} title={"Edit Costing"} onClick={() => editCosting(index, VBCTypeId)} />)}
                                          {CopyAccessibility && !item.IsNewCosting && displayCopyBtn && (<button className="Copy All" title={"Copy Costing"} type={"button"} onClick={() => copyCosting(index, VBCTypeId)} />)}
                                          {DeleteAccessibility && !item.IsNewCosting && displayDeleteBtn && (<button className="Delete All" title={"Delete Costing"} type={"button"} onClick={() => deleteItem(item, index, VBCTypeId)} />)}
                                          {item?.CostingOptions?.length === 0 && <button className="CancelIcon" type={'button'} onClick={() => deleteRowItem(index, VBCTypeId)} />}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                                {vbcVendorGrid.length === 0 && (
                                  <tr>
                                    <td colSpan={7}>
                                      <NoContentFound
                                        title={EMPTY_DATA}
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
                            <h6 className="dark-blue-text sec-heading">CBC:</h6>
                          </Col>
                          <Col md="6" className={"mb-2 mt-3"}>
                            {cbcGrid && cbcGrid.length < initialConfiguration.NumberOfVendorsForCostDetails ? (
                              <button
                                type="button"
                                className={"user-btn"}
                                onClick={clientDrawerToggle}
                              >
                                <div className={"plus"}></div>Customer
                              </button>
                            ) : (
                              ""
                            )}
                          </Col>
                        </Row>

                        {/* VBC PLANT GRID FOR COSTING */}
                        <Row>
                          <Col md="12" className={"costing-table-container"}>
                            <Table
                              className="table cr-brdr-main costing-table-next costing-table-vbc"
                              size="sm"
                            >
                              <thead>
                                <tr>
                                  <th className='vendor'>{`Customer`}</th>
                                  {getConfigurationKey().IsCBCApplicableOnPlant && <th className="destination-plant">{`Destination Plant`}</th>}
                                  <th className="costing-version">{`Costing Version`}</th>
                                  <th className="text-center costing-status">{`Status`}</th>
                                  <th className="costing-price">{`Price`}</th>
                                  <th className="costing-action text-right">{`Actions`}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {isVBCLoader ? <LoaderCustom customClass={'costing-table'} /> : ''}
                                {cbcGrid && cbcGrid?.map((item, index) => {
                                  let displayEditBtn = (item.Status === DRAFT) ? true : false;
                                  let displayCopyBtn = (item.Status !== REJECTED_BY_SYSTEM) ? true : false;
                                  let displayDeleteBtn = (item.Status === DRAFT) ? true : false;

                                  return (
                                    <tr key={index}>
                                      <td>{item.CustomerName ? `${item.CustomerName}` : '-'}</td>
                                      {getConfigurationKey().IsCBCApplicableOnPlant && <td>{item.DestinationPlantName ? `${item.DestinationPlantName}(${item.DestinationPlantCode})` : ''}</td>}
                                      <td className="cr-select-height w-100px">
                                        <SearchableSelectHookForm
                                          label={""}
                                          name={`${cbcGridFields}.${index}.CostingVersion`}
                                          placeholder={"Select"}
                                          Controller={Controller}
                                          control={control}
                                          rules={{ required: false }}
                                          register={register}
                                          defaultValue={item.SelectedCostingVersion}
                                          options={renderCostingOption(item.CostingOptions)}
                                          mandatory={false}
                                          handleChange={(newValue) => handleCostingChange(newValue, CBCTypeId, index)}
                                          errors={`${cbcGridFields}[${index}]CostingVersion`}
                                        />
                                      </td>
                                      <td className="text-center">
                                        <div className={item.CostingId !== EMPTY_GUID ? item.Status : ''}>
                                          {item.DisplayStatus}
                                        </div>
                                      </td>
                                      <td>{item.Price ? checkForDecimalAndNull(item.Price, getConfigurationKey().NoOfDecimalForPrice) : 0}</td>
                                      <td>
                                        <div className='action-btn-wrapper pr-2'>
                                          {AddAccessibility && <button className="Add-file" type={"button"} title={"Add Costing"} onClick={() => addDetails(index, CBCTypeId)} />}
                                          {ViewAccessibility && !item.IsNewCosting && item.Status !== '' && (<button className="View" type={"button"} title={"View Costing"} onClick={() => viewDetails(index, CBCTypeId)} />)}
                                          {EditAccessibility && !item.IsNewCosting && displayEditBtn && (<button className="Edit" type={"button"} title={"Edit Costing"} onClick={() => editCosting(index, CBCTypeId)} />)}
                                          {CopyAccessibility && !item.IsNewCosting && displayCopyBtn && (<button className="Copy All" title={"Copy Costing"} type={"button"} onClick={() => copyCosting(index, CBCTypeId)} />)}
                                          {DeleteAccessibility && !item.IsNewCosting && displayDeleteBtn && (<button className="Delete All" title={"Delete Costing"} type={"button"} onClick={() => deleteItem(item, index, CBCTypeId)} />)}
                                          {item?.CostingOptions?.length === 0 && <button className="CancelIcon" type={'button'} onClick={() => deleteRowItem(index, CBCTypeId)} />}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                                {cbcGrid.length === 0 && (
                                  <tr>
                                    <td colSpan={7}>
                                      <NoContentFound
                                        title={EMPTY_DATA}
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
                  <CostingTypeContext.Provider value={costingType}>
                    <ViewCostingContext.Provider value={IsCostingViewMode} >
                      <EditCostingContext.Provider value={IsCostingEditMode} >
                        <CopyCostingContext.Provider value={IsCopyCostingMode} >
                          <VbcExistingCosting.Provider value={costingOptionsSelectedObject} >
                            <CostingStatusContext.Provider value={approvalStatus}>
                              <CostingDetailStepTwo
                                backBtn={backToFirstStep}
                                partInfo={Object.keys(props.partInfoStepTwo).length > 0 ? props.partInfoStepTwo : partInfoStepTwo}
                                costingInfo={Object.keys(props.costingData).length > 0 ? props.costingData : costingData}
                                toggle={props.toggle}
                                IsCostingViewMode={IsCostingViewMode}
                                IsCopyCostingMode={IsCopyCostingMode}
                              />
                            </CostingStatusContext.Provider>
                          </VbcExistingCosting.Provider>
                        </CopyCostingContext.Provider>
                      </EditCostingContext.Provider>
                    </ViewCostingContext.Provider>
                  </CostingTypeContext.Provider>
                )}
              </form>
            </div>
            {
              showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.COSTING_DELETE_ALERT}`} />
            }
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
      {IsClientDrawerOpen && (
        <AddClientDrawer
          isOpen={IsClientDrawerOpen}
          closeDrawer={closeClientDrawer}
          isEditFlag={false}
          cbcGrid={[]}
          ID={""}
          anchor={"right"}
        />
      )}
      {isNCCDrawerOpen && (
        <AddNCCDrawer
          isOpen={isNCCDrawerOpen}
          closeDrawer={closeNCCDrawer}
          isEditFlag={false}
          nccGrid={nccGrid}
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
          nccGrid={nccGrid}
          partNo={getValues("Part")}
          type={type}
          selectedCostingId={costingIdForCopy}
          //isEditFlag={false}
          anchor={"right"}
          setCostingOptionSelect={setCostingOptionSelect}
        />
      )}

      {IsBulkOpen && <BOMUploadDrawer
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

export default React.memo(CostingDetails)
