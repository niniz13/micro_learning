import {
  Box,
  Flex,
  Button,
  Stack,
  Container,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box
      bg="white"
      px={4}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={100}
      width="100%"
      backdropFilter="blur(10px)"
      backgroundColor="rgba(255, 255, 255, 0.8)"
    >
      <Container maxW="container.xl" mx="auto">
        <Flex h={16} alignItems="center" justifyContent="space-between" width="100%">
          <Link to="/">
            <Heading size="md" color="brand.500">MicroLearning</Heading>
          </Link>

          <Flex alignItems="center">
            <Stack direction="row" spacing={7}>
              {isAuthenticated ? (
                <>
                  <Link to="/modules">
                    <Button color="brand.500">Modules</Button>
                  </Link>
                  <Menu>
                    <MenuButton
                      as={Button}
                      color="brand.500"
                      rightIcon={<ChevronDownIcon />}
                    >
                      Account
                    </MenuButton>
                    <MenuList>
                      <Link to="/profile">
                        <MenuItem>Profile</MenuItem>
                      </Link>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </MenuList>
                  </Menu>
                </>
              ) : (
                <Link to="/login">
                  <Button color="brand.500">Login</Button>
                </Link>
              )}
            </Stack>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
