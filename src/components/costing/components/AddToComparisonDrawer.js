import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'

import {
  getPlantSelectListByType,
  getVendorWithVendorCodeSelectList,
  getPlantBySupplier,
} from '../../../actions/Common'
import { getClientSelectList } from '../../masters/actions/Client'
import { getCostingSummaryByplantIdPartNo } from '../actions/Costing'

import {
  SearchableSelectHookForm,
  RadioHookForm,
} from '../../layout/HookFormInputs'

import { ZBC, VBC } from '../../../config/constants'

function AddToComparisonDrawer(props) {
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
    defaultValues: { comparisonValue: 'ZBC' },
  })
  const fieldValues = useWatch({ control, name: ['comparisonValue'] })
  const dispatch = useDispatch()

  const [plantDropDownList, setPlantDropDownList] = useState([])
  const [vendorDropDownList, setVendorDropDownList] = useState([])
  const [vendorPlantDropdown, setvendorPlantDropdown] = useState([])
  const [clientDropdown, setclientDropdown] = useState([])
  const [costingDropdown, setCostingDropdown] = useState([])
  console.log(costingDropdown,"Drop down of costing");

  const [plantValue, setPlantValue] = useState('')
  const [vendorValue, setVendorValue] = useState('')
  const [vendorPlant, setVendorPlant] = useState('')
  const [cbcValue, setCbcValue] = useState('')

  const [isZbcSelected, setIsZbcSelected] = useState(false)
  const [isVbcSelected, setIsVbcSelected] = useState(false)
  const [isCbcSelected, setisCbcSelected] = useState(false)

  const plantSelectList = useSelector((state) => state.comman.plantSelectList)
  //const plantBySupplierList = useSelector(state => state.comman.filterPlantList)
  const vendorSelectList = useSelector(
    (state) => state.comman.vendorWithVendorCodeSelectList,
  )
  const partNo = useSelector((state) => state.costing.partNo)
  console.log(partNo, 'Summary part no')

  useEffect(() => {
    const temp = []
    dispatch(
      getPlantSelectListByType(ZBC, (res) => {
        res.data.SelectList.map((item) => {
          temp.push({ label: item.Text, value: item.Value })
        })
        setPlantDropDownList(temp)
        setIsZbcSelected(true)
        setIsVbcSelected(false)
        setisCbcSelected(false)
      }),
    )
  }, [])

  useEffect(() => {
    const temp = []
    setIsZbcSelected(false)
    setIsVbcSelected(true)
    setisCbcSelected(false)
    vendorSelectList &&
      vendorSelectList.map((vendor) => {
        temp.push({ label: vendor.Text, value: vendor.Value })
      })
    setVendorDropDownList(temp)
  }, [vendorSelectList])

  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }

  const handleComparison = (value) => {
    setValue('comparisonValue', value)
    const temp = []
    if (value === 'ZBC') {
      dispatch(
        getPlantSelectListByType(ZBC, (res) => {
          // console.log(res,"Response  plant");
          res.data.SelectList.map((item) => {
            temp.push({ label: item.Text, value: item.Value })
          })
          setPlantDropDownList(temp)
          setIsZbcSelected(true)
          setIsVbcSelected(false)
          setisCbcSelected(false)
          // dispatch(getCostingSummaryByplantIdPartNo(partNo,))
        }),
      )
    } else if (value === 'VBC') {
      setCostingDropdown([])
      setValue("costings",'')
      dispatch(getVendorWithVendorCodeSelectList(() => {}))
      //  console.log(vendorSelectList,"Comparision");
    } else if (value === 'CBC') {
      setCostingDropdown([])
      dispatch(
        getClientSelectList((res) => {
          console.log(res.data.SelectList, 'Response from Client')
          res.data.SelectList &&
            res.data.SelectList.map((client) => {
              temp.push({ label: client.Text, value: client.Value })
            })
          setclientDropdown(temp)
          setisCbcSelected(true)
          setIsZbcSelected(false)
          setIsVbcSelected(false)
        }),
      )
    }
  }
  const handleVendorChange = ({ value }) => {
    const temp = []
    dispatch(
      getPlantBySupplier(value, (res) => {
        res.data.SelectList &&
          res.data.SelectList.map((plant) => {
            temp.push({ label: plant.Text, value: plant.Value })
          })
        setvendorPlantDropdown(temp)
      }),
    )
  }
  const onSubmit = (values) => {
    console.log(values, 'onsubmit')
    setPlantValue(values.plant)
    setVendorValue(values.vendor)
    setVendorPlant(values.vendorPlant)
    setCbcValue(values.clientName)
  }

  const handlePlantChange = (value) => {
    const temp = []
    console.log(typeof partNo.label, value, 'handle change')
    dispatch(
      getCostingSummaryByplantIdPartNo(partNo.label, value.value, (res) => {
        console.log(res.data.Data.CostingOptions, 'Response from summary')
        res.data.Data.CostingOptions &&
          res.data.Data.CostingOptions.map((costing) => {
            temp.push({
              label: costing.CostingNumber,
              value: costing.CostingId,
            })
          })
        setCostingDropdown(temp)
      }),
    )
  }
  return (
    <div>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Add to Comparison: '}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <div className="left-border">{'Costing Head:'}</div>
              </Col>
            </Row>
            <Row>
              <RadioHookForm
                className={'filter-from-section'}
                name={'comparisonValue'}
                register={register}
                onChange={handleComparison}
                defaultValue={'ZBC'}
                dataArray={[
                  {
                    label: 'ZBC',
                    optionsValue: 'ZBC',
                  },
                  {
                    label: 'VBC',
                    optionsValue: 'VBC',
                  },
                  {
                    label: 'CBC',
                    optionsValue: 'CBC',
                  },
                ]}
              />
            </Row>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                {isZbcSelected && (
                  <Col md="12">
                    <SearchableSelectHookForm
                      label={'Plant'}
                      name={'plant'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      // defaultValue={plant.length !== 0 ? plant : ''}
                      options={plantDropDownList}
                      mandatory={true}
                      handleChange={handlePlantChange}
                    />
                  </Col>
                )}
                {isVbcSelected && (
                  <>
                    <Col md="12">
                      <SearchableSelectHookForm
                        label={'Vendor'}
                        name={'vendor'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        // defaultValue={plant.length !== 0 ? plant : ''}
                        options={vendorDropDownList}
                        mandatory={true}
                        handleChange={handleVendorChange}
                      />
                    </Col>
                    <Col md="12">
                      <SearchableSelectHookForm
                        label={'Vendor Plant'}
                        name={'vendorPlant'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        // defaultValue={plant.length !== 0 ? plant : ''}
                        options={vendorPlantDropdown}
                        mandatory={true}
                        handleChange={() => {}}
                      />
                    </Col>
                  </>
                )}
                {isCbcSelected && (
                  <>
                    <Col md="12">
                      <SearchableSelectHookForm
                        label={'Client Name'}
                        name={'clientName'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        // defaultValue={plant.length !== 0 ? plant : ''}
                        options={clientDropdown}
                        mandatory={true}
                        handleChange={() => {}}
                      />
                    </Col>
                  </>
                )}
                <Col md="12">
                  <SearchableSelectHookForm
                    label={'Costings'}
                    name={'costings'}
                    placeholder={'-Select-'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={
                      costingDropdown.length !== 0 ? costingDropdown : ''
                    }
                    options={costingDropdown}
                    mandatory={true}
                    handleChange={() => {}}
                  />
                </Col>
                {/* <Col md="12">
                  <SearchableSelectHookForm
                    label={'Plant'}
                    name={'Plant'}
                    placeholder={'-Select-'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={plant.length !== 0 ? plant : ''}
                    options={renderListing('Plant')}
                    mandatory={true}
                    handleChange={handlePlantChange}
                    errors={errors.Plant}
                  />
                </Col> */}
              </Row>

              <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right bluefooter-butn">
                  <button
                    type={'button'}
                    className="reset mr15 cancel-btn"
                    onClick={toggleDrawer}
                  >
                    <div className={'cross-icon'}>
                      <img
                        src={require('../../../assests/images/times.png')}
                        alt="cancel-icon.jpg"
                      />
                    </div>{' '}
                    {'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="submit-button mr5 save-btn"
                    // onClick={toggleDrawer}
                  >
                    <div className={'check-icon'}>
                      <img
                        src={require('../../../assests/images/check.png')}
                        alt="check-icon.jpg"
                      />{' '}
                    </div>
                    {'ADD'}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    </div>
  )
}

export default React.memo(AddToComparisonDrawer)
