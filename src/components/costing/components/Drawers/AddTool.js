import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { useDispatch, } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { getOperationDrawerDataList } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm, } from '../../../layout/HookFormInputs';
import { checkForDecimalAndNull, checkForNull } from '../../../../helper';

function AddTool(props) {

  const { register, handleSubmit, control, setValue, reset, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)
  const [tool, setTool] = useState([]);
  //const [formData, setFormData] = useState({});

  const fieldValues = useWatch({
    control,
    name: ['Quantity', 'ToolCost', 'Life'],
  });
  console.log('fieldValues: ', fieldValues);

  useEffect(() => {
    getNetToolCost()
    setValue('NetToolCost', getNetToolCost())
  }, [fieldValues]);

  const toggleDrawer = (event, formData = {}) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', formData)
  };

  /**
  * @method getNetToolCost
  * @description GET NET TOOL COST
  */
  const getNetToolCost = () => {
    const cost = checkForNull(fieldValues.Quantity) * checkForNull(fieldValues.ToolCost) / checkForNull(fieldValues.Life)
    return checkForDecimalAndNull(cost, 2);
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {

    if (label === 'ToolCategory') {
      return [
        { label: 'TOOL 1', value: 'TOOL 1' },
        { label: 'TOOL 2', value: 'TOOL 2' },
      ];
    }

  }

  /**
  * @method handleToolChange
  * @description  TOOL CHANGE HANDLE
  */
  const handleToolChange = (newValue) => {
    if (newValue && newValue !== '') {
      setTool(newValue)
    } else {
      setTool([])
    }
  }

  /**
  * @method addRow
  * @description ADD ROW IN TO RM COST GRID
  */
  const addRow = () => {
    //toggleDrawer('')
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    reset({ ToolCategory: '' })
    props.closeDrawer('', {})
  }

  const onSubmit = data => {
    let formData = {
      ToolOperationId: 1,
      ProcessOrOperation: data.OperationName,
      ToolCategory: data.ToolCategory.label,
      ToolName: data.ToolName,
      Quantity: data.Quantity,
      ToolCost: data.ToolCost,
      Life: data.Life,
      NetToolCost: data.NetToolCost,
    }
    toggleDrawer('', formData)
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
                  <h3>{'ADD Tool'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>
            <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
              <>
                <Row>
                  <Col md="12">
                    <TextFieldHookForm
                      label="Process/Operation"
                      name={'OperationName'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        // pattern: {
                        //   value: /^[0-9]*$/i,
                        //   message: 'Invalid Number.'
                        // },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OperationName}
                      disabled={false}
                    />
                  </Col>

                  <Col md="12">
                    <SearchableSelectHookForm
                      label={'Tool Category'}
                      name={'ToolCategory'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={tool.length !== 0 ? tool : ''}
                      options={renderListing('ToolCategory')}
                      mandatory={true}
                      handleChange={handleToolChange}
                      errors={errors.ToolCategory}
                    />
                  </Col>

                  <Col md="12">
                    <TextFieldHookForm
                      label="Tool Name"
                      name={'ToolName'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        // pattern: {
                        //   value: /^[0-9]*$/i,
                        //   message: 'Invalid Number.'
                        // },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ToolName}
                      disabled={false}
                    />
                  </Col>

                  <Col md="12">
                    <TextFieldHookForm
                      label="Quantity"
                      name={'Quantity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^[0-9]*$/i,
                          message: 'Invalid Number.'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Quantity}
                      disabled={false}
                    />
                  </Col>

                  <Col md="12">
                    <TextFieldHookForm
                      label="Tool Cost"
                      name={'ToolCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^[0-9]*$/i,
                          message: 'Invalid Number.'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ToolCost}
                      disabled={false}
                    />
                  </Col>

                  <Col md="12">
                    <TextFieldHookForm
                      label="Life/Amortization"
                      name={'Life'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^[0-9]*$/i,
                          message: 'Invalid Number.'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Life}
                      disabled={false}
                    />
                  </Col>

                  <Col md="12">
                    <TextFieldHookForm
                      label="Net Tool Cost"
                      name={'NetToolCost'}
                      Controller={Controller}
                      control={control}
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
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.NetToolCost}
                      disabled={true}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between mt15">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                    </button>

                    <button
                      type={'submit'}
                      className="submit-button mr5 save-btn"
                      onClick={addRow} >
                      <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                      {'Save'}
                    </button>
                  </div>
                </Row>
              </>
            </form>

          </div>
        </Container>
      </Drawer>
    </div>
  );
}

export default React.memo(AddTool);