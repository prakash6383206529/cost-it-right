import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { getVendorWithVendorCodeSelectList } from '../../../actions/Common';

export default function AddVendorDrawer(props) {

  const { register, handleSubmit, watch, errors, control } = useForm();

  const [vendor, setVendor] = useState([]);

  const dispatch = useDispatch()
  const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)

  useEffect(() => {
    dispatch(getVendorWithVendorCodeSelectList(() => { }))
  }, []);

  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('')
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

  }

  /**
  * @method handleChange
  * @description  USED TO HANDLE CHANGE
  */
  const handleChange = (newValue) => {
    if (newValue && newValue !== '') {
      setVendor(newValue)
    } else {
      setVendor([])
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    toggleDrawer('')
  }

  const onSubmit = data => {
    props.closeDrawer()
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
        <Container>
          <div className={'drawer-wrapper'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'ADD VENDOR'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Row>

                <Col md="12">
                  <SearchableSelectHookForm
                    label={'Vendor'}
                    name={'Vendor'}
                    placeholder={'-Select-'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={vendor.length !== 0 ? vendor : ''}
                    options={renderListing('Vendor')}
                    mandatory={true}
                    handleChange={handleChange}
                    errors={errors.Vendor}
                  />
                </Col>
              </Row>

              <Row className="sf-btn-footer no-gutters justify-content-between">
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
                    {'ADD'}
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

