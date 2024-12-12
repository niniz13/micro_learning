import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Textarea,
  Select,
  useToast,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

const CATEGORIES = [
  'Cooking',
  'Sport',
  'Computer Science',
  'Art',
  'Entertainment',
  'School',
  'General',
  'Other'
]

export default function ModuleForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General'
  })
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const { id } = useParams()

  useEffect(() => {
    if (id) {
      setIsEdit(true)
      fetchModule()
    }
  }, [id])

  const fetchModule = async () => {
    try {
      const response = await api.getModule(id)
      const { title, description, category } = response.data
      setFormData({
        title,
        description,
        category: category || 'General'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch module',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        await api.updateModule(id, formData)
        toast({
          title: 'Success',
          description: 'Module updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        await api.createModule(formData)
        toast({
          title: 'Success',
          description: 'Module created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
      navigate('/admin/modules')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save module',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Box maxW="container.md" mx="auto" py={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter module title"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter module description"
              rows={6}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            width="full"
            isLoading={loading}
          >
            {isEdit ? 'Update Module' : 'Create Module'}
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
