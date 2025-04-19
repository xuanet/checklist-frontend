import React from 'react'
import { useState } from 'react'
import './styles/Category.css'

function Category({ categoryName }) {


    const printConsole = () => {
        console.log("clicked")
    }


  return (
    <div className='category_wrapper'>
        <div className='display'>{categoryName}</div>
        <button onClick={printConsole}>Upload File</button>
    </div>
  )
}

export default Category