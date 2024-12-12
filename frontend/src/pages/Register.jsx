import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link as ChakraLink,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

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
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (!formData.first_name) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      await register(formData)
      toast({
        title: 'Registration successful!',
        description: 'Welcome to Micro Learning!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      navigate('/modules')
    } catch (error) {
      const serverErrors = error.response?.data || {}
      const errorMessage = 
        typeof serverErrors === 'string' 
          ? serverErrors 
          : Object.values(serverErrors)[0] || 'Registration failed'
      
      toast({
        title: 'Registration failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      
      // Update form errors if server returns field-specific errors
      if (typeof serverErrors === 'object') {
        setErrors(serverErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
      <Stack align="center">
        <Heading fontSize="4xl">Create your account</Heading>
        <Text fontSize="lg" color="gray.600">
          to start your learning journey ✌️
        </Text>
      </Stack>
      <Box
        rounded="lg"
        bg={useColorModeValue('white', 'gray.700')}
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

            <FormControl id="password" isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <Stack spacing={10} pt={2}>
              <Button
                type="submit"
                size="lg"
                bg="brand.400"
                color="white"
                _hover={{
                  bg: 'brand.500',
                }}
                isLoading={isLoading}
              >
                Sign up
              </Button>
            </Stack>

            <Stack pt={6}>
              <Text align="center">
                Already a user?{' '}
                <Link to="/login">
                  <ChakraLink color="brand.400">Login</ChakraLink>
                </Link>
              </Text>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Stack>
  )
}
