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
  FormControlLabel
} from '@mui/material'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import GitHubIcon from '@mui/icons-material/GitHub'
import LanguageIcon from '@mui/icons-material/Language'
import { FaArrowRight, FaArrowLeft, FaCheckCircle, FaRocket } from 'react-icons/fa';
import apiClient from './utils/apiClient';
import CryptoJS from 'crypto-js'
import BASE_URL from './apiConfig';
import './UserForm.css';

const validationSchema = yup.object({
  name: yup.string().required('Full name is required'),
  dob: yup.date().required('Date of birth is required'),
  current_location: yup.string().required('Current location is required'),
  native_location: yup.string().required('Native location is required'),
  linkedin_url: yup.string().required('LinkedIn URL is required'),
  education: yup.array().of(yup.object({
    degree: yup.string().required('Degree is required'),
    year: yup.number().typeError('Year must be a number').required('Year is required'),
    institution: yup.string().required('Institution is required'),
  })),
  experience: yup.array().of(yup.object({
    role: yup.string().required('Role is required'),
    organization: yup.string().required('Company is required'),
    duration: yup.number().typeError('Years must be a number').required('Years are required'),
  })),
  skills: yup.array().of(yup.object({
    name: yup.string().required('Skill name is required'),
    rating: yup.number().required('Rating is required'),
  })),
  projects: yup.array().of(yup.object({
    title: yup.string().required('Project title is required'),
    description: yup.string().required('Project description is required'),
  })),
  declaration: yup.bool().oneOf([true], 'You must accept the declaration'),
})

const steps = ['Identity', 'Education', 'Experience', 'Skills', 'Projects', 'Review']

const TrainerFormFullScreen = ({setSelectedTab}) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(0)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  
  const { register, handleSubmit, control, reset, formState: { errors }, trigger } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '', dob: '', current_location: '', native_location: '', linkedin_url: '',
      education: [{ degree: '', year: '', institution: '' }],
      experience: [{ role: '', organization: '', duration: '' }],
      skills: [{ name: '', rating: 50 }],
      projects: [{ title: '', description: '', repoLink: '', deployLink: '' }],
    },
  })

  const { fields: educationFields, append: addEducation, remove: removeEducation } = useFieldArray({ control, name: 'education' })
  const { fields: experienceFields, append: addExperience, remove: removeExperience } = useFieldArray({ control, name: 'experience' })
  const { fields: skillsFields, append: addSkill, remove: removeSkill } = useFieldArray({ control, name: 'skills' })
  const { fields: projectFields, append: addProject, remove: removeProject } = useFieldArray({ control, name: 'projects' })

  const getUserId = () => {
    try {
      const encrypted = localStorage.getItem('userID')
      if (!encrypted) return null;
      const bytes = CryptoJS.AES.decrypt(encrypted, 'thirancoding360mgai')
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch { return null; }
  }

  useEffect(() => {
    const fetchSavedData = async () => {
      const userId = getUserId();
      if (!userId) return setIsLoading(false);
      try {
        let data = await apiClient(`trainer/trainers/get/${userId}`, 'GET');
        data = data[0];
        if (data) {
          reset({ ...data, dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '' });
          if (data.image) setImagePreview(`${BASE_URL.replace(/\/$/, "")}/${data.image}`);
        }
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    }
    fetchSavedData()
  }, [reset])

  const onSubmit = async (data) => {
    const userId = getUserId();
    const payload = {
      user: userId,
      ...data,
      dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : null,
    }

    try {
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        if (Array.isArray(payload[key])) formData.append(key, JSON.stringify(payload[key]));
        else formData.append(key, payload[key]);
      });
      if (resumeFile) formData.append('resume', resumeFile);
      if (image) formData.append('image', image);

      await apiClient('trainer/trainers/post', 'POST', formData);
      setSelectedTab('Your Status');
    } catch (err) { console.error(err); }
  }

  const nextStep = async () => {
    const validationMap = {
      0: ['name', 'dob', 'current_location', 'native_location', 'linkedin_url'],
      1: ['education'], 2: ['experience'], 3: ['skills'], 4: ['projects'], 5: ['declaration']
    };
    if (await trigger(validationMap[step])) setStep(s => s + 1);
  }

  if (isLoading) return <div className="text-center py-5">Loading Profile...</div>;

  return (
    <div className="uf-container uf-animate">
      <Stepper activeStep={step} alternativeLabel>
        {steps.map(label => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <div className="uf-card">
        {step === 0 && (
          <div className="uf-animate">
            <h3 className="uf-section-title">Personal Identity</h3>
            <TextField fullWidth label="Full Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} {...register('dob')} error={!!errors.dob} helperText={errors.dob?.message} />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField fullWidth label="Current Location" {...register('current_location')} error={!!errors.current_location} helperText={errors.current_location?.message} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Native Location" {...register('native_location')} error={!!errors.native_location} helperText={errors.native_location?.message} /></Grid>
            </Grid>
            <TextField fullWidth label="LinkedIn URL" {...register('linkedin_url')} error={!!errors.linkedin_url} helperText={errors.linkedin_url?.message} />
            <Box display="flex" alignItems="center" mt={2} p={2} border="1px dashed #e2e8f0" borderRadius="16px">
              {imagePreview && <img src={imagePreview} alt="P" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 16 }} />}
              <input type="file" onChange={(e) => { setImage(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }} />
            </Box>
          </div>
        )}

        {step === 1 && (
          <div className="uf-animate">
            <h3 className="uf-section-title">Education Background</h3>
            {educationFields.map((field, i) => (
              <Box key={field.id} p={3} mb={2} border="1px solid #f1f5f9" borderRadius="24px" position="relative">
                <IconButton onClick={() => removeEducation(i)} style={{ position: 'absolute', right: 10, top: 10 }}><RemoveIcon color="error"/></IconButton>
                <TextField fullWidth label="Degree" {...register(`education.${i}.degree`)} error={!!errors.education?.[i]?.degree} />
                <TextField fullWidth label="Institution" {...register(`education.${i}.institution`)} error={!!errors.education?.[i]?.institution} />
                <TextField fullWidth label="Year" type="number" {...register(`education.${i}.year`)} error={!!errors.education?.[i]?.year} />
              </Box>
            ))}
            <Button className="uf-btn-add" onClick={() => addEducation({ degree: '', year: '', institution: '' })}><AddIcon /> Add Education</Button>
          </div>
        )}

        {step === 2 && (
          <div className="uf-animate">
            <h3 className="uf-section-title">Work Experience</h3>
            {experienceFields.map((field, i) => (
              <Box key={field.id} p={3} mb={2} border="1px solid #f1f5f9" borderRadius="24px" position="relative">
                <IconButton onClick={() => removeExperience(i)} style={{ position: 'absolute', right: 10, top: 10 }}><RemoveIcon color="error"/></IconButton>
                <TextField fullWidth label="Role" {...register(`experience.${i}.role`)} />
                <TextField fullWidth label="Organization" {...register(`experience.${i}.organization`)} />
                <TextField fullWidth label="Years" type="number" {...register(`experience.${i}.duration`)} />
              </Box>
            ))}
            <Button className="uf-btn-add" onClick={() => addExperience({ role: '', organization: '', duration: '' })}><AddIcon /> Add Experience</Button>
          </div>
        )}

        {step === 3 && (
          <div className="uf-animate">
            <h3 className="uf-section-title">Expertise & Skills</h3>
            {skillsFields.map((field, i) => (
              <Box key={field.id} p={3} mb={2} border="1px solid #f1f5f9" borderRadius="24px" position="relative">
                <IconButton onClick={() => removeSkill(i)} style={{ position: 'absolute', right: 10, top: 10 }}><RemoveIcon color="error"/></IconButton>
                <TextField fullWidth label="Skill Name" {...register(`skills.${i}.name`)} />
                <Typography variant="caption" color="textSecondary">Proficiency Level</Typography>
                <Slider defaultValue={50} onChange={(e, val) => register(`skills.${i}.rating`).onChange({ target: { value: val }})} />
              </Box>
            ))}
            <Button className="uf-btn-add" onClick={() => addSkill({ name: '', rating: 50 })}><AddIcon /> Add New Skill</Button>
          </div>
        )}

        {step === 4 && (
          <div className="uf-animate">
            <h3 className="uf-section-title">Key Projects</h3>
            {projectFields.map((field, i) => (
              <Box key={field.id} p={3} mb={2} border="1px solid #f1f5f9" borderRadius="24px" position="relative">
                <IconButton onClick={() => removeProject(i)} style={{ position: 'absolute', right: 10, top: 10 }}><RemoveIcon color="error"/></IconButton>
                <TextField fullWidth label="Project Title" {...register(`projects.${i}.title`)} />
                <TextField fullWidth multiline rows={3} label="Description" {...register(`projects.${i}.description`)} />
              </Box>
            ))}
            <Button className="uf-btn-add" onClick={() => addProject({ title: '', description: '' })}><AddIcon /> Add Project</Button>
          </div>
        )}

        {step === 5 && (
          <div className="uf-animate">
            <h3 className="uf-section-title">Final Review</h3>
            <Box p={4} border="1px solid #f1f5f9" borderRadius="32px" textAlign="center" bgcolor="#f8fafc">
              <FaRocket size={48} color="#FFA003" style={{ marginBottom: 24 }} />
              <Typography variant="h6" fontWeight={800} gutterBottom>Almost there!</Typography>
              <Typography color="textSecondary" mb={4}>Please review your information and accept the declaration to finalize your profile.</Typography>
              
              <Box textAlign="left" mb={4}>
                <input type="file" onChange={(e) => setResumeFile(e.target.files[0])} style={{ marginBottom: 16, display: 'block' }} />
                <FormControlLabel control={<Checkbox {...register('declaration')} />} label="I hereby declare that all the information provided is true to the best of my knowledge." />
                {errors.declaration && <Typography color="error" variant="caption" display="block">{errors.declaration.message}</Typography>}
              </Box>

              <Button fullWidth className="uf-btn-primary" onClick={handleSubmit(onSubmit)}>
                Submit Professional Profile <FaCheckCircle style={{ marginLeft: 12 }} />
              </Button>
            </Box>
          </div>
        )}

        <Box display="flex" justifyContent="space-between" mt={6}>
          {step > 0 && <Button className="uf-btn-secondary" onClick={() => setStep(s => s - 1)}><FaArrowLeft style={{ marginRight: 8 }} /> Previous</Button>}
          {step < 5 && <Button className="uf-btn-primary" style={{ marginLeft: 'auto' }} onClick={nextStep}>Next Step <FaArrowRight style={{ marginLeft: 8 }} /></Button>}
        </Box>
      </div>
    </div>
  )
}

export default TrainerFormFullScreen