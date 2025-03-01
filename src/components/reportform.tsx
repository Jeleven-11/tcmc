'use client'
import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEdgeStore } from "@/app/lib/edgestore";
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
interface FormData {
  fullName: string;
  age: string;
  sex: string;
  address: string;
  contactNumber: string;
  isOwner: string;
  driversLicense: string;
  vehicleRegistration: string;
  orCr: string;
  reason: string;
  vehicleType: string;
  vehicleImage: string;
  platenumber: string;
  color: string;
  description: string;
}
function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}
const ReportForm = () =>
{
  const { edgestore } = useEdgeStore()

  const [message, setMessage] = React.useState('')
  const [timer, setTimer] = React.useState(30)
  const [alertColor, setAlertColor] = React.useState('bg-green-100') // Default color for success
  const [isModalOpen, setIsModalOpen] = React.useState(false) // State to control modal visibility
  const [reportID, setReportID] = React.useState('')

  const [dvrLicenseVal, setDvrLicense] = React.useState("") // url
  const [fileDL, setFileDL] = React.useState<File>()
  const [progress1, setProgress1] = React.useState(0)

  const [vRegistrationVal, setVRegistration] = React.useState("") // url
  const [fileVR, setFileVR] = React.useState<File>()
  const [progress2, setProgress2] = React.useState(0)

  const [orCrVal, setOrCr] = React.useState("") // url
  const [fileOR, setFileOR] = React.useState<File>()
  const [progress3, setProgress3] = React.useState(0)

  const [vehicleImgVal, setVehicleImgVal] = React.useState("") // url
  const [fileVehicleImg, setFileVehicleImg] = React.useState<File>()
  // const [progress4, setProgress4] = React.useState(0)

  const [totalUploadProgress, setTotalUploadProgress] = React.useState(0)
  React.useEffect(() => {
    setTotalUploadProgress((progress1 + progress2 + progress3 ) / 3);
  }, [progress1, progress2, progress3]);
  const [formData, setFormData] = React.useState<FormData>({
    fullName: '',
    age: '',
    sex: '',
    address: '',
    contactNumber: '',
    isOwner: 'No',
    driversLicense: "",
    vehicleRegistration: "",
    orCr: "",
    reason: 'Stolen? Involved in an incident/accident?',
    vehicleType: 'Motorcycle',
    vehicleImage:'',
    platenumber: '',
    color: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>
  {
    e.preventDefault()

    const generatedReportID = `REP-${uuidv4().slice(0, 8).toUpperCase()}` // Generate unique report ID
    setReportID(generatedReportID) // Set the generated report ID

    const formDataToSend = {
      ...formData,
      reportID: generatedReportID
    }
    // const upload
    if(!fileVehicleImg) return alert('Please upload an image of the reported vehicle for verification purposes!');
    if (formData.isOwner === 'Yes') {
      const uploadFiles = async () => {
        if(!fileDL || !fileVR || !fileOR) return alert('Please upload ALL required files for verification purposes!');
       
      //   const filesToUpload = [fileDL, fileVR, fileOR];
      //   // const uploadIncrement = 100 / filesToUpload.length;
      //   const uploadPromises = filesToUpload.map(async (file, index) => {
      //     try {
      //       return await edgestore.publicFiles.upload({
      //         file,
      //         onProgressChange: async(progress) => {
      //           if (index === 0) {
      //             setProgress1(progress);
      //           } else if (index === 1) {
      //             setProgress2(progress);
      //           } else if (index === 2) {
      //             setProgress3(progress);
      //           }
      //           setTotalUploadProgress(progress1 + progress2 + progress3);
      //           // setTotalUploadProgress(totalUploadProgress+((progress/100) * uploadIncrement));
      //         },

      //       });
      //     } catch (error) {
      //       console.error('Error uploading file:', error);
      //       throw error; // Rethrow the error to handle it outside the map function
      //     }
      //   });

      //   try {
      //     const results = await Promise.all(uploadPromises);
      //     const urls = results.map((result) => result.url);
      //     console.log('urls: ', urls);
      //     setDvrLicense(urls[0]);
      //     setVRegistration(urls[1]);
      //     setOrCr(urls[2]);
      //   } catch (error) {
      //     console.error('Error uploading files:', error);
      //     // Handle the error here
      //     alert('Error encountered during uploading of files.');
      //   }
        

        const [res1, res2, res3] = await Promise.all([
          edgestore.publicFiles.upload({
            file: fileDL,
            onProgressChange: async (progress) => {
              setProgress1(progress);
              setTotalUploadProgress((progress+progress2+progress3)/3)
              console.log("Progress1 : ", progress)
            },
          }),
          edgestore.publicFiles.upload({
            file: fileVR,
            onProgressChange: async(progress) => {
              setProgress2(progress);
              setTotalUploadProgress((progress1+progress+progress3)/3)
              console.log("Progress2 : ", progress)
              
              // setTotalUploadProgress((progress1+progress2+progress3)/3)
              
            },
          }),
          edgestore.publicFiles.upload({
            file: fileOR,
            onProgressChange: async(progress) => {
              
              setProgress3(progress);
              setTotalUploadProgress((progress1+progress2+progress)/3)
              console.log("Progress3 : ", progress)

            },
          }),
          // setTotalUploadProgress((progress1+progress2+progress3)/3)
        ]);
        setDvrLicense(res1.url);
        setVRegistration(res2.url);
        setOrCr(res3.url);
        

        // const totalProgress = (progress1 + progress2 + progress3) / 3;
        // setTotalUploadProgress(totalProgress);
        // if(totalUploadProgress==100)
        // return totalUploadProgress
        





        // const res1 = await edgestore.publicFiles.upload({
        //   file: fileDL,
        //   onProgressChange: (progress1) => {
        //     setProgress1(progress1)
        //   },
        // })
        // setDvrLicense(res1.url)
      
        // const res2 = await edgestore.publicFiles.upload({
        //   file: fileVR,
        //   onProgressChange: (progress2) => {
        //     setProgress2(progress2)
        //   },
        // })
        // setVRegistration(res2.url)
      
        // const res3 = await edgestore.publicFiles.upload({
        //   file: fileOR,
        //   onProgressChange: (progress3) => {
        //     setProgress3(progress3)
        //   },
        // })
        // setOrCr(res3.url)
        // setTotalUploadProgress((progress1+progress2+progress3)/3)
        // return totalUploadProgress;
      }
      // const total = await uploadFiles()
      await uploadFiles()
      // if (total != 100 && dvrLicenseVal === "" || vRegistrationVal === "" || orCrVal === "")
      //   return alert('Please upload all required files for verification purposes!');
      
      formDataToSend.driversLicense = dvrLicenseVal;
      formDataToSend.vehicleRegistration = vRegistrationVal;
      formDataToSend.orCr = orCrVal;
      formDataToSend.vehicleImage = vehicleImgVal;
    }
    const vehicleImageUpload = await edgestore.publicFiles.upload({
      file: fileVehicleImg,
      onProgressChange: async (progress) => {
        setProgress1(progress);
        setTotalUploadProgress((progress+progress2+progress3)/3)
        console.log("Progress1 : ", progress)
      },
    })
    setVehicleImgVal(vehicleImageUpload.url)
    setTotalUploadProgress(100)

    try
    {
      const response = await fetch('/api/reporthandler', {
        method: 'POST',
        body: JSON.stringify(formDataToSend),
      })

      if (response.ok)
      {
        //const data = await response.json()
        setMessage(`Report submitted successfully! Your report ID is ${generatedReportID}.`)
        setAlertColor('bg-green-100') // Green for success
        setIsModalOpen(true) // Open modal on success
        setTimer(30)
        setTotalUploadProgress(0)
        setFormData({
          fullName: '',
          age: '',
          sex: '',
          address: '',
          contactNumber: '',
          isOwner: 'No',
          driversLicense: "",
          vehicleRegistration: "",
          orCr: "",
          reason: '',
          vehicleType: 'Motorcycle',
          vehicleImage:'',
          platenumber: '',
          color: '',
          description: '',
        })
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
        setAlertColor('bg-red-100') // Red for error
        setIsModalOpen(true) // Open modal on error
      }
    } catch (err) {
      console.log(err)
      setMessage('An unexpected error occurred. Please try again later.')
      setAlertColor('bg-red-100') // Red for error
      setIsModalOpen(true) // Open modal on error
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>  setFormData({...formData, [e.target.name]: e.target.value})
  const handleCloseModal = () => setIsModalOpen(false) // Close the modal when the user clicks close
  const handleCopyCode = () =>
  {
    navigator.clipboard.writeText(reportID) // Copy the report ID to clipboard
    alert('Report ID copied to clipboard!') // Show success alert
  }

  // Update the alert box color opacity based on the timer
  React.useEffect(() =>
  {
    if (timer === 0)
      return // Stop when timer reaches 0

    const interval = setInterval(() => { setTimer((prev) => prev - 1) }, 1000) // Decrease timer every second 

    return () => clearInterval(interval)
  }, [timer])

  // Dynamically reduce opacity of the modal alert over time
  const alertStyle = {
    opacity: `${timer / 30}`,
    transition: 'opacity 1s ease-out',
  }

  return (
    <div className="container mx-auto p-6 mt-6">
      <div className="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded mb-4 flex items-start">
        <span className="mr-2 text-xl">ℹ️</span>
        <p>Got any complaints? Submit one through the form below:</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {/* Renamed from complainant to Informant/Reporting Party */}
        {/* Complainant Details */}
        <h2 className="text-2xl font-bold mb-4">Informant / Reporting Party Details</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Sex</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
            required
          />
        </div>
        {/* missing marital status field */}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Are you the owner of the vehicle being reported?</label>
          <select
            name="isOwner"
            value={formData.isOwner}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {formData.isOwner === 'Yes' && (
          <>
            <p className='text-gray-700 text-sm italic font-bold mb-2'>For verification purposes please upload the 
              following photos:
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Driver&apos;s License</label>
              <input
                type="file"
                id="driversLicense"
                name="driversLicense"
                onChange={(e) => {
                  setFileDL(e.target.files?.[0])
                }}
                accept="image/*, .pdf"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
              />

              {/* <div className="h-[6px] w-44 border overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-150"
                  style={{ width: `${progress1}%` }}
                />
              </div> */}

              {/* <button
                type="button"
                onClick={async () => {
                  if (fileDL) {
                    const res1 = await edgestore.publicFiles.upload({
                      file: fileDL,
                      onProgressChange: (progress1) => {
                        setProgress1(progress1)
                      },
                    })
                    setDvrLicense(res1.url)
                  }
                }}
              >
                Upload Driver&apos;s License
              </button> */}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Vehicle Registration</label>
              <input
                type="file"
                name="vehicleRegistration"
                onChange={(e) => {
                  setFileVR(e.target.files?.[0])
                }}
                accept="image/*, .pdf"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
              />

              {/* <div className="h-[6px] w-44 border overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-150"
                  style={{ width: `${progress2}%` }}
                />
              </div> */}

              {/* <button
                type="button"
                onClick={async () => {
                  if (fileVR) {
                    const res2 = await edgestore.publicFiles.upload({
                      file: fileVR,
                      onProgressChange: (progress2) => {
                        setProgress2(progress2)
                      },
                    })
                    setVRegistration(res2.url)
                  }
                }}
              >
                Upload Vehicle Registration
              </button> */}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">OR/CR</label>
              <input
                type="file"
                name="orCr"
                onChange={(e) => {
                  setFileOR(e.target.files?.[0])
                }}
                accept="image/*, .pdf"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
              />

              {/* <div className="h-[6px] w-44 border overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-150"
                  style={{ width: `${progress3}%` }}
                />
              </div> */}

              {/* <button
                type="button"
                onClick={async () => {
                  if (fileOR) {
                    const res3 = await edgestore.publicFiles.upload({
                      file: fileOR,
                      onProgressChange: (progress3) => {
                        setProgress3(progress3)
                      },
                    })
                    setOrCr(res3.url)
                  }
                }}
              >
                Upload OR/CR
              </button> */}
            </div>
          </>
        )}

        {/* Vehicle Details */}
        <h2 className="text-2xl font-bold mb-4">Vehicle Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
            >
              <option value="Motorcycle">Motorcycle</option>
              <option value="Car">Car</option>
              <option value="Truck">Truck</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Reason</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Plate Number</label>
            <input
              type="text"
              name="platenumber"
              value={formData.platenumber}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
            
            />
            
            
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Image of Reported Vehicle</label>
            <input
              type="file"
              name="platenumber"
              value={formData.vehicleImage}
              onChange={(e) => {
                setFileVehicleImg(e.target.files?.[0])
              }}
              accept="image/*"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Additional Description of Vehicle</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
              required
            ></textarea>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit Report
          </button>
        </div>
        <div className="flex justify-center mt-8">
          {formData.isOwner === 'Yes' && totalUploadProgress > 0 && (
            <Box sx={{ width: '100%' }}>
              <LinearProgressWithLabel value={totalUploadProgress} />
            </Box>)
          }
        </div>
      </form>

      {/* Modal */}
      {isModalOpen && (
        <div className={`fixed top-0 left-0 w-full h-full flex justify-center items-center ${alertStyle}`}>
          <div className={`bg-white p-6 rounded-lg shadow-lg ${alertColor}`}>
            <div className="flex justify-between items-center">
              <span className="font-bold">Report Submission</span>
              <button onClick={handleCloseModal} className="text-black font-bold">X</button>
            </div>
            <p>{message}</p>
            <div className="mt-4 flex justify-between items-center">
              <p className="font-semibold">Your Report ID:</p>
              <div>
                <span className="text-sm text-gray-700">{reportID}</span>
                <button
                  onClick={handleCopyCode}
                  className="ml-2 text-blue-500 text-sm font-bold"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportForm