import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { storePartNumber } from '../actions/Costing';


export const Insights = (props) => {
  useEffect(() => {
    dispatch(storePartNumber(''))
  }, [])
  return (
    <div>

    </div>
  );
};