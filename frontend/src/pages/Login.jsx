import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  Link as ChakraLink,
  useToast,
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/modules')
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.detail || 'Please check your credentials',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
      <Stack align="center">
        <Heading fontSize="4xl">Sign in to your account</Heading>
        <Text fontSize="lg" color="gray.600">
          to enjoy all of our cool features ✌️
        </Text>
      </Stack>
      <Box
        rounded="lg"
        bg="white"
        boxShadow="lg"
        p={8}
        backdropFilter="blur(10px)"
        backgroundColor="rgba(255, 255, 255, 0.8)"
      >
        <form onSubmit={handleLogin}>
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>
            <Stack spacing={10}>
              <Button
                type="submit"
                bg="brand.400"
                color="white"
                _hover={{
                  bg: 'brand.500',
                }}
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align="center">
                Don't have an account?{' '}
                <Link to="/register">
                  <ChakraLink color="brand.400">Register</ChakraLink>
                </Link>
              </Text>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Stack>
  )
}
