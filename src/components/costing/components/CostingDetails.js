import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Table } from 'reactstrap'
import {
  TextFieldHookForm,
  SearchableSelectHookForm,
  TextFieldHooks,
} from '../../layout/HookFormInputs'
import {
  getCostingTechnologySelectList,
  getAllPartSelectList,
  getPartInfo,
  checkPartWithTechnology,
  createZBCCosting,
  createVBCCosting,
  getZBCExistingCosting,
  getVBCExistingCosting,
  updateZBCSOBDetail,
  updateVBCSOBDetail,
} from '../actions/Costing'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import AddPlantDrawer from './AddPlantDrawer'
import NoContentFound from '../../common/NoContentFound'
import { CONSTANT } from '../../../helper/AllConastant'
import AddVendorDrawer from './AddVendorDrawer'
import { toastr } from 'react-redux-toastr'
import { checkForNull, loggedInUserId, userDetails } from '../../../helper'
import $ from 'jquery'
import moment from 'moment'
import CostingDetailStepTwo from './CostingDetailStepTwo'
import { VBC, ZBC } from '../../../config/constants'
import { reactLocalStorage } from 'reactjs-localstorage'

function CostingDetails() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    errors,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    //defaultValues: {},
    //resolver: undefined,
    //context: undefined,
    //criteriaMode: "firstError",
    //shouldFocusError: true,
    //shouldUnregister: true,
  })
  const inputRef = useRef()

  const [isEditFlag, setIsEditFlag] = useState(false)
  const [technology, setTechnology] = useState([])
  const [IsTechnologySelected, setIsTechnologySelected] = useState(false)
  const [part, setPart] = useState([])
  const [effectiveDate, setEffectiveDate] = useState('')
  const [IsOpenVendorSOBDetails, setIsOpenVendorSOBDetails] = useState(false)
  const [isSOBEnabled, setEnableSOBField] = useState(true)

  const [IsPlantDrawerOpen, setIsPlantDrawerOpen] = useState(false)
  const [zbcPlantGrid, setZBCPlantGrid] = useState([])
  const [zbcPlantOldArray, setzbcPlantOldArray] = useState([])

  const [IsVendorDrawerOpen, setIsVendorDrawerOpen] = useState(false)
  const [vbcVendorGrid, setVBCVendorGrid] = useState([])
  const [vbcVendorOldArray, setvbcVendorOldArray] = useState([])

  const [stepOne, setStepOne] = useState(true)
  const [stepTwo, setStepTwo] = useState(false)
  const [partInfoStepTwo, setPartInfo] = useState({})
  const [costingData, setCostingData] = useState({})

  //console.log('watch', watch('zbcPlantGridFields'))
  const fieldValues = useWatch({
    control,
    name: ['zbcPlantGridFields', 'vbcGridFields', 'Technology'],
    //defaultValue: 'default' // default value before the render
  })

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getCostingTechnologySelectList(() => {}))
    dispatch(getAllPartSelectList(() => {}))
    dispatch(getPartInfo('', () => {}))
  }, [])

  const technologySelectList = useSelector(
    (state) => state.costing.technologySelectList,
  )
  const partSelectList = useSelector((state) => state.costing.partSelectList)
  const partInfo = useSelector((state) => state.costing.partInfo)
  const initialConfiguration = useSelector(
    (state) => state.auth.initialConfiguration,
  )

  /**
   * @method renderListing
   * @description Used show listing of unit of measurement
   */
  const renderListing = (label) => {
    const temp = []

    if (label === 'Technology') {
      technologySelectList &&
        technologySelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }

    if (label === 'PartList') {
      partSelectList &&
        partSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
  }

  /**
   * @method renderCostingOption
   * @description Used show listing of unit of measurement
   */
  const renderCostingOption = (options) => {
    const temp = []

    options &&
      options.map((item) => {
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
      dispatch(getPartInfo('', () => {}))
      setTechnology(newValue)
      setPart([])
      setIsTechnologySelected(true)
      setZBCPlantGrid([])
      setVBCVendorGrid([])
      setIsOpenVendorSOBDetails(false)
      dispatch(getPartInfo('', () => {}))
      setEffectiveDate('')
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
        dispatch(
          checkPartWithTechnology(data, (response) => {
            setPart(newValue)
            setZBCPlantGrid([])
            setVBCVendorGrid([])
            setIsOpenVendorSOBDetails(false)
            if (response.data.Result) {
              dispatch(
                getPartInfo(newValue.value, (res) => {
                  let Data = res.data.Data
                  setValue('PartName', Data.PartName)
                  setValue('Description', Data.Description)
                  setValue('ECNNumber', Data.ECNNumber)
                  setValue('DrawingNumber', Data.DrawingNumber)
                  setValue('RevisionNumber', Data.RevisionNumber)
                  setValue('ShareOfBusiness', Data.Price)
                  setEffectiveDate(moment(Data.EffectiveDate)._d)
                }),
              )
            } else {
              dispatch(getPartInfo('', () => {}))
              setValue('PartName', '')
              setValue('Description', '')
              setValue('ECNNumber', '')
              setValue('DrawingNumber', '')
              setValue('RevisionNumber', '')
              setValue('ShareOfBusiness', '')
              setEffectiveDate('')
            }
          }),
        )
      }
    } else {
      setPart([])
      dispatch(getPartInfo('', () => {}))
    }
  }

  /**
   * @method handleEffectiveDateChange
   * @description Handle Effective Date
   */
  const handleEffectiveDateChange = (date) => {
    setEffectiveDate(date)
  }

  /**
   * @method nextToggle
   * @description DISPLAY FORM ONCLICK NEXT BUTTON
   */
  const nextToggle = () => {
    if (Object.keys(technology).length > 0 && Object.keys(part).length > 0) {
      dispatch(
        getZBCExistingCosting(part.value, (res) => {
          if (res.data.Result) {
            let Data = res.data.DataList
            setZBCPlantGrid(Data)
            setzbcPlantOldArray(Data)
          }
        }),
      )

      dispatch(
        getVBCExistingCosting(part.value, (res) => {
          if (res.data.Result) {
            let Data = res.data.DataList
            setVBCVendorGrid(Data)
            setvbcVendorOldArray(Data)
          }
        }),
      )

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
      setZBCPlantGrid(tempArr)
    }
    setIsPlantDrawerOpen(false)
  }

  /**
   * @method handleZBCSOBChange
   * @description HANDLE ZBC SOB CHANGE
   */
  const handleZBCSOBChange = (event, index) => {
    //console.log('zbcPlantGridFields', event.target.name, fieldValues.zbcPlantGridFields)

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
    } else if (
      parseInt(event.target.value) === tempOldObj.ShareOfBusinessPercent
    ) {
      return false
    } else if (
      parseInt(event.target.value) !== tempOldObj.ShareOfBusinessPercent
    ) {
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
      let selectedOptionObj = tempData.CostingOptions.find(
        (el) => el.CostingId === newValue.value,
      )
      //console.log('selectedOptionObj: ', selectedOptionObj);
      tempData = {
        ...tempData,
        SelectedCostingVersion: newValue,
        Status: selectedOptionObj.Status,
      }
      tempArray = Object.assign([...zbcPlantGrid], { [index]: tempData })
      setZBCPlantGrid(tempArray)
      //setValue(`zbcPlantGridFields[${index}]ShareOfBusinessPercent`, selectedOptionObj.ShareOfBusinessPercent)
    }

    if (type === VBC && newValue !== '') {
      let tempData = vbcVendorGrid[index]
      let selectedOptionObj = tempData.CostingOptions.find(
        (el) => el.CostingId === newValue.value,
      )

      tempData = {
        ...tempData,
        SelectedCostingVersion: newValue,
        Status: selectedOptionObj.Status,
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
      let tempArr = [...vbcVendorGrid, vendorData]
      setVBCVendorGrid(tempArr)
    }
    setIsVendorDrawerOpen(false)
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
    } else if (
      parseInt(event.target.value) === tempOldObj.ShareOfBusinessPercent
    ) {
      return false
    } else if (
      parseInt(event.target.value) !== tempOldObj.ShareOfBusinessPercent
    ) {
      return true
    }
  }

  /**
   * @method checkSOBTotal
   * @description HANDLE COSTING CHANGE
   */
  const checkSOBTotal = () => {
    const { zbcPlantGridFields, vbcGridFields } = fieldValues

    let NetZBCSOB = 0
    let NetVBCSOB = 0

    // NetZBCSOB =
    //   zbcPlantGridFields &&
    //   zbcPlantGridFields !== undefined &&
    //   zbcPlantGridFields.reduce((accummlator, el) => {
    //     return accummlator + checkForNull(el.ShareOfBusinessPercent)
    //   }, 0)

    // NetVBCSOB =
    //   vbcGridFields &&
    //   vbcGridFields !== undefined &&
    //   vbcGridFields.reduce((accummlator, el) => {
    //     return accummlator + checkForNull(el.ShareOfBusinessPercent)
    //   }, 0)

    // return checkForNull(NetZBCSOB) + checkForNull(NetVBCSOB) > 100
    //   ? false
    //   : true
    return true
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

      dispatch(
        createZBCCosting(data, (res) => {
          if (res.data.Result) {
            setPartInfo(res.data.Data)
            setCostingData({ costingId: res.data.Data.CostingId, type })
            setStepTwo(true)
            setStepOne(false)
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
        VendorPlantId: tempData.VendorPlantId,
        VendorPlantName: tempData.VendorPlantName,
        VendorPlantCode: tempData.VendorPlantCode,
        VendorName: tempData.VendorName,
        VendorCode: tempData.VendorCode,
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

      dispatch(
        createVBCCosting(data, (res) => {
          if (res.data.Result) {
            setPartInfo(res.data.Data)
            setCostingData({ costingId: res.data.Data.CostingId, type })
            setStepTwo(true)
            setStepOne(false)
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
    if (!checkSOBTotal()) {
      warningMessageHandle('SOB_WARNING')
    } else if (!isCostingVersionSelected(index, type)) {
      warningMessageHandle('COSTING_VERSION_WARNING')
    } else if (!checkForError(index, type)) {
      warningMessageHandle('ERROR_WARNING')
    } else {
      moveToCostingDetail(index, type)
    }
  }

  /**
   * @method editCosting
   * @description EDIT COSTING DETAILS
   */
  const editCosting = (index, type) => {
    if (!checkSOBTotal()) {
      warningMessageHandle('SOB_WARNING')
    } else if (!isCostingVersionSelected(index, type)) {
      warningMessageHandle('COSTING_VERSION_WARNING')
    } else if (!checkForError(index, type)) {
      warningMessageHandle('ERROR_WARNING')
    } else if (checkSOBChanged(index, type)) {
      editCostingAlert(index, type)
    } else {
      moveToCostingDetail(index, type)
    }
  }

  /**
   * @method checkSOBChanged
   * @description CHECK SOB CHANGED FOR UPDATE COSTING AND TRIGGER CONFIRMATION FOR DRAFT ALL PENDING COSTINGS
   */
  const checkSOBChanged = (index, type) => {
    if (type === ZBC) {
      let tempData = zbcPlantGrid[index]
      return tempData && tempData.isSOBChanged ? true : false
    }

    if (type === VBC) {
      let tempData = vbcVendorGrid[index]
      return tempData && tempData.isSOBChanged ? true : false
    }
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
      onCancel: () => console.log('CANCEL: clicked'),
    }
    return toastr.confirm(
      `${'You have changed SOB percent So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`,
      toastrConfirmOptions,
    )
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
      dispatch(
        updateZBCSOBDetail(data, (res) => {
          setStepTwo(true)
          setStepOne(false)
        }),
      )
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
      }
      dispatch(
        updateVBCSOBDetail(data, (res) => {
          setStepTwo(true)
          setStepOne(false)
        }),
      )
    }
  }

  /**
   * @method moveToCostingDetail
   * @description MOVE TO COSTING DETAIL
   */
  const moveToCostingDetail = (index, type) => {
    if (type === ZBC) {
      let tempData = zbcPlantGrid[index]
      setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      setStepTwo(true)
      setStepOne(false)
    }

    if (type === VBC) {
      let tempData = vbcVendorGrid[index]
      setCostingData({ costingId: tempData.SelectedCostingVersion.value, type })
      setStepTwo(true)
      setStepOne(false)
    }
  }

  /**
   * @method copyCosting
   * @description COPY EXIS COSTING
   */
  const copyCosting = (index, type) => {
    if (!checkSOBTotal()) {
      warningMessageHandle('SOB_WARNING')
    } else if (!isCostingVersionSelected(index, type)) {
      warningMessageHandle('COSTING_VERSION_WARNING')
    } else if (!checkForError(index, type)) {
      warningMessageHandle('ERROR_WARNING')
    } else {
      console.log('Move to Copy Costing')
    }
  }

  /**
   * @method cancel
   * @description used to Reset form
   */
  const cancel = () => {
    setTechnology([])
    setPart([])
    dispatch(getPartInfo('', () => {}))
    reset({
      Technology: '',
      Part: '',
    })
  }

  /**
   * @method backToFirstStep
   * @description used to Reset form
   */
  const backToFirstStep = () => {
    setStepOne(true)
    setStepTwo(false)
    dispatch(getPartInfo(part.value, () => {}))
  }

  //console.log('errors >>>', errors);

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => {}

  const zbcPlantGridFields = 'zbcPlantGridFields'
  const vbcGridFields = 'vbcGridFields'

  return (
    <>
      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <Row>
                <Col md="6">
                  <div className="form-heading mb-0">
                    <h2>{''}</h2>
                  </div>
                </Col>
              </Row>
              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(onSubmit)}
              >
                {stepOne && (
                  <>
                    <Row>
                      <Col md="12">
                        <div className="left-border">{'Part Details:'}</div>
                      </Col>

                      <Col className="col-md-15">
                        <SearchableSelectHookForm
                          label={'Technology'}
                          name={'Technology'}
                          placeholder={'-Select-'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={
                            technology.length !== 0 ? technology : ''
                          }
                          options={renderListing('Technology')}
                          mandatory={true}
                          handleChange={handleTechnologyChange}
                          errors={errors.Technology}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <SearchableSelectHookForm
                          label={'Assembly No./Part No.'}
                          name={'Part'}
                          placeholder={'-Select-'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={part.length !== 0 ? part : ''}
                          options={renderListing('PartList')}
                          mandatory={true}
                          handleChange={handlePartChange}
                          errors={errors.Part}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly Name/Part Name"
                          name={'PartName'}
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
                          handleChange={() => {}}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.PartName}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly/Part Description"
                          name={'Description'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          rules={{ required: false }}
                          mandatory={false}
                          handleChange={() => {}}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.Description}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="ECO No."
                          name={'ECNNumber'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => {}}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ECNNumber}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Drawing No."
                          name={'DrawingNumber'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => {}}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.DrawingNumber}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Revision No."
                          name={'RevisionNumber'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => {}}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.RevisionNumber}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Price(Approved SOB)"
                          name={'ShareOfBusiness'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => {}}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
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
                              autoComplete={'off'}
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
                            {'SOB Details:'}
                          </div>
                        </Col>
                      </Row>
                    )}
                    {IsOpenVendorSOBDetails && (
                      <Row>
                        <Col md="3" className={'mb15 mt15'}>
                          ZBC:
                        </Col>
                        <Col md="7" className={'mb15 mt15'}></Col>
                        <Col md="2" className={'mb15 mt15'}>
                          <button
                            type="button"
                            className={'user-btn'}
                            onClick={plantDrawerToggle}
                          >
                            <div className={'plus'}></div>ADD PLANT
                          </button>
                        </Col>
                        {/* ZBC PLANT GRID FOR COSTING */}
                        <Col md="12">
                          <Table className="table cr-brdr-main" size="sm">
                            <thead>
                              <tr>
                                <th
                                  style={{ width: '100px' }}
                                >{`Plant Code`}</th>
                                <th style={{ width: '150px' }}>
                                  {`SOB`}
                                  <button
                                    className="edit-details-btn mr-2 ml5"
                                    type={'button'}
                                    onClick={() =>
                                      setEnableSOBField(!isSOBEnabled)
                                    }
                                  />
                                </th>
                                <th
                                  style={{ width: '150px' }}
                                >{`Costing Version`}</th>
                                <th
                                  className="text-center"
                                  style={{ width: '200px' }}
                                >{`Status`}</th>
                                <th style={{ width: '200px' }}>{`Actions`}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {zbcPlantGrid &&
                                zbcPlantGrid.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{item.PlantCode}</td>
                                      <td className="cr-select-height">
                                        <TextFieldHookForm
                                          label={''}
                                          name={`${zbcPlantGridFields}[${index}]ShareOfBusinessPercent`}
                                          Controller={Controller}
                                          control={control}
                                          register={register}
                                          mandatory={false}
                                          rules={{
                                            //required: true,
                                            pattern: {
                                              //value: /^[0-9]*$/i,
                                              value: /^[0-9]\d*(\.\d+)?$/i,
                                              message: 'Invalid Number.',
                                            },
                                          }}
                                          defaultValue={
                                            item.ShareOfBusinessPercent
                                          }
                                          className=""
                                          customClassName={'withBorder'}
                                          handleChange={(e) => {
                                            e.preventDefault()
                                            handleZBCSOBChange(e, index)
                                          }}
                                          errors={
                                            errors &&
                                            errors.zbcPlantGridFields &&
                                            errors.zbcPlantGridFields[index] !==
                                              undefined
                                              ? errors.zbcPlantGridFields[index]
                                                  .ShareOfBusinessPercent
                                              : ''
                                          }
                                          disabled={isSOBEnabled ? true : false}
                                        />
                                      </td>
                                      <td className="cr-select-height">
                                        <SearchableSelectHookForm
                                          label={''}
                                          name={`${zbcPlantGridFields}[${index}]CostingVersion`}
                                          placeholder={'-Select-'}
                                          Controller={Controller}
                                          control={control}
                                          rules={{ required: false }}
                                          register={register}
                                          defaultValue={
                                            item.SelectedCostingVersion
                                          }
                                          options={renderCostingOption(
                                            item.CostingOptions,
                                          )}
                                          mandatory={false}
                                          handleChange={(newValue) =>
                                            handleCostingChange(
                                              newValue,
                                              ZBC,
                                              index,
                                            )
                                          }
                                          errors={`${zbcPlantGridFields}[${index}]CostingVersion`}
                                        />
                                      </td>
                                      <td className="text-center">
                                        <div className={item.Status}>
                                          {item.Status}
                                        </div>
                                      </td>
                                      <td style={{ width: '200px' }}>
                                        <button
                                          className="Add-file mr-2"
                                          type={'button'}
                                          title={'Add Costing'}
                                          onClick={() => addDetails(index, ZBC)}
                                        />
                                        {!item.IsNewCosting && (
                                          <button
                                            className="View mr-2"
                                            type={'button'}
                                            title={'View Costing'}
                                            onClick={() =>
                                              viewDetails(index, ZBC)
                                            }
                                          />
                                        )}
                                        {!item.IsNewCosting && (
                                          <button
                                            className="Edit mr-2"
                                            type={'button'}
                                            title={'Edit Costing'}
                                            onClick={() =>
                                              editCosting(index, ZBC)
                                            }
                                          />
                                        )}
                                        {!item.IsNewCosting && (
                                          <button
                                            className="Copy All mr-2"
                                            type={'button'}
                                            title={'Copy Costing'}
                                            onClick={() =>
                                              copyCosting(index, ZBC)
                                            }
                                          />
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              {zbcPlantGrid.length === 0 && (
                                <tr>
                                  <td colSpan={5}>
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
                    )}

                    {IsOpenVendorSOBDetails && (
                      <Row>
                        <Col md="3" className={'mb15 mt15'}>
                          VBC:
                        </Col>
                        <Col md="7" className={'mb15 mt15'}></Col>
                        <Col md="2" className={'mb15 mt15'}>
                          {vbcVendorGrid.length <
                          initialConfiguration.NumberOfVendorsForCostDetails ? (
                            <button
                              type="button"
                              className={'user-btn'}
                              onClick={vendorDrawerToggle}
                            >
                              <div className={'plus'}></div>ADD VENDOR
                            </button>
                          ) : (
                            ''
                          )}
                        </Col>

                        {/* ZBC PLANT GRID FOR COSTING */}
                        <Col md="12">
                          <Table className="table cr-brdr-main" size="sm">
                            <thead>
                              <tr>
                                <th style={{ width: '100px' }}>{`Vendor`}</th>
                                <th style={{ width: '150px' }}>{`SOB`}</th>
                                <th
                                  style={{ width: '150px' }}
                                >{`Costing Version`}</th>
                                <th
                                  className="text-center"
                                  style={{ width: '200px' }}
                                >{`Status`}</th>
                                <th style={{ width: '200px' }}>{`Actions`}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {vbcVendorGrid &&
                                vbcVendorGrid.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{item.VendorName}</td>
                                      <td>
                                        <TextFieldHookForm
                                          label=""
                                          name={`${vbcGridFields}[${index}]ShareOfBusinessPercent`}
                                          Controller={Controller}
                                          control={control}
                                          register={register}
                                          mandatory={false}
                                          rules={{
                                            //required: true,
                                            pattern: {
                                              //value: /^[0-9]*$/i,
                                              value: /^[0-9]\d*(\.\d+)?$/i,
                                              message: 'Invalid Number.',
                                            },
                                          }}
                                          defaultValue={
                                            item.ShareOfBusinessPercent
                                          }
                                          className=""
                                          customClassName={'withBorder'}
                                          handleChange={(e) => {
                                            e.preventDefault()
                                            handleVBCSOBChange(e, index)
                                          }}
                                          errors={
                                            errors &&
                                            errors.vbcGridFields &&
                                            errors.vbcGridFields[index] !==
                                              undefined
                                              ? errors.vbcGridFields[index]
                                                  .ShareOfBusinessPercent
                                              : ''
                                          }
                                          disabled={isSOBEnabled ? true : false}
                                        />
                                      </td>
                                      <td>
                                        <SearchableSelectHookForm
                                          label={''}
                                          name={`${vbcGridFields}[${index}]CostingVersion`}
                                          placeholder={'-Select-'}
                                          Controller={Controller}
                                          control={control}
                                          rules={{ required: false }}
                                          register={register}
                                          defaultValue={
                                            item.SelectedCostingVersion
                                          }
                                          options={renderCostingOption(
                                            item.CostingOptions,
                                          )}
                                          mandatory={false}
                                          handleChange={(newValue) =>
                                            handleCostingChange(
                                              newValue,
                                              VBC,
                                              index,
                                            )
                                          }
                                          errors={`${vbcGridFields}[${index}]CostingVersion`}
                                        />
                                      </td>
                                      <td className="text-center">
                                        <div className={item.Status}>
                                          {item.Status}
                                        </div>
                                      </td>
                                      <td>
                                        <button
                                          className="Add-file mr-2"
                                          type={'button'}
                                          title={'Add Costing'}
                                          onClick={() => addDetails(index, VBC)}
                                        />
                                        {!item.IsNewCosting && (
                                          <button
                                            className="View mr-2"
                                            type={'button'}
                                            title={'View Costing'}
                                            onClick={() =>
                                              viewDetails(index, VBC)
                                            }
                                          />
                                        )}
                                        {!item.IsNewCosting && (
                                          <button
                                            className="Edit mr-2"
                                            type={'button'}
                                            title={'Edit Costing'}
                                            onClick={() =>
                                              editCosting(index, VBC)
                                            }
                                          />
                                        )}
                                        {!item.IsNewCosting && (
                                          <button
                                            className="Copy All mr-2"
                                            title={'Copy Costing'}
                                            type={'button'}
                                            onClick={() =>
                                              copyCosting(index, VBC)
                                            }
                                          />
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              {vbcVendorGrid.length === 0 && (
                                <tr>
                                  <td colSpan={5}>
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
                    )}

                    {!IsOpenVendorSOBDetails && (
                      <Row className="sf-btn-footer justify-content-between">
                        <div className="col-sm-12 text-right">
                          <button
                            type={'button'}
                            className="reset mr15 cancel-btn"
                            onClick={cancel}
                          >
                            <div className={'cross-icon'}>
                              <img
                                src={require('../../../assests/images/times.png')}
                                alt="cancel-icon.jpg"
                              />
                            </div>{' '}
                            {'Clear'}
                          </button>

                          <button
                            type="button"
                            className="submit-button save-btn"
                            onClick={nextToggle}
                          >
                            <div className={'check-icon'}>
                              <img
                                src={require('../../../assests/images/check.png')}
                                alt="check-icon.jpg"
                              />{' '}
                            </div>
                            {'Next'}
                          </button>
                        </div>
                      </Row>
                    )}

                    {/* <Row className="sf-btn-footer no-gutters justify-content-between">
                      <div className="col-sm-12 text-right bluefooter-butn">
                        <button
                          type={'button'}
                          className="reset mr15 cancel-btn"
                          onClick={cancel} >
                          <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                        </button>

                        <button
                          type="submit"
                          className="submit-button mr5 save-btn" >
                          <div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                          {isEditFlag ? 'Update' : 'Save'}
                        </button>
                      </div>
                    </Row> */}
                  </>
                )}
                {stepTwo && (
                  <CostingDetailStepTwo
                    backBtn={backToFirstStep}
                    partInfo={partInfoStepTwo}
                    costingInfo={costingData}
                  />
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
          ID={''}
          anchor={'right'}
        />
      )}
      {IsVendorDrawerOpen && (
        <AddVendorDrawer
          isOpen={IsVendorDrawerOpen}
          closeDrawer={closeVendorDrawer}
          isEditFlag={false}
          vbcVendorGrid={vbcVendorGrid}
          ID={''}
          anchor={'right'}
        />
      )}
    </>
  )
}

export default CostingDetails
