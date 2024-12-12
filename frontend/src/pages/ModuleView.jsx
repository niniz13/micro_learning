import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Spinner,
  Center,
  Progress,
  Divider,
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
  CheckboxGroup,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useDispatch } from 'react-redux'
import { setCompletedModules } from '../store/modulesSlice'

export default function ModuleView() {
  const [module, setModule] = useState(null)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [showQuizResult, setShowQuizResult] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchModuleAndPages = async () => {
      try {
        const moduleResponse = await api.getModule(id)
        setModule(moduleResponse.data)
        
        const pagesResponse = await api.getModulePages(id)
        setPages(pagesResponse.data.sort((a, b) => a.order - b.order))
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch module content',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        navigate('/modules')
      } finally {
        setLoading(false)
      }
    }

    fetchModuleAndPages()
  }, [id, navigate, toast])

  useEffect(() => {
    // Reset selected answers when moving to a new page
    setSelectedAnswers([])
    setShowQuizResult(false)
  }, [currentPageIndex])

  const handleAnswerChange = (value) => {
    const currentPage = pages[currentPageIndex]
    if (currentPage.type === 'quiz') {
      if (Array.isArray(value)) {
        setSelectedAnswers(value)
      } else {
        setSelectedAnswers([value])
      }
    }
  }

  const checkQuizAnswers = () => {
    const currentPage = pages[currentPageIndex]
    const correctAnswers = currentPage.quiz_options
      .filter(opt => opt.is_correct)
      .map(opt => opt.id.toString())
    
    const isCorrect = selectedAnswers.length === correctAnswers.length &&
      selectedAnswers.every(answer => correctAnswers.includes(answer))

    setShowQuizResult(true)
    
    toast({
      title: isCorrect ? 'Correct!' : 'Incorrect',
      description: isCorrect 
        ? 'Great job! You can move to the next page.'
        : 'Try again or review the content.',
      status: isCorrect ? 'success' : 'error',
      duration: 3000,
      isClosable: true,
    })

    return isCorrect
  }

  const handleNextPage = async () => {
    const currentPage = pages[currentPageIndex]
    
    if (currentPage.type === 'quiz' && !showQuizResult) {
      const isCorrect = checkQuizAnswers()
      if (!isCorrect) return
    }

    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1)
    } else {
      // Module completed
      try {
        await api.updateProgress(id, { completed: true })
        // Update Redux state with completed module
        const response = await api.getProgress()
        const completedModules = response.data
          .filter(p => p.progress === 100)
          .map(p => p.module)
        dispatch(setCompletedModules(completedModules))
        
        toast({
          title: 'Congratulations!',
          description: 'You have completed this module',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        navigate('/modules')
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update progress',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1)
    }
  }

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  const currentPage = pages[currentPageIndex]
  const progress = (currentPageIndex / pages.length) * 100

  const renderQuizContent = () => {
    const hasMultipleCorrectAnswers = currentPage.quiz_options.filter(opt => opt.is_correct).length > 1

    return (
      <VStack spacing={6} align="stretch">
        <Text fontWeight="bold" fontSize="lg">{currentPage.content}</Text>
        
        {hasMultipleCorrectAnswers ? (
          <CheckboxGroup
            value={selectedAnswers}
            onChange={handleAnswerChange}
            isDisabled={showQuizResult}
          >
            <Stack spacing={3}>
              {currentPage.quiz_options.map((option) => (
                <Checkbox
                  key={option.id}
                  value={option.id.toString()}
                  colorScheme="brand"
                >
                  {option.text}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        ) : (
          <RadioGroup
            value={selectedAnswers[0]}
            onChange={(value) => handleAnswerChange([value])}
            isDisabled={showQuizResult}
          >
            <Stack spacing={3}>
              {currentPage.quiz_options.map((option) => (
                <Radio
                  key={option.id}
                  value={option.id.toString()}
                  colorScheme="brand"
                >
                  {option.text}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        )}
      </VStack>
    )
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>{module?.title}</Heading>
          <Text color="gray.600">{module?.description}</Text>
        </Box>

        <Progress value={progress} colorScheme="brand" rounded="full" />
        <Text fontSize="sm" color="gray.500">
          Page {currentPageIndex + 1} of {pages.length}
        </Text>

        <Divider />

        {currentPage && (
          <Box 
            p={6} 
            bg="white" 
            rounded="xl" 
            boxShadow="md"
            minH="300px"
          >
            {currentPage.type === 'text' && (
              <Text whiteSpace="pre-wrap">{currentPage.content}</Text>
            )}
            {currentPage.type === 'video' && (
              <Box as="iframe"
                src={currentPage.content}
                width="100%"
                height="400px"
                rounded="md"
                allowFullScreen
              />
            )}
            {currentPage.type === 'quiz' && renderQuizContent()}
          </Box>
        )}

        <HStack spacing={4} justify="space-between">
          <Button
            onClick={handlePreviousPage}
            isDisabled={currentPageIndex === 0}
            variant="outline"
            colorScheme="brand"
          >
            Previous
          </Button>
          <Button
            onClick={handleNextPage}
            colorScheme="brand"
            isDisabled={currentPage?.type === 'quiz' && !selectedAnswers.length}
          >
            {currentPage?.type === 'quiz' && !showQuizResult
              ? 'Check Answer'
              : currentPageIndex === pages.length - 1
              ? 'Complete Module'
              : 'Next'}
          </Button>
        </HStack>
      </VStack>
    </Container>
  )
}
