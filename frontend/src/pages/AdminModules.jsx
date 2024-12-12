import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function AdminModules() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const response = await api.getModules()
      setModules(response.data)
    } catch (error) {
      toast({
        title: 'Error fetching modules',
        description: 'Failed to load modules',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (module) => {
    navigate(`/admin/modules/${module.id}/edit`)
  }

  const handleDelete = async () => {
    if (!selectedModule) return

    try {
      await api.deleteModule(selectedModule.id)
      setModules(modules.filter(m => m.id !== selectedModule.id))
      toast({
        title: 'Module deleted',
        description: 'Module has been successfully deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete module',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      onClose()
      setSelectedModule(null)
    }
  }

  const confirmDelete = (module) => {
    setSelectedModule(module)
    onOpen()
  }

  return (
    <Container maxW="container.xl" py={5}>
      <Box mb={5} display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="lg">Manage Modules</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="green"
          onClick={() => navigate('/admin/modules/create')}
        >
          Create Module
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Description</Th>
            <Th>Created At</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {modules.map((module) => (
            <Tr key={module.id}>
              <Td>{module.title}</Td>
              <Td>{module.description}</Td>
              <Td>{new Date(module.created_at).toLocaleDateString()}</Td>
              <Td>
                <IconButton
                  aria-label="Edit module"
                  icon={<EditIcon />}
                  colorScheme="blue"
                  size="sm"
                  mr={2}
                  onClick={() => handleEdit(module)}
                />
                <IconButton
                  aria-label="Manage pages"
                  icon={<ViewIcon />}
                  colorScheme="green"
                  size="sm"
                  mr={2}
                  onClick={() => navigate(`/admin/modules/${module.id}/pages`)}
                />
                <IconButton
                  aria-label="Delete module"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  size="sm"
                  onClick={() => confirmDelete(module)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Module
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this module? This action cannot be undone.
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
