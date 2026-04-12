import React, { useEffect, useState, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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
} from '@mui/material'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import AddIcon from '@mui/icons-material/Add'
import PreviewIcon from '@mui/icons-material/Preview';
import RemoveIcon from '@mui/icons-material/Remove'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import GitHubIcon from '@mui/icons-material/GitHub'
import LanguageIcon from '@mui/icons-material/Language'
import axios from 'axios'
import apiClient from './utils/apiClient';
import CryptoJS from 'crypto-js'
import BASE_URL from './apiConfig';

const validationSchema = yup.object({
  name: yup.string().required('Full name is required'),
  dob: yup.date().required('Date of birth is required'),
  current_location: yup.string().required('Current location is required'),
  native_location: yup.string().required('Native location is required'),
  linkedin_url: yup.string().required('LinkedIn URL is required'),
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
  resume: yup.mixed().required('Resume upload is required'),
  // Other validation rules remain the same...

})


const steps = [
  'Personal Info',
  'Education',
  'Experience',
  'Skills',
  'Projects',
  'Resume',
]

 const TrainerFormFullScreen = ({setSelectedTab}) => {
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      dob: '',
      current_location: '',
      linkedin_url: '',
      native_location: '',
      education: [{ degree: '', year: '', institution: '' }],
      experience: [{ role: '', organization: '', duration: '' }],
      training_history: [
        { company: '', eventPlace: '', programTitle: '', audience: '' },
      ],
      skills: [{ name: '', rating: 50 }],
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
    fields: skillsFields,
    append: addSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: 'skills',
  })

  const {
    fields: projectFields,
    append: addProject,
    remove: removeProject,
  } = useFieldArray({
    control,
    name: 'projects',
  })

  const handleThumbnailUpload = (e, index) => {
    const file = e.target.files[0]
    if (file) {
      projectFields[index].thumbnail = file
    }
  }

  const [step, setStep] = useState(0)
  const [image, setImage] = useState(null)
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
        return '60px'
      case 5:
        return '60px'
      default:
        return 'auto'
    }
  }
  const stepValidationFields = {
    0: ['name', 'dob', 'current_location', 'native_location', 'linkedin_url'],
    1: ['education'],
    2: ['experience'],
    3: ['skills'],
    4: ['projects'],
    5: ['resume', 'declaration'],
  }
  const [imagePreview, setImagePreview] = useState(null)
  const [resumeLink, setResumeLink] = useState(null)
  const [resumeName, setResumeName] = useState(null)

  useEffect(() => {
    const fetchSavedData = async () => {
      try {
        let data = await apiClient(`trainer/trainers/get/${userId}`, 'GET');
        data = data[0];
        console.log(data);

        reset({
          ...data,
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        })
        let image = data.image && `${BASE_URL.replace(/\/$/, "")}/${data.image}` || null;
        setImagePreview(image || null)

        let resumefileName = data.resume && `${BASE_URL.replace(/\/$/, "")}/${data.resume}` || null;
        setResumeLink(resumefileName || null);

        const parts = data.resume && data.resume.split('/');
        const fileName = parts[parts.length - 1];
        setResumeName(fileName || null);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch saved data:', error);
        setIsLoading(false);
      }
    }

    fetchSavedData()
  }, [reset])
  const handleImageUpload = (e) => setImage(e.target.files[0])

  const convertToFormData = (payload) => {
    const formData = new FormData();
  
    const appendFormData = (key, value) => {
      const keysToSendAsJSON = ["education", "experience", "skills", "projects", "website"];
  
      if (keysToSendAsJSON.includes(key)) {
        formData.append(key, JSON.stringify(value || []));
      } else if (Array.isArray(value)) {
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
        Object.keys(value).forEach((subKey) => {
          formData.append(`${key}[${subKey}]`, value[subKey]);
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    };
  
    Object.keys(payload).forEach((key) => appendFormData(key, payload[key]));
  
    return formData;
  };

  const onSubmit = async (data, event) => {
    event.preventDefault()
    console.log('Submitted Resume File:', resumeFile)

    const payload = {
      user: userId || 1,
      name: data.name,
      dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : null,
      current_location: data.current_location,
      native_location: data.native_location,
      linkedin_url: data.linkedin_url || null,
      github_url: data.github_url || null,
      website: data.website || null,
      education: data.education.map((edu) => ({
        degree: edu.degree,
        year: edu.year,
        institution: edu.institution,
      })),
      experience: data.experience.map((exp) => ({
        role: exp.role,
        organization: exp.organization,
        duration: exp.duration,
      })),
      skills: data.skills?.length
        ? data.skills.map((skill) => ({
            name: skill.name,
            rating: skill.rating,
          }))
        : [],
      projects: data.projects?.length
        ? data.projects.map((project) => ({
            title: project.title,
            description: project.description,
            repoLink: project.repoLink || null,
            deployLink: project.deployLink || null,
            thumbnail: project.thumbnail || null,
          }))
        : [],
      declaration: data.declaration || false,
    }

    try {
      console.log("payload", payload)
      const formData = convertToFormData(payload)
      if (resumeFile) formData.append('resume', resumeFile)
      if (image) formData.append('image', image)

      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }

      const response = await apiClient(
        'trainer/trainers/post',
        'POST',
        formData
      )
      console.log('Form submitted:', response)
      
      setSelectedTab('Your Status');
    } catch (error) {
      console.error('Form submission failed:', error)
    }
  }

  const nextStep = async () => {
    const currentFields = stepValidationFields[step]
    const isStepValid = await trigger(currentFields)

    if (isStepValid) {
      setStep((prevStep) => prevStep + 1)
    } else {
      console.error('Validation failed for step:', step)
    }
  }

  const prevStep = () => setStep((prevStep) => prevStep - 1)
  const [resumeFile, setResumeFile] = useState(null)
  const [declarationChecked, setDeclarationChecked] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(resumeLink);
      if (!response.ok) {
        throw new Error('Failed to fetch the file.');
      }
      const blob = await response.blob();
  
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = resumeName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };
  
  const handleResumeUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setResumeFile(file)
      console.log('Uploaded file:', file)
    } else {
      console.error('No file selected')
    }
  }

  const handleDeclarationChange = (event) => {
    setDeclarationChecked(event.target.checked)
  }

  useEffect(() => {
    if (stepRefs.current[step]) {
      stepRefs.current[step].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }

    if (step === 0 && containerRef.current) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [step])

  const uploadFileWithJSON = async (file, jsonData) => {
    const formData = new FormData()

    formData.append('file', file)

    formData.append('data', JSON.stringify(jsonData))

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'ngrok-skip-browser-warning': '98547',
        },
      })

      console.log('Upload success:', response.data)
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

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


              <Box display="flex" alignItems="center" marginTop={2}>
                <LinkedInIcon style={{ marginRight: '8px' }} color="primary" />
                <TextField
                  fullWidth
                  label="LinkedIn URL"
                  {...register('linkedin_url', {
                  })}
                  error={!!errors.linkedin_url}
                  helperText={errors.linkedin_url?.message}
                  margin="normal"
                />
              </Box>

              <Box display="flex" alignItems="center" marginTop={2}>
                <GitHubIcon style={{ marginRight: '8px' }} />
                <TextField
                  fullWidth
                  label="GitHub URL"
                  {...register('github_url')}
                  margin="normal"
                />
              </Box>

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
                        helperText={
                          errors.experience?.[index]?.duration?.message
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
                        <Slider
                          valueLabelDisplay="auto"
                          defaultValue={50}
                          onChange={(e, value) =>
                            register(`skills.${index}.rating`).onChange({
                              target: { value },
                            })
                          }
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

      case 4:
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
                        label="Project Description"
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
                      <Box marginTop={2}>
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
                      </Box>
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
      case 5:
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
                {resumeLink && resumeName && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PreviewIcon />}
                    onClick={handleDownload}
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
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          padding: '10px',
          bgcolor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Stepper
          activeStep={step}
          alternativeLabel
          sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            scrollbarWidth: 'auto',
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
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        padding={4}
        sx={{
          marginTop: '16px',
        }}
      >
        <Typography variant="h4" gutterBottom>
          User Form
        </Typography>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            width: '100%',
            maxWidth: '800px',
            marginTop: '16px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
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
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={nextStep}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" variant="contained" color="success">
                Submit
              </Button>
            )}
          </Box>
        </form>
      </Box>
    </div>
  )
}

export default TrainerFormFullScreen;