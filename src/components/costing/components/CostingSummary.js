import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col } from 'reactstrap'
import DatePicker from 'react-datepicker'
import { toastr } from 'react-redux-toastr'
import moment from 'moment'
import {
  getCostingTechnologySelectList, getAllPartSelectList, getPartInfo, checkPartWithTechnology,
  storePartNumber, getCostingSummaryByplantIdPartNo, setCostingViewData, getSingleCostingDetails, getPartSelectListByTechnology,
} from '../actions/Costing'
import { TextFieldHookForm, SearchableSelectHookForm, } from '../../layout/HookFormInputs'
import 'react-datepicker/dist/react-datepicker.css'
import { VIEW_COSTING_DATA } from '../../../config/constants'
import { formViewData } from '../../../helper'
import CostingSummaryTable from './CostingSummaryTable'
import BOMUpload from '../../massUpload/BOMUpload'

function CostingSummary(props) {

  const { register, handleSubmit, control, setValue, getValues, reset, errors, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const { hideUpperRow, costingID } = props

  /* Dropdown cosntant*/
  const [technology, setTechnology] = useState([])
  const [IsBulkOpen, SetIsBulkOpen] = useState(false)
  const [IsTechnologySelected, setIsTechnologySelected] = useState(false)
  const [part, setPart] = useState([])
  const [effectiveDate, setEffectiveDate] = useState('')
  const [TechnologyId, setTechnologyId] = useState('')
  const [disabled, setDisabled] = useState(false)
  const partNumber = useSelector(state => state.costing.partNo);



  const fieldValues = useWatch({ control })

  const dispatch = useDispatch()

  const costingData = useSelector(state => state.costing.costingData)
  const partSelectListByTechnology = useSelector(state => state.costing.partSelectListByTechnology)


  useEffect(() => {

    if (Object.keys(costingData).length > 0) {
      dispatch(getSingleCostingDetails(costingData.CostingId, (res) => {
        if (res.data.Data) {
          let dataFromAPI = res.data.Data
          const tempObj = formViewData(dataFromAPI)
          dispatch(setCostingViewData(tempObj))
        }
      },
      ))
    }
  }, [props.activeTab])



  useEffect(() => {

    dispatch(getCostingTechnologySelectList(() => { }))
    dispatch(getAllPartSelectList(() => { }))
    dispatch(getPartInfo('', () => { }))
    dispatch(getPartSelectListByTechnology('', () => { }))

    // if (costingData.length > 0) {
    //   
    // }
  }, [])

  useEffect(() => {

    if (Object.keys(costingData).length > 0) {

      setTimeout(() => {

        setValue('Technology', costingData && costingData !== undefined ? { label: costingData.TechnologyName, value: costingData.TechnologyId } : [])
        setTechnology(costingData && costingData !== undefined ? { label: costingData.TechnologyName, value: costingData.TechnologyId } : [])
        setValue('Part', costingData && costingData !== undefined ? { label: costingData.PartNumber, value: costingData.PartId } : [])
        setPart(costingData && costingData !== undefined ? { label: costingData.PartNumber, value: costingData.PartId } : [])
        setDisabled(true)
        dispatch(getPartSelectListByTechnology(costingData.TechnologyId, () => { }))
        dispatch(getPartInfo(costingData.PartId, (res) => {
          let newValue = {}
          let Data = res.data.Data
          setValue('PartName', Data.PartName)
          setValue('Description', Data.Description)
          setValue('ECNNumber', Data.ECNNumber)
          setValue('DrawingNumber', Data.DrawingNumber)
          setValue('RevisionNumber', Data.RevisionNumber)
          setValue('ShareOfBusiness', Data.Price)
          setTechnologyId(Data.ETechnologyType ? Data.ETechnologyType : 1)
          setEffectiveDate(moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
          newValue.revisionNumber = Data.RevisionNumber
          newValue.technologyId = costingData.TechnologyId
          newValue.technologyName = costingData.TechnologyName
          newValue.partName = Data.PartName
          newValue.partNumber = costingData.PartNumber
          newValue.partId = costingData.PartId

          dispatch(storePartNumber(newValue))
          dispatch(getSingleCostingDetails(costingData.CostingId, (res) => {
            if (res.data.Data) {
              let dataFromAPI = res.data.Data
              const tempObj = formViewData(dataFromAPI)
              dispatch(setCostingViewData(tempObj))
            }
          },
          ))
        }),
        )
      }, 200);
    }
  }, [costingData])

  const technologySelectList = useSelector(state => state.costing.technologySelectList,)
  const partSelectList = useSelector(state => state.costing.partSelectList)

  const partInfo = useSelector(state => state.costing.partInfo)
  const viewCostingData = useSelector(state => state.costing.viewCostingDetailData)

  /**
   * @method renderDropdownListing
   * @description Used show listing of unit of measurement
   */
  const renderDropdownListing = (label) => {
    const tempDropdownList = []

    if (label === 'Technology') {
      technologySelectList &&
        technologySelectList.map((item) => {
          if (item.Value === '0') return false
          tempDropdownList.push({ label: item.Text, value: item.Value })
          return null
        })
      return tempDropdownList
    }

    if (label === 'PartList') {
      partSelectListByTechnology &&
        partSelectListByTechnology.map((item) => {
          if (item.Value === '0') return false
          tempDropdownList.push({ label: item.Text, value: item.Value })
          return null
        })
      return tempDropdownList
    }
  }

  /**
   * @method handleTechnologyChange
   * @description  USED TO HANDLE TECHNOLOGY CHANGE
   */
  const handleTechnologyChange = (newValue) => {
    dispatch(storePartNumber(''))
    if (newValue && newValue !== '') {
      dispatch(getPartSelectListByTechnology(newValue.value, () => { }))
      dispatch(getPartInfo('', () => { }))
      setTechnology(newValue)
      setPart([])
      setIsTechnologySelected(true)
      dispatch(getPartInfo('', () => { }))
      setEffectiveDate('')
      reset({
        Part: '',
      })
    } else {
      setTechnology([])
      setIsTechnologySelected(false)
    }
  }
  useEffect(() => {

  }, [disabled])
  /**
   * @method handlePartChange
   * @description  USED TO HANDLE PART CHANGE
   */
  const handlePartChange = (newValue) => {
    let temp = []
    temp = viewCostingData
    // if (viewCostingData.length == 0 || part.value == newValue.value || part.value != newValue.value) {
    //   
    //   temp.push(VIEW_COSTING_DATA)
    // }
    // else if (viewCostingData.length >= 1) {
    //   
    //   temp = viewCostingData
    // }
    // else if(part != newValue)

    if (newValue && newValue !== '') {
      if (IsTechnologySelected) {
        const data = { TechnologyId: technology.value, PartId: newValue.value }
        setTimeout(() => {
          setDisabled(true)
        }, 200);
        dispatch(
          checkPartWithTechnology(data, (response) => {
            setPart(newValue)
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
                  setTechnologyId(Data.ETechnologyType ? Data.ETechnologyType : 1)
                  setEffectiveDate(moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
                  newValue.revisionNumber = Data.RevisionNumber
                  newValue.technologyId = technology.value
                  newValue.technologyName = technology.label
                  newValue.partName = Data.PartName
                  newValue.partNumber = newValue.label
                  newValue.partId = newValue.value
                  dispatch(storePartNumber(newValue))
                  dispatch(
                    getCostingSummaryByplantIdPartNo(
                      newValue.label,
                      '00000000-0000-0000-0000-000000000000',
                      (res) => {
                        if (res.data.Result == true) {
                          dispatch(getSingleCostingDetails(res.data.Data.CostingId,
                            (res) => {
                              // dispatch(getSingleCostingDetails('5cdcad92-277f-48e2-8eb2-7a7c838104e1', res => {
                              if (res.data.Data) {
                                let dataFromAPI = res.data.Data
                                const tempObj = formViewData(dataFromAPI)
                                dispatch(setCostingViewData(tempObj))
                              }
                            },
                          ),
                          )
                        } else {
                          dispatch(setCostingViewData(temp))
                        }
                      },
                    ),
                  )
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
              dispatch(setCostingViewData([]))
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
   * @method onSubmit
   * @description Used to Submit the form
   */
  // const onSubmit = (values) => {

  // }

  const resetData = () => {
    reset()
    setTechnology([])
    setPart([])
    setTimeout(() => {
      getValues('Technology', [])
      getValues('Part', [])
    }, 200);
    setDisabled(false)
    dispatch(storePartNumber(''))
    dispatch(setCostingViewData([]))
    dispatch(getPartSelectListByTechnology('', () => { }))
  }

  const bulkToggle = () => {
    SetIsBulkOpen(true)
  }

  const closeBulkUploadDrawer = () => {
    SetIsBulkOpen(false)
  }

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

          <button onClick={bulkToggle} className="btn btn-link text-primary pr-0">
            <img src={require('../../../assests/images/add-bom.svg')} alt="print-button" />
            <span className="d-block mt-1">ADD BOM</span>
          </button>
        </div>
      </span>
      <div className="login-container signup-form costing-summary-page ">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(() => { })}
              >
                {
                  <>
                    <Row>
                      <Col md="12" className="mt-3">
                        <div className="left-border">{'Part Details:'}</div>
                      </Col>

                      <Col className="col-md-15">
                        <SearchableSelectHookForm
                          label={'Technology'}
                          name={'Technology'}
                          placeholder={'Select'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={technology.length !== 0 ? technology : ''}
                          options={renderDropdownListing('Technology')}
                          mandatory={true}
                          handleChange={handleTechnologyChange}
                          errors={errors.Technology}
                          disabled={disabled}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <SearchableSelectHookForm
                          label={'Assembly No./Part No.'}
                          name={'Part'}
                          placeholder={'Select'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={part.length !== 0 ? part : ''}
                          options={renderDropdownListing('PartList')}
                          mandatory={true}
                          handleChange={handlePartChange}
                          errors={errors.Part}
                          disabled={technology.length === 0 ? true : part.length === 0 ? false : true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly Name/Part Name"
                          name={'PartName'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{ required: false, }}
                          handleChange={() => { }}
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
                          handleChange={() => { }}
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
                          handleChange={() => { }}
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
                          handleChange={() => { }}
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
                          handleChange={() => { }}
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
                          handleChange={() => { }}
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
                    <Row>
                      <Col className="col-md-12 text-right mb-3">
                        {/* <button
                          type="button"
                          // disabled={this.state.isViewFlag ? true : false}
                          className={'reset-btn mt30 pull-left'}
                          onClick={resetData}
                        >Reset</button> */}
                        <button
                          type="button"
                          //disabled={pristine || submitting}
                          onClick={resetData}
                          className="cancel-btn"
                        ><div className={"cross-icon"}>
                            <img
                              src={require("../../../assests/images/times.png")}
                              alt="cancel-icon.jpg"
                            />
                          </div>{" "}
                          {"Clear"}
                        </button>
                      </Col>
                    </Row>
                  </>
                }
              </form>
            </div>
          </Col>
        </Row>
      </div>
      {partNumber !== "" && <CostingSummaryTable resetData={resetData} showDetail={props.showDetail} technologyId={TechnologyId} />}
      {IsBulkOpen && <BOMUpload
        isOpen={IsBulkOpen}
        closeDrawer={closeBulkUploadDrawer}
        isEditFlag={false}
        fileName={'BOM'}
        messageLabel={'BOM'}
        anchor={'right'}
      />}
    </>
  )
}

export default CostingSummary
