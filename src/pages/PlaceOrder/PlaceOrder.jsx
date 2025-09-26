import React from 'react'
import './PlaceOrder.css'

const PlaceOrder = () => {
  return (
    <form className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input type="text" placeholder='First Name' />
          <input type="text" placeholder='LastName' />
        </div>
        <input type="email" placeholder='Email' />
        <input type="number" placeholder='Phone' />
      </div>


      <div className="place-order-right">
        
      </div>
    </form>
  )
}

export default PlaceOrder
