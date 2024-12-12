import {
  Box,
  Heading,
  Text,
  Progress,
  SimpleGrid,
  Center,
  useToast,
  Flex,
  IconButton,
  VStack,
  Spinner,
  useColorModeValue,
  Divider
} from '@chakra-ui/react'
import { CheckIcon, StarIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useDispatch, useSelector } from 'react-redux'
import { setProgression, setCompletedModules } from '../store/modulesSlice'
import api from '../services/api'

const ModuleCard = ({ module, progress, isCompleted }) => {
  const toast = useToast()
  const { user } = useAuth()
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const checkIfModuleIsSaved = async () => {
      if (!user) return
      try {
        const { data } = await api.getSavedModules()
        setIsSaved(data.some(m => m.id === module.id))
      } catch (error) {
        console.error('Error checking saved module status:', error)
      }
    }
    
    checkIfModuleIsSaved()
  }, [module.id, user])

  const handleSaveModule = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) return

    try {
      if (isSaved) {
        const { data } = await api.unsaveModule(module.id)
        setIsSaved(false)
        toast({
          title: 'Module unsaved',
          status: 'info',
          duration: 2000,
          isClosable: true,
        })
      } else {
        const { data } = await api.saveModule(module.id)
        setIsSaved(true)
        toast({
          title: 'Module saved',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save/unsave module',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    }
  }

  return (
    <Link to={`/modules/${module.id}`}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        p={4}
        position="relative"
        cursor="pointer"
        _hover={{ shadow: 'md' }}
        bg={useColorModeValue('white', 'gray.700')}
        h="100%"
      >
        {isCompleted && (
          <CheckIcon
            color="green.500"
            position="absolute"
            top={2}
            right={2}
          />
        )}
        <IconButton
          icon={<StarIcon color={isSaved ? "yellow.400" : "gray.300"} />}
          variant="ghost"
          position="absolute"
          top={2}
          right={isCompleted ? 8 : 2}
          onClick={handleSaveModule}
          aria-label={isSaved ? 'Unsave module' : 'Save module'}
          _hover={{ bg: 'transparent' }}
        />
        <VStack align="stretch" spacing={4}>
          <Heading size="md">{module.title}</Heading>
          <Text color="gray.600" noOfLines={2}>
            {module.description}
          </Text>
          <Progress
            value={progress}
            colorScheme="green"
            size="sm"
          />
          <Text mt={2} fontSize="sm" color="gray.500">
            {progress}% Complete
          </Text>
        </VStack>
      </Box>
    </Link>
  )
}

const ModulesByCategory = ({ modules, category }) => {
  return (
    <Box mb={8}>
      <Heading size="md" mb={4}>{category}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {modules.map(module => (
          <ModuleCard
            key={module.id}
            module={module}
            progress={module.progress}
            isCompleted={false}
          />
        ))}
      </SimpleGrid>
    </Box>
  )
}

const Modules = () => {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const dispatch = useDispatch()
  const completedModules = useSelector(state => state.modules?.completedModules || [])

  useEffect(() => {
    const fetchModules = async () => {
      try {
        // Fetch modules
        const modulesResponse = await api.getModules()
        setModules(modulesResponse.data)
        
        // Fetch progress to update completed modules
        const progressResponse = await api.getProgress()
        const completedModules = progressResponse.data
          .filter(p => p.progress === 100)
          .map(p => p.module)
        dispatch(setCompletedModules(completedModules))
      } catch (error) {
        console.error('Error fetching modules:', error)
        toast({
          title: 'Error fetching modules',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchModules()
    }
  }, [isAuthenticated, dispatch, toast])

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  // Group modules by category
  const modulesByCategory = modules.reduce((acc, module) => {
    const category = module.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(module)
    return acc
  }, {})

  return (
    <Box p={8}>
      <Heading mb={6}>Learning Modules</Heading>
      {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
        <ModulesByCategory
          key={category}
          category={category}
          modules={categoryModules}
        />
      ))}
    </Box>
  )
}

export default Modules
