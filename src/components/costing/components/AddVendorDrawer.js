import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { getPlantBySupplier, getPlantSelectListByType, getVendorNameByVendorSelectList } from '../../../actions/Common';
import { getVBCDetailByVendorId, setIsMultiVendor, } from '../actions/Costing';
import { getConfigurationKey } from '../../../helper';
import WarningMessage from '../../common/WarningMessage';
import { EMPTY_GUID_0, searchCount, VBC_VENDOR_TYPE, ZBC, SET_IS_MULTI_VENDOR, ASSEMBLY, ASSEMBLYNAME } from '../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown } from '../../common/CommonFunctions';
import { MESSAGES } from '../../../config/message';
import TooltipCustom from '../../common/Tooltip';
import { useLabels } from '../../../helper/core';
import { IdForMultiTechnology } from '../../../config/masterData';

function AddVendorDrawer(props) {

  const { register, handleSubmit, formState: { errors }, control } = useForm();

  const [vendor, setVendor] = useState([]);
  const [data, setData] = useState({});
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [DestinationPlant, setDestinationPlant] = useState([]);
  //dropdown loader 
  const [inputLoader, setInputLoader] = useState(false)
  const [VendorInputLoader, setVendorInputLoader] = useState(false)
  const [vendorName, setVendorName] = useState('')
  const [infoCategory, setInfoCategory] = useState([])
  const [isInfoCategorySelected, setIsInfoCategorySelected] = useState(false)
  const dispatch = useDispatch()
  
  const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const plantSelectList = useSelector(state => state.comman.plantSelectList);
  const { vendorLabel } = useLabels()
  const partInfo = useSelector(state => state.costing.partInfo)
  const technology = useSelector(state => state.costing.technology)
 const [isMultiVendorSelected, setIsMultiVendorSelected] = useState(IdForMultiTechnology.includes(String(partInfo?.TechnologyId)) ? true : false)
  useEffect(() => {
    const { vbcVendorGrid } = props;
    dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))

    let tempArr = [];
    vbcVendorGrid && vbcVendorGrid.map(el => {
      tempArr.push(el.VendorId)
      return null;
    })
    initialConfiguration?.IsDestinationPlantConfigure === false && setSelectedVendors(tempArr)
    return () => {
      reactLocalStorage?.setObject('vendorData', [])
    }
  }, []);

  useEffect(() => {
    setInfoCategory(initialConfiguration?.InfoCategories)
  }, [initialConfiguration])

 useEffect(() => {
    if (partInfo?.PartType === ASSEMBLYNAME) {
      setIsMultiVendorSelected(IdForMultiTechnology.includes(String(partInfo?.TechnologyId)) ? true : false)
      dispatch(setIsMultiVendor(IdForMultiTechnology.includes(String(partInfo?.TechnologyId)) ? true : false))
    }
  }, [partInfo,technology])

  /**
  * @method toggleDrawer
  * @description TOGGLE DRAWER
  */
  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    // label=>PlantName
    props.closeDrawer('',
      {
        ...data,
        DestinationPlantCode: initialConfiguration && initialConfiguration?.IsDestinationPlantConfigure ? DestinationPlant.PlantCode : '',
        DestinationPlantId: initialConfiguration && initialConfiguration?.IsDestinationPlantConfigure ? DestinationPlant.value : EMPTY_GUID_0,
        DestinationPlantName: initialConfiguration && initialConfiguration?.IsDestinationPlantConfigure ? DestinationPlant.label : '',                 //PlantName
        DestinationPlant: DestinationPlant,
        VendorName: `${data.VendorName} (${data.VendorCode})`,
        InfoCategory: isInfoCategorySelected === true ? infoCategory[1]?.Text : infoCategory[0]?.Text,
        InfoCategoryObj: isInfoCategorySelected === true ? infoCategory[1] : infoCategory[0],
        IsMultiVendorCosting: isMultiVendorSelected
      })
  };

  /**
  * @method renderListing
  * @description RENDER LISTING IN DROPDOWN
  */
  const renderListing = (label) => {

    const temp = [];

    if (label === 'DestinationPlant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.PlantId === '0') return false
        temp.push({ label: item.PlantNameCode, value: item.PlantId, PlantName: item.PlantName, PlantCode: item.PlantCode })
        return null
      })
      return temp
    }
  }

  /**
  * @method handleVendorChange
  * @description  USED TO HANDLE VENDOR CHANGE
  */
  const handleVendorChange = (newValue) => {

    if (newValue && newValue !== '') {
      setVendor(newValue)
      setData({})

      //IF VENDOR PLANT IS CONFIGURABLE
      getConfigurationKey().IsVendorPlantConfigurable && dispatch(getPlantBySupplier(newValue.value, () => { }))

      //IF VENDOR PLANT IS NOT CONFIGURABLE
      if (!getConfigurationKey().IsVendorPlantConfigurable) {
        let data = {
          VendorId: newValue.value,
          VendorPlantId: getConfigurationKey().IsVendorPlantConfigurable ? newValue.value : "00000000-0000-0000-0000-000000000000",
        }
        setInputLoader(true)
        dispatch(getVBCDetailByVendorId(data, (res) => {
          if (res && res.data && res.data.Data) {
            setInputLoader(false)
            setData(res.data.Data)
          }
        }))
      }

    } else {
      setVendor([])
      setData({})
    }
  }


  /**
  * @method handleDestinationPlantChange
  * @description  USED TO HANDLE DESTINATION PLANT CHANGE
  */
  const handleDestinationPlantChange = (newValue) => {
    if (newValue && newValue !== '') {
      setDestinationPlant(newValue)
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer('', {})
  }

  const onSubmit = data => {
    toggleDrawer('')
  }
  const VendorLoaderObj = { isLoader: VendorInputLoader }
  const plantLoaderObj = { isLoader: inputLoader }
  const filterList = async (inputValue) => {
    if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
      inputValue = inputValue.trim();
    }
    const resultInput = inputValue.slice(0, searchCount)
    if (inputValue?.length >= searchCount && vendorName !== resultInput) {
      let res
      res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
      setVendorName(resultInput)
      let vendorDataAPI = res?.data?.SelectList
      if (inputValue) {
        return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
      } else {
        return vendorDataAPI
      }
    }
    else {
      if (inputValue?.length < searchCount) return false
      else {
        let VendorData = reactLocalStorage?.getObject('Data')
        if (inputValue) {
          return autoCompleteDropdown(inputValue, VendorData, false, [], false)
        } else {
          return VendorData
        }
      }
    }
  };

  const categoryTypeOnChange = (e) => {
    setIsInfoCategorySelected(!isInfoCategorySelected)
  }

  const handleMultiVendorChange = (e) => {
    setIsMultiVendorSelected(!isMultiVendorSelected)
    dispatch(setIsMultiVendor(!isMultiVendorSelected))
  }

  /**
  * @method render
  * @description Renders the component
  */

  return (
    <div>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>Add {vendorLabel}</h3>
                </div>
                <div
                  onClick={cancel}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Row className="pl-3">
                <Col md="12">
                  <AsyncSearchableSelectHookForm
                    label={`${vendorLabel} (Code)`}
                    name={"Vendor"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={vendor.length !== 0 ? vendor : ""}
                    options={renderListing("Vendor")}
                    mandatory={true}
                    handleChange={handleVendorChange}
                    errors={errors.Vendor}
                    isLoading={VendorLoaderObj}
                    asyncOptions={filterList}
                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                  />
                </Col>

                {initialConfiguration?.IsDestinationPlantConfigure &&

                  <Col md="12">
                    <SearchableSelectHookForm
                      label={"Destination Plant (Code)"}
                      name={"DestinationPlant"}
                      placeholder={"Select"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={DestinationPlant.length !== 0 ? DestinationPlant : ""}
                      options={renderListing("DestinationPlant")}
                      mandatory={true}
                      handleChange={handleDestinationPlantChange}
                      errors={errors.DestinationPlant}
                      disabled={vendor.length === 0 ? true : false}
                      isLoading={plantLoaderObj}
                    />
                  </Col>}
                <Col md="12">
                  <span className="d-inline-block">
                    <label
                      className={`custom-checkbox mb-0`}
                      onChange={(e) => categoryTypeOnChange(e)}
                      selected={isInfoCategorySelected}
                      id={'category'}
                    >
                      Sub Contracting
                      <input
                        type="checkbox"
                      />
                      <span
                        className=" before-box"
                        onChange={(e) => categoryTypeOnChange(e)}
                        selected={isInfoCategorySelected}
                      />
                    </label>
                    <TooltipCustom
                      disabledIcon={false}
                      id={`category`}
                      tooltipText={infoCategory && `If checkbox is selected then category will be ${infoCategory[1]?.Text}, otherwise category will be ${infoCategory[0]?.Text}.`}
                    />
                  </span>
                </Col>
                {partInfo?.PartType === ASSEMBLYNAME && (
                  <Col md="12">
                    <span className="d-inline-block">
                      <label
                        className={`custom-checkbox mb-0`}
                        onChange={(e) => !IdForMultiTechnology.includes(String(partInfo?.TechnologyId)) && handleMultiVendorChange(e)}
                        selected={isMultiVendorSelected}
                        id={'multiVendor'}
                      >
                        Multi-Vendor Costing
                        <input
                          type="checkbox"
                          checked={isMultiVendorSelected}
                          disabled={IdForMultiTechnology.includes(String(partInfo?.TechnologyId))}
                          onChange={(e) => !IdForMultiTechnology.includes(String(partInfo?.TechnologyId)) && handleMultiVendorChange(e)}
                        />
                        <span
                          className=" before-box"
                          onChange={(e) => !IdForMultiTechnology.includes(String(partInfo?.TechnologyId)) && handleMultiVendorChange(e)}
                          selected={isMultiVendorSelected}
                        />
                      </label>
                      <TooltipCustom
                        disabledIcon={false}
                        id={`multiVendor`}
                        tooltipText="Multi-vendor costing for Assembly parts"
                      />
                    </span>
                  </Col>
                )}
              </Row>
              {/* //RE */}
              {/* <Row>    
                <Col md="12" className="mt-n2 re-warning">
                  <WarningMessage message={`If you have same price settled at different plants, please use Destination Plant Code as 2000`} />
                </Col>
              </Row > */}

              <Row className="justify-content-between">
                <div className="col-sm-12 text-right">
                  <button
                    type={"button"}
                    className="reset mr15 cancel-btn"
                    onClick={cancel}
                  >
                    <div className={"cancel-icon"}></div>
                    {"Cancel"}
                  </button>

                  <button type="submit" className="submit-button save-btn">
                    <div class="plus"></div>
                    {"ADD"}
                  </button>
                </div>
              </Row>
            </form >
          </div >
        </Container >
      </Drawer >
    </div >
  );
}

export default React.memo(AddVendorDrawer)