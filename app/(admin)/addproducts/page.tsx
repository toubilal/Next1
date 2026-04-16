'use client'
import {Addproducts} from '@/components/admin/add-products'

export default function AddProduct()
{
  const existingCategories =[];
  
  return(
    <>
    <Addproducts 
          categories={existingCategories}
          onProductAdded={(newProd) => {
            addNewProductLocally(newProd);
            
          }} 
        />
   
    </>
    );
  
  
}