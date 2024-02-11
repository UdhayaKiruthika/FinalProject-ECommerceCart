import React, { useEffect, useState} from 'react';
import {Fragment} from "react"
import MetaData from ".././layouts/MetaData"
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../../actions/productActions';
import Loader from '.././layouts/Loader';
import Product from '.././product/Product';
import {toast} from 'react-toastify';
import  Pagination  from 'react-js-pagination'
import { useParams } from 'react-router-dom';
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap_white.css';
export default function ProductSearch(){
    const dispatch = useDispatch();
    const {products,loading,error,productsCount,resPerPage}= useSelector((state)=>state.productsState)
    const [currentPage,setCurrentPage]=useState(1);
    const {keyword}=useParams();
    const [price,setPrice]=useState([1,50000]);
    const [priceChanged,setPriceChanged]=useState(price)
    const [category,setCategory]=useState(null)
    const [ratings,setRatings]=useState(0)
    const categories=['Home Decor',
    'Laptops',
    'Mobile phones',
    'Watch',
    'Smart Watch',
    'Cloth',
    'Accessories',
    'Headphones',
    'Sports',
'Books']
    const setCurrentPageNo = (pageNo)=>{
    
      setCurrentPage(pageNo)
    }
    useEffect(()=>{
      if(error){
        toast.error("Hello Online shoppers!!",{
        position:toast.POSITION.BOTTOM_CENTER
      })}
      dispatch(getProducts(keyword,priceChanged,category,ratings,currentPage))
    },[error,dispatch,currentPage,keyword,priceChanged,category,ratings])
    return(
      <Fragment>
        { loading ? <Loader/> :
        <Fragment>
     <MetaData title={`Online Shopping`}/>  
         <h1 id="products_heading">Search Products</h1>
          <section id="products" className="container mt-5">
          <div className="row">
            <div className='col-6 col-md-3 mb-5 mt-5'>
                {/* Price filter */}
                <div className='px-5' onMouseUp={()=>setPriceChanged(price)}> 
                <Slider range={true}
                marks={{
                    1:"Rs1",
                    50000:"Rs.50000"
                }}
                min={1}
                max={50000}
                defaultValue={price}
                onChange={(price)=>{setPrice(price)}}
                handleRender = {
                    renderProps=>{
                        return (
                            <Tooltip overlay={`Rs.${renderProps.props['aria-valuenow']}`}><div {...renderProps.props}></div></Tooltip>
                        )
                    }
                }
                />
               
                </div>
                <hr className="my-5"/>
                {/* Category Filter */}
                <div className='mt-5'>
                   <h3 className="mb-3">Categories</h3>
                   <ul className="pl-0">
                    {categories.map(category=>
                    <li
                    style={{cursor:"pointer",
                    listStyleType:"none"}}
                    key={category}
                    onClick={()=>{setCategory(category)}}>
                        {category}
                    </li>
                    )}
                    </ul> 
                </div>
                <hr className='my-5'/>
                {/* Rating Filter */}
                <div className="mt-5">
                <h3 className="mb-3">Ratings</h3>
                   <ul className="pl-0">
                    {[5,4,3,2,1].map(star=>
                    <li
                    style={{cursor:"pointer",
                    listStyleType:"none"}}
                    key={star}
                    onClick={()=>{setRatings(star)}}>
                        <div className="rating-outer">
                            <div className="rating-inner"style={{width:`${star*20}%`}}>

                            </div>
                        </div>
                    </li>
                    )}
                    </ul>
                </div>
            </div>
            <div className='col-6 col-md-9'>
                <div className='row'>
                {products && products.map(product=>(
              <Product col={4}key={product._id} product={product}/>
            ))}
                </div>
            </div>
            
          </div>
            </section>
            {productsCount > 0 && productsCount > resPerPage?
       <div className='d-felx justify-content-ceter mt-5'>
        <Pagination 
            activePage={currentPage}
            onChange={setCurrentPageNo}
            totalItemsCount={productsCount}
            itemsCountPerPage={resPerPage}
            nextPageText={'Next'}
            firstPageText={'First'}
            lastPageText={'Last'}
            itemClass={'page-item'}
            linkClass={'page-link'}
        
        
        />
        
        
        
       </div> :null}
      </Fragment>
      }
      </Fragment>
      
    )
}