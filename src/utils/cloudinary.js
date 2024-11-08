import {v2 as cloudinary} from cloudinary;
import fs from "fs"


cloudinary.config({ 
    cloud_name: 'dslucyfvn', 
    api_key: '621618253994512', 
    api_secret: 'N0SpSxAIcCK_XWWwo_0bCNUsQJo' // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        //upload the file on Cloudinary

       const response = await  cloudinary.uploader.upload.upload(localFilePath,{
            resource_type :"auto"
        })
        console.log("File is UPloadede on Cloudinary",response.url);
        return response;
    }
    catch(error){
         fs.unlinkSync(localFilePath)
         console.log("Error while uploading file on Cloudinary",error);
         return null;

         
    }
}







const uploadResult = await cloudinary.uploader
.upload(
    'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
        public_id: 'shoes',
    }
)
.catch((error) => {
    console.log(error);
});

console.log(uploadResult);

export{uploadOnCloudinary}