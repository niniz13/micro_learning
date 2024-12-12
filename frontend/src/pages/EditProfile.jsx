import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  useToast,
  FormErrorMessage,
  Avatar,
  VStack,
  Text,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function EditProfile() {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.first_name) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    // Only validate password fields if any of them are filled
    if (formData.new_password || formData.confirm_password || formData.current_password) {
      if (!formData.current_password) {
        newErrors.current_password = 'Current password is required to change password'
      }
      if (formData.new_password && formData.new_password.length < 6) {
        newErrors.new_password = 'New password must be at least 6 characters'
      }
      if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match'
      }
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      // Prepare update data
      const updateData = {
        id: user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      }

      // Add password update if new password is provided
      if (formData.new_password) {
        updateData.current_password = formData.current_password
        updateData.new_password = formData.new_password
      }

      await updateUser(updateData)
      
      toast({
        title: 'Profile updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      navigate('/profile')
    } catch (error) {
      const serverErrors = error.response?.data || {}
      const errorMessage = 
        typeof serverErrors === 'string' 
          ? serverErrors 
          : Object.values(serverErrors)[0] || 'Failed to update profile'
      
      toast({
        title: 'Update failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      
      if (typeof serverErrors === 'object') {
        setErrors(serverErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
      <VStack spacing={6}>
        <Heading fontSize="4xl">Edit Profile</Heading>
        <Avatar 
          size="2xl" 
          backgroundColor={'brand.200'}
          color={'brand.900'}
          name={`${formData.first_name} ${formData.last_name}`}
          src={user?.avatar}
        />
        <Text fontSize="lg" color="gray.600">
          Update your personal information
        </Text>
      </VStack>

      <Box
        rounded="lg"
        bg="white"
        boxShadow="lg"
        p={8}
        backdropFilter="blur(10px)"
        backgroundColor="rgba(255, 255, 255, 0.8)"
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="first_name" isInvalid={!!errors.first_name}>
              <FormLabel>First Name</FormLabel>
              <Input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.first_name}</FormErrorMessage>
            </FormControl>

            <FormControl id="last_name" isInvalid={!!errors.last_name}>
              <FormLabel>Last Name</FormLabel>
              <Input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.last_name}</FormErrorMessage>
            </FormControl>

            <FormControl id="email" isInvalid={!!errors.email}>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <Heading size="md" pt={4}>Change Password</Heading>
            <Text fontSize="sm" color="gray.600">
              Leave blank if you don't want to change your password
            </Text>

            <FormControl id="current_password" isInvalid={!!errors.current_password}>
              <FormLabel>Current Password</FormLabel>
              <Input
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.current_password}</FormErrorMessage>
            </FormControl>

            <FormControl id="new_password" isInvalid={!!errors.new_password}>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.new_password}</FormErrorMessage>
            </FormControl>

            <FormControl id="confirm_password" isInvalid={!!errors.confirm_password}>
              <FormLabel>Confirm New Password</FormLabel>
              <Input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.confirm_password}</FormErrorMessage>
            </FormControl>

            <Stack spacing={6} pt={4}>
              <Button
                type="submit"
                bg="brand.400"
                color="white"
                _hover={{
                  bg: 'brand.500',
                }}
                isLoading={isLoading}
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Stack>
  )
}
