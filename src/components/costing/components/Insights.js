import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { storePartNumber } from '../actions/Costing';

export const Insights = (props) => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(storePartNumber(''))
  }, [])
  return (
    <div>

    </div>
  );
};