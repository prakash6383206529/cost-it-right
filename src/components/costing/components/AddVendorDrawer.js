import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { getVendorWithVendorCodeSelectList, getPlantBySupplier, getPlantSelectListByType } from '../../../actions/Common';
import { getVBCDetailByVendorId, } from '../actions/Costing';
import { checkVendorPlantConfigurable, getConfigurationKey, getVendorCode, } from '../../../helper';
import { EMPTY_GUID_0, ZBC } from '../../../config/constants';

function AddVendorDrawer(props) {

  const { register, handleSubmit, errors, reset, control } = useForm();

  const [vendor, setVendor] = useState([]);
  const [vendorPlant, setVendorPlant] = useState([]);
  const [data, setData] = useState({});
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [DestinationPlant, setDestinationPlant] = useState([]);

  const dispatch = useDispatch()

  const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)
  const filterPlantList = useSelector(state => state.comman.filterPlantList)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const plantSelectList = useSelector(state => state.comman.plantSelectList);

  useEffect(() => {
    const { vbcVendorGrid } = props;
    dispatch(getVendorWithVendorCodeSelectList(() => { }))
    dispatch(getPlantSelectListByType(ZBC, () => { }))

    let tempArr = [];
    vbcVendorGrid && vbcVendorGrid.map(el => {
      tempArr.push(el.VendorId)
      return null;
    })
    setSelectedVendors(tempArr)

  }, []);

  /**
  * @method toggleDrawer
  * @description TOGGLE DRAWER
  */
  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('',
      {
        ...data,
        DestinationPlantCode: initialConfiguration && initialConfiguration.IsDestinationPlantConfigure ? getVendorCode(DestinationPlant.label) : '',
        DestinationPlantId: initialConfiguration && initialConfiguration.IsDestinationPlantConfigure ? DestinationPlant.value : EMPTY_GUID_0,
        DestinationPlantName: initialConfiguration && initialConfiguration.IsDestinationPlantConfigure ? DestinationPlant.label : '',
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
        if (item.Value === '0' || selectedVendors.includes(item.Value)) return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'VendorPlant') {
      filterPlantList && filterPlantList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'DestinationPlant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
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
      reset({ VendorPlant: '' })
      setVendorPlant([])
      setData({})

      //IF VENDOR PLANT IS CONFIGURABLE
      getConfigurationKey().IsVendorPlantConfigurable && dispatch(getPlantBySupplier(newValue.value, () => { }))

      //IF VENDOR PLANT IS NOT CONFIGURABLE
      if (!getConfigurationKey().IsVendorPlantConfigurable) {
        let data = {
          VendorId: newValue.value,
          VendorPlantId: getConfigurationKey().IsVendorPlantConfigurable ? newValue.value : "00000000-0000-0000-0000-000000000000",
        }
        dispatch(getVBCDetailByVendorId(data, (res) => {
          if (res && res.data && res.data.Data) {
            setData(res.data.Data)
          }
        }))
      }

    } else {
      setVendor([])
      setVendorPlant([])
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
  * @method handleChangeVendorPlant
  * @description  USED TO HANDLE CHANGE
  */
  const handleChangeVendorPlant = (newValue) => {
    if (newValue && newValue !== '') {
      setVendorPlant(newValue)
      let data = {
        VendorId: vendor.value,
        VendorPlantId: getConfigurationKey().IsVendorPlantConfigurable ? newValue.value : "00000000-0000-0000-0000-000000000000",
      }
      dispatch(getVBCDetailByVendorId(data, (res) => {
        if (res && res.data && res.data.Data) {
          setData(res.data.Data)
        }
      }))
    } else {
      setVendorPlant([])
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
                    placeholder={"-Select-"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={vendor.length !== 0 ? vendor : ""}
                    options={renderListing("Vendor")}
                    mandatory={true}
                    handleChange={handleVendorChange}
                    errors={errors.Vendor}
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
                    />
                  </Col>}

                {initialConfiguration?.IsVendorPlantConfigurable &&
                  <Col md="12">
                    <SearchableSelectHookForm
                      label={"Vendor Plant"}
                      name={"VendorPlant"}
                      placeholder={"-Select-"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={vendorPlant.length !== 0 ? vendorPlant : ""}
                      options={renderListing("VendorPlant")}
                      mandatory={true}
                      handleChange={handleChangeVendorPlant}
                      errors={errors.VendorPlant}
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
                    <div className={"cross-icon"}>
                      <img
                        src={require("../../../assests/images/times.png")}
                        alt="cancel-icon.jpg"
                      />
                    </div>{" "}
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