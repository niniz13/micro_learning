import {
  Box,
  Flex,
  Heading,
  Text,
  Stack,
  Avatar,
  useColorModeValue,
  Button,
  VStack,
  SimpleGrid,
  Progress,
  Spinner,
  Center,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Container,
  IconButton,
  Link
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { SettingsIcon } from '@chakra-ui/icons'
import { CheckIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { useRef } from 'react'
import { useSelector } from 'react-redux'

export default function Profile() {
  const { user, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [savedModules, setSavedModules] = useState([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()
  const toast = useToast()
  const completedModules = useSelector(state => state.modules.completedModules || [])

  useEffect(() => {
    const fetchSavedModules = async () => {
      try {
        const response = await api.getSavedModules()
        setSavedModules(response.data)
      } catch (error) {
        console.error('Error fetching saved modules:', error)
      }
    }

    if (user) {
      fetchSavedModules()
    }
  }, [user])

  const handleUnsaveModule = async (moduleId) => {
    try {
      await api.unsaveModule(moduleId)
      setSavedModules(savedModules.filter(module => module.id !== moduleId))
      toast({
        title: 'Module unsaved',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unsave module',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    }
  }

  const stats = [
    { 
      label: 'Modules Completed', 
      value: completedModules?.length || 0
    }
  ]

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      toast({
        title: 'Account deleted',
        description: 'Your account has been successfully deleted.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      navigate('/')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (!user) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={6}>Profile</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box 
              p={6} 
              borderRadius="lg" 
              bg={useColorModeValue('white', 'gray.700')} 
              shadow="base"
              gridColumn={{ base: "1", md: "1 / span 2" }}
            >
              <VStack spacing={4} align="start">
                <Avatar size="xl" name={`${user.first_name} ${user.last_name}`} src={user.avatar} />
                <Box>
                  <Text fontSize="xl" fontWeight="bold">{user.first_name} {user.last_name}</Text>
                  <Text color="gray.500">{user.email}</Text>
                </Box>
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                  <Button
                    colorScheme="brand"
                    onClick={() => navigate('/profile/edit')}
                    leftIcon={<EditIcon />}
                  >
                    Edit Profile
                  </Button>
                  {user.is_superuser && (
                    <Button
                      colorScheme="purple"
                      onClick={() => navigate('/admin/modules')}
                      leftIcon={<SettingsIcon />}
                    >
                      Manage Modules
                    </Button>
                  )}
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={onOpen}
                    leftIcon={<DeleteIcon />}
                  >
                    Delete Account
                  </Button>
                </Stack>
              </VStack>
            </Box>
            <Box
              p={6}
              borderRadius="lg"
              bg={useColorModeValue('white', 'gray.700')}
              shadow="base"
              textAlign="center"
              gridColumn={{ base: "1", md: "3" }}
            >
              <Text fontSize="8xl" fontWeight="bold">{stats[0].value}</Text>
              <Text color="gray.500">{stats[0].label}</Text>
            </Box>
          </SimpleGrid>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Saved Modules</Heading>
          {savedModules.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {savedModules.map((module) => (
                <Box
                  p={6}
                  borderRadius="lg"
                  bg={useColorModeValue('white', 'gray.700')}
                  shadow="base"
                  _hover={{ shadow: 'md' }}
                  position="relative"
                  onClick={() => navigate(`/modules/${module.id}`)}
                >
                  {completedModules.some(m => m.module === module.id) && (
                    <CheckIcon
                      color="green.500"
                      position="absolute"
                      top={2}
                      right={2}
                    />
                  )}
                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    position="absolute"
                    top={2}
                    right={completedModules.some(m => m.module === module.id) ? 8 : 2}
                    colorScheme="red"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleUnsaveModule(module.id)
                    }}
                    aria-label="Unsave module"
                  />
                  <VStack align="start" spacing={2}>
                    <Heading size="md">{module.title}</Heading>
                    <Text noOfLines={2}>{module.description}</Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="gray.500">No saved modules yet.</Text>
          )}
        </Box>
      </VStack>
      {/* Delete Account Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Account
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This action cannot be undone. All your data will be permanently deleted.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAccount} ml={3}>
                Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}
