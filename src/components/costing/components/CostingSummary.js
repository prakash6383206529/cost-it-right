
import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col } from 'reactstrap'
import DatePicker from 'react-datepicker'
import DayTime from '../../common/DayTimeWrapper'
import {
  getPartInfo, checkPartWithTechnology,
  storePartNumber, getCostingSummaryByplantIdPartNo, setCostingViewData, getSingleCostingDetails, getPartSelectListByTechnology, getCostingSpecificTechnology, setBreakupBOP,
} from '../actions/Costing'
import { TextFieldHookForm, SearchableSelectHookForm, AsyncSearchableSelectHookForm, } from '../../layout/HookFormInputs'
import 'react-datepicker/dist/react-datepicker.css'
import { checkForDecimalAndNull, formViewData, getConfigurationKey, loggedInUserId, checkForNull, } from '../../../helper'
import CostingSummaryTable from './CostingSummaryTable'
import BOMUpload from '../../massUpload/BOMUpload'
import { useHistory } from "react-router-dom";
import { reactLocalStorage } from 'reactjs-localstorage';
import LoaderCustom from '../../common/LoaderCustom';
import { IdForMultiTechnology, MACHINING } from '../../../config/masterData'
import { BOUGHTOUTPARTSPACING, COMPONENT_PART, PRODUCT_ID, searchCount } from '../../../config/constants'
import { autoCompleteDropdown } from '../../common/CommonFunctions'
import { MESSAGES } from '../../../config/message'
import { getPartFamilySelectList, getSelectListPartType } from '../../masters/actions/Part'
import { ASSEMBLY, DETAILED_BOP_ID } from '../../../config/masterData'
import TourWrapper from '../../common/Tour/TourWrapper'
import { Steps } from './TourMessages'
import { useTranslation } from 'react-i18next'
import { useLabels } from '../../../helper/core'

function CostingSummary(props) {

  const { register, handleSubmit, control, setValue, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const dispatch = useDispatch()
  /* Dropdown cosntant*/
  const [technology, setTechnology] = useState([])
  const [IsBulkOpen, SetIsBulkOpen] = useState(false)
  const [IsTechnologySelected, setIsTechnologySelected] = useState(false)
  const [part, setPart] = useState([])
  const [partDropdown, setPartDropdown] = useState([])
  const [effectiveDate, setEffectiveDate] = useState('')
  const [TechnologyId, setTechnologyId] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [showWarningMsg, setShowWarningMsg] = useState(false)

  const partNumber = useSelector(state => state.costing.partNo);

  const costingData = useSelector(state => state.costing.costingData)
  const partSelectListByTechnology = useSelector(state => state.costing.partSelectListByTechnology)
  const technologySelectList = useSelector(state => state.costing.costingSpecifiTechnology,)
  const viewCostingData = useSelector(state => state.costing.viewCostingDetailData)
  const partInfo = useSelector((state) => state.costing.partInfo)
  const [titleObj, setTitleObj] = useState({})
  const [partName, setpartName] = useState('')
  const [partTypeList, setPartTypeList] = useState([])
  //dropdown loader 
  const [inputLoader, setInputLoader] = useState(false)
  const [isLoader, setIsLoader] = useState(false);
  const [costingIdExist, setCostingIdExist] = useState(true);
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const [partType, setPartType] = useState([]);
  const [partFamily, setPartFamily] = useState([])
  const { t } = useTranslation("Costing")
  const { technologyLabel } = useLabels();
  const partFamilySelectList = useSelector((state) => state.part.partFamilySelectList)

  /******************CALLED WHENEVER SUMARY TAB IS CLICKED AFTER DETAIL TAB(FOR REFRESHING DATA IF THERE IS EDITING IN CURRENT COSTING OPENED IN SUMMARY)***********************/
  useEffect(() => {
    if (Object.keys(costingData).length > 0 && reactLocalStorage.get('location') === '/costing-summary') {
      dispatch(getSingleCostingDetails(costingData.CostingId, (res) => {
        if (res.data.Data) {
          let dataFromAPI = res.data.Data
          const tempObj = formViewData(dataFromAPI, 'CostingSummaryMainPage')
          dispatch(setCostingViewData(tempObj))
        }
        // history.push("/costing-summary");
      },
      ))
    }
  }, [props.activeTab])



  useEffect(() => {

    if (reactLocalStorage.get('location') === '/costing-summary') {
      dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
      dispatch(getPartInfo('', () => { }))
      dispatch(getPartFamilySelectList(() => { }));

      dispatch(getSelectListPartType((res) => {
        setPartTypeList(res?.data?.SelectList)
      }))
      sessionStorage.setItem('costingArray', JSON.stringify([]))
      sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
    }
    return () => {
      reactLocalStorage.setObject('PartData', [])
    }
  }, [])

  /*************USED FOR SETTING DEFAULT VALUE IN SUMMARY AFTER SELECTING COSTING FROM DETAIL*****************/
  useEffect(() => {
    if (Object.keys(costingData).length > 0 && reactLocalStorage.get('location') === '/costing-summary') {
      setTimeout(() => {
        setValue('Technology', costingData && costingData !== undefined ? { label: costingData.TechnologyName, value: costingData.TechnologyId } : [])
        setTechnology(costingData && costingData !== undefined ? { label: costingData.TechnologyName, value: costingData.TechnologyId } : [])
        setIsTechnologySelected(costingData.TechnologyId ? true : false)
        setValue('Part', costingData && costingData !== undefined ? { label: costingData.PartNumber, value: costingData.PartId } : [])
        setPart(costingData && costingData !== undefined ? { label: costingData.PartNumber, value: costingData.PartId } : [])
        setValue('PartType', costingData && costingData !== undefined ? { label: costingData.PartNumber, value: costingData.PartId } : [])
        setValue('PartFamily', costingData && costingData !== undefined ? { label: costingData.PartFamily, value: costingData.PartFamilyId } : [])
        setPartFamily(costingData && costingData !== undefined ? { label: costingData.PartFamily, value: costingData.PartFamilyId } : [])
        setValue('Part', costingData && costingData !== undefined ? { label: costingData.PartNumber, value: costingData.PartId } : [])
        setDisabled(true)
        dispatch(getPartInfo(costingData.PartId, (res) => {
          let newValue = {}
          let Data = res.data.Data
          setValue("PartType", { label: Data.PartType, value: Data.PartTypeId })
          setValue('PartName', Data.PartName)
          setValue('Description', Data.Description)
          setValue('ECNNumber', Data.ECNNumber)
          setValue('DrawingNumber', Data.DrawingNumber)
          setValue('RevisionNumber', Data.RevisionNumber)
          setValue('ShareOfBusiness', checkForDecimalAndNull(Data.Price, initialConfiguration?.NoOfDecimalForPrice))
          setValue('PartFamily', Data?.PartFamily)
          setTechnologyId(Data?.TechnologyId)
          setPartType({ label: Data.PartType, value: Data.PartTypeId })
          setEffectiveDate(DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          newValue.revisionNumber = Data.RevisionNumber
          newValue.technologyId = costingData.TechnologyId
          newValue.technologyName = costingData.TechnologyName
          newValue.partName = Data.PartName
          newValue.partNumber = costingData.PartNumber
          newValue.partId = costingData.PartId
          newValue.partFamily = costingData.PartFamily
          newValue.partFamilyId = costingData.PartFamilyId

          dispatch(storePartNumber(newValue))
          dispatch(getSingleCostingDetails(costingData.CostingId, (res) => {
            if (res.data.Data) {
              let dataFromAPI = res.data.Data
              const tempObj = formViewData(dataFromAPI, 'CostingSummaryMainPage')
              dispatch(setCostingViewData(tempObj))

            }
          },
          ))
        }),
        )
      }, 200);
    }
  }, [costingData])



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
          // if (checkForNull(item.Value) === MACHINING) return false;      // SPECIFIC FOR RE, HIDE Machining TECHNOLOGY IN COSTING DROPDOWN
          tempDropdownList.push({ label: item.Text, value: item.Value })
          return null
        })
      return tempDropdownList
    }

    // if (label === 'PartList') {
    //   partSelectListByTechnology &&
    //     partSelectListByTechnology.map((item) => {
    //       if (item.Value === '0') return false
    //       tempDropdownList.push({ label: item.Text, value: item.Value })
    //       return null
    //     })
    //   setPartDropdown(tempDropdownList)

    //   return tempDropdownList
    // }
  }

  /**
   * @method handleTechnologyChange
   * @description  USED TO HANDLE TECHNOLOGY CHANGE
   */
  const handleTechnologyChange = (newValue) => {
    dispatch(storePartNumber(''))
    if (newValue && newValue !== '') {
      dispatch(getPartInfo('', () => { }))
      setTechnology(newValue)
      setPart([])
      setPartType([])
      setPartFamily([])
      setIsTechnologySelected(true)
      dispatch(getPartInfo('', () => { }))
      setEffectiveDate('')
      reset({
        Part: '',
        PartType: ''
      })
    } else {
      setTechnology([])
      setIsTechnologySelected(false)
    }
    setpartName([])
    reactLocalStorage.setObject('PartData', [])
  }
  useEffect(() => {

  }, [disabled])

  useEffect(() => {
    renderDropdownListing('PartList')
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
    if (label === 'PartType') {
      partTypeList && partTypeList.map((item) => {
        if (item.Value === '0') return false
        if (item.Value === PRODUCT_ID) return false
        if (!getConfigurationKey()?.IsBoughtOutPartCostingConfigured && item.Text === BOUGHTOUTPARTSPACING) return false
        if (IdForMultiTechnology.includes(String(technology?.value)) && ((item.Text === COMPONENT_PART) || (item.Text === BOUGHTOUTPARTSPACING))) return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }
    if (label === 'PartFamily') {
      partFamilySelectList && partFamilySelectList.map((item) => {
        if (item.Value === '--0--') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }
  }

  /**
   * @method handlePartChange
   * @description  USED TO HANDLE PART CHANGE
   */
  const handlePartChange = (newValue) => {
    let temp = []
    temp = viewCostingData

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
                  setValue('PartFamily', Data?.PartFamily)
                  setValue('ShareOfBusiness', checkForDecimalAndNull(Data.Price, initialConfiguration?.NoOfDecimalForPrice))
                  setTitleObj(prevState => ({ ...prevState, descriptionTitle: Data.Description, partNameTitle: Data.PartName }))
                  setTechnologyId(Data?.TechnologyId)
                  setEffectiveDate(DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
                  newValue.revisionNumber = Data.RevisionNumber
                  newValue.technologyId = technology.value
                  newValue.technologyName = technology.label
                  newValue.partName = Data.PartName
                  newValue.partNumber = newValue.label
                  newValue.partId = newValue.value
                  newValue.partFamily = Data?.PartFamily
                  newValue.partFamilyId = Data?.PartFamilyId
                  // const prNAme = (newValue.label).replace('/', '%2F')
                  setIsLoader(true)
                  dispatch(storePartNumber(newValue))
                  dispatch(
                    getCostingSummaryByplantIdPartNo(newValue.partId, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', (res) => {

                      if (res.data.Result === true) {
                        if (res.data.Data.CostingId === '00000000-0000-0000-0000-000000000000') {
                          setShowWarningMsg(true)
                          dispatch(setCostingViewData([]))
                          setIsLoader(false)
                          setCostingIdExist(false)
                        } else {
                          setCostingIdExist(true)
                          dispatch(getSingleCostingDetails(res.data.Data.CostingId, (res) => {
                            // dispatch(getSingleCostingDetails('5cdcad92-277f-48e2-8eb2-7a7c838104e1', res => {
                            if (res.data.Data) {
                              let dataFromAPI = res.data.Data
                              const tempObj = formViewData(dataFromAPI, 'CostingSummaryMainPage')
                              dispatch(setCostingViewData(tempObj))
                              setIsLoader(false)
                            }
                          },
                          ))
                        }

                      }
                    },
                    ),
                  )
                }),
              )
            } else {
              dispatch(getPartInfo('', () => { setIsLoader(false) }))
              setValue('PartName', '')
              setValue('Description', '')
              setValue('ECNNumber', '')
              setValue('DrawingNumber', '')
              setValue('RevisionNumber', '')
              setValue('ShareOfBusiness', '')
              setValue('PartFamily', '')
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
   * @method handlePartChange
   * @description  USED TO HANDLE PART CHANGE
   */
  const handlePartTypeChange = (newValue) => {
    if (newValue && newValue !== '') {
      if (IsTechnologySelected) {
        dispatch(setBreakupBOP(newValue?.value === DETAILED_BOP_ID))
        setPartType(newValue)
        setValue('Part', '')
        setPart('')
      }
    } else {
      setPart([])
      dispatch(getPartInfo('', () => { }))
    }
    setpartName([])
    reactLocalStorage.setObject('PartData', [])
  }

  /**
   * @method handleEffectiveDateChange
   * @description Handle Effective Date
   */
  const handleEffectiveDateChange = (date) => {
    setEffectiveDate(date)
  }


  /**
   * @method resetData
   * @description RESETING FORM AFTER SELECTING RESET BUTTON
  */
  const resetData = () => {
    setPart([])
    setPartType([])
    setTechnology([])
    setPartFamily([])
    setDisabled(false)
    setEffectiveDate('')
    dispatch(storePartNumber(''))
    dispatch(setCostingViewData([]))
    setShowWarningMsg(false)
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
      PartType: '',
      PartFamily: '',
    })
  }

  /**
   * @method bulkToggle
   * @description OPEN ADD BOM DRAWER
  */
  const bulkToggle = () => {
    SetIsBulkOpen(true)
  }


  /**
   * @method closeBulkUploadDrawer
   * @description CLOSE ADD BOM DRAWER
  */
  const closeBulkUploadDrawer = () => {
    SetIsBulkOpen(false)
  }

  const filterList = async (inputValue) => {
    if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
      inputValue = inputValue.trim();
    }
    const resultInput = inputValue.slice(0, searchCount)
    if (inputValue?.length >= searchCount && partName !== resultInput) {
      setInputLoader(true)
      const res = await getPartSelectListByTechnology(technology.value, resultInput, partType?.value, partFamily?.value);
      setInputLoader(false)
      setpartName(resultInput)
      let partDataAPI = res?.data?.SelectList
      if (inputValue) {
        return autoCompleteDropdown(inputValue, partDataAPI, false, [], true)

      } else {
        return partDataAPI
      }
    }
    else {
      if (inputValue?.length < searchCount) return false
      else {
        let partData = reactLocalStorage.getObject('Data')
        if (inputValue) {
          return autoCompleteDropdown(inputValue, partData, false, [], false)
        } else {
          return partData
        }
      }
    }

  }
  const handlePartFamily = (e) => {
    setPartFamily(e)
  }
  const loaderObj = { isLoader: inputLoader }
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

          <button onClick={bulkToggle} className="btn-primary btn mt-2 float-right">
            <div className="hirarchy-icon"></div>
            <span>ADD BOM</span>
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
                        <div className="left-border">{'Part Details:'}  {<TourWrapper
                          buttonSpecificProp={{ id: "Costing_Summary" }}
                          stepsSpecificProp={{
                            steps: Steps(t, "costing-summary-page").COSTING_INITIAL
                          }} />}</div>
                      </Col>
                      <Col className="col-md-15">
                        <SearchableSelectHookForm
                          label={technologyLabel}
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
                          label={"Part Type"}
                          name={"PartType"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={partType.length !== 0 ? partType : ""}
                          options={renderListing('PartType')}
                          mandatory={true}
                          handleChange={handlePartTypeChange}
                          errors={errors.Part}
                          disabled={(technology.length === 0) ? true : false || disabled}
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
                          asyncOptions={filterList}
                          mandatory={true}
                          isLoading={loaderObj}
                          handleChange={handlePartChange}
                          errors={errors.Part}
                          disabled={partType.length === 0 ? true : false || disabled}
                          NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                        />

                        {/* <SearchableSelectHookForm
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
                        /> */}
                      </Col>
                      {getConfigurationKey()?.PartAdditionalMasterFields?.IsShowPartFamily && <Col className="col-md-15">

                        <TextFieldHookForm
                          label="Part Family"
                          name={"PartFamily"}
                          // title={titleObj.partFamilyTitle}
                          Controller={Controller}
                          control={control}
                          register={register}
                          rules={{ required: false }}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.PartFamily}
                          disabled={true}
                          placeholder="-"
                        />
                      </Col>}
                      <Col className="col-md-15">
                        <TextFieldHookForm
                          title={titleObj.partNameTitle}
                          label="Assembly/Part Name"
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
                          placeholder="-"
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          title={titleObj.descriptionTitle}
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
                          placeholder="-"
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="ECN No."
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
                          placeholder="-"
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
                          placeholder="-"
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
                          placeholder="-"
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label={`Current Price (Approved SOB: ${partInfo && partInfo.WeightedSOB !== undefined ? partInfo.WeightedSOB + '%' : 0})`}
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
                          placeholder="-"
                        />
                      </Col>

                      <Col className="col-md-15">
                        <div className="form-group">
                          <label>Effective Date</label>
                          <div className="inputbox date-section">
                            <DatePicker
                              name="EffectiveDate"
                              //selected={effectiveDate ? new Date(effectiveDate) : ''}
                              selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                              onChange={handleEffectiveDateChange}
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              dateFormat="dd/MM/yyyy"
                              //maxDate={new Date()}
                              placeholderText="-"
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
                    <Row className="btn-row">
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
                          id="costing-cancel"
                          className="reset-btn"
                        ><div className={'cancel-icon'}></div>
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
        {isLoader && <LoaderCustom customClass="costing-summary-loader" />}
      </div>
      {partNumber !== "" && <CostingSummaryTable
        resetData={resetData}
        showDetail={props.showDetail}
        technologyId={TechnologyId}
        showWarningMsg={showWarningMsg}
        selectedTechnology={technology.label}
        costingSummaryMainPage={true}
        partNumber={partNumber}
        setcostingOptionsSelectFromSummary={props.setcostingOptionsSelectFromSummary}
        costingIdExist={costingIdExist}
        storeSummary={true}
        technology={technology}
        partTypeValue={partType}
        showAddToComparison={true}
        simulationMode={false}


      />}

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

export default React.memo(CostingSummary)
