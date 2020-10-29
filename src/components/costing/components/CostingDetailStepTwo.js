import React, { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import { TextFieldHookForm, SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { } from '../actions/Costing';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { toastr } from 'react-redux-toastr';
import { checkForNull } from '../../../helper';
import $ from 'jquery';

function CostingDetailStepTwo(props) {

  const { register, handleSubmit, watch, control, setValue, getValues, reset, errors } = useForm();

  const { partInfo } = props;
  const [isEditFlag, setIsEditFlag] = useState(false);


  //console.log('watch', watch('zbcPlantGridFields'))
  const fieldValues = useWatch({
    control,
    name: ['zbcPlantGridFields', 'Technology'], // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    //defaultValue: 'default' // default value before the render
  });

  const dispatch = useDispatch()

  useEffect(() => {
    //dispatch(getPartInfo('', () => { }))
  }, []);

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {

    const temp = [];

    if (label === 'Technology') {
      // technologySelectList && technologySelectList.map(item => {
      //   if (item.Value === '0') return false;
      //   temp.push({ label: item.Text, value: item.Value })
      //   return null;
      // });
      // return temp;
    }

    if (label === 'PartList') {
      // partSelectList && partSelectList.map(item => {
      //   if (item.Value === '0') return false;
      //   temp.push({ label: item.Text, value: item.Value })
      //   return null;
      // });
      // return temp;
    }

  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    reset({
      Technology: '',
      Part: '',
    })
  }

  console.log('errors >>>', errors);

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {
    console.log('values >>>', values);
  }



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
              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >

                <Row>
                  <Col md="2"><div className={'part-info-title'}><p>Part No.</p>{partInfo.PartNumber}</div></Col>
                  <Col md="2"><div className={'part-info-title'}><p>Part Name</p>{partInfo.PartName}</div></Col>
                  <Col md="2"><div className={'part-info-title'}><p>{partInfo.VendorType}</p>{partInfo.VendorType}</div></Col>
                  <Col md="2"><div className={'part-info-title'}><p>Costing ID</p>{partInfo.CostingNumber}</div></Col>
                  <Col md="4"><div className={'part-info-title'}><p>Costing Date Time</p>{partInfo.CreatedDate}</div></Col>
                </Row>
                <Row>
                  <Col md="3">
                    <button
                      type="button"
                      className="submit-button mr5 save-btn"
                      onClick={props.backBtn} >
                      <div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                      {'Back '}
                    </button>
                  </Col>
                  <Col md="12">
                    <div className="left-border">
                      {'Costing Details Step 2:'}
                    </div>
                  </Col>

                </Row>
              </form>
            </div>
          </Col>
        </Row>
      </div>

    </>
  );
};


export default CostingDetailStepTwo;