import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  IconButton,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  FormErrorMessage,
  Checkbox,
  Stack,
} from '@chakra-ui/react'
import { DragHandleIcon, EditIcon, DeleteIcon, AddIcon, ChevronUpIcon, ChevronDownIcon, CheckIcon } from '@chakra-ui/icons'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { useDispatch } from 'react-redux'
import { setProgression, setCompletedModules } from '../store/modulesSlice'

const PAGE_TYPES = {
  text: 'Text',
  quiz: 'Quiz',
  video: 'Video',
}

export default function ModulePages() {
  const [module, setModule] = useState(null)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPage, setSelectedPage] = useState(null)
  const [errors, setErrors] = useState({})
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()
  const toast = useToast()
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    type: 'text',
    content: '',
    order: 0,
    quiz_options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
  })

  useEffect(() => {
    fetchModuleAndPages()
  }, [moduleId])

  const fetchModuleAndPages = async () => {
    try {
      const [moduleResponse, pagesResponse] = await Promise.all([
        api.getModule(moduleId),
        api.getModulePages(moduleId),
      ])
      setModule(moduleResponse.data)
      // Ensure each page has a string ID
      const pagesWithStringIds = pagesResponse.data.map(page => ({
        ...page,
        id: String(page.id)
      }));
      setPages(pagesWithStringIds)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error fetching data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.content.trim()) {
      newErrors.content = formData.type === 'quiz' 
        ? 'Question is required' 
        : 'Content is required'
    }

    if (formData.type === 'quiz') {
      // Check if at least two options have text
      const validOptions = formData.quiz_options.filter(opt => opt.text.trim())
      if (validOptions.length < 2) {
        newErrors.quiz_options = 'At least two options are required'
      }

      // Check if at least one option is marked as correct
      const hasCorrectAnswer = formData.quiz_options.some(opt => opt.is_correct)
      if (!hasCorrectAnswer) {
        newErrors.quiz_options = 'At least one correct answer must be selected'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (isEditing) {
        await api.updatePage(moduleId, selectedPage.id, formData)
        toast({
          title: 'Page updated',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
      } else {
        await api.createPage(moduleId, formData)
        toast({
          title: 'Page created',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
      }
      resetForm()
      fetchModuleAndPages()
    } catch (error) {
      console.error('Error saving page:', error)
      toast({
        title: 'Error saving page',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleEdit = (page) => {
    setSelectedPage(page)
    setFormData({
      type: page.type,
      content: page.content,
      order: page.order,
      quiz_options: page.quiz_options || [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
    })
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (!selectedPage) return

    try {
      await api.deletePage(moduleId, selectedPage.id)
      toast({
        title: 'Page deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      fetchModuleAndPages()
    } catch (error) {
      console.error('Error deleting page:', error)
      toast({
        title: 'Error deleting page',
        description: 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      onClose()
      setSelectedPage(null)
    }
  }

  const confirmDelete = (page) => {
    setSelectedPage(page)
    onOpen()
  }

  const resetForm = () => {
    setFormData({
      type: 'text',
      content: '',
      order: pages.length,
      quiz_options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
    })
    setSelectedPage(null)
    setIsEditing(false)
    setErrors({})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'type' && value === 'quiz') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        content: '', // Reset content for quiz
        quiz_options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
        ],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleQuizOptionChange = (index, field, value) => {
    setFormData(prev => {
      const newOptions = [...prev.quiz_options]
      newOptions[index] = {
        ...newOptions[index],
        [field]: value,
      }
      return {
        ...prev,
        quiz_options: newOptions,
      }
    })
  }

  const addQuizOption = () => {
    if (formData.quiz_options.length < 4) {
      setFormData(prev => ({
        ...prev,
        quiz_options: [...prev.quiz_options, { text: '', is_correct: false }],
      }))
    }
  }

  const removeQuizOption = (index) => {
    if (formData.quiz_options.length > 2) {
      setFormData(prev => ({
        ...prev,
        quiz_options: prev.quiz_options.filter((_, i) => i !== index),
      }))
    }
  }

  const handleMoveUp = async (index) => {
    if (index === 0) return;

    const reorderedPages = Array.from(pages);
    const [movedPage] = reorderedPages.splice(index, 1);
    reorderedPages.splice(index - 1, 0, movedPage);

    // Update local state immediately
    setPages(reorderedPages);

    try {
      // Update both pages involved in the swap
      const promises = [
        // Update moved page
        api.updatePage(moduleId, parseInt(movedPage.id), {
          ...movedPage,
          order: index - 1,
          id: parseInt(movedPage.id)
        }),
        // Update the page that was displaced
        api.updatePage(moduleId, parseInt(reorderedPages[index].id), {
          ...reorderedPages[index],
          order: index,
          id: parseInt(reorderedPages[index].id)
        })
      ];

      await Promise.all(promises);

      // Refresh the page list
      const response = await api.getModulePages(moduleId);
      const updatedPages = response.data.map(page => ({
        ...page,
        id: String(page.id)
      }));
      setPages(updatedPages);
    } catch (error) {
      console.error('Error updating page order:', error);
      setPages(pages); // Revert on error
      toast({
        title: 'Error updating page order',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMoveDown = async (index) => {
    if (index === pages.length - 1) return;

    const reorderedPages = Array.from(pages);
    const [movedPage] = reorderedPages.splice(index, 1);
    reorderedPages.splice(index + 1, 0, movedPage);

    // Update local state immediately
    setPages(reorderedPages);

    try {
      // Update both pages involved in the swap
      const promises = [
        // Update moved page
        api.updatePage(moduleId, parseInt(movedPage.id), {
          ...movedPage,
          order: index + 1,
          id: parseInt(movedPage.id)
        }),
        // Update the page that was displaced
        api.updatePage(moduleId, parseInt(reorderedPages[index].id), {
          ...reorderedPages[index],
          order: index,
          id: parseInt(reorderedPages[index].id)
        })
      ];

      await Promise.all(promises);

      // Refresh the page list
      const response = await api.getModulePages(moduleId);
      const updatedPages = response.data.map(page => ({
        ...page,
        id: String(page.id)
      }));
      setPages(updatedPages);
    } catch (error) {
      console.error('Error updating page order:', error);
      setPages(pages); // Revert on error
      toast({
        title: 'Error updating page order',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Box>Loading...</Box>
  }

  return (
    <Container maxW="container.xl" py={5}>
      <Box mb={5}>
        <Stack direction="row" justify="space-between" align="center">
          <Heading size="lg">{module?.title || 'Loading...'}</Heading>
        </Stack>
      </Box>

      <Box mb={5}>
        <Text color="gray.600" mt={2}>
          {pages.length}/20 pages created
        </Text>
      </Box>

      <Box mb={8}>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Page Type</FormLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                {Object.entries(PAGE_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isInvalid={!!errors.content}>
              <FormLabel>
                {formData.type === 'quiz' ? 'Question' : 'Content'}
              </FormLabel>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder={
                  formData.type === 'text' 
                    ? "Enter your lesson content..." 
                    : formData.type === 'quiz'
                    ? "Enter your question..."
                    : "Enter video URL..."
                }
                minH={formData.type === 'text' ? "200px" : "100px"}
              />
              <FormErrorMessage>{errors.content}</FormErrorMessage>
            </FormControl>

            {formData.type === 'quiz' && (
              <FormControl isInvalid={!!errors.quiz_options}>
                <FormLabel>Answer Options</FormLabel>
                <VStack spacing={3} align="stretch">
                  {formData.quiz_options.map((option, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={2}>
                      <Input
                        value={option.text}
                        onChange={(e) => handleQuizOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Checkbox
                        isChecked={option.is_correct}
                        onChange={(e) => handleQuizOptionChange(index, 'is_correct', e.target.checked)}
                      >
                        Correct
                      </Checkbox>
                      {formData.quiz_options.length > 2 && (
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => removeQuizOption(index)}
                          colorScheme="red"
                          size="sm"
                        />
                      )}
                    </Box>
                  ))}
                  {formData.quiz_options.length < 4 && (
                    <Button
                      onClick={addQuizOption}
                      leftIcon={<AddIcon />}
                      size="sm"
                      colorScheme="brand"
                      variant="outline"
                    >
                      Add Option
                    </Button>
                  )}
                </VStack>
                <FormErrorMessage>{errors.quiz_options}</FormErrorMessage>
              </FormControl>
            )}
            <Box>
              <Button
                type="submit"
                colorScheme="brand"
                mr={3}
              >
                {isEditing ? 'Update' : 'Create'} Page
              </Button>
              {isEditing && (
                <Button onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Box>
          </VStack>
        </form>
      </Box>

      <VStack spacing={2} align="stretch">
        {pages.map((page, index) => (
          <Box
            key={page.id}
            bg="white"
            p={4}
            borderWidth="1px"
            borderRadius="md"
            boxShadow="sm"
            _hover={{ boxShadow: "md" }}
          >
            <Stack direction="row" align="center" spacing={4}>
              <Stack direction="column" spacing={1}>
                <IconButton
                  aria-label="Move page up"
                  icon={<ChevronUpIcon />}
                  size="sm"
                  isDisabled={index === 0}
                  onClick={() => handleMoveUp(index)}
                />
                <IconButton
                  aria-label="Move page down"
                  icon={<ChevronDownIcon />}
                  size="sm"
                  isDisabled={index === pages.length - 1}
                  onClick={() => handleMoveDown(index)}
                />
              </Stack>
              <Text fontWeight="medium" width="50px">
                {index + 1}
              </Text>
              <Text width="100px">
                {PAGE_TYPES[page.type]}
              </Text>
              <Text flex="1" noOfLines={2}>
                {page.type === 'quiz' 
                  ? page.content
                  : page.content.substring(0, 50) + '...'}
              </Text>
              <Stack direction="row" spacing={2}>
                <IconButton
                  aria-label="Edit page"
                  icon={<EditIcon />}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => handleEdit(page)}
                />
                <IconButton
                  aria-label="Delete page"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  size="sm"
                  onClick={() => confirmDelete(page)}
                />
              </Stack>
            </Stack>
          </Box>
        ))}
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Page
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this page? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}
