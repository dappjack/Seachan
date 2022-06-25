import React, { useState } from 'react'
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = () => {
  return (
    <div className="center">
      <Spinner className="spinner" animation="border" role="status" >
        <span className="visually-hidden ">creating...</span>
      </Spinner>
    </div>
  );
}
export default LoadingSpinner