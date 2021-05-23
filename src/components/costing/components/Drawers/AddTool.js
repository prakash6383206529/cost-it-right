import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { getToolCategoryList } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm, } from '../../../layout/HookFormInputs';
import { checkForDecimalAndNull, checkForNull } from '../../../../helper';

function AddTool(props) {

  const { rowObjData, isEditFlag, ProcessOperationArray, gridData } = props;

  const defaultValues = {
    ToolOperationId: rowObjData?.ToolOperationId ? rowObjData.ToolOperationId : '',
    ProcessOrOperation: rowObjData?.ProcessOrOperation ? { label: rowObjData.ProcessOrOperation, value: rowObjData.ProcessOrOperation } : [],
    ToolCategory: rowObjData?.ToolCategory ? { label: rowObjData.ToolCategory, value: rowObjData.ToolCategory } : [],
    ToolName: rowObjData?.ToolName ? rowObjData.ToolName : '',
    Quantity: rowObjData?.Quantity ? rowObjData.Quantity : '',
    ToolCost: rowObjData?.ToolCost ? rowObjData.ToolCost : '',
    Life: rowObjData?.Life ? rowObjData.Life : '',
    TotalToolCost: rowObjData?.TotalToolCost ? rowObjData.TotalToolCost : '',
  }

  const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: isEditFlag ? defaultValues : {},
  });

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)
  const [tool, setTool] = useState(isEditFlag && rowObjData?.ToolCategory ? { label: rowObjData.ToolCategory, value: rowObjData.ToolCategory } : []);
  const [ToolForProcessOperation, setToolForProcessOperation] = useState(isEditFlag && rowObjData?.ProcessOrOperation ? { label: rowObjData.ProcessOrOperation, value: rowObjData.ProcessOrOperation } : []);
  const [selectedTools, setSelectedTool] = useState();

  const fieldValues = useWatch({
    control,
    name: ['Quantity', 'ToolCost', 'Life'],
  });

  useEffect(() => {
    dispatch(getToolCategoryList(res => { }))

    let tempArr = [];
    gridData && gridData.map(el => {
      tempArr.push(el.ProcessOrOperation)
      return null;
    })
    setSelectedTool(tempArr)
  }, [])

  const ToolCategoryList = useSelector(state => state.costing.ToolCategoryList)


  useEffect(() => {
    getNetToolCost()
    setValue('TotalToolCost', getNetToolCost())
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
    let temp = [];

    if (label === 'ToolCategory') {
      ToolCategoryList && ToolCategoryList.map((item) => {
        if (item.Value === '') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'ToolProcessOperation') {
      ProcessOperationArray && ProcessOperationArray.map((item) => {
        if (item.Value === '' || (selectedTools && selectedTools.includes(item.label))) return false
        temp.push(item)
        return null;
      })
      return temp
    }

  }

  /**
  * @method handleProcessOperationChange
  * @description  TOOL CHANGE HANDLE
  */
  const handleProcessOperationChange = (newValue) => {
    if (newValue && newValue !== '') {
      setToolForProcessOperation(newValue)
    } else {
      setToolForProcessOperation([])
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

    if (Object.keys(errors).length > 0) return false;

    let formData = {
      ToolOperationId: isEditFlag ? rowObjData.ToolOperationId : '',
      ProcessOrOperation: ToolForProcessOperation.label,
      ToolCategory: tool.label,
      ToolName: getValues('ToolName'),
      Quantity: getValues('Quantity'),
      ToolCost: getValues('ToolCost'),
      Life: getValues('Life'),
      TotalToolCost: getValues('TotalToolCost'),
    }
    toggleDrawer('', formData)
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    reset({ ToolCategory: '' })
    props.closeDrawer('', {})
  }

  const onSubmitForm = data => {
    let formData = {
      ToolOperationId: isEditFlag ? rowObjData.ToolOperationId : '',
      ProcessOrOperation: ToolForProcessOperation.label,
      ToolCategory: data.ToolCategory.label,
      ToolName: data.ToolName,
      Quantity: data.Quantity,
      ToolCost: data.ToolCost,
      Life: data.Life,
      TotalToolCost: data.TotalToolCost,
    }
    toggleDrawer('', formData)
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
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
            <form noValidate className="form" onSubmit={handleSubmit(onSubmitForm)}>
              <>
                <Row className="pl-3">
                  <Col md="12">
                    <SearchableSelectHookForm
                      label={'Process/Operation'}
                      name={'ProcessOrOperation'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={ToolForProcessOperation.length !== 0 ? ToolForProcessOperation : ''}
                      options={renderListing('ToolProcessOperation')}
                      mandatory={true}
                      handleChange={handleProcessOperationChange}
                      errors={errors.ProcessOrOperation}
                      disabled={isEditFlag ? true : false}
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
                      disabled={isEditFlag ? true : false}
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
                      disabled={isEditFlag ? true : false}
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
                          value: /^\d*\.?\d*$/,
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
                          value: /^\d*\.?\d*$/,
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
                      label="Total Tool Cost"
                      name={'TotalToolCost'}
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
                      errors={errors.TotalToolCost}
                      disabled={true}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between mt15">
                  <div className="col-sm-12 text-right pr-3">
                    <button
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                    </button>

                    <button
                      type={'button'}
                      className="submit-button save-btn"
                      onClick={addRow}
                    >
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