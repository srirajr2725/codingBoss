import React, { useState, useEffect, useRef } from 'react'
import { useForm, useFieldArray,Controller } from 'react-hook-form'
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Slider,
  IconButton,
  Checkbox,
  InputAdornment,
   Dialog, 
   DialogTitle,
    DialogContent, 
    DialogActions} from '@mui/material';

import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import PreviewIcon from '@mui/icons-material/Preview';
import GitHubIcon from '@mui/icons-material/GitHub'
import LanguageIcon from '@mui/icons-material/Language'
import axios from 'axios'
import { padding } from '@mui/system'
import apiClient from '../utils/apiClient'
import { useNavigate } from 'react-router-dom'
import CryptoJS from 'crypto-js'
import { FaDownload } from 'react-icons/fa';
import CalendarComponent from './CalendarView' // Import your 


const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  mobile_number: yup.string().required('Mobile number is required'),
  dob: yup.date().required('Date of birth is required'),
  current_location: yup.string().required('Current location is required'),
  native_location: yup.string().required('Native location is required'),
  linkedin_url: yup.string().required('Linkedin is required'),
  education: yup
    .array()
    .of(
      yup.object({
        degree: yup.string().required('Degree is required'),
        year: yup
          .number()
          .typeError('Year must be a number')
          .required('Year is required'),
        institution: yup.string().required('Institution is required'),
      })
    )
    .required(),
  experience: yup
    .array()
    .of(
      yup.object({
        role: yup.string().required('Role is required'),
        organization: yup.string().required('Company is required'),
        duration: yup
          .number()
          .typeError('Years must be a number')
          .required('Years are required'),
      })
    )
    .required(),
  training_history: yup
    .array()
    .of(
      yup.object({
        company: yup.string().required('Company name is required'),
        eventPlace: yup.string().required('Event Place is required'),
        programTitle: yup.string().required('Program Title is required'),
        audience: yup.string().required('Targeted Audience is required'),
      })
    )
    .min(1, 'At least one training history is required') // Optional: Add a minimum requirement
    .required(),
  skills: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required('Skill name is required'),
        rating: yup.number().required('Rating is required'),
      })
    )
    .required(),
  projects: yup
    .array()
    .of(
      yup.object({
        title: yup.string().required('Project title is required'),
        description: yup.string().required('Project description is required'),
      })
    )
    .required(),
  declaration: yup.bool().oneOf([true], 'You must accept the declaration'),
})

const steps = [
  'Personal Info',
  'Education',
  'Experience',
  'Training History',
  'Skills',
  'Projects',
  'Resume',
]

export default function TrainerFormFullScreen({

  isLoggedIn,
  username,
  setIsLoggedIn,
  userRole,
  handleLogout,
  setSelectedTab,
}) {
  // Add default project values in useForm
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      skills: [{ name: "", rating: "" }], // Default skill values
    },
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      mobile_number: '',
      dob: '',
      current_location: '',
      native_location: '',
      linkedin_url: '',
      profilePicture: null,
      education: [{ degree: '', year: '', institution: '' }],
      experience: [{ role: '', organization: '', duration: '' }],
      training_history: [
        { company: '', eventPlace: '', programTitle: '', audience: '' },
      ],
      skills: [{ name: '', rating: '' }],
      projects: [
        {
          title: '',
          description: '',
          repoLink: '',
          deployLink: '',
          thumbnail: null,
        },
      ],
    },
  })


  
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);


  let userId
  const storedEncryptedUserID = localStorage.getItem('userID')
  if (storedEncryptedUserID) {
    const bytes = CryptoJS.AES.decrypt(
      storedEncryptedUserID,
      'thirancoding360mgai'
    )
    userId = bytes.toString(CryptoJS.enc.Utf8)
  }


  const {
    fields: educationFields,
    append: addEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: 'education' })

  const {
    fields: experienceFields,
    append: addExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: 'experience' })

  const {
    fields: trainingFields,
    append: addTraining,
    remove: removeTraining,
  } = useFieldArray({ control, name: 'training_history' })

  const {
    fields: skillsFields,
    append: addSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: 'skills',
  })

    

  // Field Array for Projects
  const {
    fields: projectFields,
    append: addProject,
    remove: removeProject,
  } = useFieldArray({
    control,
    name: 'projects',
  })

  // Handle Thumbnail Upload
  const handleThumbnailUpload = (e, index) => {
    const file = e.target.files[0]
    if (file) {
      // Update the project field with the thumbnail file
      projectFields[index].thumbnail = file
    }
  }
  const [step, setStep] = useState(0)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const stepRefs = useRef([])
  const containerRef = useRef(null)
  const dynamicMarginTop = () => {
    switch (step) {
      case 0:
        return '150px'
      case 1:
        return 'auto'
      case 2:
        return 'auto'
      case 3:
        return 'auto'
      case 4:
        return 'auto'
      case 5:
        return '60px'
      default:
        return 'auto'
    }
  }
  const stepValidationFields = {
    0: [
      'name',
      'mobile_number',
      'dob',
      'current_location',
      'native_location',
      'linkedin_url',
    ], // Fields for Step 0
    1: ['education'], // Fields for Step 1
    2: ['experience'], // Fields for Step 2
    3: ['training_history'], // Fields for Step 2
    4: ['skills'], // Fields for Step 3
    5: ['projects'], // Fields for Step 4
    6: ['resume', 'declaration'], // Fields for Step 5
  }
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // Store the file for submission
      setImagePreview(URL.createObjectURL(file)); // Show preview
    }
  };
  
  const navigate = useNavigate()
  const convertToFormData = (payload) => {

    const formData = new FormData();
  
    const appendFormData = (key, value) => {
      const keysToSendAsJSON = ["education", "experience", "training_history", "skills", "projects", "website"];
  
      if (keysToSendAsJSON.includes(key)) {
        // Convert the value to a JSON string for specified keys
        formData.append(key, JSON.stringify(value || []));
      } else if (Array.isArray(value)) {
        // Handle other arrays
        value.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            Object.keys(item).forEach((subKey) => {
              formData.append(`${key}[${index}][${subKey}]`, item[subKey]);
            });
          } else {
            formData.append(`${key}[${index}]`, item);
          }
        });
      } else if (typeof value === "object" && value !== null) {
        // Handle objects
        Object.keys(value).forEach((subKey) => {
          formData.append(`${key}[${subKey}]`, value[subKey]);
        });
      } else if (value !== undefined && value !== null) {
        // Handle primitive values
        formData.append(key, value);
      }
    };
  
    Object.keys(payload).forEach((key) => appendFormData(key, payload[key]));
  
    return formData;
  };
  
  const handleSliderChange = (index, value) => {
    setValue(`skills.${index}.rating`, value); // No 'e'
  };
  

  // useEffect(() => {
  //    if (!isLoggedIn) {
  //      const email = localStorage.getItem("username");;
  //      const EncryptPassword = localStorage.getItem("password");
  //      const bytes = CryptoJS.AES.decrypt(EncryptPassword, 'thirancoding360mgai');
  //      const password = bytes.toString(CryptoJS.enc.Utf8);
  //      const Login = async () => {
  //        try {
  //          const response = await apiClient(
  //            "quiz/users/login/",
  //            "POST",
  //            JSON.stringify({ email, password }),
  //            { "Content-Type": "application/json" }
  //          );
  //          if (!response.message === "Login Successful") {
  //            navigate('/LoginPage');
  //          }
  //          setIsLoggedIn(true);
  //        } catch (error) {
  //          navigate('/LoginPage');
  //        }
  //      }
  //      Login();
  //    }
  //  }, [isLoggedIn, navigate])

  useEffect(() => {
    const fetchSavedData = async () => {
      try {
        let data = await apiClient(`trainer/trainers/get/${userId}`, 'GET');
        data = data[0];
        console.log(data);

        // Transform data if necessary, then reset the form
        reset({
          ...data,
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        })
        let image = data.image && `https://api.codingboss.in/${data.image}` || null;
        setImagePreview(image || null)

        
        let resumefileName = data.resume && `https://api.codingboss.in/${data.resume}` || null;
        setResumeLink(resumefileName || null);

        const parts = data.resume && data.resume.split('/');
        const fileName = parts[parts.length - 1]; // Get the last part of the URL
        setResumeName(fileName || null);


        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch saved data:', error);
        setIsLoading(false);
      }
    }

    fetchSavedData()
  }, [reset])

  const onSubmit = async (data) => {
    // Construct the payload object
    const payload = {
      user: userId || null, // User ID (Replace with actual user ID)
      name: data.name || "", // Full Name
      mobile_number: data.mobile_number || "", // Mobile Number
      dob: new Date(data.dob).toISOString().split('T')[0] || null, // Date of Birth in YYYY-MM-DD format
      current_location: data.current_location || "", // Current Location
      native_location: data.native_location || "", // Native Location
      profilePicture: image || null, // Profile Picture (Base64 or file path)
      linkedin_url: data.linkedin_url ||  "", // LinkedIn URL
      github_url: data.github_url || "", // GitHub URL
      website: [data.website] || [], // website Website URL
      education: data.education.map((edu) => ({
        degree: edu.degree, // Degree
        year: edu.year, // Year
        institution: edu.institution, // Institution Name
      })) || [], // Education
      experience: data.experience.map((exp) => ({
        role: exp.role, // Role/Position
        organization: exp.organization, // Company Name
        duration: exp.duration, // Number of Years
      })) || [],
      training_history: data.training_history.map((training) => ({
        company: training.company, // Training Organization
        eventPlace: training.eventPlace, // Event Location
        programTitle: training.programTitle, // Program Name
        audience: training.audience, // Targeted Audience
      })) || [],
      skills: data.skills.map((skill) => ({
        name: skill.name, // Skill Name
        rating: skill.rating, // Skill Rating (Slider Value)
      })) || [],
      projects: data.projects.map((project) => ({
        title: project.title, // Project Title
        description: project.description, // Project Description
        repoLink: project.repoLink || null, // GitHub Repository Link
        deployLink: project.deployLink || null, // Deployment Link
        thumbnail: project.thumbnail || null, // Thumbnail Image (Base64 or file path)
      })) || [],
      resume: resumeFile || null, // Uploaded Resume (Base64 or file path)
      terms_status: data.declaration || false, // Declaration Agreement (Checkbox Value)
    }

    try {
      console.log("payload", payload)
      const formData = convertToFormData(payload)
      if (resumeFile) {
        formData.append('resume', resumeFile)
      }
      if (image) {
        formData.append('image', image)
      }
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }
      const response = await apiClient(
        'trainer/trainers/post', // Endpoint
        'POST', // HTTP method
        formData // Request body (FormData)
      )

      console.log('Form submitted:', response);

      setModalTitle('Success');
      setModalMessage('Trainer profile submitted successfully!');
      setIsSuccess(true);
      setModalOpen(true);
    } catch (error) {
      console.error('Form submission failed:', error);

      setModalTitle('Submission Failed');
      setModalMessage('Something went wrong. Please try again.');
      setIsSuccess(false);
      setModalOpen(true);
    }
  }

  const nextStep = async () => {
    const currentFields = stepValidationFields[step]

    //  // Validate fields for the current step only
    const isStepValid = await trigger(currentFields)

    if (isStepValid) {
      setStep((prevStep) => prevStep + 1)
    } else {
      console.error('Validation failed for step:', step)
    }
  }

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1)
  }

  const [resumeFile, setResumeFile] = useState(null)
  const [declarationChecked, setDeclarationChecked] = useState(false)
const [resumeLink, setResumeLink] = useState(null)
const [resumeName, setResumeName] = useState(null)

const handleDownload = async () => {
  try {
    // Fetch the file as a blob
    const response = await fetch(resumeLink);
    if (!response.ok) {
      throw new Error('Failed to fetch the file.');
    }
    const blob = await response.blob();

    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = resumeName || 'download'; // File name for the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading the file:', error);
  }
};

const handleResumeUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    setResumeFile(file); // Store the file
    setResumeName(file.name); // Store file name
    setResumeLink(URL.createObjectURL(file)); // Allow preview & download
  }
};

useEffect(() => {
  if (image) {
    setImagePreview(URL.createObjectURL(image));
  }
  if (resumeFile) {
    setResumeLink(URL.createObjectURL(resumeFile));
  }
}, [image, resumeFile]);



  const handleDeclarationChange = (event) => {
    setDeclarationChecked(event.target.checked)
  }

  useEffect(() => {
    // Ensure the active step is scrolled into view
    if (stepRefs.current[step]) {
      stepRefs.current[step].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center', // Center the step horizontally
      })
    }

    // If on 0th step, ensure the container is scrolled to the start
    if (step === 0 && containerRef.current) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [step])

  const uploadFileWithJSON = async (file, jsonData) => {
    const formData = new FormData()

    // Append the file
    formData.append('file', file)

    // Append JSON data as a string
    formData.append('data', JSON.stringify(jsonData))

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'ngrok-skip-browser-warning': '98547', // Custom header if needed
        },
      })

      console.log('Upload success:', response.data)
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

   
  const handleModalClose = () => {
    setModalOpen(false);
    if (isSuccess) {
      setSelectedTab('calendar'); // 👈 Switch to Calendar tab
    }
  }
  // const isFormValid = resumeFile && declarationChecked // Validate both file upload and declaration checkbox

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <>
            {!isLoading ? (<Box
              position="relative"
              padding={2}
              border="1px solid #ddd"
              borderRadius="8px"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
              bgcolor="white"
            >
              <TextField
                fullWidth
                label="Full Name"
                {...register('name', { required: 'Full name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
                margin="normal"
              />
              <TextField
                fullWidth
                label="mobile_number"
                {...register('mobile_number', {
                  required: 'Mobile number is required',
                })}
                error={!!errors.mobile_number}
                helperText={errors.mobile_number?.message}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...register('dob', { required: 'Date of birth is required' })}
                error={!!errors.dob}
                helperText={errors.dob?.message}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Current Location"
                {...register('current_location', {
                  required: 'current location is required',
                })}
                error={!!errors.current_location}
                helperText={errors.current_location?.message}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Native Location"
                {...register('native_location', {
                  required: 'Native location is required',
                })}
                error={!!errors.native_location}
                helperText={errors.native_location?.message}
                margin="normal"
              />
              {/* <Typography variant="h6" marginTop={2}>
                Profile Picture
              </Typography> */}

<Box display="flex" alignItems="center" marginTop={2}>
{imagePreview && (
                <img
                  src={imagePreview}
                  alt="Profile"
                  style={{ width: "25px", height: "25px", borderRadius: "10%", marginRight: '8px' }}
                />
              )}
              <TextField
        fullWidth
        type="file"
        label="Profile Picture"
        InputLabelProps={{ shrink: true }}
        onChange={handleImageUpload}
        margin="normal"
      />

</Box>
      
              {/* <TextField
                fullWidth
                type="file"
                InputLabelProps={{ shrink: true }}
                onChange={handleImageUpload}
                margin="normal"
              />
              {image ? <img src={image} alt="Profile Selected" style={{width:"20px", height:"20px"}}/> : <p>No image selected</p>} */}

              {/* LinkedIn URL */}
              <Box display="flex" alignItems="center" marginTop={2}>
                <LinkedInIcon style={{ marginRight: '8px' }} color="primary" />
                <TextField
                  fullWidth
                  label="LinkedIn URL"
                  {...register('linkedin')}
                  margin="normal"
                  {...register('linkedin_url', {
                    required: 'Linkedin is required',
                  })}
                  error={!!errors.linkedin}
                  helperText={errors.linkedin?.message}
                />
              </Box>

              {/* GitHub URL */}
              <Box display="flex" alignItems="center" marginTop={2}>
                <GitHubIcon style={{ marginRight: '8px' }} />
                <TextField
                  fullWidth
                  label="GitHub URL"
                  {...register('github_url')}
                  margin="normal"
                />
              </Box>

              {/* website Website URL */}
              <Box display="flex" alignItems="center" marginTop={2}>
                <LanguageIcon
                  style={{ marginRight: '8px' }}
                  color="secondary"
                />
                <TextField
                  fullWidth
                  label="website Website URL"
                  {...register('website')}
                  margin="normal"
                />
              </Box>
            </Box>) : <p>Loading...</p>}
          </>
        )

      // Other steps remain unchanged

      case 1:
        return (
          <>
            <Grid container spacing={2}>
              {educationFields.map((field, index) => (
                <Grid item xs={12} key={field.id}>
                  <Box
                    position="relative"
                    padding={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                    bgcolor="white"
                  >
                    <IconButton
                      onClick={() => removeEducation(index)}
                      color="error"
                      style={{
                        position: 'absolute', // Position it absolutely within the card
                        top: '10px', // Align to the top
                        right: '10px', // Align to the right
                        padding: '8px',
                        backgroundColor: 'white',
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Box marginTop="20px">
                      <TextField
                        // style={{ paddingTop: '20px' }}
                        fullWidth
                        label="Degree"
                        {...register(`education.${index}.degree`)}
                        error={!!errors.education?.[index]?.degree}
                        helperText={errors.education?.[index]?.degree?.message}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Year"
                        type="number"
                        {...register(`education.${index}.year`)}
                        error={!!errors.education?.[index]?.year}
                        helperText={errors.education?.[index]?.year?.message}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Institution"
                        {...register(`education.${index}.institution`)}
                        error={!!errors.education?.[index]?.institution}
                        helperText={
                          errors.education?.[index]?.institution?.message
                        }
                        margin="normal"
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box marginTop={2} textAlign="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  addEducation({ degree: '', year: '', institution: '' })
                }
              >
                Add Education
              </Button>
            </Box>
          </>
        )

      case 2:
        return (
          <>
            <Grid container spacing={2}>
              {experienceFields.map((field, index) => (
                <Grid item xs={12} key={field.id}>
                  <Box
                    position="relative"
                    padding={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                    bgcolor="white"
                  >
                    <IconButton
                      onClick={() => removeExperience(index)}
                      color="error"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '8px',
                        backgroundColor: 'white',
                        // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        // borderRadius: '50%',
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Box marginTop="20px">
                      <TextField
                        fullWidth
                        label="Role"
                        {...register(`experience.${index}.role`)}
                        error={!!errors.experience?.[index]?.role}
                        helperText={errors.experience?.[index]?.role?.message}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Company"
                        {...register(`experience.${index}.organization`)}
                        error={!!errors.experience?.[index]?.organization}
                        helperText={
                          errors.experience?.[index]?.organization?.message
                        }
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Years"
                        type="number"
                        {...register(`experience.${index}.duration`)}
                        error={!!errors.experience?.[index]?.duration}
                        helperText={errors.experience?.[index]?.duration?.message}
                        margin="normal"
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box marginTop={2} textAlign="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  addExperience({ role: '', organization: '', duration: '' })
                }
              >
                Add Experience
              </Button>
            </Box>
          </>
        )

      case 3:
        return (
          <>
            <Grid container spacing={2}>
              {trainingFields.map((field, index) => (
                <Grid item xs={12} key={field.id}>
                  <Box
                    position="relative"
                    padding={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                    bgcolor="white"
                  >
                    <IconButton
                      onClick={() => removeTraining(index)}
                      color="error"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '8px',
                        backgroundColor: 'white',
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Box marginTop="20px">
                      <TextField
                        fullWidth
                        label="Company Name"
                        {...register(`training_history.${index}.company`)}
                        error={!!errors.training_history?.[index]?.company}
                        helperText={
                          errors.training_history?.[index]?.company?.message
                        }
                        margin="normal"
                      />

                      <TextField
                        fullWidth
                        label="Event Place"
                        {...register(`training_history.${index}.eventPlace`)}
                        error={!!errors.training_history?.[index]?.eventPlace}
                        helperText={
                          errors.training_history?.[index]?.eventPlace?.message
                        }
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Program Title"
                        {...register(`training_history.${index}.programTitle`)}
                        error={!!errors.training_history?.[index]?.programTitle}
                        helperText={
                          errors.training_history?.[index]?.programTitle
                            ?.message
                        }
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Targeted Audience"
                        {...register(`training_history.${index}.audience`)}
                        error={!!errors.training_history?.[index]?.audience}
                        helperText={
                          errors.training_history?.[index]?.audience?.message
                        }
                        margin="normal"
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box marginTop={2} textAlign="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  addTraining({
                    company: '',
                    eventPlace: '',
                    programTitle: '',
                    audience: '',
                  })
                }
              >
                Add Training History
              </Button>
            </Box>
          </>
        )

      case 4:
        return (
          <>
            <Grid container spacing={2}>
  {skillsFields.map((field, index) => (
    <Grid item xs={12} key={field.id}>
      <Box
        position="relative"
        padding={2}
        border="1px solid #ddd"
        borderRadius="8px"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
        bgcolor="white"
      >
        <IconButton
          onClick={() => removeSkill(index)}
          color="error"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '8px',
            backgroundColor: 'white',
          }}
        >
          <RemoveIcon />
        </IconButton>

        <Box marginTop="20px">
  <TextField
    fullWidth
    label="Skill Name"
    {...register(`skills.${index}.name`)}
    error={!!errors.skills?.[index]?.name}
    helperText={errors.skills?.[index]?.name?.message}
    margin="normal"
  />

  <Box marginTop={2}>
    <Typography gutterBottom>Rate Your Skill</Typography>

    <Controller
      name={`skills.${index}.rating`}
      control={control}
      defaultValue={0}
      render={({ field }) => (
        <Slider
          {...field}
          value={field.value || 0}
          onChange={(_, value) => field.onChange(value)}  // sends value to react-hook-form
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}%`}
          min={0}
          max={100}
        />
      )}
    />
  </Box>
</Box>

      </Box>
    </Grid>
  ))}
</Grid>

<Box marginTop={2} textAlign="center">
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => addSkill({ name: '', rating: 50 })}
  >
    Add Skill
  </Button>
</Box>

          </>
        )

      case 5: // Projects Step
        return (
          <>
            <Grid container spacing={2}>
              {projectFields.map((field, index) => (
                <Grid item xs={12} key={field.id}>
                  <Box
                    position="relative"
                    padding={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                    bgcolor="white"
                  >
                    <IconButton
                      onClick={() => removeProject(index)}
                      color="error"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '8px',
                        backgroundColor: 'white',
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Box marginTop="20px">
                      <TextField
                        fullWidth
                        label="Project Title"
                        {...register(`projects.${index}.title`)}
                        error={!!errors.projects?.[index]?.title}
                        helperText={errors.projects?.[index]?.title?.message}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        multiline
                        label="Project Description & Tech Stack"
                        {...register(`projects.${index}.description`)}
                        error={!!errors.projects?.[index]?.description}
                        helperText={
                          errors.projects?.[index]?.description?.message
                        }
                        margin="normal"
                      />
                      <Box display="flex" alignItems="center" marginTop={2}>
                        <GitHubIcon style={{ marginRight: '8px' }} />
                        <TextField
                          fullWidth
                          label="Repo Link"
                          {...register(`projects.${index}.repoLink`)}
                        />
                      </Box>
                      <Box display="flex" alignItems="center" marginTop={2}>
                        <LanguageIcon style={{ marginRight: '8px' }} />
                        <TextField
                          fullWidth
                          label="Deploy Link"
                          {...register(`projects.${index}.deployLink`)}
                        />
                      </Box>
                      {/* <Box marginTop={2}>
                        <Typography variant="subtitle1">
                          Upload Thumbnail
                        </Typography>
                        <TextField
                          fullWidth
                          type="file"
                          InputLabelProps={{ shrink: true }}
                          onChange={(e) => handleThumbnailUpload(e, index)}
                          margin="normal"
                        />
                      </Box> */}
                      {projectFields[index]?.thumbnail && (
                        <Box
                          component="img"
                          src={URL.createObjectURL(
                            projectFields[index].thumbnail
                          )}
                          alt="Thumbnail Preview"
                          width="100%"
                          height="auto"
                          borderRadius="8px"
                          marginTop={2}
                        />
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box marginTop={2} textAlign="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  addProject({
                    title: '',
                    description: '',
                    repoLink: '',
                    deployLink: '',
                    thumbnail: null,
                  })
                }
              >
                Add Project
              </Button>
            </Box>
          </>
        )

      case 6:
        return (
          <>
            <Box
              position="relative"
              padding={2}
              border="1px solid #ddd"
              borderRadius="8px"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
              bgcolor="white"
            >
              <Typography variant="h6" marginBottom={2}>
                Upload Resume
              </Typography>
              <TextField
                fullWidth
                type="file"
                InputLabelProps={{ shrink: true }}
                {...register('resume', {
                  required: 'Resume upload is required',
                })}
                error={!!errors.resume}
                helperText={errors.resume?.message}
                onChange={handleResumeUpload}
                margin="normal"
              />

<Box>
      {/* Check if resumeLink and resumeName are provided */}
      {/* {resumeLink && resumeName && (
        <a 
          href={resumeLink} 
          download 
          style={{ textDecoration: 'none' }} // Removes underline from the link
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<PreviewIcon />} // Download icon on the button
            sx={{
              textTransform: 'lowercase', // Converts text to uppercase
            }}
          >
            {resumeName}
          </Button>
        </a>
      )} */}
      {resumeLink && resumeName && (
       <Button
       variant="contained"
       color="primary"
       startIcon={<PreviewIcon />}
       onClick={handleDownload} // Trigger download
       sx={{
         textTransform: 'lowercase',
       }}
     >
       {resumeName}
     </Button>
      )}
    </Box>

              <Box marginTop={4}>
                <Typography variant="subtitle1">Declaration</Typography>
                <Box display="flex" alignItems="center" marginTop={2}>
                  <Checkbox
                    {...register('declaration', { required: true })}
                    color="primary"
                  />
                  <Typography variant="body2">
                    I hereby declare that the above information is true to the
                    best of my knowledge.
                  </Typography>
                </Box>
                {errors.declaration && (
                  <Typography color="error" variant="caption">
                    {errors.declaration?.message}
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div>
      {/* Main Form */}
      <div
      // display="flex"
      // flexDirection="column"
      // justifyContent="center"
      // alignItems="center"
      // width="100vw"
      // height="100vh"
      // padding={4}
      // sx={{
      //   marginTop: dynamicMarginTop(),
      //   marginBottom: '200px',
      //   transition: 'margin-top 0.3s ease',
      // }}z
      >
        {/* <Typography variant="h4" gutterBottom>
          Trainer Form
        </Typography> */}
        <Stepper
          activeStep={step}
          alternativeLabel
          sx={{
            width: '100%',
            maxWidth: '100%',
            marginBottom: '16px',
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto', // Enable horizontal scrolling
            '& .MuiStep-root': {
              flex: '1 1 auto',
              textAlign: 'center',
              minWidth: '120px',
            },
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            },
            '& .MuiStepConnector-line': {
              display: 'block',
            },
            // Hide scrollbar while allowing scrolling
            scrollbarWidth: 'none', // For Firefox
            '&::-webkit-scrollbar': {
              display: 'none', // For Chrome, Safari, and Edge
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label} ref={(el) => (stepRefs.current[index] = el)}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            width: '100%',
            maxWidth: '800px',
            marginTop: '16px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {renderStepContent()}
          <Box display="flex" justifyContent="space-between" marginTop={2}>
            <Button
              variant="contained"
              color="secondary"
              disabled={step === 0}
              onClick={prevStep}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button variant="contained" color="primary" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" variant="contained" color="success">
                Submit
              </Button>
            )}
          </Box>
        </form>
        
      {/* Modal JSX */}
       {/* Styled Modal */}
       <Dialog open={modalOpen} onClose={handleModalClose}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {isSuccess ? (
              <CheckCircleOutline sx={{ color: 'green', fontSize: 32 }} />
            ) : (
              <ErrorOutline sx={{ color: 'red', fontSize: 32 }} />
            )}
            <Typography variant="h6" fontWeight="bold">{modalTitle}</Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body1" color="text.secondary">
            {modalMessage}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleModalClose}
            variant="contained"
            sx={{
              bgcolor: isSuccess ? 'green' : 'red',
              '&:hover': {
                bgcolor: isSuccess ? 'darkgreen' : 'darkred',
              },
              color: 'white',
              px: 3,
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      </div>
    </div>
  )
}
