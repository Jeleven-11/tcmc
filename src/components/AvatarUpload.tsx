import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Flex, Upload, Avatar } from 'antd';
// import type { GetProp, UploadProps } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { useEdgeStore } from "@/app/lib/edgestore";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

// const getBase64 = (img: FileType, callback: (url: string) => void) => {
//   const reader = new FileReader();
//   reader.addEventListener('load', () => callback(reader.result as string));
//   reader.readAsDataURL(img);
// };

// const beforeUpload = (file: FileType) => {
//   const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
//   if (!isJpgOrPng) {
//     message.error('You can only upload JPG/PNG file!');
//   }
//   const isLt2M = file.size / 1024 / 1024 < 20;
//   if (!isLt2M) {
//     message.error('Image must smaller than 20MB!');
//   }
//   return isJpgOrPng && isLt2M;
// };

const App: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>();
    const [imageFile, setImageFile] = useState<File>();
    const { edgestore } = useEdgeStore()

  const handleChange: UploadProps['onChange'] = async(info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      setImageFile(info.file.originFileObj as FileType)
      return;
    }
    // if (info.file.status === 'done') {
      // Get this url from response in real world.
    //   const imageUpload = await edgestore.publicFiles.upload({
    //     file: info.file.originFileObj as FileType
    //   })
    //   setImageUrl(imageUpload.url);
    //   getBase64(info.file.originFileObj as FileType, (url) => {
    //     setLoading(false);
    //     setImageUrl(url);
    //   });
    // }
  };
  const uploadToEdgeStore = async() => {
    if(imageFile === undefined) return
    const imageUpload = await edgestore.publicFiles.upload({
        file: imageFile
      })
      setImageUrl(imageUpload.url);
      setLoading(false);
  }

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as FileType);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    // setImageFile(image.src as FileType)
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload Profile</div>
    </button>
  );

  return (
    <Flex gap="middle" wrap>
        <ImgCrop rotationSlider>
            <Upload
                name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                // showUploadList={false}
                // fileList={fileList}
                customRequest={uploadToEdgeStore}
                // beforeUpload={beforeUpload}
                onChange={handleChange}
                onPreview={onPreview}
            >
                {imageUrl ? <Avatar size={156} src={imageUrl} alt="avatar" style={{objectFit: 'contain'}}></Avatar> : uploadButton}
            </Upload>
        </ImgCrop>
    </Flex>
  );
};

export default App;