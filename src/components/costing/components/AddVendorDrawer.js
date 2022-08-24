import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { getVendorWithVendorCodeSelectList, getPlantBySupplier, getPlantSelectListByType } from '../../../actions/Common';
import { getVBCDetailByVendorId, } from '../actions/Costing';
import { getConfigurationKey, getVendorCode, } from '../../../helper';
import { EMPTY_GUID_0, ZBC } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';

function AddVendorDrawer(props) {

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm();

  const [vendor, setVendor] = useState([]);
  const [data, setData] = useState({});
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [DestinationPlant, setDestinationPlant] = useState([]);
  //dropdown loader 
  const [inputLoader, setInputLoader] = useState(false)
  const [VendorInputLoader, setVendorInputLoader] = useState(false)

  const dispatch = useDispatch()

  const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)
  const filterPlantList = useSelector(state => state.comman.filterPlantList)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const plantSelectList = useSelector(state => state.comman.plantSelectList);

  useEffect(() => {
    setVendorInputLoader(true)
    const { vbcVendorGrid } = props;
    dispatch(getVendorWithVendorCodeSelectList(() => {
      setVendorInputLoader(false)
    }))
    dispatch(getPlantSelectListByType(ZBC, () => { }))

    let tempArr = [];
    vbcVendorGrid && vbcVendorGrid.map(el => {
      tempArr.push(el.VendorId)
      return null;
    })
    { initialConfiguration?.IsDestinationPlantConfigure === false && setSelectedVendors(tempArr) }

  }, []);

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
        DestinationPlantCode: initialConfiguration && initialConfiguration.IsDestinationPlantConfigure ? DestinationPlant.PlantCode : '',
        DestinationPlantId: initialConfiguration && initialConfiguration.IsDestinationPlantConfigure ? DestinationPlant.value : EMPTY_GUID_0,
        DestinationPlantName: initialConfiguration && initialConfiguration.IsDestinationPlantConfigure ? DestinationPlant.PlantName : '',                 //PlantName
        DestinationPlant: DestinationPlant,
      })
  };

  /**
  * @method renderListing
  * @description RENDER LISTING IN DROPDOWN
  */
  const renderListing = (label) => {

    const temp = [];

    if (label === 'Vendor') {
      vendorSelectList && vendorSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

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
                  <h3>{"Add Vendor"}</h3>
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
                  <SearchableSelectHookForm
                    label={"Vendor"}
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
                  />
                </Col>

                {initialConfiguration?.IsDestinationPlantConfigure &&

                  <Col md="12">
                    <SearchableSelectHookForm
                      label={"Destination Plant"}
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
              </Row>

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
            </form>
          </div>
        </Container>
      </Drawer>
    </div>
  );
}

export default React.memo(AddVendorDrawer)